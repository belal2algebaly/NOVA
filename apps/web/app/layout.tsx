import './styles.css';
import {DeveloperBar} from '../components/DeveloperBar';
import {UXFeedback} from '../components/UXFeedback';
import {Suspense} from 'react';
import {CommandPalette} from '../components/CommandPalette';
export const metadata={title:'NOVA — E-commerce Intelligence',description:'Audit. Benchmark. Discover. Grow.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Suspense fallback={null}><UXFeedback/></Suspense><CommandPalette/>{children}<DeveloperBar/></body></html>}
