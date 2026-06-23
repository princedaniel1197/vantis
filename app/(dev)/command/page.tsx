'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight, Clock, TrendingDown, Shield, BarChart2, ExternalLink, Filter } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import allProjects from '@/data/dev-projects.json'

interface Project {
  id: string
  name: string
  developer_name: string
  micro_market: string
  type: string
  rera_id: string
  possession_due: string
  units_total: number
  units_sold: number
  risk_grade: 'A' | 'B' | 'C'
  risk_score: number
  status: string
  qpr_status: 'ON_TIME' | 'LATE' | 'MISSED'
  last_qpr: string
  qpr_penalty_lakh: number
  flags: string[]
  litigation_count: number
  is_own: boolean
}

const projects = (allProjects as Project[]).filter(p => p.is_own)

function gradeColor(g: string) {
  if (g === 'A') return 'var(--ra)'
  if (g === 'B') return 'var(--rb)'
  return 'var(--rc)'
}
function gradeBg(g: string) {
  if (g === 'A') return 'var(--ra-dim)'
  if (g === 'B') return 'var(--rb-dim)'
  return 'var(--rc-dim)'
}

function qprBadge(s: string) {
  if (s === 'ON_TIME') return { color: 'var(--ra)', label: 'QPR ON TIME' }
  if (s === 'LATE') return { color: 'var(--rb)', label: 'QPR LATE' }
  return { color: 'var(--rc)', label: 'QPR MISSED' }
}

function flagLabel(f: string) {
  const m: Record<string, string> = {
    'TITLE_DISPUTE': 'Title dispute on record',
    'QPR_MISSED': 'QPR not filed',
    'POSSESSION_DELAY': 'Possession delayed',
    'ENCROACHMENT': 'Encroachment flag — Bhoomi',
    'LITIGATION_PENDING': 'Litigation pending',
    'ED_ATTACHMENT': 'ED attachment active',
    'NGT_VIOLATION': 'NGT violation order',
    'IBC_PROCEEDING': 'IBC proceeding filed',
    'ESCROW_LOW': 'Escrow below threshold',
    'BBMP_IRREGULARITY': 'BBMP plan sanction issue',
  }
  return m[f] ?? f
}

const riskDistribution = [
  { grade: 'A', count: projects.filter(p => p.risk_grade === 'A').length, fill: 'var(--ra)' },
  { grade: 'B', count: projects.filter(p => p.risk_grade === 'B').length, fill: 'var(--rb)' },
  { grade: 'C', count: projects.filter(p => p.risk_grade === 'C').length, fill: 'var(--rc)' },
]

const totalPenalty = projects.reduce((s, p) => s + (p.qpr_penalty_lakh ?? 0), 0)

const upcomingDeadlines = projects
  .filter(p => {
    const d = new Date(p.possession_due)
    const now = new Date()
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff > 0 && diff < 180
  })
  .sort((a, b) => new Date(a.possession_due).getTime() - new Date(b.possession_due).getTime())

export default function CommandPage() {
  const [sortBy, setSortBy] = useState<'risk' | 'name' | 'qpr'>('risk')
  const [filterGrade, setFilterGrade] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL')

  const sorted = [...projects]
    .filter(p => filterGrade === 'ALL' || p.risk_grade === filterGrade)
    .sort((a, b) => {
      if (sortBy === 'risk') return a.risk_score - b.risk_score
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      const order = { MISSED: 0, LATE: 1, ON_TIME: 2 }
      return order[a.qpr_status] - order[b.qpr_status]
    })

  const gradeC = projects.filter(p => p.risk_grade === 'C').length

  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>
          Meridian Realty · Portfolio Dashboard
        </div>
        <h1 className="font-display text-4xl italic" style={{ color: 'var(--ink)' }}>
          Good morning.
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Here is how your portfolio looks before K-RERA opens today.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Projects', value: projects.length.toString(), icon: BarChart2, sub: 'Active under RERA', color: 'var(--ink)' },
          { label: 'Grade C', value: gradeC.toString(), icon: AlertTriangle, sub: 'Require immediate action', color: 'var(--rc)' },
          { label: 'QPR Penalty Exposure', value: `₹${totalPenalty.toFixed(1)}L`, icon: TrendingDown, sub: 'Accumulated to date', color: gradeC > 0 ? 'var(--rc)' : 'var(--ra)' },
          { label: 'Deadlines 180 days', value: upcomingDeadlines.length.toString(), icon: Clock, sub: 'Possession dues', color: upcomingDeadlines.length > 2 ? 'var(--rb)' : 'var(--ra)' },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="p-4 rounded-sm"
            style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}
          >
            <k.icon className="w-4 h-4 mb-2" style={{ color: 'var(--muted)' }} />
            <div className="font-display text-3xl italic mb-0.5" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>
              {k.label}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project list — 2/3 width */}
        <div className="lg:col-span-2">
          {/* Controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>
              <Filter className="inline w-3 h-3 mr-1.5" />
              Your Projects
            </div>
            <div className="flex items-center gap-2">
              {(['ALL', 'A', 'B', 'C'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setFilterGrade(g)}
                  className="text-[10px] font-mono px-2 py-1 rounded-sm transition-colors duration-100"
                  style={{
                    color: filterGrade === g ? 'var(--bg)' : gradeColor(g === 'ALL' ? 'B' : g),
                    background: filterGrade === g ? gradeColor(g === 'ALL' ? 'B' : g) : 'transparent',
                    border: `1px solid ${gradeColor(g === 'ALL' ? 'B' : g)}`,
                  }}
                >
                  {g}
                </button>
              ))}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="text-[10px] font-mono px-2 py-1 rounded-sm outline-none"
                style={{ background: 'var(--surf)', color: 'var(--muted)', border: '1px solid var(--bord)' }}
              >
                <option value="risk">Sort: Risk ↑</option>
                <option value="qpr">Sort: QPR Status</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>

          {/* Project rows */}
          <div className="rounded-sm overflow-hidden" style={{ border: '1px solid var(--bord)' }}>
            {sorted.map((p, i) => {
              const qpr = qprBadge(p.qpr_status)
              const activeFlags = p.flags.filter(f => f !== 'QPR_MISSED')

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group"
                  style={{ borderBottom: i < sorted.length - 1 ? '1px solid var(--bord)' : 'none' }}
                >
                  <Link
                    href={`/land?project=${p.id}`}
                    className="flex items-start gap-4 px-4 py-4 transition-colors duration-100"
                    style={{}}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surf2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Grade badge */}
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-sm shrink-0 font-display text-2xl italic font-bold"
                      style={{
                        background: gradeBg(p.risk_grade),
                        color: gradeColor(p.risk_grade),
                        border: `1px solid ${gradeColor(p.risk_grade)}`,
                      }}
                    >
                      {p.risk_grade}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="font-sans text-sm font-medium" style={{ color: 'var(--ink)' }}>
                          {p.name}
                        </span>
                        <span
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm"
                          style={{ color: qpr.color, background: `color-mix(in srgb, ${qpr.color} 12%, transparent)`, border: `1px solid ${qpr.color}` }}
                        >
                          {qpr.label}
                        </span>
                        {p.qpr_penalty_lakh > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: 'var(--rc)', background: 'var(--rc-dim)' }}>
                            ₹{p.qpr_penalty_lakh.toFixed(1)}L penalty
                          </span>
                        )}
                      </div>
                      <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--muted)' }}>
                        {p.micro_market} · {p.type} · {p.units_sold}/{p.units_total} units
                        {p.litigation_count > 0 && ` · ${p.litigation_count} court cases`}
                      </div>

                      {/* Flags */}
                      {activeFlags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {activeFlags.map(f => (
                            <span
                              key={f}
                              className="text-[10px] font-mono flex items-center gap-1"
                              style={{ color: 'var(--rc)' }}
                            >
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {flagLabel(f)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Score + arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold" style={{ color: gradeColor(p.risk_grade) }}>
                          {p.risk_score}
                        </div>
                        <div className="text-[9px] font-mono uppercase" style={{ color: 'var(--muted)' }}>Score</div>
                      </div>
                      <ChevronRight className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right panel — 1/3 */}
        <div className="space-y-5">
          {/* Risk distribution chart */}
          <div className="rounded-sm p-4" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>
              Portfolio Risk Distribution
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={riskDistribution} barCategoryGap="30%">
                <XAxis
                  dataKey="grade"
                  tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-dm-mono)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} label={{ position: 'top', fill: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-dm-mono)' }}>
                  {riskDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {riskDistribution.map(d => (
                <div key={d.grade} className="text-center">
                  <div className="font-mono text-lg font-bold" style={{ color: d.fill }}>{d.count}</div>
                  <div className="font-mono text-[9px] uppercase" style={{ color: 'var(--muted)' }}>Grade {d.grade}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming deadlines */}
          <div className="rounded-sm p-4" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>
              <Clock className="inline w-3 h-3 mr-1.5" />
              Possession Deadlines
            </div>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-xs py-4 text-center" style={{ color: 'var(--muted)' }}>
                No possession dues in next 180 days
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.slice(0, 5).map(p => {
                  const daysLeft = Math.ceil((new Date(p.possession_due).getTime() - Date.now()) / (86400000))
                  return (
                    <div key={p.id} className="flex items-start gap-2">
                      <div
                        className="w-5 h-5 rounded-sm shrink-0 flex items-center justify-center font-display italic text-xs font-bold"
                        style={{ background: gradeBg(p.risk_grade), color: gradeColor(p.risk_grade) }}
                      >
                        {p.risk_grade}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: 'var(--ink)' }}>{p.name}</div>
                        <div className="font-mono text-[10px]" style={{ color: daysLeft < 60 ? 'var(--rc)' : 'var(--muted)' }}>
                          {daysLeft}d — {p.possession_due}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Ozone Urbana highlight */}
          <div
            className="rounded-sm p-4"
            style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf))', border: '1px solid color-mix(in srgb, var(--rc) 40%, transparent)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--rc)' }} />
              <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--rc)' }}>
                Market Alert
              </span>
            </div>
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--ink)' }}>
              Ozone Urbana — Grade C / Score 9
            </div>
            <div className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
              ₹927 Cr collected · ED attached ₹423 Cr · 1,847 buyers unhoused. Run this case to see Vantis flag it 8 quarters early.
            </div>
            <Link
              href="/land?demo=ozone"
              className="text-xs font-mono uppercase tracking-[0.08em] flex items-center gap-1"
              style={{ color: 'var(--rc)' }}
            >
              Run Ozone Urbana →
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
