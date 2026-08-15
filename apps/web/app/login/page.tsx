import Link from 'next/link';
import { Brand } from '../../components/Brand';
import { signIn, signInWithGoogle } from '../actions/auth';
import { SetupNotice } from '../../components/SetupNotice';
import { isSupabaseConfigured } from '../../lib/config';

function GoogleIcon(){return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.23-.2-1.77H12v3.4h5.52a4.72 4.72 0 0 1-2.05 3.01l-.02.11 2.98 2.31.21.02c1.94-1.79 2.96-4.43 2.96-7.08Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.89 6.64-2.69l-3.17-2.44c-.85.57-1.98.97-3.47.97-2.6 0-4.8-1.75-5.6-4.17l-.1.01-3.1 2.4-.03.1A10.02 10.02 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.67A6.04 6.04 0 0 1 6.08 12c0-.58.11-1.14.3-1.67v-.11L3.24 7.78l-.1.05A10.03 10.03 0 0 0 2 12c0 1.5.4 2.92 1.17 4.17l3.23-2.5Z"/><path fill="#EA4335" d="M12 6.16c1.88 0 3.15.81 3.87 1.47l2.84-2.77C16.96 3.24 14.7 2 12 2a10.02 10.02 0 0 0-8.84 5.83l3.22 2.5C7.2 7.91 9.4 6.16 12 6.16Z"/></svg>}

export default async function Login({searchParams}:{searchParams:Promise<{error?:string,message?:string}>}){
 const q=await searchParams;
 return <main className="authShell"><section className="authCard"><Brand/><div className="authHeading"><p className="eyebrow">WELCOME BACK</p><h1>Sign in to NOVA</h1><p>Open your projects, audits and competitor intelligence</p></div>{!isSupabaseConfigured&&<SetupNotice/>}{q.error&&<div className="alert error">{q.error}</div>}{q.message&&<div className="alert success">{q.message}</div>}
 <form action={signInWithGoogle}><button className="googleButton wide" type="submit"><GoogleIcon/><span>Continue with Google</span></button></form>
 <div className="authDivider"><span>or continue with email</span></div>
 <form action={signIn} className="form"><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Password<input name="password" type="password" required autoComplete="current-password"/></label><button className="primary wide">Sign in</button></form>
 <p className="authFoot">New to NOVA? <Link href="/signup">Create an account</Link></p></section></main>
}
