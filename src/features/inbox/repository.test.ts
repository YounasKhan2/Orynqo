import { describe, expect, it } from "vitest";
import { DevelopmentInboxRepository } from "./repository";
import { safeNotificationText } from "./model";

const input = { userId: "user-muhammad-y", workspaceId: "workspace-product" };

describe("Inbox repository", () => {
  it("retrieves personal notifications deterministically with frozen grouping semantics", async () => {
    const result = await new DevelopmentInboxRepository().list(input);
    expect(result.groups.map((group) => group.label)).toEqual(["Unread", "Earlier"]);
    expect(result.groups[0]?.notifications[0]?.id).toBe("notification-rb-142");
  });

  it("transforms read and unread state without changing the target identity", async () => {
    const repository = new DevelopmentInboxRepository();
    const before = await repository.get("notification-rb-142");
    const read = await repository.setRead("notification-rb-142", true);
    const unread = await repository.setRead("notification-rb-142", false);
    expect(read.targetId).toBe(before?.targetId);
    expect(read.readAt).not.toBeNull();
    expect(unread.readAt).toBeNull();
  });

  it("sanitizes historical protected resource information after access is revoked", async () => {
    const repository = new DevelopmentInboxRepository();
    const notification = await repository.get("notification-revoked");
    expect(notification).toBeDefined();
    expect(safeNotificationText(notification!)).toEqual({
      eventLabel: "Work Item is no longer available",
      sourceEntityLabel: "Restricted source",
    });
    expect(safeNotificationText(notification!).eventLabel).not.toContain("Protected");
  });
});
