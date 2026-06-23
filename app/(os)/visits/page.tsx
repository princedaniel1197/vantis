'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle2, Circle, AlertCircle, User, Phone, MapPin, ChevronRight } from 'lucide-react'
import visitsData from '@/data/os-visits.json'

const TABS = ['Today', 'Tomorrow', 'This Week', 'All'] as const
type Tab = typeof TABS[number]

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  confirmed:  { color: 'var(--ra)',   bg: 'color-mix(in srgb, var(--ra) 10%, var(--surf))',   icon: CheckCircle2, label: 'Confirmed' },
  pending:    { color: 'var(--rb)',   bg: 'color-mix(in srgb, var(--rb) 10%, var(--surf))',   icon: AlertCircle,  label: 'Pending' },
  scheduled:  { color: 'var(--gold)',bg: 'color-mix(in srgb, var(--gold) 10%, var(--surf))', icon: Circle,       label: 'Scheduled' },
  completed:  { color: 'var(--muted)',bg: 'var(--surf2)',                                      icon: CheckCircle2, label: 'Done' },
}

const OUTCOME_COLOR: Record<string, string> = {
  booked: 'var(--ra)', negotiation: 'var(--rb)', interested: 'var(--gold)'
}

export default function VisitsPage() {
  const [tab, setTab] = useState<Tab>('Today')
  const [selected, setSelected] = useState<string | null>(null)

  const TODAY = '2026-06-22'
  const TOMORROW = '2026-06-23'

  const filtered = visitsData.visits.filter(v => {
    if (tab === 'Today') return v.date === TODAY
    if (tab === 'Tomorrow') return v.date === TOMORROW
    if (tab === 'This Week') return v.date >= TODAY && v.date <= '2026-06-28'
    return true
  })

  const todayVisits = visitsData.visits.filter(v => v.date === TODAY)
  const completedToday = todayVisits.filter(v => v.status === 'completed').length
  const confirmedToday = todayVisits.filter(v => v.status === 'confirmed').length

  const repStats = visitsData.reps

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Sales · Schedule</div>
          <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Site Visits</h1>
        </div>
        <div className="text-right">
          <div className="font-display italic text-2xl" style={{ color: 'var(--gold)' }}>{confirmedToday + todayVisits.filter(v => v.status === 'pending').length}</div>
          <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>visits today</div>
        </div>
      </div>

      {/* Rep performance */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {repStats.map(rep => (
          <div key={rep.name} className="p-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-sm flex items-center justify-center font-mono text-xs font-bold" style={{ background: 'var(--surf2)', color: 'var(--gold)' }}>
                {rep.avatar_initials}
              </div>
              <div>
                <div className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{rep.name}</div>
                <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{rep.visits_today} visits today</div>
              </div>
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
              <span style={{ color: 'var(--ra)' }}>{rep.bookings_mtm}</span> bookings MTM
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid var(--bord)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 font-mono text-[11px] -mb-px transition-colors"
            style={{ color: tab === t ? 'var(--gold)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent' }}>
            {t}
          </button>
        ))}
        <span className="ml-auto self-center font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{filtered.length} visits</span>
      </div>

      {/* Visit list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-12 text-center font-mono text-xs" style={{ color: 'var(--muted)' }}>No visits scheduled for this period.</div>
        )}
        {filtered.map((v, i) => {
          const cfg = STATUS_CONFIG[v.status] ?? STATUS_CONFIG.scheduled
          const Icon = cfg.icon
          const isSelected = selected === v.id
          return (
            <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(isSelected ? null : v.id)}
              className="rounded-sm cursor-pointer transition-all overflow-hidden"
              style={{ background: isSelected ? cfg.bg : 'var(--surf)', border: `1px solid ${isSelected ? cfg.color : 'var(--bord)'}` }}>
              <div className="p-4 flex items-start gap-4">
                {/* Time */}
                <div className="shrink-0 text-center w-14">
                  <div className="font-mono text-sm font-bold" style={{ color: 'var(--gold)' }}>{v.time}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{v.date.slice(5).replace('-', '/')}</div>
                </div>
                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{v.lead_name}</div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                      <span className="font-mono text-[10px]" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
                      <MapPin className="w-3 h-3" /> {v.project}
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{v.unit_interest}</span>
                    <span className="font-mono text-[11px]" style={{ color: 'var(--gold)' }}>₹{v.budget_lakh}L</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                      <User className="w-3 h-3" /> {v.rep}
                    </span>
                    {v.outcome && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm" style={{ background: 'var(--surf2)', color: OUTCOME_COLOR[v.outcome] ?? 'var(--muted)' }}>
                        → {v.outcome}
                      </span>
                    )}
                    {v.follow_up && (
                      <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Follow-up: {v.follow_up}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 mt-0.5 transition-transform" style={{ color: 'var(--muted)', transform: isSelected ? 'rotate(90deg)' : '' }} />
              </div>
              {isSelected && (
                <div className="px-4 pb-4 pt-0">
                  <div className="pt-3" style={{ borderTop: '1px solid var(--bord)' }}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: 'var(--muted)' }}>Phone</div>
                        <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--ink)' }}>
                          <Phone className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} /> {v.phone}
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: 'var(--muted)' }}>Project</div>
                        <div className="text-sm" style={{ color: 'var(--ink)' }}>{v.project}</div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: 'var(--muted)' }}>Unit Interest</div>
                        <div className="text-sm" style={{ color: 'var(--ink)' }}>{v.unit_interest}</div>
                      </div>
                    </div>
                    {v.notes && (
                      <div className="text-xs px-3 py-2 rounded-sm" style={{ background: 'var(--surf2)', color: 'var(--muted)' }}>
                        📋 {v.notes}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Today summary */}
      {tab === 'Today' && (
        <div className="mt-6 p-4 rounded-sm flex items-center gap-6" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div><div className="font-display italic text-2xl" style={{ color: 'var(--ra)' }}>{completedToday}</div><div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Done</div></div>
          <div><div className="font-display italic text-2xl" style={{ color: 'var(--gold)' }}>{confirmedToday}</div><div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Confirmed</div></div>
          <div><div className="font-display italic text-2xl" style={{ color: 'var(--rb)' }}>{todayVisits.filter(v => v.status === 'pending').length}</div><div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Pending</div></div>
          <div className="ml-auto font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
            Booking pipeline value today: <span style={{ color: 'var(--gold)' }}>₹{todayVisits.reduce((s, v) => s + v.budget_lakh, 0)}L</span>
          </div>
        </div>
      )}
    </div>
  )
}
