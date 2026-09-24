import { Search } from "lucide-react";
import type { MyWorkGroupMode, MyWorkSort, MyWorkStatusFilter } from "../model";
type Props = {
  q: string | undefined;
  status: MyWorkStatusFilter;
  group: MyWorkGroupMode;
  sort: MyWorkSort;
  count: number | undefined;
  onStatus: () => void;
  onGroup: (v: MyWorkGroupMode) => void;
  onSort: (v: MyWorkSort) => void;
  onSearch: (v: string) => void;
};
const select =
  "h-[26px] border-0 bg-transparent pr-[7px] text-[var(--text-primary)] outline-0";
export function MyWorkToolbar({
  q,
  status,
  group,
  sort,
  count,
  onStatus,
  onGroup,
  onSort,
  onSearch,
}: Props) {
  return (
    <div
      className="flex h-[42px] items-center gap-2 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--surface-base)] px-[10px]"
      aria-label="My Work collection controls"
    >
      <button
        type="button"
        className="h-7 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-[9px] text-[11px] text-[var(--text-primary)]"
        aria-pressed={status === "not-done"}
        onClick={onStatus}
      >
        Status ≠ Done
      </button>
      {[
        [
          "Group",
          group,
          onGroup,
          [
            ["due", "Due window"],
            ["project", "Project"],
          ],
        ],
        [
          "Sort",
          sort,
          onSort,
          [
            ["priority", "Priority"],
            ["key", "Key"],
            ["title", "Title"],
          ],
        ],
      ].map(([label, value, handler, options]) => (
        <label
          key={label as string}
          className="flex h-7 shrink-0 items-center gap-[5px] rounded-[var(--radius-sm)] border border-[var(--border-subtle)] pl-2 text-[10px] text-[var(--text-tertiary)]"
        >
          <span className="max-sm:hidden">{label as string}</span>
          <select
            className={select}
            aria-label={`${label} My Work`}
            value={value as string}
            onChange={(e) => (handler as (v: string) => void)(e.target.value)}
          >
            {(options as string[][]).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      ))}
      <label className="ml-auto flex h-7 min-w-[150px] items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-2 text-[var(--text-secondary)] max-md:ml-0">
        <Search size={14} />
        <span className="sr-only">Search My Work</span>
        <input
          className="w-full border-0 bg-transparent text-[11px] text-[var(--text-primary)] outline-0"
          value={q ?? ""}
          placeholder="Search issues"
          onChange={(e) => onSearch(e.target.value)}
        />
      </label>
      <span className="text-[10px] text-[var(--text-tertiary)] max-sm:hidden">
        {count ?? "—"} issues
      </span>
    </div>
  );
}
