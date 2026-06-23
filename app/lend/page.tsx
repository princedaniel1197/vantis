'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, TrendingDown, CheckCircle, Activity } from 'lucide-react'
import { LEND_PROJECTS, BAND_COLOR, BAND_LABEL, type RiskBand } from '@/lib/lend-portfolio'

const TOTAL_EXPOSURE = 2400
const AT_RISK        = 420
const RED_COUNT   = LEND_PROJECTS.filter(p => p.risk_band === 'red').length
const AMBER_COUNT = LEND_PROJECTS.filter(p => p.risk_band === 'amber').length
const GREEN_COUNT = LEND_PROJECTS.filter(p => p.risk_band === 'green').length

type Filter = 'all' | RiskBand

const FILTERS: { key: Filter; label: string; count?: number }[] = [
  { key: 'all',   label: 'All 40' },
  { key: 'red',   label: `Red ${RED_COUNT}` },
  { key: 'amber', label: `Amber ${AMBER_COUNT}` },
  { key: 'green', label: `Green ${GREEN_COUNT}` },
]

function ScoreBar({ score }: { score: number }) {
  const pct = ((score - 300) / 600) * 100
  const color = score >= 650 ? '#2ECC71' : score >= 450 ? '#F39C12' : '#E74C3C'
  return (
    <div className="w-full h-0.5 bg-border rounded-full overflow-hidden mt-1">
      <div style={{ width: `${pct}%`, background: color, height: '100%' }} />
    </div>
  )
}

export default function LendPortfolioDashboard() {
  const [filter, setFilter] = useState<Filter>('all')
  const router = useRouter()

  const projects = filter === 'all'
    ? LEND_PROJECTS
    : LEND_PROJECTS.filter(p => p.risk_band === filter)

  return (
    <div className="p-5 max-w-[1500px] mx-auto">
      {/* Headline */}
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Portfolio Early-Warning</h1>
        <p className="text-gray text-sm mt-1 italic">
          &ldquo;Every lender watches its real-estate book through the rearview mirror. Vantis Lend is the windshield.&rdquo;
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-sm p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Total Exposure</div>
          <div className="font-syne text-2xl text-off-white">₹{TOTAL_EXPOSURE.toLocaleString('en-IN')} Cr</div>
          <div className="text-[10px] text-gray mt-0.5">40 projects · 23 developers</div>
        </div>
        <div className="bg-surface border border-border rounded-sm p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Book Health</div>
          <div className="flex items-end gap-2">
            <span className="font-syne text-xl text-green">{GREEN_COUNT}</span>
            <span className="text-gray text-xs mb-0.5">green</span>
            <span className="font-syne text-xl text-amber">{AMBER_COUNT}</span>
            <span className="text-gray text-xs mb-0.5">watch</span>
            <span className="font-syne text-xl text-red">{RED_COUNT}</span>
            <span className="text-gray text-xs mb-0.5">red</span>
          </div>
        </div>
        <div className="bg-red/10 border border-red/25 rounded-sm p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red/70 mb-1">At Risk</div>
          <div className="font-syne text-2xl text-red">₹{AT_RISK} Cr</div>
          <div className="text-[10px] text-red/60 mt-0.5">{RED_COUNT} projects flagged</div>
        </div>
        <div className="bg-surface border border-border rounded-sm p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Hero Catch</div>
          <div className="font-syne text-base text-gold leading-tight">Ozone Urbana</div>
          <div className="text-[10px] text-gray mt-0.5">Flagged Q3 2021 · 6 qtrs early</div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {FILTERS.map(f => {
          const active = filter === f.key
          const color = f.key === 'red' ? '#E74C3C' : f.key === 'amber' ? '#F39C12' : f.key === 'green' ? '#2ECC71' : '#C9A84C'
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-[0.08em] transition-colors duration-100 border"
              style={{
                color:       active ? color : '#6B6B88',
                borderColor: active ? color : '#1E1E2E',
                background:  active ? `${color}14` : 'transparent',
              }}
            >
              {f.label}
            </button>
          )
        })}
        <span className="ml-auto text-gray text-xs font-mono">{projects.length} showing</span>
      </div>

      {/* Heatmap grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}
      >
        {projects.map(project => {
          const { text, bg, border } = BAND_COLOR[project.risk_band]
          const isRed = project.risk_band === 'red'

          const tile = (
            <div
              key={project.id}
              onClick={() => router.push(`/lend/project/${project.id}`)}
              className="cursor-pointer rounded-sm p-3 transition-colors duration-150"
              style={{ background: bg, border: `1px solid ${border}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = text }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = border }}
            >
              {/* Band badge */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[9px] font-mono uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-sm"
                  style={{ color: text, background: `${text}18` }}
                >
                  {BAND_LABEL[project.risk_band]}
                </span>
                {isRed && <AlertTriangle className="w-3 h-3" style={{ color: text }} />}
                {project.risk_band === 'amber' && <Activity className="w-3 h-3" style={{ color: text }} />}
                {project.risk_band === 'green' && <CheckCircle className="w-3 h-3" style={{ color: text }} />}
              </div>

              {/* Project name */}
              <div className="text-off-white text-xs font-semibold leading-tight mb-0.5 line-clamp-2">
                {project.name}
              </div>
              <div className="text-gray text-[10px] mb-2 truncate">{project.developer}</div>

              {/* Exposure */}
              <div className="text-[11px] font-mono" style={{ color: text }}>
                ₹{project.exposure_cr} Cr
              </div>

              {/* Score + bar */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-gray font-mono">Score {project.risk_score}</span>
              </div>
              <ScoreBar score={project.risk_score} />
            </div>
          )

          if (isRed) {
            return (
              <motion.div
                key={project.id}
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(231,76,60,0)',
                    '0 0 0 4px rgba(231,76,60,0.18)',
                    '0 0 0 0 rgba(231,76,60,0)',
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ borderRadius: '2px' }}
              >
                {tile}
              </motion.div>
            )
          }
          return tile
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-5 flex-wrap">
        {(['green', 'amber', 'red'] as RiskBand[]).map(b => (
          <div key={b} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: BAND_COLOR[b].bg, border: `1px solid ${BAND_COLOR[b].border}` }} />
            <span className="text-xs text-gray font-mono">{BAND_LABEL[b]}</span>
          </div>
        ))}
        <span className="text-gray text-xs ml-auto">Click any tile for drill-down →</span>
      </div>
    </div>
  )
}
