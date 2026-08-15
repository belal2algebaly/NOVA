import Link from 'next/link'; import { Brand } from './Brand'; import { signOut } from '../app/actions/auth';
export function Sidebar({projectId}:{projectId?:string}){
 const base=projectId?`/projects/${projectId}`:'/dashboard';
 const nav=projectId?[['Overview',base],['Audits',`${base}/audits`],['Competitors',`${base}/competitors`],['Benchmark',`${base}/benchmark`],['Opportunities',`${base}/opportunities`],['Research',`${base}/research`],['Monitoring',`${base}/monitoring`],['Reports',`${base}/reports`],['Extension',`${base}/extension`]]:[['Projects','/dashboard'],['New project','/projects/new']];
 return <aside className="sidebar"><div><Brand/><p className="tagline">E-commerce Intelligence</p><nav>{nav.map(([label,href])=><Link href={href} key={label}>{label}</Link>)}</nav></div><div className="sidebottom"><Link href="/settings">Settings</Link><form action={signOut}><button className="linkButton">Sign out</button></form></div></aside>
}
