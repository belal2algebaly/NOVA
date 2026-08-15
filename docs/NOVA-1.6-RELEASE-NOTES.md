# NOVA 1.6 — AI Operating System

This release connects NOVA's intelligence surfaces through a shared grounded AI layer and introduces evidence-based Buyer Persona intelligence.

## Highlights
- Global project-aware **Chat with NOVA** from every project screen
- Persistent AI chat history with page context
- **Buyer Persona / Buyer Intelligence** workspace with multi-file evidence upload
- Behavioral segments, persona profiles, behavior patterns, Voice of Customer, marketing intelligence, geo/product-affinity insights, confidence and missing-data guidance
- Buyer persona intelligence becomes part of the project AI context
- AI-assisted competitor query planning and reranking remains constrained to real search/cache candidates
- New AI second-pass competitor verifier can veto contradictory automatic candidates but cannot promote candidates that failed the strict deterministic gate
- Contextual AI coverage expanded to Notifications, Extension and individual Competitor profiles
- Super Admin AI & Integrations now checks Chat with NOVA and Buyer Persona persistence readiness

## Privacy boundary
Buyer Persona raw uploaded file contents are processed transiently by the analysis request and are not persisted to Supabase by NOVA. Only aggregate source metadata and generated intelligence are stored. Users should still remove unnecessary personal identifiers before upload.

## Required migration
Run `infra/supabase/012_ai_os_persona_chat.sql` after migration 011.

## AI provider chain
Gemini → Groq → OpenRouter Free → NOVA Evidence Engine

Generative providers are optional for core NOVA. Buyer Persona generation requires at least one generative provider in this release because structured persona synthesis cannot be safely replaced by the deterministic fallback.
