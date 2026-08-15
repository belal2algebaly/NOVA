import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const actions=fs.readFileSync('apps/web/app/actions/competitors.ts','utf8');
const scoring=fs.readFileSync('apps/web/lib/competitors/scoring.ts','utf8');
const discovery=fs.readFileSync('apps/web/lib/competitors/discovery.ts','utf8');
const page=fs.readFileSync('apps/web/app/projects/[id]/competitors/page.tsx','utf8');

test('automatic candidates must pass a strict direct acceptance gate before saving',()=>{
  assert.match(actions,/autoDirectAcceptance/);
  assert.match(actions,/if\(automatic&&!gate\.accepted\)return/);
  assert.match(scoring,/classificationDirect=scored\?\.classification==='Local Direct'/);
  assert.match(scoring,/samePrimaryMarket/);
  assert.match(scoring,/categoryStrong/);
  assert.match(scoring,/productStrong/);
});

test('automatic discovery clears old auto-generated competitors but preserves manual entries',()=>{
  assert.match(actions,/delete\(\)\.eq\('project_id',projectId\)\.neq\('source','manual'\)/);
});

test('candidate prequalification requires local geo and commercial evidence',()=>{
  assert.match(discovery,/x\.scope==='local'/);
  assert.match(discovery,/x\.geoScore>=30/);
  assert.match(discovery,/x\.intentScore>=45/);
  assert.match(discovery,/x\.preScore>=72/);
});

test('competitor page hides legacy automatic junk from the validated set',()=>{
  assert.match(page,/verifiedAutomatic/);
  assert.match(page,/c\.classification === 'Local Direct'/);
});

test('no candidate passing the gate produces a transparent zero-result state',()=>{
  assert.match(actions,/none passed the strict Local Direct verification gate/);
  assert.match(actions,/No sites were invented or saved/);
});
