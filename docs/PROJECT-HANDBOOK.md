# Orynqo — Product & Engineering Handbook

> **Living source of truth for product scope, implementation boundaries, engineering conventions, and agent handoff.**
>
> Last structural update: 2026-09-24
>
> Figma remains the frozen UI/UX authority. This handbook explains what the product contains, what belongs to Pre-MVP vs Post-MVP, how it should be implemented, and how every agent must leave the project ready for the next agent.

---

## 1. Why this document exists

Orynqo is being implemented through multiple design and engineering passes. A validated vertical slice is not automatically a complete page, module, wave, or product area.

A completely new agent must not infer the product from the currently running application.

Use this order of authority:

1. **Frozen Figma product definition** — visual/interaction source of truth.
2. **Approved product/architecture documentation** — scope and behavioral contracts.
3. **Repository implementation** — current implementation truth.
4. **Current-state/handoff notes** — what is done, partial, blocked, and next.

When these disagree, do not silently choose one. Record the discrepancy and stop at the appropriate review gate.

---

## 2. Product definition

**Orynqo is a collaborative work-management platform** for organizing projects, work items, planning structures, personal work retrieval, collaboration, teams, access, and workspace governance.

The product is intentionally broader than the currently implemented Project Issues and My Work slices.

### Product principles

- Dense, fast, keyboard-friendly work management.
- One stable domain identity across collection, inspector, detail, search, inbox, and saved views.
- Server-authoritative access control.
- Permission-safe discovery: inaccessible resources must not leak through search, relations, notifications, saved views, realtime, or aggregates.
- Optimistic interaction without pretending unacknowledged work is confirmed.
- Realtime reconciliation without destructive overwrites.
- Responsive composition without separate desktop/mobile domain implementations.
- Accessible interaction at every supported viewport.
- Figma fidelity through reusable tokens/components rather than screen-specific CSS.

---

## 3. Product capability map

### 3.1 Product Shell

Provides the persistent application structure:

- global bar;
- workspace context/switching;
- workspace sidebar/navigation;
- context header;
- peer navigation;
- route composition;
- responsive navigation behavior;
- loading/error/restricted shell states.

The shell is infrastructure for product areas, not a product area by itself.

### 3.2 Projects

A Project is a primary work container.

The designed Project experience includes:

- **Overview** — project summary/context;
- **Issues** — canonical Work Item collection;
- **Backlog** — unscheduled/planning work;
- **Cycles** — project work by time-box;
- **Milestones** — project work related to workspace-level milestones;
- **Activity** — project-relevant collaborative history/context.

Do not treat the implemented Issues route as completion of Projects.

### 3.3 Work Items

Work Items are core domain objects.

Core capability includes:

- stable ID and human-readable key;
- title and description;
- workflow status;
- priority;
- assignee;
- cycle;
- milestone where applicable;
- lifecycle state;
- relationships;
- watchers;
- comments;
- activity;
- version/revision semantics;
- effective-access information.

Collection and inspector/detail surfaces must represent the same underlying Work Item identity.

### 3.4 Work Item Collections

Reusable collection behavior includes:

- search;
- filters;
- sorting;
- grouping where defined;
- stable row identity;
- selection;
- cursor/incremental loading;
- virtualization for large collections;
- keyboard navigation;
- selected-item/inspector continuity;
- permission-safe results;
- responsive transformations.

The canonical desktop Issues columns are:

`Select | Key | Title | Status | Priority | Assignee | Cycle`

### 3.5 Work Item Inspector / Detail

The canonical detail composition contains:

- Identity;
- Properties;
- Description;
- Relationships;
- Collaboration;
- Comments;
- Activity.

Wide/compact layouts may use a side inspector; narrow layouts may use full-page detail. These are compositions of the same domain behavior, not separate implementations.

### 3.6 Personal Retrieval — Wave 4

Wave 4 is a complete product area, not only My Work.

It consists of:

#### My Work

- personal Work Item retrieval;
- search;
- filtering;
- sorting;
- grouping;
- Today / Upcoming-oriented retrieval;
- alternative grouping such as Project where defined;
- selected Work Item inspection;
- durable URL/query state where appropriate.

#### Inbox

Personal notification and attention-triage surface.

Expected responsibility:

- present user-relevant notification items;
- distinguish unread/read state;
- preserve source object identity;
- navigate safely to the originating object;
- respect current access and lifecycle;
- never expose protected content through notification payloads.

Exact behavior must follow the frozen Wave 4 Figma contracts. Do not invent notification categories or defaults that are not approved.

#### Global Search / Command

Cross-product retrieval and command entry point.

Responsibilities include:

- fast global discovery;
- permission-safe results;
- navigation to canonical objects;
- keyboard-first invocation/interaction;
- command behavior only where explicitly designed/approved.

Search must use the same discovery rules as direct navigation.

#### Saved Views

Reusable collection perspectives.

A Saved View may preserve approved view configuration such as:

- filters;
- sort;
- grouping;
- relevant presentation state.

A Saved View **never grants access**. Opening one must re-evaluate the viewer's current permissions and discovery rights.

### 3.7 Structure & Planning — Wave 5

Designed planning structures include:

#### Projects
Workspace projects and their structure/context.

#### Teams
Workspace-owned teams and membership/context.

#### Cycles
Time-boxed planning units used to organize Work Items.

#### Milestones
Workspace-level planning targets that can relate work/projects toward broader outcomes.

Do not collapse Team membership, Project containment, ownership, visibility, and permission scope into the same concept.

### 3.8 People & Access — Wave 6

Designed responsibilities include:

- workspace people/members;
- membership context;
- invitations where defined;
- roles;
- project/team access;
- explicit grants/restrictions where defined;
- viewer/read-only behavior;
- guest boundaries;
- revoked-access behavior;
- permission-aware UI.

Frontend capability flags improve UX but are not security enforcement.

### 3.9 Settings & Governance — Wave 7

Contains workspace/product configuration and governance surfaces defined by Figma.

Governance concepts must remain separate from ordinary collaboration history.

**Activity != Audit.**

Activity is human-facing collaborative object history.
Audit is governance/security history.

Do not render audit records as ordinary Work Item Activity merely because both are event-like.

### 3.10 Responsive & Completion — Wave 8

Frozen behavioral ranges:

- **Wide:** >=1280
- **Compact:** 1024–1279
- **Tablet:** 720–1023
- **Narrow:** <720

Responsive implementation must preserve domain identity and behavior.

Do not create independent `WorkItemDesktop`, `WorkItemTablet`, and `WorkItemMobile` domain implementations.

### 3.11 Collaboration

Pre-MVP collaboration foundation includes:

- comments;
- watchers where defined;
- human-readable Activity;
- realtime reconciliation;
- mutation acknowledgement;
- duplicate-event protection;
- conflict/error/offline states.

Rich collaborative document editing/presence is not automatically Pre-MVP.

---

## 4. Pre-MVP scope

Pre-MVP means the coherent first product that implements the already-approved core Orynqo experience. It does **not** mean every possible future capability.

### Pre-MVP product areas

1. Product Shell and workspace navigation.
2. Authentication/session/workspace context.
3. Projects core experience.
4. Work Item collections.
5. Work Item Inspector/detail.
6. Work Item properties, relationships, comments, watchers, and Activity required by approved flows.
7. My Work.
8. Inbox.
9. Global Search / Command.
10. Saved Views.
11. Backlog.
12. Cycles.
13. Milestones.
14. Teams.
15. People & Access.
16. Settings & Governance surfaces approved by frozen design.
17. Effective access and permission-safe discovery.
18. Realtime mutation/reconciliation behavior.
19. Offline/stale/conflict/read-only/unavailable states required by the design system.
20. Responsive compositions.
21. Accessibility and keyboard contracts.
22. Automated tests for critical product contracts.
23. Production Appwrite integration for authoritative auth/data/realtime/server-side operations.

A feature is not Pre-MVP merely because it would be useful. It must be approved by the product/Figma scope or explicitly promoted through human review.

---

## 5. Post-MVP / deferred expansion

The following are expansion candidates or unresolved capabilities. They must **not** be silently implemented as current requirements:

- full automation builder;
- organization-level templates;
- project-specific workflow overrides;
- project-local custom fields;
- richer notification preference/default system;
- rich-text collaborative merge/presence;
- advanced analytics/reporting beyond approved MVP surfaces;
- deeper third-party integrations;
- expanded automation/integration ecosystem;
- other unrelated product modules.

Existing architecture also leaves exact Trash retention and Audit retention unresolved.

**Rule:** Post-MVP is a planning bucket, not permission to design or implement speculative behavior. Promote an item only through an explicit product decision.

---

## 6. Approved technology baseline

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- TanStack Router
- TanStack Query
- TanStack Table
- TanStack Virtual
- React Hook Form
- Zod
- Lucide icons
- accessible headless primitives where appropriate
- Zustand only for genuinely shared client-side UI state

State ownership rules:

- server state -> TanStack Query;
- navigation/URL state -> router where appropriate;
- ephemeral interaction state -> local component/feature state;
- Zustand must not become a second server-state cache.

### Platform / backend

Appwrite is the approved platform baseline for:

- authentication;
- data persistence;
- realtime;
- storage;
- server-side Functions for privileged/authoritative operations;
- Messaging only when a real approved product requirement needs it.

Authorization remains server-authoritative.

### CI / developer tooling

- Git + GitHub for source control/review;
- Jenkins is the current self-hosted CI direction because GitHub Actions is intentionally not the active CI path under the repository billing constraint;
- local verification remains required;
- Docker may be used for reproducible development/supporting services where appropriate.

Do not introduce a monorepo, microservices, alternate backend, second state-management architecture, or additional infrastructure without evidence and explicit approval.

---

## 7. Architectural boundaries

Conceptual dependency direction:

```text
UI foundation
    ↓
Reusable UI systems
    ↓
Domain entities
    ↓
Feature behavior
    ↓
Route compositions
    ↓
Data/query layer
    ↓
Authorization + realtime
    ↓
Appwrite
```

Rules:

- route components compose features; they should not contain core domain logic;
- domain behavior does not belong in generic design-system primitives;
- Appwrite SDK calls must not be scattered through React components;
- stable IDs are used for domain identity;
- access checks are authoritative on the server;
- query invalidation/cache updates should be narrow;
- realtime events update relevant resources, not invalidate the whole application.

---

## 8. Authorization model

Never equate:

```text
Containment
!= Ownership
!= Membership
!= Visibility
!= Permission scope
```

Effective access conceptually evaluates:

```text
Identity
→ Membership / scope
→ Visibility
→ Role / capability
→ Explicit grant / restriction
→ Resource lifecycle
```

The backend/server-side boundary owns enforcement for:

- discovery;
- read;
- mutation;
- workflow transitions;
- membership validity;
- project grants;
- guest grants;
- lifecycle restrictions.

Search, relationships, Saved Views, Inbox, realtime payloads, and aggregates must obey the same discovery rules.

---

## 9. Mutation, realtime, and concurrency contract

Every important mutation should have:

- stable client-generated `mutationId`;
- base/current resource version;
- optimistic state where safe;
- canonical server acknowledgement;
- rollback/error behavior;
- realtime deduplication;
- conflict handling.

Do not treat optimistic UI as confirmed state.

Same-field remote updates must not silently destroy active local edits.

Realtime echoes of acknowledged local mutations must not duplicate comments or Activity.

Reconnect should perform targeted consistency reconciliation rather than reset the entire application.

---

## 10. Design system contract

Figma is the visual/interaction source of truth.

Implementation uses semantic tokens rather than arbitrary screen-specific values.

Typography roles:

| Role | Size / line-height | Weight |
| --- | --- | --- |
| Display | 32 / 38 | 600 |
| Page | 24 / 30 | 600 |
| Section | 18 / 24 | 600 |
| Subheading | 15 / 20 | 600 |
| Body | 14 / 20 | 400 |
| UI | 13 / 18 | 400/500 |
| Label | 12 / 16 | 500 |
| Caption | 11 / 16 | 400/500 |
| Mono | 12 / 18 | 400 |

Primary UI font: Inter.

Design System v1.1 includes explicit state patterns for:

- Property Mutation: Idle / Pending / Failure / Offline-Not-synced / Read-only;
- Property Conflict Resolver;
- Context Notice: Access / Lifecycle;
- Unavailable Context State;
- Comment Composer: Idle / Sending / Failure;
- Activity Event hierarchy.

Do not recreate these per feature.

---

## 11. Accessibility and keyboard expectations

Critical experiences must preserve:

- semantic controls;
- visible focus;
- deterministic keyboard order;
- focus restoration;
- accessible names;
- appropriate table/grid semantics;
- non-color-only status and permission meaning;
- pending/error announcements;
- reduced-motion behavior;
- zoom/reflow;
- safe interactive target sizes.

Existing Work Item keyboard contract includes:

- Enter -> open selected Work Item;
- P -> Priority;
- S -> Status;
- Esc -> close topmost layer and restore focus.

Single-key shortcuts must be suppressed in editable contexts.

New shortcuts/commands require design/product approval.

---

## 12. Implementation status vocabulary

Use these terms consistently.

### DESIGNED
The approved behavior/surface exists in frozen Figma/product documentation.

### IMPLEMENTATION STARTED
Engineering work exists but does not yet satisfy the intended slice.

### PARTIAL
A meaningful portion works, but required behaviors/surfaces remain missing.

### IMPLEMENTED
The scoped implementation exists and engineering checks pass.

### VALIDATED
The scoped implementation has passed its required design/engineering validation.

### COMPLETE
The **entire explicitly defined feature/module scope** is implemented, validated, documented, and has no known required missing surface/state/flow.

**Validated != Complete.**

Never call a page/module complete based on one validated vertical slice.

---

## 13. Current implementation snapshot

This section must be kept current by implementation agents.

### Implemented / validated foundations

- application/frontend foundation;
- design-token/system foundation;
- Product Shell foundation;
- Work Item collection/table foundation;
- virtualization foundation;
- Work Item Inspector foundation;
- mutation-state architecture;
- RB-142 Golden Flow implementation/validation;
- My Work canonical vertical slice and its responsive/fidelity corrections.

### Wave 4

**Designed scope:**

- My Work;
- Inbox;
- Global Search / Command;
- Saved Views.

**Current direction:**

- My Work: implemented/validated as a canonical vertical slice; do not interpret this as proof that every surrounding personal-retrieval capability is complete.
- Inbox: current next engineering slice on `feat/inbox-vertical-slice`.
- Global Search / Command: not yet the active implementation slice.
- Saved Views: not yet the active implementation slice.

### Later designed waves

- Wave 5 — Structure & Planning: designed, broad implementation pending.
- Wave 6 — People & Access: designed, broad implementation pending.
- Wave 7 — Settings & Governance: designed, broad implementation pending.
- Wave 8 — Responsive & Completion: design contract exists and must be propagated through every implemented product area.

---

## 14. Current Wave 4 implementation order

Finish Personal Retrieval before moving into broad Wave 5 implementation:

```text
My Work
  ✓ canonical implementation slice

→ Inbox
  CURRENT

→ Global Search / Command

→ Saved Views

→ Wave 4 completion audit
→ Design validation/corrections
→ Human review/freeze
```

Do not implement all remaining Wave 4 features in one uncontrolled branch unless the human owner explicitly changes the gate.

---

## 15. Agent operating rules

Every design, engineering, review, and project-management agent must follow these rules.

### Before work

1. Read this handbook.
2. Read the current handoff/current-state notes.
3. Inspect the actual branch and latest commit.
4. Identify the active feature/gate.
5. Inspect the relevant Figma node(s).
6. Read the relevant architecture contracts.
7. Confirm what is explicitly in scope and out of scope.
8. Do not start adjacent features.

### During work

- Preserve approved architecture.
- Reuse existing domain/components/tokens before creating alternatives.
- Do not redesign frozen product behavior in code.
- Do not invent missing requirements.
- Keep authorization server-authoritative.
- Keep product data permission-safe.
- Add/update tests with behavior.
- Keep the branch focused.
- Record newly discovered discrepancies or blockers.
- Do not silently resolve unresolved product decisions.

### Before handoff

Documentation update is part of Definition of Done.

At minimum update:

1. **Section 13 of this handbook** when implementation status changes.
2. Current handoff/current-state documentation.
3. Relevant architecture documentation when a contract actually changes.
4. Tests/verification notes.
5. Exact next action.

Do not claim completion while documentation describes an older state.

---

## 16. Mandatory handoff format

Every agent ending a substantial work session should leave a handoff containing:

```text
Project:
Branch:
Base commit:
Latest commit:

Active phase/gate:
Objective:

Completed:
- ...

Partially completed:
- ...

Not started / remaining:
- ...

Figma references:
- file:
- nodes:

Architecture/contracts used:
- ...

Files/modules changed:
- ...

Verification performed:
- typecheck:
- lint:
- format:
- tests:
- build:
- design validation:

Known issues/blockers:
- ...

Explicitly out of scope:
- ...

Documentation updated:
- ...

Exact next action:
- ...

Stop condition / human review required:
- ...
```

A handoff must distinguish facts from recommendations.

---

## 17. Documentation maintenance policy

Documentation is a living project artifact.

### Agents MUST update documentation when

- a feature status changes;
- a new approved feature enters scope;
- a feature moves between Pre-MVP/Post-MVP/deferred;
- architecture changes;
- technology/tooling changes;
- a Figma contract is revised/frozen;
- an implementation gate is completed;
- a blocker changes the roadmap;
- a handoff occurs.

### Agents MUST NOT

- rewrite product scope based only on current code;
- mark features complete because one screen works;
- promote Post-MVP ideas without approval;
- change architecture merely to make documentation match an implementation shortcut;
- remove unresolved decisions without recording the decision;
- overwrite historical facts to make the current state look cleaner.

### Documentation completion rule

> No implementation slice is considered finished for handoff until the documentation accurately reflects its current state.

---

## 18. Definition of product-area completion

Before calling a product area complete, verify all of the following:

- every approved screen/surface is implemented;
- required interactions are implemented;
- loading/empty/error/offline/read-only/unavailable states are handled;
- permission/discovery behavior is correct;
- responsive compositions are complete;
- keyboard/accessibility contracts are complete;
- realtime/concurrency behavior is covered where relevant;
- automated tests cover critical contracts/failure modes;
- Figma validation is complete;
- known required corrections are resolved;
- documentation is current;
- human review/freeze is complete when the workflow requires it.

Only then use **COMPLETE**.

---

## 19. New-agent quick start

If you know nothing about Orynqo:

1. Read Sections 1–5 to understand the product and scope.
2. Read Sections 6–11 to understand engineering/design constraints.
3. Read Section 13 for current implementation truth.
4. Read Section 14 for the active roadmap.
5. Inspect the active Git branch and latest commits.
6. Open the relevant frozen Figma wave/node.
7. Read the latest handoff.
8. Implement only the active slice.
9. Verify engineering + Figma contracts.
10. Update this documentation before handing off.

If anything is unclear, **do not guess**. Surface the ambiguity for human review.

---

## 20. Current immediate next action

Current engineering branch:

`feat/inbox-vertical-slice`

Immediate objective:

**Implement the Inbox vertical slice from frozen Wave 4 using the proven shell, Work Item identity, query/mutation/access patterns, design tokens, and responsive system.**

Do not begin Global Search / Command or Saved Views until the Inbox slice reaches its defined review gate unless explicitly instructed otherwise.

After Inbox:

```text
Global Search / Command
→ Saved Views
→ Wave 4 completion audit
→ Wave 4 validation/corrections
→ human review/freeze
→ next approved implementation area
```

---

## 21. Historical architecture note

The original Implementation Blueprint was intentionally written before broad product implementation. It used RB-142 as the architecture proof and deliberately deferred Projects, Teams, My Work, Inbox, Cycles, Milestones, administration, and other broad feature expansion until the Golden Flow was proven.

That gate has served its purpose.

Do not delete the original blueprint: it remains useful architectural history and contains detailed contracts for Work Items, authorization, mutations, realtime, accessibility, responsive behavior, and RB-142.

This handbook is the ongoing product/engineering orientation layer that sits above that historical blueprint and must evolve with the project.
