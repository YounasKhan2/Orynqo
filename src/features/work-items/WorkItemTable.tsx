import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, type KeyboardEvent } from "react";
import type { WorkItemListItem } from "./model";
import { isEditableTarget } from "./keyboard";

const gridTemplate = "30px 76px minmax(220px,1fr) 96px 76px 118px 88px";

type Props = {
  items: readonly WorkItemListItem[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
};

export function WorkItemTable({ items, selectedId, onSelect, onOpen }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columns = useMemo<ColumnDef<WorkItemListItem>[]>(() => [
    { id: "select", header: "", cell: ({ row }) => <input aria-label={`Select ${row.original.key}`} type="checkbox" checked={row.original.id === selectedId} readOnly /> },
    { accessorKey: "key", header: "Key" },
    { accessorKey: "title", header: "Title" },
    { accessorKey: "statusLabel", header: "Status" },
    { accessorKey: "priority", header: "Priority", cell: ({ getValue }) => <span className="capitalize">{String(getValue())}</span> },
    { accessorKey: "assigneeLabel", header: "Assignee" },
    { accessorKey: "cycleLabel", header: "Cycle" },
  ], [selectedId]);

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
    const next = Math.max(0, Math.min(rows.length - 1, index));
    const row = rows[next];
    if (!row) return;
    onSelect(row.id);
    virtualizer.scrollToIndex(next, { align: "auto" });
    requestAnimationFrame(() => parentRef.current?.querySelector<HTMLElement>(`[data-row-id="${row.id}"]`)?.focus());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number, id: string) => {
    if (isEditableTarget(event.target)) return;
    if (event.key === "ArrowDown") { event.preventDefault(); focusIndex(index + 1); }
    if (event.key === "ArrowUp") { event.preventDefault(); focusIndex(index - 1); }
    if (event.key === "Enter") { event.preventDefault(); onOpen(id); }
  };

  return (
    <div className="work-table-frame" role="table" aria-label="Project Work Items" aria-rowcount={rows.length + 1}>
      <div className="work-table-header" role="row" style={{ gridTemplateColumns: gridTemplate }}>
        {table.getHeaderGroups()[0]?.headers.map((header) => (
          <div key={header.id} role="columnheader" className={header.id === "title" ? "title-cell" : ""}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </div>
        ))}
      </div>
      <div className="work-table-scroll" ref={parentRef}>
        <div className="work-table-virtual" style={{ height: virtualizer.getTotalSize() }}>
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            const selected = row.id === selectedId;
            return (
              <div
                key={row.id}
                role="row"
                aria-selected={selected}
                data-row-id={row.id}
                className="work-table-row"
                tabIndex={selected || (!selectedId && virtualRow.index === 0) ? 0 : -1}
                style={{ gridTemplateColumns: gridTemplate, transform: `translateY(${virtualRow.start}px)` }}
                onClick={() => onSelect(row.id)}
                onDoubleClick={() => onOpen(row.id)}
                onKeyDown={(event) => onKeyDown(event, virtualRow.index, row.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} role="cell" className={cell.column.id === "title" ? "title-cell" : ""} title={cell.column.id === "title" ? row.original.title : undefined}>
                    {flexRender(cell.column.columnDef.cell ?? cell.column.columnDef.accessorKey, cell.getContext())}
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
