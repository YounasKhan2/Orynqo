import { describe, expect, it } from "vitest";
import {
  focusRestoreSelector,
  inboxComposition,
  isNotificationActivationKey,
  notificationRowTabIndex,
  targetForNotification,
} from "./interaction";
import {
  formatNotificationAge,
  safeNotificationPresentation,
  type InboxNotification,
} from "./model";

const notification = (targetState: InboxNotification["targetState"]): InboxNotification => ({
  id: "n1",
  recipientUserId: "u1",
  workspaceId: "w1",
  targetType: "work-item",
  targetId: "wi-rb-142",
  actorLabel: "Ayesha K.",
  eventLabel: "RB-142 moved to Review",
  sourceEntityLabel: "mentioned you",
  occurredAt: "2026-09-24T04:56:00.000Z",
  readAt: null,
  targetState,
});

describe("Inbox interaction and presentation contract", () => {
  it("opens accessible targets through their canonical Work Item identity", () => {
    expect(targetForNotification(notification("accessible"))).toBe("wi-rb-142");
  });

  it("supports keyboard activation keys", () => {
    expect(isNotificationActivationKey("Enter")).toBe(true);
    expect(isNotificationActivationKey(" ")).toBe(true);
    expect(isNotificationActivationKey("ArrowDown")).toBe(false);
  });

  it("keeps revoked, unavailable, and inaccessible rows inert and out of row tab order", () => {
    for (const state of ["revoked", "unavailable", "inaccessible"] as const) {
      expect(targetForNotification(notification(state))).toBeUndefined();
      expect(notificationRowTabIndex(notification(state))).toBeUndefined();
    }
  });

  it("restores focus to the notification that opened detail", () => {
    expect(focusRestoreSelector("notification-rb-142")).toBe(
      '[data-notification-id="notification-rb-142"]',
    );
  });

  it("preserves the established responsive composition ranges", () => {
    expect(inboxComposition(1440)).toBe("wide");
    expect(inboxComposition(1100)).toBe("compact");
    expect(inboxComposition(800)).toBe("tablet");
    expect(inboxComposition(390)).toBe("narrow");
  });

  it("derives time presentation from occurredAt instead of notification identity", () => {
    const now = new Date("2026-09-24T05:00:00.000Z");
    expect(formatNotificationAge("2026-09-24T04:56:00.000Z", now)).toBe("4m");
    expect(formatNotificationAge("2026-09-24T04:22:00.000Z", now)).toBe("38m");
    expect(formatNotificationAge("2026-09-23T05:00:00.000Z", now)).toBe("1d");
  });

  it("keeps actor and source semantics distinct while matching the frozen example", () => {
    const safe = safeNotificationPresentation(notification("accessible"));
    expect(`${safe.actorLabel} ${safe.sourceEntityLabel}`).toBe(
      "Ayesha K. mentioned you",
    );
  });

  it("sanitizes all protected presentation fields when access is gone", () => {
    const protectedNotification = {
      ...notification("revoked"),
      actorLabel: "Protected actor",
      eventLabel: "Protected title",
      sourceEntityLabel: "Protected project",
    };
    expect(safeNotificationPresentation(protectedNotification)).toEqual({
      actorLabel: "Restricted",
      eventLabel: "Work Item is no longer available",
      sourceEntityLabel: "Restricted source",
    });
  });
});
