import type { Rb142Command, Rb142CommandResult } from "./model";
import { rb142DevelopmentServer } from "./development-server";

export interface Rb142CommandGateway {
  execute(command: Rb142Command): Promise<Rb142CommandResult>;
}

export class DevelopmentRb142CommandGateway implements Rb142CommandGateway {
  execute(command: Rb142Command) {
    return rb142DevelopmentServer.execute(command);
  }
}

/**
 * Development-only adapter. The production boundary is an Appwrite Function
 * carrying the same command envelope. UI code never receives a TablesDB write
 * client. See docs/architecture/rb-142-production-boundary.md.
 */
export const rb142CommandGateway: Rb142CommandGateway =
  new DevelopmentRb142CommandGateway();
