(() => {
  if (window.__NOVA_SCANNER__) return;
  window.__NOVA_SCANNER__ = true;

  const REF = {
    pdp:{label:'Baymard — Product Page UX research',url:'https://baymard.com/research/product-page'},
    currentPdp:{label:'Baymard — Product Page UX 2026',url:'https://baymard.com/blog/current-state-ecommerce-product-page-ux'},
    shipping:{label:'Baymard — Shipping information on product pages',url:'https://baymard.com/blog/avoid-banners-only-free-shipping'},
    returns:{label:'Baymard — Return Policy Discoverability',url:'https://baymard.com/guidelines/803-return-policy-discoverability'},
    reviews:{label:'Baymard — Product Page / Reviews research',url:'https://baymard.com/research/product-page'},
    size:{label:'Baymard — Size selection UX',url:'https://baymard.com/blog/use-buttons-for-size-selection'},
    images:{label:'Baymard — Product image resolution and zoom',url:'https://baymard.com/blog/ensure-sufficient-image-resolution-and-zoom'},
    thumbs:{label:'Baymard — Product image thumbnails',url:'https://baymard.com/blog/always-use-thumbnails-additional-images'},
    target:{label:'W3C WCAG 2.2 — Target Size (Minimum)',url:'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html'},
    alt:{label:'W3C WAI — Images Tutorial',url:'https://www.w3.org/WAI/tutorials/images/'},
    headings:{label:'W3C WAI — Headings',url:'https://www.w3.org/WAI/tutorials/page-structure/headings/'},
    pageTitle:{label:'Google Search Central — Title links',url:'https://developers.google.com/search/docs/appearance/title-link'},
    meta:{label:'Google Search Central — Snippets',url:'https://developers.google.com/search/docs/appearance/snippet'},
    speero:{label:'Speero — Heuristics Blueprint (Value, Relevance, Clarity, Friction, Motivation)',url:'https://speero.com/blueprints/heuristics-blueprint'},
    mobile:{label:'Baymard — Mobile E-Commerce UX research',url:'https://baymard.com/research/mcommerce-usability'},
    plp:{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},
    checkout:{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},
    navigation:{label:'Baymard — Ecommerce Navigation UX',url:'https://baymard.com/research/ecommerce-navigation'},
    search:{label:'Baymard — Ecommerce Search UX',url:'https://baymard.com/research/ecommerce-search'},
    contrast:{label:'W3C WCAG 2.2 — Contrast Minimum',url:'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'},
    vitals:{label:'web.dev — Core Web Vitals',url:'https://web.dev/articles/vitals'}
  };

  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const txt = el => (el?.innerText || el?.textContent || '').replace(/\s+/g,' ').trim();
  const norm = s => String(s||'').toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/\s+/g,' ').trim();
  const visible = el => {
    if(!el) return false;
    const s=getComputedStyle(el), r=el.getBoundingClientRect();
    return s.display!=='none' && s.visibility!=='hidden' && Number(s.opacity||1)>0 && r.width>1 && r.height>1;
  };
  const allVisible = (sel,root=document) => [...root.querySelectorAll(sel)].filter(visible);
  const hasText = (el,terms) => terms.some(t=>norm(txt(el)).includes(norm(t)));
  const findByText = (sel,terms,root=document) => allVisible(sel,root).filter(el=>hasText(el,terms));
  const rectEvidence = el => {
    if(!el) return 'Not found.';
    const r=el.getBoundingClientRect();
    return `${el.tagName.toLowerCase()} “${txt(el).slice(0,90)}” at x:${Math.round(r.x)}, y:${Math.round(r.y)}, ${Math.round(r.width)}×${Math.round(r.height)} CSS px`;
  };
  const check = (id,title,status,summary,why,evidence,confidence,weight=0,reference=null,recommendation='') => ({id,title,status,summary,why,evidence,confidence,weight,reference,recommendation});

  function decisionRegion(cta){
    const roots=[];
    if(cta){
      let n=cta;
      for(let i=0;i<5&&n;i++,n=n.parentElement){
        if(n.matches?.('main,article,section,[class*="product" i],[id*="product" i],[class*="detail" i],[class*="summary" i]')) roots.push(n);
      }
    }
    const main=document.querySelector('main'); if(main) roots.push(main);
    return roots.find(r=>r && txt(r).length>80) || document.body;
  }

  function conciseMatches(root, terms){
    const els=allVisible('p,span,li,a,button,summary,label,strong,small',root).filter(e=>{
      const t=txt(e);
      return t.length>=3 && t.length<=220 && terms.some(term=>norm(t).includes(norm(term)));
    });
    return [...new Set(els)];
  }

  function detailStrength(text, kind){
    const n=norm(text);
    if(kind==='shipping'){
      const terms=['shipping','delivery','deliver','شحن','توصيل','التوصيل','الشحن'];
      const specifics=[/\b\d+\s*(?:day|days|hour|hours|business day)/i,/\b(?:free|same day|next day|estimated|arrives?|delivery by)\b/i,/[0-9٠-٩]+\s*(?:ر\.?س|ريال|sar|aed|egp|usd|جنيه|درهم)/i,/(?:خلال|من|بين)\s*[0-9٠-٩]+\s*(?:يوم|ايام|أيام|ساعة)/i,/(?:مجاني|مجانا|مجاناً|يصلك|التوصيل المتوقع|موعد التوصيل)/i];
      return terms.some(t=>n.includes(norm(t))) ? specifics.filter(re=>re.test(text)).length : 0;
    }
    const terms=['return','returns','refund','exchange','استرجاع','استبدال','ارجاع','إرجاع'];
    const specifics=[/\b\d+\s*(?:day|days)\b/i,/\b(?:free returns?|refundable|non-refundable|exchange within|return within)\b/i,/[0-9٠-٩]+\s*(?:يوم|ايام|أيام)/i,/(?:مجاني|استرجاع مجاني|خلال|غير قابل للاسترجاع|سياسة الاسترجاع)/i];
    return terms.some(t=>n.includes(norm(t))) ? specifics.filter(re=>re.test(text)).length : 0;
  }

  function proximityTo(el, anchor){
    if(!el||!anchor) return null;
    const a=anchor.getBoundingClientRect(), b=el.getBoundingClientRect();
    return Math.round(Math.abs((b.top+b.bottom)/2-(a.top+a.bottom)/2));
  }

  function readJsonLd(){
    const out=[];
    document.querySelectorAll('script[type="application/ld+json"]').forEach(s=>{
      try{
        const v=JSON.parse(s.textContent||'{}');
        const walk=x=>{
          if(!x) return;
          if(Array.isArray(x)) return x.forEach(walk);
          if(typeof x==='object'){
            out.push(x);
            if(x['@graph']) walk(x['@graph']);
          }
        };
        walk(v);
      }catch(_e){}
    });
    return out;
  }

  function detectPlatform(){
    const html=(document.documentElement.innerHTML||'').slice(0,450000).toLowerCase();
    const host=location.hostname.toLowerCase();
    const markers=[
      ['Shopify', !!window.Shopify || html.includes('cdn.shopify.com') || html.includes('shopify-section')],
      ['Salla', html.includes('salla') || host.endsWith('.salla.sa') || html.includes('salla-product') || html.includes('salla-theme')],
      ['Zid', html.includes('zid.store') || html.includes('zid-theme') || html.includes('zidapp') || html.includes('zid.sa')],
      ['WooCommerce', document.body.classList.contains('woocommerce') || html.includes('woocommerce') || html.includes('wc-block')],
      ['Magento / Adobe Commerce', html.includes('mage-cache') || html.includes('magento') || html.includes('data-mage-init')],
      ['BigCommerce', html.includes('bigcommerce') || html.includes('stencil-utils')],
      ['Wix', html.includes('wixstatic.com') || html.includes('wix-code')],
      ['Squarespace', html.includes('squarespace') || html.includes('static1.squarespace.com')]
    ];
    return markers.find(x=>x[1])?.[0] || 'Could not verify';
  }

  function detectCurrency(jsonLd){
    const currencies=[];
    jsonLd.forEach(o=>{
      ['priceCurrency','currency'].forEach(k=>{if(typeof o[k]==='string') currencies.push(o[k].toUpperCase());});
      if(o.offers){
        const offers=Array.isArray(o.offers)?o.offers:[o.offers];
        offers.forEach(x=>x?.priceCurrency&&currencies.push(String(x.priceCurrency).toUpperCase()));
      }
    });
    const meta=[...document.querySelectorAll('meta[property="product:price:currency"],meta[itemprop="priceCurrency"]')].map(m=>m.content).filter(Boolean);
    currencies.push(...meta.map(x=>x.toUpperCase()));
    const freq={}; currencies.forEach(c=>freq[c]=(freq[c]||0)+1);
    if(Object.keys(freq).length) return Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];
    const sample=(document.body?.innerText||'').slice(0,12000);
    const patterns=[['SAR',/(?:SAR|ر\.س|ريال(?: سعودي)?)/i],['AED',/(?:AED|د\.إ|درهم)/i],['EGP',/(?:EGP|ج\.م|جنيه)/i],['USD',/(?:USD|US\$|\$)/i],['EUR',/(?:EUR|€)/i],['GBP',/(?:GBP|£)/i],['KWD',/(?:KWD|د\.ك)/i],['QAR',/(?:QAR|ر\.ق)/i],['BHD',/(?:BHD|د\.ب)/i],['OMR',/(?:OMR|ر\.ع)/i]];
    return patterns.find(([,re])=>re.test(sample))?.[0] || '';
  }

  function detectMarket(currency,jsonLd){
    const countryNames=[];
    jsonLd.forEach(o=>{
      const addr=o.address||o.seller?.address||o.offers?.seller?.address;
      const country=addr?.addressCountry;
      if(country) countryNames.push(typeof country==='string'?country:country.name||'');
    });
    const hreflangs=[...document.querySelectorAll('link[rel="alternate"][hreflang]')].map(x=>x.hreflang).filter(x=>x&&x.includes('-'));
    if(countryNames[0]) return {label:countryNames[0],confidence:92,evidence:'Structured data contains an address country.'};
    if(hreflangs.length===1){const cc=hreflangs[0].split('-')[1].toUpperCase();return {label:cc,confidence:72,evidence:`Single hreflang market signal: ${hreflangs[0]}.`};}
    const map={SAR:'Saudi Arabia',AED:'United Arab Emirates',EGP:'Egypt',KWD:'Kuwait',QAR:'Qatar',BHD:'Bahrain',OMR:'Oman',GBP:'United Kingdom'};
    if(map[currency]) return {label:map[currency],confidence:64,evidence:`Inferred from detected currency ${currency}; this is a heuristic, not proof of shipping coverage.`};
    const tld=location.hostname.split('.').pop();
    const tldMap={sa:'Saudi Arabia',ae:'United Arab Emirates',eg:'Egypt',kw:'Kuwait',qa:'Qatar',bh:'Bahrain',om:'Oman',uk:'United Kingdom'};
    if(tldMap[tld]) return {label:tldMap[tld],confidence:58,evidence:`Inferred from country-code domain .${tld}.`};
    return {label:'Could not verify',confidence:0,evidence:'No reliable country, market, currency, or ccTLD signal was found.'};
  }

  function detectCategory(jsonLd){
    const direct=[];
    jsonLd.forEach(o=>{
      if(/product/i.test(String(o['@type']||''))){
        if(o.category) direct.push(typeof o.category==='string'?o.category:o.category?.name||'');
        if(o.brand?.name) direct.push(o.brand.name);
      }
    });
    const breadcrumb=jsonLd.find(o=>/breadcrumblist/i.test(String(o['@type']||'')));
    if(breadcrumb?.itemListElement?.length){
      const names=breadcrumb.itemListElement.map(x=>x?.name||x?.item?.name).filter(Boolean);
      if(names.length>1) direct.push(names[names.length-2]);
    }
    const clean=direct.map(x=>String(x).trim()).filter(x=>x.length>1&&x.length<80);
    if(clean.length) return {label:clean[0],confidence:92,evidence:'Taken from Product/Breadcrumb structured data.'};

    const sample=norm([
      document.title,
      document.querySelector('meta[name="description"]')?.content,
      ...allVisible('h1,h2').slice(0,8).map(txt)
    ].filter(Boolean).join(' '));
    const tax=[
      ['Beauty / Personal Care',['skincare','skin care','makeup','cosmetics','beauty','hair care','haircare','عناية بالبشرة','مكياج','تجميل','عناية بالشعر']],
      ['Fashion / Apparel',['dress','shirt','pants','abaya','عباية','عبايات','ملابس','fashion','clothing','apparel','shoes','أحذية']],
      ['Electronics',['electronics','laptop','phone','mobile','headphones','camera','الكترونيات','إلكترونيات','جوال','هاتف']],
      ['Home / Furniture',['furniture','sofa','chair','table','home decor','اثاث','أثاث','ديكور','منزل']],
      ['Food / Grocery',['food','grocery','coffee','chocolate','snack','طعام','قهوة','شوكولاتة','بقالة']],
      ['Jewelry / Accessories',['jewelry','jewellery','watch','necklace','bracelet','مجوهرات','ساعات','اكسسوارات','إكسسوارات']],
      ['Sports / Fitness',['sports','fitness','gym','running','رياضة','لياقة']],
      ['Baby / Kids',['baby','kids','children','طفل','أطفال','مواليد']]
    ];
    const scored=tax.map(([label,terms])=>[label,terms.filter(t=>sample.includes(norm(t))).length]).sort((a,b)=>b[1]-a[1]);
    if(scored[0][1]>=1) return {label:scored[0][0],confidence:scored[0][1]>=2?76:58,evidence:'Heuristic category inferred from page title, description, and headings.'};
    return {label:'Could not verify',confidence:0,evidence:'No Product category schema or strong category vocabulary was found.'};
  }

  function walkOpenRoots(root=document){
    const roots=[root];
    const queue=[root];
    const seen=new Set([root]);
    while(queue.length){
      const r=queue.shift();
      const nodes=r.querySelectorAll ? r.querySelectorAll('*') : [];
      for(const el of nodes){
        if(el.shadowRoot && !seen.has(el.shadowRoot)){
          seen.add(el.shadowRoot); roots.push(el.shadowRoot); queue.push(el.shadowRoot);
        }
      }
    }
    return roots;
  }

  function allVisibleDeep(sel){
    const out=[];
    for(const root of walkOpenRoots()){
      try{ out.push(...[...root.querySelectorAll(sel)].filter(visible)); }catch(_e){}
    }
    return [...new Set(out)];
  }

  function purchaseActionKind(el){
    const blob=norm([
      txt(el), el?.getAttribute?.('aria-label'), el?.getAttribute?.('title'),
      el?.getAttribute?.('name'), el?.getAttribute?.('value'), el?.id,
      el?.className, el?.getAttribute?.('data-action'), el?.getAttribute?.('data-testid'),
      el?.getAttribute?.('data-test'), el?.getAttribute?.('formaction')
    ].filter(Boolean).join(' '));
    const add=['add to cart','add-to-cart','addtocart','add to bag','add-to-bag','اضف للسلة','أضف للسلة','اضافة للسلة','إضافة للسلة','أضف إلى السلة','اضف إلى السلة','أضف للسلة'];
    const buy=['buy now','buy it now','quick buy','quick purchase','instant buy','اشتر الآن','اشتري الآن','شراء سريع','اشترِ الآن'];
    if(add.some(x=>blob.includes(norm(x)))) return 'add_to_cart';
    if(buy.some(x=>blob.includes(norm(x)))) return 'buy_now';
    return '';
  }

  function stickyContext(el){
    let n=el;
    for(let i=0;i<5&&n;i++,n=n.parentElement){
      const cs=getComputedStyle(n);
      if(/fixed|sticky/.test(cs.position)){
        const r=n.getBoundingClientRect();
        return {fixed:true,stickyEdge:r.bottom>=innerHeight-220||r.top<=220,container:n};
      }
    }
    return {fixed:false,stickyEdge:false,container:null};
  }

  function findPurchaseActions(){
    const selectors='button,a,[role="button"],input[type="submit"],input[type="button"],[onclick],[data-action],[data-testid],[data-test]';
    const candidates=allVisibleDeep(selectors);
    const found=[];
    for(const el of candidates){
      const kind=purchaseActionKind(el);
      if(!kind) continue;
      const r=el.getBoundingClientRect();
      const sticky=stickyContext(el);
      const fixed=sticky.fixed;
      const stickyEdge=sticky.stickyEdge;
      found.push({el,kind,fixed,stickyEdge,stickyContainer:sticky.container,area:r.width*r.height,rect:r});
    }
    // form fallback for themes where visible button text is icon-only or injected
    for(const form of allVisibleDeep('form[action*="cart" i],form[action*="checkout" i],[data-product-form]')){
      const submit=[...form.querySelectorAll('button,input[type="submit"],[role="button"]')].find(visible);
      if(submit && !found.some(x=>x.el===submit)){
        const r=submit.getBoundingClientRect(); const sticky=stickyContext(submit);
        found.push({el:submit,kind:'add_to_cart',fixed:sticky.fixed,stickyEdge:sticky.stickyEdge,stickyContainer:sticky.container,area:r.width*r.height,rect:r,via:'product/cart form fallback'});
      }
    }
    return found.sort((a,b)=>{
      const rank=x=>(x.kind==='add_to_cart'?40:20)+(x.stickyEdge?15:0)+(x.fixed?5:0)+Math.min(20,x.area/4000);
      return rank(b)-rank(a);
    });
  }

  function textEvidenceCandidates(terms){
    const sel='p,span,li,a,button,summary,label,strong,small,div';
    return allVisibleDeep(sel).filter(e=>{
      const t=txt(e); if(t.length<3||t.length>260) return false;
      return terms.some(term=>norm(t).includes(norm(term)));
    });
  }

  function classifyPlacement(el, anchors=[]){
    if(!el) return 'unknown';
    const r=el.getBoundingClientRect();
    const near=anchors.filter(Boolean).some(a=>proximityTo(el,a)<900);
    const footer=!!el.closest?.('footer,[role="contentinfo"],[class*="footer" i]');
    if(footer) return 'footer';
    if(near) return 'decision-area';
    if(r.top < innerHeight*1.5) return 'upper-page';
    return 'elsewhere';
  }

  function pageSignals(jsonLd){
    const path=norm(location.pathname);
    const bodyClass=norm(document.body.className);
    const ogType=norm(document.querySelector('meta[property="og:type"]')?.content);
    const productSchema=jsonLd.some(o=>/product/i.test(String(o['@type']||'')));
    const itemList=jsonLd.some(o=>/itemlist|collectionpage/i.test(String(o['@type']||'')));
    const title=allVisible('h1,[itemprop="name"],.product-title,.product__title').find(x=>txt(x).length>1);
    const prices=allVisible('[itemprop="price"],[class*="price" i],[data-price],.money').filter(e=>/[0-9٠-٩]/.test(txt(e))&&txt(e).length<120);
    const purchaseActions=findPurchaseActions();
    const ctas=purchaseActions.map(x=>x.el);
    const productCards=allVisible('[class*="product-card" i],[class*="product-item" i],[data-product-id],article').filter(e=>{
      const t=txt(e); return /[0-9٠-٩]/.test(t)&&e.querySelector('img')&&t.length<1000;
    });
    const checkoutInputs=allVisible('input').filter(i=>/email|address|city|postal|zip|card|phone|name/i.test(`${i.name} ${i.id} ${i.autocomplete}`));
    const scores={HOME:0,PLP:0,PDP:0,CART:0,CHECKOUT:0};
    const evidence={HOME:[],PLP:[],PDP:[],CART:[],CHECKOUT:[]};
    const add=(k,n,msg)=>{scores[k]+=n;evidence[k].push(msg);};

    if(location.pathname==='/'||location.pathname==='') add('HOME',5,'Root URL');
    if(/home|front-page/.test(bodyClass)) add('HOME',3,'Homepage body class');
    if(/product|products|p\//.test(path)) add('PDP',2,'Product-like URL');
    if(productSchema){add('PDP',5,'Product structured data');}
    if(/product/.test(ogType)) add('PDP',3,'og:type=product');
    if(title) add('PDP',1,'Primary product-like heading');
    if(prices.length) add('PDP',1,'Visible price signal');
    if(ctas.length) add('PDP',3,'Visible purchase action');

    if(/collection|collections|category|categories|shop|search/.test(path)) add('PLP',3,'Listing-like URL');
    if(itemList) add('PLP',4,'ItemList/Collection structured data');
    if(productCards.length>=4) add('PLP',4,`${productCards.length} product-card-like elements`);

    if(/cart|basket|bag|السلة/.test(path)) add('CART',6,'Cart-like URL');
    if(findByText('h1,h2,button,a',['shopping cart','your cart','cart total','سلة المشتريات','السلة']).length) add('CART',4,'Cart language in rendered UI');

    if(/checkout|check-out|الدفع|اتمام-الطلب|إتمام-الطلب/.test(path)) add('CHECKOUT',7,'Checkout-like URL');
    if(checkoutInputs.length>=3) add('CHECKOUT',4,`${checkoutInputs.length} checkout/form-field signals`);
    if(findByText('h1,h2,button',['place order','complete order','pay now','إتمام الطلب','اتمام الطلب','الدفع الآن']).length) add('CHECKOUT',4,'Checkout action language');

    const order=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    const [best,points]=order[0];
    const second=order[1][1];
    if(points===0) return {type:'UNKNOWN',confidence:0,evidence:[]};
    const base=Math.min(98,Math.round((points/(points+Math.max(2,second)))*100));
    const type=points>=3?best:'UNKNOWN';
    return {type,confidence:type==='UNKNOWN'?25:Math.max(55,base),evidence:evidence[best].slice(0,5)};
  }

  function productCandidates(){
    const title=allVisibleDeep('h1,[itemprop="name"],.product-title,.product__title,[data-product-title]').find(e=>txt(e).length>1&&txt(e).length<250);
    const prices=allVisibleDeep('[itemprop="price"],[class*="price" i],[data-price],.money,.product-price').filter(e=>/[0-9٠-٩]/.test(txt(e))&&txt(e).length<100);
    const actions=findPurchaseActions();
    const ctas=actions.map(x=>x.el);
    const addToCart=actions.filter(x=>x.kind==='add_to_cart');
    const buyNow=actions.filter(x=>x.kind==='buy_now');
    return {title,prices,ctas,actions,addToCart,buyNow};
  }


  const PAGE_KNOWLEDGE = {
    PDP: [
      ['product_title','Product title','required'],
      ['price','Product price','required'],
      ['product_media','Primary product media','required'],
      ['cta','Primary purchase action','required'],
      ['shipping','Shipping / delivery detail','important'],
      ['returns','Returns / exchange clarity','important'],
      ['reviews_deep','Ratings & reviews system','important'],
      ['description','Product details / description','important'],
      ['variants','Variant selection','conditional'],
      ['stock','Availability state','conditional'],
      ['breadcrumb','Parent navigation','recommended']
    ],
    PLP: [
      ['plp_heading','Category / listing heading','required'],
      ['plp_cards','Product list','required'],
      ['plp_card_info','Product-card decision info','required'],
      ['plp_sort','Sort control','important'],
      ['plp_filter','Filtering','conditional'],
      ['plp_load','Product loading / pagination','important'],
      ['plp_result_context','Result context / count','recommended']
    ],
    CART: [
      ['cart_items','Cart line items','required'],
      ['cart_quantity','Quantity controls','required'],
      ['cart_remove','Remove item control','required'],
      ['cart_subtotal','Subtotal / total','required'],
      ['cart_checkout','Checkout action','required'],
      ['cart_delivery','Shipping / delivery cost context','important'],
      ['cart_coupon','Promo-code placement','review']
    ],
    CHECKOUT: [
      ['checkout_summary','Order summary','required'],
      ['checkout_contact','Contact information','required'],
      ['checkout_address','Delivery / billing address','required'],
      ['checkout_payment','Payment step / methods','required'],
      ['checkout_submit','Place order / pay action','required'],
      ['checkout_errors','Inline error readiness','review'],
      ['checkout_guest','Guest checkout availability','review']
    ],
    HOME: [
      ['home_nav','Primary navigation','required'],
      ['home_search','Site search','conditional'],
      ['home_categories','Category / collection entry points','important'],
      ['home_products','Product discovery section','important'],
      ['home_cart','Cart access','required'],
      ['home_value','Value / offer communication','review']
    ]
  };

  function parseColor(value){
    if(!value) return null;
    const m=String(value).match(/rgba?\(([^)]+)\)/i);
    if(!m) return null;
    const p=m[1].split(',').map(x=>parseFloat(x.trim()));
    if(p.length<3) return null;
    return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};
  }
  function blend(fg,bg){
    const a=fg.a==null?1:fg.a;
    return {r:fg.r*a+bg.r*(1-a),g:fg.g*a+bg.g*(1-a),b:fg.b*a+bg.b*(1-a),a:1};
  }
  function bgColor(el){
    let n=el;
    let bg={r:255,g:255,b:255,a:1};
    const chain=[];
    while(n&&n.nodeType===1){chain.push(n);n=n.parentElement;}
    chain.reverse().forEach(x=>{
      const c=parseColor(getComputedStyle(x).backgroundColor);
      if(c&&c.a>0) bg=blend(c,bg);
    });
    return bg;
  }
  function luminance(c){
    const conv=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
    return .2126*conv(c.r)+.7152*conv(c.g)+.0722*conv(c.b);
  }
  function contrastRatio(el){
    if(!el) return null;
    const fg0=parseColor(getComputedStyle(el).color);
    if(!fg0) return null;
    const bg=bgColor(el);
    const fg=fg0.a<1?blend(fg0,bg):fg0;
    const a=luminance(fg), b=luminance(bg);
    return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  }
  function visibilityAudit(el,label){
    if(!el) return {status:'unknown',evidence:`${label} was not detected.`};
    const cs=getComputedStyle(el), r=el.getBoundingClientRect();
    const cr=contrastRatio(el);
    const font=parseFloat(cs.fontSize)||0;
    const weight=parseInt(cs.fontWeight)||400;
    const large=font>=24 || (font>=18.66&&weight>=700);
    const min=large?3:4.5;
    const clipped=(el.scrollWidth>el.clientWidth+2||el.scrollHeight>el.clientHeight+2)&&cs.overflow!=='visible';
    const opacity=parseFloat(cs.opacity||'1');
    const problems=[];
    if(cr!=null&&cr<min) problems.push(`text contrast ${cr.toFixed(2)}:1 < ${min}:1`);
    if(opacity<.65) problems.push(`opacity ${opacity.toFixed(2)}`);
    if(r.width<4||r.height<4) problems.push('near-zero rendered size');
    if(clipped) problems.push('content appears clipped');
    return {
      status:problems.length?'warn':'pass',
      evidence:`${label}: ${Math.round(r.width)}×${Math.round(r.height)}px, font ${font.toFixed(1)}px/${weight}, opacity ${opacity.toFixed(2)}${cr!=null?`, contrast ${cr.toFixed(2)}:1`:''}${problems.length?` | issues: ${problems.join('; ')}`:''}`,
      ratio:cr, problems
    };
  }
  function centerY(el){
    const r=el?.getBoundingClientRect?.();
    return r ? r.top+scrollY+r.height/2 : null;
  }
  function documentPosition(el){
    const r=el?.getBoundingClientRect?.();
    return r ? {top:r.top+scrollY,left:r.left+scrollX,width:r.width,height:r.height,bottom:r.bottom+scrollY} : null;
  }

  async function collectPerformanceMetrics(){
    const nav=performance.getEntriesByType('navigation')[0];
    const paint=performance.getEntriesByType('paint')||[];
    const fp=paint.find(x=>x.name==='first-contentful-paint');
    let lcp=null, cls=0, inp=null;
    try{
      const l=performance.getEntriesByType('largest-contentful-paint');
      if(l.length) lcp=l[l.length-1].startTime;
    }catch(_e){}
    try{
      const shifts=performance.getEntriesByType('layout-shift');
      cls=shifts.filter(x=>!x.hadRecentInput).reduce((s,x)=>s+(x.value||0),0);
    }catch(_e){}
    try{
      const ev=performance.getEntriesByType('event').filter(x=>x.interactionId&&x.duration);
      if(ev.length) inp=Math.max(...ev.map(x=>x.duration));
    }catch(_e){}
    const out={
      ttfb:nav?Math.max(0,nav.responseStart-nav.requestStart):null,
      fcp:fp?.startTime??null,
      lcp,
      cls:Number(cls.toFixed(3)),
      inp,
      domContentLoaded:nav?nav.domContentLoadedEventEnd:null,
      load:nav?nav.loadEventEnd:null
    };
    let flags=[];
    if(out.lcp!=null && out.lcp>4000) flags.push('LCP poor');
    else if(out.lcp!=null && out.lcp>2500) flags.push('LCP needs improvement');
    if(out.cls!=null && out.cls>.25) flags.push('CLS poor');
    else if(out.cls!=null && out.cls>.1) flags.push('CLS needs improvement');
    if(out.inp!=null && out.inp>500) flags.push('INP poor');
    else if(out.inp!=null && out.inp>200) flags.push('INP needs improvement');
    out.status=flags.length? (flags.some(x=>x.includes('poor'))?'poor':'needs-improvement') : 'good-or-unverified';
    out.flags=flags;
    return out;
  }

  function performanceChecks(metrics){
    const out=[];
    const fmt=v=>v==null?'not observed':`${Math.round(v)} ms`;
    if(metrics.lcp!=null){
      const s=metrics.lcp<=2500?'pass':metrics.lcp<=4000?'warn':'fail';
      out.push(check('speed_lcp','Largest Contentful Paint (LCP)',s,`Observed LCP: ${(metrics.lcp/1000).toFixed(2)}s.`,'LCP is a Core Web Vital for loading performance. The commonly used thresholds are good ≤2.5s, needs improvement 2.5–4s, poor >4s.',`Buffered browser performance entry from this page load: ${Math.round(metrics.lcp)} ms.`,92,6,{label:'web.dev — Core Web Vitals thresholds',url:'https://web.dev/articles/vitals'},s==='pass'?'Keep monitoring real-user field data; one browser navigation is not a full performance audit.':'Prioritize the largest visible content element, image delivery, render-blocking work, and server response where applicable.'));
    }else{
      out.push(check('speed_lcp','Largest Contentful Paint (LCP)','unknown','LCP was not available from this navigation.','NOVA does not invent a performance value when the browser did not expose one.','No buffered largest-contentful-paint entry was available.',100,0,{label:'web.dev — Core Web Vitals',url:'https://web.dev/articles/vitals'},'Run a fresh reload and rescan, then validate with PageSpeed Insights or CrUX for field data.'));
    }
    const clsStatus=metrics.cls<=.1?'pass':metrics.cls<=.25?'warn':'fail';
    out.push(check('speed_cls','Cumulative Layout Shift (CLS)',clsStatus,`Observed CLS: ${metrics.cls.toFixed(3)}.`,'CLS is a Core Web Vital for unexpected visual instability. Common thresholds are good ≤0.1, needs improvement 0.1–0.25, poor >0.25.',`Buffered layout-shift entries during this page session produced CLS ${metrics.cls.toFixed(3)}.`,91,5,{label:'web.dev — Core Web Vitals thresholds',url:'https://web.dev/articles/vitals'},clsStatus==='pass'?'No automatic layout-instability issue detected in this session.':'Check late-loading banners, images without reserved dimensions, font swaps, injected widgets, and sticky UI.'));
    if(metrics.inp!=null){
      const s=metrics.inp<=200?'pass':metrics.inp<=500?'warn':'fail';
      out.push(check('speed_inp','Interaction to Next Paint (INP)',s,`Largest observed interaction duration: ${Math.round(metrics.inp)}ms.`,'INP is a Core Web Vital for responsiveness. It requires actual interactions, so a scan may not observe enough data.',`Maximum observed PerformanceEventTiming interaction duration: ${Math.round(metrics.inp)} ms.`,82,4,{label:'web.dev — INP',url:'https://web.dev/articles/inp'},s==='pass'?'Continue validating with real-user data.':'Reduce long main-thread tasks and expensive interaction handlers; confirm with DevTools and field data.'));
    }else{
      out.push(check('speed_inp','Interaction to Next Paint (INP)','unknown','No qualifying user interaction was observed during the scan.','INP cannot be truthfully measured without interaction data.','No PerformanceEventTiming interaction entry was available.',100,0,{label:'web.dev — INP',url:'https://web.dev/articles/inp'},'Use Chrome UX Report / PageSpeed field data or interact with the page before rescanning.'));
    }
    if(metrics.ttfb!=null){
      const s=metrics.ttfb<=800?'pass':metrics.ttfb<=1800?'warn':'fail';
      out.push(check('speed_ttfb','Server response / TTFB',s,`Observed TTFB: ${Math.round(metrics.ttfb)}ms.`,'Slow initial response can delay all downstream rendering, though one local navigation is not representative of all users.',`Navigation Timing responseStart - requestStart = ${Math.round(metrics.ttfb)} ms.`,84,3,{label:'web.dev — TTFB',url:'https://web.dev/articles/ttfb'},s==='pass'?'No automatic TTFB warning from this navigation.':'Validate CDN, caching, backend work, redirects, and regional latency.'));
    }
    return out;
  }

  function findLikelyProductCards(){
    const cand=allVisibleDeep('[class*="product-card" i],[class*="product-item" i],[class*="product-tile" i],[data-product-id],article,li');
    return cand.filter(e=>{
      const r=e.getBoundingClientRect(), t=txt(e);
      if(r.width<120||r.height<120||t.length<4||t.length>1400) return false;
      const hasImg=!!e.querySelector('img,picture');
      const hasPrice=!![...e.querySelectorAll('[class*="price" i],[data-price],.money,span,p')].find(x=>/[0-9٠-٩]/.test(txt(x))&&txt(x).length<80);
      const hasLink=!!e.querySelector('a[href]');
      return hasImg&&hasLink&&hasPrice;
    }).slice(0,80);
  }

  function plpChecks(){
    const out=[];
    const h1=allVisibleDeep('h1').find(x=>txt(x).length>1);
    const cards=findLikelyProductCards();
    out.push(h1?check('plp_heading','Category / listing heading','pass','A visible primary listing heading was detected.','A clear category/search-result heading helps users understand the current product set.',rectEvidence(h1),94,6,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},'Keep the heading specific to the current collection or query.'):check('plp_heading','Category / listing heading','warn','No reliable visible H1 was detected.','Users need context for the product set they are browsing.','No visible H1 matched.',88,4,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},'Expose a clear page/category/search heading.'));
    out.push(cards.length>=2?check('plp_cards','Product list','pass',`${cards.length} product-card-like items were detected.`,'PLP usability depends on a scannable set of product options.',cards.slice(0,3).map(rectEvidence).join(' | '),92,12,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},'Keep card layout consistent and avoid hiding key comparison information.'):check('plp_cards','Product list','fail',`Only ${cards.length} product-card-like item(s) were reliably detected.`,'A product listing page requires a usable set of product options.','NOVA looked for repeated visible cards containing image, link and price-like content.',89,12,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},'Verify that product cards are rendered accessibly and contain sufficient decision information.'));
    if(cards.length){
      const sample=cards.slice(0,12);
      const withTitle=sample.filter(c=>[...c.querySelectorAll('a,h2,h3,h4,[class*="title" i],[class*="name" i]')].some(x=>txt(x).length>1)).length;
      const withPrice=sample.filter(c=>[...c.querySelectorAll('*')].some(x=>/price/i.test(String(x.className||''))&&/[0-9٠-٩]/.test(txt(x)))).length;
      const withImg=sample.filter(c=>!!c.querySelector('img,picture')).length;
      const good=withTitle/sample.length>=.75&&withPrice/sample.length>=.75&&withImg/sample.length>=.9;
      out.push(check('plp_card_info','Product-card decision information',good?'pass':'warn',`${withTitle}/${sample.length} sampled cards had title signals, ${withPrice}/${sample.length} price signals, ${withImg}/${sample.length} images.`,'Baymard research shows list-item information is critical for deciding which products are worth opening.',sample.slice(0,3).map(rectEvidence).join(' | '),82,10,{label:'Baymard — Product listing information',url:'https://baymard.com/blog/product-listing-information'},good?'No major automatic card-information gap detected.':'Make product name, active price, imagery and category-relevant attributes consistently available on each card.'));
    }
    const sort=findByText('button,label,select,summary,div',['sort','sort by','ترتيب','رتب حسب']).filter(e=>txt(e).length<100);
    out.push(sort.length?check('plp_sort','Sorting control','pass','A visible sorting control was detected.','Sorting lets users prioritize relevant products within a list.',rectEvidence(sort[0]),88,6,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},'Ensure sort choices match user priorities for this category.'):check('plp_sort','Sorting control','warn','No reliable sorting control was detected.','Sorting becomes increasingly useful as result sets grow.','No concise visible sort control matched.',80,4,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},'For non-trivial product sets, provide useful sort options such as relevance, price, newest or popularity where appropriate.'));
    const filter=findByText('button,label,summary,div',['filter','filters','تصفية','فلتر']).filter(e=>txt(e).length<100);
    const filterRequired=cards.length>=12;
    out.push(filter.length?check('plp_filter','Filtering controls','pass','A visible filtering entry point was detected.','Filtering helps users narrow large product sets to relevant items.',rectEvidence(filter[0]),88,filterRequired?8:3,{label:'Baymard — Filtering UX',url:'https://baymard.com/learn/ecommerce-filter-ui'},'Keep applied filters visible and easy to remove.'):check('plp_filter','Filtering controls',filterRequired?'warn':'review',filterRequired?'No filtering control was detected despite a relatively large visible product set.':'No filtering control was detected, but the visible result set is small enough that this may be acceptable.','Filtering needs depend on catalog size and category complexity.',`Visible product-card count: ${cards.length}.`,84,filterRequired?7:0,{label:'Baymard — Filtering UX',url:'https://baymard.com/learn/ecommerce-filter-ui'},filterRequired?'Provide category-relevant filters and an applied-filter overview.':'Review based on total catalog size, not only the currently rendered card count.'));
    const load=findByText('button,a',['load more','show more','next','التالي','عرض المزيد','تحميل المزيد']);
    const pagination=allVisibleDeep('[class*="pagination" i],nav[aria-label*="pagination" i]');
    out.push(load.length||pagination.length?check('plp_load','Product loading / pagination','pass','A product-list continuation control was detected.','Users need a predictable way to continue browsing longer lists.',rectEvidence(load[0]||pagination[0]),83,4,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},'Preserve list position and applied filters when users return from a PDP.'):check('plp_load','Product loading / pagination','unknown','No explicit pagination or load-more control was detected.','The list may be short or use infinite loading; NOVA does not penalize without proof that more products exist.','No visible pagination/load-more signal matched.',90,0,{label:'Baymard — Product Lists & Filtering UX',url:'https://baymard.com/research/ecommerce-product-lists'},''));
    return out;
  }

  function cartChecks(){
    const out=[];
    const rows=allVisibleDeep('[class*="cart-item" i],[class*="line-item" i],[data-cart-item],tr,li').filter(e=>{
      const t=txt(e);return t.length>10&&t.length<1600&&e.querySelector('img')&&/[0-9٠-٩]/.test(t);
    }).slice(0,40);
    out.push(rows.length?check('cart_items','Cart line items','pass',`${rows.length} cart-item-like row(s) were detected.`,'Users need a clear summary of what they are about to purchase.',rows.slice(0,3).map(rectEvidence).join(' | '),90,12,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Keep product identity, variant, quantity and price easy to verify.'):check('cart_items','Cart line items','warn','No reliable cart line-item structure was detected.','The page may be an empty cart, but a populated cart requires clear item summaries.','No repeated image + price cart-row pattern matched.',80,6,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'If the cart is populated, ensure line items expose product, variation, quantity and price clearly.'));
    const qty=allVisibleDeep('input[type="number"],select,[class*="quantity" i],button[aria-label*="quantity" i]');
    out.push(qty.length?check('cart_quantity','Quantity controls','pass','Quantity adjustment controls were detected.','Users should be able to correct quantities before checkout.',rectEvidence(qty[0]),91,7,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Keep quantity changes immediate and update totals clearly.'):check('cart_quantity','Quantity controls',rows.length?'warn':'unknown',rows.length?'No reliable quantity control was detected.':'No populated cart was verified.','Quantity controls are expected for most multi-item carts.',rows.length?'Cart rows detected but no number/select/quantity control matched.':'No cart rows to evaluate.',87,rows.length?5:0,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},rows.length?'Provide an obvious quantity adjustment mechanism unless product rules prevent it.':''));
    const remove=findByText('button,a',['remove','delete','حذف','إزالة','ازالة']).filter(e=>txt(e).length<60);
    out.push(remove.length?check('cart_remove','Remove item control','pass','A remove/delete item control was detected.','Users need a clear way to correct cart mistakes.',rectEvidence(remove[0]),90,6,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Make the result of removal obvious and reversible where practical.'):check('cart_remove','Remove item control',rows.length?'warn':'unknown',rows.length?'No reliable remove-item control was detected.':'No populated cart was verified.','A populated cart normally needs an obvious removal path.',rows.length?'Cart rows detected but no remove/delete wording matched.':'No cart rows to evaluate.',84,rows.length?4:0,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},rows.length?'Expose a clear remove control for each cart item.':''));
    const total=findByText('div,p,span,strong,td',['subtotal','total','الإجمالي','المجموع']).filter(e=>/[0-9٠-٩]/.test(txt(e))&&txt(e).length<140);
    out.push(total.length?check('cart_subtotal','Subtotal / total','pass','A cart total/subtotal signal was detected.','Cost clarity is essential before checkout.',rectEvidence(total[0]),91,10,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Keep the amount visually prominent and update it immediately after cart changes.'):check('cart_subtotal','Subtotal / total','fail','No reliable subtotal/total signal was detected.','Users should understand the cart amount before proceeding.','No concise total/subtotal text with numeric amount matched.',86,10,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Expose a clear subtotal/total close to the checkout action.'));
    const checkout=findByText('button,a,input',['checkout','check out','proceed to checkout','إتمام الطلب','اتمام الطلب','الدفع']).filter(e=>txt(e).length<100);
    out.push(checkout.length?check('cart_checkout','Checkout action','pass','A checkout action was detected.','The cart needs a clear next step into checkout.',rectEvidence(checkout[0]),96,14,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Keep the checkout CTA visually dominant over secondary cart actions.'):check('cart_checkout','Checkout action','fail','No reliable checkout action was detected.','A populated cart needs an obvious path to checkout.','No visible checkout/proceed-to-checkout action matched.',92,14,{label:'Baymard — Cart & Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Expose a prominent checkout action in the cart summary.'));
    const del=textEvidenceCandidates(['shipping','delivery','شحن','توصيل']).filter(e=>txt(e).length<220);
    out.push(del.length?check('cart_delivery','Shipping / delivery context','pass','Shipping/delivery wording was detected in the cart.','Unexpected shipping costs or timing can create late-stage uncertainty.',rectEvidence(del[0]),79,6,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Prefer specific cost/timing or clearly state when it will be calculated.'):check('cart_delivery','Shipping / delivery context','warn','No shipping/delivery context was detected in the cart.','Users benefit from knowing whether shipping is known now or calculated later.','No concise shipping/delivery wording matched.',76,4,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Clarify shipping cost/timing or when it will be calculated before the user commits to checkout.'));
    return out;
  }

  function checkoutChecks(){
    const out=[];
    const text=norm(document.body?.innerText||'');
    const summary=allVisibleDeep('[class*="order-summary" i],[class*="checkout-summary" i],[class*="summary" i],aside').find(e=>/[0-9٠-٩]/.test(txt(e))&&txt(e).length>20);
    out.push(summary?check('checkout_summary','Order summary','pass','An order-summary-like region was detected.','Users need to verify items and costs before placing an order.',rectEvidence(summary),84,10,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Keep item, quantity, price, shipping/tax and final total easy to verify.'):check('checkout_summary','Order summary','warn','No reliable order-summary region was detected.','A checkout should let users verify what they are buying and the total cost.','No summary-like region with numeric order content matched.',78,6,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Provide a persistent or easily accessible order summary.'));
    const email=allVisibleDeep('input[type="email"],input[autocomplete="email"],input[name*="email" i]');
    const phone=allVisibleDeep('input[type="tel"],input[autocomplete="tel"],input[name*="phone" i]');
    out.push(email.length||phone.length?check('checkout_contact','Contact information','pass','A contact-information field was detected.','Contact details support confirmations and delivery communication.',rectEvidence(email[0]||phone[0]),94,6,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Ask only for information needed to fulfill and communicate the order.'):check('checkout_contact','Contact information','unknown','No contact field was visible in the current checkout step.','The checkout may be multi-step or the field may have been completed earlier.','No visible email/phone input matched.',92,0,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},''));
    const address=allVisibleDeep('input[autocomplete*="address"],input[name*="address" i],input[name*="city" i],input[name*="postal" i],input[name*="zip" i]');
    out.push(address.length>=2?check('checkout_address','Address fields','pass',`${address.length} visible address-related fields were detected.`,'Shipping/billing details must be collected clearly when required.',address.slice(0,3).map(rectEvidence).join(' | '),92,8,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Use autocomplete, sensible defaults and concise labels to reduce input friction.'):check('checkout_address','Address fields','unknown','Address collection was not reliably visible in this checkout state.','Digital goods, pickup, saved addresses or multi-step checkouts may not show address fields here.',`Visible address-like inputs: ${address.length}.`,95,0,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},''));
    const pay=findByText('button,label,div,span,h2,h3',['payment','credit card','apple pay','google pay','paypal','مدى','الدفع','بطاقة']).filter(e=>txt(e).length<140);
    out.push(pay.length?check('checkout_payment','Payment options / step','pass','A visible payment-related signal was detected.','The payment method and next step should be clear at checkout.',rectEvidence(pay[0]),88,10,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Make available payment methods understandable before the final commitment.'):check('checkout_payment','Payment options / step','unknown','No payment method/step was visible in this checkout state.','The checkout may be multi-step or payment may appear later.','No visible payment wording matched.',93,0,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},''));
    const submit=findByText('button,input,a',['place order','complete order','pay now','confirm order','إتمام الطلب','اتمام الطلب','تأكيد الطلب','ادفع الآن','الدفع الآن']).filter(e=>txt(e).length<120);
    out.push(submit.length?check('checkout_submit','Final order action','pass','A final order/payment action was detected.','The commitment action should be clear and visually distinct.',rectEvidence(submit[0]),95,12,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},'Make the action label accurately describe the commitment and final step.'):check('checkout_submit','Final order action','unknown','No final order action was visible in this checkout state.','A multi-step checkout may not expose the final action yet.','No place-order/pay-now style action matched.',95,0,{label:'Baymard — Checkout UX',url:'https://baymard.com/research/checkout-usability'},''));
    return out;
  }

  function homeChecks(){
    const out=[];
    const nav=allVisibleDeep('nav,[role="navigation"]').find(e=>e.querySelectorAll('a').length>=2);
    out.push(nav?check('home_nav','Primary navigation','pass','A multi-link navigation region was detected.','Users need a predictable route into product categories and key areas.',rectEvidence(nav),89,8,{label:'Baymard — Ecommerce navigation research',url:'https://baymard.com/research/ecommerce-navigation'},'Keep labels category-oriented and avoid overly broad ambiguous buckets.'):check('home_nav','Primary navigation','warn','No reliable primary navigation region was detected.','Commerce homepages normally need a clear route into the catalog.','No visible nav/role=navigation with multiple links matched.',80,5,{label:'Baymard — Ecommerce navigation research',url:'https://baymard.com/research/ecommerce-navigation'},'Expose clear primary navigation into the main shopping categories.'));
    const search=allVisibleDeep('input[type="search"],input[placeholder*="search" i],[role="search"],button[aria-label*="search" i]');
    out.push(search.length?check('home_search','Site search','pass','A search entry point was detected.','Search is important for users who arrive with a specific product or category in mind.',rectEvidence(search[0]),90,4,{label:'Baymard — Ecommerce search UX',url:'https://baymard.com/research/ecommerce-search'},'Keep search easy to discover, especially for larger catalogs.'):check('home_search','Site search','review','No site-search entry point was detected.','Very small catalogs may not require search; larger catalogs usually do.','No visible search input/role/button matched.',86,0,{label:'Baymard — Ecommerce search UX',url:'https://baymard.com/research/ecommerce-search'},'Review based on catalog size and how often users know what they want.'));
    const cards=findLikelyProductCards();
    const categoryLinks=allVisibleDeep('a').filter(a=>a.querySelector('img,picture')&&txt(a).length>1&&txt(a).length<80).slice(0,30);
    out.push(categoryLinks.length>=3?check('home_categories','Category / collection entry points','pass',`${categoryLinks.length} image-backed navigation links were detected.`,'Homepages should help users enter meaningful product scopes rather than force undirected browsing.',categoryLinks.slice(0,3).map(rectEvidence).join(' | '),72,6,{label:'Baymard — Ecommerce navigation research',url:'https://baymard.com/research/ecommerce-navigation'},'Use categories that reflect how customers actually shop.'):check('home_categories','Category / collection entry points','warn','Few clear image-backed category/collection entry points were detected.','The homepage should provide obvious paths into the catalog.',`Detected ${categoryLinks.length} likely visual category links.`,70,4,{label:'Baymard — Ecommerce navigation research',url:'https://baymard.com/research/ecommerce-navigation'},'Provide clear category or collection paths near the main content.'));
    out.push(cards.length>=3?check('home_products','Product discovery section','pass',`${cards.length} product-card-like items were detected on the homepage.`,'Featured, popular or relevant products can accelerate discovery.',cards.slice(0,3).map(rectEvidence).join(' | '),82,5,{label:'Baymard — Ecommerce homepage / navigation research',url:'https://baymard.com/research/ecommerce-navigation'},'Keep merchandising purposeful rather than showing arbitrary products.'):check('home_products','Product discovery section','review','No strong repeated product-card section was detected.','A homepage can work through categories rather than products, so this is not an automatic issue.','No repeated product-card pattern with image, link and price was verified.',82,0,{label:'Baymard — Ecommerce navigation research',url:'https://baymard.com/research/ecommerce-navigation'},'Review whether category-first or product-first discovery best matches the store.'));
    const cart=findByText('a,button',['cart','bag','basket','السلة','سلة']).filter(e=>txt(e).length<60);
    out.push(cart.length?check('home_cart','Cart access','pass','A cart/bag access point was detected.','Users should be able to review cart contents consistently from the storefront.',rectEvidence(cart[0]),90,6,{label:'Baymard — Cart UX',url:'https://baymard.com/research/checkout-usability'},'Keep cart state and item count understandable.'):check('home_cart','Cart access','warn','No reliable cart/bag access point was detected.','Commerce sites normally provide persistent access to the cart.','No visible cart/bag wording matched.',80,4,{label:'Baymard — Cart UX',url:'https://baymard.com/research/checkout-usability'},'Expose a persistent cart entry point in the global header/navigation.'));
    return out;
  }

  function enhancedPdpChecks(c){
    const out=[];
    const title=c.title, price=c.prices[0], action=c.actions[0]?.el||null;
    const mainImg=allVisibleDeep('img').filter(img=>{const r=img.getBoundingClientRect();return r.width>=180&&r.height>=180;}).sort((a,b)=>{const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();return br.width*br.height-ar.width*ar.height;})[0];
    out.push(mainImg?check('product_media','Primary product media','pass','A large visible product image was detected.','Product imagery is a primary evaluation input on PDPs.',rectEvidence(mainImg),91,9,REF.images,'Keep the main image large, sharp and supported by additional relevant views.'):check('product_media','Primary product media','fail','No large visible product image was reliably detected.','Users need clear product imagery to evaluate most physical products.','No visible image ≥180×180 CSS px matched.',86,9,REF.images,'Expose a clear primary product image in the main PDP content.'));

    const reviewTerms=['review','reviews','rating','ratings','تقييم','التقييمات','مراجعة','المراجعات','آراء','اراء'];
    const ratingEls=findByText('a,button,p,div,span,li,h2,h3,summary',reviewTerms).filter(e=>txt(e).length<220);
    const ratingSchema=readJsonLd().find(o=>/product/i.test(String(o['@type']||''))&&(o.aggregateRating||o.review));
    const reviewSection=allVisibleDeep('[id*="review" i],[class*="review" i],[data-review],section').find(e=>norm(txt(e)).match(/review|rating|تقييم|مراجعة/)&&txt(e).length>40);
    const reviewCountText=(ratingEls.map(txt).join(' ')+' '+JSON.stringify(ratingSchema?.aggregateRating||''));
    const countMatch=reviewCountText.match(/(?:reviewCount|ratingCount|reviews?|تقييمات?|مراجعات?)\D{0,12}([0-9٠-٩]{1,7})/i);
    const hasSummary=ratingEls.length>0||!!ratingSchema?.aggregateRating;
    if(hasSummary&&reviewSection){
      out.push(check('reviews_deep','Ratings & reviews system','pass','A rating/review summary and a review-content region were both detected.','Reviews support product evaluation; the summary should lead users to substantive review content.',`${rectEvidence(ratingEls[0]||reviewSection)} | review section: ${rectEvidence(reviewSection)}${countMatch?` | count signal: ${countMatch[1]}`:''}`,92,9,REF.reviews,'Keep the rating summary linked to the review section and make review content easy to scan, sort or filter when volume is high.'));
    }else if(hasSummary&&!reviewSection){
      out.push(check('reviews_deep','Ratings & reviews system','warn','A rating/review summary was detected, but NOVA could not verify substantive review content on the page.','A rating badge without accessible review content can leave users unable to inspect the evidence behind the score.',rectEvidence(ratingEls[0]||null),87,6,REF.reviews,'Ensure the rating summary opens or scrolls to real review content; do not rely on stars alone.'));
    }else{
      out.push(check('reviews_deep','Ratings & reviews system','review','No reliable ratings/reviews system was detected.','Not every product has reviews, so NOVA does not hard-fail the page. However, the store should intentionally handle the zero-review state.',ratingSchema?'Review schema exists without a visible summary.':'No visible review wording, review region, or aggregateRating schema was verified.',90,0,REF.reviews,'If customer reviews exist, surface them clearly. If the product has zero reviews, use an honest zero-review state rather than fabricated social proof.'));
    }

    // Visual hierarchy: relative vertical order in document
    const elems=[['title',title],['price',price],['purchase action',action]].filter(x=>x[1]);
    if(elems.length>=3){
      const pos=Object.fromEntries(elems.map(([k,e])=>[k,documentPosition(e)]));
      const titleToPrice=pos.price.top-pos.title.top;
      const priceToCta=pos['purchase action'].top-pos.price.top;
      const bad=titleToPrice>Math.max(700,innerHeight*.9)||priceToCta>Math.max(850,innerHeight);
      const reversed=pos.price.top<pos.title.top-120 || pos['purchase action'].top<pos.price.top-350;
      const status=(bad||reversed)?'warn':'pass';
      out.push(check('visual_order','PDP decision-element order',status,status==='pass'?'Title, price and purchase action appear in a reasonably compact decision sequence.':'The title, price and purchase action are unusually separated or ordered in the rendered document.','NOVA uses a conservative layout heuristic: price and purchase action should not be buried far away from product identity. This is a structural check, not a claim that one universal layout is optimal.',`Title y=${Math.round(pos.title.top)}; price y=${Math.round(pos.price.top)}; purchase action y=${Math.round(pos['purchase action'].top)}; title→price ${Math.round(titleToPrice)}px; price→CTA ${Math.round(priceToCta)}px.`,88,8,REF.pdp,status==='pass'?'No major automatic hierarchy-distance issue detected.':'Review whether users can connect product identity, price and the main purchase action without excessive scrolling or visual separation.'));
    }else{
      out.push(check('visual_order','PDP decision-element order','unknown','Could not evaluate the full title → price → purchase-action sequence.','The hierarchy check requires all three elements to be reliably detected.',`Detected: ${elems.map(x=>x[0]).join(', ')||'none'}.`,99,0,REF.pdp,''));
    }

    for(const [id,label,el,w] of [['title_visibility','Product title visibility',title,4],['price_visibility','Price visibility',price,7],['cta_visibility','Purchase-action visual clarity',action,9]]){
      const v=visibilityAudit(el,label);
      out.push(check(id,label,v.status,v.status==='pass'?`${label} passed basic rendered visibility and text-contrast checks.`:`${label} needs visual review.`,'A detected element can still be hard to perceive because of low contrast, opacity, clipping, or very small rendering.',v.evidence,91,w,{label:'W3C WCAG — Contrast (Minimum)',url:'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'},v.status==='pass'?'No basic contrast/visibility issue detected; still validate visual hierarchy in context.':'Increase contrast/legibility or fix clipping so the element is clearly perceivable in its rendered state.'));
    }

    // Detect overlapping fixed/floating UI with purchase CTA
    if(action){
      const ar=action.getBoundingClientRect();
      const overlays=allVisibleDeep('body *').filter(el=>{
        if(el===action||action.contains(el)||el.contains(action)) return false;
        const cs=getComputedStyle(el);
        if(!/fixed|sticky/.test(cs.position)||parseFloat(cs.opacity||1)<.1) return false;
        const r=el.getBoundingClientRect();
        if(r.width<30||r.height<30) return false;
        const ix=Math.max(0,Math.min(ar.right,r.right)-Math.max(ar.left,r.left));
        const iy=Math.max(0,Math.min(ar.bottom,r.bottom)-Math.max(ar.top,r.top));
        return ix*iy>Math.min(ar.width*ar.height*.12,1200);
      }).slice(0,8);
      out.push(check('cta_overlap','Purchase-action obstruction',overlays.length?'warn':'pass',overlays.length?'A fixed/sticky element overlaps the detected purchase action.':'No meaningful fixed/sticky overlap with the purchase action was detected.','Floating chat, promo or navigation UI can reduce CTA visibility or tap reliability, especially on mobile.',overlays.length?overlays.slice(0,3).map(rectEvidence).join(' | '):rectEvidence(action),93,8,REF.mobile,overlays.length?'Reposition or resize the overlapping floating UI so the purchase action remains fully visible and tappable.':'No automatic obstruction issue detected.'));
    }

    return out;
  }

  function scoreReport(page,checks){
    const potential=checks.filter(x=>x.weight>0);
    const scored=potential.filter(x=>!['unknown','review'].includes(x.status));
    const denom=scored.reduce((s,x)=>s+x.weight,0);
    const pts=scored.reduce((s,x)=>s+x.weight*(x.status==='pass'?1:x.status==='warn'?0.28:0),0);
    const potentialWeight=potential.reduce((s,x)=>s+x.weight,0);
    const scoredWeight=scored.reduce((s,x)=>s+x.weight,0);
    const coverage=potentialWeight?Math.round(scoredWeight/potentialWeight*100):0;
    let score=denom?Math.round((pts/denom*100)*(.67+.33*(coverage/100))):null;
    if(score!=null){
      const fails=checks.filter(x=>x.status==='fail');
      const warns=checks.filter(x=>x.status==='warn');
      const critical=fails.filter(x=>x.weight>=10);
      if(critical.length>=1) score=Math.min(score,68);
      if(critical.length>=2) score=Math.min(score,55);
      if(fails.length>=4) score=Math.min(score,60);
      if(warns.filter(x=>x.weight>=7).length>=3) score=Math.min(score,74);
      if(page.confidence<70) score=Math.min(score,76);
      if(coverage<65) score=Math.min(score,75);
    }
    return {score,coverage,scoredCount:scored.length};
  }

  function genericChecks(){
    const out=[];
    const viewport=document.querySelector('meta[name="viewport"]')?.content||'';
    out.push(viewport
      ? check('viewport','Responsive viewport configuration','pass','A viewport meta tag is present.','This is a technical prerequisite for predictable mobile rendering.',`content="${viewport}"`,99,0,null,'Keep validating the actual rendered mobile layout; the tag alone does not prove good mobile UX.')
      : check('viewport','Responsive viewport configuration','warn','No viewport meta tag was found.','Missing viewport configuration can produce poor mobile rendering.','No meta[name="viewport"] found.',99,0,null,'Add an appropriate viewport meta tag and test the rendered mobile layout.'));

    const overflow=document.documentElement.scrollWidth>document.documentElement.clientWidth+2;
    out.push(check('overflow','Horizontal viewport overflow',overflow?'fail':'pass',overflow?'The document is wider than the viewport.':'No document-level horizontal overflow was detected.','Unexpected horizontal scrolling can create interaction and readability problems.',`scrollWidth ${document.documentElement.scrollWidth}px; clientWidth ${document.documentElement.clientWidth}px.`,99,4,null,overflow?'Inspect the widest overflowing element and fix its width, positioning, or wrapping behavior.':'No action required from this check.'));
    return out;
  }

  function pdpChecks(c){
    const out=[];
    out.push(c.title
      ? check('product_title','Product title','pass','A visible primary product title was detected.','The product name anchors product evaluation and page orientation.',rectEvidence(c.title),96,6,REF.pdp,'Keep the product title specific and easy to scan.')
      : check('product_title','Product title','fail','No reliable visible product title was detected.','The product name anchors product evaluation and page orientation.','No visible H1/common product-name element matched.',89,6,REF.pdp,'Expose the product name as a clear visible primary heading.'));

    out.push(c.prices.length
      ? check('price','Product price','pass','A visible price-like element was detected.','Price is a core part of product evaluation and the buy section.',rectEvidence(c.prices[0]),93,9,REF.pdp,'Keep the active selling price visually unambiguous, especially when discounts are present.')
      : check('price','Product price','fail','No reliable visible price was detected.','Price is a core part of product evaluation and the buy section.','No visible price-like element with numeric content matched.',84,9,REF.pdp,'Expose the active product price clearly in the main buy section.'));

    if(c.actions.length){
      const primary=c.actions[0];
      const cta=primary.el;
      const r=cta.getBoundingClientRect();
      const addCount=c.addToCart.length;
      const buyCount=c.buyNow.length;
      const stickyATC=c.addToCart.find(x=>x.fixed||x.stickyEdge);
      const detectedLabel=primary.kind==='add_to_cart'?'Add to Cart':'Buy Now / quick purchase';
      out.push(check('cta','Primary purchase action','pass',`${detectedLabel} was detected${stickyATC?' including a sticky/fixed Add to Cart':''}.`,'A reliable purchase action is a core PDP control.',`${rectEvidence(cta)} | detection: ${primary.via||'text/ARIA/data/class signals'} | Add to Cart: ${addCount} | Buy now: ${buyCount}${stickyATC?' | sticky/fixed ATC detected':''}`,98,14,REF.pdp,'Keep the primary purchase action clearly reachable in the active product/variant state.'));

      const anyReachable=c.actions.some(x=>{const q=x.el.getBoundingClientRect();return (q.bottom>0&&q.top<innerHeight)||(x.fixed||x.stickyEdge);});
      const stickyEvidence=stickyATC?`Sticky/fixed Add to Cart: ${rectEvidence(stickyATC.el)}.`:'';
      out.push(check('cta_view','Purchase action reachability',anyReachable?'pass':'warn',anyReachable?'A purchase action is reachable in the current rendered viewport or through a sticky/fixed control.':'Detected purchase actions are outside the current viewport and no sticky/fixed purchase control was verified.','For mobile especially, reachability should account for sticky/fixed Add to Cart patterns rather than only the original button position.',`${c.actions.slice(0,4).map(x=>`${x.kind}: top ${Math.round(x.el.getBoundingClientRect().top)}px, position ${getComputedStyle(x.el).position}`).join(' | ')} ${stickyEvidence}`,99,5,REF.mobile,anyReachable?'No automatic reachability issue detected.':'Review whether the buy action remains easy to reach after users scroll through product content.'));

      const small=c.actions.filter(x=>{const q=x.el.getBoundingClientRect();return q.width<24||q.height<24;});
      out.push(check('cta_target','Purchase target size',small.length?'fail':'pass',small.length?'At least one detected purchase action is smaller than 24 CSS px in one dimension.':'Detected purchase actions meet the 24×24 CSS px minimum.','WCAG 2.2 defines a minimum target-size criterion with exceptions.',small.length?small.slice(0,3).map(x=>rectEvidence(x.el)).join(' | '):c.actions.slice(0,2).map(x=>rectEvidence(x.el)).join(' | '),99,4,REF.target,small.length?'Increase undersized purchase targets or validate that a WCAG exception applies.':'No action required from this check.'));

      if(c.buyNow.length===0){
        out.push(check('buy_now','Direct / quick purchase action','review','No separate Buy Now / quick-purchase action was verified.','A direct-purchase button is not universally required and should not be confused with Add to Cart.',`Add to Cart detected: ${addCount}; Buy Now detected: 0.`,99,0,REF.pdp,'Only add a direct-purchase action if it fits the store journey and does not create confusing CTA competition.'));
      }else{
        out.push(check('buy_now','Direct / quick purchase action','pass',`${buyCount} direct/quick purchase action(s) detected.`,'This is reported separately from Add to Cart so NOVA does not mislabel a missing quick-buy button as a missing purchase path.',c.buyNow.slice(0,3).map(x=>rectEvidence(x.el)).join(' | '),98,0,REF.pdp,'Keep the visual hierarchy between Add to Cart and direct purchase intentional.'));
      }
    } else {
      out.push(check('cta','Primary purchase action','fail','No reliable Add to Cart or Buy action was detected after multi-signal scanning.','A clear purchase action is a core part of the PDP buy section.','NOVA checked visible text, ARIA labels, values, data attributes, common product/cart forms, fixed/sticky controls, and open shadow roots.',95,14,REF.pdp,'Expose a clear purchase action when the product is purchasable; if unavailable, expose an explicit stock state instead.'));
      out.push(check('cta_view','Purchase action reachability','unknown','Could not evaluate because no purchase action was reliably detected.','Reachability requires a verified purchase control.','No purchase action to measure.',100,0,REF.mobile,''));
      out.push(check('cta_target','Purchase target size','unknown','Could not evaluate target size.','Target-size checks require a verified purchase control.','No purchase action to measure.',100,0,REF.target,''));
      out.push(check('buy_now','Direct / quick purchase action','unknown','Could not evaluate direct purchase separately because no purchase controls were verified.','No inference is made without evidence.','No purchase action to classify.',100,0,REF.pdp,''));
    }

    const decision=decisionRegion(c.ctas[0]);
    const anchors=[c.ctas[0],c.prices[0],c.title].filter(Boolean);
    const shippingTerms=['shipping','delivery','deliver','free shipping','dispatch','arrival','شحن','التوصيل','توصيل','الشحن','موعد التوصيل','يصلك','مدة التوصيل'];
    const shipping=textEvidenceCandidates(shippingTerms);
    const shippingRanked=shipping.map(el=>({el,strength:detailStrength(txt(el),'shipping'),distance:Math.min(...anchors.map(a=>proximityTo(el,a)??99999)),placement:classifyPlacement(el,anchors)})).sort((a,b)=>b.strength-a.strength||a.distance-b.distance);
    const shipConcrete=shippingRanked.find(x=>x.strength>0 && x.placement!=='footer');
    const shipGeneric=shippingRanked.find(x=>x.placement!=='footer');
    const shipFooter=shippingRanked.find(x=>x.placement==='footer');
    if(shipConcrete){
      const near=shipConcrete.placement==='decision-area'||shipConcrete.distance<900;
      out.push(check('shipping','Shipping / delivery clarity',near?'pass':'warn',near?'Concrete delivery/shipping detail was verified close to the buying decision.':'Concrete delivery/shipping detail exists, but it is not close to the buying decision.','NOVA only passes this when it verifies a concrete timing, cost, threshold, or equivalent delivery detail outside a footer-only policy link.',`${rectEvidence(shipConcrete.el)} | detail signals: ${shipConcrete.strength} | placement: ${shipConcrete.placement} | approx. ${shipConcrete.distance}px from decision anchor`,97,13,REF.shipping,near?'Keep delivery cost/timing specific and easy to find near the product decision.':'Repeat a concise delivery estimate/cost/threshold nearer the buy section.'));
    }else if(shipGeneric){
      out.push(check('shipping','Shipping / delivery clarity','warn','Shipping-related wording was found, but NOVA could not verify a concrete delivery promise.','A generic “Shipping” label or policy link is not proof that the shopper can understand delivery timing or cost while deciding.',`${rectEvidence(shipGeneric.el)} | placement: ${shipGeneric.placement} | concrete detail signals: ${shipGeneric.strength}`,96,13,REF.shipping,'Show a concise delivery summary with a real timing, cost, threshold, or destination-dependent estimate near the buy section.'));
    }else if(shipFooter){
      out.push(check('shipping','Shipping / delivery clarity','fail','Only footer-level shipping information was found; no decision-stage delivery detail was verified.','Footer policy discoverability does not answer the delivery question at the purchase decision.',`${rectEvidence(shipFooter.el)} | placement: footer`,97,13,REF.shipping,'Surface a concise delivery estimate/cost/threshold in or near the product buy section.'));
    }else{
      out.push(check('shipping','Shipping / delivery clarity','fail','No reliable delivery/shipping information was verified on the rendered page.','Baymard research documents strong user demand for shipping information during product evaluation.','NOVA swept the rendered page and found no concrete shipping/delivery evidence.',96,13,REF.shipping,'Add visible delivery/shipping information close to the buying decision, including timing, cost, threshold, or destination logic.'));
    }

    const returnTerms=['return','returns','refund','exchange','استرجاع','الاسترجاع','استبدال','الاستبدال','ارجاع','إرجاع'];
    const returns=conciseMatches(decision,returnTerms);
    const returnRanked=returns.map(el=>({el,strength:detailStrength(txt(el),'returns'),distance:proximityTo(el,c.ctas[0])})).sort((a,b)=>b.strength-a.strength||((a.distance??99999)-(b.distance??99999)));
    const retBest=returnRanked[0];
    if(retBest?.strength>=1){
      const far=retBest.distance!=null&&retBest.distance>1400;
      out.push(check('returns','Returns / exchange clarity',far?'warn':'pass',far?'Concrete return/exchange detail exists, but it is far from the detected purchase area.':'Concrete return/exchange detail was detected in the product decision area.','Users may need return conditions to reduce uncertainty before purchase.',`${rectEvidence(retBest.el)} | detail signals: ${retBest.strength}${retBest.distance!=null?` | approx. ${retBest.distance}px from CTA`:''}`,95,9,REF.returns,far?'Bring a short return/exchange summary closer to the product decision area.':'Keep the return/exchange rule concise, specific, and discoverable from the PDP.'));
    } else if(retBest){
      out.push(check('returns','Returns / exchange clarity','warn','Return/exchange wording or a policy link exists, but the scanner could not verify a concrete condition on the PDP.','Policy discoverability matters, but a generic link does not prove the policy is clear.',rectEvidence(retBest.el),93,9,REF.returns,'Expose a short summary such as the return window or key eligibility condition, with a link to full policy details.'));
    } else {
      out.push(check('returns','Returns / exchange clarity','fail','No reliable return/exchange information was verified in the product decision area.','Return policy information can reduce purchase uncertainty and is commonly sought on PDPs.','No concise visible return/refund/exchange element was detected inside the product/main decision region.',90,9,REF.returns,'Add a concise return/exchange summary or clearly discoverable policy entry near the product content.'));
    }

    const reviewTerms=['review','reviews','rating','ratings','تقييم','التقييمات','مراجعة','المراجعات','آراء','اراء'];
    const reviewEls=findByText('a,button,p,div,span,li,h2,h3,summary',reviewTerms).filter(e=>txt(e).length<200);
    const stars=allVisible('[aria-label*="star" i],[class*="rating" i],[class*="stars" i],[data-rating]');
    out.push(reviewEls.length||stars.length
      ? check('reviews','Ratings / reviews','pass','A visible ratings or reviews signal was detected.','Reviews are a major product-evaluation input in Baymard’s PDP research.',rectEvidence(reviewEls[0]||stars[0]),89,8,REF.reviews,'Keep rating/review access obvious and ensure the review content remains usable, filterable, and trustworthy when volume grows.')
      : check('reviews','Ratings / reviews','warn','No reliable visible ratings/reviews signal was detected.','Not every product will have reviews, so absence is a review item rather than an automatic hard failure.','No visible review/rating wording or common rating element matched.',78,5,REF.reviews,'If reviews exist, make the rating summary and review section easy to discover; if there are no reviews, avoid fabricating social proof.'));

    const imgs=allVisible('img').filter(img=>{const r=img.getBoundingClientRect();return r.width>=140&&r.height>=140;});
    if(imgs.length){
      const main=[...imgs].sort((a,b)=>b.getBoundingClientRect().width*b.getBoundingClientRect().height-a.getBoundingClientRect().width*a.getBoundingClientRect().height)[0];
      const r=main.getBoundingClientRect();
      const ratio=Math.min(main.naturalWidth/(r.width||1),main.naturalHeight/(r.height||1));
      const adequate=main.complete&&main.naturalWidth>0?ratio>=1:null;
      out.push(check('image_resolution','Main image source resolution',adequate===null?'unknown':adequate?'pass':'warn',adequate===null?'Image intrinsic resolution could not be verified.':adequate?'The main image source is at least as large as its rendered size.':'The main image is rendered larger than its intrinsic source in at least one dimension.','Insufficient image resolution can hinder visual product evaluation.',`Rendered ${Math.round(r.width)}×${Math.round(r.height)}; intrinsic ${main.naturalWidth}×${main.naturalHeight}.`,93,7,REF.images,adequate===false?'Serve a larger source image and validate zoom/detail quality on high-density displays.':'Validate zoom/detail quality for products where visual inspection matters.'));
      const alt=(main.getAttribute('alt')||'').trim();
      out.push(check('image_alt','Main image text alternative',alt?'pass':'warn',alt?'The main image has non-empty alt text.':'The main image has empty/missing alt text.','Informative images should have appropriate text alternatives; decorative images are an exception.',alt?`alt="${alt.slice(0,150)}"`:'alt is empty or missing.',98,4,REF.alt,alt?'Validate that the alt describes the image purpose rather than stuffing keywords.':'If this is an informative product image, add an appropriate text alternative.'));
    }else{
      out.push(check('image_resolution','Main image source resolution','unknown','Could not reliably identify a product-scale image.','Product imagery is central to many PDPs.','No visible image ≥140×140 CSS px found.',86,0,REF.images,''));
      out.push(check('image_alt','Main image text alternative','unknown','Could not evaluate main image alt text.','Informative images should have appropriate alternatives.','No main image identified.',86,0,REF.alt,''));
    }

    const thumbs=allVisible('img').filter(img=>{const r=img.getBoundingClientRect();return r.width>=28&&r.width<=125&&r.height>=28&&r.height<=125;});
    out.push(thumbs.length>=2
      ? check('thumbs','Additional-image discoverability','pass',`${thumbs.length} thumbnail-sized visible images were detected.`,'Thumbnail representations can make additional product imagery easier to discover.',thumbs.slice(0,4).map(rectEvidence).join(' | '),79,5,REF.thumbs,'Make sure hidden/overflowing gallery items are clearly signposted.')
      : check('thumbs','Additional-image discoverability','unknown','Could not verify that the product has multiple images requiring thumbnail navigation.','A single-image product should not be penalized for not having a gallery. ',`Detected ${thumbs.length} thumbnail-sized visible images.`,72,0,REF.thumbs,''));

    const sizeWords=['size','المقاس','المقاسات','مقاس'];
    const sizeLabels=findByText('label,legend,span,div,p,h3',sizeWords).filter(e=>txt(e).length<90);
    if(sizeLabels.length){
      const nearby=sizeLabels[0].parentElement||document;
      const select=allVisible('select',nearby)[0]||allVisible('select').find(s=>/size|مقاس/i.test(`${s.name} ${s.id} ${txt(s)}`));
      const buttons=allVisible('button,[role="radio"],label',nearby).filter(e=>txt(e).length>0&&txt(e).length<=15);
      const dropdownOnly=!!select&&buttons.length<2;
      out.push(check('size_selector','Size selection pattern',dropdownOnly?'warn':'pass',dropdownOnly?'Size appears to be primarily hidden in a dropdown.':'Size context was detected without a clear dropdown-only pattern.','Baymard research favors exposed size choices where size is a relevant product variation.',select?rectEvidence(select):`${buttons.length} button/radio-like choices detected.`,86,6,REF.size,dropdownOnly?'Consider exposing available sizes as buttons/radios so availability is scannable without opening a menu.':'Keep unavailable and selected states visually explicit.'));
    }else{
      out.push(check('size_selector','Size selection pattern','unknown','No reliable size-variation context was detected.','This rule applies only to products with size variations.','No short visible size label matched.',91,0,REF.size,''));
    }

    const descTerms=['description','details','product details','الوصف','وصف المنتج','التفاصيل','تفاصيل المنتج','المواصفات'];
    const desc=findByText('h2,h3,summary,button,div,p',descTerms).filter(e=>txt(e).length<200);
    out.push(desc.length
      ? check('description','Product description / details','pass','A product description/details cue was detected.','Descriptions and specifications support product evaluation.',rectEvidence(desc[0]),78,6,REF.pdp,'Keep product information specific, scannable, and matched to the questions shoppers need answered.')
      : check('description','Product description / details','warn','No reliable product description/details cue was detected.','Some simple products need less copy, so this is a review item rather than a hard fail.','No visible concise description/details/specification cue matched.',70,3,REF.pdp,'Confirm that the PDP answers product-specific questions through copy, specs, media, or clearly labeled sections.'));

    const stockTerms=['in stock','out of stock','sold out','available','غير متوفر','نفذت الكمية','متوفر','غير متاحة'];
    const stock=findByText('div,span,p,button,label',stockTerms).filter(e=>txt(e).length<90);
    out.push(stock.length
      ? check('stock','Stock state communication','pass','A visible availability/stock signal was detected.','Availability clarity prevents users from attempting impossible purchases or misunderstanding item state.',rectEvidence(stock[0]),82,4,REF.pdp,'Keep out-of-stock and unavailable-variation states explicit and actionable.')
      : check('stock','Stock state communication','unknown','No explicit stock-state wording was detected.','A purchasable product may not need a separate “in stock” label, so this is not automatically penalized.','No concise stock/availability wording matched.',74,0,REF.pdp,''));

    const breadcrumbs=allVisible('nav[aria-label*="breadcrumb" i],.breadcrumb,[class*="breadcrumb" i]');
    out.push(breadcrumbs.length
      ? check('breadcrumb','Breadcrumb / parent navigation','pass','Breadcrumb or parent-navigation markup was detected.','Cross-navigation can help users understand hierarchy and move back to broader product groups.',rectEvidence(breadcrumbs[0]),88,3,REF.pdp,'Keep breadcrumb labels meaningful and linked to useful parent categories.')
      : check('breadcrumb','Breadcrumb / parent navigation','warn','No reliable breadcrumb or parent-navigation pattern was detected.','Breadcrumbs are more important in deeper catalog structures than in very small stores.','No visible breadcrumb-like element matched.',78,2,REF.pdp,'For stores with meaningful category depth, provide clear parent navigation or breadcrumbs.'));

    const primaryCta=c.ctas[0]||null;
    const viewportCritical=[c.title,c.prices[0],primaryCta].filter(Boolean);
    const visibleCritical=viewportCritical.filter(el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;}).length;
    out.push(check('cro_clarity','CRO heuristic — Clarity',visibleCritical>=2?'pass':'warn',visibleCritical>=2?'Core product decision elements are visually available in the current viewport.':'Fewer than two core decision elements (title, price, purchase action) are visible in the current viewport.','Speero’s heuristic framework treats clarity as a core optimization lens; this automated check uses only observable proxies, not a human judgment.',`Visible core elements in viewport: ${visibleCritical}/${viewportCritical.length}.`,88,5,REF.speero,visibleCritical>=2?'Validate hierarchy and copy clarity with user research; this scanner only confirms element visibility.':'Review whether the current viewport gives users enough product identity, price, and purchase-action context.'));

    const actionable=allVisible('button,a,[role="button"]').filter(el=>{const r=el.getBoundingClientRect(); return r.top>=0&&r.top<innerHeight&&r.width>20&&r.height>20;});
    const noisy=actionable.length>14;
    out.push(check('cro_friction','CRO heuristic — Friction',noisy?'warn':'pass',noisy?`${actionable.length} visible interactive targets compete in the initial viewport.`:`${actionable.length} visible interactive targets were detected in the initial viewport.`,'Speero frames friction as doubts, hesitations, uncertainties, and difficulties. This proxy flags unusually dense interaction choices but cannot infer user intent.',`Viewport ${innerWidth}×${innerHeight}; ${actionable.length} visible button/link targets.`,80,5,REF.speero,noisy?'Review whether secondary actions, banners, chat widgets, or navigation compete with the primary shopping task.':'No automatic high-density interaction warning; still validate friction with behavioral data.'));

    const purchaseCopy=primaryCta?norm(txt(primaryCta)):'';
    out.push(check('cro_motivation','CRO heuristic — Motivation','review','Motivation cannot be truthfully scored from DOM presence alone.','Speero includes motivation as a heuristic dimension, but persuasive strength depends on audience, offer, message, and context. The scanner therefore refuses to auto-pass it.',primaryCta?`Detected purchase action text: “${txt(primaryCta).slice(0,90)}”. Human review still required.`:'No purchase action available for copy review.',99,0,REF.speero,'Review value proposition, offer strength, urgency/scarcity claims, social proof quality, and message-market fit with customer research or experiments.'));

    if(innerWidth<=600){
      const tinyTargets=allVisible('button,a,input,select,[role="button"]').filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<24||r.height<24);}).slice(0,12);
      out.push(check('mobile_targets','Mobile tap-target audit',tinyTargets.length?'warn':'pass',tinyTargets.length?`${tinyTargets.length}+ visible interactive targets are smaller than 24px in at least one dimension.`:'No visible interactive target below 24px was found in the sampled mobile viewport.','Small touch targets can increase interaction difficulty on mobile.',tinyTargets.length?tinyTargets.slice(0,4).map(rectEvidence).join(' | '):`Viewport ${innerWidth}×${innerHeight}.`,96,5,REF.target,tinyTargets.length?'Increase undersized touch targets or spacing, checking WCAG exceptions where relevant.':'Continue validating on real devices and common mobile widths.'));
    }

    return out;
  }

  function buildRecommendations(checks){
    const sev={fail:3,warn:2,unknown:0,pass:0};
    return checks.filter(x=>(x.status==='fail'||x.status==='warn')&&x.recommendation)
      .sort((a,b)=>(sev[b.status]*100+b.weight)-(sev[a.status]*100+a.weight))
      .slice(0,6)
      .map(x=>({title:x.title,action:x.recommendation,reference:x.reference,status:x.status}));
  }

  async function waitForSettle(){
    const start=performance.now();
    if(document.readyState!=='complete') await new Promise(resolve=>window.addEventListener('load',resolve,{once:true}));
    await sleep(650);
    let lastText=document.body?.innerText?.length||0;
    let lastHeight=document.documentElement.scrollHeight;
    let stable=0;
    for(let i=0;i<9;i++){
      await sleep(350);
      const nowText=document.body?.innerText?.length||0;
      const nowHeight=document.documentElement.scrollHeight;
      if(Math.abs(nowText-lastText)<40 && Math.abs(nowHeight-lastHeight)<8) stable++; else stable=0;
      lastText=nowText; lastHeight=nowHeight;
      if(stable>=3) break;
    }
    const originalX=scrollX, originalY=scrollY;
    const maxY=Math.max(0,document.documentElement.scrollHeight-innerHeight);
    const points=[0,.2,.4,.6,.8,1].map(f=>Math.round(maxY*f));
    for(const y of points){
      window.scrollTo({top:y,left:originalX,behavior:'auto'});
      await sleep(230);
    }
    window.scrollTo({top:originalY,left:originalX,behavior:'auto'});
    await sleep(320);
    const important=[...document.images].filter(img=>visible(img)&&img.getBoundingClientRect().width>100).slice(0,24);
    await Promise.all(important.map(img=>img.complete?Promise.resolve():Promise.race([new Promise(r=>img.addEventListener('load',r,{once:true})),sleep(1000)])));
    await sleep(260);
    return performance.now()-start;
  }

  async function scan(){
    const start=performance.now();
    await waitForSettle();
    const jsonLd=readJsonLd();
    const page=pageSignals(jsonLd);
    const currency=detectCurrency(jsonLd);
    const site={
      platform:detectPlatform(),
      language:document.documentElement.lang||navigator.language||'',
      currency,
      market:detectMarket(currency,jsonLd),
      category:detectCategory(jsonLd)
    };
    const perf=await collectPerformanceMetrics();
    const checks=[...genericChecks(), ...performanceChecks(perf)];
    if(page.type==='PDP'){
      const c=productCandidates();
      checks.push(...pdpChecks(c), ...enhancedPdpChecks(c));
      // retire the older shallow reviews check from score to avoid double counting
      const old=checks.find(x=>x.id==='reviews');
      if(old){ old.weight=0; old.summary=`Legacy signal: ${old.summary}`; }
    } else if(page.type==='PLP') checks.push(...plpChecks());
    else if(page.type==='CART') checks.push(...cartChecks());
    else if(page.type==='CHECKOUT') checks.push(...checkoutChecks());
    else if(page.type==='HOME') checks.push(...homeChecks());

    const scored=scoreReport(page,checks);
    const counts={
      scored:scored.scoredCount,
      unknown:checks.filter(x=>x.status==='unknown').length,
      fail:checks.filter(x=>x.status==='fail').length,
      warn:checks.filter(x=>x.status==='warn').length,
      pass:checks.filter(x=>x.status==='pass').length,
      review:checks.filter(x=>x.status==='review').length
    };
    return {
      ok:true,
      version:'0.5.0',
      url:location.href,
      title:document.title,
      score:scored.score,
      coverage:scored.coverage,
      scanDurationMs:Math.round(performance.now()-start),
      page:{...page,viewport:{width:innerWidth,height:innerHeight}},
      site,
      performance:perf,
      knowledge:PAGE_KNOWLEDGE[page.type]||[],
      counts,
      checks,
      recommendations:buildRecommendations(checks)
    };
  }

  chrome.runtime.onMessage.addListener((msg,_sender,sendResponse)=>{
    if(msg?.type==='NOVA_DEEP_SCAN'){
      scan().then(sendResponse).catch(e=>sendResponse({ok:false,error:e?.message||String(e)}));
      return true;
    }
  });
})();
