import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../apps/web/app/styles.css',import.meta.url),'utf8');
const sidebar=fs.readFileSync(new URL('../apps/web/components/Sidebar.tsx',import.meta.url),'utf8');
const nav=fs.readFileSync(new URL('../apps/web/components/NavLinks.tsx',import.meta.url),'utf8');

test('UI V3 phase 21 uses sectioned navigation with active route state',()=>{
 assert.match(sidebar,/Workspace/); assert.match(sidebar,/Intelligence/); assert.match(sidebar,/Output/);
 assert.match(nav,/usePathname/); assert.match(nav,/navLink active/);
});

test('UI V3 phase 22 creates a sticky command canvas',()=>{
 assert.match(css,/Phase 22/); assert.match(css,/\.pageHeader\{position:sticky/); assert.match(css,/novaCanvasIn/);
});

test('UI V3 phase 23 replaces heavy boxes with cleaner data surfaces',()=>{
 assert.match(css,/Phase 23/); assert.match(css,/\.metric:before/); assert.match(css,/box-shadow:none!important/);
});

test('UI V3 phase 24 keeps navigation usable as a mobile command dock',()=>{
 assert.match(css,/bottom:66px/); assert.match(css,/scroll-snap-type:x proximity/); assert.match(css,/flex:0 0 72px/);
});

test('UI V3 phase 25 includes reduced-motion-safe interaction polish',()=>{
 assert.match(css,/Phase 25/); assert.match(css,/prefers-reduced-motion:reduce/); assert.match(css,/nova-ease/);
});
