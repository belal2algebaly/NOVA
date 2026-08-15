'use server';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';
import { isSupabaseConfigured } from '../../lib/config';
import { isRootEmail } from '../../lib/admin';

function enc(v:string){return encodeURIComponent(v)}
export async function signIn(formData: FormData){
  if(!isSupabaseConfigured) redirect('/login?error='+enc('Supabase is not configured yet. Add the environment variables first.'));
  const email=String(formData.get('email')||'').trim(); const password=String(formData.get('password')||'');
  if(!email||!password) redirect('/login?error='+enc('Email and password are required.'));
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error) redirect('/login?error='+enc(error.message));
  if(isRootEmail(data.user?.email)) redirect('/admin');
  redirect('/dashboard');
}
export async function signUp(formData: FormData){
  if(!isSupabaseConfigured) redirect('/signup?error='+enc('Supabase is not configured yet. Add the environment variables first.'));
  const name=String(formData.get('name')||'').trim(); const email=String(formData.get('email')||'').trim(); const password=String(formData.get('password')||'');
  if(!name||!email||password.length<6) redirect('/signup?error='+enc('Enter your name, email, and a password of at least 6 characters.'));
  const supabase=await createSupabaseServerClient();
  const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
  if(error) redirect('/signup?error='+enc(error.message));
  if(data.session){if(isRootEmail(data.user?.email))redirect('/admin');redirect('/dashboard')}
  redirect('/login?message='+enc('Account created. Check your email to confirm your account, then sign in.'));
}
export async function signOut(){const supabase=await createSupabaseServerClient(); await supabase.auth.signOut(); redirect('/login');}
