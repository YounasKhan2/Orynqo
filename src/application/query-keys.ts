export type WorkItemCollectionParams = {
  projectId: string;
  filters?: Readonly<Record<string, string | readonly string[]>>;
  sort?: string;
  cursor?: string;
};
export const queryKeys = {
  workspace: (id: string) => ["workspace", id] as const,
  project: (id: string) => ["project", id] as const,
  workItems: (params: WorkItemCollectionParams) =>
    ["workItems", params] as const,
  workItem: (id: string) => ["workItem", id] as const,
  inbox: (userId: string, workspaceId: string) =>
    ["inbox", userId, workspaceId] as const,
  comments: (id: string) => ["workItem", id, "comments"] as const,
  activity: (id: string) => ["workItem", id, "activity"] as const,
  access: (type: string, id: string) => ["access", type, id] as const,
};
export const narrowInvalidation = {
  workItem: (id: string) =>
    [queryKeys.workItem(id), queryKeys.activity(id)] as const,
};
