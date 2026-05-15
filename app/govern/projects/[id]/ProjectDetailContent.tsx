'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, Building2, FileText, TrendingDown,
  Scale, AlertTriangle, Settings, CheckCircle,
  ChevronRight, XCircle, FileX, FolderOpen, ExternalLink,
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

/* ---------- Document data (Divya Villas only) ---------- */
const DOC_BASE = '/documents/divya-villas'

const REGISTRATION_DOCS = [
  { name: 'Project Application Form',           file: 'Divya Villas RERA application.pdf' },
  { name: 'Title Documents — Survey 83/2 and 84/2', file: 'EC from 01042023 to 21112025 Divya Villas-Merged.pdf' },
  { name: 'CA Certificate — Project Cost',      file: 'Form Ex3 C A Certificate For Fund Utilization Divya Villas-Compressed.pdf' },
  { name: 'Engineer Certificate — Land Area',   file: 'Form Ex5 Engineer Certificate Project Ext Divya Villas.pdf' },
  { name: 'Sanctioned Building Plan',           file: 'Plan Divya Villas.pdf' },
  { name: 'Encumbrance Certificate Survey 83/2',file: 'EC Sy No. 83 2 01042023 to 21112025.pdf' },
  { name: 'Encumbrance Certificate Survey 84/2',file: 'EC Sy No. 84 2 01042023 to 21112025.pdf' },
  { name: 'Registration Fee Receipt',           file: 'RE1225021623111714-RERA Extension fee paid receipt.pdf' },
]

const QPR_DOCS = [
  { name: 'CA Certificate — Fund Utilisation Form Ex3', file: 'Form Ex3 C A Certificate For Fund Utilization Divya Villas-Compressed.pdf' },
  { name: 'CA Certificate — Fund Required Form Ex4',    file: 'Form Ex 4 C A Certificate For Fund Required Divya Villas-Compressed.pdf' },
  { name: 'Engineer Certificate — Work Status Form Ex5',file: 'Form Ex5 Engineer Certificate Project Ext Divya Villas.pdf' },
  { name: 'Engineer Certificate — Pending Work Form Ex6',file: 'Form Ex6 Engineer Certificate Project Ext Divya Villas.pdf' },
]

const EXTENSION_DOCS = [
  { name: 'Affidavit for Extension Form Ex7',  file: 'Form Ex7 Affidavit for Extension Divya Villas.pdf' },
  { name: 'Form B Affidavit Declaration',      file: 'Form B Affidavit Cum Declaration Divya Villas.pdf' },
  { name: 'Extension Application',             file: 'Divya Villas RERA Screenshot-01.12.2025 to 23.12.2025-Extension.pdf' },
  { name: 'Supreme Court Order',               file: 'Divya Villas Supreme Court Order.pdf' },
]

const NOC_DOCS = [
  { name: 'CESCOM NOC',          file: 'Divya Villas CESCOM NOC.pdf' },
  { name: 'Water Supply NOC',    file: 'Divya Villas Water supply Noc.pdf' },
  { name: 'Bank Account Details',file: 'Divya Villas Bank Account.jpeg' },
]

const PHOTOS = [
  '1 Road.jpeg', '2 Road.jpeg', '3 Road.jpeg', '4 Site.jpeg',
  '5 Site.jpeg', '6 Road.jpeg', '7 Site.jpeg', '8 Udrain.jpeg',
  '9 Layout.jpeg', '10 Park.jpeg', '11 Layout.jpeg', '12 Borewell.jpeg',
  '13 Street light.jpeg',
]

/* ---------- Tabs ---------- */
const TABS = [
  { id: 'overview',   label: 'Overview',     icon: Building2 },
  { id: 'qpr',        label: 'QPR History',  icon: FileText },
  { id: 'financial',  label: 'Financial',    icon: TrendingDown },
  { id: 'litigation', label: 'Litigation',   icon: Scale },
  { id: 'timeline',   label: 'Risk Timeline',icon: AlertTriangle },
  { id: 'actions',    label: 'Actions',      icon: Settings },
  { id: 'documents',  label: 'Documents',    icon: FolderOpen },
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

    const openDoc = (file: string) =>
      window.open(`${DOC_BASE}/${encodeURIComponent(file)}`, '_blank')

    function DocSection({ title, docs }: { title: string; docs: { name: string; file: string }[] }) {
      return (
        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">{title}</div>
          <div className="border border-border rounded-sm overflow-hidden">
            {docs.map((doc, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < docs.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-gray shrink-0" />
                  <span className="text-off-white text-sm truncate">{doc.name}</span>
                </div>
                <button
                  onClick={() => openDoc(doc.file)}
                  className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors duration-150 shrink-0 ml-3"
                >
                  View <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">

        {/* Green banner */}
        <div className="bg-green/10 border border-green/20 rounded-sm px-4 py-3 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-green shrink-0" />
          <span className="text-green text-sm font-medium">
            All required documents submitted — 29 documents across 6 categories.
          </span>
        </div>

        <DocSection title="Registration Documents" docs={REGISTRATION_DOCS} />
        <DocSection title="QPR Supporting Documents — Q4 2025" docs={QPR_DOCS} />
        <DocSection title="Extension Documents" docs={EXTENSION_DOCS} />
        <DocSection title="NOCs and Approvals" docs={NOC_DOCS} />

        {/* Site Progress Photos */}
        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Site Progress Photos</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PHOTOS.map(photo => (
              <button
                key={photo}
                onClick={() => window.open(`${DOC_BASE}/${encodeURIComponent(photo)}`, '_blank')}
                className="relative aspect-square overflow-hidden rounded-sm border border-border hover:border-gold/50 transition-colors duration-150"
              >
                <Image
                  src={`${DOC_BASE}/${encodeURIComponent(photo)}`}
                  alt={photo.replace(/\.[^.]+$/, '').replace(/_/g, ' ')}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Certificates */}
        <div>
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Certificates</div>
          <div className="border border-border rounded-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-gray shrink-0" />
                <span className="text-off-white text-sm truncate">RERA Registration Certificate</span>
              </div>
              <button
                onClick={() => openDoc('PRMKARERA1268378PR180924007034 Divya Villas RERA Certificate.pdf')}
                className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors duration-150 shrink-0 ml-3"
              >
                View <ExternalLink className="w-3 h-3" />
              </button>
            </div>
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
          </div>
        </div>
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
      </div>
    </div>
  )
}
