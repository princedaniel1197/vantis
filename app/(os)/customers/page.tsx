'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertTriangle, CheckCircle2, Clock, ChevronDown } from 'lucide-react'
import customersData from '@/data/os-customers.json'

const STAGE_LABEL: Record<string, string> = {
  booking_advance: 'Booking Advance',
  construction_milestone: 'Milestone',
  payment_overdue: 'Overdue',
  under_construction: 'Under Construction',
}
const STAGE_COLOR: Record<string, string> = {
  booking_advance: 'var(--gold)',
  construction_milestone: 'var(--ra)',
  payment_overdue: 'var(--rc)',
  under_construction: 'var(--rb)',
}

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<string | null>(null)

  const customers = customersData.customers
  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.project.toLowerCase().includes(q) || c.unit.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || c.stage === filter
    return matchSearch && matchFilter
  })

  const overdueCount = customers.filter(c => c.stage === 'payment_overdue').length

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Operations · CRM</div>
          <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Customers</h1>
        </div>
        {overdueCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm" style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf))', border: '1px solid color-mix(in srgb, var(--rc) 30%, var(--bord))', color: 'var(--rc)' }}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{overdueCount} overdue</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Customers', value: customers.length, color: 'var(--ink)' },
          { label: 'Units Booked', value: `₹${customers.reduce((s, c) => s + c.total_value_lakh, 0).toFixed(0)}L`, color: 'var(--gold)' },
          { label: 'Collected', value: `₹${customers.reduce((s, c) => s + c.paid_lakh, 0).toFixed(0)}L`, color: 'var(--ra)' },
          { label: 'Overdue', value: overdueCount.toString(), color: 'var(--rc)' },
        ].map(k => (
          <div key={k.label} className="p-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-display italic text-2xl" style={{ color: k.color }}>{k.value}</div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{k.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm flex-1 min-w-[180px]" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers, units…"
            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['all', 'payment_overdue', 'construction_milestone', 'under_construction', 'booking_advance'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 font-mono text-[11px] rounded-sm"
              style={{
                background: filter === f ? 'var(--surf2)' : 'var(--surf)',
                color: f === 'all' ? (filter === f ? 'var(--ink)' : 'var(--muted)') : (filter === f ? STAGE_COLOR[f] : 'var(--muted)'),
                border: `1px solid ${filter === f && f !== 'all' ? STAGE_COLOR[f] : 'var(--bord)'}`,
              }}>
              {f === 'all' ? 'All' : STAGE_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Customer list */}
      <div className="space-y-2">
        {filtered.map((c, i) => {
          const isSelected = selected === c.id
          const sc = STAGE_COLOR[c.stage] ?? 'var(--muted)'
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(isSelected ? null : c.id)}
              className="rounded-sm cursor-pointer overflow-hidden transition-all"
              style={{ background: 'var(--surf)', border: `1px solid ${isSelected ? sc : c.stage === 'payment_overdue' ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'var(--bord)'}` }}>
              <div className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{c.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm" style={{ color: sc, background: `color-mix(in srgb, ${sc} 10%, var(--surf2))` }}>
                      {STAGE_LABEL[c.stage]}
                    </span>
                  </div>
                  <div className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{c.unit} · {c.project} · {c.unit_type}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm" style={{ color: 'var(--gold)' }}>₹{c.paid_lakh}L / ₹{c.total_value_lakh}L</div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{c.paid_pct}% paid</div>
                </div>
                <div className="w-16 shrink-0">
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--surf2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${c.paid_pct}%`, background: c.stage === 'payment_overdue' ? 'var(--rc)' : 'var(--ra)' }} />
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 shrink-0 self-center transition-transform" style={{ color: 'var(--muted)', transform: isSelected ? 'rotate(180deg)' : '' }} />
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-0" style={{ borderTop: '1px solid var(--bord)' }}>
                      {[
                        ['Unit', c.unit],
                        ['Area', `${c.area_sqft.toLocaleString()} sqft`],
                        ['Booking Date', c.booking_date],
                        ['Possession', c.possession_date],
                        ['RERA Agreement', c.rera_agreement],
                        ['Kaveri Registered', c.kaveri_registered ? 'Yes' : 'Not yet'],
                        ['Payment Plan', c.payment_schedule.replace(/_/g, ' ')],
                        ['Open Queries', c.open_queries.toString()],
                      ].map(([label, value]) => (
                        <div key={label} className="pt-3">
                          <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-0.5 block" style={{ color: 'var(--muted)' }}>{label}</span>
                          <div className="text-xs font-medium capitalize" style={{ color: 'var(--ink)' }}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
