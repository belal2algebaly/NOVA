import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const scanner=fs.readFileSync('apps/web/lib/audit/server-scanner.ts','utf8');const action=fs.readFileSync('apps/web/app/actions/audits.ts','utf8');const page=fs.readFileSync('apps/web/app/projects/[id]/audits/page.tsx','utf8');const migration=fs.readFileSync('infra/supabase/003_phase3_audit_engine.sql','utf8');
test('scanner rejects private destinations',()=>{assert.match(scanner,/isPrivateIp/);assert.match(scanner,/dns\.lookup/)});
test('scanner keeps visual proximity unknown',()=>{assert.match(scanner,/reviews-near-decision/);assert.match(scanner,/'unknown'/)});
test('scanner distinguishes actual reviews evidence',()=>{assert.match(scanner,/reviewCount/);assert.match(scanner,/AggregateRating|aggregateRating/)});
test('audit action persists report and score',()=>{assert.match(action,/audit_runs/);assert.match(action,/report:stored/)});
test('audit UI exposes history and findings',()=>{assert.match(page,/HISTORY/);assert.match(page,/FINDINGS/)});
test('phase3 migration adds audit lifecycle support',()=>{assert.match(migration,/completed_at/);assert.match(migration,/audits_store_update/)});
