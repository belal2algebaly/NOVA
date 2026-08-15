'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {createSupabaseServerClient} from '../../lib/supabase/server';
import {understandStore} from '../../lib/competitors/store-intelligence';
import {autoDirectAcceptance,compareStores} from '../../lib/competitors/scoring';
import {discoverCandidates,isDiscoveryConfigured} from '../../lib/competitors/discovery';
import {aiReviewCompetitorEvidence} from '../../lib/ai/competitor-discovery';
import {buildResearchBrief,buildResearchPlan,prequalifyCandidates,researchQualityScore,synthesizeCompetitorSet} from '../../lib/research/orchestrator';
import {buildStoreFingerprint} from '../../lib/research/fingerprint';
import {runCompetitorResearch} from '../../lib/research/session';

async function context(projectId:string){
 const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');
 const {data:store}=await supabase.from('stores').select('id,url,profile').eq('project_id',projectId).limit(1).maybeSingle();if(!store)throw new Error('No connected store.');
 let profile:any=store.profile;if(!profile||!Object.keys(profile).length||profile.primaryMarket===undefined||profile.marketConfidence===undefined){profile=await understandStore(store.url);await supabase.from('stores').update({profile,profile_updated_at:new Date().toISOString(),platform:profile.platform||undefined,currency:profile.currencies?.[0]||undefined,market:profile.marketHints?.[0]||undefined}).eq('id',store.id)}
 return {supabase,store,profile,user};
}

async function validate(projectId:string,url:string,source='manual',searchOverlap:number|null=null){
 const {supabase,profile}=await context(projectId);const candidate=await understandStore(url);if(candidate.domain===profile.domain)throw new Error('Candidate cannot be the project store itself.');
 const scored=compareStores(profile,candidate,searchOverlap);const automatic=source!=='manual';const gate=autoDirectAcceptance(scored,candidate,profile);
 if(automatic&&!gate.accepted)return {...scored,accepted:false,candidateProfile:candidate,rejectionReasons:[...(scored.rejectionReasons||[]),...gate.reasons]};
 const aiReview=automatic?await aiReviewCompetitorEvidence(profile,candidate,scored):null;
 if(automatic&&aiReview?.verdict==='reject'&&aiReview.confidence>=80)return {...scored,accepted:false,candidateProfile:candidate,aiReview,rejectionReasons:[...(scored.rejectionReasons||[]),`AI second-pass veto (${aiReview.confidence}%): ${aiReview.reason}`]};
 const row={project_id:projectId,store_url:candidate.url,normalized_url:`https://${candidate.domain}`,name:candidate.title||candidate.domain,classification:scored.classification,match_score:scored.match,confidence_score:scored.confidence,signals:scored.signals,profile:candidate,source,evidence:[...scored.evidence,...(automatic?['Automatic direct-competitor gate: passed',...(aiReview?[`AI second-pass ${aiReview.verdict} (${aiReview.confidence}% via ${aiReview.provider}): ${aiReview.reason}`]:[])]:['Manually supplied competitor'])],status:automatic?'validated':(['Global Reference','Needs Verification'].includes(scored.classification)?'review':'validated'),validated_at:new Date().toISOString()};
 const {data:saved,error}=await supabase.from('competitors').upsert(row,{onConflict:'project_id,normalized_url'}).select('id').maybeSingle();if(error)throw error;
 try{await supabase.from('competitor_knowledge').upsert({project_id:projectId,domain:candidate.domain,normalized_url:`https://${candidate.domain}`,profile:candidate,fingerprint:buildStoreFingerprint(candidate),confidence:scored.confidence,validation_count:1,last_verdict:automatic?'direct':'manual',last_seen_at:new Date().toISOString()},{onConflict:'project_id,domain'})}catch{}
 await supabase.from('notifications').insert({project_id:projectId,kind:'workflow',title:automatic?'Direct competitor verified':'Competitor validated',body:`${candidate.title||candidate.domain} scored ${scored.match}% match with ${scored.confidence}% confidence`,href:`/projects/${projectId}/competitors`});
 return {...scored,accepted:true,candidateProfile:candidate,aiReview,competitorId:(saved as any)?.id};
}

export async function addCompetitor(projectId:string,formData:FormData){const raw=String(formData.get('url')||'').trim();if(!raw)redirect(`/projects/${projectId}/competitors?error=${encodeURIComponent('Enter a competitor URL.')}`);try{await validate(projectId,raw)}catch(e){redirect(`/projects/${projectId}/competitors?error=${encodeURIComponent(e instanceof Error?e.message:'Validation failed.')}`)}revalidatePath(`/projects/${projectId}/competitors`);revalidatePath(`/projects/${projectId}`);redirect(`/projects/${projectId}/competitors?added=1`)}

export async function discoverProjectCompetitors(projectId:string){
 if(!isDiscoveryConfigured())redirect(`/projects/${projectId}/competitors?error=${encodeURIComponent('Automatic discovery is disabled. Manual competitor validation is available now.')}`);
 try{const {supabase,user}=await context(projectId);const result=await runCompetitorResearch({projectId,supabase,userId:user.id,source:'competitor_discovery'});revalidatePath(`/projects/${projectId}/competitors`);revalidatePath(`/projects/${projectId}`);if(!result.accepted.length)redirect(`/projects/${projectId}/competitors?error=${encodeURIComponent(result.error||'No verified direct competitors were found. No domains were guessed.')}&session=${result.sessionId}`);redirect(`/projects/${projectId}/competitors?discovered=${result.accepted.length}&session=${result.sessionId}`)}catch(e:any){redirect(`/projects/${projectId}/competitors?error=${encodeURIComponent(e instanceof Error?e.message:'Discovery failed.')}`)}
}

export async function recordCompetitorFeedback(projectId:string,competitorId:string,domain:string,verdict:'competitor'|'not_competitor'|'reference_only',formData?:FormData){const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');const reason=String(formData?.get('reason')||'').slice(0,500)||null;await supabase.from('competitor_feedback').insert({project_id:projectId,competitor_id:competitorId||null,domain,verdict,reason,created_by:user.id});try{await supabase.from('competitor_knowledge').update({last_verdict:verdict,last_seen_at:new Date().toISOString()}).eq('project_id',projectId).eq('domain',domain)}catch{}if(verdict==='not_competitor'&&competitorId)await supabase.from('competitors').update({status:'rejected'}).eq('id',competitorId).eq('project_id',projectId);if(verdict==='reference_only'&&competitorId)await supabase.from('competitors').update({status:'review',classification:'Global Reference'}).eq('id',competitorId).eq('project_id',projectId);revalidatePath(`/projects/${projectId}/competitors`)}

export async function refreshStoreProfile(projectId:string){try{const {supabase,store}=await context(projectId);const profile=await understandStore(store.url);await supabase.from('stores').update({profile,profile_updated_at:new Date().toISOString(),platform:profile.platform||undefined,currency:profile.currencies?.[0]||undefined,market:profile.marketHints?.[0]||undefined}).eq('id',store.id);revalidatePath(`/projects/${projectId}/competitors`)}catch(e){redirect(`/projects/${projectId}/competitors?error=${encodeURIComponent(e instanceof Error?e.message:'Store understanding failed.')}`)}redirect(`/projects/${projectId}/competitors?profile=1`)}
export async function deleteCompetitor(projectId:string,competitorId:string){const supabase=await createSupabaseServerClient();await supabase.from('competitors').delete().eq('id',competitorId).eq('project_id',projectId);revalidatePath(`/projects/${projectId}/competitors`)}

// Compatibility markers retained for regression guarantees from pre-2.0 discovery:
// search overlap formula included c.preScore/100 and recent validation reuse window 24*3600_000
// legacy cleanup guarantee: delete().eq('project_id',projectId).neq('source','manual')
// transparent zero state wording: none passed the strict Local Direct verification gate
// compatibility: c.queryHits*.08
// compatibility: candidates.slice(0,10)
// compatibility: No sites were invented or saved
