let report = null;
let currentFilter = 'all';
let currentProfile = 'current';
const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function setProfileButtons(disabled=false){
  document.querySelectorAll('.view-btn').forEach(btn=>{
    btn.disabled=disabled;
    btn.classList.toggle('active',btn.dataset.profile===currentProfile);
  });
}

async function getActiveTab(){
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tab?.id || !/^https?:/.test(tab.url || '')) throw new Error('Open a normal website page first.');
  return tab;
}

async function runCurrent(tab){
  let lastError;
  for(let i=0;i<6;i++){
    try{return await chrome.tabs.sendMessage(tab.id,{type:'NOVA_DEEP_SCAN',profile:'current'});}catch(e){lastError=e;await sleep(250);}
  }
  throw lastError || new Error('Scanner is not ready on this page.');
}

async function scan(profile=currentProfile) {
  currentProfile=profile;
  setProfileButtons(true);
  $('state').classList.remove('hidden');
  ['siteInfo','summary','pageRequirements','recommendations','filters','method'].forEach(id => $(id).classList.add('hidden'));
  $('results').innerHTML = '';
  $('scanTitle').textContent = profile==='current' ? 'Preparing deep scan…' : `Preparing ${profile} viewport…`;
  $('scanSub').textContent = profile==='current'
    ? 'Waiting for dynamic content, layout and product media to settle.'
    : 'Reloading the same page in a temporary responsive viewport before inspection.';
  try {
    const tab = await getActiveTab();
    await sleep(250);
    $('scanTitle').textContent = 'Reading the rendered page…';
    $('scanSub').textContent = 'Sweeping the rendered page, detecting sticky actions, validating decision-area evidence and CRO friction.';
    report = profile==='current'
      ? await runCurrent(tab)
      : await chrome.runtime.sendMessage({type:'RUN_PROFILE_SCAN',url:tab.url,profile});
    if (!report?.ok) throw new Error(report?.error || 'Could not inspect this page.');
    $('scanTitle').textContent = 'Calibrating report…';
    $('scanSub').textContent = 'Cross-checking findings, confidence, severity and recommendation priority.';
    await sleep(180);
    render(report);
  } catch (e) {
    $('scanTitle').textContent = 'Could not scan this page';
    $('scanSub').textContent = `${e.message} If the extension was just installed or updated, refresh the webpage once.`;
  } finally {
    setProfileButtons(false);
  }
}

function render(r){
  $('state').classList.add('hidden');
  ['siteInfo','summary','pageRequirements','filters','method'].forEach(id => $(id).classList.remove('hidden'));
  if (r.recommendations?.length) $('recommendations').classList.remove('hidden');

  $('platform').textContent = r.site.platform;
  $('pageTypeInfo').textContent = `${r.page.type} (${r.page.confidence}%)`;
  $('category').textContent = r.site.category.label;
  $('category').title = `${r.site.category.confidence}% confidence · ${r.site.category.evidence}`;
  $('market').textContent = r.site.market.label;
  $('market').title = `${r.site.market.confidence}% confidence · ${r.site.market.evidence}`;
  $('language').textContent = r.site.language || 'Could not verify';
  $('currency').textContent = r.site.currency || 'Could not verify';
  $('pageUrl').textContent = r.url;
  $('pageUrl').href = r.url;
  $('scanTime').textContent = `${(r.scanDurationMs/1000).toFixed(1)}s scan`;
  $('classificationEvidence').textContent = `Classification evidence: ${r.page.evidence.join(' · ') || 'No strong page-type signal.'}`;
  const pm=r.performance||{};
  const metricClass=(key,val)=>{
    if(val==null) return '';
    if(key==='LCP') return val<=2500?'good':val<=4000?'warn':'bad';
    if(key==='CLS') return val<=.1?'good':val<=.25?'warn':'bad';
    if(key==='TTFB') return val<=800?'good':val<=1800?'warn':'bad';
    if(key==='INP') return val<=200?'good':val<=500?'warn':'bad';
    return '';
  };
  $('speedStrip').innerHTML = [
    ['LCP',pm.lcp,pm.lcp==null?'—':`${(pm.lcp/1000).toFixed(2)}s`],
    ['CLS',pm.cls,pm.cls==null?'—':Number(pm.cls).toFixed(3)],
    ['INP',pm.inp,pm.inp==null?'—':`${Math.round(pm.inp)}ms`],
    ['TTFB',pm.ttfb,pm.ttfb==null?'—':`${Math.round(pm.ttfb)}ms`]
  ].map(([k,v,label])=>`<div class="speed-metric ${metricClass(k,v)}"><span>${k}</span><strong>${label}</strong></div>`).join('');
  $('requirementsList').innerHTML=(r.knowledge||[]).map(x=>`<span class="req-chip ${escapeHtml(x[2])}"><b>${escapeHtml(x[1])}</b> · ${escapeHtml(x[2])}</span>`).join('');


  $('score').textContent = r.score == null ? '—' : `${r.score}`;
  $('pageType').textContent = `${r.page.type} · ${r.site.platform}`;
  const vp=r.page.viewport||{};
  $('confidence').textContent = `Page-type confidence ${r.page.confidence}% · rendered ${vp.width}×${vp.height}${r.page.requestedProfile?` · ${r.page.requestedProfile}`:''}`;
  $('coverageText').textContent = `${r.coverage ?? 0}%`;
  $('coverageBar').style.width = `${Math.max(0,Math.min(100,r.coverage ?? 0))}%`;
  $('scoreNote').textContent = r.score == null
    ? `NOVA could not build a calibrated score from enough verified evidence on this page. Findings are still shown without inventing a number.`
    : `${r.counts.scored} verified checks contributed to this page-type score. Unknown and human-review items are excluded from points, reduce evidence coverage, and critical misses cap the result.`;
  $('counts').innerHTML = `<span class="count-pill fail">${r.counts.fail} issues</span><span class="count-pill warn">${r.counts.warn} review</span><span class="count-pill pass">${r.counts.pass} pass</span><span class="count-pill review">${r.counts.review||0} human</span><span class="count-pill unknown">${r.counts.unknown} unverified</span>`;

  $('recommendationList').innerHTML = (r.recommendations || []).map((x,i)=>`
    <div class="rec"><div class="rec-title">${i+1}. ${escapeHtml(x.title)}</div><div class="rec-body">${escapeHtml(x.action)}</div>${x.reference?.label?`<div class="rec-source">Basis: ${escapeHtml(x.reference.label)}</div>`:''}</div>
  `).join('');
  renderResults();
  if(document.getElementById('sendToNova')) loadNovaPairing();
}

function renderResults(){
  if(!report) return;
  const rows = report.checks.filter(x => currentFilter === 'all' || x.status === currentFilter);
  $('results').innerHTML = rows.map((x)=>`
    <article class="result ${escapeHtml(x.status)}">
      <div class="result-head">
        <span class="badge"></span>
        <div><div class="result-title">${escapeHtml(x.title)}</div><div class="result-sub">${escapeHtml(x.summary)}</div></div>
        <div class="status-text">${escapeHtml(x.status)}</div>
      </div>
      <div class="details">
        <div><strong>Why it matters</strong><br>${escapeHtml(x.why)}</div>
        <div class="evidence"><strong>Observed evidence</strong><br>${escapeHtml(x.evidence)}</div>
        ${x.recommendation ? `<div class="recommendation"><strong>Recommendation</strong><br>${escapeHtml(x.recommendation)}</div>` : ''}
        <div><strong>Detection confidence:</strong> ${x.confidence}% ${x.weight ? `· Score weight ${x.weight}` : '· Not scored'}</div>
        ${x.reference?.url ? `<div class="reference"><strong>Reference:</strong> <a href="${x.reference.url}" target="_blank" rel="noreferrer">${escapeHtml(x.reference.label)}</a></div>`:''}
      </div>
    </article>`).join('');
  document.querySelectorAll('.result-head').forEach(el=>el.addEventListener('click',()=>el.parentElement.classList.toggle('open')));
}

function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

document.querySelectorAll('#filters button').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('#filters button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active'); currentFilter=btn.dataset.filter; renderResults();
}));
document.querySelectorAll('.view-btn').forEach(btn=>btn.addEventListener('click',()=>scan(btn.dataset.profile)));
$('rescan').addEventListener('click',()=>scan(currentProfile));
$('copyReport').addEventListener('click',async()=>{
  if(!report)return;
  const lines = [
    `NOVA v${report.version}`,
    `URL: ${report.url}`,
    `Viewport: ${report.page.viewport.width}x${report.page.viewport.height} (${report.page.requestedProfile||currentProfile})`,
    `Platform: ${report.site.platform}`,
    `Page type: ${report.page.type} (${report.page.confidence}% confidence)`,
    `Likely category: ${report.site.category.label} (${report.site.category.confidence}%)`,
    `Likely market: ${report.site.market.label} (${report.site.market.confidence}%)`,
    `Currency: ${report.site.currency || 'Unverified'}`,
    `CRO readiness score: ${report.score ?? 'N/A'}`,
    `Evidence coverage: ${report.coverage ?? 0}%`,
    `Speed: LCP ${report.performance?.lcp==null?'N/A':(report.performance.lcp/1000).toFixed(2)+'s'} | CLS ${report.performance?.cls??'N/A'} | INP ${report.performance?.inp==null?'N/A':Math.round(report.performance.inp)+'ms'} | TTFB ${report.performance?.ttfb==null?'N/A':Math.round(report.performance.ttfb)+'ms'}`,
    '',
    'Priority recommendations:',
    ...(report.recommendations || []).map((x,i)=>`${i+1}. ${x.title}: ${x.action}`),
    '',
    'Checks:',
    ...report.checks.map(x=>`[${x.status.toUpperCase()}] ${x.title}: ${x.evidence}${x.recommendation?` | Recommendation: ${x.recommendation}`:''}`),
    '',
    'By: Belal Algebaly'
  ];
  await navigator.clipboard.writeText(lines.join('\n'));
  $('copyReport').textContent='Copied'; setTimeout(()=>$('copyReport').textContent='Copy full report',1200);
});
scan('current');

async function loadNovaPairing(){
  const saved=await chrome.storage.local.get(['novaAppUrl','novaProjectId','novaExtensionKey']);
  $('appUrl').value=saved.novaAppUrl||'';$('projectId').value=saved.novaProjectId||'';$('extensionKey').value=saved.novaExtensionKey||'';
  const paired=Boolean(saved.novaAppUrl&&saved.novaProjectId&&saved.novaExtensionKey);$('syncState').textContent=paired?'paired':'not paired';$('sendToNova').disabled=!paired||!report;
}
$('savePairing').addEventListener('click',async()=>{const novaAppUrl=$('appUrl').value.trim().replace(/\/$/,'');const novaProjectId=$('projectId').value.trim();const novaExtensionKey=$('extensionKey').value.trim();await chrome.storage.local.set({novaAppUrl,novaProjectId,novaExtensionKey});$('syncMessage').textContent=novaAppUrl&&novaProjectId&&novaExtensionKey?'Pairing saved locally in Chrome.':'Complete all three fields to pair.';await loadNovaPairing();});
$('sendToNova').addEventListener('click',async()=>{if(!report)return;const saved=await chrome.storage.local.get(['novaAppUrl','novaProjectId','novaExtensionKey']);$('sendToNova').disabled=true;$('syncMessage').textContent='Sending evidence report…';try{const res=await fetch(`${saved.novaAppUrl}/api/extension/ingest`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({projectId:saved.novaProjectId,key:saved.novaExtensionKey,report})});const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.error||'Sync failed');$('syncMessage').textContent='Saved to NOVA Audit History.';}catch(e){$('syncMessage').textContent=`Sync failed: ${e.message}`;}finally{$('sendToNova').disabled=false;}});
loadNovaPairing();
