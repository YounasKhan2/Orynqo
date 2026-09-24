import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { queryKeys } from "../../application/query-keys";
import type { WorkItemCollectionResult } from "../work-items/model";
import type { Rb142Snapshot } from "./model";

export type Rb142CacheSnapshot = {
  detail: Rb142Snapshot | undefined;
  collections: readonly [QueryKey, WorkItemCollectionResult | undefined][];
};

export function captureRb142QueryCache(client: QueryClient): Rb142CacheSnapshot {
  return {
    detail: client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142")),
    collections: client
      .getQueriesData<WorkItemCollectionResult>({ queryKey: ["workItems"] })
      .map(([key, value]) => [key, value] as const),
  };
}

export function restoreRb142QueryCache(
  client: QueryClient,
  snapshot: Rb142CacheSnapshot,
) {
  client.setQueryData(queryKeys.workItem("wi-rb-142"), snapshot.detail);
  for (const [key, value] of snapshot.collections) client.setQueryData(key, value);
}

export function applyRb142CanonicalToQueryCache(
  client: QueryClient,
  snapshot: Rb142Snapshot,
  options: { preservePendingFields?: readonly string[] } = {},
) {
  const current = client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142"));
  const preserve = new Set(options.preservePendingFields);
  const workItem = {
    ...snapshot.workItem,
    ...(preserve.has("priority") && current
      ? { priority: current.workItem.priority }
      : {}),
    ...(preserve.has("statusId") && current
      ? { statusId: current.workItem.statusId, statusLabel: current.workItem.statusLabel }
      : {}),
  };
  const merged: Rb142Snapshot = { ...snapshot, workItem };
  client.setQueryData(queryKeys.workItem("wi-rb-142"), merged);
  client.setQueryData(queryKeys.comments("wi-rb-142"), merged.comments);
  client.setQueryData(queryKeys.activity("wi-rb-142"), merged.activity);
  client.setQueryData(queryKeys.access("workItem", "wi-rb-142"), merged.access);

  client.setQueriesData<WorkItemCollectionResult>(
    { queryKey: ["workItems"] },
    (collection) => {
      if (!collection) return collection;
      const index = collection.items.findIndex((item) => item.id === "wi-rb-142");
      if (index < 0) return collection;
      const items = [...collection.items];
      items[index] = { ...items[index], ...workItem };
      return { ...collection, items };
    },
  );
}

export function applyRb142OptimisticFields(
  client: QueryClient,
  patch: Partial<Rb142Snapshot["workItem"]>,
) {
  const current = client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142"));
  if (current) {
    client.setQueryData(queryKeys.workItem("wi-rb-142"), {
      ...current,
      workItem: { ...current.workItem, ...patch, version: current.workItem.version },
    });
  }
  client.setQueriesData<WorkItemCollectionResult>(
    { queryKey: ["workItems"] },
    (collection) => {
      if (!collection) return collection;
      const items = collection.items.map((item) =>
        item.id === "wi-rb-142"
          ? { ...item, ...patch, version: item.version }
          : item,
      );
      return { ...collection, items };
    },
  );
}
