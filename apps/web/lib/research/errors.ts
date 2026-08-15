export function humanizeResearchError(error:unknown){
 const e=error as any;const msg=String(e?.message||'Competitor research could not be completed');const code=String(e?.code||'');
 if(code==='42P01'||(/research_sessions|research_candidates|competitor_knowledge|competitor_feedback/i.test(msg)&&/does not exist|relation/i.test(msg)))return 'NOVA Research OS database tables are missing. Run Supabase migration 013_nova_20_market_research.sql, then try again';
 if(/discovery_search_cache/i.test(msg)&&/does not exist|relation/i.test(msg))return 'Search cache table is missing. Run migration 011_search_reliability_cache.sql, then try again';
 if(/Tavily HTTP 401|Tavily HTTP 403/i.test(msg))return 'Tavily rejected the configured API key. Check TAVILY_API_KEY in Vercel, save it for Production, then redeploy';
 if(/Tavily HTTP 429/i.test(msg))return 'Tavily search quota is temporarily limited. NOVA kept your existing competitor set and research trace; try again after the quota resets';
 if(/FUNCTION_INVOCATION_TIMEOUT|timeout|aborted/i.test(msg))return 'The research run reached the execution limit before verification finished. NOVA kept your existing competitor set; retry once after the current run ends';
 if(/No connected store/i.test(msg))return 'This project has no connected store URL yet';
 if(/Private or unresolved destination|Store could not be fetched/i.test(msg))return 'NOVA could not fetch one of the store URLs. Check that the site is public and accessible, then retry';
 if(/JWT|Unauthorized|permission denied|row-level security/i.test(msg))return 'NOVA could not access the research data for this project. Check Supabase authentication and RLS migrations';
 // Do not expose arbitrary database/provider internals to end users.
 if(code||/postgres|supabase|database|fetch failed|ENOTFOUND|ECONN/i.test(msg))return 'A research integration failed while NOVA was collecting evidence. Open Super Admin → System Health for the exact integration status';
 return msg.slice(0,420);
}
