'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, HardHat, AlertCircle } from 'lucide-react'
import constructionData from '@/data/os-construction.json'

const MILESTONE_COLOR: Record<string, string> = { done: 'var(--ra)', active: 'var(--gold)', planned: 'var(--muted)' }
const MILESTONE_ICON = { done: CheckCircle2, active: Clock, planned: Circle }

export default function ConstructionPage() {
  const [selected, setSelected] = useState(0)
  const site = constructionData.sites[selected]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Operations · Site</div>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Construction & Site</h1>
      </div>

      {/* Project tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {constructionData.sites.map((s, i) => (
          <button key={s.project_id} onClick={() => setSelected(i)}
            className="px-4 py-2 rounded-sm text-sm font-mono"
            style={{ background: selected === i ? 'var(--gold)' : 'var(--surf)', color: selected === i ? 'var(--bg)' : 'var(--muted)', border: '1px solid var(--bord)' }}>
            {s.project}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: progress + stats */}
        <div className="lg:col-span-2 space-y-5">
          {/* Progress ring + stats */}
          <div className="p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="flex items-center gap-6 mb-4">
              {/* Big progress number */}
              <div className="shrink-0 w-28 h-28 relative flex items-center justify-center rounded-full" style={{ border: '4px solid var(--surf2)' }}>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="var(--gold)" strokeWidth="6"
                    strokeDasharray={`${site.completion_pct * 2.764} ${276.4}`} strokeLinecap="round" />
                </svg>
                <div className="text-center z-10">
                  <div className="font-display italic text-3xl leading-none" style={{ color: 'var(--gold)' }}>{site.completion_pct}%</div>
                  <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>complete</div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                {[
                  { label: 'RERA Declared', value: `${site.rera_declared_pct}%`, color: site.completion_pct >= site.rera_declared_pct ? 'var(--ra)' : 'var(--rc)' },
                  { label: 'Possession', value: site.possession_date, color: 'var(--ink)' },
                  { label: 'Workers on Site', value: site.workers_on_site.toString(), color: 'var(--ink)' },
                  { label: 'RMC Pours / week', value: site.rmc_pours_this_week.toString(), color: 'var(--gold)' },
                  { label: 'Open Snags', value: site.open_snags.toString(), color: site.open_snags > 3 ? 'var(--rb)' : 'var(--ra)' },
                  { label: 'Contractor', value: site.contractor.split(' ')[0], color: 'var(--muted)' },
                ].map(s => (
                  <div key={s.label} className="px-3 py-2 rounded-sm" style={{ background: 'var(--surf2)' }}>
                    <div className="font-mono text-xs" style={{ color: s.color }}>{s.value}</div>
                    <div className="font-mono text-[9px] mt-0.5" style={{ color: 'var(--muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {site.completion_pct < site.rera_declared_pct && (
              <div className="flex items-center gap-2 text-xs font-mono px-3 py-2 rounded-sm" style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf2))', color: 'var(--rc)' }}>
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Actual progress ({site.completion_pct}%) behind RERA declaration ({site.rera_declared_pct}%) — update K-RERA portal before next QPR.
              </div>
            )}
          </div>

          {/* Milestone timeline */}
          <div className="p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>Construction Milestones</div>
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-px" style={{ background: 'var(--bord)' }} />
              <div className="space-y-3">
                {site.milestones.map((m, i) => {
                  const Icon = MILESTONE_ICON[m.status as keyof typeof MILESTONE_ICON] ?? Circle
                  const color = MILESTONE_COLOR[m.status] ?? 'var(--muted)'
                  return (
                    <motion.div key={m.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-3 pl-2">
                      <div className="shrink-0 mt-0.5 z-10" style={{ background: 'var(--surf)' }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 flex items-center justify-between gap-2">
                        <span className="text-xs" style={{ color: m.status === 'planned' ? 'var(--muted)' : 'var(--ink)' }}>{m.label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {m.pct > 0 && m.pct < 100 && (
                            <div className="w-16 h-1 rounded-full" style={{ background: 'var(--surf2)' }}>
                              <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: color }} />
                            </div>
                          )}
                          <span className="font-mono text-[10px]" style={{ color }}>
                            {m.status === 'done' ? m.date : m.pct > 0 ? `${m.pct}%` : 'Planned'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: today's updates + site engineer */}
        <div className="space-y-4">
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>Today's Site Log</div>
            <div className="space-y-2">
              {site.today_updates.map((u, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--gold)' }}>{u.time}</span>
                  <span className="text-xs" style={{ color: 'var(--ink)' }}>{u.update}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--muted)' }}>Site Details</div>
            {[
              ['Location', site.location],
              ['Site Engineer', site.site_engineer],
              ['Contractor', site.contractor],
              ['Possession Target', site.possession_date],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-1.5 text-xs" style={{ borderBottom: '1px solid var(--bord)' }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span className="font-mono text-right" style={{ color: 'var(--ink)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-sm" style={{ background: 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 25%, var(--bord))' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--gold)' }}>K-RERA Compliance</div>
            <div className="text-xs mb-2" style={{ color: 'var(--muted)' }}>
              Declared {site.rera_declared_pct}% on portal · Actual {site.completion_pct}%
            </div>
            <div className="h-1.5 rounded-full mb-1" style={{ background: 'var(--surf2)' }}>
              <div className="h-full rounded-full" style={{ width: `${site.rera_declared_pct}%`, background: 'var(--gold)' }} />
            </div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
              Next QPR due: auto-drafted by Vantis Compliance
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
