import type {StoreProfile} from '../competitors/store-intelligence';
import type {Candidate} from '../competitors/discovery';

type QueryPlan={local:string[];regional:string[];global:string[];provider?:string};
type Ranked={url:string;score:number;reason:string};

const safeJson=(text:string)=>{try{return JSON.parse(text)}catch{const m=text.match(/\{[\s\S]*\}/);if(m)try{return JSON.parse(m[0])}catch{};return null}};
const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));

function context(profile:StoreProfile){return {
 market:profile.primaryMarket||profile.marketHints?.[0]||'Unknown',
 marketConfidence:profile.marketConfidence||0,
 currency:profile.currencies?.[0]||'Unknown',
 language:profile.languageFamily||'Unknown',
 categories:profile.categories?.slice(0,8)||[],
 products:profile.productTerms?.slice(0,12)||[],
 keywords:profile.keywords?.slice(0,10)||[],
 priceRange:profile.priceMedian?`${profile.priceMin||''}-${profile.priceMax||''}`:'Unknown',
 platform:profile.platform||'Unknown'
}}

async function providerJson(system:string,prompt:string):Promise<{provider:string;data:any}|null>{
 const bodyText=`${prompt}\nReturn JSON only.`;
 if(process.env.GEMINI_API_KEY){try{const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:'user',parts:[{text:bodyText}]}],generationConfig:{temperature:.1,responseMimeType:'application/json',maxOutputTokens:1200}}),signal:AbortSignal.timeout(12000)});if(r.ok){const j:any=await r.json();const text=j?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('')||'';const data=safeJson(text);if(data)return {provider:'gemini',data}}}catch{}}
 if(process.env.GROQ_API_KEY){try{const model=process.env.GROQ_MODEL||'llama-3.3-70b-versatile';const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${process.env.GROQ_API_KEY}`},body:JSON.stringify({model,temperature:.1,max_completion_tokens:1200,messages:[{role:'system',content:system},{role:'user',content:bodyText}]}),signal:AbortSignal.timeout(12000)});if(r.ok){const j:any=await r.json();const data=safeJson(j?.choices?.[0]?.message?.content||'');if(data)return {provider:'groq',data}}}catch{}}
 if(process.env.OPENROUTER_API_KEY){try{const model=process.env.OPENROUTER_MODEL||'openrouter/free';const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://nova-eynk.vercel.app','X-Title':'NOVA'},body:JSON.stringify({model,temperature:.1,max_tokens:1200,messages:[{role:'system',content:system},{role:'user',content:bodyText}]}),signal:AbortSignal.timeout(16000)});if(r.ok){const j:any=await r.json();const data=safeJson(j?.choices?.[0]?.message?.content||'');if(data)return {provider:'openrouter',data}}}catch{}}
 return null;
}

function tidyQueries(rows:any,max:number){return Array.isArray(rows)?[...new Set(rows.map((x:any)=>String(x||'').replace(/\s+/g,' ').trim()).filter((x:string)=>x.length>6))].slice(0,max):[]}

export async function aiCompetitorQueryPlan(profile:StoreProfile,fallback:QueryPlan):Promise<QueryPlan>{
 const system=`You are NOVA's competitor discovery planner. Create search queries, not competitor names. The goal is DIRECT e-commerce competitors in the supplied primary market. Market and currency fit are more important than broad industry similarity. Never invent facts not present in the store profile.`;
 const result=await providerJson(system,`STORE PROFILE:\n${JSON.stringify(context(profile),null,2)}\n\nCreate a compact search plan. Return {"local":[max 3 queries],"regional":[max 1],"global":[max 1]}. Local queries must explicitly include the detected country/market and strong product/category terms. Avoid generic words when specific product terms exist.`);
 if(!result)return fallback;
 const local=tidyQueries(result.data?.local,3),regional=tidyQueries(result.data?.regional,1),global=tidyQueries(result.data?.global,1);
 return {local:local.length?local:fallback.local,regional:regional.length?regional:fallback.regional,global:global.length?global:fallback.global,provider:result.provider};
}

export async function aiRerankCompetitorCandidates(profile:StoreProfile,candidates:Candidate[]):Promise<Candidate[]>{
 if(!candidates.length)return candidates;
 const system=`You are NOVA's evidence-grounded competitor qualification assistant. Rank ONLY the supplied candidate URLs. Do not add domains. Direct competitor quality requires local market fit, overlapping products/categories, similar commercial intent and compatible price/currency context. A same-industry result from another country should rank low.`;
 const compact=candidates.slice(0,16).map(c=>({url:c.url,title:c.title,snippet:c.snippet,scope:c.scope,geoScore:c.geoScore,intentScore:c.intentScore,deterministicScore:c.preScore,queryHits:c.queryHits}));
 const result=await providerJson(system,`STORE PROFILE:\n${JSON.stringify(context(profile),null,2)}\n\nCANDIDATES:\n${JSON.stringify(compact,null,2)}\n\nReturn {"ranked":[{"url":"exact supplied URL","score":0-100,"reason":"short evidence-based reason"}]}. Rank local direct-match evidence highest. Do not use external knowledge.`);
 if(!result||!Array.isArray(result.data?.ranked))return candidates;
 const byUrl=new Map<string,Ranked>();for(const x of result.data.ranked){const url=String(x?.url||'');if(candidates.some(c=>c.url===url))byUrl.set(url,{url,score:clamp(Number(x?.score||0)),reason:String(x?.reason||'')})}
 return candidates.map(c=>{const a=byUrl.get(c.url);if(!a)return c;const blended=Math.round(c.preScore*.72+a.score*.28);return {...c,preScore:clamp(blended),aiScore:a.score,aiReason:a.reason,aiProvider:result.provider}}).sort((a,b)=>b.preScore-a.preScore||b.queryHits-a.queryHits);
}
