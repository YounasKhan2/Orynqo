import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../application/query-keys";
import { inboxRepository } from "./repository";
import type { InboxInput, InboxNotification, InboxResult } from "./model";

export function inboxQueryKey(input: InboxInput) {
  return queryKeys.inbox(input.userId, input.workspaceId);
}

export function useInbox(input: InboxInput) {
  return useQuery({
    queryKey: inboxQueryKey(input),
    queryFn: () => inboxRepository.list(input),
  });
}

function transformReadState(
  result: InboxResult | undefined,
  notificationId: string,
  read: boolean,
): InboxResult | undefined {
  if (!result) return result;
  const all = result.groups.flatMap((group) => group.notifications).map((notification) =>
    notification.id === notificationId
      ? { ...notification, readAt: read ? "optimistic" : null }
      : notification,
  );
  const unread = all.filter((notification) => notification.readAt === null);
  const earlier = all.filter((notification) => notification.readAt !== null);
  return {
    totalCount: all.length,
    groups: [
      ...(unread.length ? [{ id: "unread" as const, label: "Unread" as const, notifications: unread }] : []),
      ...(earlier.length ? [{ id: "earlier" as const, label: "Earlier" as const, notifications: earlier }] : []),
    ],
  };
}

export function reconcileNotification(result: InboxResult | undefined, canonical: InboxNotification) {
  if (!result) return result;
  const read = canonical.readAt !== null;
  const transformed = transformReadState(result, canonical.id, read);
  if (!transformed) return transformed;
  return {
    ...transformed,
    groups: transformed.groups.map((group) => ({
      ...group,
      notifications: group.notifications.map((notification) =>
        notification.id === canonical.id ? canonical : notification,
      ),
    })),
  };
}

export function useSetNotificationRead(input: InboxInput) {
  const client = useQueryClient();
  const key = inboxQueryKey(input);
  return useMutation({
    mutationFn: ({ notificationId, read }: { notificationId: string; read: boolean }) =>
      inboxRepository.setRead(notificationId, read),
    onMutate: async ({ notificationId, read }) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<InboxResult>(key);
      client.setQueryData<InboxResult>(key, (current) =>
        transformReadState(current, notificationId, read),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) client.setQueryData(key, context.previous);
    },
    onSuccess: (canonical) => {
      client.setQueryData<InboxResult>(key, (current) =>
        reconcileNotification(current, canonical),
      );
    },
  });
}

export { transformReadState };
