import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, type KeyboardEvent } from "react";
import type { WorkItemListItem } from "../model";
import { isEditableTarget } from "../keyboard";
const gridTemplate = "30px 76px minmax(220px,1fr) 96px 76px 118px 88px";
type Props = {
  items: readonly WorkItemListItem[];
  selectedWorkItemId?: string | undefined;
  checkedWorkItemIds: ReadonlySet<string>;
  onContextSelect: (id: string) => void;
  onCheckedChange: (id: string, checked: boolean) => void;
  onOpen: (id: string) => void;
  ariaLabel?: string;
};
export function WorkItemTable({
  items,
  selectedWorkItemId,
  checkedWorkItemIds,
  onContextSelect,
  onCheckedChange,
  onOpen,
  ariaLabel = "Project Work Items",
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useMemo<ColumnDef<WorkItemListItem>[]>(
    () => [
      {
        id: "select",
        header: "",
        cell: ({ row }) => (
          <input
            aria-label={`Select ${row.original.key} for bulk actions`}
            type="checkbox"
            checked={checkedWorkItemIds.has(row.original.id)}
            onChange={(e) =>
              onCheckedChange(row.original.id, e.currentTarget.checked)
            }
            onClick={(e) => e.stopPropagation()}
          />
        ),
      },
      { accessorKey: "key", header: "Key" },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "statusLabel", header: "Status" },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => (
          <span className="capitalize">{String(getValue())}</span>
        ),
      },
      { accessorKey: "assigneeLabel", header: "Assignee" },
      { accessorKey: "cycleLabel", header: "Cycle" },
    ],
    [checkedWorkItemIds, onCheckedChange],
  );
  const table = useReactTable({
    data: items as WorkItemListItem[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });
  const rows = table.getRowModel().rows;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
    getItemKey: (index) => rows[index]?.id ?? index,
  });
  const focusIndex = (index: number) => {
    const next = Math.max(0, Math.min(rows.length - 1, index)),
      row = rows[next];
    if (!row) return;
    onContextSelect(row.id);
    virtualizer.scrollToIndex(next, { align: "auto" });
    requestAnimationFrame(() =>
      parentRef.current
        ?.querySelector<HTMLElement>(`[data-row-id="${row.id}"]`)
        ?.focus(),
    );
  };
  const onKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
    id: string,
  ) => {
    if (isEditableTarget(event.target)) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusIndex(index + 1);
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusIndex(index - 1);
    }
    if (event.key === "Enter") {
      event.preventDefault();
      onOpen(id);
    }
  };
  return (
    <div
      className="flex h-full min-w-[704px] flex-col bg-[var(--surface-base)]"
      role="table"
      aria-label={ariaLabel}
      aria-rowcount={rows.length + 1}
    >
      <div
        className="grid h-[30px] flex-none items-center border-b border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-[9px] font-semibold leading-[1.3] text-[var(--text-secondary)]"
        role="row"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {table.getHeaderGroups()[0]?.headers.map((header) => (
          <div
            key={header.id}
            role="columnheader"
            className={`flex h-full min-w-0 items-center overflow-hidden px-2 ${header.id === "title" ? "truncate" : ""}`}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        ))}
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]"
        ref={parentRef}
      >
        <div
          className="relative min-w-[704px]"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualizer.getVirtualItems().map((v) => {
            const row = rows[v.index];
            if (!row) return null;
            const selected = row.id === selectedWorkItemId;
            return (
              <div
                key={row.id}
                role="row"
                aria-selected={selected}
                data-row-id={row.id}
                className="absolute left-0 top-0 grid h-[var(--table-row-height)] w-full items-center border-b border-[var(--border-subtle)] bg-[var(--surface-base)] text-[10px] leading-[1.3] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] aria-selected:bg-[var(--accent-subtle)] aria-selected:shadow-[inset_2px_0_0_var(--accent-default)] focus-visible:z-[2] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                tabIndex={
                  selected || (!selectedWorkItemId && v.index === 0) ? 0 : -1
                }
                style={{
                  gridTemplateColumns: gridTemplate,
                  transform: `translateY(${v.start}px)`,
                }}
                onClick={() => onContextSelect(row.id)}
                onDoubleClick={() => onOpen(row.id)}
                onKeyDown={(e) => onKeyDown(e, v.index, row.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    role="cell"
                    className={`flex h-full min-w-0 items-center overflow-hidden px-2 ${cell.column.id === "title" ? "truncate text-[11px] font-medium text-[var(--text-primary)]" : cell.column.id === "key" ? "text-[11px] font-medium" : ""}`}
                    title={
                      cell.column.id === "title"
                        ? row.original.title
                        : undefined
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
