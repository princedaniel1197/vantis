'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, Building2, Filter } from 'lucide-react'
import projectsData from '@/data/projects.json'
import qprData from '@/data/qpr.json'

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
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [devFilter, setDevFilter]       = useState('ALL')

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

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white">Project Registry</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Building2 className="w-3 h-3 text-gray" />
            <span className="text-gray text-xs">All K-RERA registered projects · Vantis database</span>
          </div>
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
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">Project</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">Developer</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">Location</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">Type</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">Risk Score</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">QPR {LAST_QUARTER}</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray">Certificate</th>
              <th className="px-4 py-3" />
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
              filtered.map((p, i) => {
                const qpr = getLastQPR(p.id)
                return (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-background transition-colors duration-150 cursor-pointer group"
                    onClick={() => window.location.href = `/govern/projects/${p.id}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150 leading-tight">
                        {p.name}
                      </div>
                      <div className="font-mono text-gray text-[10px] mt-0.5 truncate max-w-[180px]">{p.rera}</div>
                    </td>
                    <td className="px-4 py-3.5 text-gray text-sm">{p.developer_name}</td>
                    <td className="px-4 py-3.5 text-gray text-sm whitespace-nowrap">{p.location}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-light bg-surface2 border border-border px-2 py-0.5 rounded-sm">{p.type}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs whitespace-nowrap ${statusColor(p.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                        {p.status}
                      </span>
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
                  </tr>
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
          filtered.map(p => {
            const qpr = getLastQPR(p.id)
            return (
              <Link
                key={p.id}
                href={`/govern/projects/${p.id}`}
                className="block bg-surface border border-border hover:border-gold rounded-sm p-4 transition-colors duration-150 group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150 leading-tight mb-0.5">
                      {p.name}
                    </div>
                    <div className="text-gray text-xs">{p.developer_name}</div>
                    <div className="text-gray text-xs">{p.location}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs shrink-0 whitespace-nowrap ${statusColor(p.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center border-t border-border pt-3">
                  <div>
                    <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Risk Score</div>
                    <div className={`font-mono text-sm font-bold ${riskScoreColor(p.risk_score)}`}>{p.risk_score}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">QPR</div>
                    <div className={`text-sm font-medium ${qprClasses(qpr)}`}>{qprLabel(qpr)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Cert</div>
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
              </Link>
            )
          })
        )}
      </div>

      {/* Table footer */}
      {filtered.length > 0 && (
        <div className="mt-3 text-gray text-xs text-right">
          {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          {(statusFilter !== 'ALL' || devFilter !== 'ALL' || search) && ' shown (filtered)'}
        </div>
      )}
    </div>
  )
}
