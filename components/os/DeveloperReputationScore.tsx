'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Landmark, ArrowRight } from 'lucide-react'
import repData from '@/data/dev-reputation.json'

const GRADE_COLOR: Record<string, string> = { A: 'var(--ra)', B: 'var(--rb)', C: 'var(--rc)' }
const SEV_COLOR: Record<string, string> = { ok: 'var(--ra)', warning: 'var(--rb)', critical: 'var(--rc)' }

type Developer = (typeof repData.developers)[number]

const CIRC = 251.2 // 2πr, r=40

function ScoreDial({ score, grade }: { score: number; grade: string }) {
  const color = GRADE_COLOR[grade] ?? 'var(--muted)'
  const target = CIRC - (CIRC * score) / 100
  return (
    <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surf2)" strokeWidth="7" />
        <circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={CIRC} className="animate-dial"
          style={{ ['--dial-target' as string]: `${target}` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display italic leading-none" style={{ fontSize: '2.4rem', color }}>{score}</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>/ 100</div>
      </div>
    </div>
  )
}

export default function DeveloperReputationScore() {
  const [selectedId, setSelectedId] = useState('meridian')
  const dev = (repData.developers.find(d => d.id === selectedId) ?? repData.developers[0]) as Developer
  const gradeColor = GRADE_COLOR[dev.grade] ?? 'var(--muted)'
  const up = dev.delta_q >= 0
  const gapCritical = dev.declared_vs_delivered_gap >= 10

  return (
    <div className="mb-8">
      {/* Basis banner — the whole point: records, not opinions */}
      <div className="p-4 rounded-sm mb-4 flex items-start gap-4" style={{ background: 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 25%, var(--bord))' }}>
        <Landmark className="w-7 h-7 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-0.5" style={{ color: 'var(--gold)' }}>Developer Reputation Score — Government-Record Basis</div>
          <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            Not a survey. Computed from RERA compliance, declared-vs-delivered gaps, litigation and escrow — and authoritative because K-RERA-empaneled under <span style={{ color: 'var(--ink)' }}>Section 32(f)</span> developer grading, which the law mandates and no state has executed.
            <span className="font-mono ml-1" style={{ color: 'var(--gold)' }}>Roadmap: live compute from source feeds — values below are demonstrative.</span>
          </div>
        </div>
      </div>

      {/* Developer selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {repData.developers.map(d => {
          const active = d.id === selectedId
          const dc = GRADE_COLOR[d.grade]
          return (
            <button key={d.id} onClick={() => setSelectedId(d.id)}
              className="px-4 py-2 rounded-sm text-sm font-mono flex items-center gap-2"
              style={{ background: active ? `color-mix(in srgb, ${dc} 10%, var(--surf))` : 'var(--surf)', color: active ? 'var(--ink)' : 'var(--muted)', border: `1px solid ${active ? dc : 'var(--bord)'}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: dc }} />
              {d.name}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Score card */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div key={dev.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-sm flex items-center gap-6"
            style={{ background: dev.grade === 'C' ? 'color-mix(in srgb, var(--rc) 5%, var(--surf))' : 'var(--surf)', border: `2px solid ${gradeColor}` }}>
            <ScoreDial score={dev.score} grade={dev.grade} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-display italic text-2xl" style={{ color: 'var(--ink)' }}>{dev.name}</span>
                <span className="font-display italic text-2xl" style={{ color: gradeColor }}>· {dev.grade}</span>
              </div>
              <div className="font-mono text-[11px] mb-2" style={{ color: 'var(--muted)' }}>
                {dev.projects} projects · {dev.delivered} delivered
                <span className="inline-flex items-center gap-1 ml-2" style={{ color: up ? 'var(--ra)' : 'var(--rc)' }}>
                  {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {up ? '+' : ''}{dev.delta_q} this quarter
                </span>
              </div>
              <div className="text-xs leading-relaxed mb-2" style={{ color: dev.grade === 'C' ? 'var(--rc)' : 'var(--muted)' }}>{dev.verdict}</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>Trace the record</span>
                <Link href="/compliance" className="font-mono text-[10px] flex items-center gap-1 hover:underline" style={{ color: 'var(--gold)' }}>Filed QPR verification <ArrowRight className="w-3 h-3" /></Link>
                <Link href="/land" className="font-mono text-[10px] flex items-center gap-1 hover:underline" style={{ color: 'var(--gold)' }}>Land title report <ArrowRight className="w-3 h-3" /></Link>
              </div>
            </div>
          </motion.div>

          {/* Declared vs Delivered gap — the through-line */}
          <div className="p-4 rounded-sm flex items-center justify-between"
            style={{ background: gapCritical ? 'color-mix(in srgb, var(--rc) 6%, var(--surf))' : 'var(--surf)', border: `1px solid ${gapCritical ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'var(--bord)'}` }}>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--muted)' }}>Declared vs Delivered Gap</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Satellite/CV-measured actual vs developer-declared progress, portfolio-wide.</div>
            </div>
            <div className="text-right shrink-0 ml-4">
              <div className="font-display italic text-3xl" style={{ color: gapCritical ? 'var(--rc)' : 'var(--ra)' }}>{dev.declared_vs_delivered_gap} pt</div>
              <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{gapCritical ? 'written to score' : 'within tolerance'}</div>
            </div>
          </div>

          {/* Four dimensions */}
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-4 block" style={{ color: 'var(--muted)' }}>Four Dimensions</span>
            <div className="space-y-3">
              {repData.dimensions_meta.map((dim, i) => {
                const v = (dev.dimensions as Record<string, number>)[dim.key]
                const dc = v >= 75 ? 'var(--ra)' : v >= 50 ? 'var(--rb)' : 'var(--rc)'
                return (
                  <motion.div key={dim.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: 'var(--ink)' }}>{dim.label}</span>
                      <span className="font-mono text-sm" style={{ color: dc }}>{v}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--surf2)' }}>
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ delay: 0.3 + i * 0.07, duration: 0.6 }} style={{ background: dc }} />
                    </div>
                    <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{dim.desc}</div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Red flags */}
          <div className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3 block" style={{ color: 'var(--muted)' }}>Red Flags — Records Trace</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dev.red_flags.map(f => {
                const fc = SEV_COLOR[f.severity] ?? 'var(--muted)'
                const Icon = f.severity === 'ok' ? CheckCircle2 : AlertTriangle
                return (
                  <div key={f.label} className="flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: f.severity === 'ok' ? 'var(--surf2)' : `color-mix(in srgb, ${fc} 7%, var(--surf2))`, border: `1px solid ${f.severity === 'ok' ? 'var(--bord)' : `color-mix(in srgb, ${fc} 25%, var(--bord))`}` }}>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: fc }} />
                    <span className="text-[11px] flex-1" style={{ color: 'var(--muted)' }}>{f.label}</span>
                    <span className="font-mono text-[11px]" style={{ color: fc }}>{f.value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* City Accountability Index */}
        <div className="space-y-4">
          <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bord)' }}>
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>City Accountability Index · {repData.city_index.city}</span>
            </div>
            <div>
              {repData.city_index.developers.map((d, i) => {
                const dc = GRADE_COLOR[d.grade] ?? 'var(--muted)'
                const isSel = d.name === dev.name
                return (
                  <motion.div key={d.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{ borderBottom: i < repData.city_index.developers.length - 1 ? '1px solid var(--bord)' : 'none', background: isSel ? 'color-mix(in srgb, var(--gold) 5%, transparent)' : 'transparent' }}>
                    <span className="font-mono text-[11px] w-5 shrink-0" style={{ color: 'var(--muted)' }}>{d.rank}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate" style={{ color: isSel ? 'var(--ink)' : 'var(--muted)', fontWeight: isSel ? 600 : 400 }}>{d.name}</div>
                      <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{d.projects} projects</div>
                    </div>
                    <span className="font-mono text-sm" style={{ color: dc }}>{d.score}</span>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dc }} />
                  </motion.div>
                )
              })}
            </div>
          </div>
          <div className="p-4 rounded-sm" style={{ background: 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 30%, var(--bord))' }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--gold)' }}>Ghar.tv vs Vantis</div>
            <div className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              Their score = 2,340 buyer opinions. Ours = objective, computed from the public record, and official because K-RERA-empaneled. Same scorecard shape — <span style={{ color: 'var(--ink)' }}>records, not opinions</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
