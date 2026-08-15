# NOVA Search Reliability + Taxonomy V4

## Search reliability
NOVA now uses a progressive discovery ladder instead of running every query against one public search instance. It starts with two local queries and stops early when enough qualified candidates exist. Regional and global queries run only when necessary.

Search results are cached in Supabase for 24–48 hours. If all free providers are unavailable, NOVA can use stale cached search results before giving up. SearXNG instances returning 429/403 enter a cooldown and another instance is tried. DuckDuckGo HTML search is a final free fallback.

Validated competitors from the last 24 hours are not crawled again during repeated discovery.

## Taxonomy V4
Category extraction now scores evidence from structured Product data, breadcrumbs, collection/category URL slugs and collection links. Promotional labels and CTA labels such as Sale, Offers, Shop All, View All and Go To are excluded from the primary taxonomy and can be stored separately as merchandising labels.

## Required migration
Run `infra/supabase/011_search_reliability_cache.sql` after `010_nova_11_intelligence.sql`.
