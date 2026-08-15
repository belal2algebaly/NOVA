import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const benchmark = fs.readFileSync('apps/web/lib/engines/benchmark.ts', 'utf8');
const action = fs.readFileSync('apps/web/app/actions/benchmark.ts', 'utf8');
const scanner = fs.readFileSync('apps/web/lib/audit/server-scanner.ts', 'utf8');

test('benchmark engine accepts scanner evidence arrays', () => {
  assert.match(scanner, /evidence:string\[\]/);
  assert.match(benchmark, /evidence\?: string \| string\[\]/);
  assert.match(benchmark, /normalizeEvidence/);
  assert.match(benchmark, /Array\.isArray\(evidence\)/);
});

test('benchmark action uses local build-safe engines', () => {
  assert.match(action, /\.\.\/\.\.\/lib\/engines\/benchmark/);
  assert.match(action, /\.\.\/\.\.\/lib\/engines\/opportunity/);
  assert.doesNotMatch(action, /@nova\//);
});
