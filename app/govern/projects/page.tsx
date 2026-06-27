'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronRight, Building2, Filter, ChevronLeft, X, ExternalLink } from 'lucide-react'
import projectsData from '@/data/projects.json'
import qprData from '@/data/qpr.json'

const ITEMS_PER_PAGE = 25
const HERO_IDS = new Set(['ozone-urbana', 'divya-villas', 'prestige-lakeside', 'skylark-arcadia'])

interface Project {
  id: string
  name: string
  rera: string
  developer_name: string
  location: string
  type: string
  total_units: number
  units_sold: number
  status: string
  risk_score: number
  certificate_status: string
  complaints_pending: number
}

type StatusFilter = 'ALL' | 'COMPLIANT' | 'CAUTION' | 'HIGH RISK'

const LAST_QUARTER = qprData.quarters[qprData.quarters.length - 1]

function qprKey(q: string) {
  return q.toLowerCase().replace(' ', '_')
}

function getLastQPR(projectId: string): string {
  const sub = qprData.submissions.find(s => s.project_id === projectId)
  if (!sub) return 'NA'
  const key = qprKey(LAST_QUARTER)
  const entry = (sub as Record<string, unknown>)[key] as { status: string } | undefined
  return entry?.status ?? 'NA'
}

function statusColor(s: string) {
  if (s === 'COMPLIANT') return 'text-green'
  if (s === 'CAUTION')   return 'text-amber'
  return 'text-red'
}
function statusDot(s: string) {
  if (s === 'COMPLIANT') return 'bg-green'
  if (s === 'CAUTION')   return 'bg-amber'
  return 'bg-red'
}

function qprClasses(status: string) {
  if (status === 'ON_TIME') return 'text-green'
  if (status === 'LATE')    return 'text-amber'
  if (status === 'MISSED')  return 'text-red'
  return 'text-gray'
}

function qprLabel(status: string) {
  if (status === 'ON_TIME') return 'On Time'
  if (status === 'LATE')    return 'Late'
  if (status === 'MISSED')  return 'Missed'
  return 'N/A'
}

function certClasses(status: string) {
  if (status === 'FULL')        return 'text-green'
  if (status === 'PROVISIONAL') return 'text-amber'
  if (status === 'NONE')        return 'text-red'
  return 'text-gray'
}

function riskScoreColor(score: number) {
  if (score >= 70) return 'text-green'
  if (score >= 40) return 'text-amber'
  return 'text-red'
}

function riskBarColor(score: number) {
  if (score >= 70) return 'bg-green'
  if (score >= 40) return 'bg-amber'
  return 'bg-red'
}

const UNIQUE_DEVELOPERS = Array.from(
  new Set((projectsData as Project[]).map(p => p.developer_name))
)

export default function GovernProjectRegistry() {
  const [search, setSearch]               = useState('')
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>('ALL')
  const [devFilter, setDevFilter]         = useState('ALL')
  const [page, setPage]                   = useState(1)
  const [drawer, setDrawer]               = useState<Project | null>(null)

  const projects = projectsData as Project[]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return projects.filter(p => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.developer_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.rera.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter
      const matchDev    = devFilter === 'ALL' || p.developer_name === devFilter
      return matchSearch && matchStatus && matchDev
    })
  }, [projects, search, statusFilter, devFilter])

  useEffect(() => { setPage(1) }, [search, statusFilter, devFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col min-h-full text-off-white">

      {/* Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-border shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">
          K-RERA · Karnataka Real Estate Regulatory Authority · Project Registry
        </div>
        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white leading-none">
          Project Registry
        </h1>
      </div>

      <div className="px-6 sm:px-8 py-6">

        {/* Sub-header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-gray" />
            <span className="text-gray text-xs">All K-RERA registered projects · Vantis database</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-surface border border-border rounded-sm px-3 py-1.5">
            <span className="font-mono text-gold text-sm font-bold">{filtered.length}</span>
            <span className="text-gray text-xs">/ {projects.length} projects</span>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray pointer-events-none" />
            <input
              type="text"
              placeholder="Search by project name, developer, location, RERA number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-sm pl-9 pr-4 py-2.5 text-sm text-off-white placeholder:text-gray focus:outline-none focus:border-gold transition-colors duration-150"
            />
          </div>

          {/* Developer filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray pointer-events-none" />
            <select
              value={devFilter}
              onChange={e => setDevFilter(e.target.value)}
              className="bg-surface border border-border rounded-sm pl-8 pr-8 py-2.5 text-sm text-off-white focus:outline-none focus:border-gold transition-colors duration-150 appearance-none cursor-pointer"
            >
              <option value="ALL">All Developers</option>
              {UNIQUE_DEVELOPERS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {(['ALL', 'COMPLIANT', 'CAUTION', 'HIGH RISK'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                statusFilter === s
                  ? s === 'ALL'
                    ? 'bg-gold/20 border-gold text-gold'
                    : s === 'COMPLIANT'
                    ? 'bg-green/20 border-green/50 text-green'
                    : s === 'CAUTION'
                    ? 'bg-amber/20 border-amber/50 text-amber'
                    : 'bg-red/20 border-red/50 text-red'
                  : 'bg-surface border-border text-gray hover:border-gold hover:text-gold-light'
              }`}
            >
              {s === 'ALL' ? 'All Status' : s}
              {s !== 'ALL' && (
                <span className="ml-1.5 font-mono text-[10px]">
                  {projects.filter(p => p.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Mobile count */}
        <div className="sm:hidden text-gray text-xs mb-3">
          Showing {filtered.length} of {projects.length} projects
        </div>

        {/* Table — desktop */}
        <div className="hidden md:block bg-surface border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Project', 'Developer', 'Location', 'Type', 'Status', 'Risk Score', `QPR ${LAST_QUARTER}`, 'Certificate', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray font-semibold">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray text-sm">
                    No projects match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((p, index) => {
                  const qpr    = getLastQPR(p.id)
                  const isHero = HERO_IDS.has(p.id)
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                      className="border-b border-border last:border-0 transition-colors duration-150 group cursor-pointer hover:bg-background"
                      onClick={() => isHero ? window.location.href = `/govern/projects/${p.id}` : setDrawer(p)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="text-off-white text-sm font-medium leading-tight group-hover:text-gold transition-colors duration-150">
                          {p.name}
                          {isHero && <span className="ml-2 text-[8px] font-mono text-gold/60 uppercase tracking-[0.15em]">Featured</span>}
                        </div>
                        <div className="font-mono text-gray text-[10px] mt-0.5 truncate max-w-[180px]">{p.rera}</div>
                      </td>
                      <td className="px-4 py-3.5 text-gray text-sm">{p.developer_name}</td>
                      <td className="px-4 py-3.5 text-gray text-sm whitespace-nowrap">{p.location}</td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-gray-light bg-surface2 border border-border px-2 py-0.5 rounded-sm">{p.type}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                          <span className={`text-[9px] font-mono whitespace-nowrap ${statusColor(p.status)}`}>{p.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm font-bold ${riskScoreColor(p.risk_score)}`}>
                            {p.risk_score}
                          </span>
                          <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${riskBarColor(p.risk_score)}`}
                              style={{ width: `${p.risk_score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-medium ${qprClasses(qpr)}`}>{qprLabel(qpr)}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-sm font-medium ${certClasses(p.certificate_status)}`}>
                          {p.certificate_status === 'NONE' ? 'None' : p.certificate_status.charAt(0) + p.certificate_status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronRight className="w-4 h-4 text-gray group-hover:text-gold transition-colors duration-150" />
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card list — mobile */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-gray text-sm py-12 bg-surface border border-border rounded-sm">
              No projects match your search.
            </div>
          ) : (
            paginated.map((p, index) => {
              const qpr    = getLastQPR(p.id)
              const isHero = HERO_IDS.has(p.id)
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
                >
                  {(() => {
                    const cardContent = (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className={`text-off-white text-sm font-medium leading-tight mb-0.5 ${isHero ? 'group-hover:text-gold transition-colors duration-150' : ''}`}>
                              {p.name}
                              {isHero && <span className="ml-2 text-[8px] font-mono text-gold/60 uppercase tracking-[0.15em]">Featured</span>}
                            </div>
                            <div className="text-gray text-xs">{p.developer_name}</div>
                            <div className="text-gray text-xs">{p.location}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                            <span className={`text-[9px] font-mono whitespace-nowrap ${statusColor(p.status)}`}>{p.status}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center border-t border-border pt-3">
                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">Risk Score</div>
                            <div className={`font-mono text-sm font-bold ${riskScoreColor(p.risk_score)}`}>{p.risk_score}</div>
                          </div>
                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">QPR</div>
                            <div className={`text-sm font-medium ${qprClasses(qpr)}`}>{qprLabel(qpr)}</div>
                          </div>
                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">Cert</div>
                            <div className={`text-sm font-medium ${certClasses(p.certificate_status)}`}>
                              {p.certificate_status === 'NONE' ? 'None' : p.certificate_status.charAt(0) + p.certificate_status.slice(1).toLowerCase()}
                            </div>
                          </div>
                        </div>
                        {p.complaints_pending > 0 && (
                          <div className="mt-2 text-xs text-amber">
                            {p.complaints_pending} complaint{p.complaints_pending > 1 ? 's' : ''} pending
                          </div>
                        )}
                      </>
                    )
                    return isHero
                      ? <Link href={`/govern/projects/${p.id}`} className="block bg-surface border border-border hover:border-gold/30 rounded-sm p-4 sm:p-5 transition-all group">{cardContent}</Link>
                      : <button onClick={() => setDrawer(p)} className="block w-full text-left bg-surface border border-border hover:border-gold/30 rounded-sm p-4 sm:p-5 transition-all group">{cardContent}</button>
                  })()}
                </motion.div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {filtered.length > ITEMS_PER_PAGE && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="text-gray text-xs font-mono">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length.toLocaleString()} projects
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-border rounded-sm bg-surface text-gray hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>

              {/* Page number pills — show at most 7 */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
                .reduce<(number | '…')[]>((acc, n, i, arr) => {
                  if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('…')
                  acc.push(n)
                  return acc
                }, [])
                .map((item, i) =>
                  item === '…'
                    ? <span key={`ellipsis-${i}`} className="px-2 text-gray text-xs">…</span>
                    : <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`w-8 h-8 text-xs font-mono rounded-sm border transition-colors duration-150 ${
                          page === item
                            ? 'bg-gold/20 border-gold text-gold'
                            : 'bg-surface border-border text-gray hover:border-gold hover:text-gold'
                        }`}
                      >{item}</button>
                )
              }

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-border rounded-sm bg-surface text-gray hover:border-gold hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Simple footer count when no pagination needed */}
        {filtered.length > 0 && filtered.length <= ITEMS_PER_PAGE && (
          <div className="mt-3 text-gray text-xs text-right font-mono">
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            {(statusFilter !== 'ALL' || devFilter !== 'ALL' || search) && ' (filtered)'}
          </div>
        )}

      </div>

      {/* Quick-view drawer for non-hero (real scraped) projects */}
      <AnimatePresence>
        {drawer && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setDrawer(null)}
            />
            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-gray mb-1">K-RERA Project</div>
                    <h2 className="font-syne text-xl font-bold text-off-white leading-snug">{drawer.name}</h2>
                    <div className="font-mono text-[10px] text-gray mt-1 break-all">{drawer.rera}</div>
                  </div>
                  <button onClick={() => setDrawer(null)} className="shrink-0 p-1.5 rounded-sm text-gray hover:text-off-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border mb-6 ${
                  drawer.status === 'COMPLIANT' ? 'bg-green/10 border-green/30 text-green' :
                  drawer.status === 'CAUTION'   ? 'bg-amber/10 border-amber/30 text-amber' :
                                                  'bg-red/10 border-red/30 text-red'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${statusDot(drawer.status)}`} />
                  <span className="text-xs font-mono">{drawer.status}</span>
                  <span className="text-xs font-mono ml-1">· Risk {drawer.risk_score}/100</span>
                </div>

                {/* Info grid */}
                <div className="space-y-0 border border-border rounded-sm overflow-hidden mb-6">
                  {[
                    { label: 'Developer', value: drawer.developer_name },
                    { label: 'Location', value: drawer.location },
                    { label: 'Type', value: drawer.type },
                    { label: 'Total Units', value: drawer.total_units ? drawer.total_units.toLocaleString() : '—' },
                    { label: 'Certificate', value: drawer.certificate_status },
                    { label: 'Complaints Pending', value: drawer.complaints_pending ?? 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-4 px-4 py-3 border-b border-border last:border-0">
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gray w-32 shrink-0 pt-0.5">{label}</span>
                      <span className="text-sm text-off-white break-words">{String(value)}</span>
                    </div>
                  ))}
                </div>

                {/* Risk bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-[9px] font-mono uppercase tracking-[0.18em] text-gray mb-2">
                    <span>Risk Score</span><span>{drawer.risk_score}/100</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${riskBarColor(drawer.risk_score)}`}
                      style={{ width: `${drawer.risk_score}%` }}
                    />
                  </div>
                </div>

                <div className="text-[10px] text-gray border-t border-border pt-4">
                  Source: K-RERA live registry · Full detail pages available for featured projects only.
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
