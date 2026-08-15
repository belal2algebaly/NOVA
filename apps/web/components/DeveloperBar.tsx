export function DeveloperBar(){
 return <div className="developerDock" aria-label="NOVA developer links">
   <div className="developerDockShine" aria-hidden="true"/>
   <div className="developerDockInner">
    <div className="developerSignature">
      <span className="developerMark">N</span>
      <div><span>Developed by</span><strong>Belal Algebaly</strong></div>
    </div>
    <div className="developerRotator" aria-label="NOVA messages">
      <span className="developerMessage"><b>Developed by Belal Algebaly</b> · Built for e-commerce teams</span>
      <span className="developerMessage"><b>Free to use for a limited time</b> · Explore the full NOVA intelligence stack</span>
      <span className="developerMessage"><b>Built for sharper e-commerce decisions</b> · Evidence over guesswork</span>
    </div>
    <div className="developerSocials">
      <a href="https://www.linkedin.com/in/belal-algebaly-2ab015308/" target="_blank" rel="noreferrer" aria-label="Belal Algebaly on LinkedIn" title="LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3.6A2.2 2.2 0 1 1 5.2 8a2.2 2.2 0 0 1 0-4.4ZM3.3 9.7h3.8V21H3.3V9.7Zm6.1 0h3.6v1.55h.05c.5-.95 1.74-1.95 3.58-1.95 3.83 0 4.54 2.52 4.54 5.8V21h-3.8v-5.23c0-1.25-.02-2.86-1.74-2.86-1.74 0-2.01 1.36-2.01 2.77V21H9.4V9.7Z"/></svg>
      </a>
      <a href="https://www.facebook.com/profile.php?id=61585212901611" target="_blank" rel="noreferrer" aria-label="Belal Algebaly on Facebook" title="Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 21v-7.9h2.65l.4-3.08H13.6V8.05c0-.9.25-1.5 1.53-1.5h1.63V3.8c-.28-.04-1.25-.12-2.38-.12-2.35 0-3.96 1.43-3.96 4.07v2.27H7.76v3.08h2.66V21h3.18Z"/></svg>
      </a>
    </div>
   </div>
 </div>
}
