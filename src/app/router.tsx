import { Navigate, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "./shell";
import { WorkItemsPage } from "../features/work-items/WorkItemsPage";
import { MyWorkPage } from "../features/my-work/MyWorkPage";
import "../features/work-items/work-items.css";

const rootRoute = createRootRoute({ component: () => <AppShell><Outlet /></AppShell> });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/my-work" search={{ status:"not-done",group:"due",sort:"priority" }} />,
});

const workItemsSearch = z.object({
  q: z.string().optional(),
  status: z.enum(["not-done", "all"]).catch("not-done"),
  sort: z.enum(["key", "title", "priority"]).catch("key"),
  selected: z.string().optional(),
});
const myWorkSearch = z.object({
  q: z.string().optional(),
  status: z.enum(["not-done","all"]).catch("not-done"),
  group: z.enum(["due","project"]).catch("due"),
  sort: z.enum(["key","title","priority"]).catch("priority"),
  selected: z.string().optional(),
});

const workItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId/issues",
  validateSearch: (search) => workItemsSearch.parse(search),
  component: WorkItemsPage,
});
const myWorkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-work",
  validateSearch: (search) => myWorkSearch.parse(search),
  component: MyWorkPage,
});

const routeTree = rootRoute.addChildren([indexRoute, myWorkRoute, workItemsRoute]);
export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" { interface Register { router: typeof router; } }
