# Phase 7 — Monitoring, Reports & Analyst Layer

- Monitor targets and change-event persistence.
- Protected `/api/cron/monitor` endpoint processes a bounded batch; requires external scheduler and CRON_SECRET.
- Change detection compares store-intelligence fingerprints and stores before/after evidence.
- Reports screen summarizes current stored intelligence.
- Authenticated JSON report export route.
- NOVA Analyst section ranks stored evidence-backed opportunities; it does not invent unsupported AI conclusions.
