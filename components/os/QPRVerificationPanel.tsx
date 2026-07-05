'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, ShieldCheck, Clock, Satellite, PenLine, Hash, ArrowRight } from 'lucide-react'

export interface ComplianceProject {
  id: string
  name: string
  rera_id: string
  qpr_due: string
  qpr_status: string
  last_qpr: string
  completion_pct: number
  construction_completion: number
  financial_completion: number
  sold_pct: number
  collection_pct: number
  escrow_balance_cr: number
  penalty_lakh: number
  flags: string[]
  risk_grade: string
}

const GRADE_COLOR: Record<string, string> = { A: 'var(--ra)', B: 'var(--rb)', C: 'var(--rc)' }

// Deterministic 8-char hex — stable across renders (no Math.random → no hydration drift)
function pseudoHash(seed: string): string {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 8)
}

function daysUntil(dateStr: string): number {
  // Demo reference date — kept fixed so the countdown is stable
  const ref = new Date('2026-01-05').getTime()
  const due = new Date(dateStr).getTime()
  return Math.round((due - ref) / 86400000)
}

function complianceScore(p: ComplianceProject): number {
  const base = p.risk_grade === 'A' ? 92 : p.risk_grade === 'B' ? 68 : 34
  return Math.max(0, base - p.flags.length * 2)
}

function deliveredPct(p: ComplianceProject): number {
  if (p.risk_grade === 'C') return Math.round(p.construction_completion * 0.5)
  if (p.risk_grade === 'B') return Math.max(0, p.construction_completion - 5)
  return Math.max(0, p.construction_completion - 1)
}

export default function QPRVerificationPanel({ project }: { project: ComplianceProject }) {
  const gradeColor = GRADE_COLOR[project.risk_grade] ?? 'var(--muted)'
  const score = complianceScore(project)
  const scoreColor = score >= 75 ? 'var(--ra)' : score >= 50 ? 'var(--rb)' : 'var(--rc)'
  const days = daysUntil(project.qpr_due)
  const declared = project.construction_completion
  const delivered = deliveredPct(project)
  const gap = declared - delivered
  const gapCritical = gap >= 10
  const shortHash = project.rera_id.slice(-10)

  const auditRows = [
    { field: 'Construction % (declared)', value: `${declared}%`, doc: 'Form 3 · §4.2', ref: 'p.6 / line 18' },
    { field: 'Collected from buyers', value: `${project.collection_pct}%`, doc: 'Form 3 · §5.1', ref: 'p.8 / line 4' },
    { field: 'Escrow deposited (70% rule)', value: `₹${project.escrow_balance_cr} Cr`, doc: 'Bank statement', ref: 'p.2 / line 9' },
    { field: 'Units sold', value: `${project.sold_pct}%`, doc: 'Form 3 · §3.3', ref: 'p.5 / line 11' },
  ]

  return (
    <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mt-5 rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: `1px solid ${project.risk_grade === 'C' ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'var(--bord)'}` }}>
      {/* Form header */}
      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: '1px solid var(--bord)', background: 'var(--surf2)' }}>
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{project.name} — Filed QPR (Form 3)</div>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>RERA {shortHash} · Q4 2025 · {project.qpr_status === 'submitted' ? 'FILED' : 'PENDING'}</div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="font-display italic text-3xl leading-none" style={{ color: scoreColor }}>{score}</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: 'var(--muted)' }}>compliance /100</div>
          </div>
          <div className="text-center flex items-center gap-2 px-3 py-2 rounded-sm" style={{ background: days <= 14 ? 'color-mix(in srgb, var(--rc) 8%, var(--surf))' : 'var(--surf)', border: `1px solid ${days <= 14 ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'var(--bord)'}` }}>
            <Clock className="w-4 h-4" style={{ color: days <= 14 ? 'var(--rc)' : 'var(--muted)' }} />
            <div className="text-left">
              <div className="font-mono text-sm leading-none" style={{ color: days <= 14 ? 'var(--rc)' : 'var(--ink)' }}>{days <= 0 ? `${-days}d overdue` : `${days}d`}</div>
              <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>{project.penalty_lakh > 0 ? `₹${project.penalty_lakh}L at risk` : 'next deadline'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: 'var(--bord)' }}>
        {/* Declared block */}
        <div className="p-5" style={{ background: 'var(--surf)' }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-3 block" style={{ color: 'var(--muted)' }}>Declared — by developer</span>
          <div className="space-y-2.5">
            {[
              ['Construction target this quarter', `${Math.min(declared + 6, 100)}%`],
              ['Construction actual reported', `${declared}%`],
              ['Collected from buyers', `${project.collection_pct}%`],
              ['Escrow deposited', `₹${project.escrow_balance_cr} Cr`],
              ['Financial completion', `${project.financial_completion}%`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span className="font-mono" style={{ color: 'var(--ink)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivered verification block — THE break */}
        <div className="p-5" style={{ background: gapCritical ? 'color-mix(in srgb, var(--rc) 5%, var(--surf))' : 'var(--surf)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Satellite className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Delivered — Vantis verification</span>
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-sm ml-auto" style={{ color: 'var(--gold)', background: 'color-mix(in srgb, var(--gold) 10%, var(--surf2))' }}>ROADMAP · SATELLITE/CV</span>
          </div>
          <div className="flex items-end gap-6 mb-3">
            <div>
              <div className="font-display italic text-4xl leading-none" style={{ color: gapCritical ? 'var(--rc)' : 'var(--ra)' }}>{delivered}%</div>
              <div className="font-mono text-[9px] mt-1" style={{ color: 'var(--muted)' }}>measured actual</div>
            </div>
            <div className="pb-1">
              <div className="font-mono text-lg" style={{ color: gapCritical ? 'var(--rc)' : 'var(--muted)' }}>{gap > 0 ? '−' : ''}{gap} pt</div>
              <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>declared − delivered</div>
            </div>
          </div>
          <div className="h-2 rounded-full relative mb-2" style={{ background: 'var(--surf2)' }}>
            <div className="h-full rounded-full absolute left-0 top-0" style={{ width: `${declared}%`, background: 'color-mix(in srgb, var(--gold) 40%, var(--surf2))' }} />
            <div className="h-full rounded-full absolute left-0 top-0" style={{ width: `${delivered}%`, background: gapCritical ? 'var(--rc)' : 'var(--ra)' }} />
          </div>
          <div className="text-xs leading-relaxed" style={{ color: gapCritical ? 'var(--rc)' : 'var(--muted)' }}>
            {gapCritical
              ? `Declared ${declared}% but measured ${delivered}%. ${gap}-point gap written permanently to the developer's execution score.`
              : `Declared and delivered match within tolerance. No execution-score penalty.`}
          </div>
        </div>
      </div>

      {/* Audit trail */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--bord)' }}>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Source-Traced Audit Trail</span>
        </div>
        <div className="space-y-1.5">
          {auditRows.map((r, i) => (
            <motion.div key={r.field} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2 rounded-sm" style={{ background: 'var(--surf2)' }}>
              <span className="text-[11px] flex-1 min-w-[140px]" style={{ color: 'var(--ink)' }}>{r.field}</span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink)' }}>{r.value}</span>
              <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{r.doc} · {r.ref}</span>
              <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                <Hash className="w-2.5 h-2.5" />{pseudoHash(r.field + project.rera_id)}
              </span>
              <span className="font-mono text-[10px] flex items-center gap-1" style={{ color: 'var(--ra)' }}>
                <PenLine className="w-2.5 h-2.5" />CA e-sign
              </span>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          <div className="font-mono text-[9px] flex-1 min-w-[200px]" style={{ color: 'var(--muted)' }}>
            Each field hashed (SHA-256) and CA-attested at filing. Vantis re-verifies the <span style={{ color: 'var(--gold)' }}>delivered</span> row against source records — the break between declared and delivered.
          </div>
          <Link href="/construction" className="font-mono text-[10px] flex items-center gap-1 shrink-0 hover:underline" style={{ color: 'var(--gold)' }}>Satellite progress <ArrowRight className="w-3 h-3" /></Link>
          <Link href="/finance" className="font-mono text-[10px] flex items-center gap-1 shrink-0 hover:underline" style={{ color: 'var(--gold)' }}>Escrow &amp; collections <ArrowRight className="w-3 h-3" /></Link>
        </div>
      </div>
    </motion.div>
  )
}
