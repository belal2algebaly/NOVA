# NOVA 1.0 — E-commerce Intelligence Platform

NOVA has evolved from an extension-only CRO scanner into a web-first intelligence platform with a connected Chrome extension.

## Product surfaces
- Web dashboard: accounts, projects, store onboarding, audits, competitors, benchmark, opportunities, research, monitoring, reports and extension pairing.
- Chrome extension: rendered-page deep audit plus project sync.
- Shared engines: audit scoring, competitor match/confidence, benchmark and opportunity generation.
- Supabase: auth, tenant-safe project data, audit history, competitor intelligence, benchmark results, opportunities, extension pairing and monitoring events.

## Evidence rules
NOVA does not treat presence as quality and does not treat missing evidence as a pass. Server-only scans keep rendered-layout questions Unknown; extension scans can provide rendered evidence. Benchmarking excludes Unknown/Review from market win/loss calculations.

## External services
- Supabase: required for persisted app usage.
- Serper: optional but required for automatic competitor discovery. Manual validation works without it.
- Production scheduler: required to invoke the protected monitoring cron route.

## Setup
See `docs/PRODUCTION-RUNBOOK.md`. Run Supabase migrations in numeric order, configure `.env`, install dependencies, then build/deploy the web app.

## Verification in this package
- Node test suite: 37/37 passing at packaging time.
- Extension and shared-engine JavaScript syntax checks: passing.
- Full Next.js production build was not executed in the packaging sandbox because dependency installation timed out before node_modules was created. This is an explicit unresolved verification boundary, not a claimed pass.
