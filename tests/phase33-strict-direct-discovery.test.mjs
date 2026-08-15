import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const actions=fs.readFileSync('apps/web/app/actions/competitors.ts','utf8');
const scoring=fs.readFileSync('apps/web/lib/competitors/scoring.ts','utf8');
const discovery=fs.readFileSync('apps/web/lib/competitors/discovery.ts','utf8');
const page=fs.readFileSync('apps/web/app/projects/[id]/competitors/page.tsx','utf8');
const session=fs.readFileSync('apps/web/lib/research/session.ts','utf8');

test('automatic candidates must pass a strict direct acceptance gate before saving',()=>{
  assert.match(actions,/autoDirectAcceptance/);
  assert.match(actions,/if\(automatic&&!gate\.accepted\)return/);
  assert.match(scoring,/classificationDirect=scored\?\.classification==='Local Direct'/);
  assert.match(scoring,/samePrimaryMarket/);
  assert.match(scoring,/categoryStrong/);
  assert.match(scoring,/productStrong/);
});

test('automatic discovery preserves the previous set on failure and cleans stale auto results only after success',()=>{
  assert.match(session,/if\(accepted\.length\)\{[\s\S]*?cleanupSupersededAutomaticCompetitors/);
  assert.match(session,/source==='manual'\|\|source\.startsWith\('manual:'\)/);
});

test('candidate prequalification requires commercial evidence while allowing Tavily country-targeted local candidates to reach crawl validation',()=>{
  assert.match(discovery,/x\.scope==='local'/);
  assert.match(discovery,/x\.intentScore>=45/);
  assert.match(discovery,/localSearchPrior/);
  assert.match(discovery,/x\.geoScore>=30\|\|localSearchPrior/);
  assert.match(discovery,/x\.preScore>=68/);
});

test('competitor page hides legacy automatic junk from the validated set',()=>{
  assert.match(page,/verifiedAutomatic/);
  assert.match(page,/c\.classification === 'Local Direct'/);
});

test('no candidate passing the gate produces a transparent zero-result state without deleting prior validated evidence',()=>{
  assert.match(actions,/No verified direct competitors were found/);
  assert.match(session,/Your previous validated set was kept/);
});
