'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Scale, Calendar, Clock, ChevronRight } from 'lucide-react'
import litigationData from '@/data/litigation.json'
import projectsData from '@/data/projects.json'

interface LitigationItem {
  id: string
  project_id: string
  project_name: string
  developer_name: string
  type: string
  court: string
  case_number: string
  filed_date: string
  plaintiff: string
  cause: string
  relief_sought_crore: number | null
  status: string
  next_hearing: string
  severity: string
}

interface Project {
  id: string
  survey_numbers: string[]
}

const TODAY = new Date('2026-05-13')

function daysSince(d: string) {
  return Math.floor((TODAY.getTime() - new Date(d).getTime()) / 86_400_000)
}

function daysUntil(d: string) {
  return Math.floor((new Date(d).getTime() - TODAY.getTime()) / 86_400_000)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function severityOrder(s: string) {
  if (s === 'CRITICAL') return 0
  if (s === 'HIGH')     return 1
  if (s === 'MEDIUM')   return 2
  return 3
}

function leftBorder(item: LitigationItem) {
  if (item.court.toLowerCase().includes('high court')) return 'border-l-4 border-l-red'
  if (item.type === 'Criminal')                         return 'border-l-4 border-l-red'
  return 'border-l-4 border-l-amber'
}

function caseTypeColor(type: string) {
  if (type === 'Writ' || type === 'Criminal') return 'text-red'
  if (type === 'Civil') return 'text-amber'
  return 'text-gray'
}
function caseTypeDot(type: string) {
  if (type === 'Writ' || type === 'Criminal') return 'bg-red'
  if (type === 'Civil') return 'bg-amber'
  return 'bg-gray-light'
}

function severityTextColor(severity: string) {
  if (severity === 'CRITICAL' || severity === 'HIGH') return 'text-red'
  if (severity === 'MEDIUM')   return 'text-amber'
  return 'text-gray'
}
function severityDot(severity: string) {
  if (severity === 'CRITICAL' || severity === 'HIGH') return 'bg-red'
  if (severity === 'MEDIUM')   return 'bg-amber'
  return 'bg-gray-light'
}

function courtCategory(item: LitigationItem): string {
  if (item.court.toLowerCase().includes('high court')) return 'HIGH_COURT'
  if (item.type === 'Criminal') return 'CRIMINAL'
  return 'DISTRICT'
}

const projects = projectsData as Project[]

function getSurveyNumbers(projectId: string): string {
  return projects.find(p => p.id === projectId)?.survey_numbers.join(', ') ?? '—'
}

type CourtFilter = 'ALL' | 'HIGH_COURT' | 'DISTRICT' | 'CRIMINAL'

const ALL_CASES = [...(litigationData as LitigationItem[])]
  .sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity))

export default function LitigationWatchlist() {
  const [filter, setFilter] = useState<CourtFilter>('ALL')

  const filtered = useMemo(() =>
    filter === 'ALL' ? ALL_CASES : ALL_CASES.filter(l => courtCategory(l) === filter)
  , [filter])

  const TABS: { id: CourtFilter; label: string; count: number }[] = [
    { id: 'ALL',        label: 'All',           count: ALL_CASES.length },
    { id: 'HIGH_COURT', label: 'High Court',    count: ALL_CASES.filter(l => courtCategory(l) === 'HIGH_COURT').length },
    { id: 'DISTRICT',   label: 'District Court', count: ALL_CASES.filter(l => courtCategory(l) === 'DISTRICT').length },
    { id: 'CRIMINAL',   label: 'Criminal',      count: ALL_CASES.filter(l => courtCategory(l) === 'CRIMINAL').length },
  ]

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white">Litigation Watchlist</h1>
          <p className="text-gray text-xs mt-1">Active court cases · eCourts integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-red" />
          <span className="font-mono text-red text-sm font-bold">{ALL_CASES.length}</span>
          <span className="text-gray text-xs">active alerts</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-border mb-5 overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors duration-150 -mb-px ${
              filter === id
                ? id === 'HIGH_COURT' || id === 'CRIMINAL' ? 'border-red text-red'
                  : id === 'DISTRICT' ? 'border-amber text-amber'
                  : 'border-gold text-gold'
                : 'border-transparent text-gray hover:text-gold-light'
            }`}
          >
            {label}
            <span className="font-mono text-[10px] opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-sm p-12 text-center">
          <Scale className="w-8 h-8 text-gray mx-auto mb-3" />
          <div className="text-off-white text-sm font-medium mb-1">No Cases Found</div>
          <div className="text-gray text-xs">No litigation records match this filter.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(l => {
            const since = daysSince(l.filed_date)
            const until = daysUntil(l.next_hearing)
            const survey = getSurveyNumbers(l.project_id)
            return (
              <div
                key={l.id}
                className={`bg-surface border border-border rounded-sm overflow-hidden ${leftBorder(l)}`}
              >
                <div className="px-4 py-4">
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${caseTypeColor(l.type)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${caseTypeDot(l.type)}`} />
                          {l.type.toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${severityTextColor(l.severity)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityDot(l.severity)}`} />
                          {l.severity}
                        </span>
                        <span className="font-mono text-gold text-[10px]">{l.case_number}</span>
                      </div>
                      <div className="text-off-white text-sm font-medium leading-snug mb-0.5">{l.cause}</div>
                      <div className="text-gray text-xs">{l.plaintiff}</div>
                    </div>
                    <Link
                      href={`/govern/projects/${l.project_id}`}
                      className="flex items-center gap-1.5 shrink-0 text-xs text-gray border border-border hover:border-gold hover:text-gold px-3 py-1.5 rounded-sm transition-colors duration-150 group"
                    >
                      View Project <ChevronRight className="w-3 h-3 group-hover:text-gold" />
                    </Link>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Court</div>
                      <div className="text-off-white text-xs leading-snug">{l.court}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Project</div>
                      <div className="text-off-white text-xs leading-snug">{l.project_name}</div>
                      <div className="text-gray text-[10px]">{l.developer_name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Survey Nos.</div>
                      <div className="font-mono text-off-white text-xs">{survey}</div>
                    </div>
                    {l.relief_sought_crore && (
                      <div>
                        <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Relief Sought</div>
                        <div className="font-mono text-red text-xs font-bold">₹{l.relief_sought_crore} Cr</div>
                      </div>
                    )}
                  </div>

                  {/* Date row */}
                  <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-xs text-gray">
                      <Clock className="w-3 h-3 shrink-0" />
                      Filed {fmtDate(l.filed_date)}
                      <span className="text-gray-light">({since} days ago)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className={`w-3 h-3 shrink-0 ${until <= 14 ? 'text-amber' : 'text-gray'}`} />
                      <span className={until <= 14 ? 'text-amber' : 'text-gray'}>
                        Next hearing: {fmtDate(l.next_hearing)}
                        {until >= 0 ? ` (in ${until}d)` : ' (overdue)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
