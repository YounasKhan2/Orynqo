import { X } from "lucide-react";
import { IconButton, InlineAlert } from "../../design-system/primitives";
import { useWorkItem } from "./queries";

export function WorkItemInspector({ id, onClose }: { id: string; onClose: () => void }) {
  const query = useWorkItem(id);
  if (query.isLoading) return <aside className="work-inspector" aria-label="Loading Work Item"><div className="inspector-skeleton">Loading Work Item…</div></aside>;
  if (query.isError || !query.data) return <aside className="work-inspector" aria-label="Work Item"><InlineAlert role="alert">Unable to load this Work Item.</InlineAlert></aside>;

  const item = query.data;
  return (
    <aside className="work-inspector" aria-labelledby="inspector-title">
      <header className="inspector-header">
        <div><span className="eyebrow">{item.key}</span><h2 id="inspector-title">{item.title}</h2></div>
        <IconButton label="Close Work Item inspector" onClick={onClose}><X size={16} /></IconButton>
      </header>
      <section className="inspector-section" aria-labelledby="properties-title">
        <h3 id="properties-title">Properties</h3>
        <dl className="property-list">
          <div><dt>Status</dt><dd>{item.statusLabel}</dd></div>
          <div><dt>Priority</dt><dd className="capitalize">{item.priority}</dd></div>
          <div><dt>Assignee</dt><dd>{item.assigneeLabel}</dd></div>
          <div><dt>Cycle</dt><dd>{item.cycleLabel}</dd></div>
        </dl>
      </section>
      <section className="inspector-section"><h3>Description</h3><p>{item.description ?? "No description."}</p></section>
      <section className="inspector-section"><h3>Relationships</h3><p className="muted">No linked items in this fixture.</p></section>
      <section className="inspector-section"><h3>Comments</h3><p className="muted">Comment submission is intentionally deferred to the Golden Flow gate.</p></section>
      <section className="inspector-section"><h3>Activity</h3><p className="muted">Activity remains separate from comments and audit evidence.</p></section>
    </aside>
  );
}
