import Link from 'next/link';
import {Brand} from '../components/Brand';
import {DeveloperBar} from '../components/DeveloperBar';
import {isSupabaseConfigured} from '../lib/config';

export default function Home(){
 return <main className="landing landingOneScreen">
  <div className="landingAccent"/>
  <header className="publicHeader"><Brand/><div><Link className="ghost" href="/login">Sign in</Link><Link className="primary" href="/signup">Start with NOVA</Link></div></header>
  <section className="hero heroOneScreen">
   <div className="heroCopy">
    <p className="eyebrow">E-COMMERCE INTELLIGENCE PLATFORM</p>
    <h1>Know your store<br/>Know your market</h1>
    <p>NOVA brings evidence-first CRO audits, competitor intelligence and actionable opportunities into one workspace</p>
    <div className="heroActions"><Link className="primary" href="/signup">Create your workspace</Link><Link className="ghost" href="/login">Open dashboard</Link></div>
    <div className="statusline"><i className={isSupabaseConfigured?'ok':'warn'}/>{isSupabaseConfigured?'Backend configured':'Backend keys not configured yet'}</div>
   </div>
   <div className="heroSignal" aria-hidden="true">
    <div className="signalWindow"><div className="signalTop"><span/><span/><span/></div><div className="signalScore"><small>NOVA SCORE</small><strong>84</strong><em>+12</em></div><div className="signalLines"><i/><i/><i/><i/></div><div className="signalOpportunity"><span>Competitive gap detected</span><b>High impact</b></div></div>
   </div>
  </section>
  <section className="featureGrid featureStrip"><article><b>Audit</b><p>Evidence-first analysis</p></article><article><b>Discover</b><p>Direct competitor validation</p></article><article><b>Benchmark</b><p>Decision experience comparison</p></article><article><b>Grow</b><p>Prioritized opportunities</p></article></section>
  <footer className="publicFooter"><DeveloperBar/></footer>
 </main>
}
