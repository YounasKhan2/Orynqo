import type { Rb142Snapshot } from "./model";
import { rb142DevelopmentServer } from "./development-server";

export type Rb142DevelopmentEvent = {
  eventId: string;
  mutationId?: string;
  resourceVersion: number;
  changedFields: readonly string[];
  canonical: Rb142Snapshot;
};
type Listener = (event: Rb142DevelopmentEvent) => void;

export class Rb142DevelopmentEventTransport {
  private readonly listeners = new Set<Listener>();
  private sequence = 0;
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  deliver(event: Rb142DevelopmentEvent) { for (const listener of this.listeners) listener(event); }
  emitCanonical(changedFields: readonly string[], canonical: Rb142Snapshot, mutationId?: string, eventId = `rb142-event-${++this.sequence}`) {
    const event: Rb142DevelopmentEvent = {
      eventId,
      ...(mutationId === undefined ? {} : { mutationId }),
      resourceVersion: canonical.workItem.version,
      changedFields,
      canonical,
    };
    this.deliver(event);
    return event;
  }
  remoteAssigneeChange() { return this.emitCanonical(["assigneeId"], rb142DevelopmentServer.remoteAssigneeChange()); }
  remotePriorityChange(priority: "low" | "medium" | "high" | "urgent") { return this.emitCanonical(["priority"], rb142DevelopmentServer.remotePriorityChange(priority)); }
  revokeAccess() { return this.emitCanonical(["access"], rb142DevelopmentServer.revokeAccess()); }
  archive() { return this.emitCanonical(["lifecycle"], rb142DevelopmentServer.remoteArchive()); }
  delete() { return this.emitCanonical(["unavailable"], rb142DevelopmentServer.remoteDelete()); }
}
export const rb142DevelopmentEvents = new Rb142DevelopmentEventTransport();
