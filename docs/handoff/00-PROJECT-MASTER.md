# Orynqo — Project Master

> Canonical first-read for any agent joining Orynqo. Read this before acting.

## Product
Orynqo is a large-scale collaborative work/project-management platform. The product direction is compact, mature, keyboard-friendly productivity software with information density comparable to tools such as Notion/Linear without cloning them.

## Sources of truth
- Repository: `YounasKhan2/Orynqo`
- Figma file key: `c3gkf8389lOXtHCaOUhlhm`
- Current design validation page: `29 Design Validation Pass 01`, node `61:2`, board `61:3`
- This handoff pack: `docs/handoff/`
- Deeper implementation blueprint: existing Orynqo implementation blueprint/docs in the repository when present.

Chats are working sessions, not the durable project record. Git + Figma + approved handoff documents are authoritative.

## Current product architecture
Five independent access dimensions: containment, ownership, membership, visibility, permission scope.

- Organization: governance/billing/security boundary.
- Workspace: primary collaboration/data boundary; belongs to one Organization.
- Workspace membership is explicit; Organization membership does not imply cross-workspace access.
- Team: belongs to one Workspace; Public or Private.
- Guest: workspace-scoped external principal with explicitly granted project/resource access.
- Project: belongs to one Workspace; may associate one primary Team.
- Project visibility: Workspace-visible, Team-visible, Private/restricted.
- Work Item: belongs to one Project; one primary assignee. Creator, assignee, watchers and project owner are distinct concepts.
- Subtask: parent-child Work Item.
- Typed links: relates-to, duplicates, blocks/blocked-by.
- Team-owned workflows; Projects inherit the primary Team workflow.
- Cycle/Sprint: Team-owned. Milestone: Workspace-owned.
- Saved Views store query/filter/sort/group/columns/density; sharing never grants record access.
- Activity is human-readable object history. Audit is governance/security evidence. They are separate.
- Lifecycle: Active → Archived / Trash → Purged according to privilege and retention semantics.

Authorization order:
`identity → membership/scope → visibility → role/capability → explicit grant/restriction → resource state`.

## Frozen UX principles
- 4px base; 8px primary rhythm.
- Desktop reference 1440px.
- Sidebar ~224–240px; secondary 240–280px; top bar 48px.
- Rows 36px standard / 32px compact.
- Compact controls, restrained borders/shadows, small radii.
- Inter typography.
- Neutral surfaces + indigo interaction accent.
- Prefer Page → Header → Toolbar → Tabs → Content → Groups/Rows/Sections → Inspector.
- Avoid generic SaaS card dashboards, arbitrary gradients, giant headings, oversized controls, excessive whitespace/radii/shadows.
- Collection + contextual inspector is a core pattern.
- Work Item table contract: Checkbox | Key | Title | Status | Priority | Assignee | Cycle. Priority and Cycle must not disappear on desktop.

Responsive ranges:
- Wide ≥1280: persistent nav, collection + inspector.
- Compact 1024–1279: rail/narrow or overlay inspector.
- Tablet 720–1023: drawer + dominant inspector pane/overlay.
- Narrow <720: one primary surface; Work Item full-page detail.
Responsive changes composition, not semantics.

## Technology baseline
Frontend: React 19, TypeScript, Vite, TanStack Router, TanStack Query, TanStack Table, TanStack Virtual, React Hook Form, Zod, Tailwind CSS v4, accessible headless primitives where appropriate, Lucide, Inter. Zustand only for genuinely shared client UI state.

Backend/infrastructure: Appwrite Cloud Education/Student plan for Auth, Data, Realtime, Storage, Functions and later Messaging where justified.

Architecture: `UI → Application → Domain → Infrastructure → Appwrite`.

Appwrite is infrastructure, not the product architecture. Do not scatter SDK calls through React.

Important writes use explicit domain commands/server-authoritative handlers. Reads may use authenticated query/repository boundaries where safe. Authorization is hybrid: Appwrite native permissions for coarse defense-in-depth + Orynqo domain authorization for rich access rules.

Use server-owned revision/versioning, optimistic concurrency, stable client mutation IDs/idempotency receipts. Realtime is synchronization transport, not canonical truth.

Do not add NestJS, Redis, Kafka, Elasticsearch, Kubernetes, GraphQL or similar infrastructure without a concrete measured requirement.

Docker policy: native Vite/React for fast HMR; Docker Compose only for supporting development infrastructure when actually needed.

## First production-shaped slice
RB-142 — Add workspace-level role inheritance.

Golden Flow:
1. Open inspector.
2. Priority High → Urgent pending.
3. Priority settles; Activity records High → Urgent.
4. Send exact comment: “Inheritance looks correct. I’ve updated priority and moved this to review.”
5. Comment clears only after server acknowledgement; Activity remains separate.
6. Status In Progress → Review pending.
7. Status settles; collection/filter/selection/inspector context remains.
8. Verify newest Activity events without replacing history.

Edge contracts include rollback on failure, offline/not-synced, same-field conflict, different-field realtime reconciliation, permission revocation, archive, delete/unavailable, idempotent echo dedupe and collection continuity.

## Current implementation checkpoint
Branch: `feat/rb-142-golden-flow`
Approved base Golden Flow commit: `f8ad7cbf474e2f4a3b93a5d6860dc700f38e94fb`
Approved integration correction: `d86654b3c534698be7edb2835237e739161aa556`

ORY-000→ORY-015 and the RB-142 development vertical slice have passed their engineering gates. Actual Appwrite persistence and actual Appwrite Realtime remain intentionally deferred. Do not imply the development server/event transport is production Appwrite.

## Current design checkpoint
Design Validation Pass 01 (Figma node `61:2`) passed Human Review. Approved corrections are being propagated toward **Orynqo Design System v1.1**. No engineering should resume until v1.1 propagation receives final review/freeze.

Approved design-state additions/refinements:
- Property Mutation State: Idle, Pending, Failure, Offline/Not synced, Conflict, Read-only.
- Settled is transient state-machine behavior, not a persistent “Saved” badge.
- Property Conflict Resolver: canonical vs attempted value + explicit resolution.
- Context Notice: access/lifecycle context.
- Unavailable Context State: dedicated tombstone replacing unsafe protected detail.
- Comment Composer: Idle/Sending/Failure with draft preservation.
- Activity hierarchy: change → values → actor/time.

## Deferred
Project-specific workflow overrides, project-local custom fields, Organization templates, automation UI, production Appwrite persistence/realtime integration, dedicated queues/search infrastructure until justified.

## Required onboarding
Before making changes, read:
1. `05-CURRENT-STATE.md`
2. `04-DECISIONS-AND-FROZEN-CONTRACTS.md`
3. Your role-specific handoff.
4. `06-HANDOFF-CHECKLIST.md`

Then inspect the referenced Git/Figma evidence and report your understanding before changing anything.
