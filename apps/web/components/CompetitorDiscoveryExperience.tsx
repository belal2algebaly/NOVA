'use client';
import {useEffect,useMemo,useState,useTransition} from 'react';
import Link from 'next/link';
import {addCompetitor,deleteCompetitor,discoverProjectCompetitors} from '../app/actions/competitors';

type Competitor={id:string;name?:string|null;store_url:string;classification?:string|null;match_score?:number|null;confidence_score?:number|null;profile?:any};
const stages=[
 ['Understanding market','Reading country, currency and category signals'],
 ['Building smart queries','AI is shaping local-first search queries'],
 ['Searching locally','Checking free search sources and cached results'],
 ['Qualifying candidates','Removing marketplaces, noise and weak geo matches'],
 ['Validating direct competitors','Crawling candidates and checking product, price and market overlap']
] as const;

export function CompetitorDiscoveryExperience({projectId,competitors,configured,marketCard}:{projectId:string;competitors:Competitor[];configured:boolean;marketCard:React.ReactNode}){
 const [pending,startTransition]=useTransition();
 const [stage,setStage]=useState(0);
 useEffect(()=>{if(!pending){setStage(0);return}const id=setInterval(()=>setStage(v=>Math.min(stages.length-1,v+1)),1700);return()=>clearInterval(id)},[pending]);
 const progress=useMemo(()=>Math.round(((stage+1)/stages.length)*100),[stage]);
 const discover=()=>{document.querySelectorAll('[data-discovery-feedback]').forEach(el=>el.remove());startTransition(async()=>{await discoverProjectCompetitors(projectId)})};
 const add=addCompetitor.bind(null,projectId);
 return <>
  <div className="two competitorTop">
   {marketCard}
   <article className="panel discoveryPanel">
    <p className="eyebrow">AI-ASSISTED LOCAL DISCOVERY</p>
    <h2>Find meaningful competitors</h2>
    <p className="muted">NOVA combines market evidence, AI-built search queries, free search providers and full-site validation. AI can prioritize evidence, but it never invents competitor domains.</p>
    <button type="button" className="primary wide discoverButton" onClick={discover} disabled={pending||!configured}>{pending?'Discovery in progress…':'Discover competitors'}</button>
    <small className={configured?'goodText':'warnText'}>{configured?'AI-assisted discovery · free search fallback · no paid search API required':'Automatic discovery disabled'}</small>
    <div className="divider"/>
    <p className="eyebrow">VALIDATE A URL</p>
    <form action={add} className="inlineForm competitorForm"><input name="url" placeholder="https://competitor.com" required disabled={pending}/><button className="ghost" disabled={pending}>Validate</button></form>
   </article>
  </div>
  {pending?<DiscoveryLoader stage={stage} progress={progress}/>:<ValidatedSet projectId={projectId} competitors={competitors}/>} 
 </>
}

function DiscoveryLoader({stage,progress}:{stage:number;progress:number}){const current=stages[stage];return <section className="panel discoveryLoading" aria-live="polite" aria-busy="true">
 <div className="discoveryLoadingHero"><div className="discoveryOrb" aria-hidden="true"><i/><i/><i/><span>N</span></div><div><p className="eyebrow">NOVA DISCOVERY ENGINE</p><h2>{current[0]}</h2><p>{current[1]}</p></div><strong>{progress}%</strong></div>
 <div className="discoveryProgress"><span style={{width:`${progress}%`}}/></div>
 <div className="discoveryStages">{stages.map((s,i)=><div key={s[0]} className={i<stage?'done':i===stage?'active':''}><span>{i<stage?'✓':i+1}</span><div><b>{s[0]}</b><small>{s[1]}</small></div></div>)}</div>
 <div className="candidateSkeletons" aria-hidden="true"><i/><i/><i/></div>
 </section>}

function ValidatedSet({projectId,competitors}:{projectId:string;competitors:Competitor[]}){return <section className="panel validatedSet"><div className="panelhead"><div><p className="eyebrow">VALIDATED SET</p><h2>{competitors.length} competitor profiles</h2></div><span className="pill">Market fit matters</span></div>{competitors.length?<div className="competitorCards">{competitors.map(c=>{const p=c.profile||{};const del=deleteCompetitor.bind(null,projectId,c.id);return <article className="competitorCard competitorReveal" key={c.id}><div className="competitorCardTop"><Link href={`/projects/${projectId}/competitors/${c.id}`}><b>{c.name||c.store_url}</b><small>{safeDomain(c.store_url)}</small></Link><span className={`classBadge ${classKey(c.classification||'')}`}>{c.classification||'Unknown'}</span></div><div className="competitorQuickStats"><div><span>Match</span><strong>{c.match_score??0}%</strong></div><div><span>Market</span><strong>{p.primaryMarket||p.marketHints?.[0]||'—'}</strong></div><div><span>Price range</span><strong>{range(p)}</strong></div></div><div className="categoryLine"><span>Categories</span><p>{p.categories?.slice(0,5).join(' · ')||'Not proven yet'}</p></div><div className="competitorCardFoot"><span className="confidenceMini">{Math.round(Number(c.confidence_score||0))}% evidence</span><Link href={`/projects/${projectId}/competitors/${c.id}`}>Open research →</Link><form action={del}><button className="miniButton">Remove</button></form></div></article>})}</div>:<div className="emptyCompact"><p>No validated competitors yet. Run AI-assisted discovery or validate a known URL</p></div>}</section>}
function safeDomain(u:string){try{return new URL(u).hostname.replace(/^www\./,'')}catch{return u}}
function range(p:any){if(p?.priceMin==null||p?.priceMax==null)return '—';return `${p.currencies?.[0]||''} ${Math.round(p.priceMin)}–${Math.round(p.priceMax)}`}
function classKey(v:string){return String(v||'').toLowerCase().replace(/\s+/g,'-')}
