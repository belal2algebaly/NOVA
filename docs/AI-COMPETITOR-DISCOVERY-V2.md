# NOVA AI-Assisted Competitor Discovery V2

## What changed
- AI generates market-specific search queries from the store profile
- Search providers/cache remain the evidence source for candidate domains
- AI re-ranks only returned candidates; it cannot add a domain that was not returned by search evidence
- Candidate URLs are still crawled and passed through NOVA's direct-competitor gate before saving
- Existing competitor cards are replaced by a staged loading experience immediately after Discover is pressed
- Discovery stages: market understanding, smart queries, local search, qualification, full validation
- Stale discovery feedback is cleared when a new discovery starts

## Provider chain
Gemini -> Groq -> OpenRouter Free -> deterministic query plan/ranking

## Cost boundary
No paid search API is required. AI providers are used for query planning and evidence-based ranking only. Web candidate retrieval still uses free search providers and Supabase cache.

## Deployment
No new SQL migration is required for this release.
