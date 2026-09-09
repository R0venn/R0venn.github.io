import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Carnet d’histoire',description:'Vos personnages et vos règnes sur une frise chronologique personnelle.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg'},appleWebApp:{capable:true,title:'Carnet d’histoire'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
