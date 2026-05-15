'use client'

import { useState } from 'react'
import { FileText, Copy, Printer, Shield, Check } from 'lucide-react'
import projectsData from '@/data/projects.json'

interface Project {
  id: string
  name: string
  rera: string
  developer_name: string
  location: string
  complaints_pending: number
}

const PROJECTS = projectsData as Project[]

const VIOLATION_TYPES = [
  { value: 'qpr_default',   label: 'QPR Default',                   section: 'Section 63' },
  { value: 'registration',  label: 'Project Registration Violation', section: 'Section 59' },
  { value: 'false_info',    label: 'False Information Submitted',    section: 'Section 60' },
  { value: 'unregistered',  label: 'Unregistered Project Activity',  section: 'Section 59' },
  { value: 'other',         label: 'Other Regulatory Violation',     section: 'Section 64' },
]

const TODAY_DISPLAY = '13 May 2026'
const NOTICE_NUMBER_BASE = 'K-RERA/NOTICE'

function noticeMeta(projectId: string, violationType: string): string {
  const date = new Date('2026-05-13')
  const y = date.getFullYear()
  const code = violationType.toUpperCase().slice(0, 3)
  return `${NOTICE_NUMBER_BASE}/${y}/${code}/${projectId.toUpperCase().slice(0, 4)}/001`
}

function generateNoticeText(
  project: Project,
  violationType: string,
  lang: 'en' | 'kn'
): string {
  const section = VIOLATION_TYPES.find(v => v.value === violationType)?.section ?? 'Section 64'

  if (lang === 'kn' && project.id === 'ozone-urbana' && violationType === 'qpr_default') {
    return `ಕ್ರಮ ಸಂಖ್ಯೆ: ${noticeMeta(project.id, violationType)}\nದಿನಾಂಕ: ${TODAY_DISPLAY}\n\nಕಾರಣ ತೋರಿಸಿ ನೋಟೀಸ್\nನಿಯಮ 63 — ರಿಯಲ್ ಎಸ್ಟೇಟ್ (ನಿಯಂತ್ರಣ ಮತ್ತು ಅಭಿವೃದ್ಧಿ) ಕಾಯ್ದೆ 2016\n\nಗೆ,\nಮೆ/ಸ ಓಝೋನ್ ಗ್ರೂಪ್, ಬೆಂಗಳೂರು\n\nನೋಂದಣಿ: PRM/KA/RERA/1251/309/PR/170517/004521\nಯೋಜನೆ: ಓಝೋನ್ ಅರ್ಬಾನಾ\n\nಈ ಮೇರೆಗೆ ನಿಮ್ಮನ್ನು ತಿಳಿಸಲಾಗುತ್ತಿದೆ: RERA ಕಾಯ್ದೆ 2016 ರ ಸೆಕ್ಷನ್ 11(1) ಮತ್ತು ಕರ್ನಾಟಕ RERA ನಿಯಮಗಳ ನಿಯಮ 15 ರ ಪ್ರಕಾರ 5 ಸತತ ತ್ರೈಮಾಸಿಕ ಪ್ರಗತಿ ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಲು ವಿಫಲವಾಗಿದ್ದೀರಿ.\n\nಒಟ್ಟು ದಂಡ: ₹45,75,000\n\n21 ದಿನಗಳಲ್ಲಿ ಕಾರಣ ತೋರಿಸಿ.\n\nಪ್ರಾಧಿಕಾರದ ಆದೇಶದಂತೆ,\nಕರ್ನಾಟಕ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ನಿಯಂತ್ರಣ ಪ್ರಾಧಿಕಾರ`
  }

  if (violationType === 'qpr_default') {
    const isOzone = project.id === 'ozone-urbana'
    const missedCount = isOzone ? 5 : project.id === 'skylark-arcadia' ? 1 : 3
    const penaltyDays = isOzone ? 1830 : missedCount * 90
    const penaltyAmt = isOzone ? 'Rs.45,75,000' : `Rs.${(penaltyDays * 25000).toLocaleString('en-IN')}`

    return `Ref No: ${noticeMeta(project.id, violationType)}
Date: ${TODAY_DISPLAY}

SHOW CAUSE NOTICE
${section} — Real Estate (Regulation and Development) Act, 2016

To,
M/s ${project.developer_name}
${project.location}

Registration No.: ${project.rera}
Project Name: ${project.name}

WHEREAS you have failed to submit Quarterly Progress Reports for ${missedCount} consecutive quarter${missedCount > 1 ? 's' : ''} in violation of Section 11(1) of the Real Estate (Regulation and Development) Act 2016 and Rule 15 of the Karnataka Real Estate (Regulation and Development) Rules, 2017.

WHEREAS ${section} of the Act provides for a penalty of Rs.25,000 per day for each day of default after the due date.

WHEREAS the total penalty accrued as of ${TODAY_DISPLAY} is calculated as follows:
  — Applicable penalty rate: Rs.25,000 per day
  — Number of days of default: ${penaltyDays} days
  — Total penalty accrued: ${penaltyAmt}

YOU ARE HEREBY DIRECTED to show cause in writing within 21 days of receipt of this notice as to why penalty proceedings should not be initiated against you under the provisions of the Act.

Failure to respond within the stipulated time shall be treated as an admission of the default, and penalty proceedings shall be initiated without further notice.

By order of the Authority,

Karnataka Real Estate Regulatory Authority
5th Floor, TTMC Building, Shivajinagar
Bengaluru – 560 001`
  }

  if (violationType === 'registration') {
    return `Ref No: ${noticeMeta(project.id, violationType)}
Date: ${TODAY_DISPLAY}

NOTICE FOR VIOLATION OF REGISTRATION CONDITIONS
${section} — Real Estate (Regulation and Development) Act, 2016

To,
M/s ${project.developer_name}
${project.location}

Registration No.: ${project.rera}
Project Name: ${project.name}

WHEREAS it has been brought to the notice of this Authority that you have violated the conditions stipulated at the time of registration of the above project under ${section} of the Act.

WHEREAS the observed violation relates to material non-compliance with the approved project plan and registration undertakings filed at the time of project registration.

YOU ARE HEREBY DIRECTED to show cause within 21 days as to why action should not be taken including revocation of registration under ${section} of the Act.

By order of the Authority,

Karnataka Real Estate Regulatory Authority
5th Floor, TTMC Building, Shivajinagar
Bengaluru – 560 001`
  }

  if (violationType === 'false_info') {
    return `Ref No: ${noticeMeta(project.id, violationType)}
Date: ${TODAY_DISPLAY}

NOTICE FOR FURNISHING FALSE INFORMATION
${section} — Real Estate (Regulation and Development) Act, 2016

To,
M/s ${project.developer_name}
${project.location}

Registration No.: ${project.rera}
Project Name: ${project.name}

WHEREAS this Authority has reason to believe that you have willfully furnished false information or made a false statement in the documents / declarations submitted to the Authority in relation to the above project.

WHEREAS ${section} of the Act provides for imprisonment up to one year or fine up to 10% of the estimated cost of the project, or both, for such violation.

YOU ARE HEREBY DIRECTED to submit your written response within 21 days of receipt of this notice. Produce all original documents and records pertaining to the project for verification before this Authority.

By order of the Authority,

Karnataka Real Estate Regulatory Authority
5th Floor, TTMC Building, Shivajinagar
Bengaluru – 560 001`
  }

  if (violationType === 'unregistered') {
    return `Ref No: ${noticeMeta(project.id, violationType)}
Date: ${TODAY_DISPLAY}

NOTICE FOR OPERATING WITHOUT VALID REGISTRATION
${section} — Real Estate (Regulation and Development) Act, 2016

To,
M/s ${project.developer_name}
${project.location}

Subject: Activities conducted in relation to ${project.name} without / beyond valid RERA registration.

WHEREAS it has been observed that certain activities pertaining to the above-named project are being carried out without a valid registration, or beyond the scope of the existing registration, in contravention of Section 3 of the Real Estate (Regulation and Development) Act, 2016.

WHEREAS ${section} of the Act provides for penalty up to 10% of the estimated cost of the real estate project for such violation.

YOU ARE HEREBY DIRECTED to immediately cease all marketing, booking and sale activities and show cause within 21 days as to why penalty should not be imposed.

By order of the Authority,

Karnataka Real Estate Regulatory Authority
5th Floor, TTMC Building, Shivajinagar
Bengaluru – 560 001`
  }

  return `Ref No: ${noticeMeta(project.id, violationType)}
Date: ${TODAY_DISPLAY}

REGULATORY COMPLIANCE NOTICE
${section} — Real Estate (Regulation and Development) Act, 2016

To,
M/s ${project.developer_name}
${project.location}

Registration No.: ${project.rera}
Project Name: ${project.name}

WHEREAS this Authority has observed regulatory non-compliance in the above project requiring your immediate attention and response.

YOU ARE HEREBY DIRECTED to appear before this Authority and submit a written explanation within 21 days of receipt of this notice, failing which this Authority shall proceed ex parte.

By order of the Authority,

Karnataka Real Estate Regulatory Authority
5th Floor, TTMC Building, Shivajinagar
Bengaluru – 560 001`
}

export default function NoticeGenerator() {
  const [violationType, setViolationType] = useState('')
  const [projectId, setProjectId]         = useState('')
  const [lang, setLang]                   = useState<'en' | 'kn'>('en')
  const [loading, setLoading]             = useState(false)
  const [noticeText, setNoticeText]       = useState<string | null>(null)
  const [copied, setCopied]               = useState(false)

  const selectedProject = PROJECTS.find(p => p.id === projectId) ?? null
  const selectedSection = VIOLATION_TYPES.find(v => v.value === violationType)?.section ?? ''

  function handleGenerate() {
    if (!violationType || !projectId) return
    setLoading(true)
    setNoticeText(null)
    setTimeout(() => {
      setLoading(false)
      setNoticeText(generateNoticeText(selectedProject!, violationType, lang))
    }, 1500)
  }

  function handleCopy() {
    if (!noticeText) return
    navigator.clipboard.writeText(noticeText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handlePrint() {
    window.print()
  }

  const canGenerate = violationType && projectId

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white">AI Notice Generator</h1>
          <p className="text-gray text-xs mt-1">Draft regulatory notices · Powered by Vantis Intelligence</p>
        </div>
        <FileText className="w-6 h-6 text-gray hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-2">Notice Configuration</div>

          {/* Violation Type */}
          <div>
            <label className="block text-xs text-gray mb-1.5">Violation Type</label>
            <select
              value={violationType}
              onChange={e => { setViolationType(e.target.value); setNoticeText(null) }}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2.5 text-sm text-off-white focus:outline-none focus:border-gold transition-colors duration-150 appearance-none cursor-pointer"
            >
              <option value="">Select violation type…</option>
              {VIOLATION_TYPES.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* RERA Section — auto-populated */}
          {violationType && (
            <div>
              <label className="block text-xs text-gray mb-1.5">Applicable RERA Section</label>
              <div className="w-full bg-surface2 border border-border rounded-sm px-3 py-2.5 text-sm font-mono text-gold">
                {selectedSection} — Real Estate (Regulation and Development) Act, 2016
              </div>
            </div>
          )}

          {/* Project selector */}
          <div>
            <label className="block text-xs text-gray mb-1.5">Project</label>
            <select
              value={projectId}
              onChange={e => { setProjectId(e.target.value); setNoticeText(null) }}
              className="w-full bg-surface border border-border rounded-sm px-3 py-2.5 text-sm text-off-white focus:outline-none focus:border-gold transition-colors duration-150 appearance-none cursor-pointer"
            >
              <option value="">Select project…</option>
              {PROJECTS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Developer details — auto-populated */}
          {selectedProject && (
            <div className="bg-surface2 border border-border rounded-sm p-3 space-y-2">
              <div className="text-[10px] text-gray uppercase tracking-widest font-semibold">Auto-populated Developer Details</div>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-gray shrink-0 w-20">Developer:</span>
                  <span className="text-off-white">{selectedProject.developer_name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray shrink-0 w-20">Location:</span>
                  <span className="text-off-white">{selectedProject.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray shrink-0 w-20">RERA No.:</span>
                  <span className="font-mono text-gold text-[10px] break-all">{selectedProject.rera}</span>
                </div>
              </div>
            </div>
          )}

          {/* Language toggle */}
          <div>
            <label className="block text-xs text-gray mb-1.5">Notice Language</label>
            <div className="flex gap-2">
              {(['en', 'kn'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => { setLang(l); setNoticeText(null) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-sm border transition-colors duration-150 ${
                    lang === l
                      ? 'bg-gold/15 border-gold text-gold'
                      : 'bg-surface border-border text-gray hover:border-gold/50 hover:text-gold-light'
                  }`}
                >
                  {l === 'en' ? 'English' : 'ಕನ್ನಡ'}
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className={`w-full py-3 text-sm font-bold rounded-sm transition-colors duration-150 ${
              canGenerate && !loading
                ? 'bg-gold text-background hover:bg-gold-light'
                : 'bg-surface2 border border-border text-gray cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-1.5">
                Generating
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: '200ms' }} />
                <span className="typing-dot" style={{ animationDelay: '400ms' }} />
              </span>
            ) : 'Generate Notice'}
          </button>
        </div>

        {/* Right: Notice Preview */}
        <div className="lg:col-span-3">
          <div className="text-[10px] text-gray uppercase tracking-widest font-semibold mb-2">Notice Preview</div>

          {!noticeText && !loading && (
            <div className="h-64 lg:h-full min-h-[300px] flex items-center justify-center bg-surface border border-border rounded-sm">
              <div className="text-center px-6">
                <FileText className="w-8 h-8 text-gray mx-auto mb-3" />
                <div className="text-off-white text-sm mb-1">No notice generated</div>
                <div className="text-gray text-xs">Select a violation type and project, then click Generate Notice.</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-64 lg:h-full min-h-[300px] flex items-center justify-center bg-surface border border-border rounded-sm">
              <div className="text-center">
                <div className="flex items-center gap-1.5 mb-3 justify-center">
                  <span className="typing-dot bg-gold" />
                  <span className="typing-dot bg-gold" style={{ animationDelay: '200ms' }} />
                  <span className="typing-dot bg-gold" style={{ animationDelay: '400ms' }} />
                </div>
                <div className="text-gray text-xs">Vantis Intelligence drafting notice…</div>
              </div>
            </div>
          )}

          {noticeText && !loading && (
            <div className="flex flex-col gap-3">
              {/* Document */}
              <div className="bg-[#FAFAF7] border border-[#D0CCB8] rounded-sm overflow-hidden print:shadow-none">
                {/* Letterhead */}
                <div className="px-6 py-5 border-b-2 border-[#0A3D62] bg-[#F0EEE6] text-center">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <Shield className="w-8 h-8 text-[#0A3D62]" />
                    <div>
                      <div className="font-bold text-[#0A3D62] text-base tracking-wide leading-tight">
                        KARNATAKA REAL ESTATE REGULATORY AUTHORITY
                      </div>
                      <div className="text-[#0A3D62] text-xs opacity-70">
                        ಕರ್ನಾಟಕ ರಿಯಲ್ ಎಸ್ಟೇಟ್ ನಿಯಂತ್ರಣ ಪ್ರಾಧಿಕಾರ
                      </div>
                    </div>
                  </div>
                  <div className="text-[#0A3D62] text-[11px] opacity-70 mt-1">
                    5th Floor, TTMC Building, BMTC Complex, Shivajinagar, Bengaluru – 560 001
                  </div>
                </div>

                {/* Notice body */}
                <div className="px-6 py-5">
                  <pre
                    className="font-sans text-[#1A1A28] text-xs leading-relaxed whitespace-pre-wrap"
                    style={{ fontFamily: 'inherit' }}
                  >
                    {noticeText}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 text-sm border border-border bg-surface text-gray hover:text-gold hover:border-gold rounded-sm transition-colors duration-150"
                >
                  {copied ? <Check className="w-4 h-4 text-green" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 text-sm bg-gold text-background font-bold rounded-sm hover:bg-gold-light transition-colors duration-150"
                >
                  <Printer className="w-4 h-4" />
                  Download as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
