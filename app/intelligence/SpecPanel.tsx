'use client'

const mono = 'var(--font-jet), monospace'

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: mono, fontSize: 10.5, paddingBottom: 8, borderBottom: '1px solid rgba(90,150,175,0.08)' }}>
      <span style={{ color: '#c8d6de' }}>{label}</span><span style={{ color: '#6e8a99' }}>{val}</span>
    </div>
  )
}
function Swatch({ hex, name, desc, glow }: { hex: string; name: string; desc: string; glow?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <span style={{ width: 26, height: 26, borderRadius: 7, background: hex, border: '1px solid rgba(90,150,175,0.2)', boxShadow: glow ? `0 0 14px -2px ${hex}b0` : 'none' }} />
      <div><div style={{ fontFamily: mono, fontSize: 11, color: '#c8d6de' }}>{name}</div><div style={{ fontSize: 11, color: '#6e8a99' }}>{desc}</div></div>
    </div>
  )
}
const H = ({ children }: { children: React.ReactNode }) => <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.18em', color: '#5e7280', margin: '0 0 12px' }}>{children}</div>

export default function SpecPanel({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(3,5,9,0.6)', backdropFilter: 'blur(2px)', zIndex: 40 }} />
      <div className="vg-scroll" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, zIndex: 41, background: 'linear-gradient(180deg, #0a0f18, #070a11)', borderLeft: '1px solid rgba(63,224,255,0.2)', boxShadow: '-30px 0 80px -20px rgba(0,0,0,0.8)', overflowY: 'auto', animation: 'vg-in 0.3s ease' }}>
        <div style={{ padding: '22px 24px', borderBottom: '1px solid rgba(90,150,175,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(10,15,24,0.9)', backdropFilter: 'blur(10px)' }}>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.22em', color: '#5fd6f0' }}>HANDOFF SPEC</div>
            <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 17, marginTop: 4 }}>Intelligence Layer</div>
          </div>
          <button onClick={onClose} style={{ cursor: 'pointer', border: '1px solid rgba(90,150,175,0.2)', background: 'transparent', color: '#9fb2be', width: 30, height: 30, borderRadius: 8, fontSize: 15 }}>✕</button>
        </div>
        <div style={{ padding: '22px 24px 40px' }}>
          <H>01 · COLOR TOKENS</H>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 26 }}>
            <Swatch hex="#05060b" name="--void  #05060B" desc="canvas / deep space" />
            <Swatch hex="#3fe0ff" name="--cyan  #3FE0FF" desc="emitted light · live intelligence" glow />
            <Swatch hex="#b8f4ff" name="--cyan-hi  #B8F4FF" desc="hot node cores / glow text" />
            <Swatch hex="#c9a84c" name="--gold  #C9A84C" desc="verified truth + brand" glow />
            <Swatch hex="#45e0c0" name="--delivered  #45E0C0" desc="site-verified / delivered" />
            <Swatch hex="#8fb3ff" name="--declared  #8FB3FF" desc="QPR-declared record" />
            <Swatch hex="#ff5a4d" name="--risk  #FF5A4D" desc="at-risk / hero-gap live wire" glow />
            <Swatch hex="#e8b24c" name="--watch  #E8B24C" desc="watch / encumbrance" />
          </div>

          <H>02 · TYPE SYSTEM</H>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
            <div style={{ paddingBottom: 11, borderBottom: '1px solid rgba(90,150,175,0.1)' }}><div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 20 }}>Space Grotesk</div><div style={{ fontSize: 11, color: '#6e8a99', marginTop: 2 }}>display · scores · titles · 500/600/700</div></div>
            <div style={{ paddingBottom: 11, borderBottom: '1px solid rgba(90,150,175,0.1)' }}><div style={{ fontFamily: mono, fontSize: 15, letterSpacing: '0.06em' }}>JetBrains Mono</div><div style={{ fontSize: 11, color: '#6e8a99', marginTop: 2 }}>system labels · data · IDs · uppercase</div></div>
            <div style={{ paddingBottom: 11, borderBottom: '1px solid rgba(90,150,175,0.1)' }}><div style={{ fontFamily: 'var(--font-dmsans), sans-serif', fontSize: 15 }}>DM Sans</div><div style={{ fontSize: 11, color: '#6e8a99', marginTop: 2 }}>body · answer prose</div></div>
            <div><div style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: 19, color: '#c8d6de' }}>Cormorant Garamond italic</div><div style={{ fontSize: 11, color: '#6e8a99', marginTop: 2 }}>single editorial whisper</div></div>
          </div>

          <H>03 · SURFACES &amp; SPACING</H>
          <div style={{ fontFamily: mono, fontSize: 11, color: '#94a6b0', lineHeight: 1.9, marginBottom: 26 }}>
            glass&nbsp;&nbsp;bg rgba(12,18,26,.5) · blur(14–18px)<br />border&nbsp;1px rgba(90,150,175,.12)<br />radius&nbsp;cards 13 · pills 20 · chips 7<br />glow&nbsp;&nbsp;0 0 40px -12px [accent]<br />space&nbsp;4 · 8 · 11 · 14 · 22 grid
          </div>

          <H>04 · MOTION TIMINGS</H>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 26 }}>
            <Row label="graph settle" val="1600ms · easeOutQuint" />
            <Row label="links draw-in" val="stagger 40ms" />
            <Row label="hero-edge flow" val="2000ms loop · packet" />
            <Row label="score count-up" val="1200ms · easeOutCubic" />
            <Row label="dial sweep" val="1700ms · easeOutQuint" />
            <Row label="copilot chips" val="220ms · sequential" />
            <Row label="answer assemble" val="para fade-up 90ms" />
          </div>

          <H>05 · GRAPH ENGINE NOTES</H>
          <div style={{ fontSize: 12, color: '#94a6b0', lineHeight: 1.65 }}>
            Canvas graph on <strong style={{ color: '#c8d6de' }}>fixed art-directed positions</strong> (pixel-stable every load) with a 1600ms settle to those endpoints. Two render skins share one model: <strong style={{ color: '#c8d6de' }}>A · Orbs</strong> and <strong style={{ color: '#c8d6de' }}>B · Instrument</strong>. Hero edge <strong style={{ color: '#ff8f84' }}>QPR ⟷ CV</strong> is a gradient live-wire with a travelling packet; brightness bound to the declared-vs-delivered gap. In Copilot the non-focus nodes ghost (low opacity, still visible) so the Ozone subgraph pops. Nodes &amp; scores are derived from a typed ontology (<span style={{ fontFamily: mono, color: '#c8d6de' }}>lib/ontology</span>).
          </div>
        </div>
      </div>
    </>
  )
}
