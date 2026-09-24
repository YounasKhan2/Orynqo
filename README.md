# Orynqo

Collaborative work platform. The frozen Figma system is the UI/UX source of truth.

## Current gate
ORY-000 through ORY-010 foundation only. ORY-011 Work Item collection and later RB-142 feature work are intentionally not started.

## Prerequisites
Node.js 24, npm 11, and access to the Orynqo Development Appwrite Cloud project. Development must never target Production.

## Setup
1. Copy `.env.example` to `.env.local`.
2. Fill Development Appwrite values.
3. Run `npm install`.
4. Run `npm run dev`.

## Validation
`npm run build`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`.

## Architecture
UI → Application → Domain → Infrastructure → Appwrite.

React components do not perform arbitrary domain writes directly through Appwrite. Important mutations cross an application command boundary and will be server-authoritative with authentication, authorization, lifecycle/domain validation, expected-version concurrency, persistent mutation idempotency, transactional persistence where supported, Activity creation and canonical response reconciliation. Reads use TanStack Query through repository boundaries.

See `docs/architecture/ADR-000-infrastructure-foundation.md` and `docs/architecture/ORY-007-appwrite-feasibility.md`.

## Docker
`docker-compose.dev.yml` is the convention for supporting local infrastructure only. It intentionally has no services today. Do not add speculative Redis/Kafka/RabbitMQ/search/Kubernetes infrastructure.

## Environments
Development = Orynqo Development Appwrite project. Production = Orynqo Production Appwrite project. No permanent third environment is assumed under the current Education entitlement.
