import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { CommandEnvelope, CommandGateway, CommandResult } from "./commands";

export type MutationPhase = "idle" | "editing" | "pending" | "settled" | "failure" | "conflict" | "offline";

export type PendingMutation<TAttempted = unknown> = {
  mutationId: string;
  resourceId: string;
  fieldOrCommand: string;
  expectedVersion: number;
  attemptedValue?: TAttempted;
  optimisticState?: unknown;
  canonicalValue?: unknown;
  phase: MutationPhase;
  error?: string;
};

export class PendingMutationRegistry {
  private readonly entries = new Map<string, PendingMutation>();

  register(entry: PendingMutation) { this.entries.set(entry.mutationId, entry); }
  get(mutationId: string) { return this.entries.get(mutationId); }
  forResource(resourceId: string) { return [...this.entries.values()].filter((entry) => entry.resourceId === resourceId); }
  update(mutationId: string, patch: Partial<PendingMutation>) {
    const current = this.entries.get(mutationId);
    if (current) this.entries.set(mutationId, { ...current, ...patch });
  }
  settle(mutationId: string) { this.update(mutationId, { phase: "settled" }); }
  remove(mutationId: string) { this.entries.delete(mutationId); }
}

export type MutationPlan<TPayload, TCanonical> = {
  commandType: string;
  command: CommandEnvelope<TPayload>;
  affectedQueryKeys: readonly QueryKey[];
  optimistic: (client: QueryClient) => unknown;
  rollback: (client: QueryClient, snapshot: unknown) => void;
  reconcile: (client: QueryClient, canonical: TCanonical) => void;
  attemptedValue?: unknown;
};

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
    fieldOrCommand: plan.commandType,
    expectedVersion: plan.command.expectedVersion,
    attemptedValue: plan.attemptedValue,
    optimisticState: snapshot,
    phase: navigator.onLine ? "pending" : "offline",
  });

  if (!navigator.onLine) {
    return { ok: false, code: "conflict", message: "Offline: mutation remains unacknowledged." };
  }

  try {
    const result = await gateway.execute<TPayload, TCanonical>(plan.commandType, plan.command);
    if (result.ok) {
      plan.reconcile(client, result.canonical);
      registry.settle(plan.command.mutationId);
      return result;
    }
    plan.rollback(client, snapshot);
    registry.update(plan.command.mutationId, {
      phase: result.code === "conflict" ? "conflict" : "failure",
      error: result.message,
    });
    return result;
  } catch (error) {
    plan.rollback(client, snapshot);
    registry.update(plan.command.mutationId, {
      phase: navigator.onLine ? "failure" : "offline",
      error: error instanceof Error ? error.message : "Mutation transport failed",
    });
    throw error;
  }
}
