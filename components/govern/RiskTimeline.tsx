'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import ozoneData from '@/data/ozone-urbana.json'

interface TimelinePoint {
  quarter: string
  score: number
  status: string
  default_probability: number
  signals: string[]
  action: string
}

const TIMELINE = ozoneData.risk_timeline as TimelinePoint[]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: TimelinePoint }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-surface2 border border-border rounded-sm px-3 py-2 text-xs shadow-lg">
      <div className="text-gold font-semibold mb-1">{d.quarter}</div>
      <div className="text-off-white mb-0.5">
        Score: <span className={`font-mono font-bold ${d.score >= 40 ? 'text-amber' : 'text-red'}`}>{d.score}</span>
      </div>
      <div className="text-gray">
        Default prob: <span className="text-red font-mono font-bold">{d.default_probability}%</span>
      </div>
    </div>
  )
}

function ScoreDot(props: {
  cx?: number; cy?: number; index?: number;
  payload?: TimelinePoint; selectedQ: string | null; onSelect: (q: string) => void
}) {
  const { cx, cy, payload, selectedQ, onSelect } = props
  if (cx == null || cy == null || !payload) return null
  const isSelected = selectedQ === payload.quarter
  const color = payload.score >= 40 ? '#F39C12' : '#E74C3C'
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 7 : 5}
      fill={isSelected ? color : '#0E0E1A'}
      stroke={color}
      strokeWidth={isSelected ? 2.5 : 1.5}
      style={{ cursor: 'pointer', transition: 'r 0.15s, fill 0.15s' }}
      onClick={() => onSelect(payload.quarter)}
    />
  )
}

export default function RiskTimeline() {
  const [selectedQ, setSelectedQ] = useState<string | null>('Q1 2022')

  const selectedPoint = TIMELINE.find(d => d.quarter === selectedQ) ?? null

  function handleSelect(q: string) {
    setSelectedQ(prev => prev === q ? null : q)
  }

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-red/10 border border-red/20 rounded-sm p-3 text-center">
          <div className="font-syne text-red text-2xl font-bold">{ozoneData.quarters_early_warning}</div>
          <div className="text-gray text-xs mt-1">Quarters early warning</div>
        </div>
        <div className="bg-red/10 border border-red/20 rounded-sm p-3 text-center">
          <div className="font-syne text-red text-2xl font-bold">{ozoneData.homebuyers_affected.toLocaleString('en-IN')}</div>
          <div className="text-gray text-xs mt-1">Homebuyers at risk</div>
        </div>
        <div className="bg-red/10 border border-red/20 rounded-sm p-3 text-center">
          <div className="font-syne text-red text-2xl font-bold">₹{ozoneData.capital_at_risk_crore} Cr</div>
          <div className="text-gray text-xs mt-1">Capital at risk</div>
        </div>
        <div className="bg-amber/10 border border-amber/20 rounded-sm p-3 text-center">
          <div className="font-syne text-amber text-2xl font-bold">{ozoneData.fir_filed}</div>
          <div className="text-gray text-xs mt-1">FIR filed</div>
        </div>
      </div>

      {/* Chart + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Chart */}
        <div className="lg:col-span-3">
          <div className="text-[10px] text-gray uppercase tracking-widest mb-3 font-semibold">
            Vantis Risk Score · 8-Quarter Trajectory
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreLineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#F39C12" stopOpacity={1} />
                  <stop offset="20%"  stopColor="#E86A2B" stopOpacity={1} />
                  <stop offset="100%" stopColor="#E74C3C" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#F39C12" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#E74C3C" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="probAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#E74C3C" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#E74C3C" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,62,0.8)" vertical={false} />
              <XAxis
                dataKey="quarter"
                tick={{ fill: 'rgba(107,107,136,0.8)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(42,42,62,0.6)' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'rgba(107,107,136,0.8)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine
                y={40}
                stroke="#F39C12"
                strokeDasharray="4 3"
                strokeOpacity={0.5}
                label={{ value: 'CAUTION', fill: '#F39C12', fontSize: 9, position: 'insideTopRight' }}
              />
              <ReferenceLine
                x="Q1 2022"
                stroke="#E74C3C"
                strokeDasharray="4 3"
                strokeOpacity={0.6}
                label={{ value: '80% default', fill: '#E74C3C', fontSize: 9, position: 'top' }}
              />

              <Area
                type="monotone"
                dataKey="default_probability"
                stroke="#E74C3C"
                strokeWidth={1}
                strokeOpacity={0.35}
                fill="url(#probAreaGrad)"
                dot={false}
                activeDot={false}
                isAnimationActive
                animationDuration={1500}
                name="Default %"
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="url(#scoreLineGrad)"
                strokeWidth={2.5}
                fill="url(#scoreAreaGrad)"
                dot={(props: object) => {
                  const p = props as { cx?: number; cy?: number; index?: number; payload?: TimelinePoint }
                  return (
                    <ScoreDot
                      key={p.index}
                      {...p}
                      selectedQ={selectedQ}
                      onSelect={handleSelect}
                    />
                  )
                }}
                activeDot={false}
                isAnimationActive
                animationDuration={1500}
                name="Risk Score"
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-gradient-to-r from-amber to-red" />
              <span className="text-gray text-[10px]">Risk Score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-red opacity-40" />
              <span className="text-gray text-[10px]">Default Probability</span>
            </div>
            <span className="text-gray text-[10px] ml-auto">← Click a point for details</span>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {!selectedPoint ? (
            <div className="h-full min-h-[200px] flex items-center justify-center bg-surface2 border border-border rounded-sm p-4">
              <p className="text-gray text-sm text-center">Click any point on the chart to view quarter details.</p>
            </div>
          ) : (
            <div className="bg-surface2 border border-border rounded-sm p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <span className="font-syne text-off-white text-base">{selectedPoint.quarter}</span>
                <span className={`font-mono text-sm font-bold px-2 py-0.5 rounded-sm border ${
                  selectedPoint.score >= 40
                    ? 'text-amber bg-amber/10 border-amber/30'
                    : 'text-red bg-red/10 border-red/30'
                }`}>{selectedPoint.score}</span>
              </div>

              <div className="flex gap-6 mb-4">
                <div>
                  <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Status</div>
                  <div className={`text-xs font-semibold ${selectedPoint.score >= 40 ? 'text-amber' : 'text-red'}`}>
                    {selectedPoint.status}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Default Prob</div>
                  <div className="text-xs font-mono font-bold text-red">{selectedPoint.default_probability}%</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-1.5">Signals Detected</div>
                <div className="space-y-1.5">
                  {selectedPoint.signals.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-red shrink-0 text-xs mt-0.5">▸</span>
                      <span className="text-gray-light text-xs leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-1.5">Vantis Action Taken</div>
                <div className="text-xs text-gold-light leading-relaxed border-l-2 border-gold pl-2.5">
                  {selectedPoint.action}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
