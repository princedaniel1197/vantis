'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import { AlertTriangle, BarChart2, Building2, Scale, Users, ChevronRight, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import KarnatakaMap from '@/components/shared/KarnatakaMap'
import projectsData from '@/data/projects.json'
import litigationData from '@/data/litigation.json'
import qprData from '@/data/qpr.json'

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Project {
  id: string
  name: string
  developer_name: string
  location: string
  status: string
  risk_score: number
  complaints_pending: number
}

interface LitigationItem {
  id: string
  project_name: string
  developer_name: string
  type: string
  court: string
  filed_date: string
  severity: string
}

interface District {
  id: string
  label: string
  risk: string
  projects: string[]
}

interface KPIItem {
  label: string
  value: number
  icon: LucideIcon
  color: string
  accentBg: string
  accentBar: string
  sub: string
}

/* ── Data ───────────────────────────────────────────────────────────────── */
const KPIS: KPIItem[] = [
  {
    label: 'Registered Projects',
    value: 8357,
    icon: Building2,
    color: 'text-off-white',
    accentBg: '',
    accentBar: '',
    sub: 'K-RERA registered',
  },
  {
    label: 'Distressed Projects',
    value: 234,
    icon: AlertTriangle,
    color: 'text-red',
    accentBg: 'bg-red/[0.03]',
    accentBar: 'bg-red',
    sub: 'High-risk flagged',
  },
  {
    label: 'QPR Defaulters',
    value: 891,
    icon: BarChart2,
    color: 'text-amber',
    accentBg: 'bg-amber/[0.02]',
    accentBar: '',
    sub: 'Q1 2026 missed',
  },
  {
    label: 'Litigation Active',
    value: 47,
    icon: Scale,
    color: 'text-red',
    accentBg: 'bg-red/[0.03]',
    accentBar: 'bg-red',
    sub: 'Court orders pending',
  },
  {
    label: 'Open Complaints',
    value: 1243,
    icon: Users,
    color: 'text-amber',
    accentBg: 'bg-amber/[0.02]',
    accentBar: '',
    sub: 'Awaiting resolution',
  },
]

/* ── Helpers ────────────────────────────────────────────────────────────── */
function statusColor(s: string) {
  if (s === 'COMPLIANT') return 'text-green'
  if (s === 'CAUTION') return 'text-amber'
  return 'text-red'
}
function statusDot(s: string) {
  if (s === 'COMPLIANT') return 'bg-green'
  if (s === 'CAUTION') return 'bg-amber'
  return 'bg-red'
}
function qprKey(quarter: string) {
  return quarter.toLowerCase().replace(' ', '_')
}

/* ── NumberTicker ───────────────────────────────────────────────────────── */
function NumberTicker({ target, color }: { target: number; color: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(nodeRef, { once: true, margin: '-20px' })
  const fired = useRef(false)

  useEffect(() => {
    if (!inView || fired.current || !nodeRef.current) return
    fired.current = true
    const node = nodeRef.current
    const ctrl = animate(0, target, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        if (node) node.textContent = Math.round(v).toLocaleString('en-IN')
      },
    })
    return () => ctrl.stop()
  }, [inView, target])

  return (
    <span
      ref={nodeRef}
      aria-label={target.toLocaleString('en-IN')}
      className={`font-syne text-[2.5rem] font-bold leading-none tabular-nums ${color}`}
    >
      0
    </span>
  )
}

/* ── KPI Cell ───────────────────────────────────────────────────────────── */
function KPICell({ kpi, index }: { kpi: KPIItem; index: number }) {
  const Icon = kpi.icon
  return (
    <motion.div
      className={`relative flex flex-col px-5 py-5 bg-background overflow-hidden ${kpi.accentBg}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
    >
      {kpi.accentBar && (
        <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${kpi.accentBar} opacity-50`} />
      )}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-gray leading-tight">
          {kpi.label}
        </span>
        <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${kpi.color} opacity-40`} />
      </div>
      <NumberTicker target={kpi.value} color={kpi.color} />
      <div className="mt-3 text-[10px] font-mono text-gray">{kpi.sub}</div>
    </motion.div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function GovernCommandCentre() {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)

  const projects = projectsData as Project[]
  const criticalProjects = projects.filter(p => p.status === 'HIGH RISK')
  const districtProjects = selectedDistrict
    ? projects.filter(p => selectedDistrict.projects.includes(p.id))
    : []

  const lastQKey = qprKey(qprData.quarters[qprData.quarters.length - 1])
  const qprDefaulters = qprData.submissions
    .filter(s => {
      const entry = s[lastQKey as keyof typeof s] as { status: string } | undefined
      return entry?.status === 'MISSED'
    })
    .map(s => projects.find(p => p.id === s.project_id))
    .filter(Boolean) as Project[]

  const activeLitigation = (litigationData as LitigationItem[]).filter(
    l => l.severity === 'CRITICAL' || l.severity === 'HIGH'
  )

  return (
    <div className="flex flex-col min-h-full text-off-white">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.header
        className="flex items-end justify-between px-6 sm:px-8 py-5 border-b border-border shrink-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">
            K-RERA · Karnataka Real Estate Regulatory Authority · Q1 2026
          </div>
          <h1 className="font-syne text-3xl sm:text-[2.5rem] font-bold text-off-white leading-none">
            Command Centre
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-5 shrink-0 pb-0.5">
          <span className="text-[10px] font-mono text-gray">12 May 2026 · 09:42 IST</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-green/25 bg-green/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-[10px] font-mono text-green uppercase tracking-[0.14em]">Live</span>
          </div>
        </div>
      </motion.header>

      {/* ── KPI Strip ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border border-b border-border shrink-0">
        {KPIS.map((kpi, i) => (
          <KPICell key={kpi.label} kpi={kpi} index={i} />
        ))}
      </div>

      {/* ── Main Body ───────────────────────────────────────────────────── */}
      <div
        className="flex flex-col lg:flex-row flex-1"
        style={{ minHeight: 'calc(100vh - 260px)' }}
      >

        {/* ── Map Panel ─────────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 border-b lg:border-b-0 lg:border-r border-border">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-gray">
              Karnataka · District Risk Map
            </span>
            <div className="flex items-center gap-4">
              {[
                { dot: 'bg-green', label: 'Compliant' },
                { dot: 'bg-amber', label: 'Caution' },
                { dot: 'bg-red',   label: 'High Risk' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-sm ${l.dot}`} />
                  <span className="text-[9px] font-mono text-gray">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-5 lg:p-6">
            <KarnatakaMap
              selectedDistrict={selectedDistrict?.id ?? null}
              onDistrictClick={d => setSelectedDistrict(d as District)}
            />
          </div>
        </div>

        {/* ── Intel Panel ───────────────────────────────────────────────── */}
        <div className="flex flex-col lg:w-[38%] shrink-0">

          {/* Section A: District drill-down OR critical alerts */}
          <div className="flex flex-col flex-1 overflow-hidden border-b border-border" style={{ minHeight: '280px' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-gray">
                {selectedDistrict ? `District · ${selectedDistrict.label}` : 'Critical Alerts'}
              </span>
              {selectedDistrict && (
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="text-[9px] font-mono text-gray hover:text-gold transition-colors"
                >
                  Clear ×
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <AnimatePresence mode="wait">
                {selectedDistrict ? (
                  <motion.div
                    key={selectedDistrict.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-1.5"
                  >
                    <div className="flex items-baseline gap-2 pb-2">
                      <div className="font-syne text-sm font-semibold text-off-white">
                        {selectedDistrict.label}
                      </div>
                      <div className="text-[10px] font-mono text-gray">
                        {districtProjects.length} project{districtProjects.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {districtProjects.length === 0 ? (
                      <p className="text-[10px] font-mono text-gray py-8 text-center">
                        No registered projects in this district.
                      </p>
                    ) : (
                      districtProjects.map((p, i) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Link
                            href={`/govern/projects/${p.id}`}
                            className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm border border-border hover:border-gold/30 hover:bg-surface transition-all group"
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-medium text-off-white group-hover:text-gold transition-colors truncate">
                                {p.name}
                              </div>
                              <div className="text-[9px] font-mono text-gray mt-0.5 truncate">
                                {p.developer_name}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className={`w-1.5 h-1.5 rounded-full ${statusDot(p.status)}`} />
                              <span className={`text-[9px] font-mono ${statusColor(p.status)}`}>
                                {p.status === 'HIGH RISK' ? 'HIGH RISK' : p.status}
                              </span>
                              <ChevronRight className="w-3 h-3 text-gray group-hover:text-gold transition-colors" />
                            </div>
                          </Link>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="alerts"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-1.5"
                  >
                    {criticalProjects.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 + i * 0.07 }}
                      >
                        <Link
                          href={`/govern/projects/${p.id}`}
                          className="flex items-start gap-3 px-3 py-3 rounded-sm border border-red/20 bg-red/[0.03] hover:bg-red/[0.06] hover:border-red/35 transition-all group"
                        >
                          <div className="mt-1 shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-medium text-off-white group-hover:text-red/80 transition-colors truncate">
                              {p.name}
                            </div>
                            <div className="text-[9px] font-mono text-gray mt-0.5">{p.developer_name}</div>
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-2.5 h-2.5 text-gray/50" />
                              <span className="text-[9px] font-mono text-gray/60">{p.location}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[10px] font-mono text-red font-semibold">
                              Risk {p.risk_score}
                            </div>
                            <div className="text-[9px] font-mono text-gray mt-0.5">
                              {p.complaints_pending} cmpl
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                    <p className="text-center text-[9px] font-mono text-gray/40 pt-2">
                      Click a district on the map to drill in
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Section B: Live feed */}
          <div className="flex flex-col overflow-hidden" style={{ maxHeight: '300px' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-gray">
                Live Feed · QPR & Litigation
              </span>
              <Link
                href="/govern/predictive"
                className="text-[9px] font-mono text-gray hover:text-gold transition-colors"
              >
                All →
              </Link>
            </div>

            <div className="overflow-y-auto flex-1 px-3 py-2 space-y-1">
              {qprDefaulters.slice(0, 3).map((p, i) => (
                <motion.div
                  key={`qpr-${p?.id}`}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm border border-border hover:border-amber/25 transition-colors group"
                >
                  <BarChart2 className="w-3 h-3 text-amber shrink-0 opacity-75" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-off-white truncate">{p?.name}</div>
                    <div className="text-[9px] font-mono text-gray mt-0.5">QPR Q1 2026 · MISSED</div>
                  </div>
                  <Link
                    href={`/govern/projects/${p?.id}`}
                    className="text-[9px] font-mono text-gold/60 hover:text-gold transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    →
                  </Link>
                </motion.div>
              ))}

              {activeLitigation.slice(0, 2).map((l, i) => (
                <motion.div
                  key={l.id}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.06 }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-sm border border-border hover:border-red/20 transition-colors group"
                >
                  <Scale className="w-3 h-3 text-red shrink-0 opacity-75" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-medium text-off-white truncate">{l.project_name}</div>
                    <div className="text-[9px] font-mono text-gray mt-0.5">{l.type} · {l.court.split(' ').slice(0, 3).join(' ')}</div>
                  </div>
                  <Link
                    href="/govern/litigation"
                    className="text-[9px] font-mono text-gold/60 hover:text-gold transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
