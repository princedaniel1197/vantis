'use client'

import { useState, Fragment } from 'react'
import Link from 'next/link'
import { AlertTriangle, Shield, FileText, ChevronRight, X, CheckCircle2, Check, Clock } from 'lucide-react'

type RRCStatus = 'ISSUED' | 'ACKNOWLEDGED' | 'IN_RECOVERY' | 'RECOVERED'

const RECOVERY_STAGES = [
  { n: 1, short: 'RERA Order',   title: 'RERA Order Passed',              bottleneck: false },
  { n: 2, short: '60-Day Grace', title: '60-Day Grace Period',            bottleneck: false },
  { n: 3, short: 'RRC Issued',   title: 'Recovery Certificate Issued',    bottleneck: false },
  { n: 4, short: 'Fwd to DC',    title: 'Forwarded to Dy. Commissioner', bottleneck: false },
  { n: 5, short: 'Asset ID',     title: 'Asset Identification',           bottleneck: true  },
  { n: 6, short: 'Attch Notice', title: 'Attachment Notice Issued',       bottleneck: false },
  { n: 7, short: 'Attch & Sale', title: 'Attachment & Sale',              bottleneck: false },
  { n: 8, short: 'Executed',     title: 'Recovered / Executed',           bottleneck: false },
]

interface Defaulter {
  id: string
  developer: string
  city: string
  project: string
  project_id: string
  rrc_ref: string
  amount_crore: number
  recovered_crore: number
  issued_date: string
  status: RRCStatus
  alert?: string
  homebuyers: number
  is_hero: boolean
  current_stage: number
}

const DEFAULTERS: Defaulter[] = [
  {
    id: 'ozone', developer: 'Ozone Group', city: 'Bengaluru', project: 'Ozone Urbana',
    project_id: 'ozone-urbana', rrc_ref: 'RRC/K-RERA/2026/OZ-001',
    amount_crore: 423, recovered_crore: 0, issued_date: '2026-04-11',
    status: 'ISSUED', alert: 'Unacknowledged — 32 days', homebuyers: 1847,
    is_hero: true, current_stage: 5,
  },
  {
    id: 'mantri', developer: 'Mantri Developers', city: 'Bengaluru', project: 'Mantri Celestia',
    project_id: '', rrc_ref: 'RRC/K-RERA/2026/MAN-001',
    amount_crore: 124, recovered_crore: 0, issued_date: '2026-02-14',
    status: 'ISSUED', alert: 'Unacknowledged — 98 days', homebuyers: 634,
    is_hero: false, current_stage: 4,
  },
  {
    id: 'vaishnavi', developer: 'Vaishnavi Builders', city: 'Bengaluru', project: 'Vaishnavi Serene',
    project_id: '', rrc_ref: 'RRC/K-RERA/2025/VAI-003',
    amount_crore: 68, recovered_crore: 38, issued_date: '2025-06-20',
    status: 'IN_RECOVERY', homebuyers: 312, is_hero: false, current_stage: 7,
  },
  {
    id: 'sr', developer: 'SR Constructions', city: 'Mysuru', project: 'SR Sandalwood',
    project_id: '', rrc_ref: 'RRC/K-RERA/2026/SRC-001',
    amount_crore: 52, recovered_crore: 8, issued_date: '2026-01-08',
    status: 'ACKNOWLEDGED', homebuyers: 218, is_hero: false, current_stage: 5,
  },
  {
    id: 'skylark', developer: 'Skylark Constructions', city: 'Bengaluru', project: 'Skylark Arcadia',
    project_id: 'skylark-arcadia', rrc_ref: 'RRC/K-RERA/2025/SKY-002',
    amount_crore: 42, recovered_crore: 28, issued_date: '2025-09-03',
    status: 'IN_RECOVERY', homebuyers: 98, is_hero: false, current_stage: 7,
  },
  {
    id: 'satyam', developer: 'Satyam Infrastructure', city: 'Belagavi', project: 'Satyam Enclave',
    project_id: '', rrc_ref: 'RRC/K-RERA/2024/SAT-001',
    amount_crore: 31, recovered_crore: 17, issued_date: '2024-08-15',
    status: 'IN_RECOVERY', homebuyers: 147, is_hero: false, current_stage: 7,
  },
  {
    id: 'unishire', developer: 'Unishire Developers', city: 'Bengaluru', project: 'Unishire Uptown',
    project_id: '', rrc_ref: 'RRC/K-RERA/2026/UNI-001',
    amount_crore: 18, recovered_crore: 0, issued_date: '2026-03-22',
    status: 'ACKNOWLEDGED', homebuyers: 89, is_hero: false, current_stage: 4,
  },
]

const TOTAL_ORDERED   = DEFAULTERS.reduce((s, d) => s + d.amount_crore, 0)
const TOTAL_RECOVERED = DEFAULTERS.reduce((s, d) => s + d.recovered_crore, 0)
const RECOVERY_PCT    = Math.round((TOTAL_RECOVERED / TOTAL_ORDERED) * 100)

// HC 8-week enforcement directive — deadline from RRC issued date
const TODAY_DATE      = new Date('2026-06-26')
const HC_WINDOW_DAYS  = 56

function getDeadlineInfo(issuedDate: string) {
  const issued     = new Date(issuedDate)
  const deadlineMs = issued.getTime() + HC_WINDOW_DAYS * 86_400_000
  const daysOverdue = Math.floor((TODAY_DATE.getTime() - deadlineMs) / 86_400_000)
  return {
    deadlineStr: new Date(deadlineMs).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    daysOverdue,
  }
}

const STATUS_CFG: Record<RRCStatus, { label: string; text: string; dot: string; bar: string }> = {
  ISSUED:       { label: 'Issued',       text: 'text-gray-light', dot: 'bg-gray',  bar: 'bg-gray'  },
  ACKNOWLEDGED: { label: 'Acknowledged', text: 'text-blue',       dot: 'bg-blue',  bar: 'bg-blue'  },
  IN_RECOVERY:  { label: 'In Recovery',  text: 'text-amber',      dot: 'bg-amber', bar: 'bg-amber' },
  RECOVERED:    { label: 'Recovered',    text: 'text-green',      dot: 'bg-green', bar: 'bg-green' },
}

function fmtCrore(n: number) { return `₹${n.toLocaleString('en-IN')} Cr` }
function fmtDate(d: string)   {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function MiniStepper({ currentStage }: { currentStage: number }) {
  return (
    <div className="flex items-center w-full">
      {RECOVERY_STAGES.map((s, i) => (
        <Fragment key={s.n}>
          {i > 0 && (
            <div className={`flex-1 h-px ${s.n <= currentStage ? 'bg-gold/60' : 'bg-border/80'}`} />
          )}
          <div
            title={s.title}
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${
              s.n < currentStage
                ? 'bg-gold border-gold'
                : s.n === currentStage && s.bottleneck
                ? 'border-red bg-red/10 animate-pulse'
                : s.n === currentStage
                ? 'border-gold bg-gold/10 animate-pulse'
                : 'border-border/60 bg-surface2'
            }`}
          >
            {s.n < currentStage && <Check className="w-2 h-2 text-[#0A0A0F]" />}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

/* ── Generic seizure packet modal ── */
function GenericPacket({ d, onClose }: { d: Defaulter; onClose: () => void }) {
  const assets = [
    { desc: 'Project site land — survey nos. (Bhoomi-verified)',              type: 'Development Land',   holder: `${d.developer} Pvt. Ltd.`,   value: Math.round(d.amount_crore * 0.35 * 10) / 10, source: 'Kaveri 2.0 + Bhoomi',  related: false },
    { desc: 'Escrow + operational bank accounts × 2',                         type: 'Liquid / Bank',      holder: `${d.developer} Pvt. Ltd.`,   value: Math.round(d.amount_crore * 0.04 * 10) / 10, source: 'RERA Escrow Records', related: false },
    { desc: 'Commercial office — registered premises',                         type: 'Commercial Property', holder: `${d.developer} Pvt. Ltd.`,  value: Math.round(d.amount_crore * 0.06 * 10) / 10, source: 'BBMP Property Tax',   related: false },
    { desc: "Residential property — promoter's personal residence",            type: 'Residential',         holder: 'Promoter (individual)',       value: Math.round(d.amount_crore * 0.03 * 10) / 10, source: 'BBMP + Kaveri 2.0',  related: false },
    { desc: 'Agricultural land — related-party holding (Bhoomi cross-reference)', type: 'Agricultural Land', holder: 'Related party — family member', value: Math.round(d.amount_crore * 0.28 * 10) / 10, source: 'Bhoomi + Kaveri 2.0', related: true },
  ]
  const traceable = assets.reduce((s, a) => s + a.value, 0)
  const shortfall = d.amount_crore - d.recovered_crore
  const gap       = shortfall - traceable

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-start justify-center p-4 py-10" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0A0A0F] border border-border rounded-sm w-full max-w-2xl shadow-2xl">

          <div className="flex items-start justify-between p-5 border-b border-border">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold mb-1">
                Vantis Seizure Packet · {d.rrc_ref}
              </div>
              <div className="font-syne text-lg font-bold text-off-white">{d.developer}</div>
              <div className="text-gray text-xs mt-0.5">
                {d.project} · {d.homebuyers.toLocaleString('en-IN')} homebuyers affected
              </div>
            </div>
            <button onClick={onClose} className="text-gray hover:text-off-white transition-colors duration-150 mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Process stage */}
          <div className="px-5 py-3 border-b border-border bg-surface/50">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-2">
              RERA s. 40 Recovery Process
            </div>
            <MiniStepper currentStage={d.current_stage} />
            <div className="flex items-center justify-between mt-2 text-[9px] font-mono">
              <span className={d.current_stage === 5 ? 'text-red' : 'text-gold'}>
                Stage {d.current_stage}/8 — {RECOVERY_STAGES.find(s => s.n === d.current_stage)?.title}
                {d.current_stage === 5 ? ' · Stalled' : ''}
              </span>
              {(() => {
                const { deadlineStr, daysOverdue } = getDeadlineInfo(d.issued_date)
                return daysOverdue > 0 && d.current_stage <= 5
                  ? <span className="text-red flex items-center gap-1"><Clock className="w-3 h-3" /> HC deadline {deadlineStr} · {daysOverdue}d overdue</span>
                  : null
              })()}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[
              { label: 'Ordered',   value: fmtCrore(d.amount_crore),        color: 'text-red'       },
              { label: 'Recovered', value: fmtCrore(d.recovered_crore),     color: 'text-off-white' },
              { label: 'Shortfall', value: fmtCrore(Math.max(0, shortfall)), color: 'text-amber'    },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 text-center">
                <div className="font-mono text-[9px] uppercase tracking-widest text-gray mb-1">{label}</div>
                <div className={`font-syne text-lg font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="p-5">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">
              Traced Assets · Vantis Cross-Database Scan
            </div>
            <div className="space-y-2">
              {assets.map((a, i) => (
                <div key={i} className={`border rounded-sm p-3 ${a.related ? 'border-gold/40 bg-gold/5' : 'border-border bg-surface'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {a.related && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gold/20 border border-gold/40 rounded-sm mb-1.5">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-gold">⚑ Related-Party Trace</span>
                        </div>
                      )}
                      <div className="text-off-white text-xs leading-relaxed">{a.desc}</div>
                      <div className="text-gray text-[10px] mt-0.5">
                        <span className="text-gray-light">{a.holder}</span> · {a.source}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={`font-mono text-sm font-bold ${a.related ? 'text-gold' : 'text-off-white'}`}>
                        {fmtCrore(a.value)}
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-green" />
                        <span className="text-green text-[9px] font-mono">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-surface border border-border rounded-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Recovery Coverage</span>
                <span className="font-mono text-xs text-off-white">{fmtCrore(traceable)} of {fmtCrore(shortfall)}</span>
              </div>
              <div className="h-2.5 bg-surface2 rounded-full overflow-hidden">
                <div className="h-full bg-green rounded-full" style={{ width: `${Math.min(100, (traceable / shortfall) * 100).toFixed(1)}%` }} />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono">
                <span className="text-green">{fmtCrore(traceable)} traceable</span>
                {gap > 0 && <span className="text-red">{fmtCrore(gap)} gap</span>}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => alert('Export PDF available in production deployment.')}
                className="flex-1 bg-gold/15 border border-gold/40 text-gold text-xs font-mono py-2.5 rounded-sm hover:bg-gold/25 transition-colors duration-150"
              >
                Export Packet (PDF)
              </button>
              <button
                onClick={() => alert('Attachment notice workflow available in production deployment.')}
                className="flex-1 bg-surface border border-border text-off-white text-xs font-mono py-2.5 rounded-sm hover:border-gold/40 hover:text-gold transition-colors duration-150"
              >
                Issue Attachment Notice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   MAIN PAGE
   ================================================================ */
export default function RRCTracker() {
  const [openPacket, setOpenPacket] = useState<Defaulter | null>(null)

  return (
    <>
      <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-gray mb-1">GOVERN · ENFORCEMENT</div>
            <h1 className="font-syne text-2xl sm:text-3xl text-off-white font-bold">Recovery Certificate Tracker</h1>
            <p className="text-gray text-xs mt-1">Revenue Recovery Certificates · Karnataka RERA Enforcement · Sec 40</p>
          </div>
          <Shield className="w-6 h-6 text-gray hidden sm:block" />
        </div>

        {/* Dead Paper callout */}
        <div className="bg-surface border border-red/20 rounded-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-red">The Dead Paper Problem</span>
          </div>
          <div className="text-off-white text-sm leading-relaxed mb-4">
            <strong>₹{TOTAL_ORDERED.toLocaleString('en-IN')} Cr</strong> ordered across {DEFAULTERS.length} K-RERA
            recovery certificates. Only <strong className="text-green">₹{TOTAL_RECOVERED} Cr ({RECOVERY_PCT}%)</strong> recovered.
            Without an executable enforcement plan, recovery certificates are dead paper — the legal right to collect
            exists, but nobody knows what to seize.
          </div>
          <div className="space-y-1.5">
            <div className="flex h-4 rounded-sm overflow-hidden border border-border">
              <div className="h-full bg-green" style={{ width: `${RECOVERY_PCT}%` }} />
              <div className="flex-1 h-full bg-red/20" />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-green">₹{TOTAL_RECOVERED} Cr recovered ({RECOVERY_PCT}%)</span>
              <span className="text-red">₹{TOTAL_ORDERED - TOTAL_RECOVERED} Cr dead paper ({100 - RECOVERY_PCT}%)</span>
            </div>
          </div>
        </div>

        {/* Macro stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-sm p-4 text-center">
            <div className="font-syne text-2xl sm:text-3xl font-bold text-off-white">{DEFAULTERS.length}</div>
            <div className="text-gray text-xs mt-1 font-mono uppercase tracking-wide">Active RRCs</div>
          </div>
          <div className="bg-surface border border-red/20 rounded-sm p-4 text-center">
            <div className="font-syne text-2xl sm:text-3xl font-bold text-red">{fmtCrore(TOTAL_ORDERED)}</div>
            <div className="text-gray text-xs mt-1 font-mono uppercase tracking-wide">Total Ordered</div>
          </div>
          <div className="bg-surface border border-green/20 rounded-sm p-4 text-center">
            <div className="font-syne text-2xl sm:text-3xl font-bold text-green">{fmtCrore(TOTAL_RECOVERED)}</div>
            <div className="text-gray text-xs mt-1 font-mono uppercase tracking-wide">Recovered</div>
          </div>
        </div>

        {/* Statewide Bottleneck — Stage 5 distribution */}
        <div className="bg-surface border border-border rounded-sm mb-6">
          <div className="px-5 pt-4 pb-3 border-b border-border">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">
              Statewide K-RERA Enforcement — Where Cases Stall
            </div>
            <div className="text-gray text-xs mt-0.5">683 recovery certificates issued since 2017 · RERA Sec 40</div>
          </div>

          <div className="p-5">
            {/* Stacked distribution bar */}
            <div className="mb-1">
              <div className="flex h-7 rounded-sm overflow-hidden gap-px">
                <div className="w-[9%]  bg-gray/30    flex items-center justify-center" title="Stage 3 — RRC Issued" />
                <div className="w-[18%] bg-blue/25    flex items-center justify-center" title="Stage 4 — Forwarded to DC" />
                <div className="w-[60%] bg-red/30 border-y border-x border-red/30 flex items-center justify-center relative" title="Stage 5 — Asset Identification">
                  <span className="font-mono text-[9px] text-red font-bold">Stage 5 — Asset ID — 412 cases (60%)</span>
                </div>
                <div className="w-[1%]  bg-amber/30" title="Stage 6-7 — Attachment" />
                <div className="w-[12%] bg-green/25   flex items-center justify-center" title="Stage 8 — Executed" />
              </div>
            </div>
            <div className="flex justify-between text-[8px] font-mono text-gray mb-4">
              <span>Stage 3 (64)</span>
              <span>Stage 4 (121)</span>
              <span className="text-red font-bold">← BOTTLENECK →</span>
              <span>Attch (4)</span>
              <span>Executed (82)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { val: '683', label: 'Total RRCs',         color: 'text-off-white' },
                { val: '412', label: 'Stuck at Stage 5',   color: 'text-red'       },
                { val: '4',   label: 'Attachment Notices', color: 'text-amber'     },
                { val: '82',  label: 'Ever Executed',      color: 'text-green'     },
              ].map(({ val, label, color }) => (
                <div key={label} className="text-center">
                  <div className={`font-syne text-2xl font-bold ${color}`}>{val}</div>
                  <div className="text-gray text-[9px] font-mono uppercase tracking-wide mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="border-l-2 border-red/50 pl-3">
              <div className="text-off-white text-xs leading-relaxed">
                <strong className="text-red">Stage 5 — Asset Identification — is where 88% of recovery fails.</strong>{' '}
                The Deputy Commissioner has full legal authority but cannot identify seizable assets without a
                cross-database intelligence trace. Cases sit here for years — the Karnataka HC called it
                a process that "takes at least five years." Vantis generates the Seizure Packet that gives
                the DC an executable list of what to attach and sell.
              </div>
            </div>
          </div>
        </div>

        {/* Defaulter list */}
        <div className="space-y-3 mb-6">
          {DEFAULTERS.map(d => {
            const cfg             = STATUS_CFG[d.status]
            const recPct          = d.amount_crore > 0 ? Math.round((d.recovered_crore / d.amount_crore) * 100) : 0
            const stageName       = RECOVERY_STAGES.find(s => s.n === d.current_stage)
            const isStalled       = d.current_stage <= 5
            const { deadlineStr, daysOverdue } = getDeadlineInfo(d.issued_date)

            return (
              <div
                key={d.id}
                className={`bg-surface border rounded-sm p-5 ${
                  d.is_hero       ? 'border-red/40'   :
                  d.status === 'IN_RECOVERY' ? 'border-amber/20' :
                  d.status === 'RECOVERED'   ? 'border-green/20' :
                  'border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                  {/* Left: developer meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-mono text-[9px] text-gold tracking-[0.1em]">{d.rrc_ref}</span>
                      <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {d.alert && (
                        <span className="flex items-center gap-1 text-[9px] text-red font-mono">
                          <AlertTriangle className="w-3 h-3" />
                          {d.alert}
                        </span>
                      )}
                    </div>
                    <div className="text-off-white text-sm font-medium">{d.developer}</div>
                    <div className="text-gray text-xs">{d.project} · {d.city}</div>
                    <div className="text-gray text-xs mt-0.5">
                      {d.homebuyers.toLocaleString('en-IN')} homebuyers · issued {fmtDate(d.issued_date)}
                    </div>
                  </div>

                  {/* Right: amount + CTA */}
                  <div className="flex sm:flex-col items-start sm:items-end gap-4 sm:gap-2 shrink-0">
                    <div className="sm:text-right">
                      <div className={`font-syne text-xl sm:text-2xl font-bold ${recPct === 100 ? 'text-green' : 'text-red'}`}>
                        {fmtCrore(d.amount_crore)}
                      </div>
                      {d.recovered_crore > 0 && (
                        <div className="text-green text-[10px] font-mono">
                          {fmtCrore(d.recovered_crore)} recovered ({recPct}%)
                        </div>
                      )}
                    </div>
                    {d.is_hero ? (
                      <Link
                        href="/govern/rrc/seizure"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-gold/15 border border-gold/40 text-gold text-xs font-mono rounded-sm hover:bg-gold/25 transition-colors duration-150 whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Generate Seizure Packet
                      </Link>
                    ) : (
                      <button
                        onClick={() => setOpenPacket(d)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-surface border border-border text-gray-light text-xs font-mono rounded-sm hover:border-gold/40 hover:text-gold transition-colors duration-150 whitespace-nowrap"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Generate Seizure Packet
                      </button>
                    )}
                  </div>
                </div>

                {/* Recovery progress bar */}
                {recPct > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Recovery Progress</span>
                      <span className={`font-mono text-[10px] font-bold ${recPct === 100 ? 'text-green' : 'text-amber'}`}>{recPct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${recPct}%` }} />
                    </div>
                  </div>
                )}

                {/* Mini process stepper */}
                <div className="mt-4 pt-3 border-t border-border/60">
                  <div className="mb-2.5">
                    <MiniStepper currentStage={d.current_stage} />
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`font-mono text-[9px] ${
                      d.current_stage === 5 ? 'text-red font-bold' :
                      d.current_stage >= 7  ? 'text-amber'        : 'text-gray-light'
                    }`}>
                      Stage {d.current_stage}/8 — {stageName?.title}
                      {d.current_stage === 5 && ' · Stalled'}
                    </span>
                    {isStalled && daysOverdue > 0 && (
                      <span className="flex items-center gap-1 font-mono text-[9px] text-red">
                        <Clock className="w-3 h-3" />
                        HC deadline {deadlineStr} · {daysOverdue}d overdue
                      </span>
                    )}
                    {!isStalled && daysOverdue > 0 && (
                      <span className="font-mono text-[9px] text-gray">
                        HC deadline {deadlineStr} · recovery in progress
                      </span>
                    )}
                  </div>
                </div>

                {d.project_id && (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <Link
                      href={`/govern/projects/${d.project_id}`}
                      className="text-[10px] text-gray hover:text-gold transition-colors duration-150 inline-flex items-center gap-1"
                    >
                      View project profile <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Auto-escalation callout */}
        <div className="border-l-2 border-gold pl-4 bg-surface rounded-sm p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold mb-1">Auto-Escalation Policy</div>
              <div className="text-off-white text-sm leading-relaxed">
                RRCs unacknowledged for <strong>30 days</strong> are automatically escalated to the District Collector's
                office for coercive recovery. <strong className="text-red">RRC/K-RERA/2026/OZ-001 is 2 days from
                auto-escalation.</strong>{' '}Generate a Seizure Packet to give the DC the Stage 5 intelligence needed
                to issue the attachment notice (Stage 6).
              </div>
            </div>
          </div>
        </div>

      </div>

      {openPacket && <GenericPacket d={openPacket} onClose={() => setOpenPacket(null)} />}
    </>
  )
}
