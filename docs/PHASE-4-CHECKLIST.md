# Phase 4 — Competitor Intelligence

## Implemented
- Store Understanding profile: platform, language, currency, price sample, category/product/content terms, market hints.
- Evidence-aware competitor comparison with Match Score and independent Confidence Score.
- Manual URL candidate validation.
- Automatic candidate discovery adapter using Serper when `SERPER_API_KEY` is configured.
- Every discovered candidate is crawled before it is persisted as a validated competitor.
- Direct / Strong / Adjacent / Weak classification.
- Competitor list and evidence profile screens.
- Supabase persistence for store profiles, competitor profiles, signals and validation evidence.
- Missing signals lower Confidence; they are not silently converted into negative match evidence.

## Intentionally not faked
- No fabricated competitor names when a search provider is not connected.
- No traffic/search-volume claims without a data provider.
- No browser-rendered CRO benchmark yet; that belongs to Phase 5/worker integration.

## Discovery setup
Add `SERPER_API_KEY` to the web deployment environment. Without it, manual competitor URL validation remains fully available.
