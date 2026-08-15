import {notFound,redirect} from 'next/navigation';
import {Sidebar} from '../../../../components/Sidebar';
import {AIAnalyst} from '../../../../components/AIAnalyst';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
import {isSupabaseConfigured} from '../../../../lib/config';
import {buildAIContext} from '../../../../lib/ai/context';
import {aiProviderStatus} from '../../../../lib/ai/router';

export default async function Analyst({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!isSupabaseConfigured)redirect('/dashboard');const supabase=await createSupabaseServerClient();
 const {data:p}=await supabase.from('projects').select('id,name,stores(url,profile,audit_runs(score,created_at)),competitors(id,name,store_url,profile,classification,match_score,confidence_score,status),opportunities(id,title,impact,priority,decision_score,status,evidence,recommendation),change_events(id,kind,summary,created_at)').eq('id',id).maybeSingle();if(!p)notFound();
 const {context,fallback}=buildAIContext(p,'');const store:any=Array.isArray((p as any).stores)?(p as any).stores[0]:(p as any).stores;const comps=((p as any).competitors||[]).filter((x:any)=>x.status!=='rejected');const audits=[...(store?.audit_runs||[])].sort((a:any,b:any)=>String(b.created_at).localeCompare(String(a.created_at)));
 const initial={provider:'deterministic' as const,model:'nova-evidence-engine',answer:fallback.answer,confidence:Number(fallback.confidence||45),followups:fallback.followups||[],evidence:fallback.evidence||[],note:aiProviderStatus().gemini||aiProviderStatus().groq||aiProviderStatus().openrouter?'Ask a question to use the connected AI provider':'Add Gemini, Groq or OpenRouter Free in Vercel to enable generative analysis'};
 return <main className="shell"><Sidebar projectId={id}/><section className="workspace"><header className="pageHeader"><div><p className="eyebrow">{p.name.toUpperCase()} / NOVA AI</p><h1>Ask your project intelligence</h1><p className="muted">Gemini first, Groq fallback, OpenRouter Free third, NOVA evidence engine always available — the zero-cost analyst fallback does not require a paid AI API</p></div></header><div className="analystContext"><div><span>Audit score</span><b>{audits[0]?.score??'—'}</b></div><div><span>Competitors</span><b>{comps.length}</b></div><div><span>Open opportunities</span><b>{((p as any).opportunities||[]).filter((x:any)=>x.status!=='dismissed').length}</b></div><div><span>Market</span><b>{context.project.market||'Unknown'}</b></div></div>{/* answer confidence is rendered inside AIAnalyst */}<AIAnalyst projectId={id} initial={initial} providers={aiProviderStatus()}/></section></main>
}
