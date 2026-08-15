'use client';
import {useEffect,useRef,useState} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';

export function UXFeedback(){
  const pathname=usePathname(); const search=useSearchParams();
  const [busy,setBusy]=useState(false); const [slow,setSlow]=useState(false); const [online,setOnline]=useState(true);
  const [toast,setToast]=useState<{kind:'success'|'error'|'info';text:string}|null>(null); const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{setBusy(false);setSlow(false)},[pathname,search]);
  useEffect(()=>{if(!busy){setSlow(false);return}const t=setTimeout(()=>setSlow(true),9000);return()=>clearTimeout(t)},[busy]);
  useEffect(()=>{const sync=()=>setOnline(navigator.onLine);sync();addEventListener('online',sync);addEventListener('offline',sync);return()=>{removeEventListener('online',sync);removeEventListener('offline',sync)}},[]);
  useEffect(()=>{
    const click=(e:MouseEvent)=>{const el=(e.target as HTMLElement)?.closest('a[href]') as HTMLAnchorElement|null;if(!el||e.metaKey||e.ctrlKey||e.shiftKey||el.target==='_blank'||el.hasAttribute('download'))return;try{const u=new URL(el.href,location.href);if(u.origin===location.origin&&u.href!==location.href)setBusy(true)}catch{}};
    const submit=(e:SubmitEvent)=>{const form=e.target as HTMLFormElement;if(form?.method?.toLowerCase()!=='dialog')setBusy(true)};
    document.addEventListener('click',click,true);document.addEventListener('submit',submit,true);return()=>{document.removeEventListener('click',click,true);document.removeEventListener('submit',submit,true)};
  },[]);
  useEffect(()=>{const error=search.get('error');const message=search.get('message');const success=search.get('added')||search.get('profile')||search.get('discovered')||search.get('created')||search.get('saved')||search.get('shared');let next=null as typeof toast;if(error)next={kind:'error' as const,text:error};else if(message)next={kind:'success' as const,text:message};else if(success)next={kind:'success' as const,text:'Done — NOVA updated the workspace'};if(next){setToast(next);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(null),4200)}return()=>{if(timer.current)clearTimeout(timer.current)}},[search]);
  return <><div className={`routeProgress ${busy?'active':''}`} aria-hidden="true"><i/></div><div className="uxLive" aria-live="polite" aria-atomic="true">{!online?'You are offline':busy?(slow?'NOVA is still working on your request':'NOVA is working on your request'):''}</div>{!online&&<div className="connectionBanner" role="status">You’re offline — reconnect before running scans or saving changes</div>}{busy&&<div className={`workingChip ${slow?'slow':''}`} role="status"><span className="buttonSpinner"/>{slow?'Still working — this action needs a little more time':'NOVA is working'}</div>}{toast&&<div className={`toast ${toast.kind}`} role="status"><span>{toast.kind==='success'?'✓':toast.kind==='error'?'!':'i'}</span><p>{toast.text}</p><button onClick={()=>setToast(null)} aria-label="Dismiss notification">×</button></div>}</>
}
