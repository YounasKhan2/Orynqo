import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { queryKeys } from "../../application/query-keys";
import {
  executeDomainMutation,
  PendingMutationRegistry,
  type MutationPhase,
} from "../../application/mutations";
import {
  RecentRealtimeEventIds,
  reconcileRealtime,
} from "../../application/realtime-reconciliation";
import { applyRb142CanonicalToQueryCache } from "./cache";
import { rb142DevelopmentEvents } from "./development-events";
import { rb142CommandGateway } from "./gateway";
import {
  commentMutationPlan,
  priorityMutationPlan,
  statusMutationPlan,
} from "./plans";
import type { Rb142Snapshot } from "./model";

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
  const [priorityState, setPriorityState] = useState<PropertyState>({
    phase: "idle",
  });
  const [statusState, setStatusState] = useState<PropertyState>({
    phase: "idle",
  });
  const [commentState, setCommentState] = useState<PropertyState>({
    phase: "idle",
  });
  const ids = useRef(new Map<string, string>());
  const nextId = (key: string) => {
    const existing = ids.current.get(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    ids.current.set(key, id);
    return id;
  };
  const run = useCallback(
    async (kind: "priority" | "status" | "comment") => {
      const current =
        client.getQueryData<Rb142Snapshot>(queryKeys.workItem("wi-rb-142")) ??
        initial;
      if (!current || current.unavailable) return;
      const id = nextId(kind);
      const args = {
        mutationId: id,
        expectedVersion: current.workItem.version,
      };
      const plan =
        kind === "priority"
          ? priorityMutationPlan(args)
          : kind === "status"
            ? statusMutationPlan(args)
            : commentMutationPlan(args);
      const setState =
        kind === "priority"
          ? setPriorityState
          : kind === "status"
            ? setStatusState
            : setCommentState;
      setState({
        phase:
          typeof navigator !== "undefined" && !navigator.onLine
            ? "offline"
            : "pending",
        attemptedValue: String(plan.attemptedValue ?? ""),
      });
      const result = await executeDomainMutation(
        client,
        rb142CommandGateway,
        registry,
        plan,
      );
      if (result.ok) {
        ids.current.delete(kind);
        setState({ phase: "settled" });
        return result;
      }
      const entry = registry.get(id);
      const canonical = entry?.canonicalValue as Rb142Snapshot | undefined;
      setState({
        phase: entry?.phase ?? "failure",
        attemptedValue: String(plan.attemptedValue ?? ""),
        canonicalValue:
          kind === "priority"
            ? canonical?.workItem.priority
            : kind === "status"
              ? canonical?.workItem.statusLabel
              : undefined,
        message: result.message,
      });
      return result;
    },
    [client, initial],
  );

  const receiveRealtime = useCallback(
    (event: Parameters<typeof rb142DevelopmentEvents.deliver>[0]) => {
      const current = client.getQueryData<Rb142Snapshot>(
        queryKeys.workItem("wi-rb-142"),
      );
      const pending = registry
        .forResource("wi-rb-142")
        .filter((e) => e.phase === "pending" || e.phase === "offline");
      const preserve = pending.flatMap((e) => e.affectedFields);
      const decision = reconcileRealtime(
        { ...event, resourceId: "wi-rb-142" },
        current?.workItem.version ?? 0,
        registry,
        recentEvents,
      );
      if (decision === "apply")
        applyRb142CanonicalToQueryCache(client, event.canonical, {
          preservePendingFields: preserve,
        });
      if (decision === "ack-local")
        applyRb142CanonicalToQueryCache(client, event.canonical);
      if (decision === "same-field-conflict") {
        const conflict = registry
          .forResource("wi-rb-142")
          .find((e) => e.phase === "conflict");
        if (conflict?.affectedFields.includes("priority"))
          setPriorityState({
            phase: "conflict",
            attemptedValue: String(conflict.attemptedValue ?? ""),
            canonicalValue: event.canonical.workItem.priority,
            message: "Priority changed remotely. Choose which value to keep.",
          });
        if (conflict?.affectedFields.includes("statusId"))
          setStatusState({
            phase: "conflict",
            attemptedValue: String(conflict.attemptedValue ?? ""),
            canonicalValue: event.canonical.workItem.statusLabel,
            message: "Status changed remotely. Choose which value to keep.",
          });
      }
      return decision;
    },
    [client],
  );

  useEffect(
    () => rb142DevelopmentEvents.subscribe(receiveRealtime),
    [receiveRealtime],
  );
  return {
    priorityState,
    statusState,
    commentState,
    changePriority: () => run("priority"),
    submitComment: () => run("comment"),
    transitionStatus: () => run("status"),
  };
}
