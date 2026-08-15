import {createSupabaseServerClient} from './supabase/server';
import {createSupabaseAdminClient} from './supabase/admin';

export const NOVA_SUPER_ADMIN_EMAIL='belal.ecom1@gmail.com';

export function isRootEmail(email?:string|null){
  return String(email||'').trim().toLowerCase()===NOVA_SUPER_ADMIN_EMAIL;
}

async function selfHealRootRole(userId:string){
  try{
    const admin=createSupabaseAdminClient();
    await admin.from('system_roles').upsert({user_id:userId,role:'super_admin'},{onConflict:'user_id'});
  }catch{
    // UI recognition still remains safe because the email comes from an authenticated Supabase user
  }
}

export async function getCurrentUserRole(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return {user:null,isSuperAdmin:false};

  // NOVA's owner account is an explicit platform root identity
  // Authentication must succeed first, so this never trusts a client-supplied email
  if(isRootEmail(user.email)){
    await selfHealRootRole(user.id);
    return {user,isSuperAdmin:true};
  }

  const {data}=await supabase.from('system_roles').select('role').eq('user_id',user.id).maybeSingle();
  return {user,isSuperAdmin:data?.role==='super_admin'};
}
