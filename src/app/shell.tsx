import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Menu, Search, X } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

function GlobalBar({ onOpenNavigation }: { onOpenNavigation: () => void }) {
  return (
    <header className="col-span-full flex min-w-0 items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-base)] px-3">
      <button type="button" onClick={onOpenNavigation} className="grid size-8 shrink-0 place-items-center border-0 bg-transparent text-[var(--text-secondary)] md:hidden" aria-label="Open navigation"><Menu size={16} /></button>
      <div className="flex h-8 shrink-0 items-center gap-[7px] rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] px-2 text-ui">
        <strong className="text-caption text-[var(--accent-default)]">AC</strong>
        <span className="max-sm:hidden">Acme Labs / Product</span>
        <span aria-hidden="true">⌄</span>
      </div>
      <div className="flex h-[30px] min-w-0 max-w-[520px] flex-1 items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] px-[10px] text-label text-[var(--text-secondary)] max-sm:hidden">
        <Search size={14} /><span className="min-w-0 flex-1 truncate">Search Product…</span><kbd className="shrink-0 text-caption text-[var(--text-tertiary)]">⌘ K</kbd>
      </div>
      <div className="flex-1" />
      <button className="border-0 bg-transparent text-subheading text-[var(--text-secondary)]" aria-label="Help">?</button>
      <button className="border-0 bg-transparent text-subheading text-[var(--text-secondary)]" aria-label="Create">＋</button>
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--accent-subtle)] text-caption text-[var(--accent-default)]" aria-label="Muhammad Y.">MY</span>
    </header>
  );
}

function WorkspaceSidebar({ compact, drawer, onToggle, onClose }: { compact: boolean; drawer?: boolean; onToggle?: () => void; onClose?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const link = `flex h-8 items-center rounded-[var(--radius-sm)] border border-transparent text-ui text-[var(--text-primary)] no-underline ${compact ? "justify-center px-0" : "px-[10px]"}`;
  const active = " bg-[var(--accent-subtle)] border-[var(--border-subtle)]";
  const labelClass = compact ? "sr-only" : "ml-2";
  return (
    <aside className={`${drawer ? "h-full w-[min(280px,82vw)] shadow-xl" : "relative min-h-0"} overflow-y-auto overflow-x-hidden border-r border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-2 py-[10px]`}>
      {drawer && <button type="button" onClick={onClose} className="mb-2 ml-auto grid size-8 place-items-center border-0 bg-transparent text-[var(--text-secondary)]" aria-label="Close navigation"><X size={16} /></button>}
      {!drawer && onToggle && <button type="button" onClick={onToggle} aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!compact} className="absolute -right-3 top-3 z-20 grid size-6 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] shadow-sm">{compact ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button>}
      <nav className="grid gap-0.5">
        <a href="/my-work" className={link + (pathname === "/my-work" ? active : "")} title={compact ? "My Work" : undefined}>⌂<span className={labelClass}>My Work</span></a>
        <a className={link} title={compact ? "Inbox" : undefined}>◉<span className={labelClass}>Inbox</span></a>
        <a href="/projects/platform-core/issues?status=not-done&sort=key" className={link + (pathname.startsWith("/projects/") ? active : "")} title={compact ? "Projects" : undefined}>▣<span className={labelClass}>Projects</span></a>
        <a className={link} title={compact ? "Teams" : undefined}>◇<span className={labelClass}>Teams</span></a>
        <a className={link} title={compact ? "Views" : undefined}>≡<span className={labelClass}>Views</span></a>
        <hr className="my-[5px] w-full border-0 border-t border-[var(--border-subtle)]" />
        {!compact && <><span className="px-0.5 py-1 text-caption uppercase text-[var(--text-tertiary)]">Favorites</span><a className={link}>Platform Core</a></>}
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [wideCollapsed, setWideCollapsed] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  return (
    <div className={wideCollapsed ? "grid h-screen min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[48px_minmax(0,1fr)] overflow-hidden md:grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[56px_minmax(0,1fr)]" : "grid h-screen min-w-0 grid-cols-[minmax(0,1fr)] grid-rows-[48px_minmax(0,1fr)] overflow-hidden md:grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"}>
      <GlobalBar onOpenNavigation={() => setNavigationOpen(true)} />
      <div className="hidden min-h-0 md:block"><WorkspaceSidebar compact={wideCollapsed} onToggle={() => setWideCollapsed((value) => !value)} /></div>
      <main className="min-h-0 min-w-0 overflow-hidden bg-[var(--surface-base)]">{children}</main>
      {navigationOpen && <div className="fixed inset-0 z-50 bg-black/20 md:hidden" role="presentation" onClick={() => setNavigationOpen(false)}><div className="h-full" onClick={(event) => event.stopPropagation()}><WorkspaceSidebar compact={false} drawer onClose={() => setNavigationOpen(false)} /></div></div>}
    </div>
  );
}
