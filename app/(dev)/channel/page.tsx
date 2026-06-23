'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle2, AlertTriangle, Star, TrendingUp, Users } from 'lucide-react'
import channelData from '@/data/dev-channel.json'

type Broker = typeof channelData.brokers[0]

const TIER_CONFIG = {
  platinum: { label: 'Platinum', color: 'var(--gold)', bg: 'color-mix(in srgb, var(--gold) 12%, var(--surf2))' },
  gold:     { label: 'Gold',     color: '#c0a060',    bg: 'color-mix(in srgb, #c0a060 10%, var(--surf2))' },
  silver:   { label: 'Silver',   color: 'var(--muted)', bg: 'var(--surf2)' },
}

export default function ChannelPage() {
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState<string>('all')

  const brokers = channelData.brokers as Broker[]
  const filtered = brokers.filter(b => {
    const matchSearch = !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.agency.toLowerCase().includes(search.toLowerCase()) ||
      b.locations.some(l => l.toLowerCase().includes(search.toLowerCase()))
    const matchTier = tier === 'all' || b.tier === tier
    return matchSearch && matchTier
  })

  const totalRevenue = brokers.reduce((s, b) => s + b.revenue_cr, 0)
  const totalDeals = brokers.reduce((s, b) => s + b.closed_deals_12m, 0)
  const totalPending = brokers.reduce((s, b) => s + b.pending_commission_lakh, 0)
  const alertCount = brokers.filter(b => b.alert).length

  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>Channel Partner Intelligence · Broker Network</div>
        <h1 className="font-display text-4xl italic mb-1" style={{ color: 'var(--ink)' }}>Know your channel. Control your pipeline.</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>RERA-verified broker performance, commission tracking, and lead pipeline across your micro-markets.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Revenue (12m)', value: `₹${totalRevenue.toFixed(1)} Cr`, color: 'var(--ra)' },
          { label: 'Deals Closed', value: totalDeals.toString(), color: 'var(--ink)' },
          { label: 'Commission Pending', value: `₹${totalPending.toFixed(1)}L`, color: 'var(--rb)' },
          { label: 'Compliance Alerts', value: alertCount.toString(), color: alertCount > 0 ? 'var(--rc)' : 'var(--muted)' },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-display italic text-3xl" style={{ color: k.color }}>{k.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] mt-0.5" style={{ color: 'var(--muted)' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search broker, agency, or location…"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: 'var(--ink)', caretColor: 'var(--gold)' }}
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'platinum', 'gold', 'silver'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className="px-3 py-2 rounded-sm text-xs font-mono capitalize transition-colors"
              style={{
                color: tier === t ? 'var(--bg)' : 'var(--muted)',
                background: tier === t ? 'var(--gold)' : 'transparent',
                border: `1px solid ${tier === t ? 'var(--gold)' : 'var(--bord)'}`,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Broker grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((b, i) => {
          const tierCfg = TIER_CONFIG[b.tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.silver
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-sm overflow-hidden"
              style={{
                background: 'var(--surf)',
                border: `1px solid ${b.alert ? 'color-mix(in srgb, var(--rc) 40%, var(--bord))' : 'var(--bord)'}`,
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--bord)' }}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{b.name}</span>
                    {b.verified ? (
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--ra)' }} />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--rc)' }} />
                    )}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--muted)' }}>{b.agency} · {b.locations.join(', ')}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-sm" style={{ color: tierCfg.color, background: tierCfg.bg }}>
                  {tierCfg.label}
                </span>
              </div>

              {/* Metrics */}
              <div className="px-4 py-3">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Deals (12m)', value: b.closed_deals_12m },
                    { label: 'Revenue', value: `₹${b.revenue_cr}Cr` },
                    { label: 'Avg Ticket', value: `₹${b.avg_ticket_cr}Cr` },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className="font-mono text-sm font-medium" style={{ color: 'var(--ink)' }}>{m.value}</div>
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Rate bars */}
                {[
                  { label: 'Response Rate', value: b.response_rate, color: b.response_rate >= 80 ? 'var(--ra)' : b.response_rate >= 60 ? 'var(--rb)' : 'var(--rc)' },
                  { label: 'Conversion', value: b.conversion_rate, color: 'var(--gold)' },
                  { label: 'Repeat Buyers', value: b.repeat_rate, color: 'var(--gold-hi)' },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3 mb-1.5">
                    <div className="text-[10px] w-24 shrink-0" style={{ color: 'var(--muted)' }}>{r.label}</div>
                    <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bord)' }}>
                      <div className="h-full rounded-full" style={{ width: `${r.value}%`, background: r.color }} />
                    </div>
                    <div className="text-[10px] font-mono w-8 text-right" style={{ color: 'var(--ink)' }}>{r.value}%</div>
                  </div>
                ))}

                {/* Active leads + commission */}
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--bord)' }}>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
                    <Users className="w-3 h-3" />
                    {b.active_leads} active leads
                  </div>
                  <div className="text-xs">
                    <span style={{ color: 'var(--muted)' }}>Commission pending: </span>
                    <span className="font-mono" style={{ color: b.pending_commission_lakh > 5 ? 'var(--rb)' : 'var(--muted)' }}>₹{b.pending_commission_lakh}L</span>
                  </div>
                </div>

                {b.alert && (
                  <div className="flex items-start gap-2 mt-2.5 text-xs px-3 py-2 rounded-sm" style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf2))', border: '1px solid color-mix(in srgb, var(--rc) 25%, transparent)', color: 'var(--rc)' }}>
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    {b.alert}
                  </div>
                )}
                {b.rera_id && (
                  <div className="mt-2 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>RERA: {b.rera_id}</div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
