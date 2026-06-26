'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertCircle, ChevronDown, ChevronUp, FileText, X } from 'lucide-react'

type FilterTab = 'all' | 'filed' | 'hearing_scheduled' | 'order_passed' | 'resolved'

interface Complaint {
  id: string
  project_id: string
  project_name: string
  filed_date: string
  category: string
  status: 'PENDING' | 'RESOLVED'
  description: string
  amount_at_risk_lakh: number
  assigned_officer: string
  hearing_date: string | null
  resolution_date?: string
  resolution_summary?: string
}

const COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2024-001',
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    filed_date: '2024-02-14',
    category: 'Possession Delay',
    status: 'PENDING',
    description: 'Possession promised by December 2021, still not received. Developer has stopped responding.',
    amount_at_risk_lakh: 48.5,
    assigned_officer: 'legal@krera.gov.in',
    hearing_date: '2026-05-28',
  },
  {
    id: 'CMP-2024-002',
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    filed_date: '2024-03-22',
    category: 'Possession Delay',
    status: 'PENDING',
    description: 'Flat booked in 2018. EMI paid for 6 years. No possession. Builder not reachable.',
    amount_at_risk_lakh: 62.0,
    assigned_officer: 'legal@krera.gov.in',
    hearing_date: '2026-05-28',
  },
  {
    id: 'CMP-2024-003',
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    filed_date: '2024-04-10',
    category: 'Refund Demand',
    status: 'PENDING',
    description: 'Requesting full refund with interest at 10.85% p.a. as per RERA Section 18.',
    amount_at_risk_lakh: 55.0,
    assigned_officer: 'legal@krera.gov.in',
    hearing_date: '2026-06-04',
  },
  {
    id: 'CMP-2023-001',
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    filed_date: '2023-08-15',
    category: 'Possession Delay',
    status: 'RESOLVED',
    description: 'Possession delay of 3 years. Settled with compensation.',
    amount_at_risk_lakh: 41.0,
    assigned_officer: 'legal@krera.gov.in',
    hearing_date: null,
    resolution_date: '2024-01-20',
    resolution_summary: 'Developer paid compensation of Rs.3.2 lakh. Possession agreement signed.',
  },
  {
    id: 'CMP-2025-001',
    project_id: 'skylark-arcadia',
    project_name: 'Skylark Arcadia',
    filed_date: '2025-01-08',
    category: 'Construction Defects',
    status: 'PENDING',
    description: 'Seepage in flat on 4th floor. Developer not addressing despite multiple complaints.',
    amount_at_risk_lakh: 18.5,
    assigned_officer: 'technical@krera.gov.in',
    hearing_date: '2026-05-30',
  },
  {
    id: 'CMP-2025-002',
    project_id: 'skylark-arcadia',
    project_name: 'Skylark Arcadia',
    filed_date: '2025-03-14',
    category: 'Possession Delay',
    status: 'PENDING',
    description: 'Completion date September 2026 now in doubt. No construction progress visible for 2 months.',
    amount_at_risk_lakh: 22.0,
    assigned_officer: 'technical@krera.gov.in',
    hearing_date: '2026-06-11',
  },
  {
    id: 'CMP-2023-002',
    project_id: 'skylark-arcadia',
    project_name: 'Skylark Arcadia',
    filed_date: '2023-11-20',
    category: 'Amenity Deficiency',
    status: 'RESOLVED',
    description: 'Promised clubhouse not constructed as per agreement.',
    amount_at_risk_lakh: 8.0,
    assigned_officer: 'technical@krera.gov.in',
    hearing_date: null,
    resolution_date: '2024-04-15',
    resolution_summary: 'Developer committed to completing clubhouse by December 2026. Affidavit filed.',
  },
]

const ANON: Record<string, string> = {
  'CMP-2024-001': 'Homebuyer 001',
  'CMP-2024-002': 'Homebuyer 002',
  'CMP-2024-003': 'Homebuyer 003',
  'CMP-2023-001': 'Homebuyer 004',
  'CMP-2025-001': 'Homebuyer 005',
  'CMP-2025-002': 'Homebuyer 006',
  'CMP-2023-002': 'Homebuyer 007',
}

const TODAY = new Date('2026-05-13')

function daysPending(filedDate: string, resolvedDate?: string): number {
  const end = resolvedDate ? new Date(resolvedDate) : TODAY
  const start = new Date(filedDate)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function tabOf(c: Complaint): FilterTab {
  if (c.status === 'RESOLVED') return 'resolved'
  if (c.hearing_date) return 'hearing_scheduled'
  return 'filed'
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusBadgeColor(c: Complaint): string {
  if (c.status === 'RESOLVED') return 'text-green'
  if (c.hearing_date) return 'text-blue'
  return 'text-amber'
}
function statusBadgeDot(c: Complaint): string {
  if (c.status === 'RESOLVED') return 'bg-green'
  if (c.hearing_date) return 'bg-blue'
  return 'bg-amber'
}

function statusLabel(c: Complaint): string {
  if (c.status === 'RESOLVED') return 'Resolved'
  if (c.hearing_date) return 'Hearing Scheduled'
  return 'Filed'
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',               label: 'All' },
  { key: 'filed',             label: 'Filed' },
  { key: 'hearing_scheduled', label: 'Hearing Scheduled' },
  { key: 'order_passed',      label: 'Order Passed' },
  { key: 'resolved',          label: 'Resolved' },
]

export default function ComplaintManagement() {
  const [activeTab,     setActiveTab]     = useState<FilterTab>('all')
  const [expandedId,    setExpandedId]    = useState<string | null>(null)
  const [scheduleModal, setScheduleModal] = useState<{ id: string; date: string } | null>(null)
  const [orderModal,    setOrderModal]    = useState<{ id: string; text: string } | null>(null)

  const tabCounts = useMemo(() => {
    const counts: Record<FilterTab, number> = {
      all: COMPLAINTS.length, filed: 0, hearing_scheduled: 0, order_passed: 0, resolved: 0,
    }
    for (const c of COMPLAINTS) counts[tabOf(c)]++
    return counts
  }, [])

  const filtered = useMemo(
    () => activeTab === 'all' ? COMPLAINTS : COMPLAINTS.filter(c => tabOf(c) === activeTab),
    [activeTab]
  )

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col min-h-full text-off-white">

      {/* Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-border shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">
          K-RERA · Karnataka Real Estate Regulatory Authority · Adjudication
        </div>
        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white leading-none">
          Complaint Management
        </h1>
      </div>

      <div className="px-6 sm:px-8 py-6">

        <p className="text-gray text-xs mb-6">Track, schedule hearings, and record orders</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="bg-surface border border-border rounded-sm p-4 sm:p-5 text-center hover:border-gold/30 transition-all"
          >
            <div className="font-syne text-2xl sm:text-3xl font-bold text-off-white">17</div>
            <div className="text-gray text-xs mt-1">Total Complaints</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="bg-surface border border-amber/20 rounded-sm p-4 sm:p-5 text-center hover:border-gold/30 transition-all"
          >
            <div className="font-syne text-2xl sm:text-3xl font-bold text-amber">14</div>
            <div className="text-gray text-xs mt-1">Pending</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
            className="bg-surface border border-green/20 rounded-sm p-4 sm:p-5 text-center hover:border-gold/30 transition-all"
          >
            <div className="font-syne text-2xl sm:text-3xl font-bold text-green">3</div>
            <div className="text-gray text-xs mt-1">Resolved</div>
          </motion.div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap transition-colors duration-150 flex items-center gap-1.5 ${
                activeTab === t.key
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'bg-surface text-gray border border-border hover:text-off-white'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${activeTab === t.key ? 'bg-gold/20 text-gold' : 'bg-surface2 text-gray'}`}>
                {tabCounts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block bg-surface border border-border rounded-sm overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface2">
                {['Ref Number', 'Complainant', 'Project', 'Nature', 'Date Filed', 'Days Pending', 'Status', 'Next Hearing', 'Actions', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray whitespace-nowrap">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.flatMap(c => {
                const days = daysPending(c.filed_date, c.resolution_date)
                const isExpanded = expandedId === c.id

                const mainRow = (
                  <tr
                    key={c.id}
                    className={`border-b border-border cursor-pointer hover:bg-surface2/60 transition-colors duration-150 ${isExpanded ? 'bg-surface2/60' : ''}`}
                    onClick={() => toggleExpand(c.id)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gold">{c.id}</span>
                    </td>
                    <td className="px-4 py-3 text-off-white text-xs">{ANON[c.id]}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/govern/projects/${c.project_id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-xs text-off-white hover:text-gold transition-colors duration-150"
                      >
                        {c.project_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray text-xs">{c.category}</td>
                    <td className="px-4 py-3 text-gray text-xs whitespace-nowrap">{fmtDate(c.filed_date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs font-bold ${days > 60 && c.status === 'PENDING' ? 'text-red' : 'text-off-white'}`}>
                          {days}d
                        </span>
                        {days > 60 && c.status === 'PENDING' && (
                          <AlertCircle className="w-3.5 h-3.5 text-red shrink-0" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBadgeDot(c)}`} />
                        <span className={`text-[9px] font-mono font-medium ${statusBadgeColor(c)}`}>{statusLabel(c)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray text-xs whitespace-nowrap">{fmtDate(c.hearing_date)}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {c.status === 'PENDING' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setScheduleModal({ id: c.id, date: '' })}
                            className="text-[10px] px-2 py-1 bg-surface2 text-gold border border-gold/20 rounded-sm hover:bg-gold/10 transition-colors duration-150 whitespace-nowrap"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => setOrderModal({ id: c.id, text: '' })}
                            className="text-[10px] px-2 py-1 bg-surface2 text-gray border border-border rounded-sm hover:text-off-white transition-colors duration-150 whitespace-nowrap"
                          >
                            Record Order
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray" />
                        : <ChevronDown className="w-4 h-4 text-gray" />}
                    </td>
                  </tr>
                )

                if (!isExpanded) return [mainRow]

                const detailRow = (
                  <tr key={`${c.id}-detail`} className="border-b border-border bg-surface2/40">
                    <td colSpan={10} className="px-6 py-4">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2">
                          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Complaint Description</div>
                          <p className="text-off-white text-xs leading-relaxed mb-4">{c.description}</p>
                          {c.resolution_summary && (
                            <div className="border-l-2 border-green pl-3">
                              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Resolution</div>
                              <p className="text-green text-xs leading-relaxed">{c.resolution_summary}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Amount at Risk</div>
                            <div className="font-mono text-sm font-bold text-amber">₹{c.amount_at_risk_lakh} Lakh</div>
                          </div>
                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Assigned Officer</div>
                            <div className="text-xs text-off-white">{c.assigned_officer}</div>
                          </div>
                          {c.resolution_date && (
                            <div>
                              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Resolved On</div>
                              <div className="text-xs text-green">{fmtDate(c.resolution_date)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )

                return [mainRow, detailRow]
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3 mb-6">
          {filtered.map((c, index) => {
            const days = daysPending(c.filed_date, c.resolution_date)
            const isExpanded = expandedId === c.id
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                className="bg-surface border border-border rounded-sm overflow-hidden hover:border-gold/30 transition-all"
              >
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(c.id)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-mono text-xs text-gold mb-0.5">{c.id}</div>
                      <div className="text-off-white text-sm font-medium">{ANON[c.id]}</div>
                      <div className="text-gray text-xs">{c.project_name}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBadgeDot(c)}`} />
                        <span className={`text-[9px] font-mono font-medium ${statusBadgeColor(c)}`}>{statusLabel(c)}</span>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray" />
                        : <ChevronDown className="w-4 h-4 text-gray" />}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">Nature</div>
                      <div className="text-xs text-off-white">{c.category}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">Days</div>
                      <div className="flex items-center gap-1">
                        <span className={`font-mono text-xs font-bold ${days > 60 && c.status === 'PENDING' ? 'text-red' : 'text-off-white'}`}>
                          {days}d
                        </span>
                        {days > 60 && c.status === 'PENDING' && <AlertCircle className="w-3 h-3 text-red" />}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">Next Hearing</div>
                      <div className="text-xs text-off-white">{fmtDate(c.hearing_date)}</div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    <p className="text-off-white text-xs leading-relaxed">{c.description}</p>
                    {c.resolution_summary && (
                      <div className="border-l-2 border-green pl-3">
                        <p className="text-green text-xs leading-relaxed">{c.resolution_summary}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray">
                      <span>₹{c.amount_at_risk_lakh} Lakh at risk</span>
                      <span className="truncate ml-2">{c.assigned_officer}</span>
                    </div>
                    {c.status === 'PENDING' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => setScheduleModal({ id: c.id, date: '' })}
                          className="flex-1 text-xs py-1.5 bg-surface2 text-gold border border-gold/20 rounded-sm hover:bg-gold/10 transition-colors duration-150"
                        >
                          Schedule Hearing
                        </button>
                        <button
                          onClick={() => setOrderModal({ id: c.id, text: '' })}
                          className="flex-1 text-xs py-1.5 bg-surface2 text-gray border border-border rounded-sm hover:text-off-white transition-colors duration-150"
                        >
                          Record Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Schedule Hearing Modal */}
        {scheduleModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
            onClick={() => setScheduleModal(null)}
          >
            <div
              className="bg-surface border border-border rounded-sm p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-syne text-lg text-off-white">Schedule Hearing</h3>
                <button onClick={() => setScheduleModal(null)}>
                  <X className="w-4 h-4 text-gray hover:text-off-white transition-colors duration-150" />
                </button>
              </div>
              <p className="text-xs text-gray mb-4">
                <span className="font-mono text-gold">{scheduleModal.id}</span>
                {' — '}{ANON[scheduleModal.id]}
              </p>
              <div className="mb-6">
                <label className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray block mb-2">
                  Hearing Date
                </label>
                <input
                  type="date"
                  value={scheduleModal.date}
                  onChange={e => setScheduleModal({ ...scheduleModal, date: e.target.value })}
                  className="w-full bg-surface2 border border-border rounded-sm px-3 py-2 text-sm text-off-white focus:outline-none focus:border-gold/50 [color-scheme:dark]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setScheduleModal(null)}
                  className="flex-1 py-2 text-xs text-gray border border-border rounded-sm hover:text-off-white transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setScheduleModal(null)}
                  className="flex-1 py-2 text-xs bg-gold/15 text-gold border border-gold/30 rounded-sm hover:bg-gold/20 transition-colors duration-150"
                >
                  Confirm Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Order Modal */}
        {orderModal && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
            onClick={() => setOrderModal(null)}
          >
            <div
              className="bg-surface border border-border rounded-sm p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-syne text-lg text-off-white">Record Order</h3>
                <button onClick={() => setOrderModal(null)}>
                  <X className="w-4 h-4 text-gray hover:text-off-white transition-colors duration-150" />
                </button>
              </div>
              <p className="text-xs text-gray mb-4">
                <span className="font-mono text-gold">{orderModal.id}</span>
                {' — '}{ANON[orderModal.id]}
              </p>
              <div className="mb-6">
                <label className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray block mb-2">
                  Order Summary
                </label>
                <textarea
                  value={orderModal.text}
                  onChange={e => setOrderModal({ ...orderModal, text: e.target.value })}
                  rows={4}
                  placeholder="Enter the order details and any directions issued..."
                  className="w-full bg-surface2 border border-border rounded-sm px-3 py-2 text-sm text-off-white focus:outline-none focus:border-gold/50 resize-none placeholder:text-gray/50"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setOrderModal(null)}
                  className="flex-1 py-2 text-xs text-gray border border-border rounded-sm hover:text-off-white transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setOrderModal(null)}
                  className="flex-1 py-2 text-xs bg-gold/15 text-gold border border-gold/30 rounded-sm hover:bg-gold/20 transition-colors duration-150"
                >
                  Save Order
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
