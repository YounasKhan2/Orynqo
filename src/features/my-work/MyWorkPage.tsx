import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { InlineAlert } from "../../design-system/primitives";
import { Rb142Inspector } from "../rb142/Rb142Inspector";
import { WorkItemInspector } from "../work-items/WorkItemInspector";
import { WorkItemTable } from "../work-items/WorkItemTable";
import { isEditableTarget } from "../work-items/keyboard";
import { useMyWork } from "./queries";
import "./my-work.css";

const CURRENT_USER_ID = "user-muhammad-y";
const PRODUCT_WORKSPACE_ID = "workspace-product";

export function MyWorkPage() {
  const search = useSearch({ from: "/my-work" });
  const navigate = useNavigate({ from: "/my-work" });
  const [selectedWorkItemId, setSelectedWorkItemId] = useState<string | undefined>(search.selected);
  const [checkedWorkItemIds, setCheckedWorkItemIds] = useState<Set<string>>(() => new Set());
  const lastFocusedId = useRef<string | undefined>();
  const query = useMyWork({
    userId: CURRENT_USER_ID,
    workspaceId: PRODUCT_WORKSPACE_ID,
    search: search.q,
    statusFilter: search.status,
    group: search.group,
    sort: search.sort,
  });

  const openInspector = (id: string) => {
    lastFocusedId.current = id;
    setSelectedWorkItemId(id);
    void navigate({ search: (previous) => ({ ...previous, selected: id }), replace: true });
  };
  const closeInspector = () => {
    const restore = lastFocusedId.current ?? selectedWorkItemId;
    void navigate({ search: (previous) => ({ ...previous, selected: undefined }), replace: true });
    requestAnimationFrame(() => restore && document.querySelector<HTMLElement>(`[data-row-id="${restore}"]`)?.focus());
  };
  const setChecked = (id: string, checked: boolean) =>
    setCheckedWorkItemIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });

  useEffect(() => setSelectedWorkItemId(search.selected), [search.selected]);
  useEffect(() => {
    const handler = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !search.selected || isEditableTarget(event.target)) return;
      event.preventDefault();
      closeInspector();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const hasActiveFilter = Boolean(search.q) || search.status !== "not-done";

  return <div className="work-items-page my-work-page">
    <header className="project-context my-work-context">
      <div><span className="eyebrow">Personal retrieval</span><h1>My Work</h1><p>Assigned to me · Product workspace</p></div>
    </header>
    <div className="work-toolbar" aria-label="My Work collection controls">
      <button type="button" className="filter-chip" aria-pressed={search.status === "not-done"} onClick={() => void navigate({ search: (previous) => ({ ...previous, status: previous.status === "all" ? "not-done" : "all" }), replace: true })}>Status ≠ Done</button>
      <label className="my-work-control"><span>Group</span><select aria-label="Group My Work" value={search.group} onChange={(event) => void navigate({ search: (previous) => ({ ...previous, group: event.target.value as "due"|"project" }), replace: true })}><option value="due">Due window</option><option value="project">Project</option></select></label>
      <label className="my-work-control"><span>Sort</span><select aria-label="Sort My Work" value={search.sort} onChange={(event) => void navigate({ search: (previous) => ({ ...previous, sort: event.target.value as "key"|"title"|"priority" }), replace: true })}><option value="priority">Priority</option><option value="key">Key</option><option value="title">Title</option></select></label>
      <label className="search-field my-work-search"><Search size={14}/><span className="sr-only">Search My Work</span><input value={search.q ?? ""} placeholder="Search issues" onChange={(event) => void navigate({ search: (previous) => ({ ...previous, q: event.target.value || undefined }), replace: true })}/></label>
      <span className="collection-count">{query.data?.totalCount ?? "—"} issues</span>
    </div>
    <div className={search.selected ? "collection-layout inspector-open" : "collection-layout"}>
      <section className="collection-panel my-work-collection" aria-label="My Work">
        {query.isLoading ? <MyWorkSkeleton/> : query.isError ? <InlineAlert role="alert">Could not load My Work. Your current view is preserved.</InlineAlert> : query.data?.totalCount === 0 ? <div className="collection-empty"><strong>{hasActiveFilter ? "No matching Work Items" : "No assigned Work Items yet"}</strong><span>{hasActiveFilter ? "Adjust or clear the current search and filters." : "Work assigned to you in the Product workspace will appear here."}</span>{hasActiveFilter && <button type="button" className="reset-view" onClick={() => void navigate({ search: { status:"not-done",group:"due",sort:"priority" }, replace:true })}>Reset view</button>}</div> : query.data ? <>
          {query.data.stale && <InlineAlert>Showing cached My Work. This view may be out of date.</InlineAlert>}
          <div className="my-work-groups">
            {query.data.groups.map((group) => <section className="my-work-group" key={group.id} aria-labelledby={`group-${group.id}`}><header><h2 id={`group-${group.id}`}>{group.label}</h2><span>{group.items.length}</span></header><div className="my-work-table"><WorkItemTable ariaLabel={`My Work · ${group.label}`} items={group.items} selectedWorkItemId={selectedWorkItemId} checkedWorkItemIds={checkedWorkItemIds} onContextSelect={setSelectedWorkItemId} onCheckedChange={setChecked} onOpen={openInspector}/></div></section>)}
          </div>
        </> : null}
      </section>
      {search.selected === "wi-rb-142" ? <Rb142Inspector onClose={closeInspector}/> : search.selected ? <WorkItemInspector id={search.selected} onClose={closeInspector}/> : null}
    </div>
  </div>;
}

function MyWorkSkeleton(){return <div className="my-work-skeleton" aria-label="Loading My Work"><div className="group-skeleton"/>{Array.from({length:7},(_,i)=><div key={i} className="skeleton-row"><span/><span/><span/><span/></div>)}</div>}
