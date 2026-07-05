'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, XCircle, Map, Scale, Building2, Database, FileText, User, Landmark, Gavel } from 'lucide-react'
import landData from '@/data/dev-land.json'

const PARCELS = [
  { key: 'meridian' as const, label: 'Meridian Skyline (Own — Clean)', type: 'own' },
  { key: 'divya' as const, label: 'Divya Villas · JDA (Baseline)', type: 'own' },
  { key: 'mrd010' as const, label: 'Meridian Edge Whitefield P2', type: 'own' },
  { key: 'ozone' as const, label: 'Ozone Urbana (Sample — External)', type: 'risk-demo' },
]

type ParcelKey = keyof typeof landData

const RISK_COLOR: Record<string, string> = { CRITICAL: 'var(--rc)', HIGH: 'var(--rc)', MEDIUM: 'var(--rb)', LOW: 'var(--ra)', ok: 'var(--ra)', flag: 'var(--rb)', critical: 'var(--rc)' }
const RISK_BG: Record<string, string> = { CRITICAL: 'color-mix(in srgb, var(--rc) 10%, var(--surf2))', HIGH: 'color-mix(in srgb, var(--rc) 6%, var(--surf2))', MEDIUM: 'color-mix(in srgb, var(--rb) 8%, var(--surf2))', LOW: 'color-mix(in srgb, var(--ra) 6%, var(--surf2))' }

const SCORE_GRADE: Record<string, string> = { A: 'var(--ra)', B: 'var(--rb)', C: 'var(--rc)' }

export default function LandPage() {
  const [selected, setSelected] = useState<ParcelKey>('meridian')
  const parcel = landData[selected]
  const report = parcel.title_report

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

      {/* Stage 1 — Title Search Report (Landeed parity) + developer-link fraud flag (Vantis column) */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <h2 className="font-display text-2xl italic" style={{ color: 'var(--ink)' }}>Title Search Report</h2>
        </div>

        {/* Verdict banner */}
        <div className="p-4 rounded-sm mb-4 flex items-center gap-4"
          style={{ background: report.verdict.clear ? 'color-mix(in srgb, var(--ra) 5%, var(--surf))' : 'color-mix(in srgb, var(--rc) 5%, var(--surf))', border: `2px solid ${report.verdict.clear ? 'var(--ra)' : 'var(--rc)'}` }}>
          {report.verdict.clear ? <CheckCircle2 className="w-8 h-8 shrink-0" style={{ color: 'var(--ra)' }} /> : <XCircle className="w-8 h-8 shrink-0" style={{ color: 'var(--rc)' }} />}
          <div className="flex-1">
            <div className="font-mono text-sm font-bold mb-0.5" style={{ color: report.verdict.clear ? 'var(--ra)' : 'var(--rc)' }}>{report.verdict.clear ? 'CLEAR TO TRANSACT' : 'NOT CLEAR TO TRANSACT'}</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{report.verdict.text}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>Reviewed by</div>
            <div className="font-mono text-[11px]" style={{ color: 'var(--ink)' }}>{report.verdict.lawyer}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Property + Owner + Value */}
          <div className="space-y-4">
            <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3 block" style={{ color: 'var(--muted)' }}>Property</span>
              <div className="space-y-1.5">
                {[
                  ['Survey No.', report.property.survey],
                  ['Extent', `${report.property.extent_acres} acres`],
                  ['Locality', report.property.locality],
                  ['District', report.property.district],
                  ['Address', report.property.address],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-xs">
                    <span className="shrink-0" style={{ color: 'var(--muted)' }}>{k}</span>
                    <span className="font-mono text-right" style={{ color: 'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <div className="flex items-center gap-2 mb-3">
                <User className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Current Owner</span>
              </div>
              <div className="space-y-1.5">
                {[
                  ['Name', report.owner.name],
                  ['Acquired via', report.owner.acquired_via],
                  ['Date', report.owner.date],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 text-xs">
                    <span style={{ color: 'var(--muted)' }}>{k}</span>
                    <span className="font-mono capitalize" style={{ color: 'var(--ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3 block" style={{ color: 'var(--muted)' }}>Valuation</span>
              <div className="flex items-end gap-8">
                <div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Guideline value</div>
                  <div className="font-display italic text-xl" style={{ color: 'var(--ink)' }}>{report.value.guideline}</div>
                </div>
                <div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Market value</div>
                  <div className="font-display italic text-xl" style={{ color: 'var(--gold)' }}>{report.value.market}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Encumbrances + Litigation */}
          <div className="space-y-4">
            <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bord)' }}>
                <Landmark className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Encumbrances</span>
              </div>
              {report.encumbrances.length === 0
                ? <div className="px-4 py-3 flex items-center gap-2 text-xs"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--ra)' }} /><span style={{ color: 'var(--muted)' }}>No registered encumbrances — clean.</span></div>
                : report.encumbrances.map((e, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: i < report.encumbrances.length - 1 ? '1px solid var(--bord)' : 'none' }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: e.status === 'open' ? 'var(--rc)' : 'var(--ra)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs" style={{ color: 'var(--ink)' }}>{e.party}</div>
                      <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{e.type} · {e.date}</div>
                    </div>
                    <span className="font-mono text-xs" style={{ color: 'var(--ink)' }}>{e.amount}</span>
                    <span className="font-mono text-[9px] uppercase" style={{ color: e.status === 'open' ? 'var(--rc)' : 'var(--ra)' }}>{e.status}</span>
                  </div>
                ))}
            </div>

            <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bord)' }}>
                <Gavel className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Litigation</span>
              </div>
              {report.litigation.length === 0
                ? <div className="px-4 py-3 flex items-center gap-2 text-xs"><CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--ra)' }} /><span style={{ color: 'var(--muted)' }}>No active litigation.</span></div>
                : report.litigation.map((l, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3" style={{ borderBottom: i < report.litigation.length - 1 ? '1px solid var(--bord)' : 'none' }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--rc)' }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs" style={{ color: 'var(--ink)' }}>{l.type}</div>
                      <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{l.court}</div>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>{l.case_no}</span>
                    <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--rc)' }}>{l.status}</span>
                  </div>
                ))}
            </div>

            {/* ⊕ Vantis column — developer-link fraud flag */}
            <div className="p-4 rounded-sm" style={{ background: report.developer_link.flag ? 'color-mix(in srgb, var(--rc) 5%, var(--surf))' : 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: `1px solid ${report.developer_link.flag ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'color-mix(in srgb, var(--gold) 30%, var(--bord))'}` }}>
              <div className="flex items-center gap-2 mb-2">
                {report.developer_link.flag ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--rc)' }} /> : <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />}
                <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: report.developer_link.flag ? 'var(--rc)' : 'var(--gold)' }}>Vantis · Developer-Link Check</span>
                <span className="ml-auto font-mono text-xs" style={{ color: report.developer_link.score >= 70 ? 'var(--ra)' : report.developer_link.score >= 45 ? 'var(--rb)' : 'var(--rc)' }}>score {report.developer_link.score}/100</span>
              </div>
              <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{report.developer_link.text}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <div className="text-[10px] font-mono flex-1 min-w-[180px]" style={{ color: 'var(--muted)' }}>
                  Landeed verifies the property. Vantis also flags the person — {report.developer_link.projects.join(' · ')}.
                </div>
                <Link href="/certificate" className="font-mono text-[10px] flex items-center gap-1 shrink-0 hover:underline" style={{ color: 'var(--gold)' }}>
                  View developer reputation <FileText className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
