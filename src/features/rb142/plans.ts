import type { QueryClient } from "@tanstack/react-query";
import type { CommandEnvelope } from "../../application/commands";
import type { MutationPlan } from "../../application/mutations";
import {
  applyRb142CanonicalToQueryCache,
  applyRb142OptimisticFields,
  captureRb142QueryCache,
  restoreRb142QueryCache,
} from "./cache";
import {
  RB142_COMMENT,
  type Rb142CommandPayload,
  type Rb142Snapshot,
} from "./model";

type PlanArgs = {
  mutationId: string;
  expectedVersion: number;
};

function envelope<T extends Rb142CommandPayload>(
  args: PlanArgs,
  payload: T,
): CommandEnvelope<T> {
  return {
    mutationId: args.mutationId,
    actorId: "user-muhammad-y",
    workspaceId: "workspace-product",
    resourceId: "wi-rb-142",
    expectedVersion: args.expectedVersion,
    payload,
  };
}

export function priorityMutationPlan(
  args: PlanArgs,
): MutationPlan<{ priority: "urgent" }, Rb142Snapshot> {
  return {
    commandType: "workItem.changePriority",
    affectedFields: ["priority"],
    command: envelope(args, { priority: "urgent" }),
    affectedQueryKeys: [["workItem", "wi-rb-142"], ["workItems"]],
    attemptedValue: "Urgent",
    optimistic: (client) => {
      const previous = captureRb142QueryCache(client);
      applyRb142OptimisticFields(client, { priority: "urgent" });
      return previous;
    },
    rollback: restoreRb142QueryCache,
    reconcile: applyRb142CanonicalToQueryCache,
  };
}

export function statusMutationPlan(
  args: PlanArgs,
): MutationPlan<{ statusId: "status-review" }, Rb142Snapshot> {
  return {
    commandType: "workItem.transitionStatus",
    affectedFields: ["statusId"],
    command: envelope(args, { statusId: "status-review" }),
    affectedQueryKeys: [["workItem", "wi-rb-142"], ["workItems"]],
    attemptedValue: "Review",
    optimistic: (client) => {
      const previous = captureRb142QueryCache(client);
      applyRb142OptimisticFields(client, {
        statusId: "status-review",
        statusLabel: "Review",
      });
      return previous;
    },
    rollback: restoreRb142QueryCache,
    reconcile: applyRb142CanonicalToQueryCache,
  };
}

export function commentMutationPlan(
  args: PlanArgs,
): MutationPlan<{ body: string }, Rb142Snapshot> {
  return {
    commandType: "workItem.createComment",
    affectedFields: [],
    command: envelope(args, { body: RB142_COMMENT }),
    affectedQueryKeys: [
      ["workItem", "wi-rb-142"],
      ["workItem", "wi-rb-142", "comments"],
      ["workItem", "wi-rb-142", "activity"],
    ],
    attemptedValue: RB142_COMMENT,
    optimistic: (client: QueryClient) => captureRb142QueryCache(client),
    rollback: restoreRb142QueryCache,
    reconcile: applyRb142CanonicalToQueryCache,
  };
}
