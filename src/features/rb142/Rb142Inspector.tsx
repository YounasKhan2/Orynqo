import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { IconButton, InlineAlert } from "../../design-system/primitives";
import { isEditableTarget } from "../work-items/keyboard";
import { RB142_COMMENT } from "./model";
import { useRb142 } from "./use-rb142";
import { useRb142Snapshot } from "./queries";

function StateLabel({ phase }: { phase: string }) {
  if (phase === "idle" || phase === "settled") return null;
  return <span className={`mutation-state mutation-${phase}`} role="status">{phase === "pending" ? "Pending" : phase === "offline" ? "Offline · unacknowledged" : phase}</span>;
}

export function Rb142Inspector({ onClose }: { onClose: () => void }) {
  const query = useRb142Snapshot(true);
  const slice = useRb142(query.data);
  const snapshot = query.data;
  const [draft, setDraft] = useState(RB142_COMMENT);
  const [editor, setEditor] = useState<"priority" | "status" | null>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const statusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key.toLowerCase() === "p" && snapshot?.access.editProperties) {
        event.preventDefault(); setEditor("priority"); requestAnimationFrame(() => priorityRef.current?.focus());
      }
      if (event.key.toLowerCase() === "s" && snapshot?.access.changeStatus) {
        event.preventDefault(); setEditor("status"); requestAnimationFrame(() => statusRef.current?.focus());
      }
      if (event.key === "Escape" && editor) {
        event.preventDefault(); event.stopImmediatePropagation(); setEditor(null);
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [editor, snapshot?.access]);

  if (query.isLoading) return <aside className="work-inspector">Loading RB-142…</aside>;
  if (!snapshot || query.isError) return <aside className="work-inspector"><InlineAlert role="alert">RB-142 is unavailable.</InlineAlert></aside>;
  if (snapshot.unavailable) return <aside className="work-inspector unavailable-panel"><header className="inspector-header"><h2>RB-142 unavailable</h2><IconButton label="Close Work Item inspector" onClick={onClose}><X size={16}/></IconButton></header><InlineAlert role="alert">This Work Item was removed or is no longer safely addressable.</InlineAlert></aside>;

  const item = snapshot.workItem;
  const readOnly = item.lifecycle === "archived";
  const priorityDisplay = slice.priorityState.phase === "pending" || slice.priorityState.phase === "offline" ? "Urgent" : item.priority;
  const statusDisplay = slice.statusState.phase === "pending" || slice.statusState.phase === "offline" ? "Review" : item.statusLabel;

  const submit = async () => {
    if (draft !== RB142_COMMENT || slice.commentState.phase === "pending") return;
    const result = await slice.submitComment();
    if (result?.ok) setDraft("");
  };

  return <aside className="work-inspector rb142-inspector" aria-labelledby="inspector-title">
    <header className="inspector-header"><div><span className="eyebrow">{item.key}</span><h2 id="inspector-title">{item.title}</h2></div><IconButton label="Close Work Item inspector" onClick={onClose}><X size={16}/></IconButton></header>
    {readOnly && <InlineAlert>Archived · This Work Item is read-only.</InlineAlert>}
    {snapshot.access.reason && !snapshot.access.editProperties && <InlineAlert role="alert">{snapshot.access.reason}</InlineAlert>}
    <section className="inspector-section" aria-labelledby="properties-title"><h3 id="properties-title">Properties</h3><div className="property-list">
      <div><span>Priority</span><button ref={priorityRef} type="button" disabled={readOnly || !snapshot.access.editProperties || slice.priorityState.phase === "pending"} onClick={() => setEditor(editor === "priority" ? null : "priority")} className="property-control capitalize">{priorityDisplay}</button><StateLabel phase={slice.priorityState.phase}/></div>
      {editor === "priority" && <div className="property-editor" role="dialog" aria-label="Change Priority"><button type="button" onClick={() => { setEditor(null); void slice.changePriority(); }}>Urgent</button></div>}
      {slice.priorityState.message && <InlineAlert role={slice.priorityState.phase === "failure" ? "alert" : "status"}>{slice.priorityState.message}</InlineAlert>}
      <div><span>Status</span><button ref={statusRef} type="button" disabled={readOnly || !snapshot.access.changeStatus || slice.statusState.phase === "pending"} onClick={() => setEditor(editor === "status" ? null : "status")} className="property-control">{statusDisplay}</button><StateLabel phase={slice.statusState.phase}/></div>
      {editor === "status" && <div className="property-editor" role="dialog" aria-label="Change Status"><button type="button" onClick={() => { setEditor(null); void slice.transitionStatus(); }}>Review</button></div>}
      {slice.statusState.message && <InlineAlert role="alert">{slice.statusState.message}</InlineAlert>}
      <div><span>Assignee</span><strong>{item.assigneeLabel}</strong></div><div><span>Cycle</span><strong>{item.cycleLabel}</strong></div>
    </div></section>
    <section className="inspector-section"><h3>Description</h3><p>{item.description}</p></section>
    <section className="inspector-section"><h3>Comments</h3>
      <div className="comment-list">{snapshot.comments.map((comment) => <article key={comment.id} className="comment"><strong>Muhammad Y. · just now</strong><p>{comment.body}</p></article>)}</div>
      <label className="comment-composer"><span className="sr-only">Add comment</span><textarea value={draft} disabled={readOnly || !snapshot.access.comment || slice.commentState.phase === "pending"} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); void submit(); } }}/><div><StateLabel phase={slice.commentState.phase}/><button type="button" disabled={draft !== RB142_COMMENT || readOnly || !snapshot.access.comment || slice.commentState.phase === "pending"} onClick={() => void submit()}>Send</button></div></label>
      {slice.commentState.message && <InlineAlert role="alert">{slice.commentState.message}</InlineAlert>}
    </section>
    <section className="inspector-section"><h3>Activity</h3><ol className="activity-list">{snapshot.activity.map((activity) => { const p=activity.payload as Record<string,string>; return <li key={activity.id}><strong>{p.label ?? "Activity"}</strong><span>{p.from && p.to ? `${p.from} → ${p.to}` : p.body ?? ""}</span></li>; })}</ol></section>
  </aside>;
}
