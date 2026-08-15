'use server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { isSupabaseConfigured } from '../../lib/config';
import { isRootEmail } from '../../lib/admin';

function enc(v:string){return encodeURIComponent(v)}
async function appOrigin(){
  const h=await headers();
  const host=h.get('x-forwarded-host')||h.get('host');
  const proto=h.get('x-forwarded-proto')||'https';
  return host?`${proto}://${host}`:(process.env.NEXT_PUBLIC_NOVA_APP_URL||process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000');
}

export async function signIn(formData: FormData){
  if(!isSupabaseConfigured) redirect('/login?error='+enc('Supabase is not configured yet. Add the environment variables first'));
  const email=String(formData.get('email')||'').trim(); const password=String(formData.get('password')||'');
  if(!email||!password) redirect('/login?error='+enc('Email and password are required'));
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error) redirect('/login?error='+enc(error.message));
  if(isRootEmail(data.user?.email)) redirect('/admin');
  redirect('/dashboard');
}

export async function signInWithGoogle(){
  if(!isSupabaseConfigured) redirect('/login?error='+enc('Supabase is not configured yet. Add the environment variables first'));
  const supabase=await createSupabaseServerClient();
  const origin=await appOrigin();
  const {data,error}=await supabase.auth.signInWithOAuth({
    provider:'google',
    options:{redirectTo:`${origin}/auth/callback`}
  });
  if(error) redirect('/login?error='+enc(error.message));
  if(!data.url) redirect('/login?error='+enc('Google sign in could not be started'));
  redirect(data.url);
}

export async function signUp(formData: FormData){
  if(!isSupabaseConfigured) redirect('/signup?error='+enc('Supabase is not configured yet. Add the environment variables first'));
  const name=String(formData.get('name')||'').trim(); const email=String(formData.get('email')||'').trim(); const password=String(formData.get('password')||'');
  if(!name||!email||password.length<6) redirect('/signup?error='+enc('Enter your name, email, and a password of at least 6 characters'));
  const supabase=await createSupabaseServerClient();
  const origin=await appOrigin();
  const {data,error}=await supabase.auth.signUp({
    email,password,
    options:{data:{full_name:name},emailRedirectTo:`${origin}/auth/callback`}
  });
  if(error) redirect('/signup?error='+enc(error.message));
  if(data.session){if(isRootEmail(data.user?.email))redirect('/admin');redirect('/dashboard')}
  redirect('/login?message='+enc(`Activation link sent to ${email}. Confirm your email, then NOVA will be ready for you`));
}

export async function resendActivation(formData: FormData){
  if(!isSupabaseConfigured) redirect('/login?error='+enc('Supabase is not configured yet'));
  const email=String(formData.get('email')||'').trim();
  if(!email) redirect('/login?error='+enc('Enter your email first'));
  const supabase=await createSupabaseServerClient();
  const origin=await appOrigin();
  const {error}=await supabase.auth.resend({type:'signup',email,options:{emailRedirectTo:`${origin}/auth/callback`}});
  if(error) redirect('/login?error='+enc(error.message));
  redirect('/login?message='+enc(`A new activation link was sent to ${email}`));
}

export async function signOut(){const supabase=await createSupabaseServerClient(); await supabase.auth.signOut(); redirect('/login');}
