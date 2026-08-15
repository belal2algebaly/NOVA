import type {StoreProfile} from './store-intelligence';
export const WEIGHTS={marketOverlap:.28,categoryOverlap:.20,productSimilarity:.16,priceSimilarity:.12,currencyMatch:.08,languageMatch:.06,searchOverlap:.06,audienceSimilarity:.04};
const set=(xs:string[])=>new Set((xs||[]).map(x=>x.toLowerCase().trim()).filter(Boolean));
function fuzzy(a:string[],b:string[]){if(!a?.length||!b?.length)return null;const A=a.map(x=>x.toLowerCase()),B=b.map(x=>x.toLowerCase());let hits=0;for(const x of A)if(B.some(y=>x===y||x.includes(y)||y.includes(x)))hits++;return Math.min(1,hits/Math.max(1,Math.min(A.length,B.length)))}
function jac(a:string[],b:string[]){const A=set(a),B=set(b);if(!A.size||!B.size)return null;let h=0;for(const x of A)if(B.has(x))h++;return h/(A.size+B.size-h)}
function price(a:StoreProfile,b:StoreProfile){if(!a.priceMedian||!b.priceMedian)return null;if(a.currencies.length&&b.currencies.length&&!a.currencies.some(x=>b.currencies.includes(x)))return null;const r=Math.min(a.priceMedian,b.priceMedian)/Math.max(a.priceMedian,b.priceMedian);return Math.max(0,Math.min(1,r))}
function currency(a:StoreProfile,b:StoreProfile){if(!a.currencies.length||!b.currencies.length)return null;return a.currencies.some(x=>b.currencies.includes(x))?1:0}
function language(a:StoreProfile,b:StoreProfile){if(a.languageFamily==='Unknown'||b.languageFamily==='Unknown')return null;if(a.languageFamily===b.languageFamily)return 1;if(a.languageFamily==='Mixed'||b.languageFamily==='Mixed')return .7;return .1}
function market(a:StoreProfile,b:StoreProfile){if(a.primaryMarket&&b.primaryMarket)return a.primaryMarket===b.primaryMarket?1:.02;if(a.shippingMarkets?.length&&b.shippingMarkets?.length&&a.primaryMarket){return b.shippingMarkets.includes(a.primaryMarket)?.85:.15}const ah=set(a.marketHints),bh=set(b.marketHints);if(ah.size&&bh.size)return [...ah].some(x=>bh.has(x))?.85:.08;return currency(a,b)}
function evidenceQuality(a:StoreProfile,b:StoreProfile){return Math.min(a.crawlCoverage||0,b.crawlCoverage||0)/100}
export function compareStores(a:StoreProfile,b:StoreProfile,searchOverlap:number|null=null){const signals={marketOverlap:market(a,b),categoryOverlap:fuzzy(a.categories,a.categories.length?b.categories:b.keywords),productSimilarity:fuzzy(a.productTerms.length?a.productTerms:a.keywords,b.productTerms.length?b.productTerms:b.keywords),priceSimilarity:price(a,b),currencyMatch:currency(a,b),languageMatch:language(a,b),searchOverlap,audienceSimilarity:jac(a.keywords.slice(0,20),b.keywords.slice(0,20))};let available=0,earned=0;for(const [k,w] of Object.entries(WEIGHTS)){const v=(signals as any)[k];if(v!=null){available+=w;earned+=Math.max(0,Math.min(1,v))*w}}const confidenceRaw=available;const quality=evidenceQuality(a,b);let confidence=Math.round(Math.min(1,confidenceRaw*.78+quality*.22)*100);let match=available?Math.round(earned/available*100):0;const sameMarket=signals.marketOverlap!=null&&signals.marketOverlap>=.8,differentKnownMarket=signals.marketOverlap!=null&&signals.marketOverlap<=.12;const cat=signals.categoryOverlap??0,prod=signals.productSimilarity??0;const directGate=sameMarket&&cat>=.32&&prod>=.22&&confidence>=55;const strongGate=sameMarket&&cat>=.22&&confidence>=45;const insufficient=confidence<35||((signals.categoryOverlap==null)&&(signals.productSimilarity==null));if(quality<.35){match=Math.min(match,72);confidence=Math.min(confidence,58)}if(differentKnownMarket)match=Math.min(match,52);if(differentKnownMarket&&signals.currencyMatch===0)match=Math.min(match,42);if(cat<.12&&prod<.12)match=Math.min(match,48);let classification:string;if(insufficient)classification='Needs Verification';else if(directGate&&match>=76)classification='Local Direct';else if(strongGate&&match>=62)classification='Local Strong';else if(!sameMarket&&match>=64&&cat>=.3)classification='Regional Strong';else if(match>=48)classification='Adjacent';else classification='Global Reference';const confidenceLabel=confidence>=80?'High':confidence>=55?'Medium':'Low';const evidence=[...Object.entries(signals).filter(([,v])=>v!=null).map(([k,v])=>`${k}: ${Math.round(Number(v)*100)}%`),`crawl evidence quality: ${Math.round(quality*100)}%`,`direct gate: ${directGate?'passed':'not passed'}`];if(a.primaryMarket&&b.primaryMarket)evidence.unshift(a.primaryMarket===b.primaryMarket?`Same primary market: ${a.primaryMarket}`:`Different primary markets: ${a.primaryMarket} vs ${b.primaryMarket}`);const rejectionReasons:string[]=[];if(differentKnownMarket)rejectionReasons.push('Known primary market mismatch');if(cat<.22)rejectionReasons.push('Weak category overlap');if(prod<.18)rejectionReasons.push('Weak product-language overlap');if(confidence<55)rejectionReasons.push('Evidence confidence below direct-competitor threshold');return {signals,match,confidence,classification,confidenceLabel,evidence,sameMarket,directGate,rejectionReasons,quality:Math.round(quality*100)}}


export function autoDirectAcceptance(scored:any, candidate:StoreProfile, project:StoreProfile){
  const signals=scored?.signals||{};
  const samePrimaryMarket=Boolean(project.primaryMarket&&candidate.primaryMarket&&project.primaryMarket===candidate.primaryMarket);
  const projectCurrency=project.currencies?.[0]||null;
  const candidateCurrency=candidate.currencies?.[0]||null;
  const currencyCompatible=!projectCurrency||!candidateCurrency||projectCurrency===candidateCurrency;
  const marketProven=samePrimaryMarket&&Number(candidate.marketConfidence||0)>=55;
  const categoryStrong=Number(signals.categoryOverlap||0)>=0.32;
  const productStrong=Number(signals.productSimilarity||0)>=0.22;
  const evidenceStrong=Number(scored?.confidence||0)>=60&&Number(scored?.quality||0)>=40;
  const classificationDirect=scored?.classification==='Local Direct';
  const scoreStrong=Number(scored?.match||0)>=74;
  const accepted=classificationDirect&&marketProven&&currencyCompatible&&categoryStrong&&productStrong&&evidenceStrong&&scoreStrong;
  const reasons:string[]=[];
  if(!samePrimaryMarket)reasons.push('Primary market is not an exact match');
  if(Number(candidate.marketConfidence||0)<55)reasons.push('Candidate market evidence is too weak');
  if(!currencyCompatible)reasons.push('Currency context conflicts with the project store');
  if(!categoryStrong)reasons.push('Category overlap is below the automatic direct threshold');
  if(!productStrong)reasons.push('Product overlap is below the automatic direct threshold');
  if(Number(scored?.confidence||0)<60)reasons.push('Evidence confidence is below 60%');
  if(Number(scored?.quality||0)<40)reasons.push('Crawl evidence quality is below 40%');
  if(!classificationDirect)reasons.push('Deterministic classification is not Local Direct');
  if(!scoreStrong)reasons.push('Match score is below 74%');
  return {accepted,reasons};
}
