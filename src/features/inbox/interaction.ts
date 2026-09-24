import type { InboxNotification } from "./model";
import { canOpenNotificationTarget } from "./model";

export function targetForNotification(notification: InboxNotification) {
  return canOpenNotificationTarget(notification) ? notification.targetId : undefined;
}

export function isNotificationActivationKey(key: string) {
  return key === "Enter" || key === " ";
}

export function notificationRowTabIndex(notification: InboxNotification) {
  return canOpenNotificationTarget(notification) ? 0 : undefined;
}

export function inboxComposition(width: number) {
  if (width >= 1280) return "wide";
  if (width >= 1024) return "compact";
  if (width >= 720) return "tablet";
  return "narrow";
}

export function focusRestoreSelector(notificationId: string) {
  return `[data-notification-id="${notificationId}"]`;
}
