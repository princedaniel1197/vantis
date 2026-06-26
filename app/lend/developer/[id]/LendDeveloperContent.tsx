'use client'

import Link from 'next/link'
import { ArrowLeft, TrendingDown, TrendingUp, Minus, ArrowRight } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  LEND_DEVELOPERS, LEND_PROJECTS, BAND_COLOR, BAND_LABEL, OZONE_CASCADE,
} from '@/lib/lend-portfolio'

function ScoreGauge({ score }: { score: number }) {
  const r  = 38; const cx = 52; const cy = 52
  const C      = 2 * Math.PI * r
  const arcLen = C * 0.72
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
      {impact < 0 ? <TrendingDown className="w-3 h-3 shrink-0" style={{ color }} />
       : impact > 0 ? <TrendingUp className="w-3 h-3 shrink-0" style={{ color }} />
       : <Minus className="w-3 h-3 shrink-0 text-gray" />}
      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
        <div style={{ width: `${abs}%`, background: color, height: '100%' }} />
      </div>
      <span className="text-[10px] font-mono w-8 text-right" style={{ color }}>
        {impact > 0 ? `+${impact}` : impact}
      </span>
    </div>
  )
}

// ── Cascade visualization (Ozone Group only) ──────────────────────────────────
function CascadeCard({ p, isHero }: { p: typeof OZONE_CASCADE[0]; isHero?: boolean }) {
  const { text: pt, bg: pbg, border: pbd } = BAND_COLOR[p.risk_band]
  const escrowColor = p.escrow_pct < 20 ? '#E74C3C' : p.escrow_pct < 40 ? '#F39C12' : '#2ECC71'
  return (
    <div
      className="flex-1 rounded-sm border p-4 relative"
      style={{ background: pbg, borderColor: isHero ? pt : pbd, boxShadow: isHero ? `0 0 0 1px ${pt}` : 'none' }}
    >
      {isHero && (
        <div
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm"
          style={{ color: pt, background: 'rgba(10,10,15,1)', border: `1px solid ${pt}` }}
        >
          HERO PROJECT
        </div>
      )}
      <div className="text-[9px] font-mono uppercase tracking-[0.1em] mb-1" style={{ color: pt }}>
        {BAND_LABEL[p.risk_band]}
      </div>
      <div className="font-syne text-sm text-off-white leading-tight mb-0.5">{p.name}</div>
      <div className="text-gray text-[10px] mb-3">{p.city}</div>
      <div className="text-xs font-mono font-bold" style={{ color: pt }}>₹{p.outstanding_cr} Cr</div>
      <div className="text-[9px] font-mono text-gray mt-0.5">outstanding</div>
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-mono uppercase text-gray">Escrow</span>
          <span className="text-[10px] font-mono font-bold" style={{ color: escrowColor }}>{p.escrow_pct}%</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${p.escrow_pct}%`, background: escrowColor }} />
        </div>
        <div className="mt-1.5 text-[9px] text-gray leading-snug">{p.escrow_concern}</div>
      </div>
    </div>
  )
}

function CascadeView() {
  const total = OZONE_CASCADE.reduce((s, p) => s + p.outstanding_cr, 0)
  // Display order: Westgate (amber, left) → Urbana (red, center) ← Park Ave (amber, right)
  const [urbana, westgate, parkAve] = OZONE_CASCADE

  return (
    <div className="bg-surface border border-border rounded-sm p-5 mt-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-1">
        Developer Cascade · Ozone Group — ₹{total} Cr Total Exposure
      </div>
      <p className="text-gray text-xs mb-5 leading-relaxed">
        Kaveri HFC has exposure to Ozone Group across 3 projects. Escrow account analysis reveals
        anomalous withdrawal patterns in the two amber projects — consistent with funds being diverted
        to cover Ozone Urbana&rsquo;s construction shortfall.
      </p>

      <div className="flex items-start gap-3 pt-4">
        <CascadeCard p={westgate} />

        <div className="flex flex-col items-center justify-center gap-1 shrink-0 pt-10">
          <div className="text-[8px] font-mono text-red uppercase tracking-[0.08em]">escrow</div>
          <div className="text-[8px] font-mono text-red uppercase tracking-[0.08em]">drain</div>
          <ArrowRight className="w-5 h-5 text-red" />
        </div>

        <CascadeCard p={urbana} isHero />

        <div className="flex flex-col items-center justify-center gap-1 shrink-0 pt-10">
          <div className="text-[8px] font-mono text-red uppercase tracking-[0.08em]">escrow</div>
          <div className="text-[8px] font-mono text-red uppercase tracking-[0.08em]">drain</div>
          <ArrowLeft className="w-5 h-5 text-red" />
        </div>

        <CascadeCard p={parkAve} />
      </div>

      <div className="mt-5 px-4 py-3 bg-red/6 border border-red/20 rounded-sm">
        <p className="text-red text-xs font-medium mb-1">Portfolio concentration risk</p>
        <p className="text-gray-light text-xs leading-relaxed">
          ₹{total} Cr across 3 projects with a single developer is a concentration event.
          Escrow cross-contamination — Westgate and Park Avenue accounts show withdrawals correlating
          with Urbana&rsquo;s QPR deadlines — suggests group-level liquidity stress.
          Any Urbana restructure must include cross-collateral from all 3 projects.
        </p>
      </div>
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
  const isOzone    = id === 'ozone-group'
  const devProjects = LEND_PROJECTS.filter(p => p.developer_id === id)

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <Link
        href="/lend"
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Portfolio
      </Link>

      {/* Page label */}
      <div className="mb-4">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray">Vantis Lend · Developer Profile</div>
      </div>

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
          {isOzone && <div className="text-[10px] text-gray font-mono mt-0.5">3 projects · ₹520 Cr total</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gauge */}
        <div className="bg-surface border border-border rounded-sm p-5 flex flex-col items-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-4 self-start block">CIBIL-for-Builders Score</span>
          <ScoreGauge score={dev.score} />
          <div
            className="mt-3 px-4 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-[0.12em]"
            style={{ color: bandText, background: bandBg, border: `1px solid ${bandBorder}` }}
          >
            {BAND_LABEL[dev.band]}
          </div>
          <div className="mt-4 w-full">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1 block">Score Range</span>
            <div className="flex items-center gap-1 text-[9px] font-mono text-gray">
              <span className="text-red">300</span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-red via-amber to-green rounded" />
              <span className="text-green">900</span>
            </div>
          </div>
        </div>

        {/* Factors */}
        <div className="bg-surface border border-border rounded-sm p-5">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-4 block">Contributing Factors</span>
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

        {/* Trend + funded projects */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-sm p-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3 block">6-Quarter Score Trend</span>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={dev.score_trend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
                <XAxis dataKey="quarter" tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis domain={[200, 950]} tick={{ fill: '#6B6B88', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke={bandText} strokeWidth={2}
                  dot={{ fill: bandText, r: 3 }} activeDot={{ r: 5 }}
                  isAnimationActive animationDuration={1200}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-surface border border-border rounded-sm p-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3 block">{isOzone ? 'Portfolio Book (Kaveri HFC)' : 'Kaveri HFC Funded Projects'}</span>
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
                        <div className="font-mono text-xs" style={{ color: pt }}>₹{p.outstanding_cr} Cr</div>
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

      {/* Developer cascade (Ozone only) */}
      {isOzone && <CascadeView />}

      {/* SHAP explainability panel (Ozone only) */}
      {isOzone && (
        <div className="bg-surface border border-border rounded-sm p-5 mt-5">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-4 block">Score Explainability · RBI Model-Risk Compliant</span>

          {[
            { factor: 'QPR Non-Compliance',       impact: -62, detail: '3 missed filings in last 8 quarters' },
            { factor: 'Escrow Deficit',            impact: -48, detail: 'Avg 58% vs 70% mandate across book' },
            { factor: 'Litigation Exposure',       impact: -31, detail: '3 active cases, 1 NCLT admission' },
            { factor: 'Project Completion Rate',   impact: +18, detail: '2 of 6 historical projects delivered on time' },
            { factor: 'Years Active (Track Record)', impact: +15, detail: '14 years in Karnataka market' },
          ].map((f, i) => {
            const isPos = f.impact > 0
            const color = isPos ? '#2ECC71' : '#E74C3C'
            return (
              <div key={i} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-off-white">{f.factor}</span>
                  <span className="text-xs font-mono font-bold" style={{ color }}>{f.impact > 0 ? '+' : ''}{f.impact} pts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.abs(f.impact)}%`, background: color }} />
                  </div>
                </div>
                <div className="text-[9px] text-gray mt-0.5">{f.detail}</div>
              </div>
            )
          })}

          <div className="mt-5 p-3 bg-gold/8 border border-gold/25 rounded-sm">
            <p className="text-gold text-xs font-medium mb-1">Improvable Path to Score 480</p>
            <p className="text-gray-light text-xs leading-relaxed">
              File overdue Q3 2023 QPR with K-RERA <span className="text-gold font-mono">+28 pts</span> ·{' '}
              Resolve 1 eCourts case <span className="text-gold font-mono">+20 pts</span> ·{' '}
              Maintain escrow ≥70% for 2 consecutive quarters <span className="text-gold font-mono">+20 pts</span>
            </p>
          </div>

          <p className="text-gray text-[10px] mt-3 font-mono leading-relaxed border-t border-border pt-3">
            ಸ್ಕೋರ್ 412: ಮೂರು ಪ್ರಮುಖ ನ್ಯೂನತೆಗಳು — QPR ವಿಳಂಬ, ಎಸ್ಕ್ರೋ ಕೊರತೆ, ಮತ್ತು ನ್ಯಾಯಾಲಯ ಪ್ರಕರಣ.
          </p>
        </div>
      )}
    </div>
  )
}
