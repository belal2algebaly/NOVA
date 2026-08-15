import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
test('phase 11 google oauth and email activation are wired',()=>{
 const auth=read('../apps/web/app/actions/auth.ts');
 assert.match(auth,/signInWithOAuth/);
 assert.match(auth,/provider:'google'/);
 assert.match(auth,/emailRedirectTo/);
 assert.match(auth,/auth\/callback/);
});
test('phase 11 auth pages expose google entry points',()=>{
 const login=read('../apps/web/app/login/page.tsx');
 const signup=read('../apps/web/app/signup/page.tsx');
 assert.match(login,/Continue with Google/);
 assert.match(signup,/Sign up with Google/);
 assert.match(signup,/activation link/i);
});
test('phase 11 developer dock rotates three premium messages',()=>{
 const bar=read('../apps/web/components/DeveloperBar.tsx');
 const css=read('../apps/web/app/styles.css');
 assert.match(bar,/Developed by/);
 assert.match(bar,/Free to use/);
 assert.match(bar,/sharper/);
 assert.match(css,/developerMessageCycle/);
});
