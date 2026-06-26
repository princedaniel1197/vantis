'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView, animate } from 'framer-motion'
import { AlertTriangle, BarChart2, Building2, Scale, Users, ChevronRight, MapPin, TrendingDown } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import KarnatakaMap from '@/components/shared/KarnatakaMap'
import projectsData from '@/data/projects.json'
import litigationData from '@/data/litigation.json'
import qprData from '@/data/qpr.json'

/* ── Types ─────────────────────────────────────────────────────────────── */
interface Project {
  id: string; name: string; developer_name: string; location: string
  status: string; risk_score: number; complaints_pending: number
}
interface LitigationItem {
  id: string; project_name: string; developer_name: string
  type: string; court: string; filed_date: string; severity: string
}
interface District { id: string; label: string; risk: string; projects: string[] }

/* ── Static data ────────────────────────────────────────────────────────── */
const TICKER = [
  '● QPR DEFAULT  ·  OZONE URBANA  ·  Q1 2026  ·  MISSED',
  '● LITIGATION  ·  CITY CIVIL COURT  ·  OZONE GROUP',
  '● 234 PROJECTS FLAGGED HIGH RISK  ·  Q1 2026',
  '● 1,847 HOMEBUYERS  ·  ₹927 CR CAPITAL AT RISK',
  '● ESCROW BREACH  ·  OZONE URBANA  ·  8% vs 70% NORM',
  '● QPR DEFAULT  ·  SKYLARK ARCADIA  ·  Q1 2026  ·  MISSED',
  '● 891 PROJECTS  ·  QPR NON-COMPLIANT  ·  THIS QUARTER',
  '● HIGH COURT WRIT  ·  HOMEBUYER ASSOCIATION  ·  BENGALURU',
]

const KPIS = [
  { label: 'REGISTERED', value: 8357, color: '#F0EEE8', dim: '#9090AA', alert: false },
  { label: 'DISTRESSED', value: 234,  color: '#EF4444', dim: '#EF444466', alert: true  },
  { label: 'QPR DEFAULT', value: 891, color: '#F59E0B', dim: '#F59E0B55', alert: false },
  { label: 'LITIGATION',  value: 47,  color: '#EF4444', dim: '#EF444466', alert: true  },
  { label: 'COMPLAINTS',  value: 1243, color: '#F59E0B', dim: '#F59E0B55', alert: false },
]

const OZONE_RISK = [
  { q: "Q2'20", v: 72 }, { q: "Q3'20", v: 68 }, { q: "Q4'20", v: 61 },
  { q: "Q1'21", v: 51 }, { q: "Q2'21", v: 43 }, { q: "Q3'21", v: 34 },
  { q: "Q4'21", v: 21 }, { q: "Q1'22", v: 9  },
]

/* ── Helpers ────────────────────────────────────────────────────────────── */
function statusColor(s: string) { return s === 'COMPLIANT' ? '#22C55E' : s === 'CAUTION' ? '#F59E0B' : '#EF4444' }
function statusDot(s: string) { return s === 'COMPLIANT' ? 'bg-green' : s === 'CAUTION' ? 'bg-amber' : 'bg-red' }
function qprKey(q: string) { return q.toLowerCase().replace(' ', '_') }

/* ── Scrolling Ticker ───────────────────────────────────────────────────── */
function TickerTape() {
  const text = TICKER.join('          ─────          ')
  return (
    <div
      className="flex items-center overflow-hidden shrink-0 border-b border-border"
      style={{ height: '28px', background: '#07070C' }}
    >
      <div
        className="shrink-0 px-3 py-0 flex items-center gap-1.5 border-r border-border"
        style={{ height: '100%', background: '#0F0F18' }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
        <span className="text-[8px] font-mono text-red uppercase tracking-[0.25em]">ALERT</span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <motion.div
          className="flex whitespace-nowrap items-center"
          animate={{ x: '-50%' }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}
          style={{ willChange: 'transform' }}
        >
          <span className="inline-block font-mono text-[8.5px] tracking-[0.18em] text-gray px-8">
            {text}
          </span>
          <span className="inline-block font-mono text-[8.5px] tracking-[0.18em] text-gray px-8" aria-hidden>
            {text}
          </span>
        </motion.div>
      </div>
    </div>
  )
}

/* ── Number Ticker ──────────────────────────────────────────────────────── */
function NumberTicker({ target, color }: { target: number; color: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView  = useInView(nodeRef, { once: true })
  const fired   = useRef(false)

  useEffect(() => {
    if (!inView || fired.current || !nodeRef.current) return
    fired.current = true
    const node = nodeRef.current
    const ctrl = animate(0, target, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) { if (node) node.textContent = Math.round(v).toLocaleString('en-IN') },
    })
    return () => ctrl.stop()
  }, [inView, target])

  return (
    <span
      ref={nodeRef}
      style={{ color, fontFamily: 'var(--font-syne)', fontSize: '2rem', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}
    >0</span>
  )
}

/* ── KPI Strip ──────────────────────────────────────────────────────────── */
function KPIStrip() {
  return (
    <div className="grid grid-cols-5 gap-px shrink-0" style={{ background: '#1E1E2E', borderBottom: '1px solid #1E1E2E' }}>
      {KPIS.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          className="flex flex-col px-5 py-4 relative overflow-hidden"
          style={{ background: kpi.alert ? 'rgba(239,68,68,0.03)' : '#0A0A0F' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {kpi.alert && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-red opacity-60" />}
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[8px] uppercase tracking-[0.28em]" style={{ color: '#3A3A5A' }}>
              {kpi.label}
            </span>
            {kpi.alert && <div className="w-1 h-1 rounded-full bg-red animate-pulse" />}
          </div>
          <NumberTicker target={kpi.value} color={kpi.color} />
          <div className="mt-2 font-mono text-[9px]" style={{ color: '#3A3A5A' }}>
            {i === 0 ? 'K-RERA registered' : i === 1 ? 'High-risk flagged' : i === 2 ? 'Q1 2026 missed' : i === 3 ? 'Court orders pending' : 'Awaiting resolution'}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

/* ── Ozone Hero Card ────────────────────────────────────────────────────── */
function OzoneHeroCard() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <motion.div
      className="shrink-0 mx-3 mt-3 mb-0 rounded-sm overflow-hidden"
      style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse shrink-0" />
          <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-red">Live Alert</span>
        </div>
        <Link
          href="/govern/projects/ozone-urbana"
          className="font-mono text-[8px] uppercase tracking-[0.15em] text-gray hover:text-gold transition-colors"
        >
          View Profile →
        </Link>
      </div>

      {/* Project name */}
      <div className="px-4 pb-2">
        <div className="font-syne text-lg font-bold text-off-white leading-tight">Ozone Urbana</div>
        <div className="font-mono text-[9px] text-gray mt-0.5">Ozone Group · Bengaluru Urban · RERA/KA/01/2017/...</div>
      </div>

      {/* Three stats */}
      <div className="grid grid-cols-3 gap-px mx-3 mb-3" style={{ background: 'rgba(239,68,68,0.15)' }}>
        {[
          { label: 'Risk Score', value: '9 / 100', color: '#EF4444' },
          { label: 'Capital at Risk', value: '₹927 Cr', color: '#EF4444' },
          { label: 'Homebuyers', value: '1,847', color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="flex flex-col px-3 py-2.5" style={{ background: '#0A0A0F' }}>
            <span className="font-mono text-[7.5px] uppercase tracking-[0.2em]" style={{ color: '#3A3A5A' }}>{s.label}</span>
            <span className="font-syne text-base font-bold mt-1" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Sparkline */}
      {mounted && (
        <div style={{ height: '56px', marginBottom: '-2px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={OZONE_RISK} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ozoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke="#EF4444"
                strokeWidth={1.5}
                fill="url(#ozoneGrad)"
                dot={false}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
              />
              <Tooltip
                contentStyle={{ background: '#0F0F18', border: '1px solid #1E1E2E', borderRadius: '2px', padding: '6px 10px' }}
                labelStyle={{ fontFamily: 'monospace', fontSize: '9px', color: '#6B6B88' }}
                itemStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#EF4444' }}
                formatter={(v) => [`Risk ${v}`, '']}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bottom callout */}
      <div className="flex items-center gap-2 px-4 py-2 border-t" style={{ borderColor: 'rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)' }}>
        <TrendingDown className="w-3 h-3 text-red shrink-0" />
        <span className="font-mono text-[8px] text-red tracking-[0.1em]">
          FLAGGED 8 QUARTERS BEFORE FIR  ·  ESCROW 8%  ·  1,830 QPR DAYS OUTSTANDING
        </span>
      </div>
    </motion.div>
  )
}

/* ── Intel Panel ────────────────────────────────────────────────────────── */
interface IntelPanelProps {
  selectedDistrict: District | null
  setSelectedDistrict: (d: District | null) => void
  criticalProjects: Project[]
  districtProjects: Project[]
  qprDefaulters: Project[]
  activeLitigation: LitigationItem[]
}

function IntelPanel({ selectedDistrict, setSelectedDistrict, criticalProjects, districtProjects, qprDefaulters, activeLitigation }: IntelPanelProps) {
  return (
    <div className="flex flex-col overflow-hidden" style={{ borderLeft: '1px solid #1E1E2E', width: '380px', flexShrink: 0 }}>
      {/* Ozone hero */}
      <OzoneHeroCard />

      {/* Critical Alerts / District detail */}
      <div className="flex flex-col flex-1 overflow-hidden mt-3">
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <span className="font-mono text-[8px] uppercase tracking-[0.22em]" style={{ color: '#3A3A5A' }}>
            {selectedDistrict ? `District · ${selectedDistrict.label}` : 'Critical Alerts'}
          </span>
          {selectedDistrict && (
            <button onClick={() => setSelectedDistrict(null)} className="font-mono text-[8px] text-gray hover:text-gold transition-colors">
              Clear ×
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <AnimatePresence mode="wait">
            {selectedDistrict ? (
              <motion.div key={selectedDistrict.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }} className="space-y-1">
                <div className="flex items-baseline gap-2 px-2 py-1.5 mb-0.5">
                  <span className="font-syne text-xs font-semibold text-off-white">{selectedDistrict.label}</span>
                  <span className="font-mono text-[9px] text-gray">{districtProjects.length} projects</span>
                </div>
                {districtProjects.length === 0 ? (
                  <p className="font-mono text-[9px] text-gray text-center py-6">No registered projects in this district.</p>
                ) : (
                  districtProjects.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Link href={`/govern/projects/${p.id}`} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-sm border border-border hover:border-gold/30 hover:bg-surface transition-all group">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-off-white group-hover:text-gold transition-colors truncate">{p.name}</div>
                          <div className="font-mono text-[9px] text-gray mt-0.5 truncate">{p.developer_name}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`w-1.5 h-1.5 rounded-full ${statusDot(p.status)}`} />
                          <span className="font-mono text-[9px]" style={{ color: statusColor(p.status) }}>{p.status === 'HIGH RISK' ? 'HIGH RISK' : p.status}</span>
                          <ChevronRight className="w-3 h-3 text-gray group-hover:text-gold transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div key="alerts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-1">
                {criticalProjects.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}>
                    <Link href={`/govern/projects/${p.id}`} className="flex items-start gap-3 px-3 py-2.5 rounded-sm border transition-all group" style={{ borderColor: 'rgba(239,68,68,0.18)', background: 'rgba(239,68,68,0.025)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.35)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.025)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.18)' }}
                    >
                      <div className="mt-1 shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-off-white truncate group-hover:text-red/80 transition-colors">{p.name}</div>
                        <div className="font-mono text-[9px] text-gray mt-0.5">{p.developer_name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-2.5 h-2.5" style={{ color: '#3A3A5A' }} />
                          <span className="font-mono text-[9px]" style={{ color: '#3A3A5A' }}>{p.location}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-[10px] font-semibold text-red">Risk {p.risk_score}</div>
                        <div className="font-mono text-[9px] text-gray mt-0.5">{p.complaints_pending} cmpl</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
                <p className="text-center font-mono text-[8px] pt-2" style={{ color: '#2A2A3E' }}>
                  Click a district on the map to drill in
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Live feed */}
      <div className="flex flex-col shrink-0 overflow-hidden" style={{ maxHeight: '200px', borderTop: '1px solid #1E1E2E' }}>
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <span className="font-mono text-[8px] uppercase tracking-[0.22em]" style={{ color: '#3A3A5A' }}>Live Feed · QPR & Litigation</span>
          <Link href="/govern/predictive" className="font-mono text-[8px] text-gray hover:text-gold transition-colors">All →</Link>
        </div>
        <div className="overflow-y-auto flex-1 px-2 py-1.5 space-y-0.5">
          {qprDefaulters.slice(0, 3).map((p, i) => (
            <motion.div key={`qpr-${p?.id}`} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.06 }}
              className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border hover:border-amber/20 transition-colors group"
            >
              <BarChart2 className="w-3 h-3 text-amber shrink-0 opacity-70" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium text-off-white truncate">{p?.name}</div>
                <div className="font-mono text-[8px] text-gray">QPR Q1 2026 · MISSED</div>
              </div>
              <Link href={`/govern/projects/${p?.id}`} className="font-mono text-[8px] text-gold/60 hover:text-gold shrink-0 opacity-0 group-hover:opacity-100 transition-all">→</Link>
            </motion.div>
          ))}
          {activeLitigation.slice(0, 2).map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.06 }}
              className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border hover:border-red/15 transition-colors group"
            >
              <Scale className="w-3 h-3 text-red shrink-0 opacity-70" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-medium text-off-white truncate">{l.project_name}</div>
                <div className="font-mono text-[8px] text-gray">{l.type} · {l.court.split(' ').slice(0, 3).join(' ')}</div>
              </div>
              <Link href="/govern/litigation" className="font-mono text-[8px] text-gold/60 hover:text-gold shrink-0 opacity-0 group-hover:opacity-100 transition-all">→</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function GovernCommandCentre() {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)

  const projects       = projectsData as Project[]
  const criticalProjects = projects.filter(p => p.status === 'HIGH RISK')
  const districtProjects = selectedDistrict ? projects.filter(p => selectedDistrict.projects.includes(p.id)) : []
  const lastQKey       = qprKey(qprData.quarters[qprData.quarters.length - 1])
  const qprDefaulters  = qprData.submissions
    .filter(s => (s[lastQKey as keyof typeof s] as { status: string } | undefined)?.status === 'MISSED')
    .map(s => projects.find(p => p.id === s.project_id))
    .filter(Boolean) as Project[]
  const activeLitigation = (litigationData as LitigationItem[]).filter(l => l.severity === 'CRITICAL' || l.severity === 'HIGH')

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 48px)' }}>

      {/* ── Ticker tape ───────────────────────────────────────────────── */}
      <TickerTape />

      {/* ── Page header ───────────────────────────────────────────────── */}
      <motion.div
        className="flex items-center justify-between shrink-0 px-6 py-4"
        style={{ borderBottom: '1px solid #1E1E2E' }}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <div className="font-mono text-[8px] uppercase tracking-[0.3em] mb-2" style={{ color: '#3A3A5A' }}>
            K-RERA · Karnataka Real Estate Regulatory Authority · Q1 2026
          </div>
          <h1 style={{ fontFamily: 'var(--font-syne)', fontSize: '1.75rem', fontWeight: 700, color: '#F0EEE8', lineHeight: 1, letterSpacing: '-0.01em' }}>
            Command Centre
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="font-mono text-[9px]" style={{ color: '#3A3A5A' }}>12 MAY 2026  ·  09:42 IST</div>
            <div className="font-mono text-[8px] mt-0.5" style={{ color: '#2A2A3E' }}>K-RERA Data Feed · Updated Daily</div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm" style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            <span className="font-mono text-[9px] text-green uppercase tracking-[0.18em]">Live</span>
          </div>
        </div>
      </motion.div>

      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      <KPIStrip />

      {/* ── Map + Intel ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:flex-row" style={{ minHeight: '480px' }}>

        {/* Map panel */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-5 py-2.5 shrink-0" style={{ borderBottom: '1px solid #1E1E2E' }}>
            <span className="font-mono text-[8px] uppercase tracking-[0.22em]" style={{ color: '#3A3A5A' }}>Karnataka · District Risk Map</span>
            <div className="flex items-center gap-4">
              {[{ c: '#22C55E', l: 'Compliant' }, { c: '#F59E0B', l: 'Caution' }, { c: '#EF4444', l: 'High Risk' }].map(x => (
                <div key={x.l} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ background: x.c }} />
                  <span className="font-mono text-[8px]" style={{ color: '#3A3A5A' }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 p-5">
            <KarnatakaMap
              selectedDistrict={selectedDistrict?.id ?? null}
              onDistrictClick={d => setSelectedDistrict(d as District)}
            />
          </div>
        </div>

        {/* Intel panel */}
        <IntelPanel
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          criticalProjects={criticalProjects}
          districtProjects={districtProjects}
          qprDefaulters={qprDefaulters}
          activeLitigation={activeLitigation}
        />
      </div>
    </div>
  )
}
