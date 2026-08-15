# Tavily free live search setup

NOVA uses Tavily as the recommended live web retrieval layer for competitor discovery. Gemini, Groq, or OpenRouter plan and rank the research; Tavily supplies real URLs so the AI cannot invent competitor domains.

1. Create a free account at Tavily
2. Copy the API key
3. In Vercel > Project > Settings > Environment Variables add `TAVILY_API_KEY`
4. Enable it for Production (and Preview if desired)
5. Redeploy NOVA

The search request uses `search_depth=basic`, country boosting from NOVA's detected primary market, and up to 10 results per query. Search results are cached in Supabase before SearXNG/DuckDuckGo fallbacks are attempted.
