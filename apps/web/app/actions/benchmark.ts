'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createSupabaseServerClient} from '../../lib/supabase/server';
import {scanUrl} from '../../lib/audit/server-scanner';
import {benchmarkRuns} from '../../lib/engines/benchmark';
import {opportunitiesFromBenchmark} from '../../lib/engines/opportunity';
import {effortForOpportunity,decisionScore} from '../../lib/intelligence/opportunity';

export async function runBenchmark(projectId:string){
 const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)redirect('/login');
 const {data:store}=await supabase.from('stores').select('id,url').eq('project_id',projectId).limit(1).maybeSingle();
 if(!store)redirect(`/projects/${projectId}/benchmark?error=${encodeURIComponent('No connected store.')}`);
 const {data:competitors}=await supabase.from('competitors').select('id,name,store_url,classification,match_score').eq('project_id',projectId).neq('status','rejected').order('match_score',{ascending:false}).limit(5);
 if(!competitors?.length)redirect(`/projects/${projectId}/benchmark?error=${encodeURIComponent('Validate at least one competitor first.')}`);
 let destination='';
 try{
   const own=await scanUrl(store.url);
   const competitorRuns=[] as any[]; const scanErrors:string[]=[];
   for(const c of competitors){try{const report=await scanUrl(c.store_url);competitorRuns.push({id:c.id,name:c.name||c.store_url,report});}catch(e){scanErrors.push(`${c.name||c.store_url}: ${e instanceof Error?e.message:'scan failed'}`)}}
   if(!competitorRuns.length)throw new Error(`None of the competitor pages could be scanned${scanErrors.length?`: ${scanErrors.slice(0,2).join(' · ')}`:''}`);
   const result=benchmarkRuns({report:own},competitorRuns);
   const opportunities=opportunitiesFromBenchmark(result);
   const {data:bench,error}=await supabase.from('benchmarks').insert({project_id:projectId,result:{...result,own:{url:store.url,page:own.page,site:own.site},competitors:competitorRuns.map(x=>({id:x.id,name:x.name,url:x.report.url,page:x.report.page,site:x.report.site})),scanErrors}}).select('id').single();
   if(error)throw error;
   for(const o of opportunities){const effort=effortForOpportunity(o.title,o.recommendation);const score=decisionScore(o.priority,o.confidence,o.impact,effort);await supabase.from('opportunities').upsert({project_id:projectId,key:o.key,title:o.title,impact:o.impact,confidence:String(o.confidence),confidence_score:o.confidence,priority:o.priority,decision_score:score,effort,opportunity_type:'CRO',source:'benchmark',evidence:{store:o.evidence,competitive:o.competitorEvidence},recommendation:o.recommendation,status:'identified'},{onConflict:'project_id,key'});}
   await supabase.from('notifications').insert({project_id:projectId,kind:'workflow',title:'Benchmark refreshed',body:`${opportunities.length} evidence-backed opportunities were ranked`,href:`/projects/${projectId}/opportunities`});
   revalidatePath(`/projects/${projectId}`); revalidatePath(`/projects/${projectId}/benchmark`); revalidatePath(`/projects/${projectId}/opportunities`);
   destination=`/projects/${projectId}/benchmark?run=${bench?.id||''}`;
 }catch(e){destination=`/projects/${projectId}/benchmark?error=${encodeURIComponent(e instanceof Error?e.message:'Benchmark failed.')}`}
 redirect(destination);
}

export async function updateOpportunity(projectId:string,opportunityId:string,status:string){
 const allowed=['identified','planned','testing','implemented','dismissed']; if(!allowed.includes(status))return;
 const supabase=await createSupabaseServerClient(); await supabase.from('opportunities').update({status}).eq('id',opportunityId).eq('project_id',projectId);
 revalidatePath(`/projects/${projectId}/opportunities`); revalidatePath(`/projects/${projectId}`);
}
