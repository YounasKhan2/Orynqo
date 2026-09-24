import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { queryKeys } from "../../application/query-keys";
import type { WorkItemCollectionResult } from "../work-items/model";\nimport type { Rb142Snapshot } from "./model";
import { rb142DevelopmentServer } from "./development-server";
import { applyRb142CanonicalToQueryCache, applyRb142OptimisticFields, captureRb142QueryCache, restoreRb142QueryCache } from "./cache";

function seed(client: QueryClient) {
  rb142DevelopmentServer.reset();
  const snapshot=rb142DevelopmentServer.read();
  const key=queryKeys.workItems({projectId:"platform-core",filters:{status:"not-done",q:""},sort:"key"});
  client.setQueryData(queryKeys.workItem("wi-rb-142"),snapshot);
  client.setQueryData<WorkItemCollectionResult>(key,{items:[snapshot.workItem],totalCount:1,stale:false});
  return {snapshot,key};
}
describe("RB-142 query projection reconciliation",()=>{
 it("optimistically updates detail and collection without fabricating a version",()=>{const client=new QueryClient();const {key}=seed(client);applyRb142OptimisticFields(client,{priority:"urgent"});expect(client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142")).workItem).toMatchObject({priority:"urgent",version:7});expect(client.getQueryData<WorkItemCollectionResult>(key)?.items[0]).toMatchObject({priority:"urgent",version:7})});
 it("rolls back every projection",()=>{const client=new QueryClient();const {key}=seed(client);const previous=captureRb142QueryCache(client);applyRb142OptimisticFields(client,{priority:"urgent"});restoreRb142QueryCache(client,previous);expect(client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142")).workItem.priority).toBe("high");expect(client.getQueryData<WorkItemCollectionResult>(key)?.items[0]?.priority).toBe("high")});
 it("reconciles canonical status into both projections while Review remains not-Done",()=>{const client=new QueryClient();const {key}=seed(client);const canonical=rb142DevelopmentServer.read();canonical.workItem.statusId="status-review";canonical.workItem.statusLabel="Review";canonical.workItem.version=8;applyRb142CanonicalToQueryCache(client,canonical);expect(client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142")).workItem.statusLabel).toBe("Review");expect(client.getQueryData<WorkItemCollectionResult>(key)?.items[0]?.statusLabel).toBe("Review");expect(client.getQueryData<WorkItemCollectionResult>(key)?.items).toHaveLength(1)});
 it("applies an unrelated canonical assignee while preserving pending Priority",()=>{const client=new QueryClient();const {key}=seed(client);applyRb142OptimisticFields(client,{priority:"urgent"});const remote=rb142DevelopmentServer.remoteAssigneeChange();applyRb142CanonicalToQueryCache(client,remote,{preservePendingFields:["priority"]});expect(client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142")).workItem).toMatchObject({priority:"urgent",assigneeLabel:"N. Chen"});expect(client.getQueryData<WorkItemCollectionResult>(key)?.items[0]).toMatchObject({priority:"urgent",assigneeLabel:"N. Chen"})});
});
