'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Clock, Database, Scale, HardHat, TrendingDown } from 'lucide-react'
import { LEND_PROJECTS, BAND_COLOR, BAND_LABEL } from '@/lib/lend-portfolio'

const RiskTimeline = dynamic(() => import('@/components/govern/RiskTimeline'), { ssr: false })

const OZONE_SIGNALS = [
  {
    icon: HardHat,
    source: 'K-RERA QPR Database',
    date: 'Q3 2021',
    text: 'Construction progress at 34% — 22% below declared milestone for the quarter. Physical inspection confirms stalled upper-floor work on Block C and D.',
  },
  {
    icon: Database,
    source: 'Kaveri Registration Portal',
    date: 'Q4 2021',
    text: 'Registration transaction velocity dropped 68% vs prior quarter. Only 4 sale deeds registered vs. developer-claimed 47 unit bookings — anomaly flagged.',
  },
  {
    icon: Scale,
    source: 'eCourts Karnataka API',
    date: 'Q1 2022',
    text: '2 civil suits filed by homebuyers (Cy/1122/2022) for possession delay. Same developer has 1 pending NCLT admission from Prestige-linked creditor.',
  },
  {
    icon: AlertTriangle,
    source: 'K-RERA Escrow Monitor',
    date: 'Q2 2022',
    text: 'Escrow balance ₹4.2 Cr — 8% of ₹52 Cr collected from buyers. RERA minimum is 70%. Developer unable to explain ₹47.8 Cr discrepancy.',
  },
]

const GENERIC_SIGNALS = [
  { icon: HardHat,       source: 'K-RERA QPR Database',       date: 'Q2 2024', text: 'QPR filed 12 days late — second occurrence in 4 quarters. Construction milestone partially met.' },
  { icon: Database,      source: 'Kaveri Registration Portal', date: 'Q1 2024', text: 'Registration velocity consistent. No anomalous transaction patterns detected.' },
  { icon: AlertTriangle, source: 'K-RERA Escrow Monitor',      date: 'Q4 2023', text: 'Escrow balance maintained at 21% — marginally above RERA minimum. Monitor next quarter.' },
]

export default function LendProjectContent({ id }: { id: string }) {
  const project = LEND_PROJECTS.find(p => p.id === id)

  if (!project) {
    return (
      <div className="p-8 text-center text-gray">
        Project not found.{' '}
        <Link href="/lend" className="text-gold underline">Back to portfolio</Link>
      </div>
    )
  }

  const isOzone = project.id === 'ozone-urbana'
  const { text: bandText } = BAND_COLOR[project.risk_band]
  const signals = isOzone ? OZONE_SIGNALS : GENERIC_SIGNALS

  return (
    <div className="p-5 max-w-[1200px] mx-auto">
      {/* Back */}
      <Link
        href="/lend"
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors duration-150 mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Portfolio
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm"
              style={{ color: bandText, background: `${bandText}18`, border: `1px solid ${bandText}44` }}
            >
              {BAND_LABEL[project.risk_band]}
            </span>
            {isOzone && (
              <span className="text-[9px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm bg-red/10 text-red border border-red/30">
                HERO CATCH
              </span>
            )}
          </div>
          <h1 className="font-syne text-2xl text-off-white">{project.name}</h1>
          <div className="text-gray text-sm mt-0.5">{project.developer} · {project.city}</div>
        </div>

        {/* Loan facts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            { label: 'Outstanding', value: `₹${project.outstanding_cr} Cr`, accent: true },
            { label: 'Vantis Score', value: String(project.risk_score), accent: false },
            { label: 'Loan Type',   value: project.loan_type, accent: false },
            { label: 'Sanctioned',  value: project.loan_sanctioned, accent: false },
            { label: 'RERA',        value: project.rera_id.slice(0, 18) + '…', accent: false },
            ...(project.flagged_quarter ? [{ label: 'Flagged', value: project.flagged_quarter, accent: false }] : []),
          ] as { label: string; value: string; accent: boolean }[]).map(({ label, value, accent }) => (
            <div key={label} className="bg-surface border border-border rounded-sm px-3 py-2">
              <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-gray mb-0.5">{label}</div>
              <div className={`text-sm font-mono font-semibold ${accent ? 'text-red' : 'text-off-white'}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery window */}
      {project.recovery_window && (
        <div
          className="mb-6 px-4 py-3 rounded-sm border-l-2 flex items-center gap-3"
          style={{
            borderLeftColor: project.recovery_window === 'RECOVERABLE' ? '#F39C12' : '#E74C3C',
            background:      project.recovery_window === 'RECOVERABLE' ? 'rgba(243,156,18,0.08)' : 'rgba(231,76,60,0.08)',
          }}
        >
          <Clock className="w-4 h-4 shrink-0" style={{ color: project.recovery_window === 'RECOVERABLE' ? '#F39C12' : '#E74C3C' }} />
          <div>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: project.recovery_window === 'RECOVERABLE' ? '#F39C12' : '#E74C3C' }}
            >
              {project.recovery_window}
            </span>
            {isOzone && (
              <span className="text-gray text-xs ml-2">— flagged 6 quarters before first EMI default would have surfaced</span>
            )}
          </div>
        </div>
      )}

      {/* SMA contrast banner */}
      {isOzone && (
        <div className="mb-6 bg-surface border border-border-soft rounded-sm px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-gold" />
            <span className="text-gold text-xs font-mono uppercase tracking-[0.1em]">Vantis vs SMA</span>
          </div>
          <p className="text-gray-light text-sm leading-relaxed">
            The bank&rsquo;s own SMA-0 system would have flagged Ozone Urbana only at the{' '}
            <strong className="text-red">first missed EMI</strong> — Q2 2023.
            Vantis flagged it at <strong className="text-amber">Q3 2021</strong>, giving Kaveri HFC{' '}
            <strong className="text-gold">6–8 quarters</strong> to restructure, demand additional collateral, or exit the exposure while it was still recoverable.
          </p>
        </div>
      )}

      {/* Risk Timeline */}
      {isOzone ? (
        <div className="bg-surface border border-border rounded-sm p-5 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
            Vantis 8-Quarter Risk Trajectory · Ozone Urbana
          </div>
          <RiskTimeline />
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-sm p-5 mb-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">
            Risk Score Trend · {project.name}
          </div>
          <div className="flex items-center gap-3">
            <div
              className="text-4xl font-syne font-bold"
              style={{ color: project.risk_score >= 650 ? '#2ECC71' : project.risk_score >= 450 ? '#F39C12' : '#E74C3C' }}
            >
              {project.risk_score}
            </div>
            <div>
              <div className="text-gray text-xs">Current Vantis Score</div>
              <div className="text-gray text-xs mt-0.5">{BAND_LABEL[project.risk_band]} — no active flags</div>
            </div>
          </div>
          <div className="mt-3 text-gray text-xs border-l-2 border-gold pl-3">
            Score stable within ±15 points over the past 6 quarters. No escalation triggers active.
          </div>
        </div>
      )}

      {/* Signal feed */}
      <div className="bg-surface border border-border rounded-sm p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
          Signal Feed — Why Vantis Flagged This
        </div>
        <div className="space-y-3">
          {signals.map((s, i) => (
            <div key={i} className="flex gap-3 p-3 bg-surface2 border border-border rounded-sm">
              <div className="shrink-0 mt-0.5">
                <s.icon className="w-4 h-4 text-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray-light px-1.5 py-0.5 bg-border-soft rounded-sm">
                    {s.source}
                  </span>
                  <span className="text-[10px] font-mono text-gray">{s.date}</span>
                </div>
                <p className="text-gray-light text-xs leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer link */}
      <div className="mt-4 flex justify-end">
        <Link
          href={`/lend/developer/${project.developer_id}`}
          className="text-xs font-mono text-gold hover:text-gold-light uppercase tracking-[0.08em] transition-colors"
        >
          View {project.developer} Risk Profile →
        </Link>
      </div>
    </div>
  )
}
