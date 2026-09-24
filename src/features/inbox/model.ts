export type NotificationTargetState =
  | "accessible"
  | "inaccessible"
  | "revoked"
  | "unavailable";

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

export function safeNotificationPresentation(notification: InboxNotification) {
  if (notification.targetState === "accessible") {
    return {
      actorLabel: notification.actorLabel,
      eventLabel: notification.eventLabel,
      sourceEntityLabel: notification.sourceEntityLabel,
    };
  }
  return {
    actorLabel: "Restricted",
    eventLabel: "Work Item is no longer available",
    sourceEntityLabel: "Restricted source",
  };
}

export function formatNotificationAge(occurredAt: string, now: Date) {
  const elapsedMs = Math.max(0, now.getTime() - new Date(occurredAt).getTime());
  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
