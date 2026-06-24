'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, Clock, TrendingDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type Severity = 'critical' | 'warning' | 'info'

interface Briefing {
  id: string
  severity: Severity
  title: string
  date: string
  summary: string
  what_changed: string
  why_it_matters: string
  action_href: string
  action_label: string
}

const BRIEFINGS: Briefing[] = [
  {
    id: 'b1',
    severity: 'critical',
    title: 'Ozone Urbana T5 tranche (₹40 Cr) is in queue — covenant breach detected',
    date: 'Today, 09:14',
    summary: 'RERA escrow at 54% (mandate 70%). Q3 2023 QPR unfiiled. T5 disbursement should be blocked pending resolution of 2 covenant breaches.',
    what_changed: 'K-RERA escrow monitoring API surfaced a 47-day QPR overdue flag overnight. Combined with existing escrow deficit, the composite covenant score crossed the breach threshold at 04:32 IST.',
    why_it_matters: 'Releasing ₹40 Cr to a developer with active covenant breaches creates regulatory exposure for Kaveri HFC under RBI PFD 2025 para 4.3 and K-RERA S.17.',
    action_href: '/lend/tranche/ozone-urbana',
    action_label: 'Review Tranche Decision →',
  },
  {
    id: 'b2',
    severity: 'warning',
    title: 'Concord Meridian QPR overdue — second consecutive quarter',
    date: 'Yesterday, 16:41',
    summary: 'Q2 2024 QPR not yet filed. Prior quarter also filed 18 days late. Pattern suggests administrative capacity issues at developer.',
    what_changed: 'Automated QPR tracker flagged the 21-day overdue status. First-time offenders are scored amber; second consecutive quarter elevates to watch-list status.',
    why_it_matters: 'QPR delay is a leading indicator in 78% of projects that later went into construction lag. Recommend site visit before next disbursement.',
    action_href: '/lend/covenants',
    action_label: 'View Covenant Monitor →',
  },
  {
    id: 'b3',
    severity: 'info',
    title: 'Divya Villas CV scan complete — all milestones verified, T4 clear for release',
    date: 'Yesterday, 11:02',
    summary: 'Computer vision scan confirms 76% construction progress vs 78% claimed — within 5-point tolerance. T4 tranche (₹12 Cr) can proceed to auto-release.',
    what_changed: 'Quarterly CV scan completed at 10:47 IST. 94 image comparison pairs processed. No duplicate photos detected. Structural progress matches claimed milestone.',
    why_it_matters: 'Clean scan enables auto-release without manual review, reducing officer workload. Score stability (+2 pts this quarter) continues positive trend.',
    action_href: '/lend/verify-progress',
    action_label: 'View CV Report →',
  },
]

const PAST_BRIEFINGS = [
  { date: 'Jun 20', title: 'Ozone Group NCLT petition admitted — IBA/441/2022 update',          severity: 'critical' as Severity },
  { date: 'Jun 18', title: 'Skylark Arcadia NOC expired — renewal pending BDA approval',          severity: 'warning'  as Severity },
  { date: 'Jun 15', title: 'Prestige Lakeside T3 auto-released (₹15 Cr) — scan passed',          severity: 'info'     as Severity },
  { date: 'Jun 12', title: 'Mantri Techzone escrow at 66% — below 70% mandate, watch flag',      severity: 'warning'  as Severity },
  { date: 'Jun 10', title: 'Regent Heights registration velocity down 38% — demand softening',   severity: 'warning'  as Severity },
  { date: 'Jun 08', title: 'Brigade Horizon T5 released — all covenants met',                     severity: 'info'     as Severity },
  { date: 'Jun 05', title: 'Sobha Crystal received OC — project completed ahead of schedule',    severity: 'info'     as Severity },
  { date: 'Jun 02', title: 'Ozone Urbana eCourts update — consumer forum case VB/CC/2023/1847 admitted', severity: 'critical' as Severity },
]

const severityBorder = { critical: 'border-l-red', warning: 'border-l-amber', info: 'border-l-gold' }
const severityColor  = { critical: '#E74C3C',        warning: '#F39C12',        info: '#C9A84C' }
const severityLabel  = { critical: 'CRITICAL',        warning: 'WATCH',          info: 'UPDATE' }
const SeverityIcon   = { critical: AlertTriangle,     warning: Clock,            info: TrendingDown }

export default function CopilotPage() {
  const [expanded, setExpanded] = useState<string | null>('b1')

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">RM Copilot — Daily Credit Briefing</h1>
        <p className="text-gray text-sm mt-0.5">Synthesised from K-RERA, eCourts, Kaveri 2.0, and escrow data. Updated every 6 hours.</p>
      </div>

      {/* Active briefings */}
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Today — {BRIEFINGS.length} items requiring attention</div>
        <div className="divide-y divide-border border border-border rounded-sm overflow-hidden">
          {BRIEFINGS.map(b => {
            const Icon = SeverityIcon[b.severity]
            const color = severityColor[b.severity]
            const isOpen = expanded === b.id
            return (
              <div key={b.id} className={`border-l-4 ${severityBorder[b.severity]} bg-surface`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : b.id)}
                  className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-surface2 transition-colors"
                >
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-[0.1em]" style={{ color, background: color + '20' }}>{severityLabel[b.severity]}</span>
                      <span className="text-[10px] font-mono text-gray">{b.date}</span>
                    </div>
                    <div className="text-sm text-off-white leading-snug">{b.title}</div>
                    <p className="text-xs text-gray mt-1 leading-relaxed">{b.summary}</p>
                  </div>
                  <div className="shrink-0 text-gray mt-0.5">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 ml-7">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-surface2 border border-border rounded-sm">
                        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-gray mb-1.5">What changed</div>
                        <p className="text-xs text-gray-light leading-relaxed">{b.what_changed}</p>
                      </div>
                      <div className="p-3 bg-surface2 border border-border rounded-sm">
                        <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-gray mb-1.5">Why it matters</div>
                        <p className="text-xs text-gray-light leading-relaxed">{b.why_it_matters}</p>
                      </div>
                    </div>
                    <Link
                      href={b.action_href}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-gold hover:text-gold-light uppercase tracking-[0.08em] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {b.action_label}
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Past briefings */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Past 30 Days</div>
        <div className="bg-surface border border-border rounded-sm overflow-hidden divide-y divide-border/50">
          {PAST_BRIEFINGS.map((b, i) => {
            const color = severityColor[b.severity]
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface2 transition-colors">
                <span className="text-[9px] font-mono text-gray w-12 shrink-0">{b.date}</span>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-xs text-gray-light flex-1">{b.title}</span>
                <span className="text-[9px] font-mono shrink-0 uppercase tracking-[0.08em]" style={{ color }}>{severityLabel[b.severity]}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
