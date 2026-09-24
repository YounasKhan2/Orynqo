# Orynqo

Collaborative work platform. The frozen Figma system is the UI/UX source of truth.

## Current gate

ORY-000–015 and the Gate 2 correction pass are accepted.

The current branch implements the RB-142 Golden Flow vertical-slice UI and its command contract. Because no deployable Appwrite Development project credentials/resources are committed to this repository, RB-142 persistence uses an explicitly isolated development server adapter. It must not be described as exercised production persistence.

## RB-142

Open:

`/projects/platform-core/issues?status=not-done&sort=key&selected=wi-rb-142`

The slice begins at Priority High / Status In Progress and supports:

- Priority High → Urgent;
- the exact approved comment fixture;
- Status In Progress → Review;
- Comments and Activity as separate objects;
- pending/error/conflict/offline state architecture;
- permission and lifecycle read-only states;
- server-owned revision semantics in the command adapter;
- persistent-idempotency semantics mirrored by development MutationReceipt storage;
- realtime dedupe/conflict architecture from ORY-015;
- P and S property shortcuts outside editable contexts;
- Cmd/Ctrl+Enter comment submission.

## Production boundary

Production is:

UI → application command → Appwrite Function → authorization/lifecycle/workflow/version/idempotency → TablesDB transaction → canonical result → Query reconciliation → Realtime.

See `docs/architecture/rb-142-production-boundary.md`.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Fill Development Appwrite values for real account/session work.
3. Run `npm install`.
4. Run `npm run dev`.

GitHub Actions remains intentionally disabled because of the repository billing constraint. Focused mutation-critical tests are included for local execution with `npm test`.
