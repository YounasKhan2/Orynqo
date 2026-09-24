import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Rb142Inspector } from "../rb142/Rb142Inspector";
import { WorkItemInspector } from "./components/WorkItemInspector";
import { WorkItemTable } from "./components/WorkItemTable";
import {
  WorkItemCollectionEmpty,
  WorkItemCollectionFailure,
  WorkItemCollectionLayout,
  WorkItemCollectionLoading,
  WorkItemCollectionStale,
} from "./components/WorkItemCollection";
import { isEditableTarget } from "./keyboard";
import { useWorkItemCollection } from "./queries";
export function WorkItemsPage() {
  const { projectId } = useParams({ from: "/projects/$projectId/issues" }),
    search = useSearch({ from: "/projects/$projectId/issues" }),
    navigate = useNavigate({ from: "/projects/$projectId/issues" });
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<
      string | undefined
    >(search.selected),
    [checkedWorkItemIds, setCheckedWorkItemIds] = useState<Set<string>>(
      () => new Set(),
    ),
    lastFocusedId = useRef<string | undefined>(undefined);
  const query = useWorkItemCollection({
    projectId,
    ...(search.q === undefined ? {} : { search: search.q }),
    statusFilter: search.status,
    sort: search.sort,
  });
  const setChecked = (id: string, checked: boolean) =>
    setCheckedWorkItemIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const openInspector = (id: string) => {
    lastFocusedId.current = id;
    setSelectedWorkItemId(id);
    void navigate({ search: (p) => ({ ...p, selected: id }), replace: true });
  };
  const closeInspector = () => {
    const restore = lastFocusedId.current ?? selectedWorkItemId;
    void navigate({
      search: (p) => ({ ...p, selected: undefined }),
      replace: true,
    });
    requestAnimationFrame(
      () =>
        restore &&
        document
          .querySelector<HTMLElement>(`[data-row-id="${restore}"]`)
          ?.focus(),
    );
  };
  useEffect(() => setSelectedWorkItemId(search.selected), [search.selected]);
  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        !search.selected ||
        isEditableTarget(event.target)
      )
        return;
      event.preventDefault();
      closeInspector();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  const inspector =
    search.selected === "wi-rb-142" ? (
      <Rb142Inspector onClose={closeInspector} />
    ) : search.selected ? (
      <WorkItemInspector id={search.selected} onClose={closeInspector} />
    ) : undefined;
  return (
    <div className="flex h-[calc(100vh-48px)] min-h-[520px] flex-col overflow-hidden bg-[var(--surface-base)]">
      <header className="flex h-[58px] items-center justify-between border-b border-[var(--border-subtle)] px-3 max-sm:h-[52px]">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[.04em] text-[var(--text-tertiary)]">
            Platform Core
          </span>
          <h1 className="mt-0.5 mb-0 text-base leading-[1.2]">Issues</h1>
        </div>
        <button
          className="h-8 rounded-[var(--radius-sm)] border border-[var(--accent-default)] bg-[var(--accent-default)] px-[10px] text-xs font-medium text-white"
          type="button"
        >
          New issue
        </button>
      </header>
      <div
        className="flex h-[42px] items-center gap-2 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--surface-base)] px-[10px]"
        aria-label="Work Item collection controls"
      >
        <label className="flex h-7 min-w-[180px] items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-2 text-[var(--text-secondary)]">
          <Search size={14} />
          <span className="sr-only">Search Work Items</span>
          <input
            className="w-full border-0 bg-transparent text-[11px] text-[var(--text-primary)] outline-0"
            value={search.q ?? ""}
            placeholder="Search issues…"
            onChange={(e) =>
              void navigate({
                search: (p) => ({ ...p, q: e.target.value || undefined }),
                replace: true,
              })
            }
          />
        </label>
        <button
          type="button"
          className="h-7 shrink-0 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-[9px] text-[11px] text-[var(--text-primary)]"
          aria-pressed={search.status === "not-done"}
          onClick={() =>
            void navigate({
              search: (p) => ({
                ...p,
                status: p.status === "all" ? "not-done" : "all",
              }),
              replace: true,
            })
          }
        >
          Status ≠ Done
        </button>
        <select
          className="h-7 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] px-[9px] text-[11px] text-[var(--text-primary)]"
          aria-label="Sort Work Items"
          value={search.sort}
          onChange={(e) =>
            void navigate({
              search: (p) => ({
                ...p,
                sort: e.target.value as "key" | "title" | "priority",
              }),
              replace: true,
            })
          }
        >
          <option value="key">Sort: Key</option>
          <option value="title">Sort: Title</option>
          <option value="priority">Sort: Priority</option>
        </select>
        <span className="ml-auto text-[10px] text-[var(--text-tertiary)] max-sm:hidden">
          {query.data?.totalCount.toLocaleString() ?? "—"} issues
        </span>
      </div>
      <WorkItemCollectionLayout
        inspectorOpen={Boolean(search.selected)}
        inspector={inspector}
      >
        {query.isLoading ? (
          <WorkItemCollectionLoading />
        ) : query.isError ? (
          <WorkItemCollectionFailure />
        ) : query.data?.items.length === 0 ? (
          <WorkItemCollectionEmpty
            title="No Work Items"
            description="Adjust the current search or filter."
          />
        ) : query.data ? (
          <>
            {query.data.stale && (
              <WorkItemCollectionStale>
                Showing cached data while connectivity is limited.
              </WorkItemCollectionStale>
            )}
            <WorkItemTable
              items={query.data.items}
              selectedWorkItemId={selectedWorkItemId}
              checkedWorkItemIds={checkedWorkItemIds}
              onContextSelect={setSelectedWorkItemId}
              onCheckedChange={setChecked}
              onOpen={openInspector}
            />
          </>
        ) : null}
      </WorkItemCollectionLayout>
    </div>
  );
}
