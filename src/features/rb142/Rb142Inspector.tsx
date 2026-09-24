import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { IconButton, InlineAlert } from "../../design-system/primitives";
import { isEditableTarget } from "../work-items/keyboard";
import { RB142_COMMENT } from "./model";
import { MutationStateLabel } from "./components/MutationStateLabel";
const inspectorAside =
  "h-full min-w-0 overflow-auto border-l border-[var(--border-subtle)] bg-[var(--surface-base)] max-md:absolute max-md:inset-y-0 max-md:right-0 max-md:z-[5] max-md:w-[min(520px,100%)] max-md:shadow-[-8px_0_24px_rgb(0_0_0/.08)] max-sm:inset-0 max-sm:w-full max-sm:border-l-0";
const sectionClass = "border-b border-[var(--border-subtle)] px-4 py-[14px]";
import { useRb142 } from "./use-rb142";
import { useRb142Snapshot } from "./queries";

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
        event.preventDefault();
        setEditor("priority");
        requestAnimationFrame(() => priorityRef.current?.focus());
      }
      if (event.key.toLowerCase() === "s" && snapshot?.access.changeStatus) {
        event.preventDefault();
        setEditor("status");
        requestAnimationFrame(() => statusRef.current?.focus());
      }
      if (event.key === "Escape" && editor) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setEditor(null);
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [editor, snapshot?.access]);

  if (query.isLoading)
    return <aside className={inspectorAside}>Loading RB-142…</aside>;
  if (!snapshot || query.isError)
    return (
      <aside className={inspectorAside}>
        <InlineAlert role="alert">RB-142 is unavailable.</InlineAlert>
      </aside>
    );
  if (snapshot.unavailable)
    return (
      <aside className={inspectorAside}>
        <header className="flex min-h-[76px] items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-[14px]">
          <h2>RB-142 unavailable</h2>
          <IconButton label="Close Work Item inspector" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </header>
        <InlineAlert role="alert">
          This Work Item was removed or is no longer safely addressable.
        </InlineAlert>
      </aside>
    );

  const item = snapshot.workItem;
  const readOnly = item.lifecycle === "archived";
  const priorityDisplay =
    slice.priorityState.phase === "pending" ||
    slice.priorityState.phase === "offline"
      ? "Urgent"
      : item.priority;
  const statusDisplay =
    slice.statusState.phase === "pending" ||
    slice.statusState.phase === "offline"
      ? "Review"
      : item.statusLabel;

  const submit = async () => {
    if (draft !== RB142_COMMENT || slice.commentState.phase === "pending")
      return;
    const result = await slice.submitComment();
    if (result?.ok) setDraft("");
  };

  return (
    <aside className={inspectorAside} aria-labelledby="inspector-title">
      <header className="flex min-h-[76px] items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-[14px]">
        <div>
          <span className="eyebrow">{item.key}</span>
          <h2 id="inspector-title">{item.title}</h2>
        </div>
        <IconButton label="Close Work Item inspector" onClick={onClose}>
          <X size={16} />
        </IconButton>
      </header>
      {readOnly && (
        <InlineAlert>Archived · This Work Item is read-only.</InlineAlert>
      )}
      {snapshot.access.reason && !snapshot.access.editProperties && (
        <InlineAlert role="alert">{snapshot.access.reason}</InlineAlert>
      )}
      <section className={sectionClass} aria-labelledby="properties-title">
        <h3 id="properties-title">Properties</h3>
        <div className="m-0 grid gap-0.5 [&>div]:relative [&>div]:grid [&>div]:min-h-[30px] [&>div]:grid-cols-[100px_minmax(0,1fr)_auto] [&>div]:items-center">
          <div>
            <span>Priority</span>
            <button
              ref={priorityRef}
              type="button"
              disabled={
                readOnly ||
                !snapshot.access.editProperties ||
                slice.priorityState.phase === "pending"
              }
              onClick={() =>
                setEditor(editor === "priority" ? null : "priority")
              }
              className="min-h-7 rounded-[5px] border border-transparent bg-transparent px-1.5 text-left text-[11px] font-medium text-[var(--text-primary)] capitalize hover:not-disabled:border-[var(--border-subtle)] hover:not-disabled:bg-[var(--surface-subtle)] focus-visible:border-[var(--border-subtle)] focus-visible:bg-[var(--surface-subtle)] disabled:opacity-65"
            >
              {priorityDisplay}
            </button>
            <MutationStateLabel phase={slice.priorityState.phase} />
          </div>
          {editor === "priority" && (
            <div
              className="relative z-[3] col-[2/-1] min-h-0 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-1 shadow-[0_8px_20px_rgb(0_0_0/.08)] [&>button]:h-7 [&>button]:w-full [&>button]:rounded [&>button]:border-0 [&>button]:bg-[var(--accent-subtle)] [&>button]:text-left [&>button]:text-[11px] [&>button]:font-medium [&>button]:text-[var(--text-primary)]"
              role="dialog"
              aria-label="Change Priority"
            >
              <button
                type="button"
                onClick={() => {
                  setEditor(null);
                  void slice.changePriority();
                }}
              >
                Urgent
              </button>
            </div>
          )}
          {slice.priorityState.message && (
            <InlineAlert
              role={
                slice.priorityState.phase === "failure" ? "alert" : "status"
              }
            >
              {slice.priorityState.message}
            </InlineAlert>
          )}
          <div>
            <span>Status</span>
            <button
              ref={statusRef}
              type="button"
              disabled={
                readOnly ||
                !snapshot.access.changeStatus ||
                slice.statusState.phase === "pending"
              }
              onClick={() => setEditor(editor === "status" ? null : "status")}
              className="min-h-7 rounded-[5px] border border-transparent bg-transparent px-1.5 text-left text-[11px] font-medium text-[var(--text-primary)] hover:not-disabled:border-[var(--border-subtle)] hover:not-disabled:bg-[var(--surface-subtle)] focus-visible:border-[var(--border-subtle)] focus-visible:bg-[var(--surface-subtle)] disabled:opacity-65"
            >
              {statusDisplay}
            </button>
            <MutationStateLabel phase={slice.statusState.phase} />
          </div>
          {editor === "status" && (
            <div
              className="relative z-[3] col-[2/-1] min-h-0 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-base)] p-1 shadow-[0_8px_20px_rgb(0_0_0/.08)] [&>button]:h-7 [&>button]:w-full [&>button]:rounded [&>button]:border-0 [&>button]:bg-[var(--accent-subtle)] [&>button]:text-left [&>button]:text-[11px] [&>button]:font-medium [&>button]:text-[var(--text-primary)]"
              role="dialog"
              aria-label="Change Status"
            >
              <button
                type="button"
                onClick={() => {
                  setEditor(null);
                  void slice.transitionStatus();
                }}
              >
                Review
              </button>
            </div>
          )}
          {slice.statusState.message && (
            <InlineAlert role="alert">{slice.statusState.message}</InlineAlert>
          )}
          <div>
            <span>Assignee</span>
            <strong>{item.assigneeLabel}</strong>
          </div>
          <div>
            <span>Cycle</span>
            <strong>{item.cycleLabel}</strong>
          </div>
        </div>
      </section>
      <section className={sectionClass}>
        <h3>Description</h3>
        <p>{item.description}</p>
      </section>
      <section className={sectionClass}>
        <h3>Comments</h3>
        <div className="mb-[10px] grid gap-2">
          {snapshot.comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-subtle)] p-2 [&>strong]:text-[10px] [&>p]:mt-[5px]"
            >
              <strong>Muhammad Y. · just now</strong>
              <p>{comment.body}</p>
            </article>
          ))}
        </div>
        <label className="block overflow-hidden rounded-[7px] border border-[var(--border-subtle)] bg-[var(--surface-base)] focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-[var(--focus-ring)] [&>textarea]:block [&>textarea]:min-h-[76px] [&>textarea]:w-full [&>textarea]:resize-y [&>textarea]:border-0 [&>textarea]:bg-transparent [&>textarea]:p-2 [&>textarea]:text-[11px] [&>textarea]:leading-[1.5] [&>textarea]:text-[var(--text-primary)] [&>textarea]:outline-0 max-sm:[&>textarea]:min-h-24 [&>div]:flex [&>div]:items-center [&>div]:justify-end [&>div]:gap-1.5 [&>div]:border-t [&>div]:border-[var(--border-subtle)] [&>div]:px-1.5 [&>div]:py-[5px] [&_button]:h-[26px] [&_button]:rounded-[5px] [&_button]:border [&_button]:border-[var(--accent-default)] [&_button]:bg-[var(--accent-default)] [&_button]:px-[9px] [&_button]:text-[10px] [&_button]:text-white">
          <span className="sr-only">Add comment</span>
          <textarea
            value={draft}
            disabled={
              readOnly ||
              !snapshot.access.comment ||
              slice.commentState.phase === "pending"
            }
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void submit();
              }
            }}
          />
          <div>
            <MutationStateLabel phase={slice.commentState.phase} />
            <button
              type="button"
              disabled={
                draft !== RB142_COMMENT ||
                readOnly ||
                !snapshot.access.comment ||
                slice.commentState.phase === "pending"
              }
              onClick={() => void submit()}
            >
              Send
            </button>
          </div>
        </label>
        {slice.commentState.message && (
          <InlineAlert role="alert">{slice.commentState.message}</InlineAlert>
        )}
      </section>
      <section className={sectionClass}>
        <h3>Activity</h3>
        <ol className="m-0 grid list-none gap-2 p-0 [&>li]:grid [&>li]:grid-cols-[72px_1fr] [&>li]:gap-2 [&>li]:text-[10px] [&_strong]:text-[var(--text-primary)] [&_span]:text-[var(--text-secondary)]">
          {snapshot.activity.map((activity) => {
            const p = activity.payload as Record<string, string>;
            return (
              <li key={activity.id}>
                <strong>{p.label ?? "Activity"}</strong>
                <span>
                  {p.from && p.to ? `${p.from} → ${p.to}` : (p.body ?? "")}
                </span>
              </li>
            );
          })}
        </ol>
      </section>
    </aside>
  );
}
