import {createSupabaseServerClient} from './supabase/server';

export async function getCurrentUserRole(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return {user:null,isSuperAdmin:false};
  const {data}=await supabase.from('system_roles').select('role').eq('user_id',user.id).maybeSingle();
  return {user,isSuperAdmin:data?.role==='super_admin'};
}
