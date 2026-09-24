import type { PendingMutationRegistry } from "./mutations";

export type RealtimeEnvelope<T> = {
  eventId: string;
  mutationId?: string;
  resourceId: string;
  resourceVersion: number;
  changedFields: readonly string[];
  canonical: T;
};

export type RealtimeDecision =
  | "duplicate-event"
  | "ignore-stale"
  | "ack-local"
  | "same-field-conflict"
  | "apply";

export class RecentRealtimeEventIds {
  private readonly ids = new Set<string>();
  private readonly order: string[] = [];

  constructor(private readonly capacity = 256) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error("Realtime event dedupe capacity must be a positive integer");
    }
  }

  has(eventId: string) {
    return this.ids.has(eventId);
  }

  remember(eventId: string) {
    if (this.ids.has(eventId)) return;
    this.ids.add(eventId);
    this.order.push(eventId);
    while (this.order.length > this.capacity) {
      const oldest = this.order.shift();
      if (oldest) this.ids.delete(oldest);
    }
  }

  get size() {
    return this.ids.size;
  }
}

export function reconcileRealtime<T>(
  event: RealtimeEnvelope<T>,
  currentVersion: number,
  registry: PendingMutationRegistry,
  recentEventIds: RecentRealtimeEventIds,
): RealtimeDecision {
  // Event identity is checked first so redelivery cannot re-run any later
  // reconciliation branch, including local mutation acknowledgement.
  if (recentEventIds.has(event.eventId)) return "duplicate-event";
  recentEventIds.remember(event.eventId);

  if (event.resourceVersion <= currentVersion) return "ignore-stale";

  if (event.mutationId && registry.get(event.mutationId)) {
    registry.settle(event.mutationId);
    return "ack-local";
  }

  const pending = registry.forResource(event.resourceId).find(
    (entry) =>
      entry.phase === "pending" &&
      entry.affectedFields.some((field) => event.changedFields.includes(field)),
  );
  if (pending) {
    registry.update(pending.mutationId, {
      phase: "conflict",
      canonicalValue: event.canonical,
    });
    return "same-field-conflict";
  }

  return "apply";
}
