# RB-142 production mutation boundary

## Status

The RB-142 browser experience in this branch uses an explicitly isolated development command server because this repository does not contain deployable Appwrite project credentials/resources. It must not be described as exercised production persistence.

The production contract is nevertheless fixed:

UI → TanStack mutation/application command → Appwrite Function → identity + Orynqo authorization → lifecycle/workflow validation → expectedVersion → mutationId idempotency → TablesDB transaction → canonical result → query reconciliation → Realtime reconciliation.

## Current Appwrite verification — 2026-09-24

Official Appwrite documentation was re-verified for this gate.

- TablesDB transactions can stage multiple row operations across tables and commit them atomically. Commit detects external row conflicts.
- Appwrite row permissions provide coarse read/update/delete access to users/teams/roles.
- Appwrite Functions receive authenticated user identity/JWT headers. A Function can use the invoking JWT for user-scoped reads and a least-privilege dynamic key for the privileged transaction after Orynqo domain authorization.
- Realtime subscriptions are permission-secured and client-side; Server SDK API-key Realtime is not available. Session changes require subscription lifecycle handling.

## Production transaction shape

Each successful RB-142 command is one TablesDB transaction:

1. load canonical Work Item and Effective Access inputs;
2. reject forbidden/lifecycle/workflow/version failures;
3. check MutationReceipt by mutationId;
4. stage WorkItem update when applicable;
5. stage Comment insert when applicable;
6. stage ActivityEvent insert;
7. stage MutationReceipt insert;
8. commit;
9. return canonical result.

The resulting Work Item version is server-owned. A duplicate mutationId returns the recorded logical result and must not repeat Work Item, Comment or Activity side effects.

## Tables/resources required

Minimum production resources for this slice:

- work_items
- comments
- activity_events
- mutation_receipts
- workspace_memberships / project access inputs required by Effective Access

This branch does not fabricate those cloud resources.

## Development adapter

`src/features/rb142/development-server.ts` mirrors the server contract in-memory for the vertical-slice UI and focused regression tests. It owns canonical revisioning, workflow validation, access checks, mutation receipts, Comments and Activity. Regression controls are code/test helpers only; no simulation controls are exposed in product UI.
