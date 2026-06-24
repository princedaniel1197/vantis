'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const COMPETITORS = [
  { id: 'divya-villas',     name: 'Divya Villas',           developer: 'JDA Projects',       units: 73,  sold: 4,   monthly: 1.2, price_sqft: 3800, rera: 'PRM/KA/RERA/1251/309/PR/2021/001', km: 0,   angle: 0 },
  { id: 'prestige-south',   name: 'Prestige South Square',  developer: 'Prestige Group',     units: 280, sold: 142, monthly: 8.4, price_sqft: 5200, rera: 'PRM/KA/RERA/1251/001/PR/2022/003', km: 0.8, angle: 45 },
  { id: 'sobha-horizon',    name: 'Sobha Horizon',          developer: 'Sobha Ltd',          units: 180, sold: 95,  monthly: 4.1, price_sqft: 4900, rera: 'PRM/KA/RERA/1251/002/PR/2022/005', km: 1.2, angle: 120 },
  { id: 'brigade-lakeview', name: 'Brigade Lakeview',       developer: 'Brigade Group',      units: 240, sold: 88,  monthly: 3.8, price_sqft: 4600, rera: 'PRM/KA/RERA/1251/003/PR/2023/001', km: 1.5, angle: 200 },
  { id: 'skylark-horizon',  name: 'Skylark Horizon',        developer: 'Skylark Mansions',   units: 140, sold: 22,  monthly: 1.1, price_sqft: 3600, rera: 'PRM/KA/RERA/1251/004/PR/2023/002', km: 1.8, angle: 270 },
  { id: 'mantri-enclave',   name: 'Mantri Enclave',         developer: 'Mantri Developers',  units: 320, sold: 67,  monthly: 2.9, price_sqft: 4200, rera: 'PRM/KA/RERA/1251/005/PR/2022/008', km: 2.3, angle: 310 },
] as const

type Competitor = typeof COMPETITORS[number]

const CX = 300
const CY = 250
const SCALE = 80

function toXY(km: number, angle: number) {
  return {
    x: CX + Math.cos((angle * Math.PI) / 180) * km * SCALE,
    y: CY + Math.sin((angle * Math.PI) / 180) * km * SCALE,
  }
}

function absorptionPct(c: Competitor) {
  return Math.round((c.sold / c.units) * 100)
}

function absorptionColor(pct: number) {
  if (pct > 60) return '#E74C3C'
  if (pct > 35) return '#F39C12'
  return '#2ECC71'
}

export default function MarketPage() {
  const [selected, setSelected] = useState<Competitor>(COMPETITORS[0])

  return (
    <div className="min-h-screen bg-background p-5 max-w-[1100px] mx-auto">
      <Link
        href="/build"
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Build Hub
      </Link>

      <div className="mb-6">
        <h1 className="font-syne text-2xl text-off-white">Competitive Supply Intelligence</h1>
        <p className="text-gray text-sm mt-1">
          Every RERA-registered project within 2.5km · K-RERA-filed pricing · real absorption velocity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radius map */}
        <div className="bg-surface border border-border rounded-sm p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">
            2.5 km Radius Map · Mysuru
          </div>
          <svg viewBox="0 0 600 500" className="w-full">
            <rect width="600" height="500" fill="#0A0A15" />
            {/* Radius circles */}
            {[1, 1.5, 2, 2.5].map(r => (
              <circle
                key={r}
                cx={CX} cy={CY}
                r={r * SCALE}
                fill="none"
                stroke="#1E1E2E"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            ))}
            {[1, 2].map(r => (
              <text key={r} x={CX + r * SCALE + 4} y={CY + 10} fill="#3A3A5A" fontSize="9" fontFamily="monospace">
                {r}km
              </text>
            ))}
            {/* Competitor nodes */}
            {COMPETITORS.map(c => {
              const pos = toXY(c.km, c.angle)
              const isSubject  = c.km === 0
              const isSelected = c.id === selected.id
              const radius     = isSubject ? 14 : 10
              const absorb     = absorptionPct(c)
              const nodeColor  = absorptionColor(absorb)
              return (
                <g key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={radius}
                    fill={isSelected || isSubject ? '#C9A84C' : nodeColor}
                    opacity={isSelected || isSubject ? 1 : 0.7}
                    stroke={isSelected ? '#C9A84C' : 'transparent'}
                    strokeWidth="3"
                    strokeOpacity={0.4}
                  />
                  <text
                    x={pos.x} y={pos.y - radius - 4}
                    textAnchor="middle"
                    fill="#9090AA"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {c.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                  <text
                    x={pos.x} y={pos.y + 3}
                    textAnchor="middle"
                    fill="#0A0A15"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {absorb}%
                  </text>
                </g>
              )
            })}
            <text x={CX} y={CY + 30} textAnchor="middle" fill="#C9A84C" fontSize="8" fontFamily="monospace">
              Subject
            </text>
            <text x="20" y="488" fill="#3A3A5A" fontSize="8" fontFamily="monospace">
              Node size indicates units. % = absorption. Source: K-RERA filings.
            </text>
          </svg>
        </div>

        {/* Detail panel + table */}
        <div className="flex flex-col gap-4">
          {/* Selected project detail */}
          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gold mb-3">
              {selected.name}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Developer',   value: selected.developer },
                { label: 'Distance',    value: selected.km === 0 ? 'Subject project' : `${selected.km} km` },
                { label: 'Total Units', value: String(selected.units) },
                { label: 'Sold',        value: `${selected.sold} (${absorptionPct(selected)}%)` },
                { label: 'Absorption',  value: `${selected.monthly} units/month` },
                { label: 'Price/sqft',  value: `₹${selected.price_sqft.toLocaleString()}` },
              ].map(f => (
                <div key={f.label}>
                  <div className="text-[9px] font-mono uppercase text-gray mb-0.5">{f.label}</div>
                  <div className="text-off-white font-mono">{f.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[9px] font-mono text-gray border-t border-border pt-3">
              {selected.rera}
            </div>
          </div>

          {/* Market intelligence callout */}
          <div className="bg-gold/[0.08] border border-gold/25 rounded-sm p-4">
            <p className="text-xs text-gold-light leading-relaxed">
              Prestige South Square is absorbing 8.4 units/month at ₹5,200/sqft — 37% premium to
              Divya Villas. Positioning opportunity: same sub-market, lower price, lower absorption.
              Pricing can move up ₹200–300/sqft without demand risk.
            </p>
          </div>

          {/* Competitor table */}
          <div className="bg-surface border border-border rounded-sm overflow-hidden">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-surface2">
                <tr>
                  {['Project', '₹/sqft', 'Units/mo', 'Absorb %'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-mono uppercase text-gray">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`border-b border-border/40 last:border-0 cursor-pointer transition-colors ${
                      selected.id === c.id ? 'bg-gold/[0.08]' : 'hover:bg-surface2/60'
                    }`}
                  >
                    <td className="px-3 py-2 text-off-white whitespace-nowrap">
                      {c.name.split(' ').slice(0, 3).join(' ')}
                    </td>
                    <td className="px-3 py-2 font-mono text-off-white">
                      ₹{c.price_sqft.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 font-mono text-gold">{c.monthly}</td>
                    <td
                      className="px-3 py-2 font-mono"
                      style={{ color: absorptionColor(absorptionPct(c)) }}
                    >
                      {absorptionPct(c)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
