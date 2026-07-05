'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react'

export interface VerificationRow {
  project: string
  declared: number
  verified: number
}

interface VerificationPanelProps {
  title: string
  caption: string
  declaredLabel: string
  verifiedLabel: string
  unit?: string
  rows: VerificationRow[]
  /** gap ≥ this is treated as a material discrepancy */
  threshold?: number
  /** honest label when the verified source is not yet a live engine */
  roadmap?: string
  moat: string
  /** cross-link to the related stage screen so the cast flows across the platform */
  link?: { href: string; label: string }
}

export default function VerificationPanel({
  title, caption, declaredLabel, verifiedLabel, unit = '%', rows, threshold = 10, roadmap, moat, link,
}: VerificationPanelProps) {
  const flagged = rows.filter(r => r.declared - r.verified >= threshold)

  return (
    <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: `1px solid ${flagged.length ? 'color-mix(in srgb, var(--rc) 25%, var(--bord))' : 'var(--bord)'}` }}>
      <div className="px-4 py-3 flex flex-wrap items-center gap-2" style={{ borderBottom: '1px solid var(--bord)' }}>
        <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{title}</span>
        {roadmap && <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-sm ml-auto" style={{ color: 'var(--gold)', background: 'color-mix(in srgb, var(--gold) 10%, var(--surf2))' }}>{roadmap}</span>}
      </div>
      <div className="px-4 py-3">
        <div className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{caption}</div>
        <div className="space-y-2.5">
          {rows.map((r, i) => {
            const gap = r.declared - r.verified
            const isFlag = gap >= threshold
            const gc = isFlag ? 'var(--rc)' : 'var(--ra)'
            return (
              <motion.div key={r.project} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                    {isFlag && <AlertTriangle className="w-3 h-3" style={{ color: 'var(--rc)' }} />}{r.project}
                  </span>
                  <span className="font-mono text-[11px]" style={{ color: gc }}>
                    {declaredLabel} {r.declared}{unit} · {verifiedLabel} {r.verified}{unit}
                    <span className="ml-2" style={{ color: isFlag ? 'var(--rc)' : 'var(--muted)' }}>{gap > 0 ? `−${gap}${unit}` : `${gap}${unit}`}</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full relative" style={{ background: 'var(--surf2)' }}>
                  <div className="h-full rounded-full absolute left-0 top-0" style={{ width: `${Math.min(100, r.declared)}%`, background: 'color-mix(in srgb, var(--gold) 40%, var(--surf2))' }} />
                  <div className="h-full rounded-full absolute left-0 top-0" style={{ width: `${Math.min(100, r.verified)}%`, background: gc }} />
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--bord)' }}>
          <div className="font-mono text-[10px] flex-1 min-w-[200px]" style={{ color: 'var(--muted)' }}>{moat}</div>
          {link && (
            <Link href={link.href} className="font-mono text-[10px] flex items-center gap-1 shrink-0 hover:underline" style={{ color: 'var(--gold)' }}>
              {link.label} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
