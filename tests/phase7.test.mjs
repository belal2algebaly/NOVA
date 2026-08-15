import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
test('Monitoring endpoint requires CRON_SECRET',()=>{const s=fs.readFileSync('apps/web/app/api/cron/monitor/route.ts','utf8');assert.match(s,/CRON_SECRET/);assert.match(s,/Unauthorized/);});
test('Monitoring migration stores snapshots and change events',()=>{const s=fs.readFileSync('infra/supabase/007_phase7_monitoring_reports.sql','utf8');assert.match(s,/monitor_targets/);assert.match(s,/change_events/);assert.match(s,/last_snapshot/);});
test('Report export is authenticated',()=>{const s=fs.readFileSync('apps/web/app/api/projects/[id]/report/route.ts','utf8');assert.match(s,/auth\.getUser/);assert.match(s,/content-disposition/);});
test('Project sidebar exposes all NOVA intelligence surfaces',()=>{const s=fs.readFileSync('apps/web/components/Sidebar.tsx','utf8');for(const x of ['Benchmark','Opportunities','Research','Monitoring','Reports','Extension'])assert.match(s,new RegExp(x));});
