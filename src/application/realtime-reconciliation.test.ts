import { describe, expect, it } from "vitest";
import { PendingMutationRegistry } from "./mutations";
import {
  RecentRealtimeEventIds,
  reconcileRealtime,
  type RealtimeEnvelope,
} from "./realtime-reconciliation";

const event = (
  overrides: Partial<RealtimeEnvelope<{ priority: string }>> = {},
): RealtimeEnvelope<{ priority: string }> => ({
  eventId: "e1",
  resourceId: "wi-rb-142",
  resourceVersion: 8,
  changedFields: ["priority"],
  canonical: { priority: "urgent" },
  ...overrides,
});

function pending() {
  const registry = new PendingMutationRegistry();
  registry.register({
    mutationId: "m1",
    resourceId: "wi-rb-142",
    commandType: "workItem.changePriority",
    affectedFields: ["priority"],
    expectedVersion: 7,
    phase: "pending",
  });
  return registry;
}

describe("realtime reconciliation", () => {
  it("detects same-field conflicts by affectedFields, not command name", () => {
    expect(
      reconcileRealtime(event(), 7, pending(), new RecentRealtimeEventIds()),
    ).toBe("same-field-conflict");
  });

  it("allows a different-field event to apply", () => {
    expect(
      reconcileRealtime(
        event({ changedFields: ["assigneeId"] }),
        7,
        pending(),
        new RecentRealtimeEventIds(),
      ),
    ).toBe("apply");
  });

  it("acknowledges a local realtime echo once", () => {
    const registry = pending();
    const recent = new RecentRealtimeEventIds();
    expect(
      reconcileRealtime(event({ mutationId: "m1" }), 7, registry, recent),
    ).toBe("ack-local");
    expect(registry.get("m1")?.phase).toBe("settled");
    expect(
      reconcileRealtime(event({ mutationId: "m1" }), 7, registry, recent),
    ).toBe("duplicate-event");
  });

  it("rejects stale canonical versions", () => {
    expect(
      reconcileRealtime(event({ resourceVersion: 7 }), 7, pending(), new RecentRealtimeEventIds()),
    ).toBe("ignore-stale");
  });

  it("bounds event-id memory with FIFO eviction", () => {
    const recent = new RecentRealtimeEventIds(2);
    const registry = new PendingMutationRegistry();
    expect(reconcileRealtime(event({ eventId: "e1" }), 7, registry, recent)).toBe("apply");
    expect(reconcileRealtime(event({ eventId: "e2" }), 7, registry, recent)).toBe("apply");
    expect(reconcileRealtime(event({ eventId: "e3" }), 7, registry, recent)).toBe("apply");
    expect(recent.size).toBe(2);
    expect(reconcileRealtime(event({ eventId: "e3" }), 7, registry, recent)).toBe("duplicate-event");
  });
});
