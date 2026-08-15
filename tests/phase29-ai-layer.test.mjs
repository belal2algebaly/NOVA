import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),'utf8');
test('AI router uses Gemini then Groq then deterministic fallback',()=>{const s=read('apps/web/lib/ai/router.ts');assert.match(s,/GEMINI_API_KEY/);assert.match(s,/GROQ_API_KEY/);assert.match(s,/provider:'deterministic'/);assert.ok(s.indexOf('await gemini')<s.indexOf('await groq'))});
test('AI endpoint is authenticated and project grounded',()=>{const s=read('apps/web/app/api/projects/[id]/ai/route.ts');assert.match(s,/auth\.getUser/);assert.match(s,/buildAIContext/);assert.match(s,/askNOVA/)});
test('AI context includes core NOVA evidence',()=>{const s=read('apps/web/lib/ai/context.ts');for(const x of ['competitors','pricing','assortment','opportunities','recentChanges'])assert.match(s,new RegExp(x))});
test('AI keys stay server side',()=>{const s=read('.env.example');assert.match(s,/GEMINI_API_KEY=/);assert.doesNotMatch(s,/NEXT_PUBLIC_GEMINI/);assert.doesNotMatch(s,/NEXT_PUBLIC_GROQ/)});
test('Analyst UI exposes provider and loading feedback',()=>{const s=read('apps/web/components/AIAnalyst.tsx');assert.match(s,/Thinking…/);assert.match(s,/providerPill/);assert.match(s,/Reading your NOVA evidence/)});
