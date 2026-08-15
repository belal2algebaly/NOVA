import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '../../../../../lib/supabase/server';
import {askNOVA} from '../../../../../lib/ai/router';
import {buildAIContext} from '../../../../../lib/ai/context';

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;const body=await req.json();const question=String(body?.question||'').trim().slice(0,1200);if(!question)return NextResponse.json({error:'Ask NOVA a question first'},{status:400});
  const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const {data:p,error}=await supabase.from('projects').select('id,name,stores(url,profile,audit_runs(score,created_at)),competitors(id,name,store_url,profile,classification,match_score,confidence_score,status),opportunities(id,title,impact,priority,decision_score,status,evidence,recommendation),change_events(id,kind,summary,created_at)').eq('id',id).maybeSingle();
  if(error||!p)return NextResponse.json({error:'Project not found'},{status:404});
  const {context,fallback}=buildAIContext(p,question);const result=await askNOVA({projectName:p.name,question,context,fallback});
  return NextResponse.json(result,{headers:{'cache-control':'no-store'}});
 }catch(e:any){return NextResponse.json({error:'NOVA AI could not complete this request',detail:process.env.NODE_ENV==='development'?String(e?.message||e):undefined},{status:500})}
}
