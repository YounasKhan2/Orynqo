export type NotificationTargetState = "accessible" | "inaccessible" | "revoked" | "unavailable";

export type InboxNotification = {
  id: string;
  recipientUserId: string;
  workspaceId: string;
  targetType: "work-item";
  targetId: string;
  actorLabel: string;
  eventLabel: string;
  sourceEntityLabel: string;
  occurredAt: string;
  readAt: string | null;
  targetState: NotificationTargetState;
};

export type InboxGroup = {
  id: "unread" | "earlier";
  label: "Unread" | "Earlier";
  notifications: readonly InboxNotification[];
};

export type InboxResult = {
  groups: readonly InboxGroup[];
  totalCount: number;
};

export type InboxInput = {
  userId: string;
  workspaceId: string;
};

export interface InboxRepository {
  list(input: InboxInput): Promise<InboxResult>;
  setRead(notificationId: string, read: boolean): Promise<InboxNotification>;
  get(notificationId: string): Promise<InboxNotification | undefined>;
}

export function canOpenNotificationTarget(notification: InboxNotification) {
  return notification.targetState === "accessible";
}

export function safeNotificationText(notification: InboxNotification) {
  if (notification.targetState === "accessible") {
    return {
      eventLabel: notification.eventLabel,
      sourceEntityLabel: notification.sourceEntityLabel,
    };
  }
  return {
    eventLabel: "Work Item is no longer available",
    sourceEntityLabel: "Restricted source",
  };
}
