import { Space_Grotesk, JetBrains_Mono, DM_Sans, Cormorant_Garamond } from 'next/font/google'
import CaseCockpit from '@/app/intelligence/CaseCockpit'

// Mounts the shared Case Cockpit inside the Govern shell (officer-gated by the
// Govern layout). Reuses the same component — no duplication — and supplies the
// intelligence-layer fonts + void surface it expects.
const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space' })
const jet = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-jet' })
const dm = DM_Sans({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-dmsans' })
const cg = Cormorant_Garamond({ subsets: ['latin'], weight: ['500'], style: ['italic'], variable: '--font-cormorant' })

export default function GovernCockpitPage() {
  return (
    <div
      className={`${space.variable} ${jet.variable} ${dm.variable} ${cg.variable}`}
      style={{ position: 'relative', height: 'calc(100vh - 49px)', background: '#05060b', color: '#eaf2f6', overflow: 'hidden' }}
    >
      <style>{`
        .vg-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .vg-scroll::-webkit-scrollbar-track { background: transparent; }
        .vg-scroll::-webkit-scrollbar-thumb { background: rgba(90,150,175,0.22); border-radius: 4px; }
      `}</style>
      <CaseCockpit />
    </div>
  )
}
