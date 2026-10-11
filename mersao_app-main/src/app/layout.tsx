import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', style: ['normal', 'italic'] })
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: 'Mersão Tattoo — Tatuagem autoral em Ponte Nova',
  description: 'Estúdio de tatuagem autoral em Ponte Nova, MG. Portfólio, vídeos, flashes e orçamento direto no WhatsApp.',
  openGraph: {
    title: 'Mersão Tattoo',
    description: 'Tatuagem autoral, biossegurança e cuidado em cada traço.',
    type: 'website',
    locale: 'pt_BR',
  },
  icons: { icon: '/icon.svg' },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Mersão Tattoo' },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${cinzel.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-obsidian font-sans text-bone antialiased">{children}</body>
    </html>
  )
}
