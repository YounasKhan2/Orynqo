import { describe, expect, it } from "vitest";
import { inboxQueryKey, reconcileNotification, transformReadState } from "./queries";
import type { InboxResult } from "./model";

const result: InboxResult = {
  totalCount: 1,
  groups: [{
    id: "unread",
    label: "Unread",
    notifications: [{
      id: "n1",
      recipientUserId: "u1",
      workspaceId: "w1",
      targetType: "work-item",
      targetId: "wi-rb-142",
      actorLabel: "Ayesha K.",
      eventLabel: "RB-142 moved to Review",
      sourceEntityLabel: "Ayesha K. mentioned you",
      occurredAt: "2026-09-24T04:48:00.000Z",
      readAt: null,
      targetState: "accessible",
    }],
  }],
};

describe("Inbox query/cache contract", () => {
  it("keeps the personal Inbox query key stable", () => {
    expect(inboxQueryKey({ userId: "u1", workspaceId: "w1" })).toEqual(["inbox", "u1", "w1"]);
  });

  it("optimistically moves read notifications to Earlier and reconciles canonical state", () => {
    const optimistic = transformReadState(result, "n1", true)!;
    expect(optimistic.groups.map((group) => group.label)).toEqual(["Earlier"]);
    const canonical = { ...result.groups[0]!.notifications[0]!, readAt: "2026-09-24T05:00:00.000Z" };
    const reconciled = reconcileNotification(optimistic, canonical)!;
    expect(reconciled.groups[0]!.notifications[0]!.readAt).toBe("2026-09-24T05:00:00.000Z");
    expect(reconciled.groups[0]!.notifications[0]!.targetId).toBe("wi-rb-142");
  });
});
