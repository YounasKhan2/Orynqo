import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  executeDomainMutation,
  PendingMutationRegistry,
} from "../../application/mutations";
import {
  RecentRealtimeEventIds,
  reconcileRealtime,
} from "../../application/realtime-reconciliation";
import { queryKeys } from "../../application/query-keys";
import type { WorkItemCollectionResult } from "../work-items/model";
import { applyRb142CanonicalToQueryCache } from "./cache";
import { rb142DevelopmentServer } from "./development-server";
import { rb142CommandGateway } from "./gateway";
import { priorityMutationPlan, statusMutationPlan } from "./plans";

function setup() {
  const client = new QueryClient();
  const s = rb142DevelopmentServer.read();
  const collectionKey = queryKeys.workItems({
    projectId: "platform-core",
    filters: { status: "not-done", q: "" },
    sort: "key",
  });
  client.setQueryData(queryKeys.workItem("wi-rb-142"), s);
  client.setQueryData<WorkItemCollectionResult>(collectionKey, {
    items: [s.workItem],
    totalCount: 1,
    stale: false,
  });
  return { client, collectionKey };
}
describe("RB-142 corrected integration", () => {
  beforeEach(() => {
    rb142DevelopmentServer.reset();
    vi.stubGlobal("navigator", { onLine: true });
  });
  it("uses ORY-015 plan for Priority success across both projections", async () => {
    const { client, collectionKey } = setup();
    const registry = new PendingMutationRegistry();
    const result = await executeDomainMutation(
      client,
      rb142CommandGateway,
      registry,
      priorityMutationPlan({ mutationId: "m1", expectedVersion: 7 }),
    );
    expect(result.ok).toBe(true);
    expect(
      client.getQueryData<any>(queryKeys.workItem("wi-rb-142")).workItem,
    ).toMatchObject({ priority: "urgent", version: 8 });
    expect(
      client.getQueryData<WorkItemCollectionResult>(collectionKey)?.items[0],
    ).toMatchObject({ priority: "urgent", version: 8 });
  });
  it("rolls back Priority failure across both projections", async () => {
    const { client, collectionKey } = setup();
    rb142DevelopmentServer.setRegressionMode("failure");
    await executeDomainMutation(
      client,
      rb142CommandGateway,
      new PendingMutationRegistry(),
      priorityMutationPlan({ mutationId: "m1", expectedVersion: 7 }),
    );
    expect(
      client.getQueryData<any>(queryKeys.workItem("wi-rb-142")).workItem
        .priority,
    ).toBe("high");
    expect(
      client.getQueryData<WorkItemCollectionResult>(collectionKey)?.items[0]
        ?.priority,
    ).toBe("high");
  });
  it("settles Status Review without removing RB-142 from not-Done collection", async () => {
    const { client, collectionKey } = setup();
    await executeDomainMutation(
      client,
      rb142CommandGateway,
      new PendingMutationRegistry(),
      statusMutationPlan({ mutationId: "m1", expectedVersion: 7 }),
    );
    expect(
      client.getQueryData<WorkItemCollectionResult>(collectionKey)?.items[0]
        ?.statusLabel,
    ).toBe("Review");
    expect(
      client.getQueryData<WorkItemCollectionResult>(collectionKey)?.items,
    ).toHaveLength(1);
  });
  it("retains attempted and canonical values on same-field realtime conflict", () => {
    const { client } = setup();
    const registry = new PendingMutationRegistry();
    registry.register({
      mutationId: "m1",
      resourceId: "wi-rb-142",
      commandType: "workItem.changePriority",
      affectedFields: ["priority"],
      expectedVersion: 7,
      attemptedValue: "Urgent",
      phase: "pending",
    });
    const remote = rb142DevelopmentServer.remotePriorityChange("low");
    const decision = reconcileRealtime(
      {
        eventId: "e1",
        resourceId: "wi-rb-142",
        resourceVersion: 8,
        changedFields: ["priority"],
        canonical: remote,
      },
      7,
      registry,
      new RecentRealtimeEventIds(),
    );
    expect(decision).toBe("same-field-conflict");
    expect(registry.get("m1")).toMatchObject({
      phase: "conflict",
      attemptedValue: "Urgent",
    });
    expect((registry.get("m1")?.canonicalValue as any).workItem.priority).toBe(
      "low",
    );
    expect(
      client.getQueryData<any>(queryKeys.workItem("wi-rb-142")).workItem
        .priority,
    ).toBe("high");
  });
  it("propagates permission, archive and delete canonical states into mounted-query shape", () => {
    const { client } = setup();
    for (const remote of [
      rb142DevelopmentServer.revokeAccess(),
      rb142DevelopmentServer.remoteArchive(),
      rb142DevelopmentServer.remoteDelete(),
    ])
      applyRb142CanonicalToQueryCache(client, remote);
    const final = client.getQueryData<any>(queryKeys.workItem("wi-rb-142"));
    expect(final.unavailable).toBe(true);
  });
});
