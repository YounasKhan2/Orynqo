import type { InboxInput, InboxNotification, InboxRepository, InboxResult } from "./model";

const seed: readonly InboxNotification[] = [
  {
    id: "notification-rb-142",
    recipientUserId: "user-muhammad-y",
    workspaceId: "workspace-product",
    targetType: "work-item",
    targetId: "wi-rb-142",
    actorLabel: "Ayesha K.",
    eventLabel: "RB-142 moved to Review",
    sourceEntityLabel: "Ayesha K. mentioned you",
    occurredAt: "2026-09-24T04:48:00.000Z",
    readAt: null,
    targetState: "accessible",
  },
  {
    id: "notification-rb-139",
    recipientUserId: "user-muhammad-y",
    workspaceId: "workspace-product",
    targetType: "work-item",
    targetId: "wi-rb-121",
    actorLabel: "Platform Core",
    eventLabel: "RB-139 status changed",
    sourceEntityLabel: "Platform Core",
    occurredAt: "2026-09-24T04:14:00.000Z",
    readAt: "2026-09-24T04:20:00.000Z",
    targetState: "accessible",
  },
  {
    id: "notification-revoked",
    recipientUserId: "user-muhammad-y",
    workspaceId: "workspace-product",
    targetType: "work-item",
    targetId: "wi-restricted-history",
    actorLabel: "Restricted",
    eventLabel: "Protected historical title",
    sourceEntityLabel: "Protected project",
    occurredAt: "2026-09-23T18:00:00.000Z",
    readAt: "2026-09-23T18:05:00.000Z",
    targetState: "revoked",
  },
];

export class DevelopmentInboxRepository implements InboxRepository {
  private notifications = seed.map((notification) => ({ ...notification }));

  async list(input: InboxInput): Promise<InboxResult> {
    await Promise.resolve();
    const notifications = this.notifications
      .filter(
        (notification) =>
          notification.recipientUserId === input.userId &&
          notification.workspaceId === input.workspaceId,
      )
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

    const unread = notifications.filter((notification) => notification.readAt === null);
    const earlier = notifications.filter((notification) => notification.readAt !== null);
    return {
      groups: [
        ...(unread.length ? [{ id: "unread" as const, label: "Unread" as const, notifications: unread }] : []),
        ...(earlier.length ? [{ id: "earlier" as const, label: "Earlier" as const, notifications: earlier }] : []),
      ],
      totalCount: notifications.length,
    };
  }

  async get(notificationId: string) {
    await Promise.resolve();
    return this.notifications.find((notification) => notification.id === notificationId);
  }

  async setRead(notificationId: string, read: boolean): Promise<InboxNotification> {
    await Promise.resolve();
    const index = this.notifications.findIndex((notification) => notification.id === notificationId);
    if (index < 0) throw new Error("Notification not found");
    const current = this.notifications[index]!;
    const next = { ...current, readAt: read ? "2026-09-24T05:00:00.000Z" : null };
    this.notifications[index] = next;
    return next;
  }
}

export const inboxRepository: InboxRepository = new DevelopmentInboxRepository();
