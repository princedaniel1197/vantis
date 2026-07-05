'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AlertTriangle, ShieldCheck, Layers, ArrowRight } from 'lucide-react'
import marketData from '@/data/dev-market.json'

type QuarterEntry = { q: string; avg_sqft: number; deals: number; absorption: number; guidance: number }
type QuarterlyData = { [key: string]: QuarterEntry[] }

const quarterly = marketData.quarterly as unknown as QuarterlyData
const markets = marketData.micro_markets

type Comparable = { project: string; developer: string; config: string; launch: string; units: number; sold: number; price: number; absorption: number; trust: number; gap: number }

// ⊕ Vantis column — market rows fused with developer integrity (trust score + declared-vs-delivered gap)
const COMPARABLES: Record<string, Comparable[]> = {
  whitefield: [
    { project: 'Meridian Skyline', developer: 'Meridian Group', config: '2/3 BHK', launch: 'Q1 2026', units: 640, sold: 288, price: 11200, absorption: 11.3, trust: 88, gap: 3 },
    { project: 'Prestige Waterford', developer: 'Prestige Group', config: '3/4 BHK', launch: 'Q3 2024', units: 512, sold: 470, price: 12400, absorption: 14.1, trust: 92, gap: 2 },
    { project: 'Skyline Grandeur', developer: 'Skylark Mansions', config: '2/3 BHK', launch: 'Q4 2024', units: 380, sold: 152, price: 9800, absorption: 6.4, trust: 54, gap: 14 },
    { project: 'Whitefield Metrozone', developer: 'Ozone Group', config: '2 BHK', launch: 'Q2 2023', units: 420, sold: 118, price: 8600, absorption: 3.1, trust: 9, gap: 31 },
    { project: 'Mantri Energia', developer: 'Mantri Developers', config: '3 BHK', launch: 'Q1 2024', units: 296, sold: 173, price: 10100, absorption: 7.8, trust: 63, gap: 9 },
  ],
  devanahalli: [
    { project: 'Ozone Urbana', developer: 'Ozone Group', config: '1/2/3 BHK', launch: 'Q4 2019', units: 1847, sold: 628, price: 6400, absorption: 2.1, trust: 9, gap: 32 },
    { project: 'Meridian Edge P2', developer: 'Meridian Group', config: '2/3 BHK', launch: 'Q4 2019', units: 120, sold: 78, price: 6800, absorption: 4.2, trust: 88, gap: 12 },
    { project: 'Brigade Orchards', developer: 'Brigade Group', config: '2/3 BHK', launch: 'Q2 2023', units: 540, sold: 402, price: 7100, absorption: 9.6, trust: 89, gap: 3 },
    { project: 'Sobha Aeropolis', developer: 'Sobha Ltd', config: '3 BHK', launch: 'Q1 2024', units: 288, sold: 190, price: 7400, absorption: 8.2, trust: 86, gap: 4 },
  ],
}

function comparablesFor(id: string, latestPrice: number, absorption: number): Comparable[] {
  if (COMPARABLES[id]) return COMPARABLES[id]
  // Deterministic fallback trio so every market shows the trust overlay
  return [
    { project: 'Prestige Enclave', developer: 'Prestige Group', config: '2/3 BHK', launch: 'Q2 2024', units: 420, sold: 310, price: Math.round(latestPrice * 1.04), absorption: +(absorption * 1.1).toFixed(1), trust: 92, gap: 2 },
    { project: 'Brigade Vista', developer: 'Brigade Group', config: '3 BHK', launch: 'Q4 2024', units: 360, sold: 240, price: latestPrice, absorption, trust: 89, gap: 3 },
    { project: 'Skylark Heights', developer: 'Skylark Mansions', config: '2 BHK', launch: 'Q1 2024', units: 300, sold: 108, price: Math.round(latestPrice * 0.9), absorption: +(absorption * 0.6).toFixed(1), trust: 54, gap: 15 },
  ]
}

const trustColor = (t: number) => (t >= 75 ? 'var(--ra)' : t >= 50 ? 'var(--rb)' : 'var(--rc)')

export default function MarketPage() {
  const [selected, setSelected] = useState(markets[0].id)
  const market = markets.find(m => m.id === selected)!
  const history = quarterly[selected] ?? []
  const latest = history[history.length - 1]
  const prev = history[history.length - 2]
  const qoqChange = prev ? (((latest?.avg_sqft ?? 0) - (prev?.avg_sqft ?? 0)) / (prev?.avg_sqft ?? 1) * 100).toFixed(1) : '0'
  const premiumPct = latest ? Math.round(((latest.avg_sqft - latest.guidance) / latest.guidance) * 100) : 0

  const comps = comparablesFor(selected, latest?.avg_sqft ?? 0, latest?.absorption ?? 0)
  const flagged = comps.filter(c => c.gap >= 10)
  const totalPipeline = comps.reduce((s, c) => s + (c.units - c.sold), 0)

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

      {/* Stage 6 — Comparables + supply pipeline + ⊕ developer-trust overlay */}
      <div className="mt-6">
        {/* Supply pipeline + trust-overlay verdict */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="flex items-center gap-2 mb-1"><Layers className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} /><span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Supply Pipeline</span></div>
            <div className="font-display italic text-3xl" style={{ color: 'var(--ink)' }}>{totalPipeline.toLocaleString()}</div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>unsold units across {comps.length} active projects</div>
          </div>
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="flex items-center gap-2 mb-1"><span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Months to Absorb</span></div>
            <div className="font-display italic text-3xl" style={{ color: 'var(--ink)' }}>{latest && latest.absorption > 0 ? Math.round(totalPipeline / (comps.reduce((s, c) => s + c.absorption, 0)) ) : '—'}</div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>at current absorption velocity</div>
          </div>
          <div className="p-4 rounded-sm lg:col-span-1" style={{ background: flagged.length ? 'color-mix(in srgb, var(--rc) 5%, var(--surf))' : 'color-mix(in srgb, var(--ra) 5%, var(--surf))', border: `1px solid ${flagged.length ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'color-mix(in srgb, var(--ra) 30%, var(--bord))'}` }}>
            <div className="flex items-center gap-2 mb-1">{flagged.length ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--rc)' }} /> : <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--ra)' }} />}<span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Integrity Overlay</span></div>
            <div className="text-xs leading-relaxed mt-1" style={{ color: flagged.length ? 'var(--rc)' : 'var(--muted)' }}>
              {flagged.length
                ? `This micro-market looks hot, but ${flagged.length} of ${comps.length} active developers here have declared-vs-delivered gaps.`
                : 'All active developers here are records-clean on declared-vs-delivered.'}
            </div>
          </div>
        </div>

        <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Comparables — {market.label}</span>
            <span className="font-mono text-[9px] ml-auto flex items-center gap-1" style={{ color: 'var(--gold)' }}><ShieldCheck className="w-3 h-3" /> Vantis trust overlay</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--bord)' }}>
                  {['Project', 'Developer', 'Config', 'Launch', 'Units', 'Sold', 'Unsold', '₹/sqft', 'Absorption', 'Trust', 'Gap'].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-mono text-[9px] uppercase tracking-[0.15em] whitespace-nowrap" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comps.map((c, i) => (
                  <motion.tr key={c.project} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: i < comps.length - 1 ? '1px solid var(--bord)' : 'none', background: c.gap >= 10 ? 'color-mix(in srgb, var(--rc) 4%, transparent)' : 'transparent' }}>
                    <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--ink)' }}>{c.project}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--muted)' }}>{c.developer}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] whitespace-nowrap" style={{ color: 'var(--muted)' }}>{c.config}</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] whitespace-nowrap" style={{ color: 'var(--muted)' }}>{c.launch}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: 'var(--ink)' }}>{c.units}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: 'var(--ink)' }}>{c.sold}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: 'var(--muted)' }}>{c.units - c.sold}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: 'var(--gold)' }}>₹{c.price.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: 'var(--ink)' }}>{c.absorption}%</td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center gap-1.5 font-mono" style={{ color: trustColor(c.trust) }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: trustColor(c.trust) }} />{c.trust}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono" style={{ color: c.gap >= 10 ? 'var(--rc)' : 'var(--muted)' }}>{c.gap >= 10 ? `−${c.gap}pt` : `${c.gap}pt`}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          <div className="font-mono text-[10px] flex-1 min-w-[220px]" style={{ color: 'var(--muted)' }}>
            PropEquity has the market. Only Vantis adds the trust layer — descriptive market data fused with behavioural integrity data.
          </div>
          <Link href="/certificate" className="font-mono text-[10px] flex items-center gap-1 shrink-0 hover:underline" style={{ color: 'var(--gold)' }}>
            See developer reputation scores <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
