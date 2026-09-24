export type CommandFailureCode =
  | "offline"
  | "transport_error"
  | "conflict"
  | "forbidden"
  | "not_found"
  | "validation";

export type CommandEnvelope<T> = {
  mutationId: string;
  actorId: string;
  workspaceId: string;
  resourceId: string;
  expectedVersion: number;
  payload: T;
};

export type CommandResult<T> =
  | { ok: true; canonical: T; resultVersion: number }
  | { ok: false; code: CommandFailureCode; message: string };

export interface CommandGateway {
  execute<TPayload, TCanonical>(
    commandType: string,
    command: CommandEnvelope<TPayload>,
  ): Promise<CommandResult<TCanonical>>;
}
// RB-142 commands intentionally begin in a later gate.
