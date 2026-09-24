# ADR-000 — Infrastructure Foundation

Status: Accepted for ORY-000–010

## Frozen now

- Appwrite Cloud Education is the managed backend. Development and Production are separate projects; development never uses production data.
- React/Vite runs natively for HMR. Docker is only for supporting development infrastructure when actually required.
- Boundary: UI → Application → Domain → Infrastructure → Appwrite.
- Domain mutations cross explicit application commands; React does not perform arbitrary Appwrite database writes.
- Reads use query/repository boundaries.
- Authorization is hybrid: Appwrite permissions are defense in depth; Orynqo domain authorization remains server-authoritative.
- Mutable collaborative aggregates use server-owned integer versions and client-provided expectedVersion + mutationId.
- mutationId is persistent idempotency identity.
- Realtime is synchronization transport, not canonical truth.
- Provider-specific types remain inside infrastructure where practical.

## Verified 2026-09-24

Current Appwrite TablesDB docs support atomic staged transactions across tables with conflict detection. Permissions support users, teams, team roles and memberships. Realtime subscriptions are permission-secured. Server-side Functions remain the intended boundary for sensitive commands when native client permissions cannot express Orynqo rules.

References:

- https://appwrite.io/docs/products/databases/tablesdb/transactions
- https://appwrite.io/docs/advanced/security/permissions
- https://appwrite.io/docs/products/auth/teams
- https://appwrite.io/docs/apis/realtime

## Still to verify before dependent feature work

- Education entitlement-specific transaction limits.
- Exact RB-142 TablesDB schema/indexes.
- Function authentication/session forwarding and endpoint shape.
- Exact already-open Realtime subscription behavior at permission revocation.
- Safe expectedVersion implementation inside command transactions.

## Deferred

Redis, Kafka, RabbitMQ, external search, Kubernetes, microservices, distributed caches, queue clusters, full outbox processing and speculative event infrastructure.
