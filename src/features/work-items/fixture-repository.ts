import type {
  WorkItemCollectionInput,
  WorkItemCollectionRepository,
  WorkItemCollectionResult,
  WorkItemListItem,
} from "./model";

const now = "2026-09-24T00:00:00.000Z";

const pinned: WorkItemListItem[] = [
  {
    id: "wi-rb-142",
    key: "RB-142",
    workspaceId: "workspace-product",
    projectId: "platform-core",
    title: "Add workspace-level role inheritance",
    description: "Preserve inherited workspace capabilities while respecting explicit project restrictions.",
    statusId: "status-in-progress",
    statusLabel: "In Progress",
    priority: "high",
    assigneeId: "user-muhammad-y",
    assigneeLabel: "Muhammad Y.",
    cycleId: "cycle-08",
    cycleLabel: "Cycle 08",
    milestoneId: null,
    lifecycle: "active",
    version: 7,
    createdAt: now,
    updatedAt: now,
  },
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
];

const generated: WorkItemListItem[] = Array.from({ length: 5198 }, (_, index) => {
  const number = 1000 + index;
  const statusLabel = index % 9 === 0 ? "Done" : index % 3 === 0 ? "Review" : "In Progress";
  return {
    id: `wi-fixture-${number}`,
    key: `RB-${number}`,
    workspaceId: "workspace-product",
    projectId: "platform-core",
    title: `Platform reliability work item ${number}`,
    description: null,
    statusId: statusLabel === "Done" ? "status-done" : statusLabel === "Review" ? "status-review" : "status-in-progress",
    statusLabel,
    priority: index % 11 === 0 ? "urgent" : index % 2 === 0 ? "high" : "medium",
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
});

const allItems = [...pinned, ...generated];

export class DevelopmentWorkItemRepository implements WorkItemCollectionRepository {
  async list(input: WorkItemCollectionInput): Promise<WorkItemCollectionResult> {
    await Promise.resolve();
    const search = input.search?.trim().toLowerCase();
    let items = allItems.filter((item) => item.projectId === input.projectId);
    if (input.statusFilter !== "all") items = items.filter((item) => item.statusLabel !== "Done");
    if (search) items = items.filter((item) => item.key.toLowerCase().includes(search) || item.title.toLowerCase().includes(search));
    items = [...items].sort((a, b) => {
      if (input.sort === "title") return a.title.localeCompare(b.title);
      if (input.sort === "priority") return a.priority.localeCompare(b.priority);
      return a.key.localeCompare(b.key, undefined, { numeric: true });
    });
    return { items, totalCount: items.length, stale: false };
  }

  async getById(id: string): Promise<WorkItemListItem> {
    await Promise.resolve();
    const item = allItems.find((candidate) => candidate.id === id);
    if (!item) throw new Error("Work Item not found");
    return item;
  }
}

/**
 * Gate-2 development adapter only. It is typed against the production query
 * contract and is intentionally isolated so it cannot be mistaken for Appwrite
 * authorization or production persistence.
 */
export const workItemRepository: WorkItemCollectionRepository =
  new DevelopmentWorkItemRepository();
