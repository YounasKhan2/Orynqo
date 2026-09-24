import { useQuery } from "@tanstack/react-query";
import { myWorkRepository } from "./repository";
import type { MyWorkInput } from "./model";

export const myWorkQueryKey = (input: MyWorkInput) =>
  ["myWork", input.userId, input.workspaceId, {
    q: input.search ?? "",
    status: input.statusFilter,
    group: input.group,
    sort: input.sort,
  }] as const;

export function useMyWork(input: MyWorkInput) {
  return useQuery({
    queryKey: myWorkQueryKey(input),
    queryFn: () => myWorkRepository.list(input),
    placeholderData: (previous) => previous,
  });
}
