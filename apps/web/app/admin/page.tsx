import Link from 'next/link';
import {redirect} from 'next/navigation';
import {AdminSidebar} from '../../components/AdminSidebar';
import {getCurrentUserRole} from '../../lib/admin';
import {getAdminDashboardData} from '../../lib/admin-dashboard';
import {getSystemReport} from '../../lib/system/status';

const DAY=86_400_000;
const relative=(value?:string|null)=>{if(!value)return '—';const d=Date.now()-new Date(value).getTime();if(d<60_000)return 'Just now';if(d<3_600_000)return `${Math.max(1,Math.floor(d/60_000))}m ago`;if(d<DAY)return `${Math.max(1,Math.floor(d/3_600_000))}h ago`;if(d<7*DAY)return `${Math.max(1,Math.floor(d/DAY))}d ago`;return new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short'}).format(new Date(value))};

export default async function AdminConsole(){
 const {user,isSuperAdmin}=await getCurrentUserRole();
 if(!user)redirect('/login'); if(!isSuperAdmin)redirect('/dashboard');
 const [data,system]=await Promise.all([getAdminDashboardData(),getSystemReport()]);
 const {users,projects,stores,audits,competitors,opportunities,notifications,userStats,metrics,recentActivity}=data;
 const activation=users.length?Math.round(metrics.activatedUsers/users.length*100):0;
 const retention=users.length?Math.round(metrics.returningUsers/users.length*100):0;
 const unread=notifications.filter((n:any)=>!n.read_at).length;
 return <main className="shell adminShell"><AdminSidebar/><section className="workspace adminWorkspace adminControlCenter">
  <header className="adminCommandHero">
   <div><p className="eyebrow">NOVA CONTROL CENTER</p><h1>Platform overview</h1><p>Users, product usage, intelligence activity and system health in one place</p></div>
   <div className="adminHeroStatus"><span className={`adminHealth ${system.overall}`}>{system.overall}</span><strong>{system.score}<small>/100 health</small></strong><Link href="/admin/status">Open diagnostics →</Link></div>
  </header>

  <section className="adminKpiGrid">
   <Kpi label="New · 7 days" value={metrics.new7} sub={`${users.length} registered users`} tone="violet"/>
   <Kpi label="Active · 7 days" value={metrics.active7} sub={`${metrics.active30} active in 30 days`} tone="blue"/>
   <Kpi label="Activation health" value={`${activation}%`} sub={`${metrics.activatedUsers} created a project`} tone="green"/>
   <Kpi label="Returning users" value={`${retention}%`} sub={`${metrics.returningUsers} came back`} tone="amber"/>
   <Kpi label="Projects" value={projects.length} sub={`${stores.length} connected stores`}/>
   <Kpi label="Audit runs" value={audits.length} sub={`${metrics.auditedProjects} projects audited`}/>
   <Kpi label="Competitors" value={competitors.length} sub={`${opportunities.length} opportunities`}/>
   <Kpi label="Avg audit score" value={metrics.avgAuditScore||'—'} sub={`${unread} unread notifications`}/>
  </section>

  <div className="adminMainGrid">
   <article className="adminSurface adminUsersSnapshot">
    <div className="adminSectionHead"><div><p className="eyebrow">USERS</p><h2>User intelligence</h2><p>Latest accounts and their adoption depth · Last sign in · Provider · Workspaces · Projects</p></div><Link href="/admin/users">View all users →</Link></div>
    <div className="adminUserCards">{users.slice(0,6).map((u:any)=>{const s=userStats.get(u.id)||{workspaces:0,projects:0,stores:0};return <div className="adminUserCard" key={u.id}><span className="adminAvatar">{(u.email||'?')[0].toUpperCase()}</span><div className="adminUserCardBody"><b>{u.user_metadata?.full_name||u.email}</b><small>{u.email}</small><div><span>{s.projects} projects</span><span>{s.stores} stores</span><span>{relative(u.last_sign_in_at)}</span></div></div></div>})}</div>
   </article>

   <article className="adminSurface adminHealthSnapshot">
    <div className="adminSectionHead"><div><p className="eyebrow">SYSTEM</p><h2>Health & integrations</h2><p>Live provider and integration readiness</p></div><Link href="/admin/status">Full status →</Link></div>
    <div className="adminHealthList">{system.items.slice(0,8).map(item=><div key={item.id}><span className={`healthDot ${item.state}`}/><div><b>{item.label}</b><small>{item.detail}</small></div><em>{item.latencyMs?`${item.latencyMs} ms`:item.state.replace('_',' ')}</em></div>)}</div>
   </article>
  </div>

  <div className="adminMainGrid adminLowerGrid">
   <article className="adminSurface">
    <div className="adminSectionHead"><div><p className="eyebrow">ACTIVITY</p><h2>Platform stream</h2><p>What is happening across NOVA right now</p></div><Link href="/admin/activity">Full activity →</Link></div>
    <div className="adminTimeline">{recentActivity.slice(0,10).map((x:any,i:number)=><div key={`${x.type}-${i}-${x.created_at}`}><span className={`activityIcon ${x.type}`}>{x.type==='audit'?'◎':x.type==='competitor'?'◇':x.type==='change'?'◌':'◈'}</span><div><b>{x.title}</b><small>{x.detail}</small></div><time>{relative(x.created_at)}</time></div>)}</div>
   </article>
   <article className="adminSurface adminAttention">
    <div className="adminSectionHead"><div><p className="eyebrow">ATTENTION</p><h2>Needs your attention</h2><p>Problems and platform gaps worth reviewing</p></div></div>
    <div className="adminAttentionList">
     {system.issues.length?system.issues.slice(0,6).map(issue=><Link href="/admin/status" key={issue.id}><span className={`healthDot ${issue.state}`}/><div><b>{issue.label}</b><small>{issue.recommendation||issue.detail}</small></div><strong>Review →</strong></Link>):<div className="adminAllGood"><span>✓</span><div><b>No critical system issues</b><small>All monitored services are currently within expected state</small></div></div>}
     {metrics.pendingUsers>0&&<Link href="/admin/users"><span className="healthDot warning"/><div><b>{metrics.pendingUsers} unconfirmed users</b><small>Review signup activation and email confirmation</small></div><strong>Users →</strong></Link>}
    </div>
   </article>
  </div>
 </section></main>
}
function Kpi({label,value,sub,tone='neutral'}:{label:string,value:string|number,sub:string,tone?:string}){return <article className={`adminKpi ${tone}`}><span>{label}</span><strong>{value}</strong><small>{sub}</small></article>}

/* Super Admin global data surfaces are loaded via admin-dashboard: auth.admin.listUsers · workspaces · projects · audit_runs · competitors */
