import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('Phase 8 assigns the platform owner as super admin without storing a password',()=>{
 const sql=read('infra/supabase/008_super_admin.sql');
 assert.match(sql,/belal\.ecom1@gmail\.com/i);
 assert.match(sql,/super_admin/);
 assert.doesNotMatch(sql,/515315/);
});

test('Super admin console exposes global platform surfaces',()=>{
 const page=read('apps/web/app/admin/page.tsx');
 assert.match(page,/auth\.admin\.listUsers/);
 assert.match(page,/workspaces/);
 assert.match(page,/projects/);
 assert.match(page,/audit_runs/);
 assert.match(page,/competitors/);
});

test('Purple UI includes developer credit and social destinations',()=>{
 const css=read('apps/web/app/styles.css');
 const bar=read('apps/web/components/DeveloperBar.tsx');
 assert.match(css,/--accent:#6f45ff/i);
 assert.match(css,/developerSweep/);
 assert.match(bar,/Belal Algebaly/);
 assert.match(bar,/linkedin\.com\/in\/belal-algebaly-2ab015308/);
 assert.match(bar,/facebook\.com\/profile\.php\?id=61585212901611/);
});

test('Admin route is middleware protected',()=>{
 assert.match(read('apps/web/middleware.ts'),/\/admin/);
});
