import {analystAnswer} from '../intelligence/analyst';
import {assortmentGap,pricingPosition} from '../intelligence/product';

export function buildAIContext(project:any,question:string){
 const store=Array.isArray(project.stores)?project.stores[0]:project.stores;const own=store?.profile||{};
 const audits=[...(store?.audit_runs||[])].sort((a:any,b:any)=>String(b.created_at).localeCompare(String(a.created_at)));
 const comps=(project.competitors||[]).filter((x:any)=>x.status!=='rejected');
 const profiles=comps.map((x:any)=>x.profile||{});const opportunities=(project.opportunities||[]).filter((x:any)=>x.status!=='dismissed');
 const persona=[...(project.persona_reports||[])].sort((a:any,b:any)=>String(b.created_at).localeCompare(String(a.created_at)))[0]||null;
 const changes=[...(project.change_events||[])].sort((a:any,b:any)=>String(b.created_at).localeCompare(String(a.created_at))).slice(0,20);
 const pricing=pricingPosition(own,profiles);const assortment=assortmentGap(own,profiles);
 const fallback=analystAnswer(question,{projectName:project.name,latestScore:audits[0]?.score??null,competitors:comps,opportunities,changes,ownProfile:own,pricing,assortment});
 const context={
  project:{name:project.name,storeUrl:store?.url||null,market:own.primaryMarket||null,marketConfidence:own.marketConfidence||null,currency:own.currency||null,platform:own.platform||null,taxonomyConfidence:own.taxonomyConfidence||null,priceRange:own.priceRange||null,priceMedian:own.priceMedian||null,categories:(own.categories||[]).slice(0,18),products:(own.productSamples||[]).slice(0,12)},
  audit:{latestScore:audits[0]?.score??null,lastRun:audits[0]?.created_at??null},
  competitors:comps.slice(0,10).map((c:any)=>({name:c.name||c.store_url,url:c.store_url,classification:c.classification,matchScore:c.match_score,confidence:c.confidence_score,market:c.profile?.primaryMarket,currency:c.profile?.currency,priceMedian:c.profile?.priceMedian,priceRange:c.profile?.priceRange,categories:(c.profile?.categories||[]).slice(0,12),products:(c.profile?.productSamples||[]).slice(0,6)})),
  pricing,assortment:assortment.slice(0,12),
  opportunities:opportunities.slice(0,12).map((o:any)=>({title:o.title,impact:o.impact,priority:o.priority,decisionScore:o.decision_score,status:o.status,recommendation:o.recommendation,evidence:o.evidence})),
  recentChanges:changes.map((c:any)=>({kind:c.kind,summary:c.summary,at:c.created_at})),
  buyerPersona:persona?{createdAt:persona.created_at,confidence:persona.confidence,executiveSummary:persona.report?.executiveSummary,segments:(persona.report?.segments||[]).slice(0,6),behaviorPatterns:(persona.report?.behaviorPatterns||[]).slice(0,8),voiceOfCustomer:(persona.report?.voiceOfCustomer||[]).slice(0,6),marketingIntelligence:(persona.report?.marketingIntelligence||[]).slice(0,8)}:null
 };
 return {context,fallback};
}
