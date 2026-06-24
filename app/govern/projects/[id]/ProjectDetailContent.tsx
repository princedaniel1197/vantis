'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  ArrowLeft, Building2, FileText, TrendingDown,
  Scale, AlertTriangle, Settings, CheckCircle,
  ChevronRight, XCircle, FileX, FolderOpen, ExternalLink, Satellite,
} from 'lucide-react'
import projectsData from '@/data/projects.json'
import developersData from '@/data/developers.json'
import qprData from '@/data/qpr.json'
import litigationData from '@/data/litigation.json'

const RiskTimeline = dynamic(() => import('@/components/govern/RiskTimeline'), { ssr: false })

/* ---------- Types ---------- */
interface Project {
  id: string; name: string; rera: string; developer_id: string; developer_name: string
  location: string; survey_numbers: string[]; type: string; total_units: number
  units_sold: number; declared_cost_crore: number; completion_date: string
  registration_date: string; registration_valid_until: string; extensions: number
  status: string; risk_score: number; certificate_id: string | null
  certificate_status: string; complaints_pending: number; complaints_resolved: number
  litigation: Array<{ type: string; court: string; filed: string; status: string }>
}
interface Developer {
  id: string; name: string; city: string; state: string; trust_score: number
  total_projects: number; active_projects: number; completed_projects: number
  years_active: number; contact_email: string; contact_phone: string; status: string
}
interface LitigationItem {
  id: string; project_id: string; type: string; court: string; case_number: string
  filed_date: string; plaintiff: string; cause: string; relief_sought_crore: number | null
  status: string; next_hearing: string; severity: string
}
interface QPREntry { status: string; filed_date: string | null; completion_pct: number | null }

/* ---------- Helpers ---------- */
const TODAY = new Date('2026-05-13')

function getDueDate(quarter: string): Date {
  const [q, year] = quarter.split(' ')
  const y = parseInt(year)
  if (q === 'Q1') return new Date(`${y}-01-15`)
  if (q === 'Q2') return new Date(`${y}-04-15`)
  if (q === 'Q3') return new Date(`${y}-07-15`)
  return new Date(`${y}-10-15`)
}

function daysLate(quarter: string, entry: QPREntry): number {
  const due = getDueDate(quarter)
  const ref  = entry.filed_date ? new Date(entry.filed_date) : TODAY
  return Math.max(0, Math.floor((ref.getTime() - due.getTime()) / 86_400_000))
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtCrore(n: number) {
  return `₹${n.toLocaleString('en-IN')} Cr`
}

function fmtInr(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(2)} L`
  return `₹${n.toLocaleString('en-IN')}`
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

function riskColor(score: number) {
  if (score >= 70) return 'text-green'
  if (score >= 40) return 'text-amber'
  return 'text-red'
}

function riskBarColor(score: number) {
  if (score >= 70) return 'bg-green'
  if (score >= 40) return 'bg-amber'
  return 'bg-red'
}

function qprRowClass(status: string) {
  if (status === 'MISSED') return 'bg-red/5'
  if (status === 'LATE')   return 'bg-amber/5'
  return ''
}

function qprStatusEl(status: string) {
  if (status === 'ON_TIME') return <span className="text-green font-medium text-xs">On Time</span>
  if (status === 'LATE')    return <span className="text-amber font-medium text-xs">Late</span>
  if (status === 'MISSED')  return <span className="text-red font-medium text-xs">Missed</span>
  return <span className="text-gray text-xs">N/A</span>
}

function severityTextColor(s: string) {
  if (s === 'CRITICAL' || s === 'HIGH') return 'text-red'
  if (s === 'MEDIUM')                   return 'text-amber'
  return 'text-gray'
}
function severityDotBg(s: string) {
  if (s === 'CRITICAL' || s === 'HIGH') return 'bg-red'
  if (s === 'MEDIUM')                   return 'bg-amber'
  return 'bg-gray'
}

/* ---------- Hardcoded escrow intelligence ---------- */
const ESCROW: Record<string, {
  balance_crore: number; collected_crore: number; pct: number
  status: 'HEALTHY' | 'CAUTION' | 'CRITICAL'; last_withdrawal: string; note: string
}> = {
  'ozone-urbana':       { balance_crore: 3.88, collected_crore: 48.5, pct: 8,  status: 'CRITICAL', last_withdrawal: '2022-09-14', note: 'Escrow nearly depleted. Last withdrawal Sep 2022. Construction halted.' },
  'prestige-lakeside':  { balance_crore: 48.3, collected_crore: 210.0, pct: 23, status: 'HEALTHY',  last_withdrawal: '2026-03-20', note: 'Balance healthy. Withdrawals aligned with construction milestones.' },
  'divya-villas':       { balance_crore: 0.98, collected_crore: 2.4,  pct: 41, status: 'HEALTHY',  last_withdrawal: '2026-02-15', note: 'Balance healthy. Project near completion.' },
  'skylark-arcadia':    { balance_crore: 8.68, collected_crore: 62.0, pct: 14, status: 'CAUTION',  last_withdrawal: '2025-12-10', note: 'Below recommended 20% floor. Requires monitoring.' },
}

const escrowStatusClass = { HEALTHY: 'text-green bg-green/10 border-green/30', CAUTION: 'text-amber bg-amber/10 border-amber/30', CRITICAL: 'text-red bg-red/10 border-red/30' }

/* ---------- Tabs ---------- */
const TABS = [
  { id: 'overview',   label: 'Overview',     icon: Building2 },
  { id: 'qpr',        label: 'QPR History',  icon: FileText },
  { id: 'financial',  label: 'Financial',    icon: TrendingDown },
  { id: 'litigation', label: 'Litigation',   icon: Scale },
  { id: 'timeline',   label: 'Risk Timeline',icon: AlertTriangle },
  { id: 'actions',    label: 'Actions',      icon: Settings },
  { id: 'documents',  label: 'Documents',    icon: FolderOpen },
  { id: 'satellite',  label: 'Satellite View', icon: Satellite },
]

/* ================================================================
   COMPONENT
   ================================================================ */
export default function ProjectDetailContent({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [watchlisted, setWatchlisted] = useState(false)
  const [watchConfirm, setWatchConfirm] = useState(false)
  const [inspectionModal, setInspectionModal] = useState(false)
  const [rrcModal, setRrcModal] = useState(false)
  const [docModules, setDocModules] = useState<{
    openPDF: (key: string, filename: string) => void
    openImage: (key: string, filename: string) => void
    divyaVillasImages: Record<string, string>
  } | null>(null)

  useEffect(() => {
    if (activeTab === 'documents' && !docModules) {
      Promise.all([
        import('@/lib/divya-villas-pdfs'),
        import('@/lib/divya-villas-images'),
      ]).then(([pdfs, images]) => {
        setDocModules({
          openPDF: pdfs.openPDF,
          openImage: images.openImage,
          divyaVillasImages: images.divyaVillasImages,
        })
      })
    }
  }, [activeTab, docModules])

  const projectMaybe = (projectsData as Project[]).find(p => p.id === params.id)

  if (!projectMaybe) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-10 h-10 text-gray mx-auto mb-3" />
          <div className="font-syne text-xl text-off-white mb-2">Project Not Found</div>
          <Link href="/govern/projects" className="text-gold text-sm hover:text-gold-light transition-colors duration-150">
            ← Back to Registry
          </Link>
        </div>
      </div>
    )
  }

  const project: Project = projectMaybe
  const developer = (developersData as Developer[]).find(d => d.id === project.developer_id)
  const qprSub = qprData.submissions.find(s => s.project_id === project.id)
  const litigation = (litigationData as LitigationItem[]).filter(l => l.project_id === project.id)
  const escrow = ESCROW[project.id]

  const qprRows = qprSub
    ? qprData.quarters.map(q => {
        const key = q.toLowerCase().replace(' ', '_')
        const entry = (qprSub as Record<string, unknown>)[key] as QPREntry
        return { quarter: q, entry }
      })
    : []

  const latestQPR = qprRows.length ? qprRows[qprRows.length - 1].entry : null
  const completionPct = latestQPR?.completion_pct ??
    (qprRows.slice().reverse().find(r => r.entry.completion_pct !== null)?.entry.completion_pct ?? null)

  const unitsPct = Math.round((project.units_sold / project.total_units) * 100)

  /* ---- Tab renderers ---- */
  function renderOverview() {
    return (
      <div className="space-y-5">
        {/* Facts grid */}
        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Project Details</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {[
              { label: 'RERA Number',      value: project.rera,                     mono: true, gold: true },
              { label: 'Project Type',     value: project.type },
              { label: 'Location',         value: project.location },
              { label: 'Survey Numbers',   value: project.survey_numbers.join(', ') },
              { label: 'Declared Cost',    value: fmtCrore(project.declared_cost_crore) },
              { label: 'Registration Date',value: fmtDate(project.registration_date) },
              { label: 'Valid Until',      value: fmtDate(project.registration_valid_until) },
              { label: 'Extensions',       value: project.extensions > 0 ? `${project.extensions} extension${project.extensions > 1 ? 's' : ''}` : 'None' },
              { label: 'Completion Date',  value: fmtDate(project.completion_date) },
              { label: 'Certificate',      value: project.certificate_status === 'NONE' ? 'Not issued' : project.certificate_status },
            ].map(({ label, value, mono, gold }) => (
              <div key={label} className="flex items-start justify-between gap-3 py-2 border-b border-border/60">
                <span className="text-gray text-xs shrink-0">{label}</span>
                <span className={`text-xs text-right leading-relaxed ${mono ? 'font-mono' : ''} ${gold ? 'text-gold' : 'text-off-white'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Units sold */}
        <div className="bg-surface2 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray text-xs font-semibold uppercase tracking-wide">Units Sold</span>
            <span className="font-mono text-gold text-sm font-bold">{project.units_sold} / {project.total_units}</span>
          </div>
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${unitsPct}%` }} />
          </div>
          <div className="text-gray text-xs mt-1 text-right">{unitsPct}% sold</div>
        </div>

        {/* Completion */}
        <div className="bg-surface2 border border-border rounded-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray text-xs font-semibold uppercase tracking-wide">Construction Completion</span>
            <span className={`font-mono text-sm font-bold ${completionPct !== null ? 'text-gold' : 'text-red'}`}>
              {completionPct !== null ? `${completionPct}%` : 'Unknown'}
            </span>
          </div>
          {completionPct !== null ? (
            <div className="h-2 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${riskBarColor(completionPct)}`}
                style={{ width: `${completionPct}%` }}
              />
            </div>
          ) : (
            <div className="text-red text-xs mt-1">Construction halted — no QPR data available</div>
          )}
        </div>

        {/* Developer info */}
        {developer && (
          <div>
            <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Developer</div>
            <div className="bg-surface2 border border-border rounded-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-off-white font-medium text-sm">{developer.name}</div>
                  <div className="text-gray text-xs mt-0.5">{developer.city}, {developer.state} · {developer.years_active} years active</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs shrink-0 ${statusColor(developer.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(developer.status)}`} />
                  {developer.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center border-t border-border pt-3">
                <div>
                  <div className="font-mono text-gold text-base font-bold">{developer.total_projects}</div>
                  <div className="text-gray text-[10px] mt-0.5">Total projects</div>
                </div>
                <div>
                  <div className="font-mono text-off-white text-base font-bold">{developer.active_projects}</div>
                  <div className="text-gray text-[10px] mt-0.5">Active</div>
                </div>
                <div>
                  <div className={`font-mono text-base font-bold ${riskColor(developer.trust_score)}`}>{developer.trust_score}</div>
                  <div className="text-gray text-[10px] mt-0.5">Trust score</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div className="text-gray text-xs">{developer.contact_email}</div>
                <div className="text-gray text-xs">{developer.contact_phone}</div>
              </div>
            </div>
          </div>
        )}

        {/* Complaints summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pending',  value: project.complaints_pending,  color: project.complaints_pending > 0 ? 'text-amber' : 'text-green' },
            { label: 'Resolved', value: project.complaints_resolved, color: 'text-green' },
            { label: 'Total',    value: project.complaints_pending + project.complaints_resolved, color: 'text-off-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface2 border border-border rounded-sm p-3 text-center">
              <div className={`font-syne text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-gray text-xs mt-1">Complaints {label}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderQPR() {
    return (
      <div>
        <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">
          Quarterly Progress Reports · {qprData.quarters.length} quarters
        </div>

        {/* Desktop table */}
        <div className="hidden md:block border border-border rounded-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface2">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">Quarter</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">Due Date</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">Filed Date</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">Completion</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">Days Late</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">Penalty</th>
              </tr>
            </thead>
            <tbody>
              {qprRows.map(({ quarter, entry }) => {
                const due = getDueDate(quarter)
                const late = (entry.status === 'LATE' || entry.status === 'MISSED') ? daysLate(quarter, entry) : null
                const penalty = entry.status === 'MISSED' ? (daysLate(quarter, entry) * 25_000) : null
                return (
                  <tr key={quarter} className={`border-b border-border last:border-0 ${qprRowClass(entry.status)}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gold">{quarter}</td>
                    <td className="px-4 py-3 text-gray text-xs">{fmtDate(due.toISOString().split('T')[0])}</td>
                    <td className="px-4 py-3 text-xs text-off-white">
                      {entry.filed_date ? fmtDate(entry.filed_date) : <span className="text-gray">—</span>}
                    </td>
                    <td className="px-4 py-3">{qprStatusEl(entry.status)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-off-white">
                      {entry.completion_pct !== null ? `${entry.completion_pct}%` : <span className="text-gray">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {late !== null ? <span className={late > 0 ? (entry.status === 'MISSED' ? 'text-red' : 'text-amber') : 'text-gray'}>{late > 0 ? `+${late}d` : '—'}</span> : <span className="text-gray">—</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {penalty !== null ? <span className="text-red">{fmtInr(penalty)}</span> : <span className="text-gray">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {qprRows.map(({ quarter, entry }) => {
            const due = getDueDate(quarter)
            const late = (entry.status === 'LATE' || entry.status === 'MISSED') ? daysLate(quarter, entry) : null
            const penalty = entry.status === 'MISSED' ? (daysLate(quarter, entry) * 25_000) : null
            return (
              <div key={quarter} className={`border border-border rounded-sm p-3 ${qprRowClass(entry.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-gold text-xs font-bold">{quarter}</span>
                  {qprStatusEl(entry.status)}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-gray">Due: <span className="text-off-white">{fmtDate(due.toISOString().split('T')[0])}</span></div>
                  <div className="text-gray">Filed: <span className="text-off-white">{entry.filed_date ? fmtDate(entry.filed_date) : '—'}</span></div>
                  {entry.completion_pct !== null && (
                    <div className="text-gray">Completion: <span className="text-off-white">{entry.completion_pct}%</span></div>
                  )}
                  {late !== null && late > 0 && (
                    <div className="text-gray">Late: <span className={entry.status === 'MISSED' ? 'text-red' : 'text-amber'}>+{late} days</span></div>
                  )}
                  {penalty !== null && (
                    <div className="text-gray col-span-2">Penalty: <span className="text-red font-mono">{fmtInr(penalty)}</span></div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {project.status === 'HIGH RISK' && (
          <div className="mt-4 border-l-2 border-red pl-3 bg-red/5 rounded-sm p-3">
            <div className="text-red text-xs font-semibold mb-0.5">Total Penalty Accrued</div>
            <div className="font-mono text-red text-lg font-bold">
              {fmtInr(
                qprRows
                  .filter(({ entry }) => entry.status === 'MISSED')
                  .reduce((sum, { quarter, entry }) => sum + daysLate(quarter, entry) * 25_000, 0)
              )}
            </div>
            <div className="text-gray text-xs mt-0.5">@ Rs.25,000 per day per quarter</div>
          </div>
        )}
      </div>
    )
  }

  function renderFinancial() {
    return (
      <div className="space-y-5">
        {/* Escrow status */}
        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Escrow Account — Kaveri 2.0</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="bg-surface2 border border-border rounded-sm p-4 text-center">
              <div className="text-[10px] text-gray uppercase tracking-wide mb-1.5">Balance</div>
              <div className={`font-syne text-2xl font-bold ${escrowStatusClass[escrow.status].split(' ')[0]}`}>
                {fmtCrore(escrow.balance_crore)}
              </div>
            </div>
            <div className="bg-surface2 border border-border rounded-sm p-4 text-center">
              <div className="text-[10px] text-gray uppercase tracking-wide mb-1.5">Total Collected</div>
              <div className="font-syne text-2xl font-bold text-off-white">{fmtCrore(escrow.collected_crore)}</div>
            </div>
            <div className="bg-surface2 border border-border rounded-sm p-4 text-center">
              <div className="text-[10px] text-gray uppercase tracking-wide mb-1.5">Escrow %</div>
              <div className={`font-syne text-2xl font-bold ${escrowStatusClass[escrow.status].split(' ')[0]}`}>
                {escrow.pct}%
              </div>
              <span className={`inline-flex items-center gap-1.5 mt-1.5 text-[10px] ${escrowStatusClass[escrow.status].split(' ')[0]}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  escrow.status === 'HEALTHY' ? 'bg-green' :
                  escrow.status === 'CAUTION' ? 'bg-amber' : 'bg-red'
                }`} />
                {escrow.status}
              </span>
            </div>
          </div>

          {/* Escrow bar */}
          <div className="bg-surface2 border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray text-xs">Escrow utilization</span>
              <span className="text-gray text-xs">Last withdrawal: {fmtDate(escrow.last_withdrawal)}</span>
            </div>
            <div className="h-3 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  escrow.status === 'HEALTHY' ? 'bg-green' : escrow.status === 'CAUTION' ? 'bg-amber' : 'bg-red'
                }`}
                style={{ width: `${escrow.pct}%` }}
              />
            </div>
            <div className={`mt-2 text-xs border-l-2 pl-2 ${
              escrow.status === 'HEALTHY' ? 'border-green text-gray-light' :
              escrow.status === 'CAUTION' ? 'border-amber text-gray-light' : 'border-red text-red'
            }`}>
              {escrow.note}
            </div>
          </div>
        </div>

        {/* Financial facts */}
        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Project Financials</div>
          <div className="space-y-2">
            {[
              { label: 'Declared Project Cost', value: fmtCrore(project.declared_cost_crore) },
              { label: 'Units Sold',             value: `${project.units_sold} / ${project.total_units} (${unitsPct}%)` },
              { label: 'Extensions Granted',     value: project.extensions > 0 ? `${project.extensions}` : 'None' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-gray text-sm">{label}</span>
                <span className="text-off-white text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  function renderLitigation() {
    return (
      <div>
        <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">
          Active Court Cases · {litigation.length} record{litigation.length !== 1 ? 's' : ''}
        </div>

        {litigation.length === 0 ? (
          <div className="bg-surface2 border border-border rounded-sm p-8 text-center">
            <CheckCircle className="w-8 h-8 text-green mx-auto mb-3" />
            <div className="text-off-white text-sm font-medium mb-1">No Active Litigation</div>
            <div className="text-gray text-xs">No court cases on record for this project.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {litigation.map(l => (
              <div key={l.id} className="bg-surface2 border border-border rounded-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-mono text-gold text-xs mb-0.5">{l.case_number}</div>
                    <div className="text-off-white text-sm font-medium">{l.cause}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] shrink-0 ${severityTextColor(l.severity)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${severityDotBg(l.severity)}`} />
                    {l.severity}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {[
                    { label: 'Court',         value: l.court },
                    { label: 'Type',          value: l.type },
                    { label: 'Plaintiff',     value: l.plaintiff },
                    { label: 'Filed',         value: fmtDate(l.filed_date) },
                    { label: 'Next Hearing',  value: fmtDate(l.next_hearing) },
                    { label: 'Relief Sought', value: l.relief_sought_crore ? fmtCrore(l.relief_sought_crore) : 'Not specified' },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-xs">
                      <span className="text-gray">{label}: </span>
                      <span className="text-off-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderTimeline() {
    if (project.id !== 'ozone-urbana') {
      return (
        <div className="bg-surface2 border border-border rounded-sm p-8 text-center">
          <TrendingDown className="w-10 h-10 text-gray mx-auto mb-3" />
          <div className="text-off-white text-sm font-medium mb-2">Insufficient Data for Prediction</div>
          <div className="text-gray text-xs max-w-sm mx-auto leading-relaxed mb-5">
            Vantis Risk Timeline requires at least 3 consecutive distress signals. This project does not currently meet the threshold.
          </div>
          <div className="border border-border rounded-sm p-4 text-left max-w-md mx-auto">
            <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-2">Ozone Urbana — Case Study</div>
            <div className="text-gray text-xs leading-relaxed">
              Vantis detected collapse 8 quarters before FIR was filed. Risk score declined from 42 → 9 across
              8 quarters, default probability rose to 97%. 1,847 homebuyers and ₹927 Cr protected if action had been taken early.
            </div>
            <Link href="/govern/projects/ozone-urbana" className="inline-flex items-center gap-1 text-gold text-xs mt-3 hover:text-gold-light transition-colors duration-150">
              View Ozone Urbana timeline <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )
    }
    return <RiskTimeline />
  }

  function renderActions() {
    return (
      <div className="space-y-3">
        <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-4">Regulatory Actions</div>

        {/* Generate Notice */}
        <Link
          href="/govern/notices"
          className="flex items-center justify-between w-full bg-surface2 border border-border hover:border-gold rounded-sm p-4 transition-colors duration-150 group"
        >
          <div>
            <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150">Generate Show Cause Notice</div>
            <div className="text-gray text-xs mt-0.5">AI-drafted notice with project-specific details</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray group-hover:text-gold transition-colors duration-150 shrink-0" />
        </Link>

        {/* Flag for Inspection */}
        <button
          onClick={() => setInspectionModal(true)}
          className="flex items-center justify-between w-full bg-surface2 border border-border hover:border-amber rounded-sm p-4 transition-colors duration-150 group text-left"
        >
          <div>
            <div className="text-off-white text-sm font-medium group-hover:text-amber transition-colors duration-150">Flag for Physical Inspection</div>
            <div className="text-gray text-xs mt-0.5">Assign inspection team · Notify field officer</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray group-hover:text-amber transition-colors duration-150 shrink-0" />
        </button>

        {/* Initiate RRC */}
        <button
          onClick={() => setRrcModal(true)}
          className="flex items-center justify-between w-full bg-surface2 border border-border hover:border-red rounded-sm p-4 transition-colors duration-150 group text-left"
        >
          <div>
            <div className="text-off-white text-sm font-medium group-hover:text-red transition-colors duration-150">Initiate Recovery Proceedings (RRC)</div>
            <div className="text-gray text-xs mt-0.5">Begin formal recovery action under RERA</div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray group-hover:text-red transition-colors duration-150 shrink-0" />
        </button>

        {/* Watchlist toggle */}
        <button
          onClick={() => {
            setWatchlisted(w => !w)
            setWatchConfirm(true)
            setTimeout(() => setWatchConfirm(false), 2500)
          }}
          className={`flex items-center justify-between w-full border rounded-sm p-4 transition-colors duration-150 group text-left ${
            watchlisted
              ? 'bg-gold/10 border-gold'
              : 'bg-surface2 border-border hover:border-gold'
          }`}
        >
          <div>
            <div className={`text-sm font-medium transition-colors duration-150 ${watchlisted ? 'text-gold' : 'text-off-white group-hover:text-gold'}`}>
              {watchlisted ? '★ On Watchlist' : 'Add to Watchlist'}
            </div>
            <div className="text-gray text-xs mt-0.5">
              {watchlisted ? 'You are monitoring this project' : 'Get alerts when risk indicators change'}
            </div>
          </div>
          {watchConfirm && (
            <span className="text-green text-xs font-medium shrink-0">
              {watchlisted ? 'Added ✓' : 'Removed'}
            </span>
          )}
        </button>

        {/* Modals */}
        {inspectionModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setInspectionModal(false)}>
            <div className="bg-surface border border-border rounded-sm p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="font-syne text-off-white text-base mb-2">Flag for Inspection?</div>
              <div className="text-gray text-sm mb-4 leading-relaxed">
                An inspection request will be logged for <strong className="text-off-white">{project.name}</strong> and the assigned field officer will be notified.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setInspectionModal(false)}
                  className="flex-1 bg-amber/15 border border-amber/40 text-amber text-sm py-2 rounded-sm hover:bg-amber/25 transition-colors duration-150"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setInspectionModal(false)}
                  className="flex-1 bg-surface2 border border-border text-gray text-sm py-2 rounded-sm hover:text-off-white transition-colors duration-150"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {rrcModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setRrcModal(false)}>
            <div className="bg-surface border border-border rounded-sm p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="font-syne text-off-white text-base mb-2">Initiate RRC?</div>
              <div className="text-gray text-sm mb-4 leading-relaxed">
                This will begin formal Recovery Proceedings against <strong className="text-off-white">{project.developer_name}</strong> under RERA. This action is recorded and cannot be undone.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setRrcModal(false)}
                  className="flex-1 bg-red/15 border border-red/40 text-red text-sm py-2 rounded-sm hover:bg-red/25 transition-colors duration-150"
                >
                  Initiate RRC
                </button>
                <button
                  onClick={() => setRrcModal(false)}
                  className="flex-1 bg-surface2 border border-border text-gray text-sm py-2 rounded-sm hover:text-off-white transition-colors duration-150"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  function renderDocuments() {
    if (project.id !== 'divya-villas') {
      return (
        <div className="bg-surface border border-border rounded-sm p-8 text-center">
          <FileX className="w-8 h-8 text-gray mx-auto mb-3" />
          <div className="text-gray text-sm">No documents uploaded yet.</div>
        </div>
      )
    }

    if (!docModules) {
      return <div className="text-gray text-sm p-4">Loading documents...</div>
    }

    const { openPDF, openImage, divyaVillasImages } = docModules

    function DocRow({ name, onView }: { name: string; onView: () => void }) {
      return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-4 h-4 text-gray shrink-0" />
            <span className="text-off-white text-sm truncate">{name}</span>
          </div>
          <button
            onClick={onView}
            className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors duration-150 shrink-0 ml-3"
          >
            View <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )
    }

    function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
      return (
        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">{title}</div>
          <div className="border border-border rounded-sm overflow-hidden">{children}</div>
        </div>
      )
    }

    const photoKeys = ['road1', 'road2', 'road3', 'site1', 'site2', 'road4', 'site3', 'drain', 'layout1', 'park', 'layout2', 'borewell', 'streetLight'] as const

    function fallbackPhotoSrc(key: string): string {
      const labels: Record<string, string> = {
        road1: 'Access Road · Entry', road2: 'Perimeter Road', road3: 'Block A Road',
        site1: 'Plot 83/2 · Foundation', site2: 'Plot 84/2 · Cleared', road4: 'Internal Road',
        site3: 'Plot 84/2 · Grading', layout1: 'Layout View · North', layout2: 'Layout View · South',
      }
      const label = labels[key] ?? key
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200"><rect width="320" height="200" fill="#161622"/><rect x="0" y="145" width="320" height="55" fill="#1a1208"/><rect x="55" y="85" width="210" height="60" fill="#251a0a" rx="2"/><line x1="55" y1="105" x2="265" y2="105" stroke="#2a2020" stroke-width="0.7"/><line x1="55" y1="125" x2="265" y2="125" stroke="#2a2020" stroke-width="0.7"/><line x1="120" y1="85" x2="120" y2="145" stroke="#2a2020" stroke-width="0.7"/><line x1="200" y1="85" x2="200" y2="145" stroke="#2a2020" stroke-width="0.7"/><text x="160" y="177" text-anchor="middle" font-family="monospace" font-size="9" fill="#4a4858">${label}</text><text x="160" y="73" text-anchor="middle" font-family="monospace" font-size="8" fill="#3a3848">SITE PHOTO</text></svg>`
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    }

    return (
      <div className="space-y-6">

        <div className="bg-green/10 border border-green/20 rounded-sm px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green shrink-0" />
          <span className="text-green text-sm font-medium">
            All required documents submitted — 29 documents across 6 categories.
          </span>
        </div>

<DocSection title="Registration Documents">
          <DocRow name="Project Application Form"                onView={() => openPDF('reraApplication', 'Divya_Villas_RERA_application.pdf')} />
          <DocRow name="Title Documents — Survey 83/2 and 84/2" onView={() => openPDF('ecMerged', 'EC_Divya_Villas_Merged.pdf')} />
          <DocRow name="CA Certificate — Project Cost"           onView={() => openPDF('caFundUtilisation', 'Form_Ex3_CA_Certificate.pdf')} />
          <DocRow name="Engineer Certificate — Land Area"        onView={() => openPDF('engineerWorkStatus', 'Form_Ex5_Engineer_Certificate.pdf')} />
          <DocRow name="Sanctioned Building Plan"                onView={() => openPDF('buildingPlan', 'Plan_Divya_Villas.pdf')} />
          <DocRow name="Encumbrance Certificate Survey 83/2"     onView={() => openPDF('ec83', 'EC_Survey_83_2.pdf')} />
          <DocRow name="Encumbrance Certificate Survey 84/2"     onView={() => openPDF('ec84', 'EC_Survey_84_2.pdf')} />
          <DocRow name="Registration Fee Receipt"                onView={() => openPDF('feeReceipt', 'RERA_Extension_fee_receipt.pdf')} />
        </DocSection>

        <DocSection title="QPR Supporting Documents — Q4 2025">
          <DocRow name="CA Certificate — Fund Utilisation Form Ex3"   onView={() => openPDF('caFundUtilisation', 'Form_Ex3_CA_Fund_Utilisation.pdf')} />
          <DocRow name="CA Certificate — Fund Required Form Ex4"      onView={() => openPDF('caFundRequired', 'Form_Ex4_CA_Fund_Required.pdf')} />
          <DocRow name="Engineer Certificate — Work Status Form Ex5"  onView={() => openPDF('engineerWorkStatus', 'Form_Ex5_Engineer_Work_Status.pdf')} />
          <DocRow name="Engineer Certificate — Pending Work Form Ex6" onView={() => openPDF('engineerPendingWork', 'Form_Ex6_Engineer_Pending_Work.pdf')} />
        </DocSection>

        <DocSection title="Extension Documents">
          <DocRow name="Affidavit for Extension Form Ex7" onView={() => openPDF('affidavitExtension', 'Form_Ex7_Affidavit.pdf')} />
          <DocRow name="Form B Affidavit Declaration"     onView={() => openPDF('formB', 'Form_B_Affidavit_Declaration.pdf')} />
          <DocRow name="Extension Application"            onView={() => openPDF('extensionScreenshot', 'RERA_Extension_Screenshot.pdf')} />
          <DocRow name="Supreme Court Order"              onView={() => openPDF('supremeCourtOrder', 'Supreme_Court_Order.pdf')} />
        </DocSection>

        <DocSection title="NOCs and Approvals">
          <DocRow name="CESCOM NOC"           onView={() => openPDF('cescomNoc', 'CESCOM_NOC.pdf')} />
          <DocRow name="Water Supply NOC"     onView={() => openPDF('waterNoc', 'Water_Supply_NOC.pdf')} />
          <DocRow name="Bank Account Details" onView={() => openImage('bankAccount', 'Bank_Account.jpeg')} />
        </DocSection>

        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Site Progress Photos</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {photoKeys.map(key => (
              <img
                key={key}
                src={divyaVillasImages[key] ?? fallbackPhotoSrc(key)}
                alt={key}
                className="w-full h-24 object-cover rounded-sm cursor-pointer border border-border hover:border-gold/50 transition-colors duration-150"
                onClick={() => openImage(key, `${key}.jpeg`)}
              />
            ))}
          </div>
        </div>

        <DocSection title="Certificates">
          <DocRow name="RERA Registration Certificate" onView={() => openPDF('reraCertificate', 'Divya_Villas_RERA_Certificate.pdf')} />
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-4 h-4 text-gray shrink-0" />
              <span className="text-off-white text-sm truncate">Vantis Compliance Certificate</span>
            </div>
            <Link
              href="/certificate/VG-2026-007034-0001"
              className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors duration-150 shrink-0 ml-3"
            >
              View <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </DocSection>

      </div>
    )
  }

  function renderSatellite() {
    if (project.id !== 'ozone-urbana') {
      return (
        <div className="bg-surface border border-border rounded-sm p-8 text-center">
          <Satellite className="w-8 h-8 text-gray mx-auto mb-3" />
          <div className="text-gray text-sm">Satellite verification available for flagged projects. This project has no active satellite review.</div>
        </div>
      )
    }

    const SAT_DATA = [
      { q: 'Q1 2021', declared: 20, observed: 14, caption: 'Site cleared, foundation only' },
      { q: 'Q2 2021', declared: 28, observed: 21, caption: 'Plinth level — limited vertical' },
      { q: 'Q3 2021', declared: 35, observed: 24, caption: 'Ground floor slab observed' },
      { q: 'Q4 2021', declared: 42, observed: 27, caption: 'Minimal upper-floor progress' },
      { q: 'Q1 2022', declared: 48, observed: 29, caption: 'Structure stalled' },
      { q: 'Q2 2022', declared: 52, observed: 30, caption: 'No new floors observed' },
      { q: 'Q3 2022', declared: 57, observed: 30, caption: 'Identical footprint to Q1 2022' },
      { q: 'Q4 2022', declared: 62, observed: 30, caption: 'Declared 62%· orbital reads ~30%' },
    ]

    return (
      <div className="space-y-6">
        {/* Phase 2 banner */}
        <div className="bg-gold/10 border border-gold/20 rounded-sm px-4 py-3">
          <p className="text-gold text-sm">
            Satellite verification cross-references developer-declared QPR progress against observed ground truth. Phase 2 capability — shown with representative imagery.
          </p>
        </div>

        {/* Declared vs Observed hero card */}
        <div className="bg-surface border border-border rounded-sm p-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-5">Declared vs Satellite-Observed (Q4 2022)</div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[10px] text-gray uppercase tracking-wide mb-2">Developer Declared</div>
              <div className="font-syne text-4xl font-bold text-off-white">62%</div>
            </div>
            <div>
              <div className="text-[10px] text-gray uppercase tracking-wide mb-2">Satellite Estimated</div>
              <div className="font-syne text-4xl font-bold text-amber">30%</div>
            </div>
            <div>
              <div className="text-[10px] text-gray uppercase tracking-wide mb-2">Variance</div>
              <div className="font-syne text-4xl font-bold text-red">32 pts</div>
              <div className="inline-flex items-center mt-1.5 px-2 py-0.5 bg-red/15 text-red text-[9px] font-mono rounded-sm border border-red/30 uppercase tracking-wider">
                Flagged for Review
              </div>
            </div>
          </div>
        </div>

        {/* Side-by-side imagery — SVG mock satellite */}
        <div className="grid grid-cols-2 gap-4">
          {/* Q1 2021 — Site cleared, foundation only */}
          <div>
            <div className="text-[10px] text-gray uppercase tracking-wide mb-2">Q1 2021</div>
            <div className="w-full h-52 border border-border rounded-sm overflow-hidden">
              <svg viewBox="0 0 500 208" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="satScanQ1" width="1" height="3" patternUnits="userSpaceOnUse">
                    <rect width="1" height="1" fill="rgba(255,255,255,0.018)"/>
                  </pattern>
                </defs>
                {/* Base earth */}
                <rect width="500" height="208" fill="#261810"/>
                {/* Vegetation patches */}
                <ellipse cx="55" cy="35" rx="52" ry="32" fill="#1C2E12"/>
                <ellipse cx="38" cy="50" rx="28" ry="20" fill="#213618"/>
                <ellipse cx="455" cy="30" rx="44" ry="28" fill="#1C2E12"/>
                <ellipse cx="472" cy="52" rx="24" ry="18" fill="#213618"/>
                <ellipse cx="462" cy="178" rx="36" ry="24" fill="#1C2E12"/>
                <ellipse cx="35" cy="175" rx="38" ry="26" fill="#1C2E12"/>
                <ellipse cx="240" cy="195" rx="30" ry="14" fill="#213818"/>
                {/* Cleared plot */}
                <polygon points="95,38 408,33 425,172 78,177" fill="#7A5530"/>
                {/* Soil texture variation */}
                <ellipse cx="200" cy="95" rx="65" ry="42" fill="#6A4A28" opacity="0.5"/>
                <ellipse cx="330" cy="125" rx="50" ry="32" fill="#855A38" opacity="0.35"/>
                <ellipse cx="260" cy="65" rx="55" ry="20" fill="#7E5832" opacity="0.3"/>
                {/* Access road */}
                <polygon points="0,92 98,88 98,114 0,116" fill="#3C3030"/>
                {/* Foundation slabs */}
                <rect x="138" y="78" width="48" height="32" fill="#8C8A80" rx="1"/>
                <rect x="192" y="78" width="48" height="32" fill="#888680" rx="1"/>
                <rect x="138" y="116" width="48" height="30" fill="#848278" rx="1"/>
                <rect x="192" y="116" width="48" height="30" fill="#7E7C74" rx="1"/>
                {/* Floor grid on slabs */}
                <line x1="162" y1="78" x2="162" y2="110" stroke="#70706A" strokeWidth="0.8" opacity="0.7"/>
                <line x1="216" y1="78" x2="216" y2="110" stroke="#70706A" strokeWidth="0.8" opacity="0.7"/>
                <line x1="138" y1="94" x2="240" y2="94" stroke="#70706A" strokeWidth="0.8" opacity="0.7"/>
                {/* Rebar stubs */}
                {[148,158,168,178,188,198,208,218,228].map((x, i) => (
                  <line key={i} x1={x} y1="78" x2={x} y2="73" stroke="#666660" strokeWidth="1" opacity="0.8"/>
                ))}
                {/* Materials pile */}
                <ellipse cx="320" cy="100" rx="28" ry="16" fill="#5C4A2E" opacity="0.9"/>
                <ellipse cx="328" cy="95" rx="16" ry="9" fill="#6A5838" opacity="0.8"/>
                {/* Excavation trench */}
                <path d="M 138 74 Q 200 68 252 72 Q 280 74 300 76" stroke="#2E1E08" strokeWidth="7" fill="none" opacity="0.6"/>
                {/* Survey boundary */}
                <polygon points="95,38 408,33 425,172 78,177" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.9"/>
                {/* Scan lines overlay */}
                <rect width="500" height="208" fill="url(#satScanQ1)" opacity="0.6"/>
                {/* Phase badge */}
                <rect x="7" y="7" width="90" height="16" rx="2" fill="rgba(201,168,76,0.14)" stroke="#C9A84C" strokeWidth="0.8"/>
                <text x="11" y="19" fontFamily="monospace" fontSize="8" fill="#C9A84C">PHASE 1 · 20%</text>
                {/* North */}
                <text x="476" y="20" fontFamily="monospace" fontSize="10" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
                <polygon points="476,24 473,33 476,30 479,33" fill="#C9A84C"/>
                <line x1="476" y1="33" x2="476" y2="38" stroke="#C9A84C" strokeWidth="1.2"/>
                {/* Scale bar */}
                <line x1="398" y1="196" x2="458" y2="196" stroke="#9090AA" strokeWidth="1"/>
                <line x1="398" y1="193" x2="398" y2="199" stroke="#9090AA" strokeWidth="1"/>
                <line x1="458" y1="193" x2="458" y2="199" stroke="#9090AA" strokeWidth="1"/>
                <text x="428" y="206" fontFamily="monospace" fontSize="6" fill="#9090AA" textAnchor="middle">50m</text>
                {/* Metadata */}
                <text x="8" y="204" fontFamily="monospace" fontSize="6.5" fill="#4A4A5A">12°58′22″N 77°41′08″E · CARTOSAT-3A · 0.28m GSD · Q1 2021</text>
              </svg>
            </div>
            <div className="text-[10px] text-gray mt-2 leading-relaxed">Declared: 20% · Site cleared, foundation only</div>
          </div>

          {/* Q4 2022 — 62% claimed, ~30% satellite-observed */}
          <div>
            <div className="text-[10px] text-gray uppercase tracking-wide mb-2">Q4 2022</div>
            <div className="w-full h-52 border border-border rounded-sm overflow-hidden">
              <svg viewBox="0 0 500 208" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="satScanQ2" width="1" height="3" patternUnits="userSpaceOnUse">
                    <rect width="1" height="1" fill="rgba(255,255,255,0.018)"/>
                  </pattern>
                </defs>
                {/* Base earth */}
                <rect width="500" height="208" fill="#261810"/>
                {/* Reduced vegetation (site cleared more) */}
                <ellipse cx="50" cy="33" rx="45" ry="27" fill="#1C2E12"/>
                <ellipse cx="455" cy="28" rx="40" ry="24" fill="#1C2E12"/>
                <ellipse cx="460" cy="180" rx="34" ry="22" fill="#1C2E12"/>
                <ellipse cx="32" cy="178" rx="32" ry="22" fill="#1C2E12"/>
                {/* Cleared plot */}
                <polygon points="92,36 408,31 426,174 76,178" fill="#7A5530"/>
                {/* Soil variation */}
                <ellipse cx="340" cy="130" rx="55" ry="35" fill="#6A4A28" opacity="0.4"/>
                <ellipse cx="370" cy="80" rx="40" ry="25" fill="#7A5030" opacity="0.35"/>
                {/* Access road */}
                <polygon points="0,90 95,86 95,112 0,115" fill="#3C3030"/>
                {/* BUILT STRUCTURE — T1 partial (only ~30% of site covered) */}
                {/* Tower block 1 — complete lower floors */}
                <rect x="105" y="62" width="138" height="102" fill="#9A9488" rx="1"/>
                {/* Roof grid */}
                <line x1="105" y1="95" x2="243" y2="95" stroke="#7E7C74" strokeWidth="0.8"/>
                <line x1="105" y1="128" x2="243" y2="128" stroke="#7E7C74" strokeWidth="0.8"/>
                <line x1="140" y1="62" x2="140" y2="164" stroke="#7E7C74" strokeWidth="0.8"/>
                <line x1="175" y1="62" x2="175" y2="164" stroke="#7E7C74" strokeWidth="0.8"/>
                <line x1="210" y1="62" x2="210" y2="164" stroke="#7E7C74" strokeWidth="0.8"/>
                {/* Building shadow */}
                <rect x="243" y="64" width="6" height="102" fill="#2A2018" opacity="0.7"/>
                <rect x="107" y="164" width="138" height="5" fill="#2A2018" opacity="0.5"/>
                {/* T2 stub — incomplete */}
                <rect x="255" y="88" width="62" height="55" fill="#8A8880" rx="1" opacity="0.75"/>
                <rect x="255" y="143" width="62" height="18" fill="#7A6A50" rx="1" opacity="0.5"/>
                {/* Scaffolding on T2 */}
                {[266,275,284,293,302,310].map((x, i) => (
                  <line key={i} x1={x} y1="86" x2={x} y2="162" stroke="#88887A" strokeWidth="1" opacity="0.55"/>
                ))}
                {[96,108,120,132,144,156].map((y, i) => (
                  <line key={i} x1="254" y1={y} x2="320" y2={y} stroke="#88887A" strokeWidth="0.8" opacity="0.45"/>
                ))}
                {/* BARE SITE — right half, showing the gap */}
                {/* Material dumps on bare sections */}
                <ellipse cx="368" cy="100" rx="30" ry="18" fill="#5C4A2E" opacity="0.85"/>
                <ellipse cx="378" cy="94" rx="18" ry="10" fill="#6A5838" opacity="0.75"/>
                <ellipse cx="355" cy="152" rx="24" ry="15" fill="#5C4A2E" opacity="0.7"/>
                <ellipse cx="410" cy="145" rx="18" ry="12" fill="#5A4828" opacity="0.65"/>
                {/* Red "BARE SITE" annotation box */}
                <rect x="335" y="55" width="82" height="110" fill="rgba(231,76,60,0.10)" stroke="#E74C3C" strokeWidth="1" strokeDasharray="5 3"/>
                <text x="376" y="107" fontFamily="monospace" fontSize="8" fill="#E74C3C" textAnchor="middle">BARE</text>
                <text x="376" y="118" fontFamily="monospace" fontSize="8" fill="#E74C3C" textAnchor="middle">SITE</text>
                {/* Survey boundary */}
                <polygon points="92,36 408,31 426,174 76,178" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeDasharray="8 4" opacity="0.9"/>
                {/* Scan lines */}
                <rect width="500" height="208" fill="url(#satScanQ2)" opacity="0.6"/>
                {/* Satellite observed badge */}
                <rect x="7" y="7" width="115" height="16" rx="2" fill="rgba(231,76,60,0.14)" stroke="#E74C3C" strokeWidth="0.8"/>
                <text x="11" y="19" fontFamily="monospace" fontSize="8" fill="#E74C3C">SAT OBSERVED · 30%</text>
                {/* QPR claimed label */}
                <rect x="7" y="27" width="94" height="14" rx="2" fill="rgba(107,107,136,0.2)" stroke="#6B6B88" strokeWidth="0.8"/>
                <text x="11" y="38" fontFamily="monospace" fontSize="7" fill="#9090AA">QPR CLAIMED · 62%</text>
                {/* FLAGGED badge */}
                <rect x="390" y="7" width="102" height="16" rx="2" fill="rgba(231,76,60,0.18)" stroke="#E74C3C" strokeWidth="0.8"/>
                <text x="394" y="19" fontFamily="monospace" fontSize="8" fill="#E74C3C">⚑ VANTIS FLAGGED</text>
                {/* North */}
                <text x="476" y="20" fontFamily="monospace" fontSize="10" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
                <polygon points="476,24 473,33 476,30 479,33" fill="#C9A84C"/>
                <line x1="476" y1="33" x2="476" y2="38" stroke="#C9A84C" strokeWidth="1.2"/>
                {/* Scale bar */}
                <line x1="398" y1="196" x2="458" y2="196" stroke="#9090AA" strokeWidth="1"/>
                <line x1="398" y1="193" x2="398" y2="199" stroke="#9090AA" strokeWidth="1"/>
                <line x1="458" y1="193" x2="458" y2="199" stroke="#9090AA" strokeWidth="1"/>
                <text x="428" y="206" fontFamily="monospace" fontSize="6" fill="#9090AA" textAnchor="middle">50m</text>
                {/* Metadata */}
                <text x="8" y="204" fontFamily="monospace" fontSize="6.5" fill="#4A4A5A">12°58′22″N 77°41′08″E · CARTOSAT-3A · 0.28m GSD · Q4 2022</text>
              </svg>
            </div>
            <div className="text-[10px] text-gray mt-2 leading-relaxed">Declared: 62% · Minimal vertical structure observed</div>
          </div>
        </div>

        {/* Quarter-by-quarter table */}
        <div className="bg-surface border border-border rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface2">
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">Quarterly Divergence Analysis</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  {['Quarter', 'QPR Declared %', 'Satellite Obs. %', 'Δ Variance', 'Flag'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-[0.1em] text-gray">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAT_DATA.map(row => {
                  const delta = row.declared - row.observed
                  const isFlag = delta >= 10
                  return (
                    <tr key={row.q} className="border-b border-border/40 last:border-0 hover:bg-surface2/50 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-mono text-off-white">{row.q}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-off-white">{row.declared}%</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-amber">{row.observed}%</td>
                      <td className="px-4 py-2.5 text-xs font-mono font-bold" style={{ color: isFlag ? '#E74C3C' : delta >= 5 ? '#F39C12' : '#2ECC71' }}>
                        -{delta} pts
                      </td>
                      <td className="px-4 py-2.5">
                        {isFlag && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-red/15 text-red border border-red/30 rounded-sm uppercase">DIVERGENCE</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSS 3D massing */}
        <div className="bg-surface border border-border rounded-sm p-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-5">Structural Massing — Expected vs Observed</div>
          <div className="flex gap-16 justify-center items-end" style={{ perspective: '600px' }}>
            <div className="text-center">
              <div
                className="w-20 h-36 border-2 border-gold bg-gold/5 mx-auto transition-all duration-700"
                style={{ transform: 'rotateX(15deg) rotateY(-20deg)', transformStyle: 'preserve-3d' }}
              />
              <div className="text-xs text-gold mt-3 font-mono">Expected at 62%</div>
              <div className="text-[10px] text-gray mt-0.5">~18 floors</div>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-14 border-2 border-amber bg-amber/5 mx-auto transition-all duration-700"
                style={{ transform: 'rotateX(15deg) rotateY(-20deg)', transformStyle: 'preserve-3d' }}
              />
              <div className="text-xs text-amber mt-3 font-mono">Satellite Observed</div>
              <div className="text-[10px] text-gray mt-0.5">~5–6 floors</div>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray mt-5 leading-relaxed">
            Structural massing — expected vs satellite-observed.
          </p>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-gray leading-relaxed">
          Production deployment integrates ISRO Cartosat and commercial high-resolution imagery with quarter-over-quarter change detection.
        </p>
      </div>
    )
  }

  /* ---- Render ---- */
  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* Back */}
      <Link
        href="/govern/projects"
        className="inline-flex items-center gap-1.5 text-xs text-gray hover:text-gold transition-colors duration-150 mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Registry
      </Link>

      {/* Project header */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-syne text-xl sm:text-2xl text-off-white font-bold leading-tight mb-1">
              {project.name}
            </h1>
            <div className="font-mono text-gold text-xs mb-1.5">{project.rera}</div>
            <div className="text-gray text-xs">{project.developer_name} · {project.location}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`inline-flex items-center gap-1.5 text-xs ${statusColor(project.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(project.status)}`} />
              {project.status}
            </span>
            <div className="text-center">
              <div className={`font-syne text-3xl font-bold leading-none ${riskColor(project.risk_score)}`}>
                {project.risk_score}
              </div>
              <div className="text-gray text-[10px] mt-0.5">Risk score</div>
            </div>
          </div>
        </div>

        {/* Risk bar */}
        <div className="mt-4 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${riskBarColor(project.risk_score)}`}
            style={{ width: `${project.risk_score}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-0 border-b border-border mb-6 scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors duration-150 -mb-px ${
              activeTab === id
                ? 'border-gold text-gold'
                : 'border-transparent text-gray hover:text-gold-light'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview'   && renderOverview()}
        {activeTab === 'qpr'        && renderQPR()}
        {activeTab === 'financial'  && renderFinancial()}
        {activeTab === 'litigation' && renderLitigation()}
        {activeTab === 'timeline'   && renderTimeline()}
        {activeTab === 'actions'    && renderActions()}
        {activeTab === 'documents'  && renderDocuments()}
        {activeTab === 'satellite'  && renderSatellite()}
      </div>
    </div>
  )
}
