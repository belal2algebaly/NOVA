import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const actions=fs.readFileSync('apps/web/app/actions/competitors.ts','utf8');
const session=fs.readFileSync('apps/web/lib/research/session.ts','utf8');
const benchmark=fs.readFileSync('apps/web/app/actions/benchmark.ts','utf8');
const ux=fs.readFileSync('apps/web/components/CompetitorDiscoveryExperience.tsx','utf8');
const intelligence=fs.readFileSync('apps/web/lib/competitors/store-intelligence.ts','utf8');

test('competitor research server action returns structured outcomes instead of catching Next redirects',()=>{
 const start=actions.indexOf('export async function discoverProjectCompetitors');
 const end=actions.indexOf('export async function recordCompetitorFeedback');
 const block=actions.slice(start,end);
 assert.match(block,/Promise<DiscoveryActionResult>/);
 assert.match(block,/return \{ok:false/);
 assert.doesNotMatch(block,/redirect\(/);
});
test('failed research preserves the previous validated set and records the real search error',()=>{
 assert.match(session,/previousSetPreserved:!accepted\.length/);
 assert.match(session,/if\(accepted\.length\)\{[\s\S]*?cleanupSupersededAutomaticCompetitors/);
 assert.doesNotMatch(session,/from\('competitors'\)\.delete\(\)\.eq\('project_id',projectId\)\.neq\('source','manual'\)/);
 assert.match(session,/searchError/);
});
test('candidate validation uses a bounded crawl mode for production runtime safety',()=>{
 assert.match(session,/understandStore\(url,\{mode:'validation'\}\)/);
 assert.match(intelligence,/mode\?:'deep'\|'validation'/);
 assert.match(intelligence,/discovered\.slice\(0,validation\?3:10\)/);
});
test('discovery UX hides stale results while pending and refreshes after structured result',()=>{
 assert.match(ux,/pending\?<DiscoveryLoader/);
 assert.match(ux,/router\.refresh\(\)/);
 assert.match(ux,/Research did not produce a new verified set/);
});
test('benchmark redirect is executed after error handling rather than from inside the try block',()=>{
 assert.match(benchmark,/let destination=''/);
 assert.match(benchmark,/redirect\(destination\)/);
});
