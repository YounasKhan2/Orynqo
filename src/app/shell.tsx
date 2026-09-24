import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

function GlobalBar() {
  return (
    <header className="col-span-full flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-base)] px-3">
      <div className="flex h-8 items-center gap-[7px] rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] px-2 text-ui">
        <strong className="text-caption text-[var(--accent-default)]">AC</strong>
        <span className="max-sm:hidden">Acme Labs / Product</span>
        <span aria-hidden="true">⌄</span>
      </div>
      <div className="flex h-[30px] w-[min(520px,42vw)] items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] px-[10px] text-label text-[var(--text-secondary)] max-sm:hidden md:w-[min(420px,45vw)]">
        <Search size={14} />
        <span className="flex-1">Search Product…</span>
        <kbd className="text-caption text-[var(--text-tertiary)]">⌘ K</kbd>
      </div>
      <div className="flex-1" />
      <button className="border-0 bg-transparent text-subheading text-[var(--text-secondary)]" aria-label="Help">?</button>
      <button className="border-0 bg-transparent text-subheading text-[var(--text-secondary)]" aria-label="Create">＋</button>
      <span className="grid size-7 place-items-center rounded-full bg-[var(--accent-subtle)] text-caption text-[var(--accent-default)]" aria-label="Muhammad Y.">MY</span>
    </header>
  );
}

function WorkspaceSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const link = `flex h-8 items-center rounded-[var(--radius-sm)] border border-transparent text-ui text-[var(--text-primary)] no-underline ${collapsed ? "justify-center px-0" : "px-[10px]"}`;
  const active = " bg-[var(--accent-subtle)] border-[var(--border-subtle)]";
  const labelClass = collapsed ? "sr-only" : "ml-2";

  return (
    <aside className="relative min-h-0 overflow-visible border-r border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-2 py-[10px] max-md:hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-3 z-20 grid size-6 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface-base)] text-[var(--text-secondary)] shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
      <nav className="grid gap-0.5">
        <a href="/my-work" className={link + (pathname === "/my-work" ? active : "")} title={collapsed ? "My Work" : undefined}>⌂<span className={labelClass}>My Work</span></a>
        <a className={link} title={collapsed ? "Inbox" : undefined}>◉<span className={labelClass}>Inbox</span></a>
        <a href="/projects/platform-core/issues?status=not-done&sort=key" className={link + (pathname.startsWith("/projects/") ? active : "")} title={collapsed ? "Projects" : undefined}>▣<span className={labelClass}>Projects</span></a>
        <a className={link} title={collapsed ? "Teams" : undefined}>◇<span className={labelClass}>Teams</span></a>
        <a className={link} title={collapsed ? "Views" : undefined}>≡<span className={labelClass}>Views</span></a>
        <hr className="my-[5px] w-full border-0 border-t border-[var(--border-subtle)]" />
        {!collapsed && <span className="px-0.5 py-1 text-caption uppercase text-[var(--text-tertiary)]">Favorites</span>}
        {!collapsed && <a className={link}>Platform Core</a>}
      </nav>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div
      className={`grid h-screen grid-rows-[48px_minmax(0,1fr)] overflow-hidden md:grid-cols-1 ${sidebarCollapsed ? "grid-cols-[56px_minmax(0,1fr)]" : "grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"}`}
    >
      <GlobalBar />
      <WorkspaceSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
      <main className="min-h-0 min-w-0 overflow-hidden bg-[var(--surface-base)]">{children}</main>
    </div>
  );
}
