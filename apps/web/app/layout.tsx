import './styles.css';
import {DeveloperBar} from '../components/DeveloperBar';
export const metadata={title:'NOVA — E-commerce Intelligence',description:'Audit. Benchmark. Discover. Grow.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}<DeveloperBar/></body></html>}
