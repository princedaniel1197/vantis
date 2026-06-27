'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Shield, Search, CheckCircle2, Upload, ChevronRight, MessageCircle } from 'lucide-react'
import projectsData from '@/data/projects.json'

type Language = 'en' | 'kn'
type Step = 1 | 2 | 3 | 'success'

interface Project { id: string; name: string; developer_name: string; location: string }
const PROJECTS = projectsData as Project[]

const NATURES = [
  { key: 'possession_delay',  en: 'Possession Delay',         kn: 'ಸ್ವಾಧೀನ ವಿಳಂಬ' },
  { key: 'construction',      en: 'Construction Quality',     kn: 'ನಿರ್ಮಾಣ ಗುಣಮಟ್ಟ' },
  { key: 'refund',            en: 'Refund Not Received',      kn: 'ಮರುಪಾವತಿ ಬಾಕಿ' },
  { key: 'false_info',        en: 'False Information',        kn: 'ತಪ್ಪು ಮಾಹಿತಿ' },
  { key: 'amenities',         en: 'Amenities Not Delivered',  kn: 'ಸೌಲಭ್ಯ ಒದಗಿಸಿಲ್ಲ' },
  { key: 'other',             en: 'Other',                    kn: 'ಇತರ' },
]

const TX = {
  en: {
    title: 'File a Complaint',
    sub: 'K-RERA Complaint Registration',
    step1: 'Your Details', step2: 'Project & Issue', step3: 'Complaint Details',
    name: 'Full Name', phone: 'Phone Number', email: 'Email Address',
    next: 'Next →', back: '← Back', submit: 'Submit Complaint',
    searchProject: 'Search project name…',
    nature: 'Nature of Complaint',
    complaintText: 'Describe your complaint',
    charCount: 'characters',
    minChars: 'Minimum 50 characters required',
    photoUpload: 'Upload supporting documents (optional)',
    photoDrag: 'Drag & drop files here or click to browse',
    photoSub: 'PDF, JPG, PNG — max 5MB each',
    successTitle: 'Complaint Filed Successfully',
    successSub: 'Your complaint has been registered with K-RERA.',
    refLabel: 'Reference Number',
    whatsapp: 'WhatsApp Confirmation Preview',
    trackBtn: 'Track Your Complaint',
    phoneErr: 'Enter a valid 10-digit phone number',
    emailErr: 'Enter a valid email address',
    nameErr: 'Name is required',
    projectErr: 'Select a project',
    natureErr: 'Select nature of complaint',
    langToggle: 'ಕನ್ನಡ',
  },
  kn: {
    title: 'ದೂರು ಸಲ್ಲಿಸಿ',
    sub: 'K-RERA ದೂರು ನೋಂದಣಿ',
    step1: 'ನಿಮ್ಮ ವಿವರ', step2: 'ಯೋಜನೆ ಮತ್ತು ಸಮಸ್ಯೆ', step3: 'ದೂರಿನ ವಿವರ',
    name: 'ಪೂರ್ಣ ಹೆಸರು', phone: 'ಫೋನ್ ಸಂಖ್ಯೆ', email: 'ಇಮೇಲ್ ವಿಳಾಸ',
    next: 'ಮುಂದೆ →', back: '← ಹಿಂದೆ', submit: 'ದೂರು ಸಲ್ಲಿಸಿ',
    searchProject: 'ಯೋಜನೆ ಹೆಸರು ಹುಡುಕಿ…',
    nature: 'ದೂರಿನ ಸ್ವರೂಪ',
    complaintText: 'ನಿಮ್ಮ ದೂರನ್ನು ವಿವರಿಸಿ',
    charCount: 'ಅಕ್ಷರಗಳು',
    minChars: 'ಕನಿಷ್ಠ 50 ಅಕ್ಷರಗಳು ಬೇಕು',
    photoUpload: 'ಸಹಾಯಕ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (ಐಚ್ಛಿಕ)',
    photoDrag: 'ಫೈಲ್‌ಗಳನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಿ',
    photoSub: 'PDF, JPG, PNG — ಗರಿಷ್ಠ 5MB',
    successTitle: 'ದೂರು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಾಗಿದೆ',
    successSub: 'ನಿಮ್ಮ ದೂರನ್ನು K-RERA ನಲ್ಲಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ.',
    refLabel: 'ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ',
    whatsapp: 'WhatsApp ದೃಢೀಕರಣ ಪೂರ್ವವೀಕ್ಷಣೆ',
    trackBtn: 'ನಿಮ್ಮ ದೂರನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    phoneErr: '10-ಅಂಕಿ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ',
    emailErr: 'ಮಾನ್ಯ ಇಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ',
    nameErr: 'ಹೆಸರು ಅಗತ್ಯ',
    projectErr: 'ಯೋಜನೆ ಆಯ್ಕೆ ಮಾಡಿ',
    natureErr: 'ದೂರಿನ ಸ್ವರೂಪ ಆಯ್ಕೆ ಮಾಡಿ',
    langToggle: 'English',
  },
}

function generateRef(): string {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `VG-2026-${n}`
}

export default function FileComplaint() {
  const [lang, setLang] = useState<Language>('en')
  const [step, setStep] = useState<Step>(1)
  const [ref] = useState(generateRef)
  const tx = TX[lang]

  // Step 1
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors1, setErrors1] = useState<Record<string, string>>({})

  // Step 2
  const [projectSearch, setProjectSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [nature, setNature] = useState('')
  const [errors2, setErrors2] = useState<Record<string, string>>({})

  // Step 3
  const [text, setText] = useState('')
  const [errors3, setErrors3] = useState<Record<string, string>>({})

  const filteredProjects = useMemo(
    () => projectSearch.length >= 2
      ? PROJECTS.filter(p => p.name.toLowerCase().includes(projectSearch.toLowerCase()))
      : [],
    [projectSearch]
  )

  function validateStep1(): boolean {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = tx.nameErr
    if (!/^\d{10}$/.test(phone.replace(/\s/g, ''))) e.phone = tx.phoneErr
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = tx.emailErr
    setErrors1(e)
    return Object.keys(e).length === 0
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {}
    if (!selectedProject) e.project = tx.projectErr
    if (!nature) e.nature = tx.natureErr
    setErrors2(e)
    return Object.keys(e).length === 0
  }

  function validateStep3(): boolean {
    const e: Record<string, string> = {}
    if (text.trim().length < 50) e.text = tx.minChars
    setErrors3(e)
    return Object.keys(e).length === 0
  }

  const STEPS = [tx.step1, tx.step2, tx.step3]
  const currentStepNum = step === 'success' ? 3 : (step as number)

  const whatsappText = `K-RERA Complaint Registered\nRef: ${ref}\nProject: ${selectedProject?.name ?? ''}\nIssue: ${NATURES.find(n => n.key === nature)?.[lang] ?? ''}\n\nTrack at krera.karnataka.gov.in`

  if (step === 'success') {
    return (
      <main data-theme="slate" className="min-h-screen bg-background flex flex-col">
        <Header lang={lang} setLang={setLang} tx={tx} />
        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-green/10 border border-green/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green" />
            </div>
            <h1 className="font-syne text-2xl text-off-white mb-2">{tx.successTitle}</h1>
            <p className="text-gray text-sm mb-6">{tx.successSub}</p>

            <div className="bg-surface border border-gold/30 rounded-sm p-4 mb-4 text-center">
              <div className="text-gray text-xs uppercase tracking-widest mb-1">{tx.refLabel}</div>
              <div className="font-syne text-3xl font-bold text-gold">{ref}</div>
            </div>

            <div className="bg-surface border border-border rounded-sm p-4 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-green" />
                <span className="text-green text-xs font-semibold">{tx.whatsapp}</span>
              </div>
              <pre className="text-off-white text-xs whitespace-pre-wrap font-sans leading-relaxed bg-surface2 rounded-sm px-3 py-2 border border-border">
                {whatsappText}
              </pre>
            </div>

            <Link
              href={`/complaint/track?ref=${ref}`}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gold text-background font-semibold text-sm rounded-sm hover:bg-gold-light transition-colors duration-150 mb-3"
            >
              {tx.trackBtn} <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/" className="text-xs text-gray hover:text-gold transition-colors duration-150">
              ← {lang === 'en' ? 'Back to Home' : 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂದಿರುಗಿ'}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header lang={lang} setLang={setLang} tx={tx} />

      <div className="flex-1 px-5 py-8 max-w-lg mx-auto w-full">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const n = i + 1
            const done = currentStepNum > n
            const active = currentStepNum === n
            return (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  done   ? 'bg-gold text-background' :
                  active ? 'bg-gold/20 border-2 border-gold text-gold' :
                           'bg-surface2 border border-border text-gray'
                }`}>
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : n}
                </div>
                <span className={`text-xs hidden sm:inline truncate ${active ? 'text-gold' : done ? 'text-gray-light' : 'text-gray'}`}>{label}</span>
                {i < 2 && <div className={`flex-1 h-px mx-1 ${done ? 'bg-gold/40' : 'bg-border'}`} />}
              </div>
            )
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-syne text-xl text-off-white mb-4">{tx.step1}</h2>
            {[
              { key: 'name', label: tx.name, val: name, set: setName, type: 'text', ph: lang === 'en' ? 'Rajesh Kumar' : 'ರಾಜೇಶ್ ಕುಮಾರ್' },
              { key: 'phone', label: tx.phone, val: phone, set: setPhone, type: 'tel', ph: '98xxxxxxxx' },
              { key: 'email', label: tx.email, val: email, set: setEmail, type: 'email', ph: 'you@example.com' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-gray-light mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  value={f.val}
                  onChange={e => { f.set(e.target.value); setErrors1(ev => ({ ...ev, [f.key]: '' })) }}
                  placeholder={f.ph}
                  className={`w-full bg-surface border rounded-sm px-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors duration-150 ${
                    errors1[f.key] ? 'border-red/50' : 'border-border'
                  }`}
                />
                {errors1[f.key] && <p className="text-red text-xs mt-1">{errors1[f.key]}</p>}
              </div>
            ))}
            <button
              onClick={() => { if (validateStep1()) setStep(2) }}
              className="w-full py-3 bg-gold text-background font-semibold text-sm rounded-sm hover:bg-gold-light transition-colors duration-150 mt-2"
            >
              {tx.next}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-syne text-xl text-off-white mb-4">{tx.step2}</h2>

            {/* Project search */}
            <div>
              <label className="block text-xs text-gray-light mb-1.5">{lang === 'en' ? 'Project' : 'ಯೋಜನೆ'}</label>
              {selectedProject ? (
                <div className="bg-surface border border-gold/30 rounded-sm px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-off-white text-sm font-medium">{selectedProject.name}</div>
                    <div className="text-gray text-xs">{selectedProject.developer_name} · {selectedProject.location}</div>
                  </div>
                  <button onClick={() => { setSelectedProject(null); setProjectSearch('') }} className="text-gray hover:text-gold transition-colors duration-150 text-xs">
                    {lang === 'en' ? 'Change' : 'ಬದಲಾಯಿಸಿ'}
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={e => setProjectSearch(e.target.value)}
                    placeholder={tx.searchProject}
                    className={`w-full bg-surface border rounded-sm pl-9 pr-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors duration-150 ${
                      errors2.project ? 'border-red/50' : 'border-border'
                    }`}
                  />
                  {filteredProjects.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm z-10 overflow-hidden">
                      {filteredProjects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => { setSelectedProject(p); setProjectSearch(''); setErrors2(e => ({ ...e, project: '' })) }}
                          className="w-full text-left px-4 py-2.5 hover:bg-surface2 border-b border-border last:border-0 transition-colors duration-150"
                        >
                          <div className="text-off-white text-sm">{p.name}</div>
                          <div className="text-gray text-xs">{p.developer_name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {errors2.project && <p className="text-red text-xs mt-1">{errors2.project}</p>}
            </div>

            {/* Nature tiles */}
            <div>
              <label className="block text-xs text-gray-light mb-2">{tx.nature}</label>
              <div className="grid grid-cols-2 gap-2">
                {NATURES.map(n => (
                  <button
                    key={n.key}
                    onClick={() => { setNature(n.key); setErrors2(e => ({ ...e, nature: '' })) }}
                    className={`px-3 py-3.5 rounded-sm border text-sm text-center transition-colors duration-150 ${
                      nature === n.key
                        ? 'bg-gold/15 border-gold text-gold font-medium'
                        : 'bg-surface border-border text-gray-light hover:border-gold/50 hover:text-gold'
                    }`}
                  >
                    {n[lang]}
                  </button>
                ))}
              </div>
              {errors2.nature && <p className="text-red text-xs mt-1">{errors2.nature}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-border text-gray text-sm rounded-sm hover:text-off-white transition-colors duration-150">{tx.back}</button>
              <button onClick={() => { if (validateStep2()) setStep(3) }} className="flex-1 py-3 bg-gold text-background font-semibold text-sm rounded-sm hover:bg-gold-light transition-colors duration-150">{tx.next}</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-syne text-xl text-off-white mb-4">{tx.step3}</h2>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-light">{tx.complaintText}</label>
                <span className={`text-xs font-mono ${text.length < 50 ? 'text-gray' : text.length > 2000 ? 'text-red' : 'text-green'}`}>
                  {text.length} / 2000 {tx.charCount}
                </span>
              </div>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setErrors3({}) }}
                rows={6}
                placeholder={lang === 'en'
                  ? 'Describe your complaint in detail. Include dates, amounts, and any communications with the developer…'
                  : 'ನಿಮ್ಮ ದೂರನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ. ದಿನಾಂಕಗಳು, ಮೊತ್ತಗಳು ಮತ್ತು ಡೆವಲಪರ್‌ನೊಂದಿಗಿನ ಯಾವುದೇ ಸಂಪರ್ಕಗಳನ್ನು ಸೇರಿಸಿ…'
                }
                className={`w-full bg-surface border rounded-sm px-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors duration-150 resize-none ${
                  errors3.text ? 'border-red/50' : 'border-border'
                }`}
              />
              {errors3.text && <p className="text-red text-xs mt-1">{errors3.text}</p>}
            </div>

            {/* Photo upload placeholder */}
            <div>
              <label className="block text-xs text-gray-light mb-1.5">{tx.photoUpload}</label>
              <div className="border-2 border-dashed border-border rounded-sm p-6 text-center hover:border-gold/40 transition-colors duration-150 cursor-pointer">
                <Upload className="w-6 h-6 text-gray mx-auto mb-2" />
                <div className="text-gray-light text-sm mb-1">{tx.photoDrag}</div>
                <div className="text-gray text-xs">{tx.photoSub}</div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setStep(2)} className="flex-1 py-3 border border-border text-gray text-sm rounded-sm hover:text-off-white transition-colors duration-150">{tx.back}</button>
              <button
                onClick={() => { if (validateStep3()) setStep('success') }}
                className="flex-1 py-3 bg-gold text-background font-semibold text-sm rounded-sm hover:bg-gold-light transition-colors duration-150"
              >
                {tx.submit}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

function Header({ lang, setLang, tx }: { lang: Language; setLang: (l: Language) => void; tx: typeof TX['en'] }) {
  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-background">
      <Link href="/" className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-gold" />
        <span className="font-syne text-base text-gold">Vantis</span>
      </Link>
      <div className="text-center">
        <div className="text-off-white text-sm font-medium">{tx.title}</div>
        <div className="text-gray text-xs">{tx.sub}</div>
      </div>
      <button
        onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
        className="text-xs text-gray-light border border-border rounded-sm px-3 py-1.5 hover:border-gold hover:text-gold transition-colors duration-150"
      >
        {tx.langToggle}
      </button>
    </header>
  )
}
