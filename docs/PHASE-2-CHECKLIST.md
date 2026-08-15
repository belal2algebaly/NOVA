# Phase 2 — Accounts, Projects & Dashboard

## Implemented
- Public NOVA landing route.
- Supabase email/password sign-up, sign-in and sign-out server actions.
- Auth callback route and protected-route middleware.
- Automatic profile + personal workspace creation at auth signup via database trigger.
- Workspace membership table and RLS policies across project data.
- Real project creation with URL normalization and first connected store persistence.
- Projects dashboard backed by Supabase, with intentional setup state when credentials are absent.
- Project Command Center that reads persisted store, audit, competitor and opportunity counts.
- Settings and health endpoint.
- Responsive application shell.

## Intentionally deferred
- Server crawler and real audit run creation: Phase 3.
- Direct competitor discovery: Phase 4.
- Benchmark/opportunity generation from competitor evidence: Phase 5.
- Extension authentication/sync: Phase 6.
