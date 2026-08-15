export type AIProvider = 'gemini'|'groq'|'openrouter'|'deterministic';
export type AIResult = {provider:AIProvider;model:string;answer:string;confidence:number;followups:string[];evidence:string[];note?:string};

type Grounding = {projectName:string;question:string;context:any;fallback:{answer:string;confidence?:number;followups?:string[];evidence?:string[]}};

const clamp=(n:number)=>Math.max(0,Math.min(100,Math.round(n)));
const safeJson=(text:string)=>{try{return JSON.parse(text)}catch{const m=text.match(/\{[\s\S]*\}/);if(m)try{return JSON.parse(m[0])}catch{};return null}};
const systemPrompt=`You are NOVA Analyst, an evidence-grounded e-commerce intelligence assistant.
Rules:
1. Use ONLY the supplied NOVA project evidence. Never invent market facts, competitors, prices, products, customer behavior or performance.
2. If evidence is missing, explicitly say what is unknown and what scan/action would improve confidence.
3. Distinguish proven facts from inference. Do not call a store a direct competitor unless the supplied classification/gate supports it.
4. Prefer concise, decision-oriented answers for CRO, pricing, product, competitor and monitoring questions.
5. Return JSON only with keys: answer (string), confidence (0-100 number), followups (array max 3), evidence (array max 5).
6. Evidence entries must refer to facts present in the supplied context, not external knowledge.`;

function promptFor(x:Grounding){
 const compact=JSON.stringify(x.context,null,2).slice(0,28000);
 return `PROJECT: ${x.projectName}\nUSER QUESTION: ${x.question}\n\nNOVA EVIDENCE:\n${compact}\n\nAnswer from this evidence only.`;
}

async function gemini(x:Grounding):Promise<AIResult>{
 const key=process.env.GEMINI_API_KEY;if(!key)throw new Error('GEMINI_KEY_MISSING');
 const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:systemPrompt}]},contents:[{role:'user',parts:[{text:promptFor(x)}]}],generationConfig:{temperature:0.2,responseMimeType:'application/json',maxOutputTokens:1200}}),signal:AbortSignal.timeout(18000)});
 if(!r.ok){const t=await r.text();throw new Error(`GEMINI_${r.status}:${t.slice(0,240)}`)}
 const j:any=await r.json();const text=j?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||'').join('')||'';const parsed=safeJson(text);if(!parsed?.answer)throw new Error('GEMINI_BAD_RESPONSE');
 return {provider:'gemini',model,answer:String(parsed.answer),confidence:clamp(Number(parsed.confidence??70)),followups:Array.isArray(parsed.followups)?parsed.followups.slice(0,3).map(String):[],evidence:Array.isArray(parsed.evidence)?parsed.evidence.slice(0,5).map(String):[]};
}

async function groq(x:Grounding):Promise<AIResult>{
 const key=process.env.GROQ_API_KEY;if(!key)throw new Error('GROQ_KEY_MISSING');
 const model=process.env.GROQ_MODEL||'llama-3.3-70b-versatile';
 const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${key}`},body:JSON.stringify({model,temperature:0.2,max_completion_tokens:1200,messages:[{role:'system',content:systemPrompt},{role:'user',content:promptFor(x)}]}),signal:AbortSignal.timeout(18000)});
 if(!r.ok){const t=await r.text();throw new Error(`GROQ_${r.status}:${t.slice(0,240)}`)}
 const j:any=await r.json();const parsed=safeJson(j?.choices?.[0]?.message?.content||'');if(!parsed?.answer)throw new Error('GROQ_BAD_RESPONSE');
 return {provider:'groq',model,answer:String(parsed.answer),confidence:clamp(Number(parsed.confidence??65)),followups:Array.isArray(parsed.followups)?parsed.followups.slice(0,3).map(String):[],evidence:Array.isArray(parsed.evidence)?parsed.evidence.slice(0,5).map(String):[]};
}


async function openrouter(x:Grounding):Promise<AIResult>{
 const key=process.env.OPENROUTER_API_KEY;if(!key)throw new Error('OPENROUTER_KEY_MISSING');
 const model=process.env.OPENROUTER_MODEL||'openrouter/free';
 const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${key}`,'HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://nova-eynk.vercel.app','X-Title':'NOVA'},body:JSON.stringify({model,temperature:0.2,max_tokens:1200,messages:[{role:'system',content:systemPrompt},{role:'user',content:promptFor(x)}]}),signal:AbortSignal.timeout(22000)});
 if(!r.ok){const t=await r.text();throw new Error(`OPENROUTER_${r.status}:${t.slice(0,240)}`)}
 const j:any=await r.json();const parsed=safeJson(j?.choices?.[0]?.message?.content||'');if(!parsed?.answer)throw new Error('OPENROUTER_BAD_RESPONSE');
 return {provider:'openrouter',model,answer:String(parsed.answer),confidence:clamp(Number(parsed.confidence??62)),followups:Array.isArray(parsed.followups)?parsed.followups.slice(0,3).map(String):[],evidence:Array.isArray(parsed.evidence)?parsed.evidence.slice(0,5).map(String):[]};
}

export function aiProviderStatus(){return {gemini:Boolean(process.env.GEMINI_API_KEY),groq:Boolean(process.env.GROQ_API_KEY),openrouter:Boolean(process.env.OPENROUTER_API_KEY),primary:process.env.GEMINI_API_KEY?'Gemini':process.env.GROQ_API_KEY?'Groq':process.env.OPENROUTER_API_KEY?'OpenRouter Free':'NOVA deterministic'}};

export async function askNOVA(x:Grounding):Promise<AIResult>{
 const errors:string[]=[];
 if(process.env.GEMINI_API_KEY){try{return await gemini(x)}catch(e:any){errors.push(String(e?.message||e))}}
 if(process.env.GROQ_API_KEY){try{return await groq(x)}catch(e:any){errors.push(String(e?.message||e))}}
 if(process.env.OPENROUTER_API_KEY){try{return await openrouter(x)}catch(e:any){errors.push(String(e?.message||e))}}
 return {provider:'deterministic',model:'nova-evidence-engine',answer:x.fallback.answer,confidence:clamp(Number(x.fallback.confidence??45)),followups:(x.fallback.followups||[]).slice(0,3),evidence:(x.fallback.evidence||[]).slice(0,5),note:errors.length?'AI providers were unavailable, so NOVA used its evidence engine':'Add Gemini, Groq or OpenRouter Free to enable generative analysis'};
}
