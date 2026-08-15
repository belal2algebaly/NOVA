import type {StoreProfile} from '../competitors/store-intelligence';

export type BusinessModel='DTC Brand'|'Marketplace'|'Multi-brand Retailer'|'Manufacturer'|'Retailer'|'Unknown';
export type PriceTier='Value'|'Mid-market'|'Premium'|'Luxury'|'Unknown';
export type StoreFingerprint={
  identity:{domain:string;market:string|null;currency:string|null;language:string;platform:string|null;businessModel:BusinessModel};
  taxonomy:{categories:string[];productTerms:string[];confidence:number};
  pricing:{min:number|null;p25:number|null;median:number|null;p75:number|null;max:number|null;tier:PriceTier};
  audience:{gender:'Men'|'Women'|'Kids'|'Unisex'|'Mixed'|'Unknown';style:string[];confidence:number};
  commerce:{shippingMarkets:string[];productCount:number|null;commercialConfidence:number};
  quality:{crawlCoverage:number;extractionQuality:string;marketConfidence:number};
};

function inferBusinessModel(p:StoreProfile):BusinessModel{
 const text=`${p.title||''} ${p.description||''} ${(p.keywords||[]).join(' ')}`.toLowerCase();
 if(/marketplace|thousands of sellers|multiple sellers|seller center/.test(text))return 'Marketplace';
 if(/official store|our brand|designed by|made by|our collection/.test(text))return 'DTC Brand';
 if((p.brands?.length||0)>=4)return 'Multi-brand Retailer';
 if(/manufacturer|factory|wholesale/.test(text))return 'Manufacturer';
 if((p.productCountEstimate||0)>0)return 'Retailer';
 return 'Unknown';
}
function inferGender(p:StoreProfile){const s=`${p.categories.join(' ')} ${p.productTerms.join(' ')} ${p.keywords.join(' ')}`.toLowerCase();const men=/\bmen'?s?\b|male|boys?|رجال|رجالي/.test(s),women=/\bwomen'?s?\b|female|girls?|نساء|نسائي/.test(s),kids=/kids?|children|طفل|اطفال|أطفال/.test(s);if(kids&&!men&&!women)return 'Kids' as const;if(men&&women)return 'Mixed' as const;if(men)return 'Men' as const;if(women)return 'Women' as const;if(/unisex/.test(s))return 'Unisex' as const;return 'Unknown' as const}
function inferStyle(p:StoreProfile){const s=new Set<string>();const hay=`${p.categories.join(' ')} ${p.productTerms.join(' ')} ${p.keywords.join(' ')}`.toLowerCase();for(const [label,re] of [['Casual',/casual|basic|t-?shirt|hoodie|sweat/],['Formal',/formal|suit|occasion|evening/],['Modest',/abaya|modest|hijab|جلابية|عباية/],['Sports',/sport|active|gym|fitness/],['Streetwear',/street|oversized|urban/],['Luxury',/luxury|premium|couture/]] as const)if(re.test(hay))s.add(label);return [...s]}
function tier(p:StoreProfile):PriceTier{if(!p.priceMedian)return 'Unknown';const c=p.currencies?.[0];const m=p.priceMedian;if(c==='EGP')return m<500?'Value':m<1500?'Mid-market':m<4000?'Premium':'Luxury';if(c==='SAR')return m<100?'Value':m<350?'Mid-market':m<1000?'Premium':'Luxury';if(c==='AED')return m<90?'Value':m<300?'Mid-market':m<900?'Premium':'Luxury';return 'Unknown'}
export function buildStoreFingerprint(p:StoreProfile):StoreFingerprint{
 const median=p.priceMedian;const min=p.priceMin,max=p.priceMax;const p25=median&&min?Math.round(min+(median-min)*.55):null,p75=median&&max?Math.round(median+(max-median)*.45):null;const gender=inferGender(p);const style=inferStyle(p);
 return {identity:{domain:p.domain,market:p.primaryMarket,currency:p.currencies?.[0]||null,language:p.languageFamily,platform:p.platform,businessModel:inferBusinessModel(p)},taxonomy:{categories:p.categories.slice(0,16),productTerms:p.productTerms.slice(0,24),confidence:Number(p.taxonomyConfidence||0)},pricing:{min,p25,median,p75,max,tier:tier(p)},audience:{gender,style,confidence:gender==='Unknown'&&!style.length?20:Math.min(85,45+style.length*8+(gender==='Unknown'?0:18))},commerce:{shippingMarkets:p.shippingMarkets||[],productCount:p.productCountEstimate,commercialConfidence:Math.min(100,Math.round((p.crawlCoverage||0)*.65+(p.productCountEstimate?20:0)+(p.priceMedian?15:0)))},quality:{crawlCoverage:p.crawlCoverage||0,extractionQuality:p.extractionQuality,marketConfidence:p.marketConfidence||0}};
}
