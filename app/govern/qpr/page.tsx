'use client'

import { useState, useMemo } from 'react'
import { BarChart2, CheckCircle, AlertTriangle, XCircle, FileText } from 'lucide-react'
import qprData from '@/data/qpr.json'

interface QPREntry {
  status: string
  filed_date: string | null
  completion_pct: number | null
}

interface QPRRow {
  id: string
  project_id: string
  project_name: string
  developer_name: string
  quarter: string
  entry: QPREntry
}

const TODAY = new Date('2026-05-13')
const CURRENT_QUARTER = 'Q1 2026'

function getDueDate(quarter: string): Date {
  const [q, year] = quarter.split(' ')
  const y = parseInt(year)
  if (q === 'Q1') return new Date(`${y}-01-15`)
  if (q === 'Q2') return new Date(`${y}-04-15`)
  if (q === 'Q3') return new Date(`${y}-07-15`)
  return new Date(`${y}-10-15`)
}

function daysOverdue(quarter: string, entry: QPREntry): number {
  if (entry.status !== 'MISSED' && entry.status !== 'LATE') return 0
  const due = getDueDate(quarter)
  const ref = entry.filed_date ? new Date(entry.filed_date) : TODAY
  return Math.max(0, Math.floor((ref.getTime() - due.getTime()) / 86_400_000))
}

function penalty(quarter: string, entry: QPREntry): number {
  if (entry.status !== 'MISSED') return 0
  return daysOverdue(quarter, entry) * 25_000
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtInr(n: number) {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ON_TIME') return (
    <span className="flex items-center gap-1 text-green text-xs font-medium">
      <CheckCircle className="w-3.5 h-3.5" /> On Time
    </span>
  )
  if (status === 'LATE') return (
    <span className="flex items-center gap-1 text-amber text-xs font-medium">
      <AlertTriangle className="w-3.5 h-3.5" /> Late
    </span>
  )
  if (status === 'MISSED') return (
    <span className="flex items-center gap-1 text-red text-xs font-medium">
      <XCircle className="w-3.5 h-3.5" /> Missed
    </span>
  )
  return <span className="text-gray text-xs">N/A</span>
}

// Flatten all QPR submissions into rows
const ALL_ROWS: QPRRow[] = qprData.submissions.flatMap(sub =>
  qprData.quarters.map(q => {
    const key = q.toLowerCase().replace(' ', '_') as keyof typeof sub
    const entry = sub[key] as unknown as QPREntry
    return {
      id: `${sub.project_id}-${q}`,
      project_id: sub.project_id,
      project_name: sub.project_name,
      developer_name: sub.developer_name,
      quarter: q,
      entry,
    }
  })
)

// Current quarter stats
const currentRows = ALL_ROWS.filter(r => r.quarter === CURRENT_QUARTER && r.entry.status !== 'NA')
const onTimeCount = currentRows.filter(r => r.entry.status === 'ON_TIME').length
const defaultingCount = currentRows.filter(r => r.entry.status === 'MISSED' || r.entry.status === 'LATE').length

type FilterTab = 'ALL' | 'ON_TIME' | 'LATE' | 'MISSED'

export default function QPRTracker() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [batchModal, setBatchModal] = useState(false)

  const displayRows = useMemo(() =>
    activeFilter === 'ALL'
      ? ALL_ROWS
      : ALL_ROWS.filter(r => r.entry.status === activeFilter)
  , [activeFilter])

  const missedRows = ALL_ROWS.filter(r => r.entry.status === 'MISSED')
  const totalPenalty = missedRows.reduce((s, r) => s + penalty(r.quarter, r.entry), 0)

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    const missedIds = displayRows
      .filter(r => r.entry.status === 'MISSED')
      .map(r => r.id)
    const allSelected = missedIds.every(id => selected.has(id))
    setSelected(allSelected ? new Set() : new Set(missedIds))
  }

  const selectedRows = displayRows.filter(r => selected.has(r.id))
  const hasMissedSelected = selectedRows.some(r => r.entry.status === 'MISSED')

  const TABS: { id: FilterTab; label: string; count: number }[] = [
    { id: 'ALL',     label: 'All',     count: ALL_ROWS.filter(r => r.entry.status !== 'NA').length },
    { id: 'ON_TIME', label: 'On Time', count: ALL_ROWS.filter(r => r.entry.status === 'ON_TIME').length },
    { id: 'LATE',    label: 'Late',    count: ALL_ROWS.filter(r => r.entry.status === 'LATE').length },
    { id: 'MISSED',  label: 'Missed',  count: ALL_ROWS.filter(r => r.entry.status === 'MISSED').length },
  ]

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white">QPR Compliance Tracker</h1>
          <p className="text-gray text-xs mt-1">Quarterly Progress Reports · {qprData.quarters.length} quarters tracked</p>
        </div>
        <BarChart2 className="w-6 h-6 text-gray hidden sm:block" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-off-white">{currentRows.length}</div>
          <div className="text-gray text-xs mt-1">Projects Due This Quarter</div>
          <div className="text-[10px] text-gray-light mt-0.5">{CURRENT_QUARTER}</div>
        </div>
        <div className="bg-surface border border-green/20 rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-green">{onTimeCount}</div>
          <div className="text-gray text-xs mt-1">Filed On Time</div>
          <div className="text-[10px] text-green/60 mt-0.5">Q1 2026</div>
        </div>
        <div className="bg-surface border border-red/20 rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-red">{defaultingCount}</div>
          <div className="text-gray text-xs mt-1">Defaulting</div>
          <div className="text-[10px] text-red/60 mt-0.5">Q1 2026</div>
        </div>
      </div>

      {/* Total penalty callout */}
      {totalPenalty > 0 && (
        <div className="bg-red/5 border border-red/20 rounded-sm p-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-red text-xs font-semibold uppercase tracking-widest mb-0.5">Total Penalty Accrued Across All Defaulters</div>
            <div className="font-syne text-2xl font-bold text-red">{fmtInr(totalPenalty)}</div>
          </div>
          <div className="text-gray text-xs">@ Rs.25,000 per project per day</div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-0 border-b border-border mb-4 overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveFilter(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors duration-150 -mb-px ${
              activeFilter === id
                ? id === 'MISSED' ? 'border-red text-red'
                  : id === 'LATE'    ? 'border-amber text-amber'
                  : id === 'ON_TIME' ? 'border-green text-green'
                  : 'border-gold text-gold'
                : 'border-transparent text-gray hover:text-gold-light'
            }`}
          >
            {label}
            <span className="font-mono text-[10px] opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-surface border border-border rounded-sm overflow-hidden mb-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface2">
              <th className="px-4 py-3 w-8">
                <input
                  type="checkbox"
                  className="accent-gold w-3.5 h-3.5"
                  onChange={toggleAll}
                  checked={
                    displayRows.filter(r => r.entry.status === 'MISSED').length > 0 &&
                    displayRows.filter(r => r.entry.status === 'MISSED').every(r => selected.has(r.id))
                  }
                />
              </th>
              {['Project Name', 'Developer', 'Quarter', 'Due Date', 'Filed Date', 'Status', 'Days Overdue', 'Penalty Accrued'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.filter(r => r.entry.status !== 'NA').map((row, i) => {
              const due = getDueDate(row.quarter)
              const overdue = daysOverdue(row.quarter, row.entry)
              const pen = penalty(row.quarter, row.entry)
              const isMissed = row.entry.status === 'MISSED'
              return (
                <tr
                  key={row.id}
                  className={`border-b border-border last:border-0 transition-colors duration-150 ${
                    isMissed ? 'bg-red/5 hover:bg-red/10' : ''
                  } ${selected.has(row.id) ? 'bg-gold/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    {isMissed && (
                      <input
                        type="checkbox"
                        className="accent-gold w-3.5 h-3.5"
                        checked={selected.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-off-white text-sm font-medium leading-tight">{row.project_name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray text-xs">{row.developer_name}</td>
                  <td className="px-4 py-3 font-mono text-gold text-xs">{row.quarter}</td>
                  <td className="px-4 py-3 text-gray text-xs whitespace-nowrap">{fmtDate(due.toISOString().split('T')[0])}</td>
                  <td className="px-4 py-3 text-xs">
                    {row.entry.filed_date
                      ? <span className="text-off-white">{fmtDate(row.entry.filed_date)}</span>
                      : <span className="text-gray">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={row.entry.status} /></td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {overdue > 0
                      ? <span className={isMissed ? 'text-red' : 'text-amber'}>+{overdue}d</span>
                      : <span className="text-gray">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {pen > 0 ? (
                      <span className="flex items-center gap-1.5 text-red">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red" />
                        </span>
                        {fmtInr(pen)}
                      </span>
                    ) : (
                      <span className="text-gray">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2 mb-4">
        {displayRows.filter(r => r.entry.status !== 'NA').map(row => {
          const due = getDueDate(row.quarter)
          const overdue = daysOverdue(row.quarter, row.entry)
          const pen = penalty(row.quarter, row.entry)
          const isMissed = row.entry.status === 'MISSED'
          return (
            <div
              key={row.id}
              className={`border rounded-sm p-3 ${
                isMissed ? 'border-red/30 bg-red/5' : 'border-border bg-surface'
              } ${selected.has(row.id) ? 'border-gold bg-gold/5' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2">
                  {isMissed && (
                    <input
                      type="checkbox"
                      className="accent-gold w-3.5 h-3.5 mt-0.5"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  )}
                  <div>
                    <div className="text-off-white text-sm font-medium leading-tight">{row.project_name}</div>
                    <div className="text-gray text-xs mt-0.5">{row.developer_name}</div>
                  </div>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={row.entry.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="text-gray">Quarter: <span className="font-mono text-gold">{row.quarter}</span></div>
                <div className="text-gray">Due: <span className="text-off-white">{fmtDate(due.toISOString().split('T')[0])}</span></div>
                {row.entry.filed_date && (
                  <div className="text-gray">Filed: <span className="text-off-white">{fmtDate(row.entry.filed_date)}</span></div>
                )}
                {overdue > 0 && (
                  <div className="text-gray">Overdue: <span className={isMissed ? 'text-red' : 'text-amber'}>+{overdue}d</span></div>
                )}
                {pen > 0 && (
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="text-gray">Penalty:</span>
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red" />
                    </span>
                    <span className="font-mono text-red">{fmtInr(pen)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && hasMissedSelected && (
        <div className="fixed bottom-20 sm:bottom-6 left-0 right-0 flex justify-center px-4 z-30 pointer-events-none">
          <div className="bg-surface border border-gold rounded-sm px-4 py-3 flex items-center gap-4 shadow-lg pointer-events-auto max-w-lg w-full">
            <div className="flex-1">
              <span className="text-gold text-sm font-medium">{selected.size} project{selected.size > 1 ? 's' : ''} selected</span>
              <div className="text-gray text-xs mt-0.5">
                Total penalty: {fmtInr(Array.from(selected).reduce((s, id) => {
                  const row = ALL_ROWS.find(r => r.id === id)
                  return s + (row ? penalty(row.quarter, row.entry) : 0)
                }, 0))}
              </div>
            </div>
            <button
              onClick={() => setBatchModal(true)}
              className="flex items-center gap-2 bg-gold text-background text-xs font-bold px-4 py-2 rounded-sm hover:bg-gold-light transition-colors duration-150"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Batch Notices
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-gray hover:text-off-white text-xs transition-colors duration-150"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Batch modal */}
      {batchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setBatchModal(false)}>
          <div className="bg-surface border border-border rounded-sm p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="font-syne text-off-white text-base mb-1">Generate Batch Show Cause Notices</div>
            <div className="text-gray text-xs mb-4">{selected.size} notice{selected.size > 1 ? 's' : ''} will be generated and queued for officer review.</div>
            <div className="space-y-2 mb-5">
              {Array.from(selected).map(id => {
                const row = ALL_ROWS.find(r => r.id === id)
                if (!row) return null
                return (
                  <div key={id} className="flex items-center justify-between bg-surface2 border border-border rounded-sm px-3 py-2">
                    <div>
                      <div className="text-off-white text-xs font-medium">{row.project_name}</div>
                      <div className="text-gray text-[10px]">{row.quarter} · {fmtInr(penalty(row.quarter, row.entry))} penalty</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-red text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0" />MISSED
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setBatchModal(false); setSelected(new Set()) }}
                className="flex-1 bg-gold text-background text-sm font-bold py-2.5 rounded-sm hover:bg-gold-light transition-colors duration-150"
              >
                Confirm & Generate
              </button>
              <button
                onClick={() => setBatchModal(false)}
                className="flex-1 bg-surface2 border border-border text-gray text-sm py-2.5 rounded-sm hover:text-off-white transition-colors duration-150"
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
