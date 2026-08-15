'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

type NavItem={label:string;href:string;icon:string;badge?:string};
type NavSection={label:string;items:NavItem[]};

export function NavLinks({sections}:{sections:NavSection[]}){
 const pathname=usePathname();
 return <nav className="novaNav" aria-label="Primary navigation">
  {sections.map(section=><div className="navSection" key={section.label}>
    <p className="navSectionLabel">{section.label}</p>
    <div className="navSectionLinks">
      {section.items.map(item=>{
        const active=pathname===item.href || (item.href!=='/dashboard' && pathname.startsWith(item.href+'/'));
        return <Link className={active?'navLink active':'navLink'} href={item.href} key={item.label} aria-current={active?'page':undefined}>
          <span className="navIcon" aria-hidden="true">{item.icon}</span>
          <span className="navLabel">{item.label}</span>
          {item.badge&&<em className="navBadge">{item.badge}</em>}
        </Link>
      })}
    </div>
  </div>)}
 </nav>
}
