# NOVA Competitor Intelligence V2

This release implements six improvement phases:

1. Smart Market Detection — primary market, confidence, currency, language, shipping/location signals
2. Local-First Discovery — local queries first, regional expansion second, global references last
3. Market-Aware Scoring — market is the highest weighted signal and known market mismatch receives a hard cap
4. Rich Competitor Profiles — market, price range, categories, product terms, platform and shipping signals
5. Research Intelligence — why the competitor matters, what to learn and what to keep in context
6. Contrast & Readability — darker type tokens, calmer light surfaces, clearer cards/tables and responsive competitor layouts

Existing project profiles from older NOVA versions are automatically refreshed the next time competitor context is loaded when the new market fields are missing. Re-running discovery will revalidate/upsert competitor profiles with the new engine.

No new SQL migration is required for this release because the richer profile and signal data is stored in the existing JSONB profile/signals columns.
