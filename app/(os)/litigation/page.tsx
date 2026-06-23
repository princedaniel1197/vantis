'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, AlertTriangle, Calendar, Search } from 'lucide-react'
import litigationData from '@/data/dev-litigation.json'

const SEVERITY_CONFIG: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: 'var(--rc)', bg: 'color-mix(in srgb, var(--rc) 8%, var(--surf))' },
  HIGH:     { color: 'var(--rc)', bg: 'color-mix(in srgb, var(--rc) 5%, var(--surf))' },
  MEDIUM:   { color: 'var(--rb)', bg: 'color-mix(in srgb, var(--rb) 8%, var(--surf))' },
  LOW:      { color: 'var(--muted)', bg: 'var(--surf)' },
}

const COURT_TYPES = ['All', 'High Court', 'District Court', 'Consumer Forum', 'Criminal'] as const

export default function LitigationPage() {
  const [search, setSearch] = useState('')
  const [courtFilter, setCourtFilter] = useState<string>('All')
  const [selected, setSelected] = useState<string | null>(null)

  const cases = litigationData.cases
  const filtered = cases.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.project.toLowerCase().includes(q) || c.developer.toLowerCase().includes(q) || c.case_no.toLowerCase().includes(q)
    const matchCourt = courtFilter === 'All' || c.court.toLowerCase().includes(courtFilter.toLowerCase()) || c.type.toLowerCase().includes(courtFilter.toLowerCase())
    return matchSearch && matchCourt
  })

  const criticalCount = cases.filter(c => c.severity.toUpperCase() === 'CRITICAL' || c.severity.toUpperCase() === 'HIGH').length
  const totalAmountCr = cases.reduce((s, c) => s + (c.amount_cr ?? 0), 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Intelligence · Legal</div>
          <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Litigation X-ray</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            eCourts live data — every active suit against projects you're evaluating or acquiring land from.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Active Cases', value: cases.length, color: 'var(--rc)' },
          { label: 'Critical / High', value: criticalCount, color: 'var(--rc)' },
          { label: 'Total Exposure', value: `₹${totalAmountCr.toFixed(1)} Cr`, color: 'var(--rb)' },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-display italic text-2xl sm:text-3xl mb-0.5" style={{ color: k.color }}>{k.value}</div>
            <div className="font-mono text-[10px] uppercase" style={{ color: 'var(--muted)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm flex-1 min-w-[200px]" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects, developers, case numbers…"
            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {COURT_TYPES.map(t => (
            <button key={t} onClick={() => setCourtFilter(t)}
              className="px-3 py-1.5 font-mono text-[11px] rounded-sm"
              style={{ background: courtFilter === t ? 'var(--surf2)' : 'var(--surf)', color: courtFilter === t ? 'var(--rc)' : 'var(--muted)', border: `1px solid ${courtFilter === t ? 'color-mix(in srgb, var(--rc) 40%, var(--bord))' : 'var(--bord)'}` }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Cases */}
      <div className="space-y-3">
        {filtered.map((c, i) => {
          const cfg = SEVERITY_CONFIG[c.severity.toUpperCase()] ?? SEVERITY_CONFIG.LOW
          const isSelected = selected === c.id
          const daysToHearing = Math.round((new Date(c.next_hearing).getTime() - new Date('2026-06-22').getTime()) / 86400000)
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(isSelected ? null : c.id)}
              className="rounded-sm cursor-pointer overflow-hidden transition-all"
              style={{ background: isSelected ? cfg.bg : 'var(--surf)', border: `1px solid ${isSelected ? cfg.color : `color-mix(in srgb, ${cfg.color} 25%, var(--bord))`}` }}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Scale className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--ink)' }}>{c.case_no}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm" style={{ color: cfg.color, background: `color-mix(in srgb, ${cfg.color} 10%, var(--surf2))` }}>{c.severity}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm" style={{ background: 'var(--surf2)', color: 'var(--muted)' }}>{c.type}</span>
                    </div>
                    <div className="text-sm font-medium mb-0.5" style={{ color: 'var(--ink)' }}>{c.project} — {c.developer}</div>
                    <div className="text-xs" style={{ color: 'var(--muted)' }}>{c.description}</div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="font-mono text-sm" style={{ color: cfg.color }}>₹{c.amount_cr} Cr</div>
                    <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>exposure</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 flex-wrap text-[11px] font-mono">
                  <span style={{ color: 'var(--muted)' }}>{c.court}</span>
                  <span style={{ color: 'var(--muted)' }}>· Plaintiff: {c.plaintiff}</span>
                  <span className="flex items-center gap-1 ml-auto" style={{ color: daysToHearing <= 14 ? 'var(--rb)' : 'var(--muted)' }}>
                    <Calendar className="w-3 h-3" /> Hearing: {c.next_hearing} {daysToHearing <= 14 ? `(${daysToHearing}d)` : ''}
                  </span>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid var(--bord)' }}>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--muted)' }}>Survey / Plot</div>
                      <div className="text-xs" style={{ color: 'var(--ink)' }}>{c.survey}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--muted)' }}>Filed</div>
                      <div className="text-xs" style={{ color: 'var(--ink)' }}>{c.filed_date}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--muted)' }}>Status</div>
                      <div className="text-xs" style={{ color: 'var(--ink)' }}>{c.status}</div>
                    </div>
                    {c.attachable_assets && (
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--muted)' }}>Attachable Assets</div>
                        <div className="text-xs" style={{ color: 'var(--rc)' }}>{c.attachable_assets}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center font-mono text-xs" style={{ color: 'var(--muted)' }}>No cases match your search.</div>
        )}
      </div>
    </div>
  )
}
