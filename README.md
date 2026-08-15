# NOVA 1.5 — System Intelligence + AI Everywhere

This build adds a Super Admin Status Center, live integration/AI health diagnostics, detailed report export, OpenRouter Free fallback, contextual AI briefs across the project workspace, developer dock rework, and global contrast hardening.

AI route: Gemini → Groq → OpenRouter Free → NOVA Evidence Engine.

No new SQL migration is required for NOVA 1.5.

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
- Competitor discovery: free SearXNG metasearch by default. No paid search API key required; `SEARXNG_URL` is optional for a dedicated instance.
- Production scheduler: required to invoke the protected monitoring cron route.

## Setup
See `docs/PRODUCTION-RUNBOOK.md`. Run Supabase migrations in numeric order, configure `.env`, install dependencies, then build/deploy the web app.

## Verification in this package
- Node test suite: 37/37 passing at packaging time.
- Extension and shared-engine JavaScript syntax checks: passing.
- Full Next.js production build was not executed in the packaging sandbox because dependency installation timed out before node_modules was created. This is an explicit unresolved verification boundary, not a claimed pass.


## Phase 11 — Auth + contrast + premium footer
- Higher contrast across Admin and user dashboards
- Google sign in / sign up entry points
- Email signup sends an activation link directly to the user inbox
- Auth callback routes the root admin to `/admin`
- Premium full-width rotating developer dock
- Setup guide: `docs/AUTH-GOOGLE-EMAIL-SETUP.md`


## Phase 18 — UI / Contrast / Responsive Optimization
A full visual-system pass improves contrast, typography, spacing, component density, responsive navigation, admin tables, competitor cards and motion without changing product logic or requiring a database migration. See `docs/PHASE-18-UI-OPTIMIZATION.md`.


## NOVA 1.1 — Intelligence & Monitoring

This build adds Monitoring V2, Product & Pricing Intelligence, Opportunity Engine V2, zero-cost NOVA Analyst, public report sharing, onboarding and notifications.

After upgrading an existing Supabase project, run `infra/supabase/010_nova_11_intelligence.sql` once.

Optional: set `NEXT_PUBLIC_APP_URL=https://nova-eynk.vercel.app` in Vercel so generated share URLs are displayed as complete URLs inside the Reports screen.
## UI V3 — 5 Radical Phases

This build includes a five-phase radical UI architecture pass: sectioned active navigation, sticky command canvas, redesigned data surfaces, mobile command dock, and reduced-motion-safe interaction polish. No new Supabase migration is required.



## Search Reliability + Taxonomy V4
- Progressive local-first discovery to reduce free-provider requests
- Supabase-backed 24–48h search cache with stale fallback
- SearXNG provider cooldown on 429/403 plus DuckDuckGo HTML fallback
- Recent validated competitors are not recrawled for 24h
- Verified taxonomy separates product categories from Sale/CTA/navigation labels
- Run `infra/supabase/011_search_reliability_cache.sql` after migration 010


## NOVA AI Layer V1
Gemini primary + Groq fallback + NOVA deterministic fallback. See `docs/NOVA-AI-LAYER-V1.md`.


## NOVA 1.6 — AI Operating System

Adds project-wide Chat with NOVA, evidence-based Buyer Persona intelligence, AI second-pass competitor verification and a unified project AI context. Run `infra/supabase/012_ai_os_persona_chat.sql` after migration 011. See `docs/NOVA-1.6-AI-OPERATING-SYSTEM-50-PHASES.md` and `docs/NOVA-1.6-RELEASE-NOTES.md`.
