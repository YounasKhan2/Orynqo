import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
function GlobalBar() {
  return (
    <header className="col-span-full flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-base)] px-3">
      <div className="flex h-8 items-center gap-[7px] rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] px-2 text-[13px]">
        <strong className="text-[11px] text-[var(--accent-default)]">AC</strong>
        <span className="max-sm:hidden">Acme Labs / Product</span>
        <span aria-hidden="true">⌄</span>
      </div>
      <div className="flex h-[30px] w-[min(520px,42vw)] items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--surface-subtle)] px-[10px] text-xs text-[var(--text-secondary)] md:w-[min(420px,45vw)] max-sm:hidden">
        <Search size={14} />
        <span className="flex-1">Search Product…</span>
        <kbd className="text-[10px] font-medium text-[var(--text-tertiary)]">
          ⌘ K
        </kbd>
      </div>
      <div className="flex-1" />
      <button
        className="border-0 bg-transparent text-sm text-[var(--text-secondary)]"
        aria-label="Help"
      >
        ?
      </button>
      <button
        className="border-0 bg-transparent text-sm text-[var(--text-secondary)]"
        aria-label="Create"
      >
        ＋
      </button>
      <span
        className="grid size-7 place-items-center rounded-full bg-[var(--accent-subtle)] text-[10px] font-semibold text-[var(--accent-default)]"
        aria-label="Muhammad Y."
      >
        MY
      </span>
    </header>
  );
}
function WorkspaceSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const link =
    "flex h-8 items-center rounded-[var(--radius-sm)] border border-transparent px-[10px] text-[13px] text-[var(--text-primary)] no-underline lg:justify-center lg:px-0 lg:text-0";
  const active = " bg-[var(--accent-subtle)] border-[var(--border-subtle)]";
  return (
    <aside className="min-h-0 overflow-auto border-r border-[var(--border-subtle)] bg-[var(--surface-subtle)] px-2 py-[10px] max-md:hidden">
      <nav className="grid gap-0.5">
        <a
          href="/my-work"
          className={link + (pathname === "/my-work" ? active : "")}
        >
          ⌂<span className="ml-2 lg:hidden">My Work</span>
        </a>
        <a className={link}>
          ◉<span className="ml-2 lg:hidden">Inbox</span>
        </a>
        <a
          href="/projects/platform-core/issues?status=not-done&sort=key"
          className={link + (pathname.startsWith("/projects/") ? active : "")}
        >
          ▣<span className="ml-2 lg:hidden">Projects</span>
        </a>
        <a className={link}>
          ◇<span className="ml-2 lg:hidden">Teams</span>
        </a>
        <a className={link}>
          ≡<span className="ml-2 lg:hidden">Views</span>
        </a>
        <hr className="my-[5px] w-full border-0 border-t border-[var(--border-subtle)]" />
        <span className="px-0.5 py-1 text-[10px] font-semibold uppercase text-[var(--text-tertiary)] lg:hidden">
          Favorites
        </span>
        <a className={link}>
          <span className="lg:hidden">Platform Core</span>
        </a>
      </nav>
    </aside>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-screen grid-cols-[var(--sidebar-width)_minmax(0,1fr)] grid-rows-[48px_minmax(0,1fr)] overflow-hidden lg:grid-cols-[56px_minmax(0,1fr)] md:grid-cols-1">
      <GlobalBar />
      <WorkspaceSidebar />
      <main className="min-h-0 min-w-0 overflow-hidden bg-[var(--surface-base)]">
        {children}
      </main>
    </div>
  );
}
