import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../application/query-keys";
import { workItemRepository } from "./fixture-repository";
import type { WorkItemCollectionInput } from "./model";

export function useWorkItemCollection(input: WorkItemCollectionInput) {
  return useQuery({
    queryKey: queryKeys.workItems({
      projectId: input.projectId,
      filters: { status: input.statusFilter ?? "not-done", q: input.search ?? "" },
      sort: input.sort ?? "key",
    }),
    queryFn: () => workItemRepository.list(input),
    placeholderData: (previous) => previous,
  });
}

export function useWorkItem(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.workItem(id ?? "none"),
    queryFn: () => workItemRepository.getById(id!),
    enabled: Boolean(id),
  });
}
