'use client'

import Link from 'next/link'
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { LEND_DEVELOPERS, LEND_PROJECTS, BAND_COLOR, BAND_LABEL } from '@/lib/lend-portfolio'

function ScoreGauge({ score }: { score: number }) {
  const r  = 38
  const cx = 52
  const cy = 52
  const C      = 2 * Math.PI * r   // ≈ 238.76
  const arcLen = C * 0.72           // 260 degrees ≈ 172.1
  const norm   = Math.max(0, Math.min(1, (score - 300) / 600))
  const filled = arcLen * norm
  const color  = score >= 650 ? '#2ECC71' : score >= 450 ? '#F39C12' : '#E74C3C'

  return (
    <svg viewBox="0 0 104 104" width={160} height={160}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1E1E2E" strokeWidth={10}
        strokeDasharray={`${arcLen} ${C - arcLen}`} strokeLinecap="round"
        transform={`rotate(144, ${cx}, ${cy})`} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${filled} ${C - filled}`} strokeLinecap="round"
        transform={`rotate(144, ${cx}, ${cy})`}
        style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x={cx} y={cy - 2} textAnchor="middle" fill={color} fontSize="22" fontWeight="700"
        fontFamily="var(--font-syne, sans-serif)">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#6B6B88" fontSize="9"
        fontFamily="var(--font-dm-mono, monospace)">/ 900</text>
    </svg>
  )
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-sm px-2.5 py-1.5 text-xs">
      <span className="text-gold font-mono font-bold">{payload[0].value}</span>
    </div>
  )
}

function ImpactBar({ impact }: { impact: number }) {
  const abs   = Math.abs(impact)
  const color = impact >= 0 ? '#2ECC71' : '#E74C3C'
  return (
    <div className="flex items-center gap-2 flex-1">
      {impact < 0
        ? <TrendingDown className="w-3 h-3 shrink-0" style={{ color }} />
        : impact > 0
          ? <TrendingUp  className="w-3 h-3 shrink-0" style={{ color }} />
          : <Minus       className="w-3 h-3 shrink-0 text-gray" />
      }
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <div style={{ width: `${abs}%`, background: color, height: '100%' }} />
      </div>
      <span className="text-[10px] font-mono w-8 text-right" style={{ color }}>
        {impact > 0 ? `+${impact}` : impact}
      </span>
    </div>
  )
}

export default function LendDeveloperContent({ id }: { id: string }) {
  const dev = LEND_DEVELOPERS[id]

  if (!dev) {
    return (
      <div className="p-8 text-center text-gray">
        Developer not found.{' '}
        <Link href="/lend" className="text-gold underline">Back to portfolio</Link>
      </div>
    )
  }

  const { text: bandText, bg: bandBg, border: bandBorder } = BAND_COLOR[dev.band]
  const devProjects = LEND_PROJECTS.filter(p => p.developer_id === id)

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <Link
        href="/lend"
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors duration-150 mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Portfolio
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm"
              style={{ color: bandText, background: bandBg, border: `1px solid ${bandBorder}` }}
            >
              {BAND_LABEL[dev.band]}
            </span>
            <span className="text-gray text-[10px] font-mono">Developer Risk Profile</span>
          </div>
          <h1 className="font-syne text-2xl text-off-white">{dev.name}</h1>
          <div className="text-gray text-sm mt-0.5">
            {dev.headquarter} · {dev.years_active} years · {dev.total_projects} completed projects
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-0.5">Active Loans at Kaveri HFC</div>
          <div className="font-syne text-2xl text-gold">{dev.active_loans}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gauge */}
        <div className="bg-surface border border-border rounded-sm p-5 flex flex-col items-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4 self-start">
            CIBIL-for-Builders Score
          </div>
          <ScoreGauge score={dev.score} />
          <div
            className="mt-3 px-4 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-[0.12em]"
            style={{ color: bandText, background: bandBg, border: `1px solid ${bandBorder}` }}
          >
            {BAND_LABEL[dev.band]}
          </div>
          <div className="mt-4 w-full">
            <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-gray mb-1">Score Range</div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-gray">
              <span className="text-red">300</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-red via-amber to-green rounded" />
              <span className="text-green">900</span>
            </div>
          </div>
        </div>

        {/* Factors */}
        <div className="bg-surface border border-border rounded-sm p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
            Contributing Factors
          </div>
          <div className="space-y-4">
            {dev.factors.map((f, i) => (
              <div key={i}>
                <div className="text-xs text-off-white mb-1">{f.name}</div>
                <ImpactBar impact={f.impact} />
                <p className="text-[10px] text-gray mt-1 leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trend + projects */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">
              6-Quarter Score Trend
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={dev.score_trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={[200, 950]} tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="score" stroke={bandText} strokeWidth={2}
                  dot={{ fill: bandText, r: 3 }} activeDot={{ r: 5 }}
                  isAnimationActive animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">
              Kaveri HFC Funded Projects
            </div>
            {devProjects.length === 0 ? (
              <div className="text-gray text-xs">No funded projects on record.</div>
            ) : (
              <div className="space-y-2">
                {devProjects.map(p => {
                  const { text: pt } = BAND_COLOR[p.risk_band]
                  return (
                    <Link
                      key={p.id}
                      href={`/lend/project/${p.id}`}
                      className="flex items-center justify-between p-2.5 bg-surface2 rounded-sm hover:bg-border transition-colors"
                    >
                      <div>
                        <div className="text-off-white text-xs">{p.name}</div>
                        <div className="text-gray text-[10px]">{p.city}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs" style={{ color: pt }}>₹{p.exposure_cr} Cr</div>
                        <div className="text-[9px] font-mono uppercase tracking-[0.08em]" style={{ color: pt }}>
                          {BAND_LABEL[p.risk_band]}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
