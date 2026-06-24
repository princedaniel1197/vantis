'use client'

import { AlertTriangle, Clock, Scale, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const CASES = [
  {
    id: 'VB/CC/2023/1847',
    project: 'Ozone Urbana',
    court: 'Consumer Forum, Bengaluru',
    type: 'Consumer Complaint',
    parties: '12 homebuyers vs Ozone Constructions Pvt Ltd',
    filed: '14 Jun 2024',
    status: 'ADMITTED',
    isNew: true,
    summary: 'Complainants allege QPR filing misrepresentation — developer claimed 0 litigation in Q3 2023 QPR while this case was being prepared. Damages sought: ₹2.4 Cr + refund.',
    source: 'eCourts API',
  },
  {
    id: 'O.S. 1042/2022',
    project: 'Ozone Urbana',
    court: 'City Civil Court, Bengaluru',
    type: 'Civil — Contractor Dispute',
    parties: 'MRS Constructions vs Ozone Constructions Pvt Ltd',
    filed: 'Mar 2022',
    status: 'PENDING',
    isNew: false,
    summary: 'Sub-contractor alleges non-payment of ₹1.8 Cr for structural work on floors 4–6. Court has issued summons. Next hearing: 22 Aug 2024.',
    source: 'eCourts API',
  },
  {
    id: 'IBA/441/2022',
    project: 'Ozone Urbana',
    court: 'NCLT Bengaluru',
    type: 'Insolvency — IBA Filing',
    parties: 'IndusInd Bank vs Ozone Group Holdings Ltd',
    filed: 'Nov 2022',
    status: 'UNDER CONSIDERATION',
    isNew: false,
    summary: 'IBA filed by IndusInd Bank against parent entity Ozone Group Holdings. NCLT has admitted the petition. Ozone Group filed a reply. Resolution still pending.',
    source: 'NCLT Filing Registry',
  },
]

const statusColor: Record<string, string> = {
  ADMITTED:            '#E74C3C',
  PENDING:             '#F39C12',
  'UNDER CONSIDERATION': '#F39C12',
}

export default function LitigationPage() {
  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Litigation Intelligence</h1>
        <p className="text-gray text-sm mt-0.5">eCourts API + NCLT Registry cross-referenced against developer QPR self-declarations.</p>
      </div>

      {/* Mismatch callout */}
      <div className="bg-surface border border-red/30 rounded-sm p-5 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red shrink-0 mt-0.5" />
          <div>
            <div className="text-[9px] font-mono text-red uppercase tracking-[0.15em] mb-1">QPR MISMATCH — SELF-REPORT vs VANTIS REALITY</div>
            <p className="text-off-white text-sm font-medium leading-snug">
              Ozone Urbana Q3 2023 QPR filed with K-RERA declares <span className="text-red">0 pending litigation</span>.
            </p>
            <p className="text-gray-light text-sm mt-1 leading-relaxed">
              Vantis eCourts cross-check found <strong className="text-off-white">2 active cases</strong> (VB/CC/2023/1847 and O.S. 1042/2022).
              Gap between self-report and reality is the core risk signal.
            </p>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active Cases',     value: '3',     color: '#E74C3C' },
          { label: 'Total Claimed',    value: '₹4.2 Cr', color: '#F39C12' },
          { label: 'QPR Mismatch',     value: '2 cases', color: '#E74C3C' },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-sm px-4 py-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray mb-1">{k.label}</div>
            <div className="font-syne text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Cases */}
      <div className="space-y-4">
        {CASES.map(c => (
          <div key={c.id} className="bg-surface border border-border rounded-sm p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-border text-gray-light">{c.type}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-[0.08em]" style={{ color: statusColor[c.status] ?? '#6B6B88', background: (statusColor[c.status] ?? '#6B6B88') + '20' }}>{c.status}</span>
                  {c.isNew && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-red/80 text-white uppercase">NEW</span>}
                </div>
                <div className="font-mono text-sm text-gold">{c.id}</div>
                <div className="text-xs text-off-white mt-0.5">{c.court}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-gray">Filed</div>
                <div className="text-xs font-mono text-gray-light">{c.filed}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="p-3 bg-surface2 rounded-sm border border-border">
                <div className="text-[9px] font-mono uppercase text-gray mb-1">Parties</div>
                <div className="text-xs text-off-white">{c.parties}</div>
              </div>
              <div className="p-3 bg-surface2 rounded-sm border border-border">
                <div className="text-[9px] font-mono uppercase text-gray mb-1">Project</div>
                <div className="text-xs text-gold">{c.project}</div>
              </div>
            </div>

            <p className="text-xs text-gray-light leading-relaxed mb-3">{c.summary}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray">
                <Scale className="w-3 h-3" />
                Source: {c.source}
              </div>
              <Link
                href="/lend/project/ozone-urbana"
                className="flex items-center gap-1 text-xs font-mono text-gold hover:text-gold-light uppercase tracking-[0.08em] transition-colors"
              >
                View Project <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
