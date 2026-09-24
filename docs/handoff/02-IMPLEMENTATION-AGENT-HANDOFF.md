# Orynqo — Implementation Agent Handoff

Read `00-PROJECT-MASTER.md`, `05-CURRENT-STATE.md`, and frozen decisions before coding.

## Current engineering state

Engineering is STOPPED pending Design System v1.1 final review/freeze.

Repository: `YounasKhan2/Orynqo`
Implementation branch: `feat/rb-142-golden-flow`
Approved Golden Flow commit: `f8ad7cbf474e2f4a3b93a5d6860dc700f38e94fb`
Approved integration correction: `d86654b3c534698be7edb2835237e739161aa556`

Do not start another feature until Project Management explicitly opens a new implementation gate.

## Frontend baseline

React 19 + TypeScript + Vite; TanStack Router/Query/Table/Virtual; React Hook Form + Zod; Tailwind v4; accessible headless primitives where appropriate; Lucide; Inter. Zustand only for truly shared client UI state.

## Layering

`UI → Application → Domain → Infrastructure → Appwrite`.

Rules:

- No scattered Appwrite SDK calls in React.
- Query owns server-derived client projections.
- Important writes use explicit domain commands.
- Server is authoritative for authorization, lifecycle, workflow, revision and idempotency.
- Realtime synchronizes canonical state; it is not canonical truth.

## Command contract

Examples:

- `changeWorkItemPriority`
- `transitionWorkItemStatus`
- `createWorkItemComment`

Commands centralize authorization, lifecycle/workflow checks, expected version, mutationId/idempotency and Activity generation.

## Concurrency/realtime

Client sends stable mutation UUID + expectedVersion. Server owns integer resource version. Realtime event model includes eventId, resourceId/resourceVersion, optional mutationId, eventType/changed fields and timestamp.

Required reconciliation:

- bounded event-id dedupe;
- ignore stale versions;
- local echo acknowledgement without duplication;
- same-field conflict preserves attempted + canonical values;
- different-field event applies beneath an unrelated pending edit;
- rollback restores detail and collection projections;
- no fake server revision while optimistic.

## RB-142 current implementation

The approved correction established:

- one logical development server source for RB-142;
- collection/detail Query projection coherence;
- concrete ORY-015 MutationPlans;
- `executeDomainMutation` + PendingMutationRegistry reuse;
- optimistic Query cache for Priority/Status;
- comment draft retained until acknowledgement;
- development event transport feeding the same reconciliation path;
- same-field attempted/canonical conflict model;
- revocation/archive/delete propagation paths;
- explicit documentation that production Appwrite persistence/realtime is not yet exercised.

Do not regress these contracts.

## Authorization

Effective access order:
`identity → membership/scope → visibility → capability → explicit grant/restriction → lifecycle`.

Frontend EffectiveAccess is UX guidance only; backend/server-side enforcement is mandatory.

Appwrite native permissions are coarse defense-in-depth. Orynqo domain authorization remains the rich access model. Before production integration, verify current Appwrite semantics rather than weakening the domain model to fit a provider limitation.

## Infrastructure

Use Appwrite Cloud Education projects for Development and Production. Do not develop against Production. Docker is a development-experience contract; native Vite HMR is preferred. Add supporting services only when required.

No premature NestJS/Redis/Kafka/Elasticsearch/Kubernetes/GraphQL.

## Tests that matter

Unit/domain tests, query/cache reconciliation tests, mutation tests, authorization tests, integration tests and Golden Flow E2E. Critical edge cases: failure rollback, offline/not-synced, same-field conflict, different-field realtime, permission revocation, archive/delete/unavailable, echo dedupe, collection continuity, keyboard/editable suppression and accessibility.

## Production integration still deferred

Actual Appwrite persistence and Appwrite Realtime are intentionally deferred at this checkpoint. Production target is conceptually:
`UI → MutationPlan/executeDomainMutation → Appwrite Function → auth/lifecycle/workflow/version/idempotency → atomic/logical persistence + Activity → canonical response → Query → Realtime reconciliation`.

Verify actual current Appwrite transaction/function/realtime semantics before implementing this boundary.

## Stop rule

If `05-CURRENT-STATE.md` says engineering is stopped, do not code. If a requested change contradicts a frozen contract, report the conflict instead of applying an ad-hoc fix.
