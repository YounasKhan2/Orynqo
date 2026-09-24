import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { queryKeys } from "../../application/query-keys";
import {
  RecentRealtimeEventIds,
  reconcileRealtime,
} from "../../application/realtime-reconciliation";
import {
  PendingMutationRegistry,
  type MutationPhase,
} from "../../application/mutations";
import { rb142CommandGateway } from "./gateway";
import {
  RB142_COMMENT,
  type Rb142Command,
  type Rb142CommandResult,
  type Rb142Snapshot,
} from "./model";
import { rb142DevelopmentServer } from "./development-server";

const registry = new PendingMutationRegistry();
const recentEvents = new RecentRealtimeEventIds();

export type PropertyState = {
  phase: MutationPhase;
  message?: string;
  attemptedValue?: string;
  canonicalValue?: string;
};

export function useRb142(initial: Rb142Snapshot | undefined) {
  const client = useQueryClient();
  const [priorityState, setPriorityState] = useState<PropertyState>({ phase: "idle" });
  const [statusState, setStatusState] = useState<PropertyState>({ phase: "idle" });
  const [commentState, setCommentState] = useState<PropertyState>({ phase: "idle" });
  const mutationIds = useRef(new Map<string, string>());

  const setCanonical = useCallback((snapshot: Rb142Snapshot) => {
    client.setQueryData(queryKeys.workItem("wi-rb-142"), snapshot);
    client.setQueryData(queryKeys.comments("wi-rb-142"), snapshot.comments);
    client.setQueryData(queryKeys.activity("wi-rb-142"), snapshot.activity);
    client.setQueryData(queryKeys.access("workItem", "wi-rb-142"), snapshot.access);
  }, [client]);

  const nextMutationId = (logicalKey: string) => {
    const existing = mutationIds.current.get(logicalKey);
    if (existing) return existing;
    const id = crypto.randomUUID();
    mutationIds.current.set(logicalKey, id);
    return id;
  };

  const run = useCallback(async (
    commandType: Rb142Command["commandType"],
    affectedFields: readonly string[],
    payload: Rb142Command["payload"],
    setState: (state: PropertyState) => void,
    attemptedValue: string,
    logicalKey: string,
  ): Promise<Rb142CommandResult | undefined> => {
    const canonical = client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142")) ?? initial;
    if (!canonical || canonical.unavailable) return undefined;
    const mutationId = nextMutationId(logicalKey);
    const command: Rb142Command = {
      commandType,
      mutationId,
      resourceId: "wi-rb-142",
      expectedVersion: canonical.workItem.version,
      payload,
    };
    registry.register({
      mutationId,
      resourceId: "wi-rb-142",
      commandType,
      affectedFields,
      expectedVersion: canonical.workItem.version,
      attemptedValue,
      phase: navigator.onLine ? "pending" : "offline",
    });
    setState({
      phase: navigator.onLine ? "pending" : "offline",
      attemptedValue,
      canonicalValue:
        affectedFields[0] === "priority"
          ? canonical.workItem.priority
          : affectedFields[0] === "statusId"
            ? canonical.workItem.statusLabel
            : undefined,
      message: navigator.onLine ? undefined : "Offline — change is unacknowledged.",
    });
    if (!navigator.onLine) {
      return { ok: false, code: "offline", message: "Offline — change is unacknowledged." };
    }

    const result = await rb142CommandGateway.execute(command);
    if (result.ok) {
      setCanonical(result.canonical);
      registry.settle(mutationId);
      mutationIds.current.delete(logicalKey);
      setState({ phase: "settled" });
      return result;
    }

    registry.update(mutationId, {
      phase: result.code === "conflict" ? "conflict" : "failure",
      failureCode: result.code,
      error: result.message,
      canonicalValue: result.canonical,
    });
    if (result.canonical) setCanonical(result.canonical);
    setState({
      phase: result.code === "conflict" ? "conflict" : result.code === "offline" ? "offline" : "failure",
      attemptedValue,
      message: result.message,
    });
    return result;
  }, [client, initial, setCanonical]);

  const changePriority = () =>
    run("workItem.changePriority", ["priority"], { priority: "urgent" }, setPriorityState, "Urgent", "priority");

  const submitComment = () =>
    run("workItem.createComment", [], { body: RB142_COMMENT }, setCommentState, RB142_COMMENT, "comment");

  const transitionStatus = () =>
    run("workItem.transitionStatus", ["statusId"], { statusId: "status-review" }, setStatusState, "Review", "status");

  const receiveRealtime = useCallback((event: {
    eventId: string;
    mutationId?: string;
    resourceVersion: number;
    changedFields: readonly string[];
    canonical: Rb142Snapshot;
  }) => {
    const current = client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142"));
    const decision = reconcileRealtime(
      { ...event, resourceId: "wi-rb-142" },
      current?.workItem.version ?? 0,
      registry,
      recentEvents,
    );
    if (decision === "apply") setCanonical(event.canonical);
    if (decision === "same-field-conflict") {
      const priorityConflict = registry.forResource("wi-rb-142").find(
        (entry) => entry.phase === "conflict" && entry.affectedFields.includes("priority"),
      );
      if (priorityConflict) {
        setPriorityState({
          phase: "conflict",
          attemptedValue: String(priorityConflict.attemptedValue ?? ""),
          message: "Priority changed remotely. Choose which value to keep.",
        });
      }
    }
    return decision;
  }, [client, setCanonical]);

  const regression = useMemo(() => ({
    reset: () => rb142DevelopmentServer.reset(),
    server: rb142DevelopmentServer,
    receiveRealtime,
  }), [receiveRealtime]);

  return {
    priorityState,
    statusState,
    commentState,
    changePriority,
    submitComment,
    transitionStatus,
    setCanonical,
    regression,
  };
}
