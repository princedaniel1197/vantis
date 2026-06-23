'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Database, FileText, AlertTriangle } from 'lucide-react'

const PROJECTS = [
  {
    id: 'divya-villas',
    name: 'Divya Villas',
    developer: 'Zion Builders',
    location: 'Sy. No. 84/2, Rajarajeshwari Nagar, Mysuru',
    rera: 'PRM/KA/RERA/1251/309/PR/170412/000034',
  },
  {
    id: 'prestige-lakeside',
    name: 'Prestige Lakeside',
    developer: 'Prestige Group',
    location: 'Sy. No. 12/1, Whitefield, Bengaluru East',
    rera: 'PRM/KA/RERA/1251/309/PR/180614/000143',
  },
  {
    id: 'ozone-urbana',
    name: 'Ozone Urbana',
    developer: 'Ozone Group',
    location: 'Sy. No. 33, 34, Devanahalli, Bengaluru Rural',
    rera: 'PRM/KA/RERA/1251/309/PR/171016/000112',
  },
]

type ProjectId = 'divya-villas' | 'prestige-lakeside' | 'ozone-urbana'

interface CheckResult {
  label: string
  source: string
  status: 'PASS' | 'FAIL' | 'WARN'
  detail: string
}

const RESULTS: Record<ProjectId, { doc: CheckResult; kaveri: CheckResult }> = {
  'divya-villas': {
    doc: {
      label: 'Document Authentication',
      source: 'Submitted EC / Title Report',
      status: 'PASS',
      detail:
        'Encumbrance Certificate for Sy. No. 84/2 covers the required 13-year period (2011–2024). Face-value check: no encumbrances declared in EC periods 2011–2019 and 2020–2024. Document hashes match developer-submitted set. Title appears clean on document inspection.',
    },
    kaveri: {
      label: 'Kaveri 2.0 Source Verification',
      source: 'Karnataka Registration Dept. — Kaveri Online Services',
      status: 'FAIL',
      detail:
        'Kaveri 2.0 scrape of Sy. No. 84/2 reveals an unresolved mortgage encumbrance for the period 2019–03–14 to 2022–08–30 (document no. KR-MYS-2019-0847231). Lender: unnamed NBFC. Discharge status: PENDING as of last Kaveri sync (2026-06-20). This encumbrance is ABSENT from the developer-submitted EC — the period appears to have been selectively omitted from the EC submitted to Kaveri HFC. Transaction value recorded in Kaveri: ₹4.20 Cr.',
    },
  },
  'prestige-lakeside': {
    doc: {
      label: 'Document Authentication',
      source: 'Submitted EC / Title Report',
      status: 'PASS',
      detail:
        'EC for Sy. No. 12/1 covers the 15-year mandatory period. No encumbrances declared. Document hash verified against developer submission. Title chain appears clean.',
    },
    kaveri: {
      label: 'Kaveri 2.0 Source Verification',
      source: 'Karnataka Registration Dept. — Kaveri Online Services',
      status: 'PASS',
      detail:
        'Kaveri 2.0 confirms zero encumbrances on record for Sy. No. 12/1 for the full 15-year period. All registered sale deeds and mortgage discharges are present and consistent with the submitted EC. No anomalies detected.',
    },
  },
  'ozone-urbana': {
    doc: {
      label: 'Document Authentication',
      source: 'Submitted EC / Title Report',
      status: 'PASS',
      detail:
        'EC for Sy. Nos. 33 and 34, Devanahalli covers the required period. No encumbrances disclosed on face value of document. Title appears clean in submitted documentation.',
    },
    kaveri: {
      label: 'Kaveri 2.0 Source Verification',
      source: 'Karnataka Registration Dept. — Kaveri Online Services',
      status: 'WARN',
      detail:
        'Kaveri 2.0 shows 3 registered sale deeds on Sy. No. 33 from 2020–2022 not reflected in the developer-submitted inventory. Additionally, a lis pendens (pending litigation notice) was registered against Sy. No. 34 in March 2022. Lender should independently verify encumbrance status before disbursement.',
    },
  },
}

const STATUS_CONFIG = {
  PASS: { icon: CheckCircle, color: '#2ECC71', bg: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.25)', label: 'PASS' },
  FAIL: { icon: XCircle,     color: '#E74C3C', bg: 'rgba(231,76,60,0.08)', border: 'rgba(231,76,60,0.25)', label: 'FAIL' },
  WARN: { icon: AlertTriangle,color: '#F39C12', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.25)', label: 'WARN' },
}

function ResultCard({ result }: { result: CheckResult }) {
  const cfg = STATUS_CONFIG[result.status]
  const Icon = cfg.icon
  return (
    <div className="flex-1 bg-surface border border-border rounded-sm p-5" style={{ minWidth: '280px' }}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-xs font-mono font-bold uppercase tracking-[0.1em]"
          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
        <div className="text-off-white text-sm font-semibold">{result.label}</div>
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        {result.source === 'Submitted EC / Title Report'
          ? <FileText className="w-3.5 h-3.5 text-gray" />
          : <Database className="w-3.5 h-3.5 text-gold" />
        }
        <span className="text-[10px] font-mono text-gray">{result.source}</span>
      </div>
      <p className="text-gray-light text-xs leading-relaxed">{result.detail}</p>
    </div>
  )
}

export default function LendVerifyPage() {
  const [selected, setSelected] = useState<ProjectId>('divya-villas')
  const project = PROJECTS.find(p => p.id === selected)!
  const results  = RESULTS[selected]

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Property Verification</h1>
        <p className="text-gray text-sm mt-1">
          Document check vs. Karnataka Registration Dept. source data
        </p>
      </div>

      {/* Project selector */}
      <div className="bg-surface border border-border rounded-sm p-4 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Select Project</div>
        <div className="flex flex-wrap gap-2 mb-4">
          {PROJECTS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id as ProjectId)}
              className="px-3 py-2 rounded-sm text-xs font-mono border transition-colors duration-100"
              style={{
                color:       selected === p.id ? '#C9A84C' : '#6B6B88',
                borderColor: selected === p.id ? '#C9A84C' : '#1E1E2E',
                background:  selected === p.id ? 'rgba(201,168,76,0.08)' : 'transparent',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
        {/* Project meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div><span className="text-gray">Developer: </span><span className="text-off-white">{project.developer}</span></div>
          <div><span className="text-gray">Location: </span><span className="text-off-white">{project.location}</span></div>
          <div className="sm:col-span-2"><span className="text-gray">RERA: </span><span className="font-mono text-gold-dim">{project.rera}</span></div>
        </div>
      </div>

      {/* Result cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <ResultCard result={results.doc} />
        <ResultCard result={results.kaveri} />
      </div>

      {/* Moat callout */}
      <div className="bg-surface border-l-2 border-gold px-4 py-4 rounded-sm">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-gold" />
          <span className="text-gold text-xs font-mono uppercase tracking-[0.1em]">Vantis Moat</span>
        </div>
        <p className="text-gray-light text-sm leading-relaxed">
          A document-authentication API passes this.&nbsp;
          <strong className="text-gold">A Kaveri scraper catches it.</strong>&nbsp;
          That&rsquo;s the moat. Vantis Lend cross-references every submitted title document against live Kaveri 2.0 records — surfacing selective EC omissions, undisclosed mortgages, and lis pendens registrations that no API-only solution can detect.
        </p>
      </div>
    </div>
  )
}
