import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const discovery=fs.readFileSync('apps/web/lib/competitors/discovery.ts','utf8');
const page=fs.readFileSync('apps/web/app/projects/[id]/competitors/page.tsx','utf8');
const ux=fs.readFileSync('apps/web/components/CompetitorDiscoveryExperience.tsx','utf8');
const status=fs.readFileSync('apps/web/lib/system/status.ts','utf8');

test('Tavily is primary live retrieval when configured',()=>{
  assert.match(discovery,/TAVILY_API_KEY/);
  assert.match(discovery,/https:\/\/api\.tavily\.com\/search/);
  assert.match(discovery,/search_depth:'basic'/);
  assert.match(discovery,/body\.country=country/);
  assert.ok(discovery.indexOf('searchTavily(q,profile)') < discovery.indexOf('searchSearx(base,q)'));
});

test('AI does not invent competitor domains',()=>{
  assert.match(ux,/every competitor domain must come from real search evidence/);
  assert.match(discovery,/No weak or invented domains were saved/);
});

test('competitor research errors are returned through one client outcome while manual URL errors remain visible',()=>{
  assert.match(ux,/DiscoveryOutcome/);
  assert.match(ux,/setOutcome\(result\)/);
  assert.match(page,/q\.error\s*&&/);
});

test('system health reports Tavily connectivity',()=>{
  assert.match(status,/Tavily Live Search/);
  assert.match(status,/api\.tavily\.com\/usage/);
});
