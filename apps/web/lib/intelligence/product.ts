export type IntelligenceProfile={
  url?:string;domain?:string;currencies?:string[];priceMin?:number|null;priceMedian?:number|null;priceMax?:number|null;
  categories?:string[];productTerms?:string[];productSamples?:Array<{name:string;price:number|null;currency:string|null}>;
  primaryMarket?:string|null;languageFamily?:string;platform?:string|null;
};
export function productSnapshot(profile:IntelligenceProfile={}){
  return {store_url:profile.url||'',currency:profile.currencies?.[0]||null,price_min:profile.priceMin??null,price_median:profile.priceMedian??null,price_max:profile.priceMax??null,category_count:profile.categories?.length||0,product_signal_count:profile.productTerms?.length||0,categories:profile.categories||[],product_samples:profile.productSamples||[]};
}
export function pricingPosition(own:IntelligenceProfile={},competitors:IntelligenceProfile[]=[]){
  const ownMedian=Number(own.priceMedian||0);const medians=competitors.map(x=>Number(x.priceMedian||0)).filter(Boolean).sort((a,b)=>a-b);
  if(!ownMedian||!medians.length)return {label:'Not enough evidence',delta:null,marketMedian:null};
  const marketMedian=medians[Math.floor(medians.length/2)];const delta=Math.round((ownMedian-marketMedian)/marketMedian*100);
  return {label:delta>=20?'Premium':delta<=-20?'Value-led':'Market-aligned',delta,marketMedian};
}
export function assortmentGap(own:IntelligenceProfile={},competitors:IntelligenceProfile[]=[]){
  const mine=new Set((own.categories||[]).map(x=>x.toLowerCase()));const counts=new Map<string,number>();
  competitors.forEach(c=>(c.categories||[]).forEach(x=>{const k=x.trim();if(k)counts.set(k,(counts.get(k)||0)+1)}));
  return [...counts.entries()].filter(([k,n])=>!mine.has(k.toLowerCase())&&n>=Math.max(2,Math.ceil(competitors.length*.4))).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([category,count])=>({category,count}));
}
