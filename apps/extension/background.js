const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function waitForTabComplete(tabId, timeout = 18000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.status === 'complete') return tab;
    } catch (_) {}
    await sleep(250);
  }
  throw new Error('Timed out while loading the requested viewport.');
}

async function sendScan(tabId, profile) {
  let lastError;
  for (let i = 0; i < 10; i++) {
    try {
      return await chrome.tabs.sendMessage(tabId, {type:'NOVA_DEEP_SCAN', profile});
    } catch (e) {
      lastError = e;
      await sleep(350);
    }
  }
  throw lastError || new Error('Scanner did not become ready.');
}

async function runProfileScan(url, profile) {
  const dims = profile === 'mobile'
    ? {width: 430, height: 900}
    : {width: 1440, height: 1000};

  const win = await chrome.windows.create({
    url,
    type: 'popup',
    focused: false,
    width: dims.width,
    height: dims.height,
    left: 20,
    top: 20
  });
  const tabId = win.tabs?.[0]?.id;
  if (!tabId) {
    if (win.id) await chrome.windows.remove(win.id).catch(()=>{});
    throw new Error('Could not create a viewport test window.');
  }

  try {
    await waitForTabComplete(tabId);
    await sleep(profile === 'mobile' ? 900 : 700);
    const report = await sendScan(tabId, profile);
    if (report?.page?.viewport) report.page.requestedProfile = profile;
    return report;
  } finally {
    if (win.id) await chrome.windows.remove(win.id).catch(()=>{});
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== 'RUN_PROFILE_SCAN') return;
  (async () => {
    if (!/^https?:/i.test(msg.url || '')) throw new Error('Open a normal website page first.');
    return runProfileScan(msg.url, msg.profile === 'mobile' ? 'mobile' : 'desktop');
  })().then(sendResponse).catch(e => sendResponse({ok:false,error:e?.message || String(e)}));
  return true;
});
