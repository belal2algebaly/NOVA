'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabase/server';

function normalizeUrl(value:string){
  const raw=value.trim(); if(!raw) throw new Error('Store URL is required.');
  const url=new URL(/^https?:\/\//i.test(raw)?raw:`https://${raw}`);
  if(!['http:','https:'].includes(url.protocol)) throw new Error('Use a normal website URL.');
  url.hash=''; return url.toString().replace(/\/$/,'');
}
export async function createProject(formData:FormData){
  const name=String(formData.get('name')||'').trim(); const storeName=String(formData.get('storeName')||'').trim();
  const market=String(formData.get('market')||'').trim(); const currency=String(formData.get('currency')||'').trim().toUpperCase();
  let url:string; try{url=normalizeUrl(String(formData.get('url')||''));}catch(e){redirect('/projects/new?error='+encodeURIComponent(e instanceof Error?e.message:'Invalid URL'));}
  if(!name) redirect('/projects/new?error='+encodeURIComponent('Project name is required.'));
  const supabase=await createSupabaseServerClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect('/login');
  const {data:workspace,error:wsError}=await supabase.from('workspaces').select('id').eq('owner_id',user.id).order('created_at',{ascending:true}).limit(1).maybeSingle();
  if(wsError||!workspace) redirect('/projects/new?error='+encodeURIComponent(wsError?.message||'No workspace found for this account. Apply the Phase 2 database migration.'));
  const {data:project,error:pError}=await supabase.from('projects').insert({workspace_id:workspace.id,name}).select('id').single();
  if(pError||!project) redirect('/projects/new?error='+encodeURIComponent(pError?.message||'Could not create project.'));
  const {error:sError}=await supabase.from('stores').insert({project_id:project.id,name:storeName||name,url,market:market||null,currency:currency||null});
  if(sError){await supabase.from('projects').delete().eq('id',project.id); redirect('/projects/new?error='+encodeURIComponent(sError.message));}
  revalidatePath('/dashboard'); redirect(`/projects/${project.id}`);
}
