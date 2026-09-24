# ORY-007 — Appwrite feasibility record

Verified: 2026-09-24

## Transactions
Appwrite TablesDB documents atomic transaction staging for row operations, cross-table operations, read-your-own-writes and conflict detection at commit. Future RB-142 command handlers should use this for WorkItem + ActivityEvent + MutationReceipt when the selected server SDK exposes the documented API.

## Permissions
Permissions can target users, teams, team roles and memberships, with row-level read/update/delete protection. Orynqo therefore uses native permissions as coarse protection plus server-side domain authorization for visibility, capabilities, explicit grants/restrictions and lifecycle.

## Membership
Appwrite Teams support memberships/roles and membership removal revokes access derived from those identities. Orynqo WorkspaceMembership and TeamMembership remain domain contracts rather than being collapsed into page roles.

## Realtime
Realtime subscriptions are permission-secured. Events still pass through normalization, version comparison and mutation reconciliation and never become canonical truth.

## Not yet proven
Exact schema/index performance, exact already-open subscription behavior at revocation, Function session propagation, Education transaction quotas, and final relationship representation.

## Minimum data direction
workspaces, workspace_memberships, teams, team_memberships, projects, project_access, workflows, workflow_statuses, cycles, work_items, work_item_relationships, watchers, comments, activity_events, mutation_receipts. Create only when the corresponding implementation gate requires them.

## Idempotency
A future MutationReceipt persists mutationId, actor/workspace/resource identity, command type, base/result version, status and createdAt. The same mutationId must never execute the domain operation twice.
