import Link from 'next/link';
import {ActionButton} from './ActionButton';
import {Brand} from './Brand';
import {NavLinks} from './NavLinks';
import {signOut} from '../app/actions/auth';
import {getCurrentUserRole} from '../lib/admin';

export async function AdminSidebar(){
 const {user,isSuperAdmin}=await getCurrentUserRole();
 const sections=[
  {label:'Control center',items:[
   {label:'Overview',href:'/admin',icon:'◈',badge:'ROOT'},
   {label:'Users',href:'/admin/users',icon:'◎'},
   {label:'Projects & stores',href:'/admin/projects',icon:'▦'},
   {label:'Activity',href:'/admin/activity',icon:'◌'}]},
  {label:'System',items:[
   {label:'System health',href:'/admin/status',icon:'◉',badge:'LIVE'},
   {label:'AI & integrations',href:'/admin/ai',icon:'✧',badge:'AI'}]},
  {label:'Workspace',items:[
   {label:'User workspace',href:'/dashboard',icon:'↗'},
   {label:'Settings',href:'/settings',icon:'⚙'}]}
 ];
 if(!user||!isSuperAdmin)return null;
 return <aside className="sidebar adminSidebar">
  <div className="sidebarTop">
   <div className="brandZone"><Brand/><p className="tagline">Platform administration</p></div>
   <div className="adminMode"><span>ROOT</span><div><b>Super Admin Control</b><small>Global platform visibility</small></div></div>
   <NavLinks sections={sections}/>
  </div>
  <div className="sidebottom adminSideBottom">
   <div className="userMini adminIdentityMini"><span>{(user.email||'B').slice(0,1).toUpperCase()}</span><div><b>Belal · Super Admin</b><small>{user.email}</small></div></div>
   <form action={signOut}><ActionButton className="linkButton adminSignout" pendingLabel="Signing out…">Sign out</ActionButton></form>
  </div>
 </aside>
}
