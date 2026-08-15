import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '../../../../../lib/supabase/server';
import {askNOVA} from '../../../../../lib/ai/router';
import {buildAIContext} from '../../../../../lib/ai/context';

async function projectForAI(supabase:any,id:string){const full=await supabase.from('projects').select('id,name,stores(url,profile,audit_runs(score,created_at)),competitors(id,name,store_url,profile,classification,match_score,confidence_score,status),opportunities(id,title,impact,priority,decision_score,status,evidence,recommendation),change_events(id,kind,summary,created_at),persona_reports(id,report,source_summary,provider,confidence,created_at)').eq('id',id).maybeSingle();if(!full.error)return full;const base=await supabase.from('projects').select('id,name,stores(url,profile,audit_runs(score,created_at)),competitors(id,name,store_url,profile,classification,match_score,confidence_score,status),opportunities(id,title,impact,priority,decision_score,status,evidence,recommendation),change_events(id,kind,summary,created_at)').eq('id',id).maybeSingle();if(base.data)(base.data as any).persona_reports=[];return base}
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});const {data}=await supabase.from('ai_chat_messages').select('id,role,content,provider,confidence,evidence,page_context,created_at').eq('project_id',id).order('created_at',{ascending:false}).limit(30);return NextResponse.json({messages:[...(data||[])].reverse()},{headers:{'cache-control':'no-store'}})}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;const body=await req.json();const question=String(body?.question||'').trim().slice(0,1600);const pageContext=String(body?.pageContext||'').slice(0,240);if(!question)return NextResponse.json({error:'Ask NOVA a question first'},{status:400});
  const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const {data:p,error}=await projectForAI(supabase,id);if(error||!p)return NextResponse.json({error:'Project not found'},{status:404});
  const {context,fallback}=buildAIContext(p,question);(context as any).currentPage=pageContext||null;const result=await askNOVA({projectName:p.name,question,context,fallback});
  await supabase.from('ai_chat_messages').insert([{project_id:id,user_id:user.id,role:'user',content:question,page_context:pageContext||null},{project_id:id,user_id:user.id,role:'assistant',content:result.answer,provider:result.provider,confidence:result.confidence,evidence:result.evidence,page_context:pageContext||null}]);
  return NextResponse.json(result,{headers:{'cache-control':'no-store'}});
 }catch(e:any){return NextResponse.json({error:'NOVA AI could not complete this request',detail:process.env.NODE_ENV==='development'?String(e?.message||e):undefined},{status:500})}
}
