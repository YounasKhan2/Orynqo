import type { WorkItem } from "../../domain/contracts";

export type WorkItemListItem = WorkItem & {
  statusLabel: string;
  assigneeLabel: string;
  cycleLabel: string;
};

export type WorkItemCollectionInput = {
  projectId: string;
  search?: string;
  statusFilter?: "not-done" | "all";
  sort?: "key" | "title" | "priority";
};

export type WorkItemCollectionResult = {
  items: readonly WorkItemListItem[];
  totalCount: number;
  stale: boolean;
};

export interface WorkItemCollectionRepository {
  list(input: WorkItemCollectionInput): Promise<WorkItemCollectionResult>;
  getById(id: string): Promise<WorkItemListItem>;
}
