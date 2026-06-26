'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, XCircle, Map, Scale, Building2, Database } from 'lucide-react'
import landData from '@/data/dev-land.json'

const PARCELS = [
  { key: 'ozone' as const, label: 'Ozone Urbana (Sample — External)', type: 'risk-demo' },
  { key: 'mrd010' as const, label: 'Meridian Edge Whitefield P2', type: 'own' },
]

const RISK_COLOR: Record<string, string> = { CRITICAL: 'var(--rc)', HIGH: 'var(--rc)', MEDIUM: 'var(--rb)', LOW: 'var(--ra)', ok: 'var(--ra)', flag: 'var(--rb)', critical: 'var(--rc)' }
const RISK_BG: Record<string, string> = { CRITICAL: 'color-mix(in srgb, var(--rc) 10%, var(--surf2))', HIGH: 'color-mix(in srgb, var(--rc) 6%, var(--surf2))', MEDIUM: 'color-mix(in srgb, var(--rb) 8%, var(--surf2))', LOW: 'color-mix(in srgb, var(--ra) 6%, var(--surf2))' }

const SCORE_GRADE: Record<string, string> = { A: 'var(--ra)', B: 'var(--rb)', C: 'var(--rc)' }

export default function LandPage() {
  const [selected, setSelected] = useState<'ozone' | 'mrd010'>('mrd010')
  const parcel = landData[selected]

  const subScores = Object.values(parcel.sub_scores)
  const totalScorePct = Math.round(parcel.risk_score)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Intelligence · Land</div>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Land Intelligence</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Government data — Kaveri 2.0, Bhoomi, eCourts, BBMP — before any acquisition or registration decision.</p>
      </div>

      {/* Parcel switcher */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {PARCELS.map(p => (
          <button key={p.key} onClick={() => setSelected(p.key)}
            className="px-4 py-2 rounded-sm text-sm font-mono"
            style={{ background: selected === p.key ? 'color-mix(in srgb, var(--gold) 10%, var(--surf))' : 'var(--surf)', color: selected === p.key ? 'var(--gold)' : 'var(--muted)', border: `1px solid ${selected === p.key ? 'var(--gold)' : 'var(--bord)'}` }}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Risk header */}
          <motion.div key={selected} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-sm flex items-center gap-6"
            style={{ background: parcel.risk_grade === 'C' ? 'color-mix(in srgb, var(--rc) 5%, var(--surf))' : 'color-mix(in srgb, var(--rb) 5%, var(--surf))', border: `2px solid ${SCORE_GRADE[parcel.risk_grade]}` }}>
            <div className="text-center shrink-0">
              <div className="font-display italic text-6xl leading-none" style={{ color: SCORE_GRADE[parcel.risk_grade] }}>{parcel.risk_grade}</div>
              <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--muted)' }}>risk grade</div>
              <div className="font-display italic text-2xl" style={{ color: SCORE_GRADE[parcel.risk_grade] }}>{totalScorePct}/100</div>
            </div>
            <div className="flex-1">
              <div className="text-xl font-medium mb-1" style={{ color: 'var(--ink)' }}>{parcel.name}</div>
              <div className="font-mono text-[11px] mb-2" style={{ color: 'var(--muted)' }}>{parcel.survey}</div>
              <div className="font-mono text-[11px] mb-1" style={{ color: 'var(--muted)' }}>
                RERA: {parcel.rera_id.slice(-10)} · {parcel.ka_area_acres} acres · {parcel.developer}
              </div>
            </div>
          </motion.div>

          {/* Sub-score bars */}
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-4 block" style={{ color: 'var(--muted)' }}>Risk Breakdown — 5 Dimensions</span>
            <div className="space-y-3">
              {subScores.map((s, i) => {
                const sc = RISK_COLOR[s.severity] ?? 'var(--muted)'
                return (
                  <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--ink)' }}>{s.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm" style={{ color: sc, background: RISK_BG[s.severity] ?? 'var(--surf2)' }}>{s.severity}</span>
                        <span className="font-mono text-sm" style={{ color: sc }}>{s.score}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--surf2)' }}>
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ delay: 0.3 + i * 0.07, duration: 0.6 }}
                        style={{ background: sc }} />
                    </div>
                    <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                      <span style={{ color: 'var(--gold)' }}>{s.db}</span> — {s.finding.slice(0, 120)}{s.finding.length > 120 ? '…' : ''}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Title chain */}
          <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bord)' }}>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Kaveri 2.0 Title Chain</span>
            </div>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: 'var(--bord)' }} />
              {parcel.title_chain.map((e, i) => {
                const ec = RISK_COLOR[e.status] ?? 'var(--muted)'
                return (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-4 px-4 py-3" style={{ borderBottom: i < parcel.title_chain.length - 1 ? '1px solid var(--bord)' : 'none' }}>
                    <div className="font-mono text-[10px] shrink-0 w-[72px]" style={{ color: 'var(--muted)' }}>{e.date.slice(0, 7)}</div>
                    <div className="w-3 h-3 rounded-full shrink-0 mt-0.5 z-10" style={{ background: ec, border: '2px solid var(--surf)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs" style={{ color: e.status === 'ok' ? 'var(--ink)' : ec }}>{e.event}</div>
                      <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--gold)' }}>{e.db}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Data sources */}
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3 block" style={{ color: 'var(--muted)' }}>Government Data Sources</span>
            {[
              { icon: Map, label: 'Kaveri 2.0', sub: 'Title chain · Registrations · Market price' },
              { icon: Database, label: 'Bhoomi', sub: 'RTC · Survey mutations · Land class' },
              { icon: Scale, label: 'eCourts', sub: 'Active suits · Attachments · Criminal' },
              { icon: Building2, label: 'BBMP / BDA', sub: 'Plan sanction · Zone · FAR limits' },
            ].map(src => (
              <div key={src.label} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--bord)' }}>
                <src.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} />
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{src.label}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{src.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-sm" style={{ background: 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 30%, var(--bord))' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--gold)' }}>The Vantis Moat</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              No other platform runs this check before land acquisition. Vantis pulls live government data that most developers only discover after litigation begins.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
