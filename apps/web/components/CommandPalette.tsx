'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';

type Item={label:string;hint:string;href:string;keys?:string};
function projectIdFrom(path:string){const m=path.match(/^\/projects\/([^/]+)/);return m?.[1]||null}
export function CommandPalette(){
 const path=usePathname(); const router=useRouter(); const [open,setOpen]=useState(false); const [query,setQuery]=useState(''); const [active,setActive]=useState(0); const input=useRef<HTMLInputElement>(null); const pid=projectIdFrom(path);
 const items=useMemo<Item[]>(()=>{
  const global:Item[]=[{label:'Projects',hint:'Open workspace list',href:'/dashboard',keys:'G P'},{label:'Create project',hint:'Connect a new store',href:'/projects/new',keys:'N P'},{label:'Settings',hint:'Account and platform settings',href:'/settings'}];
  if(!pid)return global;
  const base=`/projects/${pid}`;
  return [{label:'Project overview',hint:'Command Center',href:base,keys:'G O'},{label:'Run an audit',hint:'Evidence-backed page scan',href:`${base}/audits`,keys:'G A'},{label:'Competitors',hint:'Discover and validate direct competitors',href:`${base}/competitors`,keys:'G C'},{label:'Benchmark',hint:'Compare store vs validated set',href:`${base}/benchmark`},{label:'Opportunities',hint:'Prioritized growth actions',href:`${base}/opportunities`},{label:'Product intelligence',hint:'Pricing and assortment',href:`${base}/products`},{label:'NOVA Analyst',hint:'Ask your stored evidence',href:`${base}/analyst`,keys:'G N'},{label:'Monitoring',hint:'Track competitor movement',href:`${base}/monitoring`},{label:'Notifications',hint:'Intelligence inbox',href:`${base}/notifications`},{label:'Reports',hint:'Share client-ready intelligence',href:`${base}/reports`},{label:'Research',hint:'Research any store',href:`${base}/research`},...global];
 },[pid]);
 const filtered=items.filter(x=>`${x.label} ${x.hint}`.toLowerCase().includes(query.toLowerCase())).slice(0,10);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setOpen(v=>!v)}if(e.key==='Escape')setOpen(false)};addEventListener('keydown',key);return()=>removeEventListener('keydown',key)},[]);
 useEffect(()=>{if(open)setTimeout(()=>input.current?.focus(),30);else setQuery('');setActive(0)},[open]);
 useEffect(()=>setActive(0),[query]);
 const go=(href:string)=>{setOpen(false);router.push(href)};
 return <><button className="commandTrigger" onClick={()=>setOpen(true)} aria-label="Open NOVA command palette"><span>⌘</span><b>Quick actions</b><kbd>⌘ K</kbd></button>{open&&<div className="commandBackdrop" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setOpen(false)}}><div className="commandPalette" role="dialog" aria-modal="true" aria-label="NOVA quick actions"><div className="commandSearch"><span>⌕</span><input ref={input} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive(v=>Math.min(filtered.length-1,v+1))}if(e.key==='ArrowUp'){e.preventDefault();setActive(v=>Math.max(0,v-1))}if(e.key==='Enter'&&filtered[active]){e.preventDefault();go(filtered[active].href)}}} placeholder="Search pages and actions"/><kbd>ESC</kbd></div><div className="commandResults">{filtered.length?filtered.map((item,i)=><button key={item.href+item.label} className={i===active?'active':''} onMouseEnter={()=>setActive(i)} onClick={()=>go(item.href)}><div><b>{item.label}</b><small>{item.hint}</small></div>{item.keys&&<kbd>{item.keys}</kbd>}</button>):<div className="commandEmpty">No matching action</div>}</div><footer><span>↑↓ Navigate</span><span>↵ Open</span><span>⌘K Toggle</span></footer></div></div>}</>
}
