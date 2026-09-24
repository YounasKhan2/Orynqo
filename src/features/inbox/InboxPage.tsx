import { useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { WorkItemCollectionLayout } from "../work-items/components/WorkItemCollection";
import { WorkItemInspector } from "../work-items/components/WorkItemInspector";
import { Rb142Inspector } from "../rb142/Rb142Inspector";
import { InboxCollection, InboxFailure, InboxLoading } from "./components/InboxCollection";
import { canOpenNotificationTarget } from "./model";
import { useInbox, useSetNotificationRead } from "./queries";

const CURRENT_USER_ID = "user-muhammad-y";
const PRODUCT_WORKSPACE_ID = "workspace-product";

export function InboxPage() {
  const search = useSearch({ from: "/inbox" });
  const navigate = useNavigate({ from: "/inbox" });
  const queryInput = { userId: CURRENT_USER_ID, workspaceId: PRODUCT_WORKSPACE_ID };
  const query = useInbox(queryInput);
  const readMutation = useSetNotificationRead(queryInput);
  const lastFocusedNotificationId = useRef<string | undefined>(undefined);
  const selectedNotification = query.data?.groups.flatMap((group) => group.notifications).find((notification) => notification.id === search.selected);
  const selectedTargetId = selectedNotification && canOpenNotificationTarget(selectedNotification) ? selectedNotification.targetId : undefined;

  const closeInspector = () => {
    const restore = lastFocusedNotificationId.current;
    void navigate({ search: {}, replace: true });
    requestAnimationFrame(() => restore && document.querySelector<HTMLElement>(`[data-notification-id="${restore}"]`)?.focus());
  };

  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !search.selected) return;
      event.preventDefault();
      closeInspector();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const inspector = selectedTargetId === "wi-rb-142"
    ? <Rb142Inspector onClose={closeInspector} />
    : selectedTargetId
      ? <WorkItemInspector id={selectedTargetId} onClose={closeInspector} />
      : undefined;

  return (
    <div className="flex h-[calc(100vh-48px)] min-h-[520px] flex-col overflow-hidden bg-[var(--surface-base)]">
      <header className="flex h-[74px] items-center border-b border-[var(--border-subtle)] px-3 max-sm:h-16">
        <div>
          <span className="text-label uppercase tracking-[.04em] text-[var(--text-tertiary)]">Personal retrieval</span>
          <h1 className="mt-0.5 mb-0 text-page">Inbox</h1>
          <p className="mt-[3px] mb-0 text-caption text-[var(--text-secondary)]">Personal notification triage</p>
        </div>
      </header>
      <WorkItemCollectionLayout inspectorOpen={Boolean(selectedTargetId)} inspector={inspector}>
        {query.isLoading ? <InboxLoading /> : query.isError ? <InboxFailure /> : query.data ? (
          <InboxCollection
            data={query.data}
            selectedNotificationId={search.selected}
            onSelect={(notification) => {
              if (!canOpenNotificationTarget(notification)) return;
              lastFocusedNotificationId.current = notification.id;
              void navigate({ search: { selected: notification.id }, replace: true });
            }}
            onToggleRead={(notification) => readMutation.mutate({ notificationId: notification.id, read: notification.readAt === null })}
          />
        ) : null}
      </WorkItemCollectionLayout>
    </div>
  );
}
