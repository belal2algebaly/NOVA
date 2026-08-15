import 'server-only';
import {createSupabaseAdminClient} from './supabase/admin';

const DAY=86_400_000;
export type AdminDashboardData=Awaited<ReturnType<typeof getAdminDashboardData>>;

export async function getAdminDashboardData(){
 const admin=createSupabaseAdminClient();
 const [{data:authUsers},{data:workspaces},{data:projects},{data:stores},{data:audits},{data:competitors},{data:opportunities},{data:changes},{data:notifications},{data:roles}]=await Promise.all([
  admin.auth.admin.listUsers({page:1,perPage:1000}),
  admin.from('workspaces').select('id,name,owner_id,created_at').order('created_at',{ascending:false}).limit(1000),
  admin.from('projects').select('id,name,workspace_id,created_at').order('created_at',{ascending:false}).limit(2000),
  admin.from('stores').select('id,name,url,project_id,platform,market,currency,created_at').order('created_at',{ascending:false}).limit(3000),
  admin.from('audit_runs').select('id,store_id,score,status,page_type,source,created_at').order('created_at',{ascending:false}).limit(4000),
  admin.from('competitors').select('id,project_id,name,store_url,classification,match_score,confidence_score,created_at').order('created_at',{ascending:false}).limit(3000),
  admin.from('opportunities').select('id,project_id,title,status,impact,confidence,created_at').order('created_at',{ascending:false}).limit(3000),
  admin.from('change_events').select('id,project_id,competitor_id,kind,summary,created_at').order('created_at',{ascending:false}).limit(1000),
  admin.from('notifications').select('id,project_id,title,kind,read_at,created_at').order('created_at',{ascending:false}).limit(1000),
  admin.from('system_roles').select('user_id,role')
 ]);
 const users:any[]=(authUsers?.users||[]) as any[];
 const ws:any[]=workspaces||[]; const projectRows:any[]=projects||[]; const storeRows:any[]=stores||[]; const auditRows:any[]=audits||[]; const competitorRows:any[]=competitors||[]; const opportunityRows:any[]=opportunities||[]; const changeRows:any[]=changes||[]; const notificationRows:any[]=notifications||[];
 const now=Date.now();
 const new7=users.filter(u=>now-new Date(u.created_at).getTime()<=7*DAY).length;
 const new30=users.filter(u=>now-new Date(u.created_at).getTime()<=30*DAY).length;
 const active7=users.filter(u=>u.last_sign_in_at&&now-new Date(u.last_sign_in_at).getTime()<=7*DAY).length;
 const active30=users.filter(u=>u.last_sign_in_at&&now-new Date(u.last_sign_in_at).getTime()<=30*DAY).length;
 const pendingUsers=users.filter(u=>!u.email_confirmed_at).length;
 const returningUsers=users.filter(u=>u.last_sign_in_at&&u.created_at&&new Date(u.last_sign_in_at).getTime()-new Date(u.created_at).getTime()>DAY).length;
 const roleMap=new Map((roles||[]).map((r:any)=>[r.user_id,r.role]));
 const workspaceProjects=new Map<string,number>();
 for(const p of projectRows)workspaceProjects.set(p.workspace_id,(workspaceProjects.get(p.workspace_id)||0)+1);
 const userStats=new Map<string,{workspaces:number;projects:number;stores:number}>();
 const projectByWorkspace=new Map<string,string[]>();
 for(const p of projectRows){const arr=projectByWorkspace.get(p.workspace_id)||[];arr.push(p.id);projectByWorkspace.set(p.workspace_id,arr)}
 const storesByProject=new Map<string,number>();
 for(const s of storeRows)storesByProject.set(s.project_id,(storesByProject.get(s.project_id)||0)+1);
 for(const w of ws){const prev=userStats.get(w.owner_id)||{workspaces:0,projects:0,stores:0};const ids=projectByWorkspace.get(w.id)||[];prev.workspaces+=1;prev.projects+=ids.length;prev.stores+=ids.reduce((n,id)=>n+(storesByProject.get(id)||0),0);userStats.set(w.owner_id,prev)}
 const activatedUsers=users.filter(u=>(userStats.get(u.id)?.projects||0)>0).length;
 const auditedProjects=new Set(auditRows.map(a=>storeRows.find(s=>s.id===a.store_id)?.project_id).filter(Boolean)).size;
 const avgAuditScore=Math.round((auditRows.filter(a=>typeof a.score==='number').reduce((n,a)=>n+(a.score||0),0)/(auditRows.filter(a=>typeof a.score==='number').length||1))*10)/10;
 const recentActivity=[
  ...projectRows.slice(0,15).map(p=>({type:'project',title:`Project created · ${p.name}`,detail:'New project added to NOVA',created_at:p.created_at,href:`/projects/${p.id}`})),
  ...auditRows.slice(0,20).map(a=>({type:'audit',title:`Audit ${a.status||'updated'}`,detail:`${a.page_type||'Page'} · score ${a.score??'—'}`,created_at:a.created_at,href:null})),
  ...competitorRows.slice(0,15).map(c=>({type:'competitor',title:`Competitor · ${c.name||c.store_url}`,detail:`${c.classification||'Unclassified'} · match ${c.match_score??'—'}%`,created_at:c.created_at,href:`/projects/${c.project_id}/competitors`})),
  ...changeRows.slice(0,15).map(c=>({type:'change',title:c.summary||'Competitor change detected',detail:c.kind||'Monitoring event',created_at:c.created_at,href:c.project_id?`/projects/${c.project_id}/monitoring`:null}))
 ].filter(x=>x.created_at).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime()).slice(0,30);
 return {users,workspaces:ws,projects:projectRows,stores:storeRows,audits:auditRows,competitors:competitorRows,opportunities:opportunityRows,changes:changeRows,notifications:notificationRows,roleMap,userStats,metrics:{new7,new30,active7,active30,pendingUsers,returningUsers,activatedUsers,auditedProjects,avgAuditScore},recentActivity};
}
