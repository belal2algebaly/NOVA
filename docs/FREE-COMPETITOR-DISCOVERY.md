# NOVA Free Competitor Discovery

NOVA no longer requires Serper or any paid search API for automatic competitor discovery.

## Default mode — zero configuration

If `SEARXNG_URL` is blank, NOVA retrieves the current public-instance directory from `https://searx.space/data/instances.json`, selects healthy HTTPS SearXNG instances, and fails over between several instances when one rejects or times out.

NOVA first requests SearXNG JSON search output. Many public instances disable JSON, so NOVA also supports an HTML-results fallback. Candidates are still crawled and scored by NOVA before they are saved; search rank alone never makes a site a validated competitor.

## Optional dedicated mode

Later, if reliability or traffic volume requires it, host your own SearXNG instance and add this Vercel environment variable:

`SEARXNG_URL=https://your-searxng.example`

This is optional. There is no paid API key requirement in the current release.

## Reliability boundary

Public SearXNG instances are community-operated and can rate-limit, disable result formats, or go offline. NOVA automatically retries other healthy instances. If all free instances are unavailable, automatic discovery returns a transparent temporary-unavailable message and Manual URL Validation remains usable.
