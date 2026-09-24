import type { WorkItemListItem } from "../work-items/model";

export type MyWorkGroupMode = "due" | "project";
export type MyWorkSort = "key" | "title" | "priority";
export type MyWorkStatusFilter = "not-done" | "all";
export type PersonalBucket = "today" | "upcoming";

export type PersonalWorkItem = WorkItemListItem & {
  personalBucket: PersonalBucket;
  projectLabel: string;
};

export type MyWorkInput = {
  userId: string;
  workspaceId: string;
  search?: string;
  statusFilter: MyWorkStatusFilter;
  group: MyWorkGroupMode;
  sort: MyWorkSort;
};

export type MyWorkGroup = {
  id: string;
  label: string;
  items: readonly PersonalWorkItem[];
};

export type MyWorkResult = {
  groups: readonly MyWorkGroup[];
  totalCount: number;
  stale: boolean;
};

export interface MyWorkRepository {
  list(input: MyWorkInput): Promise<MyWorkResult>;
}
