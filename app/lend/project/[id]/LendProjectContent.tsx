'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  ArrowLeft, AlertTriangle, Clock, Database, Scale, HardHat, TrendingDown,
  ChevronRight, ShieldAlert, CheckCircle2,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  CartesianGrid,
} from 'recharts'
import {
  LEND_PROJECTS, BAND_COLOR, BAND_LABEL,
  OZONE_DIVERGENCE,
} from '@/lib/lend-portfolio'

const RiskTimeline = dynamic(() => import('@/components/govern/RiskTimeline'), { ssr: false })

const OZONE_SIGNALS = [
  {
    icon: HardHat,
    source: 'K-RERA QPR Database',
    date: 'Q3 2021',
    text: 'Construction progress at 34% — 22% below declared milestone. Physical inspection confirms stalled upper-floor work on Block C and D.',
  },
  {
    icon: Database,
    source: 'Kaveri Registration Portal',
    date: 'Q4 2021',
    text: 'Registration velocity dropped 68% vs prior quarter. Only 4 sale deeds registered vs. developer-claimed 47 unit bookings — anomaly flagged.',
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

function DivTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border rounded-sm px-3 py-2 text-xs">
      <div className="font-mono text-gray mb-1.5">{label}</div>
      {payload.map(d => (
        <div key={d.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-5 h-0.5 rounded" style={{ background: d.color }} />
          <span className="text-gray-light">{d.name === 'pct_drawn' ? '% Drawn' : '% Built'}</span>
          <span className="ml-2 font-mono font-bold" style={{ color: d.color }}>{d.value}%</span>
        </div>
      ))}
    </div>
  )
}

function FlagTimeline() {
  const MILESTONES = [
    { q: 'Q3 2021', label: 'Vantis Lend Flags',    sub: 'QPR + escrow anomaly cross composite threshold',       color: '#C9A84C', icon: '★', delta: null },
    { q: 'Q1 2022', label: 'Bank SMA-2 Trigger',   sub: 'Internal grading would have fired here (+2 quarters)', color: '#F39C12', icon: '⚠', delta: '+2 quarters late' },
    { q: 'Q2 2022', label: 'NPA Declared',          sub: 'First missed EMI — official NPA classification (+3)',   color: '#E74C3C', icon: '✕', delta: '+3 quarters late' },
  ]

  return (
    <div className="relative">
      <div className="absolute top-5 left-[15%] right-[15%] h-px bg-border" />
      <div className="flex items-start justify-around relative">
        {MILESTONES.map((m, i) => (
          <div key={i} className="flex flex-col items-center text-center max-w-[160px]">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold border-2 bg-background relative z-10"
              style={{ borderColor: m.color, color: m.color }}
            >
              {m.icon}
            </div>
            <div className="mt-2 font-mono text-[11px] font-bold" style={{ color: m.color }}>{m.q}</div>
            <div className="mt-1 text-xs text-off-white font-medium leading-tight">{m.label}</div>
            <div className="mt-1 text-[10px] text-gray leading-snug">{m.sub}</div>
            {m.delta && (
              <div
                className="mt-2 text-[9px] font-mono px-2 py-0.5 rounded-sm"
                style={{ color: m.color, background: `${m.color}15`, border: `1px solid ${m.color}30` }}
              >
                {m.delta}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-5 px-4 py-3 bg-gold/8 border border-gold/25 rounded-sm">
        <p className="text-gold text-xs font-medium">The 6-quarter head start is the product.</p>
        <p className="text-gray-light text-xs mt-1 leading-relaxed">
          Banks wait for a missed EMI before acting. Vantis reads QPR filings, registration data, escrow movements, and court dockets from day one —
          giving credit officers the window to restructure while recovery is still possible.
          Karnataka RE recovery rate post-NPA: <strong className="text-red">14%</strong>.
          Recovery rate on restructured exposure: <strong className="text-amber">68%</strong>.
        </p>
      </div>
    </div>
  )
}

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

  const isOzone          = project.id === 'ozone-urbana'
  const { text: bandText } = BAND_COLOR[project.risk_band]

  // Build signal feed from early_warning_signals when available
  const derivedSignals = project.early_warning_signals?.map(sig => ({
    icon: AlertTriangle,
    source: 'Vantis Composite Monitor',
    date: project.flagged_quarter ?? 'Q1 2024',
    text: sig,
  }))
  const signals = isOzone ? OZONE_SIGNALS : (derivedSignals?.length ? derivedSignals : GENERIC_SIGNALS)

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <Link
        href="/lend"
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Portfolio
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="text-[9px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm"
              style={{ color: bandText, background: `${bandText}18`, border: `1px solid ${bandText}44` }}
            >
              {BAND_LABEL[project.risk_band]}
            </span>
            {isOzone && (
              <>
                <span className="text-[9px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm bg-red/10 text-red border border-red/30">
                  HERO CATCH
                </span>
                <Link
                  href="/lend/tranche/ozone-urbana"
                  className="text-[9px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm bg-amber/10 text-amber border border-amber/30 hover:bg-amber/20 transition-colors flex items-center gap-1"
                >
                  ₹40 Cr TRANCHE PENDING <ChevronRight className="w-2.5 h-2.5" />
                </Link>
              </>
            )}
          </div>
          <h1 className="font-syne text-2xl text-off-white">{project.name}</h1>
          <div className="text-gray text-sm mt-0.5">{project.developer} · {project.city}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([
            { label: 'Outstanding',  value: `₹${project.outstanding_cr} Cr`,                     accent: true  },
            { label: 'Sanctioned',   value: `₹${project.sanctioned_cr ?? project.exposure_cr} Cr`, accent: false },
            { label: 'Vantis Score', value: String(project.risk_score),                            accent: false },
            { label: '% Drawn',      value: project.drawn_pct   ? `${project.drawn_pct}%`   : '—', accent: false },
            { label: '% Built',      value: project.built_pct   ? `${project.built_pct}%`   : '—', accent: false },
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
            <span className="text-xs font-mono font-bold" style={{ color: project.recovery_window === 'RECOVERABLE' ? '#F39C12' : '#E74C3C' }}>
              {project.recovery_window}
            </span>
            {isOzone && (
              <span className="text-gray text-xs ml-2">
                — flagged 6 quarters before first EMI default would have surfaced
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3 Woven Proofs (Ozone only) */}
      {isOzone ? (
        <>
          {/* Proof 1: Divergence chart */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-5">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">
                Proof 1 · % Drawn vs % Built — The 29-Point Gap
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-red rounded" /><span className="text-gray">% Drawn</span></div>
                <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-green rounded" /><span className="text-gray">% Built (K-RERA)</span></div>
              </div>
            </div>
            <p className="text-gray text-xs mb-4 leading-relaxed">
              By Q3 2021, money disbursed (50%) first crossed money&rsquo;s-worth built (43%) — 7 points.
              The gap widened to <strong className="text-red">29 points</strong> by Q2 2022 and never closed.
              This is the signal no SMA system can see.
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={OZONE_DIVERGENCE} margin={{ top: 4, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} />
                <Tooltip content={<DivTooltip />} />
                <ReferenceLine x="Q3 2021" stroke="#C9A84C" strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value: 'VANTIS FLAG', fill: '#C9A84C', fontSize: 9, position: 'top' }}
                />
                <Line type="monotone" dataKey="pct_drawn" stroke="#E74C3C" strokeWidth={2.5}
                  dot={{ fill: '#E74C3C', r: 3 }} activeDot={{ r: 5 }} name="pct_drawn"
                />
                <Line type="monotone" dataKey="pct_built" stroke="#2ECC71" strokeWidth={2.5}
                  dot={{ fill: '#2ECC71', r: 3 }} activeDot={{ r: 5 }} name="pct_built"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Proof 2: Risk score trajectory */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">
              Proof 2 · Vantis 8-Quarter Risk Score Trajectory · Ozone Urbana
            </div>
            <p className="text-gray text-xs mb-4 leading-relaxed">
              Score fell from 480 (WATCH) in Q1 2021 to 9 by Q4 2022 — a composite of QPR, registration, escrow, and court data.
              No single signal triggers the flag. The composite does.
            </p>
            <RiskTimeline />
          </div>

          {/* Proof 3: Flag-vs-default timeline */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">
              Proof 3 · Vantis vs Bank System — The 6-Quarter Head Start
            </div>
            <p className="text-gray text-xs mb-5 leading-relaxed">
              Compared against the bank&rsquo;s own SMA-0 system and the eventual NPA declaration.
            </p>
            <FlagTimeline />
          </div>

          {/* Predictive model panel */}
          <div className="bg-surface border border-border rounded-sm p-5 mt-5 mb-1">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">Predictive Model · DCCO Slip Probability</div>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="text-center p-4 bg-red/6 border border-red/20 rounded-sm">
                <div className="font-syne text-5xl text-red font-bold">71%</div>
                <div className="text-[10px] font-mono text-gray mt-2">P(slip DCCO within 6 months)</div>
              </div>
              <div className="text-center p-4 bg-red/6 border border-red/20 rounded-sm">
                <div className="font-syne text-5xl text-red font-bold">89%</div>
                <div className="text-[10px] font-mono text-gray mt-2">P(slip DCCO within 12 months)</div>
              </div>
            </div>
            <p className="text-gray text-xs mt-4 leading-relaxed">
              Vantis survival model trained on 234 resolved Karnataka projects (2016–2023).{' '}
              <Link href="/lend/models" className="text-gold hover:underline">Full model →</Link>
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Risk score */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">
              Risk Score · {project.name}
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
                <div className="text-gray text-xs mt-0.5">{BAND_LABEL[project.risk_band]}</div>
              </div>
            </div>
          </div>

          {/* Loan status panel — only for projects with enriched data */}
          {(project.covenant_status || project.repayment_status || project.escrow_pct !== undefined) && (
            <div className="bg-surface border border-border rounded-sm p-5 mb-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">Loan Status</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {project.covenant_status && (
                  <div className="bg-surface2 border border-border rounded-sm px-3 py-2">
                    <div className="text-[9px] font-mono text-gray uppercase tracking-[0.1em] mb-1">Covenants</div>
                    <div
                      className="text-sm font-mono font-bold"
                      style={{ color: project.covenant_status === 'BREACHED' ? '#E74C3C' : project.covenant_status === 'AMBER' ? '#F39C12' : '#2ECC71' }}
                    >
                      {project.covenant_status}
                    </div>
                  </div>
                )}
                {project.repayment_status && (
                  <div className="bg-surface2 border border-border rounded-sm px-3 py-2">
                    <div className="text-[9px] font-mono text-gray uppercase tracking-[0.1em] mb-1">Repayment</div>
                    <div
                      className="text-sm font-mono font-bold"
                      style={{ color: project.repayment_status === 'NPA' || project.repayment_status === 'SMA_1' ? '#E74C3C' : project.repayment_status === 'SMA_0' ? '#F39C12' : '#2ECC71' }}
                    >
                      {project.repayment_status.replace('_', '-')}
                    </div>
                  </div>
                )}
                {project.escrow_pct !== undefined && (
                  <div className="bg-surface2 border border-border rounded-sm px-3 py-2">
                    <div className="text-[9px] font-mono text-gray uppercase tracking-[0.1em] mb-1">Escrow</div>
                    <div className="text-sm font-mono font-bold" style={{ color: project.escrow_pct >= 70 ? '#2ECC71' : project.escrow_pct >= 20 ? '#F39C12' : '#E74C3C' }}>
                      {project.escrow_pct}%
                    </div>
                    <div className="text-[9px] text-gray mt-0.5">vs 70% mandate</div>
                  </div>
                )}
                {project.last_qpr_status && (
                  <div className="bg-surface2 border border-border rounded-sm px-3 py-2">
                    <div className="text-[9px] font-mono text-gray uppercase tracking-[0.1em] mb-1">Last QPR</div>
                    <div
                      className="text-sm font-mono font-bold"
                      style={{ color: project.last_qpr_status === 'ON_TIME' ? '#2ECC71' : project.last_qpr_status === 'LATE' ? '#F39C12' : '#E74C3C' }}
                    >
                      {project.last_qpr_status.replace('_', ' ')}
                    </div>
                    {project.qpr_consecutive_misses !== undefined && project.qpr_consecutive_misses > 0 && (
                      <div className="text-[9px] text-red mt-0.5">{project.qpr_consecutive_misses} consecutive</div>
                    )}
                  </div>
                )}
              </div>

              {/* Early warning signals */}
              {project.early_warning_signals && project.early_warning_signals.length > 0 && (
                <div className="mt-2">
                  <div className="text-[9px] font-mono text-gray uppercase tracking-[0.1em] mb-2">Early Warning Signals</div>
                  <div className="space-y-1.5">
                    {project.early_warning_signals.map((sig, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-light leading-relaxed">{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stress note */}
              {project.stress_note && (
                <div className="mt-4 px-3 py-2.5 bg-red/6 border border-red/20 rounded-sm">
                  <div className="text-[9px] font-mono text-red uppercase tracking-[0.1em] mb-1">Credit Officer Note</div>
                  <p className="text-xs text-gray-light leading-relaxed">{project.stress_note}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Signal feed */}
      <div className="bg-surface border border-border rounded-sm p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
          Signal Feed — Why Vantis Flagged This
        </div>
        <div className="space-y-3">
          {signals.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={i} className="flex gap-3 p-3 bg-surface2 border border-border rounded-sm">
                <div className="shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray-light px-1.5 py-0.5 bg-border/50 rounded-sm">
                      {s.source}
                    </span>
                    <span className="text-[10px] font-mono text-gray">{s.date}</span>
                  </div>
                  <p className="text-gray-light text-xs leading-relaxed">{s.text}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Link
          href={`/lend/developer/${project.developer_id}`}
          className="text-xs font-mono text-gold hover:text-gold-light uppercase tracking-[0.08em] transition-colors"
        >
          View {project.developer} Risk Profile →
        </Link>
        {isOzone && (
          <Link
            href="/lend/tranche/ozone-urbana"
            className="flex items-center gap-1.5 text-xs font-mono text-amber hover:opacity-80 uppercase tracking-[0.08em] transition-colors"
          >
            Go to Tranche Decision →
          </Link>
        )}
      </div>
    </div>
  )
}
