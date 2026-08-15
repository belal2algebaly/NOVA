import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Phase 2 exposes real auth actions',()=>{const s=read('apps/web/app/actions/auth.ts');assert.match(s,/signInWithPassword/);assert.match(s,/auth\.signUp/);assert.match(s,/signOut/)});
test('Projects are inserted with a persisted store',()=>{const s=read('apps/web/app/actions/projects.ts');assert.match(s,/from\('projects'\)\.insert/);assert.match(s,/from\('stores'\)\.insert/)});
test('Protected routes are guarded by middleware',()=>{const s=read('apps/web/middleware.ts');for(const p of ['dashboard','projects','settings']) assert.match(s,new RegExp(p))});
test('Database migration enables RLS for tenant tables',()=>{const s=read('infra/supabase/002_phase2_auth_projects_rls.sql');for(const t of ['workspaces','projects','stores','audit_runs','competitors','opportunities']) assert.match(s,new RegExp(`alter table public\\.${t} enable row level security`))});
test('New auth users receive a NOVA workspace',()=>{const s=read('infra/supabase/002_phase2_auth_projects_rls.sql');assert.match(s,/handle_new_nova_user/);assert.match(s,/workspace_members/)});
test('Dashboard does not invent persisted data when backend is absent',()=>{const s=read('apps/web/app/dashboard/page.tsx');assert.match(s,/SetupNotice/);assert.doesNotMatch(s,/Brand A|Demo Store|94% match/)});
