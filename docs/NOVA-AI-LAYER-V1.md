# NOVA AI Layer V1

NOVA AI is server-side only. API keys never go to the browser.

Provider order:
1. Gemini when `GEMINI_API_KEY` exists
2. Groq when Gemini is missing, rate-limited, or unavailable and `GROQ_API_KEY` exists
3. NOVA deterministic evidence engine as the zero-cost fallback

## Vercel variables

Add either or both:

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default `gemini-2.5-flash`)
- `GROQ_API_KEY`
- `GROQ_MODEL` (default `llama-3.3-70b-versatile`)

Redeploy after saving environment variables.

## Grounding rules

The model receives a compact server-built context containing only the current project's proven store profile, latest audit, validated competitors, pricing comparison, assortment gaps, opportunities, and recent monitoring events. The system prompt explicitly prohibits inventing missing evidence and requires confidence + evidence references.

No SQL migration is required for V1.
