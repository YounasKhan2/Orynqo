import type { CommandGateway, CommandResult } from "../../application/commands";
import type { Rb142CommandPayload, Rb142Snapshot } from "./model";
import { rb142DevelopmentServer } from "./development-server";

export class DevelopmentRb142CommandGateway implements CommandGateway {
  async execute<TPayload, TCanonical>(
    commandType: string,
    command: {
      mutationId: string;
      actorId: string;
      workspaceId: string;
      resourceId: string;
      expectedVersion: number;
      payload: TPayload;
    },
  ): Promise<CommandResult<TCanonical>> {
    const result = await rb142DevelopmentServer.execute({
      ...command,
      commandType: commandType as
        | "workItem.changePriority"
        | "workItem.createComment"
        | "workItem.transitionStatus",
      payload: command.payload as Rb142CommandPayload,
    });
    return result as CommandResult<TCanonical>;
  }
}

export const rb142CommandGateway: CommandGateway =
  new DevelopmentRb142CommandGateway();

export type Rb142Canonical = Rb142Snapshot;
