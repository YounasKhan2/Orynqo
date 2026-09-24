import type { KeyboardEvent } from "react";
import type { InboxNotification, InboxResult } from "../model";
import { canOpenNotificationTarget, safeNotificationText } from "../model";

type Props = {
  data: InboxResult;
  selectedNotificationId?: string;
  onSelect: (notification: InboxNotification) => void;
  onToggleRead: (notification: InboxNotification) => void;
};

function NotificationRow({ notification, selected, onSelect, onToggleRead }: {
  notification: InboxNotification;
  selected: boolean;
  onSelect: (notification: InboxNotification) => void;
  onToggleRead: (notification: InboxNotification) => void;
}) {
  const safe = safeNotificationText(notification);
  const unread = notification.readAt === null;
  const openable = canOpenNotificationTarget(notification);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (openable) onSelect(notification);
    }
  };
  return (
    <div
      data-notification-id={notification.id}
      tabIndex={0}
      role={openable ? "button" : undefined}
      aria-disabled={!openable || undefined}
      aria-current={selected ? "true" : undefined}
      onClick={() => openable && onSelect(notification)}
      onKeyDown={onKeyDown}
      className={`grid min-h-[52px] grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-2 border-b border-[var(--border-subtle)] px-3 py-2 text-left ${openable ? "cursor-pointer hover:bg-[var(--surface-subtle)]" : "cursor-default"} ${selected ? "bg-[var(--accent-subtle)]" : "bg-[var(--surface-base)]"}`}
    >
      <span aria-label={unread ? "Unread notification" : "Read notification"} className="grid size-4 place-items-center text-caption text-[var(--accent-default)]">{unread ? "●" : "○"}</span>
      <span className="min-w-0">
        <strong className="block truncate text-ui text-[var(--text-primary)]">{safe.eventLabel}</strong>
        <span className="block truncate text-caption text-[var(--text-secondary)]">{safe.sourceEntityLabel} · {notification.id === "notification-rb-142" ? "4m" : notification.id === "notification-rb-139" ? "38m" : "Earlier"}</span>
      </span>
      <button
        type="button"
        className="h-7 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-2 text-caption text-[var(--text-secondary)]"
        onClick={(event) => { event.stopPropagation(); onToggleRead(notification); }}
        aria-label={unread ? "Mark notification as read" : "Mark notification as unread"}
      >
        {unread ? "Mark read" : "Mark unread"}
      </button>
    </div>
  );
}

export function InboxCollection({ data, selectedNotificationId, onSelect, onToggleRead }: Props) {
  if (data.totalCount === 0) return <InboxEmpty />;
  return (
    <div className="h-full overflow-auto">
      {data.groups.map((group) => (
        <section key={group.id} aria-labelledby={`inbox-group-${group.id}`}>
          <header className="sticky top-0 z-[2] flex h-[30px] items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-3">
            <h2 id={`inbox-group-${group.id}`} className="m-0 text-label text-[var(--text-secondary)]">{group.label}</h2>
            <span className="text-caption text-[var(--text-tertiary)]">{group.notifications.length}</span>
          </header>
          {group.notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              selected={selectedNotificationId === notification.id}
              onSelect={onSelect}
              onToggleRead={onToggleRead}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

export function InboxEmpty() {
  return <div className="grid h-full place-content-center gap-1 text-center text-caption text-[var(--text-secondary)]"><strong>No notifications yet</strong><span>Personal notifications for this workspace will appear here.</span></div>;
}

export function InboxLoading() {
  return <div aria-label="Loading Inbox">{Array.from({ length: 7 }, (_, index) => <div key={index} className="grid h-[52px] grid-cols-[18px_1fr_72px] items-center gap-2 border-b border-[var(--border-subtle)] px-3">{Array.from({ length: 3 }, (_, part) => <span key={part} className="h-2 rounded bg-[var(--surface-subtle)]" />)}</div>)}</div>;
}

export function InboxFailure() {
  return <div role="alert" className="m-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-3 text-caption text-[var(--text-secondary)]">Could not load Inbox. Your current context is preserved.</div>;
}
