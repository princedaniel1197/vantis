'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ShieldCheck, ShieldAlert, TrendingUp, Users, Banknote, ChevronRight, AlertTriangle } from 'lucide-react'
import channelData from '@/data/dev-channel.json'

const TIER_LABEL: Record<string, string> = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver' }
const TIER_COLOR: Record<string, string> = { platinum: '#e2e8f0', gold: 'var(--gold)', silver: '#94a3b8' }
const TIER_BG: Record<string, string> = {
  platinum: 'color-mix(in srgb, #e2e8f0 6%, var(--surf))',
  gold: 'color-mix(in srgb, var(--gold) 6%, var(--surf))',
  silver: 'var(--surf)',
}

export default function PartnersPage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const partners = channelData.brokers
  const filtered = partners.filter(p => {
    const q = search.toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.agency.toLowerCase().includes(q) || p.locations.some(m => m.toLowerCase().includes(q))
  })

  const totalPending = partners.reduce((s, p) => s + (p.pending_commission_lakh ?? 0), 0)
  const totalLeads = partners.reduce((s, p) => s + (p.active_leads ?? 0), 0)

  const sorted = [...filtered].sort((a, b) => {
    const tierOrder: Record<string, number> = { platinum: 0, gold: 1, silver: 2 }
    const ta = tierOrder[a.tier] ?? 3
    const tb = tierOrder[b.tier] ?? 3
    return ta !== tb ? ta - tb : (b.closed_deals_12m ?? 0) - (a.closed_deals_12m ?? 0)
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Sales · Network</div>
          <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Channel Partners</h1>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Users, label: 'Active Partners', value: partners.filter(p => p.verified).length, sub: `${partners.filter(p => !p.verified).length} unverified`, color: 'var(--ink)' },
          { icon: TrendingUp, label: 'Active Leads', value: totalLeads, sub: 'across all partners', color: 'var(--gold)' },
          { icon: Banknote, label: 'Pending Commission', value: `₹${totalPending.toFixed(1)}L`, sub: 'awaiting release', color: 'var(--rb)' },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <k.icon className="w-4 h-4 mb-2" style={{ color: 'var(--muted)' }} />
            <div className="font-display italic text-2xl sm:text-3xl" style={{ color: k.color }}>{k.value}</div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{k.label}</span>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-sm mb-5" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
        <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, firm, micro-market…"
          className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((p, i) => {
          const isSelected = selected === p.id
          const tc = TIER_COLOR[p.tier] ?? 'var(--muted)'
          const tb = TIER_BG[p.tier] ?? 'var(--surf)'
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(isSelected ? null : p.id)}
              className="rounded-sm cursor-pointer transition-all overflow-hidden"
              style={{ background: isSelected ? tb : 'var(--surf)', border: `1px solid ${isSelected ? tc : p.alert ? 'color-mix(in srgb, var(--rc) 40%, var(--bord))' : 'var(--bord)'}` }}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{p.name}</div>
                    <div className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>{p.agency}</div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="font-display italic text-2xl leading-none" style={{ color: tc }}>{p.closed_deals_12m}</div>
                    <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>deals / yr</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  {p.verified
                    ? <><ShieldCheck className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--ra)' }} /><span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{p.rera_id}</span></>
                    : <><ShieldAlert className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--rc)' }} /><span className="font-mono text-[10px]" style={{ color: 'var(--rc)' }}>RERA Unverified</span></>
                  }
                  <span className="ml-auto font-mono text-[9px] px-1.5 py-0.5 rounded-sm capitalize" style={{ color: tc, background: 'var(--surf2)' }}>{TIER_LABEL[p.tier]}</span>
                </div>

                <div className="grid grid-cols-3 gap-1 mb-3">
                  {[
                    { label: 'Active Leads', value: p.active_leads, color: 'var(--gold)' },
                    { label: 'Conv. %', value: `${p.conversion_rate}%`, color: p.conversion_rate >= 14 ? 'var(--ra)' : p.conversion_rate >= 9 ? 'var(--rb)' : 'var(--muted)' },
                    { label: 'Pending', value: `₹${p.pending_commission_lakh}L`, color: 'var(--rb)' },
                  ].map(s => (
                    <div key={s.label} className="text-center px-1 py-1.5 rounded-sm" style={{ background: 'var(--surf2)' }}>
                      <div className="font-mono text-xs" style={{ color: s.color }}>{s.value}</div>
                      <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {p.locations.map(m => (
                    <span key={m} className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm" style={{ background: 'var(--surf2)', color: 'var(--muted)' }}>{m}</span>
                  ))}
                </div>

                {p.alert && (
                  <div className="mt-2 flex items-start gap-1.5 text-[10px] font-mono px-2 py-1.5 rounded-sm" style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf2))', color: 'var(--rc)' }}>
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />{p.alert}
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="px-4 pb-4">
                  <div className="pt-3 space-y-2" style={{ borderTop: '1px solid var(--bord)' }}>
                    {[
                      ['Revenue last 12m', `₹${p.revenue_cr} Cr`],
                      ['Avg ticket size', `₹${p.avg_ticket_cr} Cr`],
                      ['Response rate', `${p.response_rate}%`],
                      ['Repeat clients', `${p.repeat_rate}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span style={{ color: 'var(--muted)' }}>{label}</span>
                        <span className="font-mono" style={{ color: 'var(--ink)' }}>{value}</span>
                      </div>
                    ))}
                    {p.verified && (
                      <button className="w-full mt-2 py-1.5 text-xs font-mono flex items-center justify-center gap-1 rounded-sm"
                        style={{ border: '1px solid var(--bord)', color: 'var(--gold)' }}>
                        Release ₹{p.pending_commission_lakh}L Commission <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
