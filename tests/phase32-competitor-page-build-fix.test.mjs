import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const file='apps/web/app/projects/[id]/competitors/page.tsx';
const src=fs.readFileSync(file,'utf8');

test('Competitor page keeps a single workspace closing section and formatted JSX',()=>{
  assert.match(src,/return \(\s*<main className="shell">/);
  assert.match(src,/<CompetitorDiscoveryExperience[\s\S]*?\/>\s*<\/section>\s*<\/main>/);
  assert.doesNotMatch(src,/<\/section>\s*<\/section>\s*<\/main>/);
});

test('Competitor page preserves discovery experience and market quality meter',()=>{
  assert.match(src,/CompetitorDiscoveryExperience/);
  assert.match(src,/Store understanding quality/);
  assert.match(src,/storeUnderstandingQuality/);
});
