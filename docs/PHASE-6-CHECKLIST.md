# Phase 6 — Extension Integration & Production Surface

- Project-scoped extension key in Supabase.
- Extension pairing screen in web app.
- Chrome extension now stores app URL/project ID/key locally and can send the full rendered audit report.
- `/api/extension/ingest` validates pairing server-side and writes extension audits to history.
- Service-role key remains server-only.
- Production deployment requires Supabase migrations 001–007 and configured environment variables.
