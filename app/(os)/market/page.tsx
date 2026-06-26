'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import marketData from '@/data/dev-market.json'

type QuarterEntry = { q: string; avg_sqft: number; deals: number; absorption: number; guidance: number }
type QuarterlyData = { [key: string]: QuarterEntry[] }

const quarterly = marketData.quarterly as unknown as QuarterlyData
const markets = marketData.micro_markets

export default function MarketPage() {
  const [selected, setSelected] = useState(markets[0].id)
  const market = markets.find(m => m.id === selected)!
  const history = quarterly[selected] ?? []
  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  const qoqChange = prev ? (((latest?.avg_sqft ?? 0) - (prev?.avg_sqft ?? 0)) / (prev?.avg_sqft ?? 1) * 100).toFixed(1) : '0'
  const premiumPct = latest ? Math.round(((latest.avg_sqft - latest.guidance) / latest.guidance) * 100) : 0

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Intelligence · Market</span>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Market Truth</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Kaveri 2.0 actual registration prices vs guidance circle rates across Bengaluru micro-markets.
        </p>
      </div>

      {/* Market selector */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {markets.map(m => (
          <button key={m.id} onClick={() => setSelected(m.id)}
            className="px-3 py-1.5 text-xs font-mono rounded-sm hover:border-vgold/30 transition-all"
            style={{ background: selected === m.id ? 'var(--gold)' : 'var(--surf)', color: selected === m.id ? 'var(--bg)' : 'var(--muted)', border: '1px solid var(--bord)' }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Market Price', value: `₹${latest?.avg_sqft?.toLocaleString() ?? '—'}/sqft`, color: 'var(--gold)' },
          { label: 'Guidance Rate', value: `₹${latest?.guidance?.toLocaleString() ?? '—'}/sqft`, color: 'var(--muted)' },
          { label: 'Premium over Guidance', value: `${premiumPct}%`, color: premiumPct > 30 ? 'var(--rc)' : premiumPct > 15 ? 'var(--rb)' : 'var(--ra)' },
          { label: 'QoQ Change', value: `${Number(qoqChange) >= 0 ? '+' : ''}${qoqChange}%`, color: Number(qoqChange) >= 0 ? 'var(--ra)' : 'var(--rc)' },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-syne text-2xl font-bold mb-0.5" style={{ color: k.color }}>{k.value}</div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{k.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Price chart */}
        <div className="lg:col-span-2 p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Kaveri Registration Price — {market.label}</span>
          </div>
          <div className="flex items-center gap-4 mb-3 text-[10px] font-mono">
            <span className="flex items-center gap-1" style={{ color: 'var(--gold)' }}><span className="w-4 h-0.5 inline-block" style={{ background: 'var(--gold)' }} /> Market Actual</span>
            <span className="flex items-center gap-1" style={{ color: 'var(--muted)' }}><span className="w-4 border-t border-dashed inline-block" style={{ borderColor: 'var(--muted)' }} /> Guidance Rate</span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="q" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 2, color: 'var(--ink)', fontSize: 10 }} formatter={(v) => [`₹${Number(v).toLocaleString()}/sqft`, '']} />
                <Area type="monotone" dataKey="avg_sqft" name="Market Price" stroke="var(--gold)" strokeWidth={2} fill="url(#agrad)" />
                <Area type="monotone" dataKey="guidance" name="Guidance" stroke="var(--muted)" strokeWidth={1} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume + absorption */}
          <div className="mt-4 pt-4 grid grid-cols-2 gap-4" style={{ borderTop: '1px solid var(--bord)' }}>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1 block" style={{ color: 'var(--muted)' }}>Registrations / Quarter</span>
              <div className="font-syne text-2xl font-bold" style={{ color: 'var(--ink)' }}>{latest?.deals ?? '—'}</div>
            </div>
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1 block" style={{ color: 'var(--muted)' }}>Absorption Rate</span>
              <div className="font-syne text-2xl font-bold" style={{ color: 'var(--ink)' }}>{latest?.absorption ?? '—'}%</div>
            </div>
          </div>
        </div>

        {/* Market comparison sidebar */}
        <div className="space-y-4">
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3 block" style={{ color: 'var(--muted)' }}>Market Comparison — Latest Quarter</span>
            <div className="space-y-3">
              {markets.map(m => {
                const mh = quarterly[m.id] ?? []
                const ml = mh[mh.length - 1]
                const isSelected = m.id === selected
                const maxPrice = Math.max(...markets.map(mx => quarterly[mx.id]?.[quarterly[mx.id].length - 1]?.avg_sqft ?? 0))
                return (
                  <button key={m.id} onClick={() => setSelected(m.id)} className="w-full text-left hover:border-vgold/30 transition-all">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span style={{ color: isSelected ? 'var(--gold)' : 'var(--ink)' }}>{m.label}</span>
                      <span className="font-mono" style={{ color: isSelected ? 'var(--gold)' : 'var(--muted)' }}>₹{ml?.avg_sqft?.toLocaleString()}/sqft</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--surf2)' }}>
                      <motion.div className="h-full rounded-full" animate={{ width: `${((ml?.avg_sqft ?? 0) / maxPrice) * 100}%` }}
                        style={{ background: isSelected ? 'var(--gold)' : 'var(--muted)', opacity: isSelected ? 1 : 0.4 }} />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 rounded-sm" style={{ background: 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 25%, var(--bord))' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-2 block" style={{ color: 'var(--gold)' }}>Why Kaveri Data Matters</span>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              Developer list prices are aspirational. Kaveri 2.0 shows what buyers actually paid at registration — the only ground truth for pricing, feasibility, and valuation decisions.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
