import {ActionButton} from './ActionButton';
import Link from 'next/link';
import { Brand } from './Brand';
import { signOut } from '../app/actions/auth';
import { getCurrentUserRole } from '../lib/admin';
import {NavLinks} from './NavLinks';

export async function Sidebar({projectId}:{projectId?:string}){
 const {user,isSuperAdmin}=await getCurrentUserRole();
 const base=projectId?`/projects/${projectId}`:'/dashboard';
 const sections:{label:string;items:{label:string;href:string;icon:string;badge?:string}[]}[]=projectId?[
  {label:'Workspace',items:[
   {label:'Overview',href:base,icon:'◈'},
   {label:'Audits',href:`${base}/audits`,icon:'◎'},
   {label:'Competitors',href:`${base}/competitors`,icon:'◇'},
   {label:'Benchmark',href:`${base}/benchmark`,icon:'▦'},
   {label:'Opportunities',href:`${base}/opportunities`,icon:'✦'}]},
  {label:'Intelligence',items:[
   {label:'Research',href:`${base}/research`,icon:'⌕'},
   {label:'Monitoring',href:`${base}/monitoring`,icon:'◌'},
   {label:'Products',href:`${base}/products`,icon:'▥'},
   {label:'Analyst',href:`${base}/analyst`,icon:'✧'}]},
  {label:'Output',items:[
   {label:'Notifications',href:`${base}/notifications`,icon:'◍'},
   {label:'Reports',href:`${base}/reports`,icon:'▤'},
   {label:'Extension',href:`${base}/extension`,icon:'⌁'}]}
 ]:[{label:'Workspace',items:[{label:'Projects',href:'/dashboard',icon:'◈'},{label:'New project',href:'/projects/new',icon:'＋'}]}];
 if(isSuperAdmin) sections.push({label:'System',items:[{label:'Super Admin',href:'/admin',icon:'♛',badge:'ALL'}]});
 return <aside className="sidebar">
  <div className="sidebarTop">
   <div className="brandZone"><Brand/><p className="tagline">E-commerce Intelligence</p></div>
   {projectId&&<div className="workspaceMode"><span>LIVE</span><b>Project intelligence</b></div>}
   <NavLinks sections={sections}/>
  </div>
  <div className="sidebottom">
   {user&&<div className="userMini"><span>{(user.email||'N').slice(0,1).toUpperCase()}</span><div><b>{isSuperAdmin?'Super Admin':'NOVA User'}</b><small>{user.email}</small></div></div>}
   <div className="sidebarUtility"><Link href="/settings">Settings</Link><form action={signOut}><ActionButton className="linkButton" pendingLabel="Signing out…">Sign out</ActionButton></form></div>
  </div>
 </aside>
}
