'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, Shield, FileText, ChevronRight, X, CheckCircle2, ExternalLink } from 'lucide-react'

type RRCStatus = 'ISSUED' | 'ACKNOWLEDGED' | 'IN_RECOVERY' | 'RECOVERED'

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
}

const DEFAULTERS: Defaulter[] = [
  {
    id: 'ozone',
    developer: 'Ozone Group',
    city: 'Bengaluru',
    project: 'Ozone Urbana',
    project_id: 'ozone-urbana',
    rrc_ref: 'RRC/K-RERA/2026/OZ-001',
    amount_crore: 423,
    recovered_crore: 0,
    issued_date: '2026-04-11',
    status: 'ISSUED',
    alert: 'Unacknowledged — 32 days',
    homebuyers: 1847,
    is_hero: true,
  },
  {
    id: 'mantri',
    developer: 'Mantri Developers',
    city: 'Bengaluru',
    project: 'Mantri Celestia',
    project_id: '',
    rrc_ref: 'RRC/K-RERA/2026/MAN-001',
    amount_crore: 124,
    recovered_crore: 0,
    issued_date: '2026-02-14',
    status: 'ISSUED',
    alert: 'Unacknowledged — 98 days',
    homebuyers: 634,
    is_hero: false,
  },
  {
    id: 'vaishnavi',
    developer: 'Vaishnavi Builders',
    city: 'Bengaluru',
    project: 'Vaishnavi Serene',
    project_id: '',
    rrc_ref: 'RRC/K-RERA/2025/VAI-003',
    amount_crore: 68,
    recovered_crore: 38,
    issued_date: '2025-06-20',
    status: 'IN_RECOVERY',
    homebuyers: 312,
    is_hero: false,
  },
  {
    id: 'sr',
    developer: 'SR Constructions',
    city: 'Mysuru',
    project: 'SR Sandalwood',
    project_id: '',
    rrc_ref: 'RRC/K-RERA/2026/SRC-001',
    amount_crore: 52,
    recovered_crore: 8,
    issued_date: '2026-01-08',
    status: 'ACKNOWLEDGED',
    homebuyers: 218,
    is_hero: false,
  },
  {
    id: 'skylark',
    developer: 'Skylark Constructions',
    city: 'Bengaluru',
    project: 'Skylark Arcadia',
    project_id: 'skylark-arcadia',
    rrc_ref: 'RRC/K-RERA/2025/SKY-002',
    amount_crore: 42,
    recovered_crore: 28,
    issued_date: '2025-09-03',
    status: 'IN_RECOVERY',
    homebuyers: 98,
    is_hero: false,
  },
  {
    id: 'satyam',
    developer: 'Satyam Infrastructure',
    city: 'Belagavi',
    project: 'Satyam Enclave',
    project_id: '',
    rrc_ref: 'RRC/K-RERA/2024/SAT-001',
    amount_crore: 31,
    recovered_crore: 17,
    issued_date: '2024-08-15',
    status: 'IN_RECOVERY',
    homebuyers: 147,
    is_hero: false,
  },
  {
    id: 'unishire',
    developer: 'Unishire Developers',
    city: 'Bengaluru',
    project: 'Unishire Uptown',
    project_id: '',
    rrc_ref: 'RRC/K-RERA/2026/UNI-001',
    amount_crore: 18,
    recovered_crore: 0,
    issued_date: '2026-03-22',
    status: 'ACKNOWLEDGED',
    homebuyers: 89,
    is_hero: false,
  },
]

const TOTAL_ORDERED   = DEFAULTERS.reduce((s, d) => s + d.amount_crore, 0)    // 758
const TOTAL_RECOVERED = DEFAULTERS.reduce((s, d) => s + d.recovered_crore, 0) // 91
const RECOVERY_PCT    = Math.round((TOTAL_RECOVERED / TOTAL_ORDERED) * 100)   // 12

const STATUS_CFG: Record<RRCStatus, { label: string; text: string; dot: string; bar: string }> = {
  ISSUED:       { label: 'Issued',       text: 'text-gray-light', dot: 'bg-gray',  bar: 'bg-gray'  },
  ACKNOWLEDGED: { label: 'Acknowledged', text: 'text-blue',       dot: 'bg-blue',  bar: 'bg-blue'  },
  IN_RECOVERY:  { label: 'In Recovery',  text: 'text-amber',      dot: 'bg-amber', bar: 'bg-amber' },
  RECOVERED:    { label: 'Recovered',    text: 'text-green',      dot: 'bg-green', bar: 'bg-green' },
}

function fmtCrore(n: number) { return `₹${n.toLocaleString('en-IN')} Cr` }
function fmtDate(d: string)   { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

/* ---- Generic seizure packet modal for non-hero defaulters ---- */
function GenericPacket({ d, onClose }: { d: Defaulter; onClose: () => void }) {
  const assets = [
    {
      desc:    'Project site land — survey nos. (Bhoomi-verified)',
      type:    'Development Land',
      holder:  `${d.developer} Pvt. Ltd.`,
      value:   Math.round(d.amount_crore * 0.35 * 10) / 10,
      source:  'Kaveri 2.0 + Bhoomi',
      related: false,
    },
    {
      desc:    'Escrow + operational bank accounts × 2',
      type:    'Liquid / Bank',
      holder:  `${d.developer} Pvt. Ltd.`,
      value:   Math.round(d.amount_crore * 0.04 * 10) / 10,
      source:  'RERA Escrow Records',
      related: false,
    },
    {
      desc:    'Commercial office — registered premises',
      type:    'Commercial Property',
      holder:  `${d.developer} Pvt. Ltd.`,
      value:   Math.round(d.amount_crore * 0.06 * 10) / 10,
      source:  'BBMP Property Tax',
      related: false,
    },
    {
      desc:    'Residential property — promoter\'s personal residence',
      type:    'Residential',
      holder:  'Promoter (individual)',
      value:   Math.round(d.amount_crore * 0.03 * 10) / 10,
      source:  'BBMP + Kaveri 2.0',
      related: false,
    },
    {
      desc:    'Agricultural land — related-party holding (Bhoomi cross-reference trace)',
      type:    'Agricultural Land',
      holder:  'Related party — family member',
      value:   Math.round(d.amount_crore * 0.28 * 10) / 10,
      source:  'Bhoomi + Kaveri 2.0',
      related: true,
    },
  ]
  const traceable = assets.reduce((s, a) => s + a.value, 0)
  const shortfall = d.amount_crore - d.recovered_crore
  const gap       = shortfall - traceable

  return (
    <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-start justify-center p-4 py-10" onClick={e => e.stopPropagation()}>
        <div className="bg-[#0A0A0F] border border-border rounded-sm w-full max-w-2xl shadow-2xl">

          {/* Modal header */}
          <div className="flex items-start justify-between p-5 border-b border-border">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-gold mb-1">Vantis Seizure Packet · {d.rrc_ref}</div>
              <div className="font-syne text-lg font-bold text-off-white">{d.developer}</div>
              <div className="text-gray text-xs mt-0.5">{d.project} · {d.homebuyers.toLocaleString('en-IN')} homebuyers affected</div>
            </div>
            <button onClick={onClose} className="text-gray hover:text-off-white transition-colors duration-150 mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amounts strip */}
          <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
            {[
              { label: 'Ordered',   value: fmtCrore(d.amount_crore),        color: 'text-red'      },
              { label: 'Recovered', value: fmtCrore(d.recovered_crore),     color: 'text-off-white'},
              { label: 'Shortfall', value: fmtCrore(Math.max(0, shortfall)), color: 'text-amber'   },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4 text-center">
                <div className="font-mono text-[9px] uppercase tracking-widest text-gray mb-1">{label}</div>
                <div className={`font-syne text-lg font-bold ${color}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Assets */}
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

            {/* Recovery gap bar */}
            <div className="mt-4 bg-surface border border-border rounded-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Recovery Coverage</span>
                <span className="font-mono text-xs text-off-white">
                  {fmtCrore(traceable)} of {fmtCrore(shortfall)}
                </span>
              </div>
              <div className="h-2.5 bg-surface2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green rounded-full"
                  style={{ width: `${Math.min(100, (traceable / shortfall) * 100).toFixed(1)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono">
                <span className="text-green">{fmtCrore(traceable)} traceable</span>
                {gap > 0 && <span className="text-red">{fmtCrore(gap)} gap</span>}
              </div>
            </div>

            {/* Actions */}
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
            <p className="text-gray text-xs mt-1">Revenue Recovery Certificates · Karnataka RERA Enforcement</p>
          </div>
          <Shield className="w-6 h-6 text-gray hidden sm:block" />
        </div>

        {/* Dead Paper Problem callout */}
        <div className="bg-surface border border-red/20 rounded-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red" />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-red">The Dead Paper Problem</span>
          </div>
          <div className="text-off-white text-sm leading-relaxed mb-4">
            <strong>₹{TOTAL_ORDERED.toLocaleString('en-IN')} Cr</strong> ordered across {DEFAULTERS.length} K-RERA recovery certificates.{' '}
            Only <strong className="text-green">₹{TOTAL_RECOVERED} Cr ({RECOVERY_PCT}%)</strong> has been recovered.
            Recovery certificates become dead paper without an executable enforcement plan — Vantis traces what can actually be seized.
          </div>

          {/* Recovery bar */}
          <div className="space-y-1.5">
            <div className="flex h-4 rounded-sm overflow-hidden border border-border">
              <div
                className="h-full bg-green flex items-center justify-center"
                style={{ width: `${RECOVERY_PCT}%` }}
              />
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

        {/* Defaulter list */}
        <div className="space-y-3 mb-6">
          {DEFAULTERS.map(d => {
            const cfg    = STATUS_CFG[d.status]
            const recPct = d.amount_crore > 0 ? Math.round((d.recovered_crore / d.amount_crore) * 100) : 0
            return (
              <div
                key={d.id}
                className={`bg-surface border rounded-sm p-5 ${
                  d.is_hero ? 'border-red/40' :
                  d.status === 'IN_RECOVERY' ? 'border-amber/20' :
                  d.status === 'RECOVERED'   ? 'border-green/20' :
                  'border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                  {/* Left: developer + meta */}
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

                  {/* Right: amount + actions */}
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

                {/* Project link */}
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

        {/* Bottom callout */}
        <div className="border-l-2 border-gold pl-4 bg-surface rounded-sm p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold mb-1">Auto-Escalation Policy</div>
              <div className="text-off-white text-sm leading-relaxed">
                RRCs unacknowledged for <strong>30 days</strong> are automatically escalated to the District Collector's
                office for coercive recovery. <strong className="text-red">RRC/K-RERA/2026/OZ-001 is 2 days from auto-escalation</strong>.{' '}
                Generate a Seizure Packet to give the District Collector an executable enforcement order.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Generic packet modal */}
      {openPacket && <GenericPacket d={openPacket} onClose={() => setOpenPacket(null)} />}
    </>
  )
}
