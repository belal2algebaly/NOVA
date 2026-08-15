# NOVA 1.0 — Vercel deployment

This repository is deployable from the repository root.

## Vercel settings

- Framework Preset: Next.js (or leave auto-detect)
- Root Directory: repository root (`.`)
- Install Command: `npm install`
- Build Command: `npm run build`

Do **not** set the Root Directory to `apps/web`; the web app consumes local shared packages from `packages/`.

## Required environment variables

Copy the keys listed in `.env.example` into Vercel → Project Settings → Environment Variables.

At minimum, Supabase URL and keys must be configured before authenticated/project flows can work. Automatic competitor discovery uses free SearXNG metasearch and needs no paid API key. `SEARXNG_URL` is optional if you later host your own instance. Cron/monitoring secrets are required only for those production endpoints.
