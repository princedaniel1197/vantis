'use client'

import { useState } from 'react'
import GraphCanvas from './GraphCanvas'
import Count from './Count'
import { scoredProjects, portfolioIndex, portfolioCounts, tierOf, type ScoredProject, type DensityNode } from '@/lib/ontology'
import type { DatasetStats } from '@/lib/ontology/dataset'

const TIER = {
  AT_RISK: { color: '#ff7a6d', label: 'AT RISK', tint: 'rgba(255,90,77,0.12)', border: 'rgba(255,90,77,0.3)' },
  WATCH: { color: '#f0a24a', label: 'ON WATCH', tint: 'rgba(240,162,74,0.1)', border: 'rgba(240,162,74,0.28)' },
  HEALTHY: { color: '#45e0c0', label: 'HEALTHY', tint: 'rgba(69,224,192,0.06)', border: 'rgba(69,224,192,0.2)' },
} as const

const CIRC = 326.7 // 2πr, r=52

function DualBar({ p, tierColor }: { p: ScoredProject; tierColor: string }) {
  const { declared_pct, delivered_pct, gap } = p.signals
  return (
    <div style={{ marginTop: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.08em', color: '#94a6b0', marginBottom: 6 }}>
        <span>DECLARED <span style={{ color: '#8fb3ff' }}>{declared_pct}%</span></span>
        <span style={{ color: tierColor }}>GAP −{gap} pts</span>
        <span>DELIVERED <span style={{ color: '#45e0c0' }}>{delivered_pct}%</span></span>
      </div>
      <div style={{ position: 'relative', height: 7, borderRadius: 4, background: 'rgba(90,150,175,0.1)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${delivered_pct}%`, background: 'linear-gradient(90deg,#2e8f7e,#45e0c0)', transformOrigin: 'left', animation: 'vg-growx 1.1s cubic-bezier(.2,.7,.2,1) forwards' }} />
        <div style={{ position: 'absolute', left: `${delivered_pct}%`, top: 0, bottom: 0, width: `${gap}%`, background: `repeating-linear-gradient(45deg, ${tierColor}88 0 4px, ${tierColor}33 4px 8px)`, transformOrigin: 'left', animation: 'vg-growx 1.1s .25s cubic-bezier(.2,.7,.2,1) both' }} />
      </div>
    </div>
  )
}

export default function ExecutionBrain({ skin, density, total, stats }: { skin: 'A' | 'B'; density?: DensityNode[]; total: number; stats: DatasetStats }) {
  const projects = scoredProjects()
  const index = portfolioIndex()
  const counts = portfolioCounts()
  const [focus, setFocus] = useState<string | null>(null)
  const dialOffset = CIRC * (1 - index / 100)

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {/* portfolio column */}
      <div className="vg-scroll" style={{ width: 392, flex: 'none', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(90,150,175,0.1)', background: 'linear-gradient(180deg, rgba(9,14,22,0.5), rgba(6,9,15,0.2))', overflowY: 'auto' }}>
        <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid rgba(90,150,175,0.1)' }}>
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.22em', color: '#5e7280', marginBottom: 8 }}>K-RERA · PORTFOLIO INTELLIGENCE</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.1 }}>Execution Watchlist</div>
              <div style={{ width: 26, height: 2, margin: '9px 0 10px', background: 'linear-gradient(90deg,#e8d5a3,#c9a84c)', boxShadow: '0 0 10px -1px rgba(201,168,76,0.7)' }} />
              <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9.5, letterSpacing: '0.08em', color: '#7f97a4', lineHeight: 1.7 }}>{total.toLocaleString()} K-RERA PROJECTS · {stats.districts} DISTRICTS<br />{projects.length} IN WATCHLIST · ₹675 Cr TRACKED</div>
            </div>
            <div style={{ position: 'relative', width: 112, height: 112, flex: 'none' }}>
              <svg width="112" height="112" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="52" fill="none" stroke="rgba(90,150,175,0.12)" strokeWidth="6" />
                <circle cx="56" cy="56" r="52" fill="none" stroke="url(#execgrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={dialOffset} transform="rotate(-90 56 56)" style={{ animation: 'vg-dial 1.7s cubic-bezier(.2,.7,.2,1) forwards', filter: 'drop-shadow(0 0 6px rgba(63,224,255,0.55))' }} />
                <defs><linearGradient id="execgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3fe0ff" /><stop offset="0.6" stopColor="#5fd6f0" /><stop offset="1" stopColor="#f0a24a" /></linearGradient></defs>
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 700, fontSize: 32, lineHeight: 1, color: '#eaf2f6' }}><Count to={index} /></div>
                <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.18em', color: '#7f97a4', marginTop: 3 }}>EXECUTION</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[
              { n: counts.atRisk, c: '#ff7a6d', bg: 'rgba(255,90,77,0.07)', bd: 'rgba(255,90,77,0.22)', l: 'AT RISK' },
              { n: counts.watch, c: '#f0a24a', bg: 'rgba(240,162,74,0.06)', bd: 'rgba(240,162,74,0.2)', l: 'ON WATCH' },
              { n: counts.healthy, c: '#45e0c0', bg: 'rgba(69,224,192,0.06)', bd: 'rgba(69,224,192,0.2)', l: 'HEALTHY' },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, padding: '9px 10px', borderRadius: 9, background: s.bg, border: `1px solid ${s.bd}` }}>
                <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 700, fontSize: 17, color: s.c }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.12em', color: '#7f97a4', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* project cards */}
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.2em', color: '#5e7280', padding: '2px 4px' }}>PROJECTS · EXECUTION SCORE</div>
          {projects.map(p => {
            const tier = tierOf(p.score)
            const T = TIER[tier]
            const isRisk = tier === 'AT_RISK'
            const isHealthy = tier === 'HEALTHY'
            return (
              <div key={p.id} onMouseEnter={() => setFocus(p.id)} onMouseLeave={() => setFocus(null)}
                style={{
                  position: 'relative', padding: isHealthy ? '14px 15px' : '15px', borderRadius: 13, cursor: 'pointer',
                  background: isRisk ? 'linear-gradient(180deg, rgba(30,14,14,0.5), rgba(16,10,12,0.35))' : isHealthy ? 'rgba(11,16,24,0.42)' : 'rgba(12,18,26,0.5)',
                  border: `1px solid ${isRisk ? 'rgba(255,90,77,0.4)' : isHealthy ? 'rgba(90,150,175,0.14)' : 'rgba(240,162,74,0.28)'}`,
                  animation: isRisk ? 'vg-risk 3.2s ease-in-out infinite' : undefined,
                }}>
                {isRisk && <span style={{ position: 'absolute', top: 13, left: 15, width: 7, height: 7, borderRadius: '50%', background: '#ff5a4d', boxShadow: '0 0 10px 1px rgba(255,90,77,0.9)', animation: 'vg-dot 1.5s ease-in-out infinite' }} />}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isHealthy ? 'center' : 'flex-start', paddingLeft: isRisk ? 16 : 0 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: isHealthy ? 14.5 : 15.5, lineHeight: 1.15 }}>{p.label}</div>
                    <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.1em', color: isHealthy ? '#7f97a4' : '#94a6b0', marginTop: 4 }}>
                      {p.developerLabel} · ₹{p.loan_cr} Cr{isHealthy ? ` · GAP −${p.signals.gap} pts · ${p.tranche_note}` : ` · ${p.tranche_note.toUpperCase()}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 700, fontSize: isHealthy ? 26 : 30, lineHeight: 0.9, color: T.color, textShadow: isRisk ? '0 0 18px rgba(255,90,77,0.5)' : undefined }}>
                      <Count to={p.score} />{!isHealthy && <span style={{ fontSize: 13, color: '#94a6b0', fontWeight: 500 }}>/100</span>}
                    </div>
                    {isHealthy
                      ? <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.1em', color: T.color }}>{T.label}</div>
                      : <div style={{ display: 'inline-block', marginTop: 5, fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.12em', color: T.color, padding: '2px 6px', borderRadius: 5, background: T.tint, border: `1px solid ${T.border}` }}>{T.label}</div>}
                  </div>
                </div>
                {!isHealthy && <DualBar p={p} tierColor={T.color} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* graph theatre */}
      <div style={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <GraphCanvas mode="brain" skin={skin} externalFocusId={focus} density={density} />
        <div style={{ position: 'absolute', top: 20, left: 22, pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.24em', color: '#5fd6f0', textShadow: '0 0 14px rgba(63,224,255,0.5)' }}>LIVE KNOWLEDGE GRAPH</div>
          <div style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: 22, color: '#c8d6de', marginTop: 4, opacity: 0.85 }}>the mind over the record</div>
        </div>
        <div style={{ position: 'absolute', top: 20, right: 22, padding: '11px 14px', borderRadius: 11, background: 'rgba(18,10,12,0.6)', border: '1px solid rgba(255,90,77,0.35)', backdropFilter: 'blur(8px)', boxShadow: '0 0 40px -12px rgba(255,90,77,0.55)', animation: 'vg-float 5s ease-in-out infinite' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5a4d', boxShadow: '0 0 10px 1px rgba(255,90,77,0.9)', animation: 'vg-dot 1.5s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.16em', color: '#ff8f84' }}>HERO EDGE · LIVE WIRE</span>
          </div>
          <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 13, marginTop: 6, color: '#eaf2f6' }}>Declared vs Delivered</div>
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.06em', color: '#94a6b0', marginTop: 3 }}>QPR 78% ⟷ CV 54% · <span style={{ color: '#ff7a6d' }}>−24 pts</span></div>
        </div>
        <Legend />
      </div>
    </div>
  )
}

function Legend() {
  const items = [
    ['#c9a84c', 'DEVELOPER'], ['#3fe0ff', 'PROJECT'], ['#8fb3ff', 'QPR · DECLARED'],
    ['#45e0c0', 'SITE VERIF · DELIVERED'], ['#ff5a4d', 'LITIGATION'], ['#e8b24c', 'ENCUMBRANCE'],
  ]
  return (
    <div style={{ position: 'absolute', bottom: 18, left: 22, display: 'flex', flexWrap: 'wrap', gap: '10px 16px', maxWidth: 520, pointerEvents: 'none' }}>
      {items.map(([c, l]) => (
        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}99` }} />
          <span style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.08em', color: '#94a6b0' }}>{l}</span>
        </div>
      ))}
    </div>
  )
}
