'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, FileText, Clock } from 'lucide-react'
import complianceData from '@/data/dev-compliance.json'

const QPR_COLOR: Record<string, string> = {
  submitted: 'var(--ra)',
  due_soon: 'var(--rb)',
  overdue: 'var(--rc)',
  pending: 'var(--rb)',
}
const QPR_LABEL: Record<string, string> = {
  submitted: 'Filed ✓',
  due_soon: 'Due Soon',
  overdue: 'Overdue ⚠',
  pending: 'Pending',
}
const QPR_ICON: Record<string, typeof CheckCircle2> = {
  submitted: CheckCircle2,
  due_soon: Clock,
  overdue: AlertTriangle,
  pending: AlertTriangle,
}

export default function CompliancePage() {
  const [selected, setSelected] = useState<string | null>(null)
  const projects = complianceData.projects

  const filedCount = projects.filter(p => p.qpr_status === 'submitted').length
  const overdueCount = projects.filter(p => p.qpr_status === 'overdue').length
  const totalPenalty = projects.reduce((s, p) => s + (p.penalty_lakh ?? 0), 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Compliance · RERA</div>
          <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Compliance Autopilot</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Auto-drafted QPRs, live K-RERA status sync, penalty alerts — all projects, one view.
          </p>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm" style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf))', border: '1px solid color-mix(in srgb, var(--rc) 30%, var(--bord))', color: 'var(--rc)' }}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{overdueCount} overdue</span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'QPR Filed', value: filedCount, sub: 'this quarter', color: 'var(--ra)' },
          { label: 'QPR Overdue', value: overdueCount, sub: 'penalty accruing', color: 'var(--rc)' },
          { label: 'Total Penalty Exposure', value: `₹${totalPenalty.toFixed(0)}L`, sub: 'across portfolio', color: 'var(--rb)' },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-display italic text-2xl sm:text-3xl mb-0.5" style={{ color: k.color }}>{k.value}</div>
            <div className="font-mono text-[10px] uppercase" style={{ color: 'var(--muted)' }}>{k.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Project compliance grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p, i) => {
          const qc = QPR_COLOR[p.qpr_status] ?? 'var(--muted)'
          const Icon = QPR_ICON[p.qpr_status] ?? Clock
          const isSelected = selected === p.id
          const gradeColor = p.risk_grade === 'A' ? 'var(--ra)' : p.risk_grade === 'B' ? 'var(--rb)' : 'var(--rc)'
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(isSelected ? null : p.id)}
              className="rounded-sm cursor-pointer overflow-hidden transition-all"
              style={{ background: 'var(--surf)', border: `1px solid ${isSelected ? qc : p.qpr_status === 'overdue' ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'var(--bord)'}` }}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="text-sm font-medium leading-snug" style={{ color: 'var(--ink)' }}>{p.name}</div>
                    <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{p.rera_id.slice(-10)}</div>
                  </div>
                  <div className="font-display italic text-2xl leading-none shrink-0" style={{ color: gradeColor }}>{p.risk_grade}</div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: qc }} />
                  <span className="font-mono text-xs" style={{ color: qc }}>{QPR_LABEL[p.qpr_status]}</span>
                  {p.penalty_lakh > 0 && (
                    <span className="ml-auto font-mono text-[10px]" style={{ color: 'var(--rc)' }}>₹{p.penalty_lakh}L penalty</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: 'var(--muted)' }}>Construction</span>
                    <span className="font-mono" style={{ color: 'var(--ink)' }}>{p.completion_pct}% actual / {p.construction_completion}% RERA</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--surf2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${p.completion_pct}%`, background: 'var(--gold)' }} />
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--bord)' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>QPR Due</span>
                      <span className="font-mono" style={{ color: 'var(--ink)' }}>{p.qpr_due}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Last QPR</span>
                      <span className="font-mono" style={{ color: 'var(--ink)' }}>{p.last_qpr}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Escrow</span>
                      <span className="font-mono" style={{ color: 'var(--ink)' }}>₹{p.escrow_balance_cr} Cr</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Sold / Collected</span>
                      <span className="font-mono" style={{ color: 'var(--ink)' }}>{p.sold_pct}% / {p.collection_pct}%</span>
                    </div>
                    {p.flags.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {p.flags.map((f: string, fi: number) => (
                          <div key={fi} className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'var(--rc)' }}>
                            <XCircle className="w-3 h-3" /> {f}
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="w-full mt-1 py-1.5 text-xs font-mono flex items-center justify-center gap-1 rounded-sm" style={{ border: '1px solid var(--bord)', color: 'var(--gold)' }}>
                      <FileText className="w-3 h-3" /> Auto-Draft QPR
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
