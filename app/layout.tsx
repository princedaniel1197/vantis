import type { Metadata } from 'next'
import { Syne, DM_Sans, DM_Mono, Cormorant_Garamond } from 'next/font/google'
import VantisIntelligence from '@/components/shared/VantisIntelligence'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['300', '400', '500'],
  display: 'swap',
})

const cg = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cg',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Vantis by Orianode — Karnataka RERA Intelligence',
  description: 'AI-powered regulatory intelligence for Karnataka real estate. Powered by Orianode Technologies.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} ${cg.variable}`}>
      <body className="bg-background text-off-white font-sans antialiased">
        {children}
        <VantisIntelligence />
      </body>
    </html>
  )
}
