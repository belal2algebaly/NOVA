import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '../../../../../../lib/supabase/server';
import {buildPersonaReport,type PersonaInputFile} from '../../../../../../lib/persona/engine';

export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 try{
  const {id}=await params;const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await req.json();const files:Array<PersonaInputFile>=Array.isArray(body?.files)?body.files.slice(0,12).map((x:any)=>({name:String(x?.name||'source'),type:String(x?.type||''),text:String(x?.text||'').slice(0,140000)})).filter((x:any)=>x.text.trim()):[];const notes=String(body?.notes||'').slice(0,5000);if(!files.length)return NextResponse.json({error:'Add at least one customer-data file first'},{status:400});
  const total=files.reduce((n,f)=>n+f.text.length,0);if(total>700000)return NextResponse.json({error:'The combined upload is too large. Use smaller exports or split the analysis into batches'},{status:413});
  const {data:p,error}=await supabase.from('projects').select('id,name,stores(url,profile),competitors(name,store_url,classification,match_score,confidence_score,profile)').eq('id',id).maybeSingle();if(error||!p)return NextResponse.json({error:'Project not found'},{status:404});
  const store:any=Array.isArray((p as any).stores)?(p as any).stores[0]:(p as any).stores;const projectContext={projectName:p.name,storeUrl:store?.url||null,market:store?.profile?.primaryMarket||null,currency:store?.profile?.currencies?.[0]||null,categories:(store?.profile?.categories||[]).slice(0,12),products:(store?.profile?.productSamples||[]).slice(0,10)};
  const built=await buildPersonaReport(files,notes,projectContext);const {data:saved,error:saveError}=await supabase.from('persona_reports').insert({project_id:id,created_by:user.id,source_summary:built.sourceSummary,report:built.report,provider:built.provider,confidence:built.report?.dataQuality?.score||null}).select('id,created_at').single();if(saveError)throw saveError;
  return NextResponse.json({...built,id:saved.id,created_at:saved.created_at},{headers:{'cache-control':'no-store'}});
 }catch(e:any){return NextResponse.json({error:'NOVA could not build the buyer persona report',detail:process.env.NODE_ENV==='development'?String(e?.message||e):undefined},{status:500})}
}
