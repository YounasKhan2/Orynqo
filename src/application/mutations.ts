import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type {
  CommandEnvelope,
  CommandGateway,
  CommandResult,
} from "./commands";

export type MutationPhase =
  | "idle"
  | "editing"
  | "pending"
  | "settled"
  | "failure"
  | "conflict"
  | "offline";

export type PendingMutation<TAttempted = unknown> = {
  mutationId: string;
  resourceId: string;
  commandType: string;
  affectedFields: readonly string[];
  expectedVersion: number;
  attemptedValue?: TAttempted;
  optimisticState?: unknown;
  canonicalValue?: unknown;
  phase: MutationPhase;
  failureCode?: Exclude<CommandResult<never> & { ok: false }, never>["code"];
  error?: string;
};

export class PendingMutationRegistry {
  private readonly entries = new Map<string, PendingMutation>();

  register(entry: PendingMutation) {
    this.entries.set(entry.mutationId, entry);
  }
  get(mutationId: string) {
    return this.entries.get(mutationId);
  }
  forResource(resourceId: string) {
    return [...this.entries.values()].filter(
      (entry) => entry.resourceId === resourceId,
    );
  }
  update(mutationId: string, patch: Partial<PendingMutation>) {
    const current = this.entries.get(mutationId);
    if (current) this.entries.set(mutationId, { ...current, ...patch });
  }
  settle(mutationId: string) {
    const current = this.entries.get(mutationId);
    if (!current) return;
    const settled: PendingMutation = { ...current, phase: "settled" };
    delete settled.failureCode;
    delete settled.error;
    this.entries.set(mutationId, settled);
  }
  remove(mutationId: string) {
    this.entries.delete(mutationId);
  }
}

export type MutationPlan<TPayload, TCanonical> = {
  commandType: string;
  affectedFields: readonly string[];
  command: CommandEnvelope<TPayload>;
  affectedQueryKeys: readonly QueryKey[];
  optimistic: (client: QueryClient) => unknown;
  rollback: (client: QueryClient, snapshot: unknown) => void;
  reconcile: (client: QueryClient, canonical: TCanonical) => void;
  attemptedValue?: unknown;
};

function isOnline() {
  return typeof navigator === "undefined" || navigator.onLine;
}

export async function executeDomainMutation<TPayload, TCanonical>(
  client: QueryClient,
  gateway: CommandGateway,
  registry: PendingMutationRegistry,
  plan: MutationPlan<TPayload, TCanonical>,
): Promise<CommandResult<TCanonical>> {
  const snapshot = plan.optimistic(client);
  registry.register({
    mutationId: plan.command.mutationId,
    resourceId: plan.command.resourceId,
    commandType: plan.commandType,
    affectedFields: plan.affectedFields,
    expectedVersion: plan.command.expectedVersion,
    attemptedValue: plan.attemptedValue,
    optimisticState: snapshot,
    phase: isOnline() ? "pending" : "offline",
  });

  if (!isOnline()) {
    return {
      ok: false,
      code: "offline",
      message: "Offline: local intent is unacknowledged.",
    };
  }

  try {
    const result = await gateway.execute<TPayload, TCanonical>(
      plan.commandType,
      plan.command,
    );
    if (result.ok) {
      plan.reconcile(client, result.canonical);
      registry.settle(plan.command.mutationId);
      return result;
    }

    plan.rollback(client, snapshot);
    registry.update(plan.command.mutationId, {
      phase: result.code === "conflict" ? "conflict" : "failure",
      failureCode: result.code,
      error: result.message,
    });
    return result;
  } catch (error) {
    plan.rollback(client, snapshot);
    registry.update(plan.command.mutationId, {
      phase: isOnline() ? "failure" : "offline",
      failureCode: isOnline() ? "transport_error" : "offline",
      error:
        error instanceof Error ? error.message : "Mutation transport failed",
    });
    return {
      ok: false,
      code: isOnline() ? "transport_error" : "offline",
      message:
        error instanceof Error ? error.message : "Mutation transport failed",
    };
  }
}
