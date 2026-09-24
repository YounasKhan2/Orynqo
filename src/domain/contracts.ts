import { z } from "zod";
export const Id = z.string().min(1);
export const IsoDate = z.string().datetime({ offset: true });
export const WorkspaceSchema = z.object({
  id: Id,
  organizationId: Id,
  name: z.string().min(1),
});
export type Workspace = z.infer<typeof WorkspaceSchema>;
export const WorkspaceMembershipSchema = z.object({
  id: Id,
  workspaceId: Id,
  userId: Id,
  state: z.enum(["invited", "active", "suspended", "removed"]),
});
export type WorkspaceMembership = z.infer<typeof WorkspaceMembershipSchema>;
export const TeamSchema = z.object({
  id: Id,
  workspaceId: Id,
  name: z.string().min(1),
  visibility: z.enum(["public", "private"]),
});
export type Team = z.infer<typeof TeamSchema>;
export const TeamMembershipSchema = z.object({
  id: Id,
  teamId: Id,
  userId: Id,
  state: z.enum(["active", "removed"]),
});
export type TeamMembership = z.infer<typeof TeamMembershipSchema>;
export const ProjectSchema = z.object({
  id: Id,
  workspaceId: Id,
  teamId: Id.nullable(),
  name: z.string().min(1),
  visibility: z.enum(["workspace", "team", "private"]),
  lifecycle: z.enum(["active", "archived"]),
});
export type Project = z.infer<typeof ProjectSchema>;
export const ProjectAccessSchema = z.object({
  id: Id,
  projectId: Id,
  subjectType: z.enum(["user", "team"]),
  subjectId: Id,
  level: z.enum(["viewer", "editor"]),
});
export type ProjectAccess = z.infer<typeof ProjectAccessSchema>;
export const WorkItemPrioritySchema = z.enum([
  "none",
  "low",
  "medium",
  "high",
  "urgent",
]);
export const WorkItemSchema = z.object({
  id: Id,
  key: z.string().min(1),
  workspaceId: Id,
  projectId: Id,
  title: z.string().min(1),
  description: z.string().nullable(),
  statusId: Id,
  priority: WorkItemPrioritySchema,
  assigneeId: Id.nullable(),
  cycleId: Id.nullable(),
  milestoneId: Id.nullable(),
  lifecycle: z.enum(["active", "archived", "deleted"]),
  version: z.number().int().nonnegative(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type WorkItem = z.infer<typeof WorkItemSchema>;
export const WorkItemRelationshipSchema = z.object({
  id: Id,
  sourceWorkItemId: Id,
  targetWorkItemId: Id,
  type: z.enum(["parent", "blocked_by", "blocks", "relates_to"]),
});
export type WorkItemRelationship = z.infer<typeof WorkItemRelationshipSchema>;
export const WorkflowSchema = z.object({
  id: Id,
  teamId: Id,
  name: z.string().min(1),
});
export type Workflow = z.infer<typeof WorkflowSchema>;
export const WorkflowStatusSchema = z.object({
  id: Id,
  workflowId: Id,
  name: z.string().min(1),
  category: z.enum(["backlog", "todo", "started", "completed", "cancelled"]),
  position: z.number().int().nonnegative(),
});
export type WorkflowStatus = z.infer<typeof WorkflowStatusSchema>;
export const CycleSchema = z.object({
  id: Id,
  teamId: Id,
  name: z.string().min(1),
  state: z.enum(["planned", "active", "completed"]),
});
export type Cycle = z.infer<typeof CycleSchema>;
export const WatcherSchema = z.object({ workItemId: Id, userId: Id });
export type Watcher = z.infer<typeof WatcherSchema>;
export const CommentSchema = z.object({
  id: Id,
  workItemId: Id,
  authorId: Id,
  body: z.string().min(1),
  mutationId: Id.nullable(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Comment = z.infer<typeof CommentSchema>;
export const ActivityEventSchema = z.object({
  id: Id,
  workItemId: Id,
  actorId: Id.nullable(),
  type: z.string().min(1),
  mutationId: Id.nullable(),
  payload: z.unknown(),
  createdAt: IsoDate,
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;
export const EffectiveAccessSchema = z.object({
  discover: z.boolean(),
  read: z.boolean(),
  comment: z.boolean(),
  editProperties: z.boolean(),
  changeStatus: z.boolean(),
  reason: z.string().optional(),
});
export type EffectiveAccess = z.infer<typeof EffectiveAccessSchema>;
