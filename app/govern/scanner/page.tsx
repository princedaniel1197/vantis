'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, AlertTriangle, XCircle, ScanLine } from 'lucide-react'

interface VerificationBlock {
  label: string
  source: string
  checked: string
  result: 'PASS' | 'WARNING' | 'FAIL'
  finding: string
}

interface Application {
  id: string
  project_name: string
  developer: string
  submitted_date: string
  rera_type: string
  units: number
  survey_numbers: string[]
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  risk_score: number
  verifications: VerificationBlock[]
}

const APPLICATIONS: Application[] = [
  {
    id: 'APP-2026-0034',
    project_name: 'Sunrise Heights Phase 2',
    developer: 'Sunrise Constructions Pvt Ltd',
    submitted_date: '2026-05-08',
    rera_type: 'Apartment',
    units: 120,
    survey_numbers: ['48/1', '48/2', '49/3'],
    risk: 'LOW',
    risk_score: 87,
    verifications: [
      { label: 'Title Verification',     source: 'Kaveri 2.0',    checked: 'Encumbrances, ownership chain, mortgage records', result: 'PASS',    finding: 'All 3 survey parcels have clear title. No encumbrances detected.' },
      { label: 'Land Area Verification', source: 'Bhoomi',        checked: 'Survey extent, RTC records, area match',           result: 'PASS',    finding: 'Declared area 2.48 acres matches Bhoomi records within 0.3%.' },
      { label: 'Litigation Check',       source: 'eCourts',       checked: 'Active cases, injunctions, stay orders',           result: 'PASS',    finding: 'No active litigation found. No injunctions or stay orders on record.' },
      { label: 'FAR & Zoning',           source: 'BBMP/BDA',      checked: 'FSI limits, zoning classification, OC status',     result: 'PASS',    finding: 'FSI 2.5 fully compliant with BBMP Revised Master Plan 2015.' },
      { label: 'Financial Consistency',  source: 'Internal/RERA', checked: 'Declared cost, sales projections, escrow plan',    result: 'PASS',    finding: 'Declared cost ₹42 Cr consistent with unit pricing and market comparables.' },
    ],
  },
  {
    id: 'APP-2026-0031',
    project_name: 'Greenfield Verdant Residences',
    developer: 'Greenfield Developers',
    submitted_date: '2026-05-05',
    rera_type: 'Apartment',
    units: 240,
    survey_numbers: ['218/4A'],
    risk: 'MEDIUM',
    risk_score: 61,
    verifications: [
      { label: 'Title Verification',     source: 'Kaveri 2.0',    checked: 'Encumbrances, ownership chain, mortgage records', result: 'PASS',    finding: 'Survey No. 218/4A has clear title. Ownership chain verified back 30 years.' },
      { label: 'Land Area Verification', source: 'Bhoomi',        checked: 'Survey extent, RTC records, area match',           result: 'WARNING', finding: 'Declared area 1.82 acres; Bhoomi records show 1.71 acres. Discrepancy 6.1% — clarification required.' },
      { label: 'Litigation Check',       source: 'eCourts',       checked: 'Active cases, injunctions, stay orders',           result: 'PASS',    finding: 'No active litigation. No encumbrance or dispute on record.' },
      { label: 'FAR & Zoning',           source: 'BBMP/BDA',      checked: 'FSI limits, zoning classification, OC status',     result: 'WARNING', finding: 'FSI 2.75 marginally exceeds permissible 2.5 under current zoning. BDA variance not on file.' },
      { label: 'Financial Consistency',  source: 'Internal/RERA', checked: 'Declared cost, sales projections, escrow plan',    result: 'PASS',    finding: 'Declared cost ₹89 Cr broadly consistent with market comparables for this location.' },
    ],
  },
  {
    id: 'APP-2026-0028',
    project_name: 'Kaveri Riverside Towers',
    developer: 'Shambhavi Constructions',
    submitted_date: '2026-04-29',
    rera_type: 'Apartment',
    units: 380,
    survey_numbers: ['142/3B', '142/4', '143/1'],
    risk: 'HIGH',
    risk_score: 22,
    verifications: [
      { label: 'Title Verification',     source: 'Kaveri 2.0',    checked: 'Encumbrances, ownership chain, mortgage records', result: 'FAIL',    finding: 'Undisclosed mortgage of ₹4.2 Cr on Survey No. 142/3B. Developer did not disclose encumbrance in application.' },
      { label: 'Land Area Verification', source: 'Bhoomi',        checked: 'Survey extent, RTC records, area match',           result: 'FAIL',    finding: 'Declared area 3.4 acres; Bhoomi records show 2.79 acres. Discrepancy 18% — possible illegal layout conversion.' },
      { label: 'Litigation Check',       source: 'eCourts',       checked: 'Active cases, injunctions, stay orders',           result: 'WARNING', finding: 'OS 4421/2024 filed by adjacent landowner regarding boundary encroachment. Pending hearing.' },
      { label: 'FAR & Zoning',           source: 'BBMP/BDA',      checked: 'FSI limits, zoning classification, OC status',     result: 'PASS',    finding: 'FSI 2.25 within permissible limits under current zoning.' },
      { label: 'Financial Consistency',  source: 'Internal/RERA', checked: 'Declared cost, sales projections, escrow plan',    result: 'PASS',    finding: 'Declared cost ₹127 Cr within acceptable range for this scale and location.' },
    ],
  },
]

const CERT_ID = 'VG-2026-007934-0004'

const CERT_VERIFICATIONS = [
  { label: 'Title Verification',     source: 'Kaveri 2.0' },
  { label: 'Land Area Verification', source: 'Bhoomi' },
  { label: 'Litigation Check',       source: 'eCourts' },
  { label: 'FAR and Zoning',         source: 'BBMP/BDA' },
  { label: 'Financial Consistency',  source: 'Internal' },
]

function riskConfig(risk: string) {
  if (risk === 'HIGH')   return { textColor: 'text-red',   dotBg: 'bg-red',   label: 'High Risk' }
  if (risk === 'MEDIUM') return { textColor: 'text-amber', dotBg: 'bg-amber', label: 'Medium Risk' }
  return                        { textColor: 'text-green', dotBg: 'bg-green', label: 'Low Risk' }
}

function resultIcon(result: string) {
  if (result === 'PASS')    return <CheckCircle className="w-4 h-4 text-green shrink-0" />
  if (result === 'WARNING') return <AlertTriangle className="w-4 h-4 text-amber shrink-0" />
  return                           <XCircle className="w-4 h-4 text-red shrink-0" />
}

function resultColor(result: string) {
  if (result === 'PASS')    return 'text-green'
  if (result === 'WARNING') return 'text-amber'
  return 'text-red'
}

function resultBg(result: string) {
  if (result === 'PASS')    return 'bg-green/5 border-green/20'
  if (result === 'WARNING') return 'bg-amber/5 border-amber/20'
  return 'bg-red/5 border-red/20'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTimestamp(d: Date) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function riskScoreColor(s: number) {
  if (s >= 70) return 'text-green'
  if (s >= 40) return 'text-amber'
  return 'text-red'
}

function riskBarColor(s: number) {
  if (s >= 70) return 'bg-green'
  if (s >= 40) return 'bg-amber'
  return 'bg-red'
}

export default function SubmissionScanner() {
  const [selectedId, setSelectedId] = useState<string>(APPLICATIONS[2].id)
  const [approveModal, setApproveModal] = useState(false)
  const [rejectModal, setRejectModal] = useState(false)
  const [conditionsModal, setConditionsModal] = useState(false)
  const [approved, setApproved] = useState(false)
  const [approvedAt, setApprovedAt] = useState<Date | null>(null)

  const app = APPLICATIONS.find(a => a.id === selectedId) ?? APPLICATIONS[0]
  const rc = riskConfig(app.risk)

  const failCount    = app.verifications.filter(v => v.result === 'FAIL').length
  const warningCount = app.verifications.filter(v => v.result === 'WARNING').length

  /* ── Success state ─────────────────────────────────────────────── */
  if (approved && approvedAt) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">

        {/* Section 1 — Status banner */}
        <div className="bg-green/10 border border-green/20 rounded-sm p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green mx-auto mb-3" />
          <div className="font-syne text-2xl text-off-white font-bold mb-2">Application Approved</div>
          <div className="text-gray text-sm mb-3 leading-relaxed">
            Prestige Whitefield Phase 2 has been approved for K-RERA registration
          </div>
          <div className="font-mono text-[10px] text-gray uppercase tracking-widest">
            {fmtTimestamp(approvedAt)}
          </div>
        </div>

        {/* Section 2 — Certificate generated */}
        <div className="bg-surface border border-border rounded-sm p-6 mt-4">
          <div className="font-syne text-off-white text-base font-semibold mb-1">Vantis Certificate Generated</div>
          <div className="text-gray text-xs mb-4">Tamper-proof compliance record issued by Orianode Technologies</div>

          <div className="font-mono text-gold text-lg font-bold mb-5 tracking-wide">{CERT_ID}</div>

          <div className="space-y-2 mb-5">
            {CERT_VERIFICATIONS.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border rounded-sm bg-green/5 border-green/20">
                <CheckCircle className="w-4 h-4 text-green shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-off-white text-sm font-semibold">{v.label}</span>
                    <span className="font-mono text-xs font-bold text-green shrink-0">PASS</span>
                  </div>
                  <div className="text-gray text-[10px] mt-0.5">Source: {v.source}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-gray text-sm text-center border-t border-border pt-4">
            Certificate is now publicly scannable
          </div>
        </div>

        {/* Section 3 — Next steps */}
        <div className="bg-surface border border-border rounded-sm p-6 mt-4">
          <div className="font-mono text-[10px] text-gray uppercase tracking-[0.15em] mb-4">Next Steps</div>
          <div className="space-y-3 mb-6">
            {[
              'Project is now live in the K-RERA public registry',
              'Developer has been notified via email and portal',
              'Vantis certificate QR code is now active and publicly scannable',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span className="text-gray-light text-sm leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/certificate/${CERT_ID}`}
              className="flex-1 bg-gold text-background text-sm font-semibold py-2.5 rounded-sm hover:bg-gold-light transition-colors duration-150 text-center"
            >
              View Certificate
            </Link>
            <button
              onClick={() => { setApproved(false); setApprovedAt(null); setSelectedId(APPLICATIONS[2].id) }}
              className="flex-1 border border-border text-gray text-sm py-2.5 rounded-sm hover:text-off-white hover:border-gold/50 transition-colors duration-150"
            >
              Return to Scanner Queue
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main scanner layout ───────────────────────────────────────── */
  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white">Submission Scanner</h1>
          <p className="text-gray text-xs mt-1">Pre-assessment queue · 5-database verification</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-gray text-xs">
          <ScanLine className="w-4 h-4" />
          {APPLICATIONS.length} pending
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left: Queue */}
        <div className="lg:col-span-2">
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Pending Queue</div>
          <div className="space-y-2">
            {APPLICATIONS.map(a => {
              const r = riskConfig(a.risk)
              const isSelected = a.id === selectedId
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={`w-full text-left bg-surface border rounded-sm p-4 transition-colors duration-150 ${
                    isSelected ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium leading-tight truncate ${isSelected ? 'text-gold' : 'text-off-white'}`}>
                        {a.project_name}
                      </div>
                      <div className="text-gray text-xs mt-0.5 truncate">{a.developer}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] shrink-0 ${r.textColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.dotBg}`} />
                      {r.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-gray-light">{a.id}</span>
                    <span className="text-gray">Submitted {fmtDate(a.submitted_date)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Assessment card */}
        <div className="lg:col-span-3">
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Pre-Assessment Report</div>
          <div className="bg-surface border border-border rounded-sm overflow-hidden">

            {/* Card header */}
            <div className={`px-5 py-4 border-b border-border ${
              app.risk === 'HIGH' ? 'bg-red/5' : app.risk === 'MEDIUM' ? 'bg-amber/5' : 'bg-green/5'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-syne text-off-white text-lg font-bold leading-tight">{app.project_name}</div>
                  <div className="text-gray text-xs mt-0.5">{app.developer} · {app.rera_type} · {app.units} units</div>
                  <div className="font-mono text-gray-light text-[10px] mt-1">Survey: {app.survey_numbers.join(', ')}</div>
                </div>
                <div className="text-center shrink-0">
                  <div className={`font-syne text-4xl font-bold ${riskScoreColor(app.risk_score)}`}>{app.risk_score}</div>
                  <div className="text-gray text-[10px] mt-0.5">Risk score</div>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${riskBarColor(app.risk_score)}`} style={{ width: `${app.risk_score}%` }} />
              </div>
              {(failCount > 0 || warningCount > 0) && (
                <div className="flex gap-3 mt-2">
                  {failCount > 0 && <span className="text-red text-xs">{failCount} fail{failCount > 1 ? 's' : ''}</span>}
                  {warningCount > 0 && <span className="text-amber text-xs">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>}
                </div>
              )}
            </div>

            {/* Verification blocks */}
            <div className="px-5 py-4 space-y-2.5">
              <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">5-Point Database Verification</div>
              {app.verifications.map((v, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 border rounded-sm ${resultBg(v.result)}`}>
                  {resultIcon(v.result)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-off-white text-sm font-semibold">{v.label}</span>
                      <span className={`font-mono text-xs font-bold shrink-0 ${resultColor(v.result)}`}>{v.result}</span>
                    </div>
                    <div className="text-gray text-[10px] mb-1">Source: {v.source} · Checked: {v.checked}</div>
                    <div className="text-gray-light text-xs leading-relaxed">{v.finding}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Officer Actions */}
            <div className="px-5 py-4 border-t border-border">
              <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-3">Officer Actions</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setApproveModal(true)}
                  className="bg-green/15 border border-green/30 text-green text-sm py-2.5 rounded-sm hover:bg-green/25 transition-colors duration-150 font-medium"
                >
                  Approve
                </button>
                <button
                  onClick={() => setConditionsModal(true)}
                  className="bg-amber/10 border border-amber/30 text-amber text-sm py-2.5 rounded-sm hover:bg-amber/20 transition-colors duration-150 font-medium"
                >
                  Approve with Conditions
                </button>
                <button
                  onClick={() => setRejectModal(true)}
                  className="bg-red/10 border border-red/30 text-red text-sm py-2.5 rounded-sm hover:bg-red/20 transition-colors duration-150 font-medium"
                >
                  Reject Application
                </button>
                <button className="bg-surface2 border border-border text-gray text-sm py-2.5 rounded-sm hover:text-off-white hover:border-gold/50 transition-colors duration-150">
                  Request Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve modal */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setApproveModal(false)}>
          <div className="bg-surface border border-border rounded-sm p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="font-syne text-off-white text-lg font-bold mb-4">Approve Application</div>

            {/* Application summary */}
            <div className="space-y-2 mb-4">
              {[
                { label: 'Project',    value: app.project_name },
                { label: 'Developer',  value: app.developer },
                { label: 'Application No.', value: app.id },
                { label: 'Pre-Assessment',  value: `${rc.label} · Score ${app.risk_score}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-3 py-1.5 border-b border-border/60">
                  <span className="text-gray text-xs shrink-0">{label}</span>
                  <span className={`text-xs text-right font-medium ${label === 'Pre-Assessment' ? rc.textColor : 'text-off-white'}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Green callout */}
            <div className="border-l-4 border-green bg-green/5 px-4 py-3 rounded-sm mb-5">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green shrink-0 mt-0.5" />
                <span className="text-green text-xs leading-relaxed">
                  All five database checks passed or resolved. This application is cleared for registration.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setApproveModal(false); setApproved(true); setApprovedAt(new Date()) }}
                className="flex-1 bg-gold text-background text-sm font-semibold py-2.5 rounded-sm hover:bg-gold-light transition-colors duration-150"
              >
                Confirm Approval
              </button>
              <button
                onClick={() => setApproveModal(false)}
                className="flex-1 border border-border text-gray text-sm py-2.5 rounded-sm hover:text-off-white transition-colors duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setRejectModal(false)}>
          <div className="bg-surface border border-border rounded-sm p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="font-syne text-off-white text-base mb-2">Reject Application?</div>
            <div className="text-gray text-sm mb-1 leading-relaxed">
              <strong className="text-off-white">{app.project_name}</strong> will be rejected. The developer will receive a rejection notice with the following findings:
            </div>
            <div className="bg-red/5 border border-red/20 rounded-sm p-3 mb-4 space-y-1">
              {app.verifications.filter(v => v.result === 'FAIL').map((v, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs">
                  <XCircle className="w-3.5 h-3.5 text-red shrink-0 mt-0.5" />
                  <span className="text-red/80">{v.finding}</span>
                </div>
              ))}
              {app.verifications.filter(v => v.result === 'FAIL').length === 0 && (
                <div className="text-gray text-xs">No critical failures — confirm reason for rejection.</div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(false)} className="flex-1 bg-red/10 border border-red/40 text-red text-sm py-2.5 rounded-sm hover:bg-red/20 transition-colors duration-150 font-medium">
                Confirm Rejection
              </button>
              <button onClick={() => setRejectModal(false)} className="flex-1 bg-surface2 border border-border text-gray text-sm py-2.5 rounded-sm hover:text-off-white transition-colors duration-150">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve with conditions modal */}
      {conditionsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setConditionsModal(false)}>
          <div className="bg-surface border border-border rounded-sm p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="font-syne text-off-white text-base mb-2">Approve with Conditions</div>
            <div className="text-gray text-sm mb-4 leading-relaxed">
              Provisional approval granted for <strong className="text-off-white">{app.project_name}</strong>. Developer must resolve all warnings within 60 days or registration will be suspended.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConditionsModal(false)} className="flex-1 bg-amber/10 border border-amber/40 text-amber text-sm py-2.5 rounded-sm hover:bg-amber/20 transition-colors duration-150 font-medium">
                Issue Conditional Approval
              </button>
              <button onClick={() => setConditionsModal(false)} className="flex-1 bg-surface2 border border-border text-gray text-sm py-2.5 rounded-sm hover:text-off-white transition-colors duration-150">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
