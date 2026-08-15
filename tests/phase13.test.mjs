import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../apps/web/app/styles.css',import.meta.url),'utf8');

test('phase 18 defines a readable scalable design token system',()=>{
  assert.match(css,/--fs-page:clamp\(/);
  assert.match(css,/--text:#1f1830/);
  assert.match(css,/--muted:#625a6d/);
  assert.match(css,/--shadow-card:/);
});

test('phase 18 keeps mobile project navigation visible and scrollable',()=>{
  assert.match(css,/@media\(max-width:820px\)/);
  assert.match(css,/\.sidebar nav\{display:flex!important;flex-direction:row/);
  assert.match(css,/overflow-x:auto/);
});

test('phase 18 implements responsive data grids and tables',()=>{
  assert.match(css,/\.grid,.adminMetrics,.adminSecondaryMetrics\{grid-template-columns:repeat\(2/);
  assert.match(css,/\.grid,.adminMetrics,.adminSecondaryMetrics,.projectGrid\{grid-template-columns:1fr\}/);
  assert.match(css,/\.adminTableWrap\{overflow:auto/);
});

test('phase 18 respects reduced motion preferences',()=>{
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css,/animation-duration:\.01ms!important/);
});
