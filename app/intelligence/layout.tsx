import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono, DM_Sans, Cormorant_Garamond } from 'next/font/google'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-jet' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dmsans' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500'], style: ['italic'], variable: '--font-cormorant' })

export const metadata: Metadata = {
  title: 'Vantis · Intelligence Layer',
  description: 'Execution Brain & Cross-Stage Copilot — reasoning over the ontology.',
}

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${spaceGrotesk.variable} ${jetbrains.variable} ${dmSans.variable} ${cormorant.variable}`}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background:
          'radial-gradient(1100px 760px at 72% 14%, #0d1826 0%, rgba(9,13,22,0) 58%),' +
          'radial-gradient(900px 700px at 12% 96%, #0a1420 0%, rgba(6,9,15,0) 60%),' +
          '#05060b',
        color: '#eaf2f6',
        fontFamily: 'var(--font-dmsans), system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* scoped intelligence-layer keyframes (vg-*) — additive, no collision */}
      <style>{`
        @keyframes vg-dial { from { stroke-dashoffset: 326.7; } }
        @keyframes vg-growx { from { transform: scaleX(0); } }
        @keyframes vg-risk { 0%,100% { box-shadow: 0 0 0 0 rgba(255,90,77,0.45), 0 0 46px -12px rgba(255,90,77,0.5); } 50% { box-shadow: 0 0 0 3px rgba(255,90,77,0), 0 0 60px -10px rgba(255,90,77,0.7); } }
        @keyframes vg-dot { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.72); } }
        @keyframes vg-in { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes vg-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .vg-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .vg-scroll::-webkit-scrollbar-track { background: transparent; }
        .vg-scroll::-webkit-scrollbar-thumb { background: rgba(90,150,175,0.22); border-radius: 4px; }
      `}</style>
      {children}
    </div>
  )
}
