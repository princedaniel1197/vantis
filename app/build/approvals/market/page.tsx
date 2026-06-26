'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

const ROAD_PAIRS: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [4, 5], [1, 5],
]

// Pre-computed control-point offsets — deterministic road curves (no Math.random in render)
const ROAD_OFFSETS: [number, number][] = [
  [ 12, -10], [-14,   8], [ 10,  10], [-10,   8],
  [ 14,  10], [-12,  -8], [ 10,  10], [-10,  -8],
]

export default function MarketPage() {
  const [selected, setSelected] = useState<Competitor>(COMPETITORS[0])

  const positions = COMPETITORS.map(c => toXY(c.km, c.angle))

  return (
    <div className="min-h-screen bg-background p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/build" className="text-gray hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[10px] font-mono text-gray uppercase tracking-[0.12em]">Build Hub</span>
          <span className="text-border text-xs">/</span>
          <span className="text-[10px] font-mono text-gray-light uppercase tracking-[0.12em]">Competitive Supply</span>
        </div>
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
            <defs>
              <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(46,100,46,0.14)"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
              <radialGradient id="bgFade" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0D0D1A"/>
                <stop offset="100%" stopColor="#080810"/>
              </radialGradient>
              <pattern id="cityGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <rect width="24" height="24" fill="none" stroke="rgba(255,255,255,0.016)" strokeWidth="0.4"/>
              </pattern>
            </defs>

            {/* Background */}
            <rect width="600" height="500" fill="url(#bgFade)"/>
            <rect width="600" height="500" fill="url(#cityGrid)"/>

            {/* Faint city block shapes — urban fabric suggestion */}
            {[
              [118, 58,  82, 40], [222, 46,  62, 30], [382, 86,  72, 44],
              [462, 148, 56, 34], [78,  298, 68, 38], [58,  158, 52, 30],
              [442, 338, 74, 42], [128, 388, 62, 32], [328, 418, 60, 34],
              [480, 240, 48, 28], [200, 420, 54, 30], [520, 380, 62, 36],
            ].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="2"
                fill="rgba(255,255,255,0.011)"
                stroke="rgba(255,255,255,0.02)" strokeWidth="0.4"
              />
            ))}

            {/* Distance ring fills */}
            <circle cx={CX} cy={CY} r={2.5 * SCALE} fill="rgba(22,22,44,0.28)"/>
            <circle cx={CX} cy={CY} r={2.0 * SCALE} fill="rgba(22,22,44,0.18)"/>
            <circle cx={CX} cy={CY} r={1.5 * SCALE} fill="rgba(22,22,44,0.14)"/>
            <circle cx={CX} cy={CY} r={1.0 * SCALE} fill="rgba(28,48,28,0.18)"/>
            <circle cx={CX} cy={CY} r={0.5 * SCALE} fill="url(#innerGlow)"/>

            {/* Distance ring outlines */}
            {[1, 1.5, 2, 2.5].map(r => (
              <circle
                key={r}
                cx={CX} cy={CY}
                r={r * SCALE}
                fill="none"
                stroke={r <= 1 ? '#283828' : '#1C1C30'}
                strokeWidth={r <= 1 ? '1.5' : '1'}
                strokeDasharray={r <= 1 ? '7 4' : '5 4'}
              />
            ))}

            {/* Ring distance labels */}
            {[1, 1.5, 2, 2.5].map(r => (
              <g key={`label-${r}`}>
                <rect
                  x={CX + r * SCALE + 3} y={CY - 9}
                  width={r === 2.5 ? 28 : r === 1.5 ? 28 : 22}
                  height={15} rx="2"
                  fill="rgba(8,8,18,0.88)"
                />
                <text
                  x={CX + r * SCALE + 7} y={CY + 3}
                  fill="#383858" fontSize="9" fontFamily="monospace"
                >
                  {r}km
                </text>
              </g>
            ))}

            {/* Road network — wider + center line */}
            {ROAD_PAIRS.map(([a, b], i) => {
              const pa = positions[a]
              const pb = positions[b]
              const [ox, oy] = ROAD_OFFSETS[i]
              const mx = (pa.x + pb.x) / 2 + ox
              const my = (pa.y + pb.y) / 2 + oy
              return (
                <path
                  key={i}
                  d={`M ${pa.x} ${pa.y} Q ${mx} ${my} ${pb.x} ${pb.y}`}
                  fill="none"
                  stroke="#1A1A2C"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )
            })}
            {ROAD_PAIRS.map(([a, b], i) => {
              const pa = positions[a]
              const pb = positions[b]
              const [ox, oy] = ROAD_OFFSETS[i]
              const mx = (pa.x + pb.x) / 2 + ox
              const my = (pa.y + pb.y) / 2 + oy
              return (
                <path
                  key={`cl-${i}`}
                  d={`M ${pa.x} ${pa.y} Q ${mx} ${my} ${pb.x} ${pb.y}`}
                  fill="none"
                  stroke="#262640"
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  strokeDasharray="6 5"
                />
              )
            })}

            {/* Competitor nodes */}
            {COMPETITORS.filter(c => c.km > 0).map(c => {
              const pos = toXY(c.km, c.angle)
              const isSelected = c.id === selected.id
              const absorb = absorptionPct(c)
              const nodeColor = absorptionColor(absorb)
              return (
                <g key={c.id} onClick={() => setSelected(c)} style={{ cursor: 'pointer' }}>
                  {/* Outer glow */}
                  <circle cx={pos.x} cy={pos.y} r={isSelected ? 18 : 16}
                    fill="rgba(8,8,18,0.5)"
                    stroke={isSelected ? '#C9A84C' : nodeColor}
                    strokeWidth={isSelected ? '1.2' : '0.6'}
                    opacity={0.4}
                  />
                  {/* Main node */}
                  <circle
                    cx={pos.x} cy={pos.y} r={12}
                    fill={isSelected ? '#C9A84C' : nodeColor}
                    opacity={isSelected ? 1 : 0.82}
                    stroke={isSelected ? '#F4D48C' : 'rgba(255,255,255,0.12)'}
                    strokeWidth={isSelected ? '2' : '1'}
                  />
                  {/* Label chip */}
                  <rect
                    x={pos.x - 38} y={pos.y - 30}
                    width="76" height="14" rx="2"
                    fill="rgba(8,8,18,0.9)"
                    stroke={isSelected ? 'rgba(201,168,76,0.35)' : 'rgba(36,36,60,0.8)'}
                    strokeWidth="0.5"
                  />
                  <text x={pos.x} y={pos.y - 19} textAnchor="middle"
                    fill={isSelected ? '#C9A84C' : '#707098'}
                    fontSize="8" fontFamily="monospace"
                  >
                    {c.name.split(' ').slice(0, 2).join(' ')}
                  </text>
                  <text x={pos.x} y={pos.y + 4} textAnchor="middle"
                    fill={isSelected ? '#000' : '#0A0A15'}
                    fontSize="9" fontFamily="monospace" fontWeight="bold"
                  >
                    {absorb}%
                  </text>
                </g>
              )
            })}

            {/* Subject project — Divya Villas */}
            <g onClick={() => setSelected(COMPETITORS[0])} style={{ cursor: 'pointer' }}>
              <circle cx={CX} cy={CY} r="22" fill="rgba(201,168,76,0.08)" stroke="#C9A84C" strokeWidth="1" strokeDasharray="3 2"/>
              <circle cx={CX} cy={CY} r="16" fill="rgba(201,168,76,0.12)" stroke="#C9A84C" strokeWidth="0.6" opacity="0.6"/>
              <circle cx={CX} cy={CY} r="13" fill="#C9A84C" stroke="#F4D48C" strokeWidth="1.5"/>
              <line x1={CX - 8} y1={CY} x2={CX + 8} y2={CY} stroke="#0A0A0F" strokeWidth="1.5"/>
              <line x1={CX} y1={CY - 8} x2={CX} y2={CY + 8} stroke="#0A0A0F" strokeWidth="1.5"/>
              <rect x={CX - 30} y={CY + 18} width="60" height="14" rx="2"
                fill="rgba(8,8,18,0.92)" stroke="rgba(201,168,76,0.4)" strokeWidth="0.5"/>
              <text x={CX} y={CY + 28} textAnchor="middle" fill="#C9A84C" fontSize="8" fontFamily="monospace" fontWeight="bold">
                Subject
              </text>
            </g>

            {/* North arrow */}
            <g>
              <text x="572" y="32" fontFamily="monospace" fontSize="10" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
              <line x1="572" y1="36" x2="572" y2="52" stroke="#C9A84C" strokeWidth="1.2"/>
              <polygon points="572,36 569,46 572,42 575,46" fill="#C9A84C"/>
            </g>

            {/* Scale bar */}
            <g>
              <line x1="20" y1="478" x2="60" y2="478" stroke="#363656" strokeWidth="1.5"/>
              <line x1="20" y1="474" x2="20" y2="482" stroke="#363656" strokeWidth="1.5"/>
              <line x1="60" y1="474" x2="60" y2="482" stroke="#363656" strokeWidth="1.5"/>
              <text x="40" y="492" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#363656">500m</text>
            </g>

            {/* Absorption legend */}
            <g transform="translate(20, 458)">
              <text x={0} y={-4} fontFamily="monospace" fontSize="7" fill="#222240">absorption rate</text>
              {[
                { color: '#2ECC71', label: '< 35%' },
                { color: '#F39C12', label: '35–60%' },
                { color: '#E74C3C', label: '> 60%' },
              ].map((item, i) => (
                <g key={item.label} transform={`translate(${i * 72}, 0)`}>
                  <circle cx={6} cy={6} r={5} fill={item.color} opacity="0.82"/>
                  <text x={14} y={10} fontFamily="monospace" fontSize="7.5" fill="#303050">{item.label}</text>
                </g>
              ))}
            </g>

            <text x="20" y="452" fill="#222238" fontSize="7" fontFamily="monospace">
              Source: K-RERA filings
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
