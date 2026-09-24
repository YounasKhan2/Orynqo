import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";

function GlobalBar(){return <header className="global-bar"><div className="workspace-switcher"><strong>AC</strong><span>Acme Labs / Product</span><span aria-hidden="true">⌄</span></div><div className="global-search"><Search size={14}/><span>Search Product…</span><kbd>⌘ K</kbd></div><div className="global-spacer"/><button aria-label="Help">?</button><button aria-label="Create">＋</button><span className="account-avatar" aria-label="Muhammad Y.">MY</span></header>}
function WorkspaceSidebar(){const pathname=useRouterState({select:s=>s.location.pathname});return <aside className="workspace-sidebar" aria-label="Workspace navigation"><nav><a href="/my-work" className={pathname==="/my-work"?"active":undefined}>⌂&nbsp;&nbsp;My Work</a><a>◉&nbsp;&nbsp;Inbox</a><a href="/projects/platform-core/issues?status=not-done&sort=key" className={pathname.startsWith("/projects/")?"active":undefined}>▣&nbsp;&nbsp;Projects</a><a>◇&nbsp;&nbsp;Teams</a><a>≡&nbsp;&nbsp;Views</a><hr/><span className="nav-label">Favorites</span><a>Platform Core</a></nav></aside>}
export function AppShell({children}:{children:ReactNode}){return <div className="app-shell"><GlobalBar/><WorkspaceSidebar/><main className="app-content">{children}</main></div>}
