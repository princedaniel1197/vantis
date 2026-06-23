'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, ChevronDown, ShieldCheck, ShieldAlert, Phone, Calendar, TrendingUp } from 'lucide-react'
import leadsData from '@/data/os-leads.json'

const STAGES = ['new_inquiry', 'site_visit_scheduled', 'visited', 'interested', 'negotiation', 'booked'] as const
type Stage = typeof STAGES[number]

const STAGE_LABEL: Record<string, string> = {
  new_inquiry: 'New Inquiry',
  site_visit_scheduled: 'Visit Sched.',
  visited: 'Visited',
  interested: 'Interested',
  negotiation: 'Negotiation',
  booked: 'Booked',
}
const GRADE_COLOR: Record<string, string> = { A: 'var(--ra)', B: 'var(--rb)', C: 'var(--rc)' }
const FLAG_LABEL: Record<string, string> = {
  partition_suit_active: 'Partition suit active',
  plot_disputed: 'Plot disputed',
  insufficient_income: 'Income flag',
}

export default function LeadsPage() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [filterRep, setFilterRep] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

  const leads = leadsData.leads
  const filtered = leads.filter(l => {
    const q = search.toLowerCase()
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.project_interest.toLowerCase().includes(q)
    const matchRep = filterRep === 'All' || l.assigned_to === filterRep
    return matchSearch && matchRep
  })

  const byStage = (stage: Stage) => filtered.filter(l => l.stage === stage)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Sales · CRM</div>
          <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Leads & Pipeline</h1>
        </div>
        <div className="flex items-center gap-2">
          {(['kanban', 'table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-mono rounded-sm capitalize"
              style={{ background: view === v ? 'var(--gold)' : 'var(--surf)', color: view === v ? 'var(--bg)' : 'var(--muted)', border: '1px solid var(--bord)' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm flex-1 min-w-[200px]" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads, projects…"
            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: 'var(--muted)' }} />
          <select value={filterRep} onChange={e => setFilterRep(e.target.value)} className="bg-transparent text-xs outline-none" style={{ color: 'var(--ink)' }}>
            <option value="All">All reps</option>
            {leadsData.reps.map(r => <option key={r}>{r}</option>)}
          </select>
          <ChevronDown className="w-3 h-3" style={{ color: 'var(--muted)' }} />
        </div>
        <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{filtered.length} leads</div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        {STAGES.map(s => {
          const count = byStage(s).length
          return (
            <div key={s} className="px-3 py-2 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <div className="font-display italic text-2xl" style={{ color: s === 'booked' ? 'var(--ra)' : s === 'negotiation' ? 'var(--rb)' : 'var(--ink)' }}>{count}</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>{STAGE_LABEL[s]}</div>
            </div>
          )
        })}
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const cards = byStage(stage)
            return (
              <div key={stage} className="shrink-0 w-[220px]">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>{STAGE_LABEL[stage]}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surf2)', color: 'var(--ink)' }}>{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map((lead, i) => (
                    <motion.div key={lead.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(selected === lead.id ? null : lead.id)}
                      className="p-3 rounded-sm cursor-pointer transition-all"
                      style={{
                        background: selected === lead.id ? 'color-mix(in srgb, var(--gold) 6%, var(--surf))' : 'var(--surf)',
                        border: `1px solid ${selected === lead.id ? 'var(--gold)' : lead.gov_flags.length > 0 ? 'color-mix(in srgb, var(--rc) 40%, var(--bord))' : 'var(--bord)'}`,
                      }}>
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="text-xs font-medium leading-snug" style={{ color: 'var(--ink)' }}>{lead.name}</div>
                        <div className="font-display italic text-base leading-none" style={{ color: GRADE_COLOR[lead.score_grade] }}>{lead.score_grade}</div>
                      </div>
                      <div className="font-mono text-[10px] mb-0.5" style={{ color: 'var(--muted)' }}>{lead.project_interest}</div>
                      <div className="font-mono text-[10px] mb-2" style={{ color: 'var(--muted)' }}>₹{lead.budget_lakh}L · {lead.source}</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {lead.gov_verified
                          ? <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: 'var(--ra)' }}><ShieldCheck className="w-2.5 h-2.5" /> Verified</span>
                          : <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: 'var(--muted)' }}><ShieldAlert className="w-2.5 h-2.5" /> Unverified</span>}
                        {lead.gov_flags.length > 0 && (
                          <span className="font-mono text-[9px] px-1 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--rc) 12%, var(--surf))', color: 'var(--rc)' }}>
                            ⚠ {lead.gov_flags.length} flag
                          </span>
                        )}
                        <span className="font-mono text-[9px] ml-auto" style={{ color: 'var(--muted)' }}>{lead.assigned_to.split(' ')[0]}</span>
                      </div>
                      <AnimatePresence>
                        {selected === lead.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-2 pt-2 space-y-1.5" style={{ borderTop: '1px solid var(--bord)' }}>
                              <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                                <Phone className="w-3 h-3" /> {lead.phone}
                              </div>
                              <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                                <TrendingUp className="w-3 h-3" /> Score: <span style={{ color: GRADE_COLOR[lead.score_grade] }}>{lead.score}/100</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                                <Calendar className="w-3 h-3" /> Last contact: {lead.last_contact}
                              </div>
                              {lead.gov_flags.map(f => (
                                <div key={f} className="font-mono text-[9px] px-1.5 py-1 rounded" style={{ background: 'color-mix(in srgb, var(--rc) 10%, var(--surf2))', color: 'var(--rc)' }}>
                                  ⚠ {FLAG_LABEL[f] ?? f}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                  {cards.length === 0 && (
                    <div className="px-3 py-4 text-center font-mono text-[10px] rounded-sm" style={{ color: 'var(--muted)', border: '1px dashed var(--bord)' }}>Empty</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bord)' }}>
                {['Lead', 'Project / Unit', 'Budget', 'Stage', 'Score', 'Gov', 'Rep', 'Last Contact'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  onClick={() => setSelected(selected === lead.id ? null : lead.id)}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--bord)', background: selected === lead.id ? 'color-mix(in srgb, var(--gold) 4%, var(--surf))' : '' }}
                  onMouseEnter={e => { if (selected !== lead.id) (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surf2)' }}
                  onMouseLeave={e => { if (selected !== lead.id) (e.currentTarget as HTMLTableRowElement).style.background = '' }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--ink)' }}>{lead.name}</td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--muted)' }}>
                    <div>{lead.project_interest}</div>
                    <div className="text-[10px]">{lead.unit_interest}</div>
                  </td>
                  <td className="px-4 py-2.5 font-mono" style={{ color: 'var(--ink)' }}>₹{lead.budget_lakh}L</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm" style={{ background: 'var(--surf2)', color: 'var(--muted)' }}>{STAGE_LABEL[lead.stage]}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-display italic text-lg" style={{ color: GRADE_COLOR[lead.score_grade] }}>{lead.score_grade}</span>
                    <span className="font-mono text-[10px] ml-1" style={{ color: 'var(--muted)' }}>{lead.score}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {lead.gov_verified ? <ShieldCheck className="w-4 h-4 inline" style={{ color: 'var(--ra)' }} /> : <ShieldAlert className="w-4 h-4 inline" style={{ color: 'var(--muted)' }} />}
                    {lead.gov_flags.length > 0 && <span className="font-mono text-[9px] ml-1" style={{ color: 'var(--rc)' }}>⚠{lead.gov_flags.length}</span>}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{lead.assigned_to}</td>
                  <td className="px-4 py-2.5 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{lead.last_contact}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
