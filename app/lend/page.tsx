'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, Activity, CheckCircle, ChevronRight, ChevronDown } from 'lucide-react'
import { LEND_PROJECTS, BAND_COLOR, BAND_LABEL, type RiskBand } from '@/lib/lend-portfolio'

const TOTAL_EXPOSURE = 2400
const AT_RISK        = 420

const red   = LEND_PROJECTS.filter(p => p.risk_band === 'red')
const amber = LEND_PROJECTS.filter(p => p.risk_band === 'amber')
const green = LEND_PROJECTS.filter(p => p.risk_band === 'green')

function ScoreBar({ score }: { score: number }) {
  const pct   = ((score - 300) / 600) * 100
  const color = score >= 650 ? '#2ECC71' : score >= 450 ? '#F39C12' : '#E74C3C'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
        <div style={{ width: `${pct}%`, background: color, height: '100%' }} />
      </div>
      <span className="text-[10px] font-mono w-8 text-right" style={{ color }}>{score}</span>
    </div>
  )
}

// ── Flagged card (red band) ──────────────────────────────────────────────────
function FlaggedCard({ project }: { project: typeof red[0] }) {
  const { text, bg, border } = BAND_COLOR.red
  return (
    <motion.div
      animate={{
        boxShadow: [
          '0 0 0 0 rgba(231,76,60,0)',
          '0 0 0 6px rgba(231,76,60,0.15)',
          '0 0 0 0 rgba(231,76,60,0)',
        ],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{ borderRadius: '2px' }}
    >
      <Link
        href={`/lend/project/${project.id}`}
        className="block rounded-sm p-4 transition-colors duration-150 group"
        style={{ background: bg, border: `1px solid ${border}` }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = text }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = border }}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: text }} />
            <span className="text-[9px] font-mono uppercase tracking-[0.12em]" style={{ color: text }}>
              HIGH RISK · FLAGGED {project.flagged_quarter}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray group-hover:text-red transition-colors" />
        </div>

        <div className="font-syne text-base text-off-white leading-tight mb-0.5">{project.name}</div>
        <div className="text-gray text-xs mb-4">{project.developer} · {project.city}</div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray mb-0.5">Outstanding</div>
            <div className="text-sm font-mono font-bold text-red">₹{project.outstanding_cr} Cr</div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray mb-0.5">Recovery</div>
            <div
              className="text-xs font-mono font-semibold"
              style={{ color: project.recovery_window === 'RECOVERABLE' ? '#F39C12' : '#E74C3C' }}
            >
              {project.recovery_window ?? '—'}
            </div>
          </div>
          <div className="col-span-2">
            <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray mb-1">Vantis Score</div>
            <ScoreBar score={project.risk_score} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Compact table row (amber / green) ────────────────────────────────────────
function TableRow({ project }: { project: typeof LEND_PROJECTS[0] }) {
  const { text, bg, border } = BAND_COLOR[project.risk_band]
  return (
    <Link
      href={`/lend/project/${project.id}`}
      className="flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-surface2 transition-colors group"
    >
      {/* Band dot */}
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: text }} />

      {/* Project */}
      <div className="flex-1 min-w-0">
        <div className="text-off-white text-xs font-medium truncate">{project.name}</div>
        <div className="text-gray text-[10px] truncate">{project.developer}</div>
      </div>

      {/* City */}
      <div className="hidden sm:block text-gray text-[10px] w-28 shrink-0 truncate">{project.city}</div>

      {/* Exposure */}
      <div className="text-[11px] font-mono w-16 text-right shrink-0" style={{ color: text }}>
        ₹{project.exposure_cr} Cr
      </div>

      {/* Score bar */}
      <div className="hidden md:block w-28 shrink-0">
        <ScoreBar score={project.risk_score} />
      </div>

      {/* Arrow */}
      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray group-hover:text-gold transition-colors" />
    </Link>
  )
}

// ── Collapsible section ──────────────────────────────────────────────────────
function Section({
  band, count, exposure, projects, defaultOpen,
}: {
  band: RiskBand; count: number; exposure: number; projects: typeof LEND_PROJECTS; defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const { text } = BAND_COLOR[band]
  const icon = band === 'red' ? AlertTriangle : band === 'amber' ? Activity : CheckCircle
  const Icon = icon

  return (
    <div className="bg-surface border border-border rounded-sm overflow-hidden mb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: text }} />
          <span className="text-xs font-mono uppercase tracking-[0.12em] font-semibold" style={{ color: text }}>
            {BAND_LABEL[band]}
          </span>
          <span className="text-gray text-[10px] font-mono">{count} projects · ₹{exposure} Cr</span>
        </div>
        <ChevronDown
          className="w-3.5 h-3.5 text-gray transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Table header */}
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-surface2 border-b border-border">
            <div className="w-1.5 shrink-0" />
            <div className="flex-1 text-[9px] font-mono uppercase tracking-[0.12em] text-gray">Project</div>
            <div className="hidden sm:block w-28 text-[9px] font-mono uppercase tracking-[0.12em] text-gray shrink-0">City</div>
            <div className="w-16 text-right text-[9px] font-mono uppercase tracking-[0.12em] text-gray shrink-0">Exposure</div>
            <div className="hidden md:block w-28 text-[9px] font-mono uppercase tracking-[0.12em] text-gray shrink-0">Score</div>
            <div className="w-3.5 shrink-0" />
          </div>
          {projects.map(p => <TableRow key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function LendPortfolioDashboard() {
  const redExposure   = red.reduce((s, p) => s + p.exposure_cr, 0)
  const amberExposure = amber.reduce((s, p) => s + p.exposure_cr, 0)
  const greenExposure = green.reduce((s, p) => s + p.exposure_cr, 0)

  return (
    <div className="p-5 max-w-[1100px] mx-auto">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Portfolio Early-Warning</h1>
        <p className="text-gray text-sm mt-0.5 italic">
          &ldquo;Every lender watches its real-estate book through the rearview mirror. Vantis Lend is the windshield.&rdquo;
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <div className="bg-surface border border-border rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Total Exposure</div>
          <div className="font-syne text-2xl text-off-white">₹{TOTAL_EXPOSURE.toLocaleString('en-IN')} Cr</div>
          <div className="text-[10px] text-gray mt-0.5">40 projects · 23 developers</div>
        </div>

        <div className="bg-surface border border-border rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-2">Book Health</div>
          <div className="space-y-1">
            {([['green', green.length] , ['amber', amber.length], ['red', red.length]] as [RiskBand, number][]).map(([b, n]) => (
              <div key={b} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: BAND_COLOR[b].text }} />
                <span className="text-[10px] text-gray">{BAND_LABEL[b]}</span>
                <span className="ml-auto font-mono text-[11px]" style={{ color: BAND_COLOR[b].text }}>{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-red/8 border border-red/20 rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-red/60 mb-1">₹ At Risk</div>
          <div className="font-syne text-2xl text-red">₹{AT_RISK} Cr</div>
          <div className="text-[10px] text-red/50 mt-0.5">{red.length} flagged · {amber.length} on watch</div>
        </div>

        <div className="bg-surface border border-border rounded-sm px-4 py-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Hero Catch</div>
          <Link href="/lend/project/ozone-urbana" className="block hover:opacity-80 transition-opacity">
            <div className="font-syne text-sm text-gold leading-tight">Ozone Urbana</div>
            <div className="text-[10px] text-gray mt-0.5">Flagged Q3 2021 · 6 qtrs early</div>
            <div className="text-[10px] text-gold/70 mt-0.5 font-mono">↗ drill down</div>
          </Link>
        </div>
      </div>

      {/* Flagged projects — always visible, prominent */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-red" />
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-red font-semibold">
            Flagged — Immediate Attention
          </span>
          <span className="text-[10px] font-mono text-gray ml-1">· {red.length} projects · ₹{redExposure} Cr</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {red.map(p => <FlaggedCard key={p.id} project={p} />)}
        </div>
      </div>

      {/* Watch list + Healthy book — collapsible tables */}
      <Section band="amber" count={amber.length} exposure={amberExposure} projects={amber} defaultOpen={true} />
      <Section band="green" count={green.length} exposure={greenExposure} projects={green} defaultOpen={false} />
    </div>
  )
}
