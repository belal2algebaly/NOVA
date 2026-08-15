import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {createSupabaseAdminClient} from '../../../../lib/supabase/admin';
import {understandStore} from '../../../../lib/competitors/store-intelligence';
import {productSnapshot} from '../../../../lib/intelligence/product';

function fp(v:any){return createHash('sha1').update(JSON.stringify({title:v?.title,categories:v?.categories,prices:[v?.priceMin,v?.priceMedian,v?.priceMax],products:v?.productTerms?.slice(0,30),platform:v?.platform})).digest('hex')}
function diff(before:any,after:any){const out:{kind:string;summary:string}[]=[];if(!before)return out;if(before.priceMedian!==after.priceMedian)out.push({kind:'pricing',summary:`Median price changed from ${before.priceMedian??'unknown'} to ${after.priceMedian??'unknown'}`});if(JSON.stringify(before.categories||[])!==JSON.stringify(after.categories||[]))out.push({kind:'assortment',summary:'Category assortment changed'});if(before.title!==after.title)out.push({kind:'positioning',summary:'Homepage/title positioning changed'});return out}
export const maxDuration=120;
export async function GET(req:NextRequest){
 const secret=process.env.CRON_SECRET||'';if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:'Unauthorized'},{status:401});
 try{
  const supabase=createSupabaseAdminClient();const {data:targets,error}=await supabase.from('monitor_targets').select('id,project_id,competitor_id,url,last_fingerprint,last_snapshot').eq('enabled',true).order('last_checked_at',{ascending:true,nullsFirst:true}).limit(12);if(error)throw error;
  let changed=0,checked=0;const failures:{targetId:string;url:string;error:string}[]=[];
  for(const t of targets||[]){
   try{
    const snapshot=await understandStore(t.url,{mode:'validation'});const fingerprint=fp(snapshot);const snap=productSnapshot(snapshot);await supabase.from('product_snapshots').insert({project_id:t.project_id,competitor_id:t.competitor_id,...snap});
    if(t.last_fingerprint&&t.last_fingerprint!==fingerprint){for(const c of diff(t.last_snapshot,snapshot)){const {data:event}=await supabase.from('change_events').insert({project_id:t.project_id,monitor_target_id:t.id,competitor_id:t.competitor_id,kind:c.kind,summary:c.summary,before:t.last_snapshot,after:snapshot}).select('id').single();await supabase.from('notifications').insert({project_id:t.project_id,kind:'monitoring',title:'Competitor change detected',body:c.summary,href:`/projects/${t.project_id}/monitoring${event?.id?`#${event.id}`:''}`});changed++;}}
    await supabase.from('monitor_targets').update({last_checked_at:new Date().toISOString(),last_fingerprint:fingerprint,last_snapshot:snapshot}).eq('id',t.id);checked++;
   }catch(e){failures.push({targetId:t.id,url:t.url,error:e instanceof Error?e.message:'Monitoring scan failed'})}
  }
  return NextResponse.json({ok:failures.length===0,checked,events:changed,failed:failures.length,failures:failures.slice(0,8)});
 }catch(e){return NextResponse.json({ok:false,error:e instanceof Error?e.message:'Monitor run failed'},{status:500})}
}
