# NOVA 2.0 — Competitor & Market Intelligence Engine

NOVA 2.0 turns competitor discovery into an auditable research workflow rather than a search-results list.

## 20 research phases
1. Store identity resolution
2. Business model classification
3. Product taxonomy normalization
4. Product fingerprinting
5. Price-positioning fingerprint
6. Audience/style signals with Unknown-safe evidence
7. AI direct-competitor research brief
8. Multi-perspective AI query planning
9. Search-budget optimization
10. Live web retrieval with local-market priority
11. Project competitor knowledge graph reuse
12. Candidate trust/prequalification
13. Deep commercial crawl
14. Structured-data-first extraction
15. Commercial footprint validation
16. CRO/product evidence reuse
17. Strict deterministic direct-competitor gate
18. AI devil's-advocate second pass
19. Verified set curation; weak sites remain research evidence, not Direct competitors
20. Full competitor intelligence output with traceable evidence

## Reliability and learning systems
- Research Sessions: every discovery run has status, plan, metrics and quality score
- Candidate decision ledger: accepted/rejected/needs-verification candidates and reasons are persisted
- Human feedback: Not a competitor / Reference only feedback is remembered for the project
- Competitor Knowledge: previously validated domains can be reused as evidence-backed candidates when live search is temporarily weak
- Research Quality Score: combines market certainty, taxonomy quality, candidate coverage, crawl coverage and accepted evidence confidence

## AI Orchestration
`NOVA AI Orchestrator` routes structured tasks through the configured provider chain while enforcing task-specific grounding rules:
- research brief
- search planning
- competitor synthesis
- persona intelligence
- market analysis

AI can plan, rank, explain and veto. It cannot invent a competitor domain or promote a candidate that failed the deterministic gate.

## Chat with NOVA as a command interface
The project chat can now interpret "Find my direct competitors" as an executable research command. It launches a Research Session, then summarizes the persisted results and links to the Competitor workspace.

## Persona × Competitor Intelligence
Buyer Intelligence still derives customer claims only from user-supplied customer evidence. When both customer evidence and verified competitive/CRO evidence exist, NOVA can generate `competitiveBridges` such as:
- customer objection → competitor communication pattern → test implication
- high-value segment product affinity → assortment gap → merchandising test

Competitor behavior is never treated as proof of customer motivation.

## Migration
Run `infra/supabase/013_nova_20_market_research.sql` after migration 012.
