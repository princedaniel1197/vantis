'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Shield, Search, CheckCircle2, Clock, Circle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import complaintsData from '@/data/complaints.json'

type Language = 'en' | 'kn'

interface Complaint {
  id: string
  project_id: string
  project_name: string
  complainant_name: string
  filed_date: string
  category: string
  status: 'PENDING' | 'RESOLVED'
  description: string
  amount_at_risk_lakh: number
  assigned_officer: string
  hearing_date: string | null
  resolution_date?: string
  resolution_summary?: string
}

const COMPLAINTS = complaintsData as Complaint[]

type TrackStep = 'filed' | 'acknowledged' | 'notice_issued' | 'hearing_scheduled' | 'order_passed' | 'resolved'

const ALL_STEPS: { key: TrackStep; en: string; kn: string }[] = [
  { key: 'filed',             en: 'Filed',            kn: 'ದಾಖಲು' },
  { key: 'acknowledged',      en: 'Acknowledged',     kn: 'ದೃಢೀಕರಣ' },
  { key: 'notice_issued',     en: 'Notice Issued',    kn: 'ನೋಟೀಸ್' },
  { key: 'hearing_scheduled', en: 'Hearing',          kn: 'ವಿಚಾರಣೆ' },
  { key: 'order_passed',      en: 'Order Passed',     kn: 'ಆದೇಶ' },
  { key: 'resolved',          en: 'Resolved',         kn: 'ಇತ್ಯರ್ಥ' },
]

function getActiveStep(c: Complaint): TrackStep {
  if (c.status === 'RESOLVED') return 'resolved'
  if (c.hearing_date) return 'hearing_scheduled'
  return 'notice_issued'
}

function getStepIndex(key: TrackStep): number {
  return ALL_STEPS.findIndex(s => s.key === key)
}

function fmtDate(d: string | null | undefined, lang: Language): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString(lang === 'kn' ? 'en-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const TX = {
  en: {
    title: 'Track Complaint',
    sub: 'Enter your reference number or registered phone',
    placeholder: 'VG-2026-XXXXXX or CMP-2024-001',
    search: 'Track',
    notFound: 'No complaint found with this reference.',
    notFoundSub: 'Contact K-RERA helpline: 1800-425-9297 (Toll Free)\nEmail: helpdesk-rera@karnataka.gov.in',
    ref: 'Reference Number',
    project: 'Project',
    category: 'Nature',
    filed: 'Filed On',
    hearing: 'Next Hearing',
    resolved: 'Resolved On',
    amount: 'Amount at Risk',
    officer: 'Assigned Officer',
    progress: 'Case Progress',
    nextStep: 'Next Step',
    langToggle: 'ಕನ್ನಡ',
    timeline: 'Timeline',
    enterRef: 'Enter your complaint reference number above',
    example: 'Example: CMP-2024-001',
    resolution: 'Resolution',
  },
  kn: {
    title: 'ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    sub: 'ನಿಮ್ಮ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ಅಥವಾ ನೋಂದಾಯಿತ ಫೋನ್ ನಮೂದಿಸಿ',
    placeholder: 'VG-2026-XXXXXX ಅಥವಾ CMP-2024-001',
    search: 'ಹುಡುಕಿ',
    notFound: 'ಈ ಉಲ್ಲೇಖದೊಂದಿಗೆ ಯಾವುದೇ ದೂರು ಕಂಡುಬಂದಿಲ್ಲ.',
    notFoundSub: 'K-RERA ಸಹಾಯವಾಣಿ: 1800-425-9297 (ಟೋಲ್ ಫ್ರೀ)\nಇಮೇಲ್: helpdesk-rera@karnataka.gov.in',
    ref: 'ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ',
    project: 'ಯೋಜನೆ',
    category: 'ಸ್ವರೂಪ',
    filed: 'ದಾಖಲಾದ ದಿನಾಂಕ',
    hearing: 'ಮುಂದಿನ ವಿಚಾರಣೆ',
    resolved: 'ಇತ್ಯರ್ಥ ದಿನಾಂಕ',
    amount: 'ರಿಸ್ಕ್‌ನಲ್ಲಿ ಮೊತ್ತ',
    officer: 'ನಿಯೋಜಿತ ಅಧಿಕಾರಿ',
    progress: 'ಪ್ರಕರಣ ಪ್ರಗತಿ',
    nextStep: 'ಮುಂದಿನ ಹೆಜ್ಜೆ',
    langToggle: 'English',
    timeline: 'ಟೈಮ್‌ಲೈನ್',
    enterRef: 'ಮೇಲೆ ನಿಮ್ಮ ದೂರಿನ ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    example: 'ಉದಾಹರಣೆ: CMP-2024-001',
    resolution: 'ನಿರ್ಣಯ',
  },
}

const NEXT_STEPS: Record<TrackStep, { en: string; kn: string }> = {
  filed:             { en: 'Your complaint is being reviewed. You will be notified within 5 working days.',                  kn: 'ನಿಮ್ಮ ದೂರನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ. 5 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ನಿಮಗೆ ತಿಳಿಸಲಾಗುತ್ತದೆ.' },
  acknowledged:      { en: 'K-RERA has acknowledged your complaint and is preparing a show-cause notice.',                   kn: 'K-RERA ನಿಮ್ಮ ದೂರನ್ನು ದೃಢೀಕರಿಸಿದ್ದು ನೋಟೀಸ್ ತಯಾರಿಸುತ್ತಿದೆ.' },
  notice_issued:     { en: 'A show-cause notice has been issued to the developer. Awaiting their response.',                 kn: 'ಡೆವಲಪರ್‌ಗೆ ನೋಟೀಸ್ ನೀಡಲಾಗಿದೆ. ಅವರ ಪ್ರತಿಕ್ರಿಯೆ ನಿರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ.' },
  hearing_scheduled: { en: 'A hearing has been scheduled. Both parties will be heard before an order is passed.',            kn: 'ವಿಚಾರಣೆ ನಿಗದಿ ಆಗಿದೆ. ಆದೇಶ ಮೊದಲು ಎರಡೂ ಕಡೆಗಳನ್ನು ಕೇಳಲಾಗುತ್ತದೆ.' },
  order_passed:      { en: 'An order has been passed. If the developer fails to comply, enforcement proceedings will begin.', kn: 'ಆದೇಶ ನೀಡಲಾಗಿದೆ. ಡೆವಲಪರ್ ಅನುಸರಿಸದಿದ್ದಲ್ಲಿ ಜಾರಿ ಕ್ರಮ ಕೈಗೊಳ್ಳಲಾಗುತ್ತದೆ.' },
  resolved:          { en: 'Your complaint has been resolved. Check the resolution summary below.',                           kn: 'ನಿಮ್ಮ ದೂರು ಇತ್ಯರ್ಥವಾಗಿದೆ. ಕೆಳಗೆ ನಿರ್ಣಯ ಸಾರಾಂಶ ನೋಡಿ.' },
}

function buildTimeline(c: Complaint, lang: Language) {
  const events: { date: string; label: string }[] = [
    { date: fmtDate(c.filed_date, lang), label: lang === 'en' ? 'Complaint filed' : 'ದೂರು ದಾಖಲಾಗಿದೆ' },
  ]
  if (c.hearing_date) {
    events.push({ date: fmtDate(c.filed_date, lang), label: lang === 'en' ? 'Show-cause notice issued' : 'ನೋಟೀಸ್ ನೀಡಲಾಗಿದೆ' })
    events.push({ date: fmtDate(c.hearing_date, lang), label: lang === 'en' ? 'Hearing scheduled' : 'ವಿಚಾರಣೆ ನಿಗದಿ' })
  }
  if (c.resolution_date) {
    events.push({ date: fmtDate(c.resolution_date, lang), label: lang === 'en' ? 'Complaint resolved' : 'ದೂರು ಇತ್ಯರ್ಥ' })
  }
  return events.reverse()
}

function TrackContent() {
  const searchParams = useSearchParams()
  const [lang, setLang] = useState<Language>('en')
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [result, setResult] = useState<Complaint | null | undefined>(undefined)
  const tx = TX[lang]

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setQuery(ref)
      const found = COMPLAINTS.find(c => c.id.toLowerCase() === ref.toLowerCase())
      setSearched(true)
      setResult(found ?? null)
    }
  }, [searchParams])

  function doSearch() {
    const val = query.trim()
    if (!val) return
    setSearched(true)
    const found = COMPLAINTS.find(c => c.id.toLowerCase() === val.toLowerCase())
    setResult(found ?? null)
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-background">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          <span className="font-syne text-base text-gold">Vantis</span>
        </Link>
        <div className="text-off-white text-sm font-medium">{tx.title}</div>
        <button
          onClick={() => setLang(l => l === 'en' ? 'kn' : 'en')}
          className="text-xs text-gray-light border border-border rounded-sm px-3 py-1.5 hover:border-gold hover:text-gold transition-colors duration-150"
        >
          {tx.langToggle}
        </button>
      </header>

      <div className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">

        {/* Search */}
        <div className="mb-8">
          <h1 className="font-syne text-2xl text-off-white mb-1">{tx.title}</h1>
          <p className="text-gray text-sm mb-4">{tx.sub}</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch()}
                placeholder={tx.placeholder}
                className="w-full bg-surface border border-border rounded-sm pl-9 pr-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors duration-150"
              />
            </div>
            <button
              onClick={doSearch}
              className="px-5 py-3 bg-gold text-background font-semibold text-sm rounded-sm hover:bg-gold-light transition-colors duration-150"
            >
              {tx.search}
            </button>
          </div>
        </div>

        {/* Initial state */}
        {!searched && (
          <div className="text-center py-10">
            <Clock className="w-8 h-8 text-gray mx-auto mb-3" />
            <div className="text-gray-light text-sm mb-1">{tx.enterRef}</div>
            <div className="text-gray text-xs">{tx.example}</div>
          </div>
        )}

        {/* Not found */}
        {searched && result === null && (
          <div className="bg-surface border border-border rounded-sm p-6 text-center">
            <div className="text-off-white text-sm font-medium mb-2">{tx.notFound}</div>
            <pre className="text-gray text-xs whitespace-pre-wrap font-sans leading-relaxed">{tx.notFoundSub}</pre>
          </div>
        )}

        {/* Found */}
        {result && (() => {
          const activeStep = getActiveStep(result)
          const activeIdx = getStepIndex(activeStep)
          const timeline = buildTimeline(result, lang)

          return (
            <div className="space-y-5">

              {/* Status banner */}
              <div className={`border rounded-sm p-4 flex items-center justify-between ${
                result.status === 'RESOLVED' ? 'bg-green/5 border-green/30' : 'bg-amber/5 border-amber/30'
              }`}>
                <div>
                  <div className="font-mono text-xs text-gold mb-0.5">{result.id}</div>
                  <div className="text-off-white text-sm font-medium">{result.project_name}</div>
                  <div className="text-gray text-xs">{result.category}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium shrink-0 ${
                  result.status === 'RESOLVED' ? 'text-green' : 'text-amber'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${result.status === 'RESOLVED' ? 'bg-green' : 'bg-amber'}`} />
                  {result.status === 'RESOLVED'
                    ? (lang === 'en' ? 'Resolved' : 'ಇತ್ಯರ್ಥ')
                    : (lang === 'en' ? 'Pending' : 'ಬಾಕಿ')}
                </span>
              </div>

              {/* Progress steps */}
              <div className="bg-surface border border-border rounded-sm p-5">
                <div className="text-[10px] uppercase tracking-widest text-gray mb-5">{tx.progress}</div>
                <div className="relative">
                  <div className="absolute top-3 left-3 right-3 h-0.5 bg-border" />
                  <div
                    className="absolute top-3 left-3 h-0.5 bg-gold transition-all duration-700"
                    style={{ width: activeIdx > 0 ? `${(activeIdx / (ALL_STEPS.length - 1)) * 100}%` : '0%' }}
                  />
                  <div className="relative flex justify-between">
                    {ALL_STEPS.map((s, i) => {
                      const done = i < activeIdx
                      const active = i === activeIdx
                      return (
                        <div key={s.key} className="flex flex-col items-center gap-1.5" style={{ width: '16.67%' }}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 bg-background ${
                            done ? 'border-gold bg-gold' : active ? 'border-gold' : 'border-border'
                          }`}>
                            {done
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-background" />
                              : active
                                ? <div className="w-2 h-2 rounded-full bg-gold" />
                                : <Circle className="w-2.5 h-2.5 text-border" />}
                          </div>
                          <span className={`text-[9px] text-center leading-tight ${active ? 'text-gold font-medium' : done ? 'text-gray-light' : 'text-gray'}`}>
                            {s[lang]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Next step callout */}
              <div className="border-l-2 border-gold pl-4 bg-surface rounded-sm p-4">
                <div className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">{tx.nextStep}</div>
                <p className="text-off-white text-sm leading-relaxed">{NEXT_STEPS[activeStep][lang]}</p>
              </div>

              {/* Details */}
              <div className="bg-surface border border-border rounded-sm p-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: tx.filed,  val: fmtDate(result.filed_date, lang) },
                    { label: tx.amount, val: `₹${result.amount_at_risk_lakh} Lakh` },
                    result.hearing_date    ? { label: tx.hearing,  val: fmtDate(result.hearing_date, lang) }    : null,
                    result.resolution_date ? { label: tx.resolved, val: fmtDate(result.resolution_date, lang) } : null,
                    { label: tx.officer, val: result.assigned_officer },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i}>
                      <div className="text-[10px] uppercase tracking-widest text-gray mb-0.5">{item!.label}</div>
                      <div className="text-off-white text-xs font-medium">{item!.val}</div>
                    </div>
                  ))}
                </div>
                {result.resolution_summary && (
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="text-[10px] uppercase tracking-widest text-gray mb-1">{tx.resolution}</div>
                    <p className="text-green text-xs leading-relaxed">{result.resolution_summary}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="bg-surface border border-border rounded-sm p-4">
                <div className="text-[10px] uppercase tracking-widest text-gray mb-4">{tx.timeline}</div>
                <div className="space-y-3">
                  {timeline.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-2 h-2 rounded-full mt-1 ${i === 0 ? 'bg-gold' : 'bg-gray'}`} />
                        {i < timeline.length - 1 && <div className="w-px bg-border mt-1" style={{ height: 24 }} />}
                      </div>
                      <div>
                        <div className="text-off-white text-xs font-medium leading-tight">{ev.label}</div>
                        <div className="text-gray text-[10px]">{ev.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </main>
  )
}

export default function TrackComplaint() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TrackContent />
    </Suspense>
  )
}
