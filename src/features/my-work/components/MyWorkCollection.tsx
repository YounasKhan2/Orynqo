import { WorkItemTable } from "../../work-items/components/WorkItemTable";
import {
  WorkItemCollectionEmpty,
  WorkItemCollectionFailure,
  WorkItemCollectionStale,
} from "../../work-items/components/WorkItemCollection";
import type { MyWorkResult } from "../model";
type Props = {
  data: MyWorkResult;
  selectedWorkItemId?: string | undefined;
  checkedWorkItemIds: ReadonlySet<string>;
  hasActiveFilter: boolean;
  onContextSelect: (id: string) => void;
  onCheckedChange: (id: string, checked: boolean) => void;
  onOpen: (id: string) => void;
  onReset: () => void;
};
export function MyWorkCollection(props: Props) {
  if (props.data.totalCount === 0)
    return (
      <MyWorkEmptyState
        filtered={props.hasActiveFilter}
        onReset={props.onReset}
      />
    );
  return (
    <>
      {props.data.stale && (
        <WorkItemCollectionStale>
          Showing cached My Work. This view may be out of date.
        </WorkItemCollectionStale>
      )}
      <div className="flex min-h-full flex-col">
        {props.data.groups.map((group) => (
          <MyWorkGroup key={group.id} group={group} {...props} />
        ))}
      </div>
    </>
  );
}
function MyWorkGroup({
  group,
  selectedWorkItemId,
  checkedWorkItemIds,
  onContextSelect,
  onCheckedChange,
  onOpen,
}: Props & { group: MyWorkResult["groups"][number] }) {
  return (
    <section
      className="min-h-0 border-b border-[var(--border-subtle)]"
      aria-labelledby={`group-${group.id}`}
    >
      <header className="sticky top-0 z-[2] flex h-[30px] items-center gap-[7px] border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-[10px] sm:static">
        <h2
          id={`group-${group.id}`}
          className="m-0 text-[10px] font-semibold text-[var(--text-secondary)]"
        >
          {group.label}
        </h2>
        <span className="text-[9px] text-[var(--text-tertiary)]">
          {group.items.length}
        </span>
      </header>
      <div className="h-[min(320px,calc(100vh-260px))] min-h-[102px] max-sm:h-[min(360px,calc(100vh-230px))]">
        <WorkItemTable
          ariaLabel={`My Work · ${group.label}`}
          items={group.items}
          selectedWorkItemId={selectedWorkItemId}
          checkedWorkItemIds={checkedWorkItemIds}
          onContextSelect={onContextSelect}
          onCheckedChange={onCheckedChange}
          onOpen={onOpen}
        />
      </div>
    </section>
  );
}
export function MyWorkEmptyState({
  filtered,
  onReset,
}: {
  filtered: boolean;
  onReset: () => void;
}) {
  return (
    <WorkItemCollectionEmpty
      title={filtered ? "No matching Work Items" : "No assigned Work Items yet"}
      description={
        filtered
          ? "Adjust or clear the current search and filters."
          : "Work assigned to you in the Product workspace will appear here."
      }
      action={
        filtered ? (
          <button
            type="button"
            className="h-7 justify-self-center rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-[9px] text-[10px] font-medium text-[var(--text-primary)]"
            onClick={onReset}
          >
            Reset view
          </button>
        ) : undefined
      }
    />
  );
}
export function MyWorkFailure() {
  return (
    <WorkItemCollectionFailure>
      Could not load My Work. Your current view is preserved.
    </WorkItemCollectionFailure>
  );
}
export function MyWorkLoading() {
  return (
    <div className="pt-[30px]" aria-label="Loading My Work">
      <div className="h-[30px] border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)]" />
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className="grid h-[var(--table-row-height)] grid-cols-[76px_1fr_96px_118px] items-center gap-2 border-b border-[var(--border-subtle)] px-2"
        >
          {Array.from({ length: 4 }, (_, j) => (
            <span key={j} className="h-2 rounded bg-[var(--surface-subtle)]" />
          ))}
        </div>
      ))}
    </div>
  );
}
