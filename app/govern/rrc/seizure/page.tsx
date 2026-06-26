'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, ChevronLeft, FileText, Shield, Eye } from 'lucide-react'

interface Asset {
  n: number
  desc: string
  type: string
  holder: string
  value_crore: number
  source: string
  related: boolean
  related_label?: string
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
    note: 'Mortgaged in part to escrow bank. 12.8 acres unencumbered and available for attachment.',
  },
  {
    n: 2,
    desc: 'Escrow account (KA/RERA/ESC/1251/2016) + operational bank accounts × 2 — Karnataka Bank, HDFC Bank',
    type: 'Liquid / Bank Accounts',
    holder: 'Ozone Urbana Promoters Pvt. Ltd.',
    value_crore: 12.4,
    source: 'RERA Escrow Records + RBI',
    related: false,
    note: 'Escrow balance ₹3.88 Cr. Operational accounts total ₹8.52 Cr. All three accounts traceable via RBI CERSAI.',
  },
  {
    n: 3,
    desc: 'Commercial office premises — 8,400 sqft, EPIP Zone, Whitefield, Bengaluru — BBMP Ref KA/WH/BBMP/2019/4421',
    type: 'Commercial Property',
    holder: 'Ozone Group Holdings Pvt. Ltd.',
    value_crore: 14.2,
    source: 'BBMP Property Tax Records + Kaveri 2.0',
    related: false,
    note: 'Held in group holding entity, not project SPV. Attachment will require corporate veil proceedings (IBC S. 66).',
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
    desc: "Agricultural land — 179 acres, Survey No. 48/1 to 48/9, Kannehalli Village, Tumkur Taluk, Tumkur District",
    type: 'Agricultural Land',
    holder: "Promoter's spouse (individual name withheld pending notice)",
    value_crore: 202.6,
    source: 'Bhoomi + Kaveri 2.0 (cross-reference)',
    related: true,
    related_label: 'Related-Party Discovery · Kannehalli',
    note: "Registered February 2019. Purchase funded during Ozone Urbana's peak collection phase (FY 2018–19). Acquisition pattern consistent with related-party asset concealment. Not previously surfaced in any recovery proceedings. Identified via Vantis related-party cross-reference on Bhoomi name-match across promoter's known associates.",
  },
]

const TOTAL_TRACEABLE  = ASSETS.reduce((s, a) => s + a.value_crore, 0)
const AMOUNT_ORDERED   = 423
const AMOUNT_RECOVERED = 0
const SHORTFALL        = AMOUNT_ORDERED - AMOUNT_RECOVERED
const GAP              = SHORTFALL - TOTAL_TRACEABLE
const COVERAGE_PCT     = Math.round((TOTAL_TRACEABLE / SHORTFALL) * 100)

function fmtCrore(n: number) {
  const formatted = Number(n.toFixed(1)).toLocaleString('en-IN')
  return `₹${formatted} Cr`
}

const ATTACHMENT_SEQUENCE = [
  { n: 1, asset: 'Escrow + bank accounts — Karnataka Bank, HDFC', value: 12.4,  type: 'Liquid',      timeline: 'Immediate (7–14 days)',  notes: 'Highest liquidity. Freeze order to banks. No title proceedings needed.' },
  { n: 2, asset: 'Residential villa — Sadashivanagar, Bengaluru',  value: 6.8,   type: 'Residential', timeline: '30–45 days',            notes: 'Clear title, no mortgage. District Collector order sufficient.' },
  { n: 3, asset: 'Commercial office — Whitefield, EPIP Zone',      value: 14.2,  type: 'Commercial',  timeline: '45–90 days',            notes: 'Group entity veil. Requires NCLT/IBC s. 66 proceeding alongside RERA order.' },
  { n: 4, asset: 'Project land — Devanahalli Hobli, 18.4 acres',   value: 82.0,  type: 'Land',        timeline: '60–120 days',           notes: 'Partial encumbrance. 12.8 acres immediately attachable. Court auction recommended.' },
  { n: 5, asset: 'Kannehalli agricultural land — 179 acres',       value: 202.6, type: 'Land',        timeline: '90–180 days',           notes: 'Related-party proceedings required. Notice to spouse as beneficial owner under Benami Transactions Act. RERA s. 12 + PMLA available.' },
]

export default function OzoneSeizurePacket() {
  const runningTotal = ATTACHMENT_SEQUENCE.reduce<number[]>((acc, s, i) => {
    const prev = i === 0 ? 0 : acc[i - 1]
    return [...acc, prev + s.value]
  }, [])

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/govern/rrc"
          className="inline-flex items-center gap-1 text-gray text-xs hover:text-gold transition-colors duration-150 font-mono"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Recovery Certificate Tracker
        </Link>
        <span className="text-border text-xs">·</span>
        <span className="text-gray-light text-xs font-mono">Seizure Packet</span>
      </div>

      {/* Restricted banner */}
      <div className="flex items-center gap-2.5 bg-red/10 border border-red/25 rounded-sm px-4 py-2.5 mb-6">
        <Shield className="w-4 h-4 text-red shrink-0" />
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-red">
          Restricted — Active Enforcement Order · K-RERA Authority Use Only
        </span>
      </div>

      {/* Document header */}
      <div className="bg-surface border border-border rounded-sm mb-6 overflow-hidden">
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

        {/* Amount strip */}
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
            ['Sent to',           "District Collector, Bengaluru Urban — unacknowledged as of 13 May 2026"],
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
                    <div className="flex items-center gap-2 mb-2.5">
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
                    <span className={`${a.related ? 'text-amber' : 'text-gray-light'}`}>
                      {a.holder}
                    </span>
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

        {/* Assets total */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-border bg-surface/50">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Total Traceable Assets</div>
          <div className="font-syne text-xl font-bold text-off-white">{fmtCrore(TOTAL_TRACEABLE)}</div>
        </div>
      </div>

      {/* Recovery Gap Analysis */}
      <div className="bg-surface border border-border rounded-sm mb-5 p-5">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-4">Recovery Gap Analysis</div>

        <div className="space-y-4">

          {/* Amount ordered bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-gray">Amount Ordered (total liability)</span>
              <span className="font-mono text-sm font-bold text-red">{fmtCrore(AMOUNT_ORDERED)}</span>
            </div>
            <div className="h-4 bg-red/20 border border-red/20 rounded-sm w-full" />
          </div>

          {/* Traceable bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] text-gray">Assets Traced by Vantis</span>
              <span className="font-mono text-sm font-bold text-green">{fmtCrore(TOTAL_TRACEABLE)}</span>
            </div>
            <div className="h-4 bg-surface2 border border-border rounded-sm w-full overflow-hidden">
              <div
                className="h-full bg-green flex items-center justify-end pr-2"
                style={{ width: `${COVERAGE_PCT}%` }}
              >
                <span className="font-mono text-[8px] text-[#0A0A0F] font-bold">{COVERAGE_PCT}%</span>
              </div>
            </div>
          </div>

          {/* Gap callout */}
          <div className="flex items-start gap-3 bg-red/5 border border-red/20 rounded-sm p-4 mt-2">
            <AlertTriangle className="w-4 h-4 text-red shrink-0 mt-0.5" />
            <div>
              <div className="text-off-white text-sm mb-1">
                <strong>{fmtCrore(TOTAL_TRACEABLE)}</strong> traceable assets cover{' '}
                <strong>{COVERAGE_PCT}%</strong> of the ₹{AMOUNT_ORDERED} Cr ordered amount.{' '}
                A <strong className="text-red">{fmtCrore(GAP)} gap</strong> remains that may require
                additional investigation or pro-rata distribution to affected homebuyers.
              </div>
              <div className="text-gray text-xs">
                Note: ₹{(TOTAL_TRACEABLE - (TOTAL_TRACEABLE - ASSETS[ASSETS.length - 1].value_crore)).toFixed(1)} Cr
                ({Math.round((ASSETS[ASSETS.length - 1].value_crore / TOTAL_TRACEABLE) * 100)}% of traced assets)
                were found only through Vantis related-party analysis — this land was not previously known to enforcement.
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
                <div className="font-mono text-[9px] text-gray mt-0.5">
                  cum. {fmtCrore(runningTotal[i])}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => alert('Export PDF — available in production deployment. Packet will generate a court-ready PDF attachment order.')}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-gold/15 border border-gold/40 text-gold text-sm font-mono py-3.5 rounded-sm hover:bg-gold/25 transition-colors duration-150"
        >
          <FileText className="w-4 h-4" />
          Export Packet (PDF)
        </button>
        <button
          onClick={() => alert('Issue attachment notice — available in production deployment. This will generate the District Collector notice with all asset details and enforcement instructions.')}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-surface border border-border text-off-white text-sm font-mono py-3.5 rounded-sm hover:border-gold/40 hover:text-gold transition-colors duration-150"
        >
          <Shield className="w-4 h-4" />
          Issue Attachment Notice
        </button>
        <Link
          href="/govern/rrc"
          className="sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3.5 bg-surface border border-border text-gray text-sm font-mono rounded-sm hover:text-off-white hover:border-border transition-colors duration-150"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to RRC Tracker
        </Link>
      </div>

      {/* Footer note */}
      <div className="mt-6 text-gray text-[10px] font-mono leading-relaxed border-t border-border pt-4">
        Generated by Vantis Intelligence Platform · Cross-database trace: Kaveri 2.0, Bhoomi, BBMP Property Tax, RERA Escrow Registry, RBI CERSAI ·
        Asset values are Vantis estimates based on current market rates and may differ from court-assessed valuations ·
        Related-party findings are subject to confirmation under Benami Transactions (Prohibition) Act 2016
      </div>
    </div>
  )
}
