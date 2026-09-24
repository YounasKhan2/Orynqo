import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../application/query-keys";
import { rb142DevelopmentServer } from "./development-server";

export function useRb142Snapshot(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.workItem("wi-rb-142"),
    queryFn: async () => rb142DevelopmentServer.read(),
    enabled,
    staleTime: Infinity,
  });
}
