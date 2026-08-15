import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('Public homepage is constrained to a single-screen desktop composition',()=>{
 const page=read('apps/web/app/page.tsx');
 const css=read('apps/web/app/styles.css');
 assert.match(page,/landingOneScreen/);
 assert.match(css,/height:100svh/);
 assert.match(css,/heroOneScreen/);
});

test('Refined UI removes heavy glow treatment and lowers visual weight',()=>{
 const css=read('apps/web/app/styles.css');
 assert.match(css,/NOVA UI Refinement/);
 assert.match(css,/font-weight:650/);
 assert.match(css,/text-shadow:none/);
 assert.match(css,/box-shadow:none/);
});

test('Super Admin shows richer user activity and ownership data',()=>{
 const page=read('apps/web/app/admin/page.tsx');
 assert.match(page,/New · 7 days/);
 assert.match(page,/Active · 7 days/);
 assert.match(page,/Last sign in/);
 assert.match(page,/Provider/);
 assert.match(page,/Workspaces/);
 assert.match(page,/Projects/);
});

test('Visible JSX copy avoids terminal full stops',()=>{
 const files=['apps/web/app/page.tsx','apps/web/app/admin/page.tsx','apps/web/components/SetupNotice.tsx'];
 for(const file of files){
  const src=read(file);
  assert.doesNotMatch(src,/\.<\/(?:p|span|small|h1|h2|h3)>/);
 }
});
