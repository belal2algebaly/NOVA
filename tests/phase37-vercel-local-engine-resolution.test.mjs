import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const action=fs.readFileSync('apps/web/app/actions/benchmark.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('apps/web/package.json','utf8'));
const next=fs.readFileSync('apps/web/next.config.mjs','utf8');

test('benchmark runtime engines resolve inside the web app',()=>{
  assert.match(action,/lib\/engines\/benchmark/);
  assert.match(action,/lib\/engines\/opportunity/);
  assert.doesNotMatch(action,/@nova\/benchmark-engine|@nova\/opportunity-engine/);
  assert.ok(fs.existsSync('apps/web/lib/engines/benchmark.ts'));
  assert.ok(fs.existsSync('apps/web/lib/engines/opportunity.ts'));
});

test('web package no longer depends on local workspace engine packages',()=>{
  assert.equal(pkg.dependencies?.['@nova/benchmark-engine'],undefined);
  assert.equal(pkg.dependencies?.['@nova/opportunity-engine'],undefined);
  assert.doesNotMatch(next,/@nova\/benchmark-engine|@nova\/opportunity-engine/);
});
