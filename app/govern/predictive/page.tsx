'use client'

import Link from 'next/link'
import { TrendingDown, ChevronRight, AlertTriangle } from 'lucide-react'

interface PredictiveRow {
  rank: number
  project_id: string
  project_name: string
  developer: string
  risk_score: number
  default_probability: number
  signals: string[]
  action: 'ENFORCE' | 'MONITOR' | 'NO_ACTION'
}

const ROWS: PredictiveRow[] = [
  {
    rank: 1,
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    developer: 'Ozone Group',
    risk_score: 9,
    default_probability: 97,
    signals: [
      'Complete QPR default — 8 consecutive quarters missed',
      '1,847 homebuyers affected · ₹927 Cr capital at risk',
      'FIR filed Q3 2023 · High Court writ pending',
    ],
    action: 'ENFORCE',
  },
  {
    rank: 2,
    project_id: 'skylark-arcadia',
    project_name: 'Skylark Arcadia',
    developer: 'Skylark Constructions',
    risk_score: 54,
    default_probability: 34,
    signals: [
      'Q1 2026 QPR missed · Q4 2025 filed 30 days late',
      'Escrow balance 14% — below recommended 20% floor',
      '1 civil case OS 3891/2024 — structural defect claim',
    ],
    action: 'MONITOR',
  },
  {
    rank: 3,
    project_id: 'prestige-lakeside',
    project_name: 'Prestige Lakeside Habitat',
    developer: 'Prestige Group',
    risk_score: 91,
    default_probability: 3,
    signals: [
      'All 8 QPRs filed on time — no defaults',
      'Escrow balance healthy at 23%',
      'No active litigation · Full certificate issued',
    ],
    action: 'NO_ACTION',
  },
  {
    rank: 4,
    project_id: 'divya-villas',
    project_name: 'Divya Villas',
    developer: 'Zion Estate Developers',
    risk_score: 78,
    default_probability: 2,
    signals: [
      'All QPRs filed on time · 96% construction complete',
      'No complaints or litigation on record',
      'Project on track for March 2026 handover',
    ],
    action: 'NO_ACTION',
  },
]

function actionConfig(a: string) {
  if (a === 'ENFORCE')  return { label: 'Enforce',   textColor: 'text-red',   dotBg: 'bg-red' }
  if (a === 'MONITOR')  return { label: 'Monitor',   textColor: 'text-amber', dotBg: 'bg-amber' }
  return                       { label: 'No Action', textColor: 'text-green', dotBg: 'bg-green' }
}

function probColor(p: number) {
  if (p >= 70) return 'text-red'
  if (p >= 30) return 'text-amber'
  return 'text-green'
}

function probBarColor(p: number) {
  if (p >= 70) return 'bg-red'
  if (p >= 30) return 'bg-amber'
  return 'bg-green'
}

function riskScoreColor(s: number) {
  if (s >= 70) return 'text-green'
  if (s >= 40) return 'text-amber'
  return 'text-red'
}

export default function PredictiveDefault() {
  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-syne text-2xl sm:text-3xl text-off-white">Predictive Default Analytics</h1>
        <TrendingDown className="w-6 h-6 text-gray hidden sm:block" />
      </div>
      <p className="text-gray text-xs mb-6">
        Projects ranked by probability of default in next 4 quarters · Powered by QPR patterns, escrow velocity, litigation accumulation, and sales velocity
      </p>

      {/* Ozone callout */}
      <div className="border border-gold/40 bg-gold/5 rounded-sm px-5 py-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div>
            <div className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">Vantis Early Detection · Case Study</div>
            <div className="text-off-white text-sm leading-relaxed">
              Ozone Urbana would have been flagged at{' '}
              <span className="font-mono text-amber font-bold">34% default probability</span> in{' '}
              <span className="text-gold font-semibold">Q1 2021</span> —{' '}
              <span className="font-bold text-red">8 quarters before</span> the FIR was filed in Q3 2023.
              1,847 homebuyers and ₹927 Cr could have been protected.
            </div>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-surface border border-border rounded-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface2">
              {['#', 'Project', 'Developer', 'Risk Score', 'Default Probability', 'Key Warning Signals', 'Recommended Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">{h}</th>
              ))}
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => {
              const ac = actionConfig(row.action)
              return (
                <tr
                  key={row.project_id}
                  className={`border-b border-border last:border-0 transition-colors duration-150 group cursor-pointer ${
                    row.action === 'ENFORCE' ? 'bg-red/5 hover:bg-red/10' : 'hover:bg-surface2'
                  }`}
                  onClick={() => window.location.href = `/govern/projects/${row.project_id}?tab=timeline`}
                >
                  <td className="px-4 py-4">
                    <span className={`font-syne text-xl font-bold ${row.rank === 1 ? 'text-red' : 'text-gray'}`}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150">{row.project_name}</div>
                  </td>
                  <td className="px-4 py-4 text-gray text-xs">{row.developer}</td>
                  <td className="px-4 py-4">
                    <span className={`font-mono text-lg font-bold ${riskScoreColor(row.risk_score)}`}>{row.risk_score}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-base font-bold ${probColor(row.default_probability)}`}>
                        {row.default_probability}%
                      </span>
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden min-w-[60px]">
                        <div
                          className={`h-full rounded-full ${probBarColor(row.default_probability)}`}
                          style={{ width: `${row.default_probability}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-1">
                      {row.signals.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray leading-relaxed">
                          <span className="shrink-0 mt-0.5 text-gray-light">·</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ac.textColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dotBg}`} />
                      {ac.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight className="w-4 h-4 text-gray group-hover:text-gold transition-colors duration-150" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="lg:hidden space-y-3">
        {ROWS.map(row => {
          const ac = actionConfig(row.action)
          return (
            <Link
              key={row.project_id}
              href={`/govern/projects/${row.project_id}?tab=timeline`}
              className={`block border rounded-sm p-4 transition-colors duration-150 group ${
                row.action === 'ENFORCE'
                  ? 'bg-red/5 border-red/30 hover:border-red/50'
                  : 'bg-surface border-border hover:border-gold/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`font-syne text-2xl font-bold ${row.rank === 1 ? 'text-red' : 'text-gray'}`}>
                    {row.rank}
                  </span>
                  <div>
                    <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150">
                      {row.project_name}
                    </div>
                    <div className="text-gray text-xs">{row.developer}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] shrink-0 font-semibold ${ac.textColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ac.dotBg}`} />
                  {ac.label}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div>
                  <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Risk Score</div>
                  <div className={`font-mono text-lg font-bold ${riskScoreColor(row.risk_score)}`}>{row.risk_score}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray uppercase tracking-wide">Default Probability</span>
                    <span className={`font-mono text-sm font-bold ${probColor(row.default_probability)}`}>{row.default_probability}%</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${probBarColor(row.default_probability)}`} style={{ width: `${row.default_probability}%` }} />
                  </div>
                </div>
              </div>

              <ul className="space-y-1 border-t border-border pt-3">
                {row.signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray leading-relaxed">
                    <span className="shrink-0 mt-0.5 text-gray-light">·</span>
                    {s}
                  </li>
                ))}
              </ul>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
