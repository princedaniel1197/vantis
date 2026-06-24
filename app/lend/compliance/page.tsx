'use client'

import { CheckCircle2, FileText, Download, CalendarClock } from 'lucide-react'
import { LEND_PROJECTS } from '@/lib/lend-portfolio'

// Simulate "last updated" dates — all within 15 days of a demo reference date
const BASE_DATE = new Date('2024-06-15')
function lastUpdated(daysAgo: number): string {
  const d = new Date(BASE_DATE)
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const PROJECT_UPDATES = LEND_PROJECTS.map((p, i) => ({
  ...p,
  last_updated: lastUpdated(i % 14 + 1),
  days_since: (i % 14) + 1,
  status: 'COMPLIANT' as const,
}))

const RBI_RULES = [
  {
    ref: 'Clause 4(i)',
    title: 'Electronic Project Database',
    requirement: 'Maintain an electronic database of all project finance accounts, updated within 15 days of any material change.',
    status: 'MET',
    detail: 'Vantis Lend auto-populates from K-RERA QPR, registration data, and escrow feeds. Last full refresh: 14 Jun 2024 (within 15-day window).',
  },
  {
    ref: 'Clause 4(ii)',
    title: 'Drawn vs Built Monitoring',
    requirement: 'Monitor physical progress against disbursement schedule; no tranche release if gap exceeds permissible limit.',
    status: 'MET',
    detail: 'Divergence chart auto-computed every quarter from K-RERA QPR data. Alerts trigger when gap > 5 percentage points.',
  },
  {
    ref: 'Clause 4(iii)',
    title: 'Escrow Account Surveillance',
    requirement: 'Verify escrow balances at minimum quarterly; alert if balance falls below RERA-mandated 70% of collected amount.',
    status: 'MET',
    detail: 'Escrow monitoring integrated via K-RERA Escrow API. Real-time alerts active for 40 projects. 3 alerts issued YTD.',
  },
  {
    ref: 'Clause 5(i)',
    title: 'NPA Early Warning System',
    requirement: 'Implement a leading-indicator early warning system for project finance exposure. SMA grading alone insufficient.',
    status: 'MET',
    detail: 'Vantis Lend composite score (QPR + Registration + Escrow + Litigation) provides 4–6 quarter advance warning vs SMA-0.',
  },
  {
    ref: 'Clause 5(ii)',
    title: 'Developer Cross-Exposure Monitoring',
    requirement: 'Aggregate exposure across all projects of a single developer group; flag concentration risk.',
    status: 'MET',
    detail: 'Developer cascade view auto-aggregates. Ozone Group: 3 projects · ₹520 Cr flagged as concentration event.',
  },
  {
    ref: 'Clause 7',
    title: 'Tranche Disbursement Controls',
    requirement: 'Tranche release contingent on verified construction milestone. Lender must document basis for each disbursement.',
    status: 'MET',
    detail: 'Tranche Control module maintains digital audit trail. T5 for Ozone Urbana placed on hold with documented rationale (6th floor unverified).',
  },
]

export default function CompliancePage() {
  const compliant  = PROJECT_UPDATES.filter(p => p.days_since <= 15).length
  const maxAge     = Math.max(...PROJECT_UPDATES.map(p => p.days_since))
  const avgAge     = Math.round(PROJECT_UPDATES.reduce((s, p) => s + p.days_since, 0) / PROJECT_UPDATES.length)

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-syne text-xl text-off-white">RBI Compliance Dashboard</h1>
            <p className="text-gray text-sm mt-0.5">
              RBI (Project Finance) Directions, 2025 — effective Oct 1, 2025.
              Auto-maintained from government data feeds.
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-sm bg-gold/10 border border-gold/30 text-gold text-xs font-mono hover:bg-gold/20 transition-colors shrink-0">
            <Download className="w-3.5 h-3.5" />
            Export Audit Package
          </button>
        </div>
      </div>

      {/* Moat callout */}
      <div className="mb-6 px-4 py-3 bg-gold/8 border border-gold/25 rounded-sm">
        <p className="text-xs text-gray-light leading-relaxed">
          <strong className="text-gold">What RBI now requires every project lender to maintain</strong> —
          generated automatically from K-RERA, Karnataka Registration, eCourts, and escrow data.
          Kaveri HFC is compliant without a single manual entry.
          Peers building this database by hand: 14–18 weeks per audit cycle.
        </p>
      </div>

      {/* Compliance summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <div className="bg-green/8 border border-green/20 rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-green/60 mb-1">Compliant Projects</div>
          <div className="font-syne text-2xl text-green">{compliant} / {PROJECT_UPDATES.length}</div>
          <div className="text-[10px] text-green/50 mt-0.5">all within 15-day window</div>
        </div>
        <div className="bg-surface border border-border rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Avg Update Age</div>
          <div className="font-syne text-2xl text-off-white">{avgAge} days</div>
          <div className="text-[10px] text-gray mt-0.5">target: ≤15 days</div>
        </div>
        <div className="bg-surface border border-border rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Max Staleness</div>
          <div className="font-syne text-2xl text-off-white">{maxAge} days</div>
          <div className="text-[10px] text-green mt-0.5">within limit</div>
        </div>
        <div className="bg-surface border border-border rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">RBI Rules Met</div>
          <div className="font-syne text-2xl text-green">{RBI_RULES.length} / {RBI_RULES.length}</div>
          <div className="text-[10px] text-green mt-0.5">full compliance</div>
        </div>
      </div>

      {/* RBI rules checklist */}
      <div className="bg-surface border border-border rounded-sm mb-6 overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-surface2 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-gold" />
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">
            RBI PFD 2025 — Clause-by-Clause Compliance
          </span>
        </div>
        <div className="divide-y divide-border">
          {RBI_RULES.map((rule, i) => (
            <div key={i} className="flex gap-4 px-5 py-4">
              <div className="shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-green" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[9px] font-mono text-gray bg-surface2 border border-border px-1.5 py-0.5 rounded-sm">
                    {rule.ref}
                  </span>
                  <span className="text-xs text-off-white font-medium">{rule.title}</span>
                  <span className="text-[9px] font-mono text-green bg-green/10 border border-green/25 px-1.5 py-0.5 rounded-sm">
                    {rule.status}
                  </span>
                </div>
                <p className="text-[10px] text-gray mb-1.5">{rule.requirement}</p>
                <p className="text-[10px] text-gray-light leading-relaxed">{rule.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project database table */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-surface2 flex items-center gap-2">
          <CalendarClock className="w-3.5 h-3.5 text-gold" />
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">
            Electronic Project Database — 40 Projects · All Updated Within 15 Days
          </span>
        </div>
        <div className="overflow-x-auto" style={{ maxHeight: '480px', overflowY: 'auto' }}>
          <table className="w-full">
            <thead className="sticky top-0 bg-surface2 border-b border-border">
              <tr>
                {['Project', 'Developer', 'City', 'Band', 'Last Updated', 'Days', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-[0.12em] text-gray">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROJECT_UPDATES.map((p, i) => {
                const bandColors: Record<string, string> = {
                  red: '#E74C3C', amber: '#F39C12', green: '#2ECC71'
                }
                const bandLabels: Record<string, string> = {
                  red: 'HIGH RISK', amber: 'WATCH', green: 'HEALTHY'
                }
                const bc = bandColors[p.risk_band]
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-surface2/50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-off-white whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-gray whitespace-nowrap">{p.developer}</td>
                    <td className="px-4 py-2.5 text-xs text-gray whitespace-nowrap">{p.city}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-[9px] font-mono" style={{ color: bc }}>{bandLabels[p.risk_band]}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] font-mono text-gray">{p.last_updated}</td>
                    <td className="px-4 py-2.5 text-[10px] font-mono" style={{ color: p.days_since <= 7 ? '#2ECC71' : '#C9A84C' }}>
                      {p.days_since}d
                    </td>
                    <td className="px-4 py-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
