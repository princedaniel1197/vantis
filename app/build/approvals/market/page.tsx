'use client'

import { useState } from 'react'

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

// Road segment pairs (indices into COMPETITORS array)
const ROAD_PAIRS: [number, number][] = [
  [0, 1], // center → prestige
  [0, 2], // center → sobha
  [0, 3], // center → brigade
  [1, 2], // prestige → sobha
  [2, 3], // sobha → brigade
  [3, 4], // brigade → skylark
  [4, 5], // skylark → mantri
  [1, 5], // prestige → mantri
]

export default function MarketPage() {
  const [selected, setSelected] = useState<Competitor>(COMPETITORS[0])

  const positions = COMPETITORS.map(c => toXY(c.km, c.angle))

  return (
    <div className="min-h-screen bg-background p-5 max-w-[1100px] mx-auto">
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

            {/* Inner ring tint (0–1km) */}
            <circle cx={CX} cy={CY} r={1 * SCALE} fill="#1E2E1E" opacity="0.35" />

            {/* Distance rings */}
            {[1, 1.5, 2, 2.5].map(r => (
              <circle
                key={r}
                cx={CX} cy={CY}
                r={r * SCALE}
                fill="none"
                stroke={r <= 1 ? '#2A3A2A' : '#1E1E2E'}
                strokeWidth={r <= 1 ? '1.5' : '1'}
                strokeDasharray={r <= 1 ? '6 3' : '4 3'}
              />
            ))}

            {/* Ring labels */}
            {[1, 1.5, 2, 2.5].map(r => (
              <g key={`label-${r}`}>
                <rect
                  x={CX + r * SCALE + 3}
                  y={CY - 8}
                  width={r === 2.5 ? 26 : r === 1.5 ? 26 : 20}
                  height={14}
                  rx="2"
                  fill="rgba(10,10,21,0.75)"
                />
                <text
                  x={CX + r * SCALE + 6}
                  y={CY + 3}
                  fill="#4A4A6A"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {r}km
                </text>
              </g>
            ))}

            {/* Road network (faint curved paths between nodes) */}
            {ROAD_PAIRS.map(([a, b], i) => {
              const pa = positions[a]
              const pb = positions[b]
              // Slight bezier curve for road feel
              const mx = (pa.x + pb.x) / 2 + (Math.random() > 0.5 ? 12 : -12)
              const my = (pa.y + pb.y) / 2 + (Math.random() > 0.5 ? 8 : -8)
              return (
                <path
                  key={i}
                  d={`M ${pa.x} ${pa.y} Q ${mx} ${my} ${pb.x} ${pb.y}`}
                  fill="none"
                  stroke="#1E1E30"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )
            })}

            {/* Competitor nodes (non-subject) */}
            {COMPETITORS.filter(c => c.km > 0).map(c => {
              const pos = toXY(c.km, c.angle)
              const isSelected = c.id === selected.id
              const absorb = absorptionPct(c)
              const nodeColor = absorptionColor(absorb)
              return (
                <g key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={12}
                    fill={isSelected ? '#C9A84C' : nodeColor}
                    opacity={isSelected ? 1 : 0.75}
                    stroke={isSelected ? '#F4D48C' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isSelected ? '2' : '1'}
                  />
                  {/* Label chip */}
                  <rect
                    x={pos.x - 36}
                    y={pos.y - 28}
                    width="72"
                    height="14"
                    rx="2"
                    fill="rgba(15,15,26,0.85)"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 18}
                    textAnchor="middle"
                    fill={isSelected ? '#C9A84C' : '#9090AA'}
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {c.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#000' : '#0A0A15'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {absorb}%
                  </text>
                </g>
              )
            })}

            {/* Subject project — Divya Villas — gold with cross-hairs */}
            <g onClick={() => setSelected(COMPETITORS[0])} style={{ cursor: 'pointer' }}>
              {/* Outer glow ring */}
              <circle cx={CX} cy={CY} r="20" fill="rgba(201,168,76,0.12)" stroke="#C9A84C" strokeWidth="1" strokeDasharray="3 2" />
              {/* Main gold circle */}
              <circle cx={CX} cy={CY} r="14" fill="#C9A84C" stroke="#F4D48C" strokeWidth="1.5" />
              {/* Cross-hairs */}
              <line x1={CX - 9} y1={CY} x2={CX + 9} y2={CY} stroke="#0A0A0F" strokeWidth="1.5" />
              <line x1={CX} y1={CY - 9} x2={CX} y2={CY + 9} stroke="#0A0A0F" strokeWidth="1.5" />
              {/* Subject label chip */}
              <rect x={CX - 30} y={CY + 18} width="60" height="14" rx="2" fill="rgba(15,15,26,0.9)" />
              <text x={CX} y={CY + 28} textAnchor="middle" fill="#C9A84C" fontSize="8" fontFamily="monospace" fontWeight="bold">
                Subject
              </text>
            </g>

            {/* North arrow — top right */}
            <g>
              <text x="572" y="32" fontFamily="monospace" fontSize="10" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
              <line x1="572" y1="36" x2="572" y2="52" stroke="#C9A84C" strokeWidth="1.2" />
              <polygon points="572,36 569,46 572,42 575,46" fill="#C9A84C" />
            </g>

            {/* Scale bar — bottom left */}
            <g>
              <line x1="20" y1="478" x2="60" y2="478" stroke="#4A4A6A" strokeWidth="1.5" />
              <line x1="20" y1="474" x2="20" y2="482" stroke="#4A4A6A" strokeWidth="1.5" />
              <line x1="60" y1="474" x2="60" y2="482" stroke="#4A4A6A" strokeWidth="1.5" />
              <text x="40" y="492" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#4A4A6A">500m</text>
            </g>

            {/* Legend */}
            <text x="20" y="468" fill="#3A3A5A" fontSize="8" fontFamily="monospace">
              % = absorption · Source: K-RERA filings
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
