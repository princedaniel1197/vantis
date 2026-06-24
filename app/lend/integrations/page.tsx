'use client'

import { CheckCircle2, Clock, Zap } from 'lucide-react'

const INTEGRATIONS = [
  {
    id: 'krera',
    name: 'K-RERA Registry',
    type: 'Regulatory',
    status: 'LIVE',
    latency: '4h refresh',
    records: '8,341 projects',
    desc: 'Full QPR history, developer self-declarations, escrow balance statements, DCCO records.',
  },
  {
    id: 'kaveri',
    name: 'Kaveri 2.0 — Kar. Registration',
    type: 'Land Records',
    status: 'LIVE',
    latency: '24h refresh',
    records: '2.1M Sy. No. records',
    desc: 'Sale deed registrations, encumbrance certificates, encumbrance history. Primary collateral verification source.',
  },
  {
    id: 'ecourts',
    name: 'eCourts Karnataka',
    type: 'Litigation',
    status: 'LIVE',
    latency: '6h refresh',
    records: '14,200+ developer cases',
    desc: 'Case status, hearing dates, admitted petitions across Consumer Forum, Civil Courts, and NCLT.',
  },
  {
    id: 'uli',
    name: 'ULI — Uniform Lender Interface',
    type: 'Banking',
    status: 'BETA',
    latency: 'Real-time',
    records: 'RBI Mandate 2025',
    desc: 'Outbound disbursement API. Tranche-linked release signals sent to lender core banking on milestone verification.',
  },
  {
    id: 'bbmp',
    name: 'BBMP / BDA (Zoning & FAR)',
    type: 'Regulatory',
    status: 'LIVE',
    latency: 'Weekly refresh',
    records: '3.2M plot records',
    desc: 'FAR limits, zoning classification, building plan sanction status. Used in scanner pre-approval verification.',
  },
  {
    id: 'nclt',
    name: 'NCLT Filing Registry',
    type: 'Litigation',
    status: 'LIVE',
    latency: '12h refresh',
    records: 'National coverage',
    desc: 'Insolvency petitions (IBC 2016), resolution status, admitted cases. Cross-referenced against all Kaveri HFC borrowers.',
  },
]

const API_SAMPLES = [
  {
    title: 'K-RERA QPR Status Check',
    endpoint: 'GET /api/v1/krera/qpr/{rera_id}',
    response: `{
  "rera_id": "PRM/KA/RERA/1251/308/PR/2021",
  "project": "Ozone Urbana",
  "latest_qpr": {
    "quarter": "Q3-2023",
    "status": "OVERDUE",
    "days_overdue": 47,
    "escrow_pct": 54.1,
    "claimed_progress": 43,
    "krera_flag": "SHOW_CAUSE_PENDING"
  },
  "data_as_of": "2024-06-20T04:32:00Z"
}`,
  },
  {
    title: 'Kaveri Encumbrance Check',
    endpoint: 'GET /api/v1/kaveri/encumbrance/{sy_no}',
    response: `{
  "sy_no": "84/2",
  "taluk": "Bengaluru South",
  "encumbrances": [
    {
      "type": "Mortgage",
      "holder": "HDFC Bank",
      "amount_cr": 4.2,
      "registered": "2019-03-14",
      "discharged": null,
      "status": "ACTIVE"
    }
  ],
  "lender_declared": false,
  "mismatch_flag": "UNDISCLOSED_ENCUMBRANCE"
}`,
  },
  {
    title: 'eCourts Litigation Screen',
    endpoint: 'GET /api/v1/ecourts/developer/{developer_id}',
    response: `{
  "developer_id": "ozone-constructions",
  "active_cases": 2,
  "cases": [
    {
      "case_no": "VB/CC/2023/1847",
      "court": "Consumer Forum Bengaluru",
      "status": "ADMITTED",
      "filed": "2024-06-14",
      "qpr_declared": false
    }
  ],
  "qpr_mismatch": true,
  "last_checked": "2024-06-20T09:14:00Z"
}`,
  },
]

export default function IntegrationsPage() {
  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Data Integrations</h1>
        <p className="text-gray text-sm mt-0.5">Live feeds from 6 government data sources. No manual data entry.</p>
      </div>

      {/* Architecture diagram */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-5">Data Architecture</div>
        <div className="flex flex-col sm:flex-row items-stretch gap-0">
          {/* Sources */}
          <div className="flex flex-col gap-2 flex-1">
            {['K-RERA Registry', 'Kaveri 2.0 (Land)', 'eCourts API'].map(s => (
              <div key={s} className="px-3 py-2 bg-surface2 border border-border rounded-sm text-xs text-off-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                {s}
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center px-4 py-2 sm:py-0">
            <div className="hidden sm:flex flex-col items-center gap-1">
              <div className="text-[8px] font-mono text-gray uppercase">ingest</div>
              <div className="text-gold text-lg">→</div>
            </div>
            <div className="sm:hidden flex flex-row items-center gap-2">
              <div className="text-[8px] font-mono text-gray uppercase">ingest</div>
              <div className="text-gold">↓</div>
            </div>
          </div>

          {/* Middle */}
          <div className="flex-1 px-4 py-5 bg-gold/6 border border-gold/20 rounded-sm flex flex-col items-center justify-center">
            <Zap className="w-5 h-5 text-gold mb-2" />
            <div className="text-xs font-medium text-off-white text-center">Vantis Ingestion Layer</div>
            <div className="text-[9px] font-mono text-gray text-center mt-1">Normalise · Score · Alert</div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center px-4 py-2 sm:py-0">
            <div className="hidden sm:flex flex-col items-center gap-1">
              <div className="text-[8px] font-mono text-gray uppercase">publish</div>
              <div className="text-gold text-lg">→</div>
            </div>
            <div className="sm:hidden flex flex-row items-center gap-2">
              <div className="text-[8px] font-mono text-gray uppercase">publish</div>
              <div className="text-gold">↓</div>
            </div>
          </div>

          {/* Destinations */}
          <div className="flex flex-col gap-2 flex-1">
            {['ULI API Gateway', 'Kaveri HFC Core Banking', 'Vantis Lend Dashboard'].map(s => (
              <div key={s} className="px-3 py-2 bg-surface2 border border-border rounded-sm text-xs text-off-white flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {INTEGRATIONS.map(i => (
          <div key={i.id} className="bg-surface border border-border rounded-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray">{i.type}</div>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm flex items-center gap-1"
                style={{
                  color: i.status === 'LIVE' ? '#2ECC71' : '#F39C12',
                  background: i.status === 'LIVE' ? 'rgba(46,204,113,0.12)' : 'rgba(243,156,18,0.12)',
                }}
              >
                {i.status === 'LIVE' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                {i.status}
              </span>
            </div>
            <div className="font-medium text-sm text-off-white mb-1">{i.name}</div>
            <p className="text-[10px] text-gray leading-relaxed mb-3">{i.desc}</p>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <span className="text-[9px] font-mono text-gray-light">{i.latency}</span>
              <span className="text-[9px] font-mono text-gray-light">·</span>
              <span className="text-[9px] font-mono text-gray-light">{i.records}</span>
            </div>
          </div>
        ))}
      </div>

      {/* API samples */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Sample API Responses</div>
        <div className="space-y-4">
          {API_SAMPLES.map((s, i) => (
            <div key={i} className="bg-surface border border-border rounded-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border bg-surface2 flex items-center justify-between">
                <span className="text-xs text-off-white font-medium">{s.title}</span>
                <code className="text-[9px] font-mono text-gold">{s.endpoint}</code>
              </div>
              <pre className="px-4 py-3 text-[10px] font-mono text-gray-light leading-relaxed overflow-x-auto">
                {s.response}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
