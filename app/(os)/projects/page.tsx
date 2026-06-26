'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import projectsData from '@/data/dev-projects.json'

type Project = typeof projectsData[0]
const OWN = (projectsData as Project[]).filter(p => p.is_own)

const GRADE_COLOR: Record<string, string> = { A: 'var(--ra)', B: 'var(--rb)', C: 'var(--rc)' }
const QPR_COLOR: Record<string, string> = { ON_TIME: 'var(--ra)', DUE_SOON: 'var(--rb)', OVERDUE: 'var(--rc)', submitted: 'var(--ra)', due_soon: 'var(--rb)', overdue: 'var(--rc)' }
const QPR_LABEL: Record<string, string> = { ON_TIME: 'QPR Filed ✓', DUE_SOON: 'Due Soon', OVERDUE: 'Overdue ⚠', submitted: 'QPR Filed ✓', due_soon: 'Due Soon', overdue: 'Overdue ⚠' }

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'A' | 'B' | 'C'>('all')

  const filtered = OWN.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.micro_market.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || p.risk_grade === filter
    return matchSearch && matchFilter
  })

  const totalUnits = OWN.reduce((s, p) => s + p.units_total, 0)
  const totalSold = OWN.reduce((s, p) => s + p.units_sold, 0)
  const avgMarketSqft = Math.round(OWN.reduce((s, p) => s + (p.market_sqft ?? 0), 0) / OWN.length)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Operations · Portfolio</div>
          <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Projects</h1>
        </div>
        <div className="text-right">
          <div className="font-display italic text-2xl" style={{ color: 'var(--gold)' }}>{OWN.length}</div>
          <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>active projects</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Units', value: totalUnits.toLocaleString(), color: 'var(--ink)' },
          { label: 'Units Sold', value: `${totalSold} (${Math.round(totalSold / totalUnits * 100)}%)`, color: 'var(--ra)' },
          { label: 'Avg Market Price', value: `₹${avgMarketSqft.toLocaleString()}/sqft`, color: 'var(--gold)' },
        ].map(k => (
          <div key={k.label} className="p-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-display italic text-2xl" style={{ color: k.color }}>{k.value}</div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{k.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm flex-1 min-w-[180px]" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
        </div>
        <div className="flex gap-1">
          {(['all', 'A', 'B', 'C'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 font-mono text-xs rounded-sm"
              style={{
                background: filter === f ? (f === 'all' ? 'var(--surf2)' : GRADE_COLOR[f]) : 'var(--surf)',
                color: filter === f && f !== 'all' ? 'var(--bg)' : filter === f ? 'var(--ink)' : 'var(--muted)',
                border: '1px solid var(--bord)',
              }}>
              {f === 'all' ? 'All' : `Grade ${f}`}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{filtered.length} projects</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p, i) => {
          const soldPct = p.units_total > 0 ? Math.round(p.units_sold / p.units_total * 100) : 0
          const gc = GRADE_COLOR[p.risk_grade] ?? 'var(--muted)'
          const qc = QPR_COLOR[p.qpr_status] ?? 'var(--muted)'
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="text-sm font-medium leading-snug" style={{ color: 'var(--ink)' }}>{p.name}</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{p.micro_market} · {p.type}</div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="font-display italic text-2xl leading-none" style={{ color: gc }}>{p.risk_grade}</div>
                  <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>grade</div>
                </div>
              </div>

              <div className="font-mono text-[10px] mb-3" style={{ color: 'var(--muted)' }}>
                RERA: <span style={{ color: 'var(--ink)' }}>{p.rera_id.slice(-8)}</span>
              </div>

              <div>
                <div className="flex justify-between font-mono text-[10px] mb-1" style={{ color: 'var(--muted)' }}>
                  <span>Units Sold</span><span style={{ color: gc }}>{soldPct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--surf2)' }}>
                  <div className="h-full rounded-full" style={{ width: `${soldPct}%`, background: gc }} />
                </div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{p.units_sold}/{p.units_total}</div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[10px]" style={{ color: qc }}>{QPR_LABEL[p.qpr_status] ?? p.qpr_status}</span>
                <span className="font-mono text-xs" style={{ color: 'var(--gold)' }}>₹{p.market_sqft?.toLocaleString()}/sqft</span>
              </div>

              {(p.qpr_penalty_lakh ?? 0) > 0 && (
                <div className="mt-2 font-mono text-[10px] px-2 py-1 rounded-sm" style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf2))', color: 'var(--rc)' }}>
                  ₹{p.qpr_penalty_lakh}L penalty exposure
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
