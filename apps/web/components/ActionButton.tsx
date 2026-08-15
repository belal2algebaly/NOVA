'use client';
import {useEffect,useState} from 'react';
import {useFormStatus} from 'react-dom';
import type {ReactNode} from 'react';

export function ActionButton({children,pendingLabel='Working…',className='primary',type='submit',confirmMessage}:{children:ReactNode;pendingLabel?:string;className?:string;type?:'submit'|'button';confirmMessage?:string}){
  const {pending}=useFormStatus(); const [elapsed,setElapsed]=useState(0);
  useEffect(()=>{if(!pending){setElapsed(0);return}const a=setTimeout(()=>setElapsed(1),4500),b=setTimeout(()=>setElapsed(2),11000);return()=>{clearTimeout(a);clearTimeout(b)}},[pending]);
  const label=elapsed===0?pendingLabel:elapsed===1?'Still working…':'This can take a moment…';
  return <button type={type} className={`${className} actionButton${pending?' isPending':''}`} disabled={pending} aria-disabled={pending} aria-busy={pending} onClick={confirmMessage&&!pending?(e)=>{if(!window.confirm(confirmMessage))e.preventDefault()}:undefined}>
    {pending?<><span className="buttonSpinner" aria-hidden="true"/><span>{label}</span></>:children}
  </button>
}
