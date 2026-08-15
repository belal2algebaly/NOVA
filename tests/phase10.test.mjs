import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('owner email is explicit root identity and self heals role',()=>{const s=read('apps/web/lib/admin.ts');assert.match(s,/belal\.ecom1@gmail\.com/);assert.match(s,/upsert/);assert.match(s,/isRootEmail\(user\.email\)/)});
test('owner login routes directly to admin',()=>{const s=read('apps/web/app/actions/auth.ts');assert.match(s,/redirect\('\/admin'\)/)});
test('developer dock is global and full width fixed',()=>{const l=read('apps/web/app/layout.tsx');const c=read('apps/web/components/DeveloperBar.tsx');const css=read('apps/web/app/styles.css');assert.match(l,/<DeveloperBar\/>/);assert.match(c,/developerDock/);assert.match(css,/position:fixed/);assert.match(css,/left:0;right:0;bottom:0/)});
test('repair migration recognizes authenticated owner email',()=>{const s=read('infra/supabase/009_root_admin_repair.sql');assert.match(s,/auth\.users/);assert.match(s,/belal\.ecom1@gmail\.com/);assert.match(s,/is_super_admin/)});
