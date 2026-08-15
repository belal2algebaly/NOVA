# NOVA 2.0.1 — Production Recovery Audit

## Root causes fixed

1. Next.js redirects were being caught as ordinary failures in the competitor research and benchmark flows
2. Automatic research deleted the previous automatic competitor set before a replacement set had been verified
3. Search-provider errors were swallowed, producing generic failed states with no actionable diagnosis
4. Local Tavily results could be rejected before crawl merely because the search snippet did not repeat Egypt/EGP signals
5. Candidate validation crawled too many pages for a synchronous production research request
6. Several workflows swallowed runtime errors, including store research and monitoring target scans
7. Audit action had a nullable result contract that could create build/type instability

## Recovery architecture

- Competitor discovery returns a structured result to the client instead of redirecting from inside a try/catch
- Existing verified competitors are preserved until a new verified set is successfully completed
- Accepted candidates are staged first and persisted only after research-session completion
- Live search is still evidence-only: AI may plan and rerank, but cannot create competitor domains
- Tavily country targeting is treated as a search prior, never final proof; final market proof comes from the candidate crawl
- Candidate validation uses a bounded crawl mode (home + up to 3 commercial pages)
- Research and AI routes use explicit maxDuration values for Vercel execution
- Provider, migration, timeout, RLS and quota failures are translated into actionable messages

## Required production setup

Migrations through `013_nova_20_market_research.sql` must be applied. The most important environment variables for the research flow are:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TAVILY_API_KEY` (recommended primary live search)
- at least one of `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` for AI reasoning

## Verification performed

- Node test suite
- TypeScript syntax parse across application TS/TSX source
- relative-import resolution scan
- Supabase table-use vs migration coverage scan
- redirect-inside-try scan for server actions
- CSS brace balance
- ZIP integrity

A full Next.js production compile could not be executed in the artifact environment because package installation timed out; Vercel remains the final dependency-resolved production build check.
