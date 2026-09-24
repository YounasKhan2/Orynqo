import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { CommandGateway } from "./commands";
import {
  executeDomainMutation,
  PendingMutationRegistry,
  type MutationPlan,
} from "./mutations";

type Canonical = { id: string; priority: string; version: number };

function plan(mutationId = "m1"): MutationPlan<{ priority: string }, Canonical> {
  return {
    commandType: "workItem.changePriority",
    affectedFields: ["priority"],
    command: {
      mutationId,
      actorId: "u1",
      workspaceId: "w1",
      resourceId: "wi-rb-142",
      expectedVersion: 7,
      payload: { priority: "urgent" },
    },
    affectedQueryKeys: [["workItem", "wi-rb-142"]],
    attemptedValue: "urgent",
    optimistic: (client) => {
      const previous = client.getQueryData(["workItem", "wi-rb-142"]);
      client.setQueryData(["workItem", "wi-rb-142"], {
        id: "wi-rb-142",
        priority: "urgent",
        version: 7,
      });
      return previous;
    },
    rollback: (client, snapshot) =>
      client.setQueryData(["workItem", "wi-rb-142"], snapshot),
    reconcile: (client, canonical) =>
      client.setQueryData(["workItem", "wi-rb-142"], canonical),
  };
}

describe("mutation infrastructure", () => {
  it("represents offline optimism without claiming conflict or canonical success", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    const client = new QueryClient();
    const canonical = { id: "wi-rb-142", priority: "high", version: 7 };
    client.setQueryData(["workItem", "wi-rb-142"], canonical);
    const registry = new PendingMutationRegistry();
    const gateway: CommandGateway = { execute: vi.fn() };
    const result = await executeDomainMutation(client, gateway, registry, plan());

    expect(result).toEqual({
      ok: false,
      code: "offline",
      message: "Offline: local intent is unacknowledged.",
    });
    expect(client.getQueryData(["workItem", "wi-rb-142"])).toMatchObject({
      priority: "urgent",
      version: 7,
    });
    expect(registry.get("m1")).toMatchObject({
      mutationId: "m1",
      commandType: "workItem.changePriority",
      affectedFields: ["priority"],
      phase: "offline",
      expectedVersion: 7,
    });
    expect(gateway.execute).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("distinguishes transport failure and retains mutation identity", async () => {
    vi.stubGlobal("navigator", { onLine: true });
    const client = new QueryClient();
    const canonical = { id: "wi-rb-142", priority: "high", version: 7 };
    client.setQueryData(["workItem", "wi-rb-142"], canonical);
    const registry = new PendingMutationRegistry();
    const gateway: CommandGateway = {
      execute: vi.fn().mockRejectedValue(new Error("network down")),
    };
    const result = await executeDomainMutation(client, gateway, registry, plan());

    expect(result).toMatchObject({ ok: false, code: "transport_error" });
    expect(client.getQueryData(["workItem", "wi-rb-142"])).toEqual(canonical);
    expect(registry.get("m1")).toMatchObject({
      mutationId: "m1",
      phase: "failure",
      failureCode: "transport_error",
    });
    vi.unstubAllGlobals();
  });
});
