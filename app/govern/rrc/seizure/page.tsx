'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ChevronLeft, FileText, Shield, Eye, Check, Clock, ChevronRight } from 'lucide-react'

/* ─────────────────────────────────────────
   RECOVERY PROCESS — 8 LEGAL STAGES
   RERA Sec 40 / Karnataka RERA Rule 25
───────────────────────────────────────── */
const RECOVERY_STAGES = [
  { n: 1, title: 'RERA Order Passed',              law: 'Sec 18 / 40',              short: 'RERA Order'    },
  { n: 2, title: '60-Day Grace Period',             law: 'Developer window to pay',  short: '60-Day Grace'  },
  { n: 3, title: 'Recovery Certificate Issued',     law: 'Sec 40 — land revenue',    short: 'RRC Issued'    },
  { n: 4, title: 'Forwarded to Dy. Commissioner',   law: 'K-RERA Rule 25',           short: 'Fwd to DC'     },
  { n: 5, title: 'Asset Identification',            law: 'DC traces seizable assets', short: 'Asset ID',    bottleneck: true  },
  { n: 6, title: 'Attachment Notice Issued',        law: 'DC order to register',      short: 'Attach Notice' },
  { n: 7, title: 'Attachment & Sale',               law: 'Revenue Dept auction',      short: 'Attach & Sale' },
  { n: 8, title: 'Recovered / Certificate Executed', law: 'Certificate executed',     short: 'Executed'      },
] as const

interface Asset {
  n: number
  desc: string
  type: string
  holder: string
  value_crore: number
  source: string
  related: boolean
  note: string
}

const ASSETS: Asset[] = [
  {
    n: 1,
    desc: 'Project land — 18.4 acres, Survey No. 94/1, 94/2, 94/3, 94/4, Devanahalli Hobli, Bengaluru Urban District',
    type: 'Agricultural / Development Land',
    holder: 'Ozone Urbana Promoters Pvt. Ltd.',
    value_crore: 82.0,
    source: 'Kaveri 2.0 + Bhoomi',
    related: false,
    note: 'Mortgaged in part to escrow bank. 12.8 acres unencumbered and available for immediate attachment.',
  },
  {
    n: 2,
    desc: 'Escrow account (KA/RERA/ESC/1251/2016) + operational bank accounts × 2 — Karnataka Bank, HDFC Bank',
    type: 'Liquid / Bank Accounts',
    holder: 'Ozone Urbana Promoters Pvt. Ltd.',
    value_crore: 12.4,
    source: 'RERA Escrow Records + RBI CERSAI',
    related: false,
    note: 'Escrow balance ₹3.88 Cr. Operational accounts total ₹8.52 Cr. All three accounts traceable and freezable.',
  },
  {
    n: 3,
    desc: 'Commercial office premises — 8,400 sqft, EPIP Zone, Whitefield, Bengaluru — BBMP Ref KA/WH/BBMP/2019/4421',
    type: 'Commercial Property',
    holder: 'Ozone Group Holdings Pvt. Ltd.',
    value_crore: 14.2,
    source: 'BBMP Property Tax Records + Kaveri 2.0',
    related: false,
    note: 'Held in group holding entity, not project SPV. Attachment requires corporate veil proceedings (IBC s. 66).',
  },
  {
    n: 4,
    desc: 'Residential villa — No. 28, 4th Cross, Sadashivanagar, Bengaluru — Khata No. 841/20/SN',
    type: 'Residential Property',
    holder: 'Promoter (individual name withheld pending notice)',
    value_crore: 6.8,
    source: 'BBMP + Kaveri 2.0',
    related: false,
    note: 'Clear title. No mortgage or encumbrance on record. Attachment straightforward under RERA s. 40.',
  },
  {
    n: 5,
    desc: 'Agricultural land — 179 acres, Survey No. 48/1 to 48/9, Kannehalli Village, Tumkur Taluk, Tumkur District',
    type: 'Agricultural Land',
    holder: "Promoter's spouse (individual name withheld pending notice)",
    value_crore: 202.6,
    source: 'Bhoomi + Kaveri 2.0 (cross-reference)',
    related: true,
    note: "Registered February 2019. Purchase funded during Ozone Urbana's peak collection phase (FY 2018–19). Acquisition pattern consistent with related-party asset concealment. Not previously surfaced in any recovery proceeding. Identified via Vantis related-party name-match across Bhoomi records.",
  },
]

const TOTAL_TRACEABLE  = ASSETS.reduce((s, a) => s + a.value_crore, 0)   // 318
const AMOUNT_ORDERED   = 423
const AMOUNT_RECOVERED = 0
const SHORTFALL        = AMOUNT_ORDERED - AMOUNT_RECOVERED
const GAP              = SHORTFALL - TOTAL_TRACEABLE
const COVERAGE_PCT     = Math.round((TOTAL_TRACEABLE / SHORTFALL) * 100)

// HC 8-week directive timeline (Ozone-specific)
const RRC_ISSUED_DATE  = '11 Apr 2026'
const HC_DEADLINE_DATE = '06 Jun 2026'
const TODAY_LABEL      = '26 Jun 2026'
const DAYS_TO_DEADLINE = 56   // 8 weeks
const DAYS_ELAPSED     = 76   // Apr 11 → Jun 26
const DAYS_OVERDUE     = DAYS_ELAPSED - DAYS_TO_DEADLINE  // 20

const ATTACHMENT_SEQUENCE = [
  { n: 1, asset: 'Escrow + bank accounts — Karnataka Bank, HDFC', value: 12.4,  type: 'Liquid',      timeline: 'Immediate (7–14 days)',  notes: 'Highest liquidity. Freeze order to banks; no title proceedings required.' },
  { n: 2, asset: 'Residential villa — Sadashivanagar, Bengaluru',  value: 6.8,   type: 'Residential', timeline: '30–45 days',            notes: 'Clear title, no mortgage. District Collector order sufficient.' },
  { n: 3, asset: 'Commercial office — Whitefield, EPIP Zone',      value: 14.2,  type: 'Commercial',  timeline: '45–90 days',            notes: 'Group entity veil. Requires NCLT/IBC s. 66 alongside RERA order.' },
  { n: 4, asset: 'Project land — Devanahalli Hobli, 18.4 acres',   value: 82.0,  type: 'Land',        timeline: '60–120 days',           notes: '12.8 acres unencumbered; immediately attachable. Court auction recommended.' },
  { n: 5, asset: 'Kannehalli agricultural land — 179 acres',       value: 202.6, type: 'Land',        timeline: '90–180 days',           notes: 'Related-party proceedings required. Notice to spouse as beneficial owner under Benami Act + PMLA s. 5.' },
]

function fmtCrore(n: number) {
  return `₹${Number(n.toFixed(1)).toLocaleString('en-IN')} Cr`
}

/* ─── Full 8-stage horizontal stepper ─── */
function RecoveryProcessStepper({ currentStage }: { currentStage: number }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-[680px]">
        {/* Circles + connectors */}
        <div className="flex items-center">
          {RECOVERY_STAGES.map((s, i) => {
            const completed = s.n < currentStage
            const active    = s.n === currentStage
            const isBottle  = 'bottleneck' in s && s.bottleneck

            return (
              <Fragment key={s.n}>
                {i > 0 && (
                  <div className={`flex-1 h-px ${s.n <= currentStage ? 'bg-gold/70' : 'bg-border'}`} />
                )}
                <div className={`relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  completed ? 'bg-gold' :
                  active && isBottle ? 'border-2 border-red bg-red/10 animate-pulse' :
                  active ? 'border-2 border-gold bg-gold/10 animate-pulse' :
                  'border border-border bg-surface2'
                }`}>
                  {completed
                    ? <Check className="w-4 h-4 text-[#0A0A0F]" />
                    : <span className={`font-mono text-xs font-bold ${
                        active && isBottle ? 'text-red' :
                        active            ? 'text-gold' : 'text-gray'
                      }`}>{s.n}</span>
                  }
                  {active && isBottle && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red animate-ping opacity-75" />
                  )}
                </div>
              </Fragment>
            )
          })}
        </div>

        {/* Stage labels */}
        <div className="flex mt-2.5">
          {RECOVERY_STAGES.map((s) => {
            const completed = s.n < currentStage
            const active    = s.n === currentStage
            const isBottle  = 'bottleneck' in s && s.bottleneck

            return (
              <div key={s.n} className="flex-1 text-center px-0.5 first:text-left last:text-right">
                <div className={`font-mono text-[7px] sm:text-[8px] uppercase tracking-[0.1em] leading-tight ${
                  completed ? 'text-gold/60' :
                  active && isBottle ? 'text-red font-bold' :
                  active ? 'text-gold font-bold' : 'text-gray/60'
                }`}>
                  {s.short}
                </div>
                <div className={`font-mono text-[6px] sm:text-[7px] mt-0.5 hidden sm:block ${
                  active && isBottle ? 'text-red/60' : 'text-gray/40'
                }`}>
                  {s.law}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   PAGE
   ================================================================ */
export default function OzoneSeizurePacket() {
  const [recoveryStage, setRecoveryStage]   = useState(5)
  const [noticeQueued,  setNoticeQueued]    = useState(false)

  const runningTotal = ATTACHMENT_SEQUENCE.reduce<number[]>((acc, s, i) => {
    return [...acc, (i === 0 ? 0 : acc[i - 1]) + s.value]
  }, [])

  function advanceToStage6() {
    setRecoveryStage(6)
    setNoticeQueued(true)
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link href="/govern/rrc" className="inline-flex items-center gap-1 text-gray text-xs hover:text-gold transition-colors duration-150 font-mono">
          <ChevronLeft className="w-3.5 h-3.5" />
          Recovery Certificate Tracker
        </Link>
        <span className="text-border text-xs">·</span>
        <span className="text-gray-light text-xs font-mono">Seizure Packet · Ozone Group</span>
      </div>

      {/* Restricted banner */}
      <div className="flex items-center gap-2.5 bg-red/10 border border-red/25 rounded-sm px-4 py-2.5 mb-5">
        <Shield className="w-4 h-4 text-red shrink-0" />
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-red">
          Restricted — Active Enforcement Order · K-RERA Authority Use Only
        </span>
      </div>

      {/* HC 8-week directive timeline */}
      <div className="bg-surface border border-border rounded-sm mb-5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-red shrink-0" />
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">
              Karnataka HC 8-Week Enforcement Directive
            </span>
            <span className="ml-2 font-mono text-[9px] text-red font-bold">{DAYS_OVERDUE} days overdue</span>
          </div>
        </div>

        <div className="flex gap-1.5 mb-2 h-5 rounded-sm overflow-hidden border border-border">
          {/* Within-deadline window */}
          <div
            className="h-full bg-gold/20 border-r border-gold/40 flex items-center justify-center shrink-0"
            style={{ width: `${(DAYS_TO_DEADLINE / DAYS_ELAPSED) * 100}%` }}
          >
            <span className="font-mono text-[7px] text-gold/70 hidden sm:block">
              {DAYS_TO_DEADLINE}d window
            </span>
          </div>
          {/* Overdue */}
          <div className="flex-1 h-full bg-red/25 flex items-center justify-center">
            <span className="font-mono text-[7px] text-red/80">+{DAYS_OVERDUE}d overdue</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-gray">
          <span>{RRC_ISSUED_DATE} — RRC Issued</span>
          <span className="text-amber">Deadline: {HC_DEADLINE_DATE}</span>
          <span className="text-red">Today: {TODAY_LABEL}</span>
        </div>
        <div className="mt-2 text-gray text-[10px] leading-relaxed">
          The Karnataka High Court directed that all RERA recovery certificates must be enforced within
          8 weeks of forwarding to the District Collector. This order is <strong className="text-red">{DAYS_OVERDUE} days overdue</strong>.
          Generating this packet completes Stage 5 and enables the DC to issue the attachment notice (Stage 6) immediately.
        </div>
      </div>

      {/* Recovery Process Stepper */}
      <div className="bg-surface border border-border rounded-sm mb-5">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">RERA Sec 40 Recovery Process · 8 Stages</div>
            <div className="text-gray text-xs mt-0.5">K-RERA Rule 25 · Karnataka RERA Act 2017</div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border ${
            recoveryStage === 5 ? 'bg-red/10 border-red/30' : 'bg-amber/10 border-amber/30'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              recoveryStage === 5 ? 'bg-red animate-pulse' : 'bg-amber'
            }`} />
            <span className={`font-mono text-[9px] font-bold ${
              recoveryStage === 5 ? 'text-red' : 'text-amber'
            }`}>
              Stage {recoveryStage}/8 — {RECOVERY_STAGES.find(s => s.n === recoveryStage)?.title}
            </span>
          </div>
        </div>

        <div className="p-5">
          <RecoveryProcessStepper currentStage={recoveryStage} />

          {/* Stage 5 bottleneck callout */}
          {recoveryStage === 5 && (
            <div className="mt-5 border border-red/25 bg-red/5 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red shrink-0" />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-red font-bold">
                  Stage 5 — Asset Identification — Stalled
                </span>
              </div>
              <div className="text-off-white text-sm leading-relaxed mb-3">
                <strong>88% of K-RERA recovery certificates never get past this stage.</strong>{' '}
                Out of 683 certificates issued statewide, 412 are stuck here — the Deputy Commissioner
                cannot identify what to seize. Without a cross-database asset trace, the legal authority
                to enforce is useless.
              </div>
              <div className="text-gray text-xs">
                The Karnataka HC noted this is a process that "takes at least five years" in standard
                practice. Vantis compresses it to hours by tracing assets across Kaveri 2.0, Bhoomi, BBMP,
                and RERA records simultaneously.
              </div>
            </div>
          )}

          {/* Stage 6 success panel */}
          {noticeQueued && (
            <div className="mt-5 border border-green/25 bg-green/5 rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-green font-bold">
                  Stage 6 — Attachment Notice Queued
                </span>
              </div>
              <div className="text-off-white text-sm leading-relaxed">
                Asset identification complete. Vantis has forwarded the traced asset report (5 assets,
                ₹318 Cr) to the office of the District Collector, Bengaluru Urban. Attachment notice
                will be issued within 7 working days, initiating Stage 7 — Attachment & Sale.
              </div>
              <div className="mt-2.5 text-gray text-[10px] font-mono">
                Ref: VANATT/2026/OZ-001 · Queued: 26 Jun 2026 · Status: PENDING DC SIGNATURE
              </div>
            </div>
          )}
        </div>

        {/* The seizure packet = Stage 5 output bridge */}
        {recoveryStage === 5 && (
          <div className="mx-5 mb-5 border border-gold/30 bg-gold/5 rounded-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold mb-1.5">
                  This Packet Completes Stage 5 — Asset Identification
                </div>
                <div className="text-off-white text-sm leading-relaxed">
                  Vantis has traced <strong>₹{TOTAL_TRACEABLE} Cr</strong> in seizable assets across
                  Kaveri 2.0 · Bhoomi · BBMP · RERA records — including the <strong className="text-gold">
                  Kannehalli related-party land (₹202.6 Cr)</strong> previously unknown to enforcement.
                  The Deputy Commissioner now has everything needed to issue the attachment notice.
                </div>
              </div>
              <button
                onClick={advanceToStage6}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-gold/20 border border-gold/50 text-gold font-mono text-xs rounded-sm hover:bg-gold/30 transition-colors duration-150 whitespace-nowrap"
              >
                Mark Stage 5 Complete
                <ChevronRight className="w-4 h-4" />
                Issue Attachment Notice
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document header */}
      <div className="bg-surface border border-border rounded-sm mb-5 overflow-hidden">
        <div className="border-l-4 border-gold p-6">
          <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold mb-2">
            Vantis Seizure Packet · RRC/K-RERA/2026/OZ-001
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white mb-1">Ozone Group</h1>
          <div className="text-gray text-sm">
            Ozone Urbana · KAR/RERA/1251/2016 · Devanahalli, Bengaluru Urban
          </div>
          <div className="text-gray text-xs mt-0.5">
            1,847 homebuyers affected · Generated by Vantis Intelligence · 13 May 2026
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
          <div className="p-5 text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-gray mb-1.5">Ordered by Court</div>
            <div className="font-syne text-2xl sm:text-3xl font-bold text-red">{fmtCrore(AMOUNT_ORDERED)}</div>
          </div>
          <div className="p-5 text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-gray mb-1.5">Recovered</div>
            <div className="font-syne text-2xl sm:text-3xl font-bold text-gray-light">{fmtCrore(AMOUNT_RECOVERED)}</div>
          </div>
          <div className="p-5 text-center">
            <div className="font-mono text-[9px] uppercase tracking-widest text-gray mb-1.5">Shortfall</div>
            <div className="font-syne text-2xl sm:text-3xl font-bold text-amber">{fmtCrore(SHORTFALL)}</div>
          </div>
        </div>
      </div>

      {/* Recovery Order Details */}
      <div className="bg-surface border border-border rounded-sm mb-5">
        <div className="px-5 pt-4 pb-2 border-b border-border">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Recovery Order</div>
        </div>
        <div className="divide-y divide-border/60">
          {[
            ['RRC Reference',     'RRC/K-RERA/2026/OZ-001'],
            ['Date Issued',       '11 April 2026'],
            ['Issuing Authority', 'Karnataka Real Estate Regulatory Authority (K-RERA)'],
            ['Legal Basis',       'RERA 2016 s. 40 · Non-compliance with refund order dt. 12 Jan 2026'],
            ['Basis of Amount',   '1,847 homebuyers × avg. ₹22.9 L refund + statutory interest'],
            ['Sent to',           'District Collector, Bengaluru Urban — unacknowledged as of 13 May 2026'],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-6 px-5 py-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gray w-44 shrink-0 mt-0.5">{label}</div>
              <div className="text-off-white text-xs leading-relaxed">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Traced Assets */}
      <div className="bg-surface border border-border rounded-sm mb-5">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">
            Traced Assets · Vantis Cross-Database Scan
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray">
            <Eye className="w-3 h-3" />
            Kaveri 2.0 · Bhoomi · BBMP · RERA Escrow
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {ASSETS.map(a => (
            <div key={a.n} className={`p-5 ${a.related ? 'bg-gold/[0.03]' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="font-mono text-[10px] text-gray pt-0.5 w-5 shrink-0">{a.n}.</div>
                <div className="flex-1 min-w-0">
                  {a.related && (
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gold/20 border border-gold/40 rounded-sm">
                        <AlertTriangle className="w-3 h-3 text-gold" />
                        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-gold font-bold">
                          ⚑ Key Discovery · Related-Party Trace
                        </span>
                      </div>
                      <div className="font-mono text-[9px] text-amber">
                        Registered in promoter's spouse's name — not in direct enforcement scope
                      </div>
                    </div>
                  )}
                  <div className={`text-sm leading-relaxed mb-1 ${a.related ? 'text-off-white font-medium' : 'text-off-white'}`}>
                    {a.desc}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-[10px] mt-1">
                    <span className="font-mono text-gold/70 px-1.5 py-0.5 bg-gold/5 border border-gold/20 rounded-sm">
                      {a.type}
                    </span>
                    <span className={a.related ? 'text-amber' : 'text-gray-light'}>{a.holder}</span>
                    <span className="text-gray">{a.source}</span>
                  </div>
                  <div className={`text-[10px] leading-relaxed mt-2 ${a.related ? 'text-amber/80' : 'text-gray'}`}>
                    {a.note}
                  </div>
                </div>
                <div className="shrink-0 text-right ml-4">
                  <div className={`font-syne font-bold ${a.related ? 'text-gold text-xl' : 'text-off-white text-lg'}`}>
                    {fmtCrore(a.value_crore)}
                  </div>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <CheckCircle2 className="w-3 h-3 text-green" />
                    <span className="text-green text-[9px] font-mono">Verified</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-surface/50">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Total Traceable Assets</div>
          <div className="font-syne text-xl font-bold text-off-white">{fmtCrore(TOTAL_TRACEABLE)}</div>
        </div>
      </div>

      {/* Recovery Gap Analysis */}
      <div className="bg-surface border border-border rounded-sm mb-5 p-5">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-4">Recovery Gap Analysis</div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-gray">Amount Ordered (total liability)</span>
              <span className="font-mono text-sm font-bold text-red">{fmtCrore(AMOUNT_ORDERED)}</span>
            </div>
            <div className="h-4 bg-red/20 border border-red/20 rounded-sm w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-gray">Assets Traced by Vantis</span>
              <span className="font-mono text-sm font-bold text-green">{fmtCrore(TOTAL_TRACEABLE)}</span>
            </div>
            <div className="h-4 bg-surface2 border border-border rounded-sm w-full overflow-hidden">
              <div className="h-full bg-green flex items-center justify-end pr-2" style={{ width: `${COVERAGE_PCT}%` }}>
                <span className="font-mono text-[8px] text-[#0A0A0F] font-bold">{COVERAGE_PCT}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-red/5 border border-red/20 rounded-sm p-4">
            <AlertTriangle className="w-4 h-4 text-red shrink-0 mt-0.5" />
            <div>
              <div className="text-off-white text-sm mb-1">
                <strong>{fmtCrore(TOTAL_TRACEABLE)}</strong> in traceable assets covers <strong>{COVERAGE_PCT}%</strong>{' '}
                of the ₹{AMOUNT_ORDERED} Cr ordered. A <strong className="text-red">{fmtCrore(GAP)} gap</strong> remains —
                may require additional investigation or pro-rata distribution to homebuyers.
              </div>
              <div className="text-gray text-xs">
                ₹{ASSETS[4].value_crore} Cr ({Math.round((ASSETS[4].value_crore / TOTAL_TRACEABLE) * 100)}% of traced
                assets) was found only through Vantis related-party analysis — the Kannehalli parcel was not
                previously known to any enforcement authority.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Attachment Sequence */}
      <div className="bg-surface border border-border rounded-sm mb-6">
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Recommended Attachment Sequence</div>
          <div className="text-gray text-xs mt-0.5">Ordered by liquidity · Total {fmtCrore(TOTAL_TRACEABLE)} attachable</div>
        </div>
        <div className="divide-y divide-border/60">
          {ATTACHMENT_SEQUENCE.map((s, i) => (
            <div key={s.n} className="flex items-start gap-4 px-5 py-4">
              <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono text-[9px] text-gold font-bold">{s.n}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-off-white text-sm">{s.asset}</div>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
                  <span className="font-mono text-gold/70 px-1.5 py-0.5 bg-gold/5 border border-gold/20 rounded-sm">{s.type}</span>
                  <span className="text-gray">{s.timeline}</span>
                </div>
                <div className="text-gray text-[10px] mt-1.5 leading-relaxed">{s.notes}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-mono text-sm font-bold text-off-white">{fmtCrore(s.value)}</div>
                <div className="font-mono text-[9px] text-gray mt-0.5">cum. {fmtCrore(runningTotal[i])}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => alert('Export PDF — available in production deployment.')}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gold/15 border border-gold/40 text-gold text-sm font-mono py-3.5 rounded-sm hover:bg-gold/25 transition-colors duration-150"
        >
          <FileText className="w-4 h-4" />
          Export Packet (PDF)
        </button>
        {recoveryStage === 5 ? (
          <button
            onClick={advanceToStage6}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-surface border border-border text-off-white text-sm font-mono py-3.5 rounded-sm hover:border-gold/40 hover:text-gold transition-colors duration-150"
          >
            <Shield className="w-4 h-4" />
            Issue Attachment Notice
          </button>
        ) : (
          <div className="flex-1 inline-flex items-center justify-center gap-2 bg-green/10 border border-green/30 text-green text-sm font-mono py-3.5 rounded-sm">
            <CheckCircle2 className="w-4 h-4" />
            Attachment Notice Queued
          </div>
        )}
        <Link
          href="/govern/rrc"
          className="sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3.5 bg-surface border border-border text-gray text-sm font-mono rounded-sm hover:text-off-white transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to RRC Tracker
        </Link>
      </div>

      <div className="mt-6 text-gray text-[10px] font-mono leading-relaxed border-t border-border pt-4">
        Generated by Vantis Intelligence Platform · Cross-database trace: Kaveri 2.0, Bhoomi, BBMP Property Tax,
        RERA Escrow Registry, RBI CERSAI · Asset values are Vantis estimates; court-assessed valuations may differ ·
        Related-party findings subject to confirmation under Benami Transactions (Prohibition) Act 2016
      </div>
    </div>
  )
}
