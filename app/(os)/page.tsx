'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AlertTriangle, Clock, TrendingUp, ChevronRight,
  CheckCircle2, ArrowRight, Building2, Users, Banknote, Shield
} from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts'
import projectsData from '@/data/dev-projects.json'
import cmdData from '@/data/os-command.json'

type Project = typeof projectsData[0]
const OWN = (projectsData as Project[]).filter(p => p.is_own)

const GRADE_COLOR = { A: 'var(--ra)', B: 'var(--rb)', C: 'var(--rc)' }
const GRADE_BG   = { A: 'color-mix(in srgb, var(--ra) 10%, var(--surf))', B: 'color-mix(in srgb, var(--rb) 10%, var(--surf))', C: 'color-mix(in srgb, var(--rc) 10%, var(--surf))' }

const PIPELINE_STAGES = [
  { key: 'new_inquiry', label: 'New Inquiry', color: 'var(--muted)' },
  { key: 'site_visit_scheduled', label: 'Visit Sched.', color: 'var(--gold-dim)' },
  { key: 'visited', label: 'Visited', color: 'var(--gold)' },
  { key: 'interested', label: 'Interested', color: 'var(--rb)' },
  { key: 'negotiation', label: 'Negotiation', color: 'var(--rb)' },
  { key: 'booked', label: 'Booked', color: 'var(--ra)' },
]

function pct(a: number, b: number) { return b > 0 ? Math.round(a / b * 100) : 0 }

export default function CommandCentre() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { today, kpis, pipeline, cash, recent_activity, developer } = cmdData

  const totalUnits = OWN.reduce((s, p) => s + p.units_total, 0)
  const soldUnits = OWN.reduce((s, p) => s + p.units_sold, 0)
  const gradeCount = { A: OWN.filter(p => p.risk_grade === 'A').length, B: OWN.filter(p => p.risk_grade === 'B').length, C: OWN.filter(p => p.risk_grade === 'C').length }

  const pipelineData = PIPELINE_STAGES.map(s => ({ name: s.label, value: pipeline[s.key as keyof typeof pipeline] as number, color: s.color }))
  const cashPct = pct(cash.collections_mtd_cr, cash.collections_target_cr)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>
            {greeting}
          </div>
          <h1 className="font-display text-3xl italic mb-0.5" style={{ color: 'var(--ink)' }}>
            {developer.short}
          </h1>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <Link
          href="/vision"
          className="hidden sm:flex items-center gap-1.5 text-xs font-mono px-3 py-2 rounded-sm"
          style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}
        >
          Full platform view →
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Building2, label: 'Portfolio Value', value: `₹${kpis.portfolio_value_cr.toLocaleString()} Cr`, sub: `${OWN.length} active projects · ${totalUnits.toLocaleString()} units`, color: 'var(--ink)', href: '/projects' },
          { icon: Users, label: 'Active Pipeline', value: `${kpis.pipeline_leads} leads`, sub: `₹${kpis.pipeline_value_cr} Cr potential`, color: 'var(--gold)', href: '/leads' },
          { icon: Banknote, label: 'Collections MTD', value: `₹${kpis.collections_mtd_cr} Cr`, sub: `${cashPct}% of ₹${kpis.collections_target_cr} Cr target`, color: cashPct >= 80 ? 'var(--ra)' : cashPct >= 60 ? 'var(--rb)' : 'var(--rc)', href: '/payments' },
          { icon: Shield, label: 'Compliance Health', value: `${kpis.compliance_clean}/${OWN.length} clean`, sub: `${kpis.compliance_risk} project${kpis.compliance_risk !== 1 ? 's' : ''} at risk`, color: kpis.compliance_risk > 0 ? 'var(--rc)' : 'var(--ra)', href: '/compliance' },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={k.href}
              className="block p-4 rounded-sm transition-colors h-full"
              style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bord)'}
            >
              <k.icon className="w-4 h-4 mb-2" style={{ color: 'var(--muted)' }} />
              <div className="font-display italic text-2xl sm:text-3xl mb-0.5" style={{ color: k.color }}>{k.value}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>{k.label}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{k.sub}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Portfolio project grid — 2/3 */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
              Portfolio · {OWN.length} Active Projects
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              {Object.entries(gradeCount).map(([g, n]) => (
                <span key={g} className="flex items-center gap-1" style={{ color: GRADE_COLOR[g as keyof typeof GRADE_COLOR] }}>
                  <span className="font-display italic">{g}</span> {n}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OWN.map((p, i) => {
              const soldPct = pct(p.units_sold, p.units_total)
              const gc = GRADE_COLOR[p.risk_grade as keyof typeof GRADE_COLOR] ?? 'var(--muted)'
              const gb = GRADE_BG[p.risk_grade as keyof typeof GRADE_BG] ?? 'var(--surf)'
              const isSelected = selectedProject === p.id
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  onClick={() => setSelectedProject(isSelected ? null : p.id)}
                  className="p-3.5 rounded-sm cursor-pointer transition-colors"
                  style={{
                    background: isSelected ? gb : 'var(--surf)',
                    border: `1px solid ${isSelected ? gc : 'var(--bord)'}`,
                  }}
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{p.name}</div>
                      <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{p.micro_market} · {p.type}</div>
                    </div>
                    <div className="shrink-0 text-center">
                      <div className="font-display italic text-2xl font-bold leading-none" style={{ color: gc }}>{p.risk_grade}</div>
                      <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>score</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-[10px] w-12 shrink-0" style={{ color: 'var(--muted)' }}>Sold</div>
                      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bord)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${soldPct}%`, background: gc }} />
                      </div>
                      <div className="font-mono text-[10px] w-6 text-right" style={{ color: 'var(--ink)' }}>{soldPct}%</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-[10px] w-12 shrink-0" style={{ color: 'var(--muted)' }}>QPR</div>
                      <div className="text-[10px]" style={{ color: (p.qpr_status === 'OVERDUE' || p.qpr_status === 'overdue') ? 'var(--rc)' : (p.qpr_status === 'DUE_SOON' || p.qpr_status === 'due_soon') ? 'var(--rb)' : 'var(--muted)' }}>
                        {(p.qpr_status === 'submitted' || p.qpr_status === 'ON_TIME') ? 'Filed ✓' : (p.qpr_status === 'due_soon' || p.qpr_status === 'DUE_SOON') ? 'Due soon' : 'Overdue ⚠'}
                      </div>
                      {p.qpr_penalty_lakh > 0 && (
                        <div className="font-mono text-[10px] ml-auto" style={{ color: 'var(--rc)' }}>₹{p.qpr_penalty_lakh}L</div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--bord)' }}>
                      <Link href={`/projects`} className="text-[10px] font-mono px-2 py-1 rounded-sm" style={{ color: 'var(--gold)', border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)' }}>
                        Open project →
                      </Link>
                      <Link href={`/land?demo=${p.id}`} className="text-[10px] font-mono px-2 py-1 rounded-sm" style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}>
                        Risk score
                      </Link>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right panel — today */}
        <div className="space-y-4">
          {/* Today's visits */}
          <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bord)' }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
                Today's Visits ({today.visits.length})
              </div>
              <Link href="/visits" className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>All →</Link>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--bord)' }}>
              {today.visits.map(v => (
                <div key={v.id} className="px-4 py-2.5 flex items-start gap-3">
                  <div className="font-mono text-[10px] shrink-0 mt-0.5 w-10" style={{ color: 'var(--gold)' }}>{v.time}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{v.lead}</div>
                    <div className="font-mono text-[10px] truncate" style={{ color: 'var(--muted)' }}>{v.project} · {v.unit_interest}</div>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[10px] font-mono" style={{ color: v.status === 'confirmed' ? 'var(--ra)' : 'var(--rb)' }}>
                      {v.status === 'confirmed' ? '●' : '○'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue payments */}
          <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bord)' }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
                Overdue ({today.overdue_payments.length})
              </div>
              <Link href="/payments" className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>All →</Link>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--bord)' }}>
              {today.overdue_payments.map(op => (
                <div key={op.id} className="px-4 py-2.5 flex items-start gap-3">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: op.overdue_days > 10 ? 'var(--rc)' : 'var(--rb)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{ color: 'var(--ink)' }}>{op.customer}</div>
                    <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{op.project} · {op.unit}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs" style={{ color: op.overdue_days > 10 ? 'var(--rc)' : 'var(--rb)' }}>₹{op.amount_lakh}L</div>
                    <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{op.overdue_days}d overdue</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance alerts */}
          <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid color-mix(in srgb, var(--rc) 35%, var(--bord))' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--bord)' }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--rc)' }}>
                Compliance Alerts
              </div>
              <Link href="/compliance" className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>All →</Link>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--bord)' }}>
              {today.compliance_alerts.map(a => (
                <div key={a.id} className="px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: a.severity === 'critical' ? 'var(--rc)' : 'var(--rb)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{a.project}</span>
                  </div>
                  <div className="text-[10px] pl-3.5" style={{ color: 'var(--muted)' }}>{a.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Pipeline + Cash + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pipeline funnel */}
        <div className="rounded-sm p-4" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>Sales Pipeline</div>
            <Link href="/leads" className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>Open →</Link>
          </div>
          <div className="space-y-2">
            {pipelineData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="text-[10px] w-24 shrink-0 font-mono" style={{ color: 'var(--muted)' }}>{s.name}</div>
                <div className="flex-1 h-4 rounded-sm flex items-center" style={{ background: 'var(--surf2)' }}>
                  <div
                    className="h-full rounded-sm flex items-center justify-end pr-1.5"
                    style={{
                      width: `${pct(s.value, pipeline.new_inquiry)}%`,
                      minWidth: '20px',
                      background: s.color,
                      opacity: 0.85,
                    }}
                  >
                    <span className="font-mono text-[9px]" style={{ color: 'var(--bg)' }}>{s.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 font-mono text-[10px]" style={{ borderTop: '1px solid var(--bord)', color: 'var(--muted)' }}>
            {pipeline.registered} registered to date · {pipeline.booked} booked this quarter
          </div>
        </div>

        {/* Cash collections */}
        <div className="rounded-sm p-4" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>Collections (6 months)</div>
            <Link href="/payments" className="font-mono text-[10px]" style={{ color: 'var(--gold)' }}>Open →</Link>
          </div>
          <div className="mb-3">
            <div className="font-display italic text-3xl" style={{ color: cashPct >= 80 ? 'var(--ra)' : cashPct >= 60 ? 'var(--rb)' : 'var(--rc)' }}>
              ₹{cash.collections_mtd_cr} Cr
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{cashPct}% of ₹{cash.collections_target_cr} Cr target this month</div>
          </div>
          <div className="h-[72px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cash.monthly_trend} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 2, color: 'var(--ink)', fontSize: 10 }}
                  formatter={(v) => [`₹${v} Cr`, '']}
                />
                <Bar dataKey="collected" radius={[2, 2, 0, 0]}>
                  {cash.monthly_trend.map((entry, i) => (
                    <Cell key={i} fill={entry.collected >= entry.target ? 'var(--ra)' : i === cash.monthly_trend.length - 1 ? 'var(--rb)' : 'var(--muted)'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-mono" style={{ color: 'var(--muted)' }}>
            <span>Outstanding: <span style={{ color: 'var(--rb)' }}>₹{cash.outstanding_overdue_cr} Cr overdue</span></span>
            <span>Escrow: ₹{cash.escrow_total_cr} Cr</span>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bord)' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>Recent Activity</div>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--bord)' }}>
            {recent_activity.map((a, i) => {
              const dot = a.type === 'booking' ? 'var(--ra)' : a.type === 'flag' ? 'var(--rc)' : a.type === 'finance' ? 'var(--gold)' : 'var(--muted)'
              return (
                <div key={i} className="px-4 py-2.5 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs leading-snug" style={{ color: 'var(--ink)' }}>{a.event}</div>
                    <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{a.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
