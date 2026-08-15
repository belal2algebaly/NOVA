# NOVA 1.0 Production Runbook

## Required environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY (server only)
- SEARXNG_URL (optional; blank uses healthy public SearXNG instances with failover)
- CRON_SECRET (required for monitoring endpoint)
- NEXT_PUBLIC_NOVA_APP_URL

## Database
Run SQL files in `infra/supabase` in numeric order: 001 through 007.

## Deploy
Deploy the repo to Vercel with the web workspace build. Configure the environment variables before first production use.

## Monitoring
Configure a scheduler to call `GET /api/cron/monitor` with `Authorization: Bearer <CRON_SECRET>`. The source package contains the protected job endpoint but does not claim a scheduler is running until you configure one.

## Extension
Load `apps/extension` as an unpacked Chrome extension for QA. Open a project → Extension in the dashboard, copy Project ID and Extension Key into the popup, then save pairing. After a scan, use `Send audit to NOVA`.

## External dependency boundaries
Automatic competitor discovery uses free SearXNG metasearch; no paid search API key is required. Server-side audits can verify HTML evidence but rendered-only checks remain Unknown unless captured by the Chrome extension/browser layer. Monitoring only runs when a scheduler invokes the cron endpoint.
