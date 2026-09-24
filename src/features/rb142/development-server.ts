import type { ActivityEvent, Comment, EffectiveAccess } from "../../domain/contracts";
import type { WorkItemListItem } from "../work-items/model";
import {
  RB142_COMMENT,
  type Rb142Command,
  type Rb142CommandResult,
  type Rb142Snapshot,
} from "./model";

const actorId = "user-muhammad-y";
const initialTime = "2026-09-24T00:00:00.000Z";

const editorAccess: EffectiveAccess = {
  discover: true,
  read: true,
  comment: true,
  editProperties: true,
  changeStatus: true,
  reason: "Workspace editor capability inherited into Platform Core.",
};

const initialWorkItem: WorkItemListItem = {
  id: "wi-rb-142",
  key: "RB-142",
  workspaceId: "workspace-product",
  projectId: "platform-core",
  title: "Add workspace-level role inheritance",
  description:
    "Preserve inherited workspace capabilities while respecting explicit project restrictions.",
  statusId: "status-in-progress",
  statusLabel: "In Progress",
  priority: "high",
  assigneeId: actorId,
  assigneeLabel: "Muhammad Y.",
  cycleId: "cycle-08",
  cycleLabel: "Cycle 08",
  milestoneId: null,
  lifecycle: "active",
  version: 7,
  createdAt: initialTime,
  updatedAt: initialTime,
};

const olderActivity: ActivityEvent[] = [
  {
    id: "activity-rb142-created",
    workItemId: "wi-rb-142",
    actorId,
    type: "workItem.created",
    mutationId: null,
    payload: { label: "Created RB-142" },
    createdAt: initialTime,
  },
];

export type RegressionMode =
  | "none"
  | "failure"
  | "forbidden"
  | "conflict"
  | "archive"
  | "delete";

export class Rb142DevelopmentServer {
  private snapshot: Rb142Snapshot = this.initialSnapshot();
  private readonly receipts = new Map<string, Rb142CommandResult>();
  private mode: RegressionMode = "none";
  private clock = 1;

  private initialSnapshot(): Rb142Snapshot {
    return {
      workItem: { ...initialWorkItem },
      comments: [],
      activity: [...olderActivity],
      access: { ...editorAccess },
    };
  }

  reset() {
    this.snapshot = this.initialSnapshot();
    this.receipts.clear();
    this.mode = "none";
    this.clock = 1;
  }

  setRegressionMode(mode: RegressionMode) {
    this.mode = mode;
  }

  read() {
    return structuredClone(this.snapshot);
  }

  private now() {
    return new Date(Date.parse(initialTime) + this.clock++ * 1000).toISOString();
  }

  async execute(command: Rb142Command): Promise<Rb142CommandResult> {
    await Promise.resolve();
    const replay = this.receipts.get(command.mutationId);
    if (replay) {
      return replay.ok ? { ...structuredClone(replay), replayed: true } : structuredClone(replay);
    }

    if (this.mode === "delete" || this.snapshot.unavailable) {
      const result: Rb142CommandResult = {
        ok: false,
        code: "not_found",
        message: "RB-142 is no longer available.",
      };
      this.receipts.set(command.mutationId, result);
      return result;
    }
    if (this.mode === "forbidden" || !this.can(command.commandType)) {
      const result: Rb142CommandResult = {
        ok: false,
        code: "forbidden",
        message: "Your access changed. This action is no longer permitted.",
        canonical: this.read(),
      };
      this.receipts.set(command.mutationId, result);
      return result;
    }
    if (this.snapshot.workItem.lifecycle !== "active") {
      return {
        ok: false,
        code: "validation",
        message: "Archived Work Items are read-only.",
        canonical: this.read(),
      };
    }
    if (this.mode === "failure") {
      return {
        ok: false,
        code: "transport_error",
        message: "The command could not be confirmed. Try again.",
        canonical: this.read(),
      };
    }
    if (
      this.mode === "conflict" ||
      command.expectedVersion !== this.snapshot.workItem.version
    ) {
      return {
        ok: false,
        code: "conflict",
        message: "RB-142 changed remotely. Review the canonical value before retrying.",
        canonical: this.read(),
      };
    }

    const next = structuredClone(this.snapshot);
    const timestamp = this.now();
    let activity: ActivityEvent;

    if (command.commandType === "workItem.changePriority") {
      if (!("priority" in command.payload) || command.payload.priority !== "urgent") {
        return { ok: false, code: "validation", message: "Invalid Priority." };
      }
      const previous = next.workItem.priority;
      next.workItem.priority = "urgent";
      activity = this.activity(command.mutationId, "workItem.priority.changed", {
        label: "Priority",
        from: previous,
        to: "urgent",
      }, timestamp);
    } else if (command.commandType === "workItem.createComment") {
      if (!("body" in command.payload) || command.payload.body !== RB142_COMMENT) {
        return { ok: false, code: "validation", message: "The RB-142 fixture comment must remain exact." };
      }
      const comment: Comment = {
        id: `comment-${command.mutationId}`,
        workItemId: next.workItem.id,
        authorId: actorId,
        body: command.payload.body,
        mutationId: command.mutationId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      next.comments = [...next.comments, comment];
      activity = this.activity(command.mutationId, "workItem.comment.created", {
        label: "Comment",
        body: command.payload.body,
      }, timestamp);
    } else {
      if (!("statusId" in command.payload) || command.payload.statusId !== "status-review") {
        return { ok: false, code: "validation", message: "Invalid Status transition." };
      }
      if (next.workItem.statusId !== "status-in-progress") {
        return { ok: false, code: "validation", message: "Only In Progress → Review is valid in this slice." };
      }
      next.workItem.statusId = "status-review";
      next.workItem.statusLabel = "Review";
      activity = this.activity(command.mutationId, "workItem.status.changed", {
        label: "Status",
        from: "In Progress",
        to: "Review",
      }, timestamp);
    }

    next.workItem.version += 1;
    next.workItem.updatedAt = timestamp;
    next.activity = [activity, ...next.activity];
    this.snapshot = next;
    const result: Rb142CommandResult = {
      ok: true,
      canonical: this.read(),
      resultVersion: next.workItem.version,
      replayed: false,
    };
    this.receipts.set(command.mutationId, result);
    return result;
  }

  remoteAssigneeChange() {
    this.snapshot = {
      ...this.snapshot,
      workItem: {
        ...this.snapshot.workItem,
        assigneeId: "user-remote",
        assigneeLabel: "N. Chen",
        version: this.snapshot.workItem.version + 1,
      },
    };
    return this.read();
  }

  remoteArchive() {
    this.snapshot = {
      ...this.snapshot,
      workItem: {
        ...this.snapshot.workItem,
        lifecycle: "archived",
        version: this.snapshot.workItem.version + 1,
      },
    };
    return this.read();
  }

  remoteDelete() {
    this.snapshot = { ...this.snapshot, unavailable: true };
    return this.read();
  }

  revokeAccess() {
    this.snapshot = {
      ...this.snapshot,
      access: {
        discover: true,
        read: true,
        comment: false,
        editProperties: false,
        changeStatus: false,
        reason: "Project access was revoked while this Work Item was open.",
      },
    };
    return this.read();
  }

  private can(commandType: Rb142Command["commandType"]) {
    if (commandType === "workItem.createComment") return this.snapshot.access.comment;
    if (commandType === "workItem.transitionStatus") return this.snapshot.access.changeStatus;
    return this.snapshot.access.editProperties;
  }

  private activity(
    mutationId: string,
    type: string,
    payload: unknown,
    createdAt: string,
  ): ActivityEvent {
    return {
      id: `activity-${mutationId}`,
      workItemId: "wi-rb-142",
      actorId,
      type,
      mutationId,
      payload,
      createdAt,
    };
  }
}

export const rb142DevelopmentServer = new Rb142DevelopmentServer();
