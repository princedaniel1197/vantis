'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, Database, Activity, BarChart2, Info } from 'lucide-react'
import { useConnect, T } from '../ConnectContext'
import marketData from '@/data/connect-market.json'

const {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} = {
  LineChart: dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false }),
  Line: dynamic(() => import('recharts').then(m => m.Line), { ssr: false }),
  BarChart: dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false }),
  Bar: dynamic(() => import('recharts').then(m => m.Bar), { ssr: false }),
  XAxis: dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false }),
  YAxis: dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false }),
  CartesianGrid: dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false }),
  Tooltip: dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false }),
  Legend: dynamic(() => import('recharts').then(m => m.Legend), { ssr: false }),
  ResponsiveContainer: dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false }),
  ReferenceLine: dynamic(() => import('recharts').then(m => m.ReferenceLine), { ssr: false }),
}

const MARKET_COLORS: Record<string, string> = {
  whitefield: '#C9A84C',
  devanahalli: '#3498DB',
  sarjapur: '#9B59B6',
  hebbal: '#E74C3C',
  kr_puram: '#2ECC71',
}

const MARKET_IDS = ['whitefield', 'devanahalli', 'sarjapur', 'hebbal', 'kr_puram']

type MarketId = 'whitefield' | 'devanahalli' | 'sarjapur' | 'hebbal' | 'kr_puram'

const CONFIG_COLORS: Record<string, string> = {
  '1BHK': '#3498DB',
  '2BHK': '#9B59B6',
  '3BHK': '#C9A84C',
  '4BHK': '#E74C3C',
}

const CustomTooltipStyle = {
  background: '#0F0F1A',
  border: '1px solid #1E1E2E',
  borderRadius: '2px',
  fontFamily: 'var(--font-dm-mono, monospace)',
  fontSize: '11px',
  color: '#E8E4DC',
  padding: '0.5rem 0.75rem',
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{
      padding: '1rem',
      background: '#0F0F1A',
      border: '1px solid #1E1E2E',
      borderRadius: '2px',
    }}>
      <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3A3A52', marginBottom: '0.375rem' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '22px', color: color ?? '#C9A84C', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4A62', marginTop: '4px' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

export default function ConnectMarketPage() {
  const { lang } = useConnect()
  const t = T[lang]
  const [selectedMarket, setSelectedMarket] = useState<MarketId>('whitefield')
  const [activePriceSeries, setActivePriceSeries] = useState<Set<string>>(new Set(MARKET_IDS))

  const micro = marketData.micro_markets.find(m => m.id === selectedMarket)
  const gapData = marketData.kaveri_vs_asking
  const configDemand = marketData.config_demand as Record<string, Record<string, number>>
  const absData = marketData.absorption_quarterly

  const configChartData = Object.entries(configDemand[selectedMarket] ?? {}).map(([config, units]) => ({
    config,
    units,
  }))

  const gapChartData = MARKET_IDS.map(id => ({
    market: marketData.micro_markets.find(m => m.id === id)?.label ?? id,
    asking: (gapData as Record<string, { avg_asking_psf: number; avg_kaveri_psf: number; gap_pct: number }>)[id]?.avg_asking_psf ?? 0,
    kaveri: (gapData as Record<string, { avg_asking_psf: number; avg_kaveri_psf: number; gap_pct: number }>)[id]?.avg_kaveri_psf ?? 0,
    gap: (gapData as Record<string, { avg_asking_psf: number; avg_kaveri_psf: number; gap_pct: number }>)[id]?.gap_pct ?? 0,
  }))

  const priceData = marketData.price_trend as Record<string, number | string>[]

  const toggleSeries = (id: string) => {
    setActivePriceSeries(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 100px)', background: '#0A0A0F', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
            Market Intelligence · Kaveri 2.0 Registration Data
          </div>
          <h1 style={{ fontFamily: 'var(--font-cg, serif)', fontStyle: 'italic', fontSize: '28px', color: '#F0EEE8', lineHeight: 1.2, marginBottom: '0.375rem' }}>
            {t.market_title}
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#5A5A72' }}>
            {t.market_sub}
          </p>
        </div>

        {/* Micro-market selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {marketData.micro_markets.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMarket(m.id as MarketId)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '2px',
                border: selectedMarket === m.id
                  ? `1px solid ${MARKET_COLORS[m.id]}60`
                  : '1px solid #1E1E2E',
                background: selectedMarket === m.id
                  ? `${MARKET_COLORS[m.id]}12`
                  : 'transparent',
                fontFamily: 'var(--font-dm-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                color: selectedMarket === m.id ? MARKET_COLORS[m.id] : '#4A4A62',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: MARKET_COLORS[m.id] }} />
              {lang === 'kn' ? m.label_kn : m.label}
            </button>
          ))}
        </div>

        {/* Selected market stat cards */}
        {micro && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
            <StatCard label={t.avg_psf} value={`₹${micro.avg_psf.toLocaleString()}`} sub="per sqft" color={MARKET_COLORS[selectedMarket]} />
            <StatCard label={t.yoy} value={`+${micro.yoy_growth}%`} sub="Kaveri price YoY" color="#2ECC71" />
            <StatCard label={t.inventory} value={micro.inventory.toLocaleString()} sub="active units" color="#C9A84C" />
            <StatCard label="Absorption" value={`${micro.absorption_rate}%`} sub="monthly rate" color="#3498DB" />
          </div>
        )}

        {/* Price trend chart */}
        <div style={{
          background: '#0F0F1A',
          border: '1px solid #1E1E2E',
          borderRadius: '2px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4A62' }}>
              {t.price_trend}
            </div>
            {/* Series toggles */}
            <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
              {MARKET_IDS.map(id => {
                const label = marketData.micro_markets.find(m => m.id === id)?.label ?? id
                const active = activePriceSeries.has(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggleSeries(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      border: `1px solid ${active ? MARKET_COLORS[id] + '50' : '#1E1E2E'}`,
                      background: active ? MARKET_COLORS[id] + '10' : 'transparent',
                      fontFamily: 'var(--font-dm-mono, monospace)',
                      fontSize: '9px',
                      color: active ? MARKET_COLORS[id] : '#3A3A52',
                      cursor: 'pointer',
                      opacity: active ? 1 : 0.5,
                    }}
                  >
                    <div style={{ width: '6px', height: '2px', background: MARKET_COLORS[id], borderRadius: '1px' }} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2A" />
              <XAxis dataKey="month" tick={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, fill: '#4A4A62' }} axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, fill: '#4A4A62' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} width={52} />
              <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: unknown) => [`₹${Number(v).toLocaleString()}/sqft`, '']} />
              {MARKET_IDS.filter(id => activePriceSeries.has(id)).map(id => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={MARKET_COLORS[id]}
                  strokeWidth={id === selectedMarket ? 2.5 : 1.5}
                  dot={false}
                  name={marketData.micro_markets.find(m => m.id === id)?.label ?? id}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom row: config demand + kaveri vs asking gap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* Config demand bar chart */}
          <div style={{
            background: '#0F0F1A',
            border: '1px solid #1E1E2E',
            borderRadius: '2px',
            padding: '1.25rem',
          }}>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4A62', marginBottom: '1rem' }}>
              {t.config_demand} — {lang === 'kn' ? micro?.label_kn : micro?.label}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={configChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2A" />
                <XAxis dataKey="config" tick={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, fill: '#4A4A62' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: 'var(--font-dm-mono)', fontSize: 10, fill: '#4A4A62' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: unknown) => [`${Number(v)} units`, '']} />
                <Bar dataKey="units" radius={[2, 2, 0, 0]} fill={MARKET_COLORS[selectedMarket]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Kaveri vs Asking gap */}
          <div style={{
            background: '#0F0F1A',
            border: '1px solid #1E1E2E',
            borderRadius: '2px',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4A62' }}>
                {t.kaveri_vs_asking}
              </div>
              <div style={{ marginLeft: 'auto', padding: '2px 6px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '2px' }}>
                <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#E74C3C' }}>
                  Avg gap: ~9.5%
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gapChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A2A" horizontal={false} />
                <XAxis type="number" tick={{ fontFamily: 'var(--font-dm-mono)', fontSize: 9, fill: '#4A4A62' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="market" tick={{ fontFamily: 'var(--font-dm-mono)', fontSize: 9, fill: '#4A4A62' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: unknown, name: unknown) => [`₹${Number(v).toLocaleString()}/sqft`, name === 'asking' ? 'Asking' : 'Kaveri']} />
                <Bar dataKey="kaveri" name="kaveri" fill="#C9A84C" radius={[0, 2, 2, 0]} barSize={8} />
                <Bar dataKey="asking" name="asking" fill="#3A3A52" radius={[0, 2, 2, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#C9A84C' }}>
                <div style={{ width: '8px', height: '8px', background: '#C9A84C', borderRadius: '1px' }} />
                Kaveri (actual)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#6B6B88' }}>
                <div style={{ width: '8px', height: '8px', background: '#3A3A52', borderRadius: '1px' }} />
                Asking (claimed)
              </div>
            </div>
          </div>
        </div>

        {/* Absorption table */}
        <div style={{
          background: '#0F0F1A',
          border: '1px solid #1E1E2E',
          borderRadius: '2px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4A62', marginBottom: '1rem' }}>
            {t.absorption} — Units Registered per Quarter (2025)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A3A52', borderBottom: '1px solid #1A1A2A' }}>Quarter</th>
                  {MARKET_IDS.map(id => (
                    <th key={id} style={{ textAlign: 'right', padding: '0.5rem 0.75rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: MARKET_COLORS[id], borderBottom: '1px solid #1A1A2A' }}>
                      {marketData.micro_markets.find(m => m.id === id)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {absData.map((row, i) => (
                  <tr key={row.quarter} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#4A4A62' }}>{row.quarter}</td>
                    {MARKET_IDS.map(id => (
                      <td key={id} style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: id === selectedMarket ? MARKET_COLORS[id] : '#6B6B88', textAlign: 'right', fontWeight: id === selectedMarket ? 600 : 400 }}>
                        {(row as Record<string, number | string>)[id] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top deals */}
        <div style={{
          background: '#0F0F1A',
          border: '1px solid #1E1E2E',
          borderRadius: '2px',
          padding: '1.25rem',
        }}>
          <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4A62', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Database style={{ width: '11px', height: '11px' }} />
            Top Kaveri-Registered Deals, 2025
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {marketData.top_deals_2025.map((deal, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.625rem 0.75rem', background: '#0A0A0F', borderRadius: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '12px', color: '#C9A84C', width: '24px', flexShrink: 0 }}>#{i + 1}</span>
                <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#E8E4DC', flex: 1, minWidth: '140px' }}>{deal.project}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: MARKET_COLORS[(deal.market.toLowerCase().replace(' ', '_')) as MarketId] ?? '#4A4A62', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '2px' }}>{deal.market}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4A62' }}>{deal.config}</span>
                <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '13px', color: '#C9A84C', marginLeft: 'auto' }}>₹{deal.kaveri_price_cr.toFixed(2)} Cr</span>
                <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#3A3A52' }}>{deal.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source footer */}
        <div style={{ marginTop: '1.5rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#2A2A3E', letterSpacing: '0.1em' }}>
          {t.source_label}
        </div>
      </div>
    </div>
  )
}
