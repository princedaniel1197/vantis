'use client'

import { useState } from 'react'
import GraphCanvas from './GraphCanvas'
import Count from './Count'
import type { DensityNode } from '@/lib/ontology'

type Tier = 'AT_RISK' | 'WATCH' | 'HEALTHY'
const TIER = {
  AT_RISK: { color: '#ff7a6d', label: 'AT RISK', tint: 'rgba(255,90,77,0.12)', border: 'rgba(255,90,77,0.3)' },
  WATCH: { color: '#f0a24a', label: 'ON WATCH', tint: 'rgba(240,162,74,0.1)', border: 'rgba(240,162,74,0.28)' },
  HEALTHY: { color: '#45e0c0', label: 'HEALTHY', tint: 'rgba(69,224,192,0.06)', border: 'rgba(69,224,192,0.2)' },
} as const

export interface StageRow {
  id: string; project: string; developer: string; tier: Tier
  declLabel: string; declPct: number; verLabel: string; verPct: number; gap: number
  extra?: string
}
export interface StageViewProps {
  skin: 'A' | 'B'; density?: DensityNode[]
  eyebrow: string; title: string; subtitle: string
  headlineValue: string; headlineLabel: string; headlineColor?: string
  counts: { atRisk: number; watch: number; healthy: number }
  rows: StageRow[]
  captionTop: string; captionSub: string
  roadmap: string
}

function Bar({ r }: { r: StageRow }) {
  const tc = TIER[r.tier].color
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.08em', color: '#94a6b0', marginBottom: 6 }}>
        <span>{r.declLabel} <span style={{ color: '#8fb3ff' }}>{r.declPct}%</span></span>
        <span style={{ color: tc }}>GAP −{r.gap} pts</span>
        <span>{r.verLabel} <span style={{ color: '#45e0c0' }}>{r.verPct}%</span></span>
      </div>
      <div style={{ position: 'relative', height: 7, borderRadius: 4, background: 'rgba(90,150,175,0.1)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${r.verPct}%`, background: 'linear-gradient(90deg,#2e8f7e,#45e0c0)', transformOrigin: 'left', animation: 'vg-growx 1.1s cubic-bezier(.2,.7,.2,1) forwards' }} />
        <div style={{ position: 'absolute', left: `${r.verPct}%`, top: 0, bottom: 0, width: `${r.gap}%`, background: `repeating-linear-gradient(45deg, ${tc}88 0 4px, ${tc}33 4px 8px)`, transformOrigin: 'left', animation: 'vg-growx 1.1s .25s cubic-bezier(.2,.7,.2,1) both' }} />
      </div>
    </div>
  )
}

export default function StageView(p: StageViewProps) {
  const [focus, setFocus] = useState<string | null>(null)
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      <div className="vg-scroll" style={{ width: 392, flex: 'none', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(90,150,175,0.1)', background: 'linear-gradient(180deg, rgba(9,14,22,0.5), rgba(6,9,15,0.2))', overflowY: 'auto' }}>
        <div style={{ padding: '22px 22px 18px', borderBottom: '1px solid rgba(90,150,175,0.1)' }}>
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.22em', color: '#5e7280', marginBottom: 8 }}>{p.eyebrow}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 22, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{p.title}</div>
              <div style={{ width: 26, height: 2, margin: '9px 0 10px', background: 'linear-gradient(90deg,#e8d5a3,#c9a84c)', boxShadow: '0 0 10px -1px rgba(201,168,76,0.7)' }} />
              <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9.5, letterSpacing: '0.06em', color: '#7f97a4', lineHeight: 1.6, maxWidth: 200 }}>{p.subtitle}</div>
            </div>
            <div style={{ textAlign: 'right', flex: 'none' }}>
              <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 700, fontSize: 30, lineHeight: 1, color: p.headlineColor || '#ff7a6d' }}>{p.headlineValue}</div>
              <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.14em', color: '#7f97a4', marginTop: 4 }}>{p.headlineLabel}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {[
              { n: p.counts.atRisk, c: '#ff7a6d', bg: 'rgba(255,90,77,0.07)', bd: 'rgba(255,90,77,0.22)', l: 'AT RISK' },
              { n: p.counts.watch, c: '#f0a24a', bg: 'rgba(240,162,74,0.06)', bd: 'rgba(240,162,74,0.2)', l: 'ON WATCH' },
              { n: p.counts.healthy, c: '#45e0c0', bg: 'rgba(69,224,192,0.06)', bd: 'rgba(69,224,192,0.2)', l: 'CLEAN' },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, padding: '9px 10px', borderRadius: 9, background: s.bg, border: `1px solid ${s.bd}` }}>
                <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 700, fontSize: 17, color: s.c }}><Count to={s.n} /></div>
                <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.12em', color: '#7f97a4', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
          {p.rows.map(r => {
            const T = TIER[r.tier]
            const flagged = r.tier !== 'HEALTHY'
            return (
              <div key={r.id} onMouseEnter={() => setFocus(r.id)} onMouseLeave={() => setFocus(null)}
                style={{ position: 'relative', padding: 15, borderRadius: 13, cursor: 'pointer', background: r.tier === 'AT_RISK' ? 'linear-gradient(180deg, rgba(30,14,14,0.5), rgba(16,10,12,0.35))' : 'rgba(11,16,24,0.42)', border: `1px solid ${r.tier === 'AT_RISK' ? 'rgba(255,90,77,0.4)' : r.tier === 'WATCH' ? 'rgba(240,162,74,0.28)' : 'rgba(90,150,175,0.14)'}`, animation: r.tier === 'AT_RISK' ? 'vg-risk 3.2s ease-in-out infinite' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 15 }}>{r.project}</div>
                    <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.1em', color: '#94a6b0', marginTop: 4 }}>{r.developer}{r.extra ? ` · ${r.extra}` : ''}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.12em', color: T.color, padding: '2px 6px', borderRadius: 5, background: T.tint, border: `1px solid ${T.border}`, flex: 'none' }}>{flagged ? T.label : 'CLEAN'}</div>
                </div>
                <Bar r={r} />
              </div>
            )
          })}
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.08em', color: '#5e7280', padding: '2px 4px', lineHeight: 1.6 }}>{p.roadmap}</div>
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <GraphCanvas mode="brain" skin={p.skin} externalFocusId={focus} density={p.density} />
        <div style={{ position: 'absolute', top: 20, left: 22, pointerEvents: 'none' }}>
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.24em', color: '#5fd6f0', textShadow: '0 0 14px rgba(63,224,255,0.5)' }}>{p.captionTop}</div>
          <div style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: 21, color: '#c8d6de', marginTop: 4, opacity: 0.85 }}>{p.captionSub}</div>
        </div>
      </div>
    </div>
  )
}
