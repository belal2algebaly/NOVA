# NOVA 1.1 — Intelligence & Monitoring Update

## Phase 8 — Competitor Monitoring V2
Monitoring now snapshots product/pricing signals, detects pricing, assortment, positioning and technology changes, writes change events and creates in-app notifications. Production scheduling still requires the existing protected `/api/cron/monitor` endpoint to be called by a scheduler using `CRON_SECRET`.

## Phase 9 — Product & Pricing Intelligence
New `/projects/[id]/products` workspace compares visible median pricing, price ranges, category breadth and recurring assortment gaps. Snapshots are stored in `product_snapshots`.

## Phase 10 — Opportunity Engine V2
Benchmark opportunities now include effort and a decision score. The UI groups them into Quick Wins, Strategic, Consider and Low Priority.

## Phase 11 — NOVA Analyst
New zero-cost grounded Analyst. It answers from stored NOVA evidence only and deliberately does not require a paid LLM API. Supported question families: closest competitor, pricing position, monitored changes, product/assortment gaps and what to test first.

## Phase 12 — Reports, Sharing, Onboarding and Notifications
Reports can generate read-only public share links. Project Command Center includes a six-step onboarding checklist. The new Notifications inbox receives audit, benchmark, competitor-validation and monitoring signals.

## Database
Run `infra/supabase/010_nova_11_intelligence.sql` once after migrations 001–009.

## Optional Vercel variable
Set `NEXT_PUBLIC_APP_URL` to the production domain (for example `https://nova-eynk.vercel.app`) so the Reports screen displays complete share URLs. The public share route itself works without this variable.
