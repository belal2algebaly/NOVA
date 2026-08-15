import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Sidebar} from '../../components/Sidebar';
import {getCurrentUserRole} from '../../lib/admin';
import {createSupabaseAdminClient} from '../../lib/supabase/admin';

const DAY=86_400_000;
const date=(value?:string|null)=>value?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value)):'—';
const relative=(value?:string|null)=>{if(!value)return 'Never';const d=Date.now()-new Date(value).getTime();if(d<DAY)return 'Today';if(d<7*DAY)return `${Math.max(1,Math.floor(d/DAY))}d ago`;return date(value)};

export default async function AdminConsole(){
 const {user,isSuperAdmin}=await getCurrentUserRole();
 if(!user)redirect('/login');
 if(!isSuperAdmin)redirect('/dashboard');
 const admin=createSupabaseAdminClient();
 const [{data:authUsers},{data:workspaces},{data:projects},{data:stores},{data:audits},{data:competitors},{data:roles}]=await Promise.all([
  admin.auth.admin.listUsers({page:1,perPage:500}),
  admin.from('workspaces').select('id,name,owner_id,created_at').order('created_at',{ascending:false}).limit(500),
  admin.from('projects').select('id,name,workspace_id,created_at').order('created_at',{ascending:false}).limit(1000),
  admin.from('stores').select('id,name,url,project_id,platform,market').limit(1500),
  admin.from('audit_runs').select('id,store_id,score,status,created_at').order('created_at',{ascending:false}).limit(2000),
  admin.from('competitors').select('id,project_id,name,store_url,classification,match_score').limit(1500),
  admin.from('system_roles').select('user_id,role')
 ]);
 const users:any[]=(authUsers?.users||[]) as any[];
 const ws=workspaces||[];
 const projectRows=projects||[];
 const now=Date.now();
 const new7=users.filter((u:any)=>now-new Date(u.created_at).getTime()<=7*DAY).length;
 const active7=users.filter((u:any)=>u.last_sign_in_at&&now-new Date(u.last_sign_in_at).getTime()<=7*DAY).length;const pendingUsers=users.filter((u:any)=>!u.email_confirmed_at).length;const returningUsers=users.filter((u:any)=>u.last_sign_in_at&&u.created_at&&new Date(u.last_sign_in_at).getTime()-new Date(u.created_at).getTime()>DAY).length;const avgProjects=users.length?Math.round(projectRows.length/users.length*10)/10:0;
 const roleMap=new Map((roles||[]).map((r:any)=>[r.user_id,r.role]));
 const workspaceProjects=new Map<string,number>();
 for(const p of projectRows as any[])workspaceProjects.set(p.workspace_id,(workspaceProjects.get(p.workspace_id)||0)+1);
 const userStats=new Map<string,{workspaces:number;projects:number}>();
 for(const w of ws as any[]){const prev=userStats.get(w.owner_id)||{workspaces:0,projects:0};prev.workspaces+=1;prev.projects+=workspaceProjects.get(w.id)||0;userStats.set(w.owner_id,prev)}

 return <main className="shell"><Sidebar/><section className="workspace adminWorkspace">
  <header className="pageHeader adminHero"><div><p className="eyebrow">PLATFORM CONTROL</p><h1>Super Admin</h1><p className="muted">Live visibility across NOVA users, workspaces and product activity</p></div><div className="adminHeaderActions"><Link className="ghost" href="/admin/status">System Status</Link><span className="superBadge">♛ BELAL · ROOT ACCESS</span></div></header>
  <div className="grid adminMetrics"><Metric label="Total users" value={users.length} note="Registered accounts"/><Metric label="New · 7 days" value={new7} note="Recent registrations"/><Metric label="Active · 7 days" value={active7} note="Signed in recently"/><Metric label="Projects" value={projectRows.length} note={`${ws.length} workspaces`}/></div>

  <div className="adminInsightStrip"><div><span>Activation health</span><b>{users.length?Math.round((users.length-pendingUsers)/users.length*100):100}% confirmed</b></div><div><span>Returning users</span><b>{returningUsers} accounts</b></div><div><span>Project depth</span><b>{avgProjects} per user</b></div></div><article className="panel adminUsersPanel"><div className="panelhead"><div><p className="eyebrow">USER DIRECTORY</p><h2>Registered users</h2><p className="muted compactCopy">Account status, activity and ownership at a glance</p></div><span className="pill">{users.length} accounts</span></div>
   <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Last sign in</th><th>Status</th><th>Provider</th><th>Workspaces</th><th>Projects</th></tr></thead><tbody>{users.map((u:any)=>{const stats=userStats.get(u.id)||{workspaces:0,projects:0};const providers=(u.app_metadata?.providers||[u.app_metadata?.provider||'email']).filter(Boolean).join(', ');const root=roleMap.get(u.id)==='super_admin';return <tr key={u.id}><td><div className="adminIdentity"><span className="identityDot">{(u.email||'?')[0].toUpperCase()}</span><div><b>{String(u.user_metadata?.full_name||u.email||'Unnamed user')}</b><small>{u.email}</small></div></div></td><td><span className={root?'rolePill root':'rolePill'}>{root?'Super Admin':'User'}</span></td><td>{date(u.created_at)}</td><td>{relative(u.last_sign_in_at)}</td><td><span className={u.email_confirmed_at?'accountState confirmed':'accountState'}>{u.email_confirmed_at?'Confirmed':'Pending'}</span></td><td className="capitalize">{providers}</td><td>{stats.workspaces}</td><td>{stats.projects}</td></tr>})}</tbody></table></div>
  </article>

  <div className="grid adminSecondaryMetrics"><Metric label="Stores" value={stores?.length||0} note="Connected storefronts"/><Metric label="Audit runs" value={audits?.length||0} note="Platform activity"/><Metric label="Competitors" value={competitors?.length||0} note="Validated records"/><Metric label="Your access" value="Global" note="All workspaces"/></div>

  <article className="panel"><div className="panelhead"><div><p className="eyebrow">ALL PROJECTS</p><h2>Platform project stream</h2></div><span className="pill">{projectRows.length} projects</span></div><div className="adminProjectGrid">{projectRows.map((p:any)=>{const s=(stores||[]).find((x:any)=>x.project_id===p.id);return <Link className="adminProject" href={`/projects/${p.id}`} key={p.id}><div><b>{p.name}</b><small>{s?.url||'No store URL'}</small></div><span>{s?.platform||'Unknown'} →</span></Link>})}</div></article>
 </section></main>
}
function Metric({label,value,note}:{label:string,value:number|string,note:string}){return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>}
