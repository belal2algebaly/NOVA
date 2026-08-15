'use server';
import crypto from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '../../lib/supabase/server';
import {createSupabaseAdminClient} from '../../lib/supabase/admin';
import {productSnapshot} from '../../lib/intelligence/product';

export async function captureProductIntelligence(projectId:string){
 const supabase=await createSupabaseServerClient();
 const {data:store}=await supabase.from('stores').select('url,profile').eq('project_id',projectId).limit(1).maybeSingle();
 const {data:competitors}=await supabase.from('competitors').select('id,store_url,profile,status').eq('project_id',projectId).neq('status','rejected');
 if(store?.profile){const snap=productSnapshot(store.profile as any);await supabase.from('product_snapshots').insert({project_id:projectId,competitor_id:null,...snap});}
 for(const c of competitors||[]){if(c.profile){const snap=productSnapshot(c.profile as any);await supabase.from('product_snapshots').insert({project_id:projectId,competitor_id:c.id,...snap});}}
 revalidatePath(`/projects/${projectId}/products`);
}

export async function createReportShare(projectId:string){
 const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return;
 const token=crypto.randomBytes(18).toString('base64url');
 await supabase.from('report_shares').insert({project_id:projectId,token,created_by:user.id});
 revalidatePath(`/projects/${projectId}/reports`);
 return token;
}
export async function disableReportShare(projectId:string,shareId:string){const supabase=await createSupabaseServerClient();await supabase.from('report_shares').update({enabled:false}).eq('id',shareId).eq('project_id',projectId);revalidatePath(`/projects/${projectId}/reports`)}
export async function markNotificationRead(projectId:string,id:string){const supabase=await createSupabaseServerClient();await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('project_id',projectId);revalidatePath(`/projects/${projectId}/notifications`)}
export async function seedProjectNotification(projectId:string,title:string,body:string,href?:string){try{const admin=createSupabaseAdminClient();await admin.from('notifications').insert({project_id:projectId,kind:'info',title,body,href:href||null});}catch{}}

export async function createReportShareAndReturn(projectId:string){const token=await createReportShare(projectId);if(token)redirect(`/projects/${projectId}/reports?shared=${token}`)}
