'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, BarChart, Bar, Cell,
} from 'recharts'

const SURVIVAL_DATA = [
  { month: 0,  ozone: 0,  divya: 0  },
  { month: 3,  ozone: 18, divya: 2  },
  { month: 6,  ozone: 71, divya: 8  },
  { month: 9,  ozone: 84, divya: 11 },
  { month: 12, ozone: 89, divya: 14 },
  { month: 18, ozone: 94, divya: 16 },
]

const PD_DIST = [
  { bucket: '0–5%',   count: 24, color: '#2ECC71' },
  { bucket: '5–15%',  count: 9,  color: '#2ECC71' },
  { bucket: '15–30%', count: 4,  color: '#F39C12' },
  { bucket: '30–50%', count: 2,  color: '#F39C12' },
  { bucket: '>50%',   count: 1,  color: '#E74C3C' },
]

const TOP_RISK = [
  { name: 'Ozone Urbana',     pd: 73, driver: 'CV-divergence 15pts + escrow breach + NCLT filing' },
  { name: 'Concord Meridian', pd: 48, driver: 'QPR late 2 consecutive quarters + construction lag' },
  { name: 'Regent Heights',   pd: 41, driver: 'Registration velocity down 38% last 2 quarters' },
  { name: 'Skylark Arcadia',  pd: 31, driver: 'QPR overdue + developer litigation exposure' },
  { name: 'Mantri Techzone',  pd: 28, driver: 'NOC expired + escrow at 66% (below 70% mandate)' },
]

function SurvivalTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string | number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-sm px-3 py-2 text-xs">
      <div className="font-mono text-gray mb-1">Month {label}</div>
      {payload.map(d => (
        <div key={d.name} className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded" style={{ background: d.color }} />
          <span className="text-gray-light">{d.name === 'ozone' ? 'Ozone Urbana' : 'Divya Villas'}</span>
          <span className="ml-1 font-mono font-bold" style={{ color: d.color }}>{d.value}%</span>
        </div>
      ))}
    </div>
  )
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-sm px-3 py-2 text-xs">
      <span className="font-mono text-gold font-bold">{payload[0].value} projects</span>
    </div>
  )
}

export default function ModelsPage() {
  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Predictive Models</h1>
        <p className="text-gray text-sm mt-0.5">Trained on 234 resolved Karnataka projects (2016–2023). RBI Model-Risk compliant.</p>
      </div>

      {/* Section 1 — Survival curves */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">DCCO Slip Probability — Survival Curves</div>
        <p className="text-gray text-xs mb-4 leading-relaxed">
          Probability of DCCO slip by month-N, given current signals. Ozone Urbana (red) crosses high-risk threshold at month 3. Divya Villas (green) remains well below threshold at 18 months.
        </p>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-red rounded" /><span className="text-xs text-gray">Ozone Urbana</span></div>
          <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-green rounded" /><span className="text-xs text-gray">Divya Villas</span></div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={SURVIVAL_DATA} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} label={{ value: 'Months', position: 'insideBottom', offset: -2, fill: '#6B6B88', fontSize: 9 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} label={{ value: '%', angle: -90, position: 'insideLeft', offset: 10, fill: '#6B6B88', fontSize: 9 }} />
            <Tooltip content={<SurvivalTooltip />} />
            <ReferenceLine y={50} stroke="#F39C12" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: 'High Risk Threshold', fill: '#F39C12', fontSize: 8, position: 'right' }} />
            <Line type="monotone" dataKey="ozone" stroke="#E74C3C" strokeWidth={2.5} dot={{ fill: '#E74C3C', r: 3 }} activeDot={{ r: 5 }} name="ozone" />
            <Line type="monotone" dataKey="divya" stroke="#2ECC71" strokeWidth={2.5} dot={{ fill: '#2ECC71', r: 3 }} activeDot={{ r: 5 }} name="divya" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Section 2 — PD distribution */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Portfolio PD Distribution</div>
        <p className="text-gray text-xs mb-4 leading-relaxed">
          Distribution of 40 funded projects by current probability of default. 1 project above 50% (Ozone Urbana at 73%).
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={PD_DIST} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip content={<BarTooltip />} />
            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
              {PD_DIST.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section 3 — Top 5 at-risk */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-surface2">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">Top 5 At-Risk Projects — Current PD</span>
        </div>
        <div className="divide-y divide-border/50">
          {TOP_RISK.map((p, i) => {
            const color = p.pd >= 50 ? '#E74C3C' : p.pd >= 30 ? '#F39C12' : '#2ECC71'
            return (
              <div key={i} className="flex items-start gap-4 px-5 py-4">
                <div className="text-3xl font-syne font-bold w-8 text-right shrink-0" style={{ color }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className="text-sm text-off-white font-medium">{p.name}</span>
                    <span className="text-xs font-mono font-bold" style={{ color }}>PD {p.pd}%</span>
                  </div>
                  <div className="mb-2">
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.pd}%`, background: color }} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray leading-relaxed">{p.driver}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
