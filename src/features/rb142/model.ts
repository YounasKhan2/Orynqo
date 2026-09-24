import type { ActivityEvent, Comment, EffectiveAccess } from "../../domain/contracts";
import type { WorkItemListItem } from "../work-items/model";

export const RB142_COMMENT =
  "Inheritance looks correct. I’ve updated priority and moved this to review.";

export type Rb142Snapshot = {
  workItem: WorkItemListItem;
  comments: readonly Comment[];
  activity: readonly ActivityEvent[];
  access: EffectiveAccess;
  unavailable?: boolean;
};

export type Rb142CommandType =
  | "workItem.changePriority"
  | "workItem.createComment"
  | "workItem.transitionStatus";

export type Rb142Payload =
  | { priority: "urgent" }
  | { body: string }
  | { statusId: "status-review" };

export type Rb142Command = {
  commandType: Rb142CommandType;
  mutationId: string;
  resourceId: "wi-rb-142";
  expectedVersion: number;
  payload: Rb142Payload;
};

export type Rb142CommandSuccess = {
  ok: true;
  canonical: Rb142Snapshot;
  resultVersion: number;
  replayed: boolean;
};

export type Rb142CommandFailure = {
  ok: false;
  code:
    | "offline"
    | "transport_error"
    | "conflict"
    | "forbidden"
    | "not_found"
    | "validation";
  message: string;
  canonical?: Rb142Snapshot;
};

export type Rb142CommandResult = Rb142CommandSuccess | Rb142CommandFailure;
