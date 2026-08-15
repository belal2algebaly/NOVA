import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../apps/web/app/styles.css',import.meta.url),'utf8');
const doc=readFileSync(new URL('../docs/NOVA-UI20-VISUAL-REFORGE.md',import.meta.url),'utf8');

test('UI20 high contrast tokens are present',()=>{
 assert.match(css,/--text:#181221/);
 assert.match(css,/--muted:#625a6c/);
 assert.match(css,/--line-strong:#c8c2d2/);
});

test('UI20 contains all 20 phases',()=>{
 for(let i=1;i<=20;i++) assert.match(css,new RegExp(`Phase ${String(i).padStart(2,'0')}`));
});

test('UI20 preserves mobile navigation and one-column narrow layout',()=>{
 assert.match(css,/\.novaNav\{position:fixed!important/);
 assert.match(css,/@media\(max-width:480px\)[\s\S]*\.grid\{grid-template-columns:1fr!important\}/);
});

test('UI20 documentation is explicit about UI-only scope',()=>{
 assert.match(doc,/Twenty UI-only phases/);
 assert.match(doc,/No product logic/);
});
