# Orynqo

Collaborative work platform. The frozen Figma system is the UI/UX source of truth.

## Current gate

Implemented foundation: ORY-000–010.

Implementation Gate 2 branch adds ORY-011–015: the Project Work Items collection, canonical virtualized table, contextual inspector, and generic mutation/realtime reconciliation framework. The concrete Priority → Comment → Status Golden Flow remains intentionally deferred.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Fill Development Appwrite values.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `/projects/platform-core/issues?status=not-done&sort=key&selected=wi-rb-142`.

The collection currently uses an explicitly isolated development repository fixture, including RB-142, the long RB-124 title, and >5k rows so virtualization can be reviewed. It is not presented as production Appwrite persistence or authorization.

## Architecture

UI → Application → Domain → Infrastructure → Appwrite.

Server data belongs to TanStack Query. URL-addressable collection state belongs to TanStack Router search params. Local interaction state stays local. Domain mutations cross the application command boundary; React does not directly write Appwrite rows.

## Validation

GitHub Actions is intentionally disabled due to the current billing constraint. Validation is local/manual for now; this gate does not claim unexecuted checks as passing.

## Gate discipline

ORY-016+ concrete Golden Flow commands are not part of this branch.
