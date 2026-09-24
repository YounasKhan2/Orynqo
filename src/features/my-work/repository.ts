import { allDevelopmentWorkItems } from "../work-items/fixture-repository";
import type {
  MyWorkInput,
  MyWorkRepository,
  MyWorkResult,
  PersonalWorkItem,
} from "./model";

const personalMetadata: Record<
  string,
  Pick<PersonalWorkItem, "personalBucket" | "projectLabel">
> = {
  "wi-rb-142": { personalBucket: "today", projectLabel: "Platform Core" },
  "wi-rb-121": { personalBucket: "upcoming", projectLabel: "Notifications" },
  "wi-rb-205": { personalBucket: "today", projectLabel: "Identity Migration" },
  "wi-rb-233": {
    personalBucket: "upcoming",
    projectLabel: "Developer Experience",
  },
};

const priorityRank = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
} as const;

export class DevelopmentMyWorkRepository implements MyWorkRepository {
  async list(input: MyWorkInput): Promise<MyWorkResult> {
    await Promise.resolve();
    const search = input.search?.trim().toLowerCase();
    let items = allDevelopmentWorkItems()
      .filter(
        (item) =>
          item.workspaceId === input.workspaceId &&
          item.assigneeId === input.userId &&
          Boolean(personalMetadata[item.id]),
      )
      .map(
        (item) =>
          ({ ...item, ...personalMetadata[item.id] }) as PersonalWorkItem,
      );

    if (input.statusFilter === "not-done") {
      items = items.filter((item) => item.statusLabel !== "Done");
    }
    if (search) {
      items = items.filter(
        (item) =>
          item.key.toLowerCase().includes(search) ||
          item.title.toLowerCase().includes(search) ||
          item.projectLabel.toLowerCase().includes(search),
      );
    }

    items = [...items].sort((a, b) => {
      if (input.sort === "title") return a.title.localeCompare(b.title);
      if (input.sort === "priority") {
        return (
          priorityRank[a.priority] - priorityRank[b.priority] ||
          a.key.localeCompare(b.key, undefined, { numeric: true })
        );
      }
      return a.key.localeCompare(b.key, undefined, { numeric: true });
    });

    const groupOrder =
      input.group === "due"
        ? ["today", "upcoming"]
        : [...new Set(items.map((item) => item.projectId))];

    const groups = groupOrder
      .map((groupId) => {
        const groupItems = items.filter((item) =>
          input.group === "due"
            ? item.personalBucket === groupId
            : item.projectId === groupId,
        );
        const label =
          input.group === "due"
            ? groupId === "today"
              ? "Today"
              : "Upcoming"
            : (groupItems[0]?.projectLabel ?? groupId);
        return { id: groupId, label, items: groupItems };
      })
      .filter((group) => group.items.length > 0);

    return { groups, totalCount: items.length, stale: false };
  }
}

export const myWorkRepository: MyWorkRepository =
  new DevelopmentMyWorkRepository();
