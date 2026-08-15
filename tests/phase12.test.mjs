import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const scoring=fs.readFileSync('apps/web/lib/competitors/scoring.ts','utf8');const discovery=fs.readFileSync('apps/web/lib/competitors/discovery.ts','utf8');const research=fs.readFileSync('apps/web/app/projects/[id]/research/page.tsx','utf8');const css=fs.readFileSync('apps/web/app/styles.css','utf8');
test('market is the highest-weight competitor signal',()=>{assert.match(scoring,/marketOverlap:\.28/);assert.match(scoring,/currencyMatch:\.08/);assert.match(scoring,/languageMatch:\.06/)});
test('known market mismatch applies a hard score cap',()=>{assert.match(scoring,/differentKnownMarket/);assert.match(scoring,/Math\.min\(match,52\)/)});
test('discovery expands local then regional then global',()=>{const local=discovery.indexOf("scope:'local'");const regional=discovery.indexOf("scope:'regional'");const global=discovery.indexOf("scope:'global'");assert.ok(local>-1&&regional>local&&global>regional)});
test('research page exposes primary market and pricing intelligence',()=>{assert.match(research,/Primary market/);assert.match(research,/Price range/);assert.match(research,/Shipping markets/)});
test('contrast pass uses readable dark text on light surfaces',()=>{assert.match(css,/--text:#1f1730/);assert.match(css,/--muted:#5a5266/);assert.match(css,/background:#fff/)});
