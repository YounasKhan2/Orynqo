import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { InlineAlert } from "../../design-system/primitives";
import { WorkItemInspector } from "./WorkItemInspector";
import { WorkItemTable } from "./WorkItemTable";
import { isEditableTarget } from "./keyboard";
import { useWorkItemCollection } from "./queries";

export function WorkItemsPage() {
  const { projectId } = useParams({ from: "/projects/$projectId/issues" });
  const search = useSearch({ from: "/projects/$projectId/issues" });
  const navigate = useNavigate({ from: "/projects/$projectId/issues" });
  const [selectedId, setSelectedId] = useState<string | undefined>(search.selected);
  const lastFocusedId = useRef<string | undefined>();
  const query = useWorkItemCollection({
    projectId,
    search: search.q,
    statusFilter: search.status,
    sort: search.sort,
  });

  const openInspector = (id: string) => {
    lastFocusedId.current = id;
    setSelectedId(id);
    void navigate({ search: (previous) => ({ ...previous, selected: id }), replace: true });
  };
  const closeInspector = () => {
    const restore = lastFocusedId.current ?? selectedId;
    void navigate({ search: (previous) => ({ ...previous, selected: undefined }), replace: true });
    requestAnimationFrame(() => restore && document.querySelector<HTMLElement>(`[data-row-id="${restore}"]`)?.focus());
  };

  useEffect(() => setSelectedId(search.selected), [search.selected]);
  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !search.selected || isEditableTarget(event.target)) return;
      event.preventDefault();
      closeInspector();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  return (
    <div className="work-items-page">
      <header className="project-context">
        <div><span className="eyebrow">Platform Core</span><h1>Issues</h1></div>
        <button className="new-issue" type="button">New issue</button>
      </header>
      <div className="work-toolbar" aria-label="Work Item collection controls">
        <label className="search-field"><Search size={14}/><span className="sr-only">Search Work Items</span><input value={search.q ?? ""} placeholder="Search issues…" onChange={(event) => void navigate({ search: (previous) => ({ ...previous, q: event.target.value || undefined }), replace: true })}/></label>
        <button type="button" className="filter-chip" aria-pressed={search.status === "not-done"} onClick={() => void navigate({ search: (previous) => ({ ...previous, status: previous.status === "all" ? "not-done" : "all" }), replace: true })}>Status ≠ Done</button>
        <select aria-label="Sort Work Items" value={search.sort} onChange={(event) => void navigate({ search: (previous) => ({ ...previous, sort: event.target.value as "key"|"title"|"priority" }), replace: true })}><option value="key">Sort: Key</option><option value="title">Sort: Title</option><option value="priority">Sort: Priority</option></select>
        <span className="collection-count">{query.data?.totalCount.toLocaleString() ?? "—"} issues</span>
      </div>
      <div className={search.selected ? "collection-layout inspector-open" : "collection-layout"}>
        <section className="collection-panel" aria-label="Project Work Items">
          {query.isLoading ? <TableSkeleton /> : query.isError ? <InlineAlert role="alert">Could not load Work Items. Your collection context is preserved.</InlineAlert> : query.data?.items.length === 0 ? <div className="collection-empty"><strong>No Work Items</strong><span>Adjust the current search or filter.</span></div> : query.data ? <>
            {query.data.stale && <InlineAlert>Showing cached data while connectivity is limited.</InlineAlert>}
            <WorkItemTable items={query.data.items} selectedId={selectedId} onSelect={setSelectedId} onOpen={openInspector}/>
          </> : null}
        </section>
        {search.selected && <WorkItemInspector id={search.selected} onClose={closeInspector}/>}
      </div>
    </div>
  );
}

function TableSkeleton() {
  return <div className="table-skeleton" aria-label="Loading Work Items">{Array.from({length:10},(_,i)=><div key={i} className="skeleton-row"><span/><span/><span/><span/></div>)}</div>;
}
