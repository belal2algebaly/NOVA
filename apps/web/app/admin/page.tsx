import Link from 'next/link';
import {redirect} from 'next/navigation';
import {Sidebar} from '../../components/Sidebar';
import {getCurrentUserRole} from '../../lib/admin';
import {createSupabaseAdminClient} from '../../lib/supabase/admin';

export default async function AdminConsole(){
 const {user,isSuperAdmin}=await getCurrentUserRole();
 if(!user)redirect('/login');
 if(!isSuperAdmin)redirect('/dashboard');
 const admin=createSupabaseAdminClient();
 const [{data:authUsers},{data:workspaces},{data:projects},{data:stores},{data:audits},{data:competitors}]=await Promise.all([
  admin.auth.admin.listUsers({page:1,perPage:200}),
  admin.from('workspaces').select('id,name,owner_id,created_at').order('created_at',{ascending:false}).limit(200),
  admin.from('projects').select('id,name,workspace_id,created_at').order('created_at',{ascending:false}).limit(200),
  admin.from('stores').select('id,name,url,project_id,platform,market').limit(300),
  admin.from('audit_runs').select('id,store_id,score,status,created_at').order('created_at',{ascending:false}).limit(300),
  admin.from('competitors').select('id,project_id,name,store_url,classification,match_score').limit(300)
 ]);
 const users=authUsers?.users||[];
 const projectRows=projects||[];
 return <main className="shell"><Sidebar/><section className="workspace adminWorkspace"><header className="pageHeader adminHero"><div><p className="eyebrow">PLATFORM CONTROL</p><h1>Super Admin</h1><p className="muted">One view across every NOVA account, workspace and project.</p></div><span className="superBadge">♛ BELAL · ROOT ACCESS</span></header>
 <div className="grid adminMetrics"><Metric label="Users" value={users.length} note="Auth accounts"/><Metric label="Workspaces" value={workspaces?.length||0} note="All tenants"/><Metric label="Projects" value={projectRows.length} note="Across NOVA"/><Metric label="Audit runs" value={audits?.length||0} note="Latest 300 loaded"/></div>
 <div className="two adminSplit"><article className="panel"><div className="panelhead"><div><p className="eyebrow">USERS</p><h2>Account directory</h2></div><span className="pill">Global</span></div><div className="adminList">{users.map(u=><div className="adminRow" key={u.id}><div className="identityDot">{(u.email||'?')[0].toUpperCase()}</div><div className="adminGrow"><b>{String(u.user_metadata?.full_name||u.email||'Unnamed user')}</b><small>{u.email}</small></div><span>{u.last_sign_in_at?'Active':'Created'}</span></div>)}</div></article>
 <article className="panel"><div className="panelhead"><div><p className="eyebrow">PLATFORM</p><h2>Inventory</h2></div></div><dl className="facts"><div><dt>Stores</dt><dd>{stores?.length||0}</dd></div><div><dt>Competitors</dt><dd>{competitors?.length||0}</dd></div><div><dt>Production owner</dt><dd>{user.email}</dd></div><div><dt>Access scope</dt><dd>All workspaces</dd></div></dl><p className="panelNote">This console uses the server-side Supabase service role only after verifying your Super Admin role.</p></article></div>
 <article className="panel"><div className="panelhead"><div><p className="eyebrow">ALL PROJECTS</p><h2>Platform project stream</h2></div><span className="pill">{projectRows.length} projects</span></div><div className="adminProjectGrid">{projectRows.map((p:any)=>{const s=(stores||[]).find((x:any)=>x.project_id===p.id);return <Link className="adminProject" href={`/projects/${p.id}`} key={p.id}><div><b>{p.name}</b><small>{s?.url||'No store URL'}</small></div><span>{s?.platform||'Unknown'} →</span></Link>})}</div></article>
 </section></main>
}
function Metric({label,value,note}:{label:string,value:number|string,note:string}){return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></article>}
