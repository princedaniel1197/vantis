'use client'

import { useState } from 'react'
import { AlertTriangle, Activity, CheckCircle2, HardHat, Database, Scale, BarChart3 } from 'lucide-react'

type Severity = 'red' | 'amber' | 'green'
type AlertType = 'QPR' | 'Registration' | 'Escrow' | 'Litigation' | 'Divergence' | 'Confirmation'

interface Alert {
  id: number
  date: string
  project: string
  project_id: string
  type: AlertType
  severity: Severity
  text: string
  source: string
}

const ALERTS: Alert[] = [
  {
    id: 1, date: 'Q3 2021', project: 'Ozone Urbana', project_id: 'ozone-urbana',
    type: 'Divergence', severity: 'red', source: 'Vantis Composite',
    text: 'QPR data shows construction at 43%, but cumulative disbursement at 50%. Gap of 7 percentage points crosses Vantis Lend threshold of ±5pp. System initiates deep monitoring.',
  },
  {
    id: 2, date: 'Q4 2021', project: 'Ozone Urbana', project_id: 'ozone-urbana',
    type: 'Registration', severity: 'red', source: 'Kaveri Registration Portal',
    text: 'Sale deed registrations dropped 68% vs Q3 2021. Only 4 deeds recorded vs developer-claimed 47 unit bookings. Revenue velocity anomaly — escalated to credit committee.',
  },
  {
    id: 3, date: 'Q4 2021', project: 'Skylark Arcadia', project_id: 'skylark-arcadia',
    type: 'QPR', severity: 'amber', source: 'K-RERA QPR Database',
    text: 'Quarterly Progress Report filed 18 days late — second consecutive late filing. Construction milestone partially achieved (78% of target). Watch list escalated.',
  },
  {
    id: 4, date: 'Q1 2022', project: 'Ozone Urbana', project_id: 'ozone-urbana',
    type: 'Litigation', severity: 'red', source: 'eCourts Karnataka API',
    text: '2 civil suits filed by homebuyers (Cy/1122/2022) for possession delay. NCLT admission from Prestige-linked creditor. Legal risk score upgraded from WATCH to HIGH RISK.',
  },
  {
    id: 5, date: 'Q1 2022', project: 'Mantri Techzone', project_id: 'mantri-techzone',
    type: 'Escrow', severity: 'amber', source: 'K-RERA Escrow Monitor',
    text: 'Escrow balance dipped to 14% of collected amount — regulatory minimum is 70%. RERA notice received. Developer response pending. Kaveri HFC loan-to-value recalculated.',
  },
  {
    id: 6, date: 'Q2 2022', project: 'Ozone Urbana', project_id: 'ozone-urbana',
    type: 'Escrow', severity: 'red', source: 'K-RERA Escrow Monitor',
    text: 'Escrow balance ₹4.2 Cr on ₹52 Cr collected (8%). Minimum requirement: 70% (₹36.4 Cr). Gap of ₹32.2 Cr unexplained. Kaveri HFC credit officer alerted immediately. Tranche T5 placed on hold.',
  },
  {
    id: 7, date: 'Q2 2022', project: 'Ozone Westgate', project_id: 'ozone-urbana',
    type: 'Escrow', severity: 'amber', source: 'K-RERA Escrow Monitor',
    text: 'Ozone Westgate escrow shows ₹8.4 Cr anomalous withdrawal in same week Ozone Urbana missed QPR. Cross-developer correlation flagged — possible fund diversion from Westgate to Urbana.',
  },
  {
    id: 8, date: 'Q3 2022', project: 'Confident Crystal', project_id: 'confident-crystal',
    type: 'QPR', severity: 'amber', source: 'K-RERA QPR Database',
    text: 'QPR submission 11 days late. One missed filing in last 8 quarters. Construction 9% below declared milestone. Escalated to watch list. Site inspection recommended.',
  },
  {
    id: 9, date: 'Q4 2022', project: 'Prestige Lakeside', project_id: 'prestige-lakeside',
    type: 'Confirmation', severity: 'green', source: 'Kaveri Registration Portal',
    text: 'Registration velocity at 114% of target for the quarter. Escrow at 38%. Construction 2 weeks ahead of schedule. No litigation. Vantis score upgraded 12 points to 832.',
  },
  {
    id: 10, date: 'Q1 2023', project: 'Sobha Dream Acres', project_id: 'sobha-dream-acres',
    type: 'Confirmation', severity: 'green', source: 'Vantis Composite',
    text: 'All 6 monitoring signals positive. QPR on time, escrow 41%, registrations consistent, zero litigation. Vantis score at 810. No escalation triggers. Healthy book indicator.',
  },
  {
    id: 11, date: 'Q2 2023', project: 'Hubli Grand Central', project_id: 'hubli-grand-central',
    type: 'QPR', severity: 'amber', source: 'K-RERA QPR Database',
    text: 'QPR non-filing for Q2 2023 — first occurrence. Developer cited monsoon construction pause. K-RERA issued show-cause notice. Kaveri HFC placed project under enhanced monitoring.',
  },
  {
    id: 12, date: 'Q3 2023', project: 'Concord Meridian', project_id: 'concord-meridian',
    type: 'Divergence', severity: 'red', source: 'Vantis Composite',
    text: 'Drawn-vs-built gap reaches 18 percentage points. 2 QPR late filings. Registration velocity down 45%. Escrow at 12%. Three converging signals — escalated to HIGH RISK. Tranche held.',
  },
]

const TYPE_ICONS: Record<AlertType, typeof AlertTriangle> = {
  QPR:          HardHat,
  Registration: Database,
  Escrow:       AlertTriangle,
  Litigation:   Scale,
  Divergence:   BarChart3,
  Confirmation: CheckCircle2,
}

const SEV_COLOR: Record<Severity, { text: string; bg: string; border: string; dot: string }> = {
  red:   { text: '#E74C3C', bg: 'rgba(231,76,60,0.08)',   border: 'rgba(231,76,60,0.25)',  dot: '#E74C3C' },
  amber: { text: '#F39C12', bg: 'rgba(243,156,18,0.08)',  border: 'rgba(243,156,18,0.25)', dot: '#F39C12' },
  green: { text: '#2ECC71', bg: 'rgba(46,204,113,0.08)',  border: 'rgba(46,204,113,0.25)', dot: '#2ECC71' },
}

export default function AlertsPage() {
  const [filterSev,  setFilterSev]  = useState<Severity | 'all'>('all')
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all')

  const filtered = ALERTS.filter(a =>
    (filterSev === 'all'  || a.severity === filterSev) &&
    (filterType === 'all' || a.type === filterType)
  )

  return (
    <div className="p-5 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Alerts & Watchlist</h1>
        <p className="text-gray text-sm mt-0.5">
          Chronological feed of leading-indicator signals — ordered earliest to latest.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {([
          { sev: 'red',   label: 'Critical', count: ALERTS.filter(a => a.severity === 'red').length,   icon: AlertTriangle },
          { sev: 'amber', label: 'Watch',    count: ALERTS.filter(a => a.severity === 'amber').length, icon: Activity },
          { sev: 'green', label: 'Confirmed', count: ALERTS.filter(a => a.severity === 'green').length, icon: CheckCircle2 },
        ] as Array<{ sev: Severity; label: string; count: number; icon: typeof AlertTriangle }>).map(({ sev, label, count, icon: Icon }) => {
          const s = SEV_COLOR[sev]
          return (
            <button
              key={sev}
              onClick={() => setFilterSev(filterSev === sev ? 'all' : sev)}
              className="rounded-sm border px-4 py-3 text-left transition-colors hover:opacity-80"
              style={{
                background: filterSev === sev ? s.bg : 'rgba(15,15,26,1)',
                borderColor: filterSev === sev ? s.text : '#1E1E2E',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" style={{ color: s.text }} />
                <span className="text-[9px] font-mono uppercase tracking-[0.12em]" style={{ color: s.text }}>{label}</span>
              </div>
              <div className="font-syne text-xl" style={{ color: s.text }}>{count}</div>
            </button>
          )
        })}
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', 'QPR', 'Registration', 'Escrow', 'Litigation', 'Divergence', 'Confirmation'] as const).map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t as AlertType | 'all')}
            className="text-[10px] font-mono uppercase tracking-[0.1em] px-2.5 py-1 rounded-sm border transition-colors"
            style={{
              color:       filterType === t ? '#C9A84C' : '#6B6B88',
              borderColor: filterType === t ? '#C9A84C' : '#1E1E2E',
              background:  filterType === t ? 'rgba(201,168,76,0.08)' : 'transparent',
            }}
          >
            {t === 'all' ? 'All Types' : t}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-surface border border-border rounded-sm p-6 text-center text-gray text-sm">
            No alerts match the selected filters.
          </div>
        )}
        {filtered.map(a => {
          const s    = SEV_COLOR[a.severity]
          const Icon = TYPE_ICONS[a.type]
          return (
            <div
              key={a.id}
              className="flex gap-4 p-4 bg-surface border rounded-sm"
              style={{ borderColor: s.border }}
            >
              {/* Left: dot + icon */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-2 h-2 rounded-full mt-1" style={{ background: s.dot }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-mono text-[10px] text-gray">{a.date}</span>
                  <span
                    className="text-[9px] font-mono uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-sm"
                    style={{ color: s.text, background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    {a.type}
                  </span>
                  <span className="text-xs text-off-white font-medium">{a.project}</span>
                </div>

                <p className="text-gray-light text-xs leading-relaxed mb-2">{a.text}</p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-gray" />
                    <span className="text-[9px] font-mono text-gray uppercase tracking-[0.08em]">{a.source}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
