import type {
  WorkItemCollectionInput,
  WorkItemCollectionRepository,
  WorkItemCollectionResult,
  WorkItemListItem,
} from "./model";
import { rb142DevelopmentServer } from "../rb142/development-server";
const now = "2026-09-24T00:00:00.000Z";
const pinned: WorkItemListItem[] = [
  {
    id: "wi-rb-124",
    key: "RB-124",
    workspaceId: "workspace-product",
    projectId: "platform-core",
    title:
      "Virtualize project issue lists over 5k rows while preserving stable focus, selection and inspector context during realtime reconciliation",
    description: "Long-title regression fixture.",
    statusId: "status-in-progress",
    statusLabel: "In Progress",
    priority: "medium",
    assigneeId: "user-a",
    assigneeLabel: "A. Rivera",
    cycleId: "cycle-08",
    cycleLabel: "Cycle 08",
    milestoneId: null,
    lifecycle: "active",
    version: 3,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "wi-rb-121",
    key: "RB-121",
    workspaceId: "workspace-product",
    projectId: "notifications",
    title: "Group notifications by source entity",
    description:
      "Keep related notification events together without changing source-object ownership.",
    statusId: "status-todo",
    statusLabel: "Todo",
    priority: "medium",
    assigneeId: "user-muhammad-y",
    assigneeLabel: "Muhammad Y.",
    cycleId: "cycle-09",
    cycleLabel: "Cycle 09",
    milestoneId: null,
    lifecycle: "active",
    version: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "wi-rb-205",
    key: "RB-205",
    workspaceId: "workspace-product",
    projectId: "identity-migration",
    title: "Review migration access exceptions",
    description:
      "Resolve the remaining accessible identity migration exceptions.",
    statusId: "status-in-progress",
    statusLabel: "In Progress",
    priority: "urgent",
    assigneeId: "user-muhammad-y",
    assigneeLabel: "Muhammad Y.",
    cycleId: "cycle-08",
    cycleLabel: "Cycle 08",
    milestoneId: null,
    lifecycle: "active",
    version: 4,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "wi-rb-233",
    key: "RB-233",
    workspaceId: "workspace-product",
    projectId: "developer-experience",
    title: "Document local workspace bootstrap",
    description: "Document the supported local workspace bootstrap path.",
    statusId: "status-todo",
    statusLabel: "Todo",
    priority: "low",
    assigneeId: "user-muhammad-y",
    assigneeLabel: "Muhammad Y.",
    cycleId: "cycle-09",
    cycleLabel: "Cycle 09",
    milestoneId: null,
    lifecycle: "active",
    version: 1,
    createdAt: now,
    updatedAt: now,
  },
];
const generated: WorkItemListItem[] = Array.from(
  { length: 5198 },
  (_, index) => {
    const number = 1000 + index;
    const statusLabel =
      index % 9 === 0 ? "Done" : index % 3 === 0 ? "Review" : "In Progress";
    return {
      id: `wi-fixture-${number}`,
      key: `RB-${number}`,
      workspaceId: "workspace-product",
      projectId: "platform-core",
      title: `Platform reliability work item ${number}`,
      description: null,
      statusId:
        statusLabel === "Done"
          ? "status-done"
          : statusLabel === "Review"
            ? "status-review"
            : "status-in-progress",
      statusLabel,
      priority:
        index % 11 === 0 ? "urgent" : index % 2 === 0 ? "high" : "medium",
      assigneeId: "user-fixture",
      assigneeLabel: index % 2 === 0 ? "N. Chen" : "S. Khan",
      cycleId: "cycle-08",
      cycleLabel: "Cycle 08",
      milestoneId: null,
      lifecycle: "active",
      version: 1,
      createdAt: now,
      updatedAt: now,
    } satisfies WorkItemListItem;
  },
);
export function allDevelopmentWorkItems(): WorkItemListItem[] {
  const rb142 = rb142DevelopmentServer.read();
  return rb142.unavailable
    ? [...pinned, ...generated]
    : [rb142.workItem, ...pinned, ...generated];
}
export class DevelopmentWorkItemRepository implements WorkItemCollectionRepository {
  async list(
    input: WorkItemCollectionInput,
  ): Promise<WorkItemCollectionResult> {
    await Promise.resolve();
    const search = input.search?.trim().toLowerCase();
    let items = allDevelopmentWorkItems().filter(
      (i) => i.projectId === input.projectId,
    );
    if (input.statusFilter !== "all")
      items = items.filter((i) => i.statusLabel !== "Done");
    if (search)
      items = items.filter(
        (i) =>
          i.key.toLowerCase().includes(search) ||
          i.title.toLowerCase().includes(search),
      );
    items = [...items].sort((a, b) =>
      input.sort === "title"
        ? a.title.localeCompare(b.title)
        : input.sort === "priority"
          ? a.priority.localeCompare(b.priority)
          : a.key.localeCompare(b.key, undefined, { numeric: true }),
    );
    return { items, totalCount: items.length, stale: false };
  }
  async getById(id: string): Promise<WorkItemListItem> {
    await Promise.resolve();
    const item = allDevelopmentWorkItems().find((c) => c.id === id);
    if (!item) throw new Error("Work Item not found");
    return item;
  }
}
export const workItemRepository: WorkItemCollectionRepository =
  new DevelopmentWorkItemRepository();
