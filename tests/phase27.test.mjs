import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const r=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
const palette=r('apps/web/components/CommandPalette.tsx');const ui=r('apps/web/components/IntelligenceUI.tsx');const project=r('apps/web/app/projects/[id]/page.tsx');const comps=r('apps/web/app/projects/[id]/competitors/page.tsx');const analyst=r('apps/web/app/projects/[id]/analyst/page.tsx');const analystLib=r('apps/web/lib/intelligence/analyst.ts');const notif=r('apps/web/app/projects/[id]/notifications/page.tsx');const admin=r('apps/web/app/admin/page.tsx');const css=r('apps/web/app/styles.css');const layout=r('apps/web/app/layout.tsx');
const checks=[
 ['phase 1 command palette exists',()=>assert.match(palette,/CommandPalette/)],
 ['phase 2 keyboard shortcut uses cmd or ctrl k',()=>assert.match(palette,/key\.toLowerCase\(\)==='k'/)],
 ['phase 3 global layout mounts quick actions',()=>assert.match(layout,/<CommandPalette\/>/)],
 ['phase 4 next best action is implemented',()=>assert.match(project,/NextAction/)],
 ['phase 5 activity stream is implemented',()=>assert.match(project,/RECENT ACTIVITY/)],
 ['phase 6 project intelligence readiness is visible',()=>assert.match(project,/INTELLIGENCE READINESS/)],
 ['phase 7 freshness is explicit',()=>assert.match(ui,/function Freshness/)],
 ['phase 8 confidence is explicit',()=>assert.match(ui,/ConfidenceBadge/)],
 ['phase 9 quality meter exists',()=>assert.match(ui,/QualityMeter/)],
 ['phase 10 competitor quality gate is shown',()=>assert.match(comps,/Validated set quality/)],
 ['phase 11 local match ratio is shown',()=>assert.match(comps,/Local market matches/)],
 ['phase 12 taxonomy confidence is surfaced',()=>assert.match(comps,/Taxonomy confidence/)],
 ['phase 13 analyst answer confidence exists',()=>assert.match(analyst,/answer confidence/)],
 ['phase 14 analyst suggests contextual followups',()=>assert.match(analystLib,/followups/)],
 ['phase 15 analyst can diagnose weak evidence',()=>assert.match(analystLib,/Evidence quality check/)],
 ['phase 16 notification triage filters exist',()=>assert.match(notif,/notificationFilters/)],
 ['phase 17 admin adds activation health',()=>assert.match(admin,/Activation health/)],
 ['phase 18 admin adds returning-user intelligence',()=>assert.match(admin,/Returning users/)],
 ['phase 19 responsive command access exists',()=>assert.match(css,/@media\(max-width:850px\)[\s\S]*commandTrigger/)],
 ['phase 20 command palette provides accessible dialog semantics',()=>assert.match(palette,/aria-modal="true"/)]
];
for(const [name,fn] of checks)test(name,fn);
