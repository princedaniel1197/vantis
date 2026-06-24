'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle2, AlertTriangle, RotateCcw, Lock, Unlock, XCircle,
} from 'lucide-react'
import { LEND_PROJECTS, OZONE_TRANCHES } from '@/lib/lend-portfolio'

type Decision = 'HOLD' | 'RELEASE' | 'RESTRUCTURE' | null

// ── Consequence cards ─────────────────────────────────────────────────────────
const CONSEQUENCES: Record<Exclude<Decision, null>, {
  color: string; bg: string; border: string
  headline: string; body: string[]
  metric: string; metricLabel: string
}> = {
  HOLD: {
    color: '#C9A84C', bg: 'rgba(201,168,76,0.08)', border: 'rgba(201,168,76,0.30)',
    headline: '₹40 Cr preserved. Clock given back.',
    body: [
      'Issue formal Hold Notice to Ozone Group citing K-RERA milestone non-compliance (6th floor slab unverified).',
      'Require physical inspection by Kaveri HFC-appointed engineer within 30 days.',
      'Demand escrow top-up plan: bring balance from 8% to RERA minimum 70% within 60 days.',
      'Protected: ₹70 Cr total undisbursed remains under Kaveri HFC control until milestones are verified.',
      'Risk: Ozone Group may escalate to DRAT or initiate arbitration to force disbursement.',
    ],
    metric: '₹70 Cr', metricLabel: 'Capital protected',
  },
  RELEASE: {
    color: '#E74C3C', bg: 'rgba(231,76,60,0.08)', border: 'rgba(231,76,60,0.30)',
    headline: '₹40 Cr disbursed into a defaulting project.',
    body: [
      'Current outstanding after release: ₹220 Cr (₹180 Cr + ₹40 Cr new disbursement).',
      'Karnataka RE market recovery rate post-NPA: 14% (NHB 2023 distressed asset study).',
      'Expected recovery on ₹220 Cr: ₹30.8 Cr — a loss of ₹189 Cr.',
      'Without this tranche: ₹180 Cr outstanding → expected recovery ₹25.2 Cr → loss ₹154.8 Cr.',
      'Marginal loss from releasing this tranche: ₹189 Cr − ₹154.8 Cr = ₹34.2 Cr additional destruction.',
    ],
    metric: '₹34 Cr', metricLabel: 'Additional capital destroyed',
  },
  RESTRUCTURE: {
    color: '#F39C12', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.30)',
    headline: 'NPA avoidance via structured resolution.',
    body: [
      'Extend RERA project deadline by 12 months — conditional on Ozone Group filing compliance plan within 14 days.',
      'Release ₹40 Cr in 4 increments of ₹10 Cr, each contingent on K-RERA QPR sign-off for the preceding floor.',
      'Require pledge of escrow accounts from Ozone Westgate and Park Avenue (₹340 Cr combined) as additional collateral.',
      'Restructuring provision required under RBI PFD 2025: ~₹22 Cr vs NPA writedown of ₹154–189 Cr.',
      'Estimated recovery on restructured path: 68% of ₹250 Cr = ₹170 Cr vs 14% post-NPA = ₹25–31 Cr.',
    ],
    metric: '₹148 Cr', metricLabel: 'Value preserved vs NPA path',
  },
}

// ── Tranche status badge ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: 'DISBURSED' | 'PENDING' | 'CONDITIONAL' }) {
  const styles = {
    DISBURSED:   { color: '#2ECC71', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.30)'  },
    PENDING:     { color: '#F39C12', bg: 'rgba(243,156,18,0.12)',  border: 'rgba(243,156,18,0.30)'  },
    CONDITIONAL: { color: '#6B6B88', bg: 'rgba(107,107,136,0.12)', border: 'rgba(107,107,136,0.30)' },
  }
  const s = styles[status]
  return (
    <span
      className="text-[9px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LendTrancheContent({ id }: { id: string }) {
  const project  = LEND_PROJECTS.find(p => p.id === id)
  const [decision, setDecision] = useState<Decision>(null)

  if (!project) {
    return (
      <div className="p-8 text-center text-gray">
        Project not found.{' '}
        <Link href="/lend" className="text-gold underline">Back to portfolio</Link>
      </div>
    )
  }

  const isOzone = project.id === 'ozone-urbana'
  const con     = decision ? CONSEQUENCES[decision] : null

  const BUTTONS: Array<{ key: Exclude<Decision, null>; label: string; icon: typeof Lock; desc: string }> = [
    { key: 'HOLD',        label: 'Hold Tranche',    icon: Lock,      desc: 'Preserve ₹40 Cr. Demand milestone proof before release.' },
    { key: 'RELEASE',     label: 'Release ₹40 Cr',  icon: Unlock,    desc: 'Disburse now. Vantis recommends against.' },
    { key: 'RESTRUCTURE', label: 'Restructure',      icon: RotateCcw, desc: 'Negotiate incremental release on verified milestones.' },
  ]

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <Link
        href={`/lend/project/${project.id}`}
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Project Drill-down
      </Link>

      {/* Hero decision header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm bg-amber/10 text-amber border border-amber/30">
            PENDING DECISION
          </span>
          <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-gray">
            Tranche Control
          </span>
        </div>
        <h1 className="font-syne text-2xl text-off-white">
          {isOzone ? '₹40 Cr Tranche T5 — Ozone Urbana' : `Tranche Control — ${project.name}`}
        </h1>
        <p className="text-gray text-sm mt-1">
          {isOzone
            ? 'Milestone 5 (6th floor slab) is unverified. Kaveri HFC has 30 days to decide: Hold, Release, or Restructure.'
            : 'No active tranche decisions for this project at this time.'}
        </p>
      </div>

      {isOzone && (
        <>
          {/* Capital at stake callout */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border rounded-sm px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Sanctioned</div>
              <div className="font-syne text-2xl text-off-white">₹250 Cr</div>
            </div>
            <div className="bg-surface border border-border rounded-sm px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Outstanding</div>
              <div className="font-syne text-2xl text-red">₹180 Cr</div>
              <div className="text-[10px] text-gray mt-0.5 font-mono">72% drawn · 43% built</div>
            </div>
            <div className="bg-amber/8 border border-amber/25 rounded-sm px-4 py-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-amber/70 mb-1">Next Tranche (T5)</div>
              <div className="font-syne text-2xl text-amber">₹40 Cr</div>
              <div className="text-[10px] text-amber/60 mt-0.5 font-mono">AWAITING DECISION</div>
            </div>
          </div>

          {/* Decision buttons */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
              Select Action — What Does Kaveri HFC Do?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {BUTTONS.map(btn => {
                const Icon     = btn.icon
                const selected = decision === btn.key
                const cons     = CONSEQUENCES[btn.key]
                return (
                  <button
                    key={btn.key}
                    onClick={() => setDecision(selected ? null : btn.key)}
                    className="flex flex-col gap-2 p-4 rounded-sm border text-left transition-all duration-150"
                    style={{
                      borderColor: selected ? cons.color : 'rgba(30,30,46,1)',
                      background:  selected ? cons.bg    : 'rgba(15,15,26,1)',
                      boxShadow:   selected ? `0 0 0 1px ${cons.color}` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" style={{ color: selected ? cons.color : '#6B6B88' }} />
                      <span className="text-xs font-mono uppercase tracking-[0.1em] font-semibold"
                        style={{ color: selected ? cons.color : '#9090AA' }}>
                        {btn.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray leading-snug">{btn.desc}</p>
                    {selected && (
                      <div className="mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" style={{ color: cons.color }} />
                        <span className="text-[10px] font-mono" style={{ color: cons.color }}>SELECTED</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Consequence panel */}
            {con && decision && (
              <div
                className="rounded-sm border p-5 transition-all duration-200"
                style={{ background: con.bg, borderColor: con.border }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: con.color }}>
                      {decision} — Consequence Analysis
                    </div>
                    <div className="font-syne text-xl" style={{ color: con.color }}>
                      {con.headline}
                    </div>
                  </div>
                  <div className="ml-auto text-right shrink-0">
                    <div className="font-syne text-2xl" style={{ color: con.color }}>{con.metric}</div>
                    <div className="text-[10px] font-mono text-gray mt-0.5">{con.metricLabel}</div>
                  </div>
                </div>

                <ul className="space-y-2">
                  {con.body.map((line, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-light leading-relaxed">
                      <span className="shrink-0 mt-0.5" style={{ color: con.color }}>›</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                {decision === 'HOLD' && (
                  <div className="mt-4 pt-4 border-t border-gold/20">
                    <p className="text-gold text-xs font-medium">
                      Vantis Recommendation: HOLD — then RESTRUCTURE.
                    </p>
                    <p className="text-gray text-xs mt-1 leading-relaxed">
                      Holding preserves optionality. Use the 30-day window to verify the milestone physically,
                      then negotiate a 4-increment restructure with cross-collateral from Ozone Westgate and Park Avenue.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tranche schedule */}
          <div className="bg-surface border border-border rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface2">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">
                Tranche Schedule — Ozone Urbana · ₹250 Cr Construction Finance
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Tranche', 'Amount', 'Date', 'Milestone', 'Milestone Met', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-[0.12em] text-gray">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {OZONE_TRANCHES.map(t => (
                    <tr
                      key={t.id}
                      className="border-b border-border/50 last:border-0 transition-colors"
                      style={{
                        background: t.status === 'PENDING'
                          ? 'rgba(243,156,18,0.06)'
                          : t.status === 'CONDITIONAL'
                          ? 'rgba(107,107,136,0.04)'
                          : 'transparent',
                      }}
                    >
                      <td className="px-4 py-3 text-xs font-mono font-bold text-off-white">{t.id}</td>
                      <td className="px-4 py-3 text-xs font-mono text-off-white">₹{t.amount_cr} Cr</td>
                      <td className="px-4 py-3 text-xs font-mono text-gray">{t.date}</td>
                      <td className="px-4 py-3 text-xs text-gray-light">{t.milestone}</td>
                      <td className="px-4 py-3">
                        {t.milestone_met
                          ? <CheckCircle2 className="w-4 h-4 text-green" />
                          : <XCircle className="w-4 h-4 text-red" />
                        }
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-border bg-surface2 flex items-center justify-between">
              <div className="text-[10px] font-mono text-gray">Total: T1+T2+T3+T4 = ₹180 Cr disbursed</div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] font-mono text-amber">₹40 Cr pending (T5)</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-light">₹30 Cr conditional (T6)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!isOzone && (
        <div className="bg-surface border border-border rounded-sm p-8 text-center">
          <CheckCircle2 className="w-8 h-8 text-green mx-auto mb-3" />
          <div className="text-off-white text-sm font-medium mb-1">No Active Tranche Decisions</div>
          <div className="text-gray text-xs">All disbursements for {project.name} are current. Next review due at next QPR cycle.</div>
          <Link href={`/lend/project/${project.id}`}
            className="mt-4 inline-block text-xs text-gold font-mono hover:opacity-80 transition-opacity">
            ← View Project Details
          </Link>
        </div>
      )}
    </div>
  )
}
