import type { PendingMutationRegistry } from "./mutations";

export type RealtimeEnvelope<T> = {
  eventId: string;
  mutationId?: string;
  resourceId: string;
  resourceVersion: number;
  changedFields: readonly string[];
  canonical: T;
};

export type RealtimeDecision = "apply" | "ignore-stale" | "ack-local" | "same-field-conflict";

export function reconcileRealtime<T>(
  event: RealtimeEnvelope<T>,
  currentVersion: number,
  registry: PendingMutationRegistry,
): RealtimeDecision {
  if (event.resourceVersion <= currentVersion) return "ignore-stale";
  if (event.mutationId && registry.get(event.mutationId)) {
    registry.settle(event.mutationId);
    return "ack-local";
  }
  const pending = registry.forResource(event.resourceId).find((entry) =>
    event.changedFields.includes(entry.fieldOrCommand),
  );
  if (pending && pending.phase === "pending") {
    registry.update(pending.mutationId, { phase: "conflict", canonicalValue: event.canonical });
    return "same-field-conflict";
  }
  return "apply";
}
