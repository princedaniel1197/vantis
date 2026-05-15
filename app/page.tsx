'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Shield, ArrowRight } from 'lucide-react'
import projects from '@/data/projects.json'

type FilterType = 'project' | 'developer' | 'rera'
type Language = 'en' | 'kn'

interface Project {
  id: string
  name: string
  rera: string
  developer_name: string
  location: string
  status: string
}

const TRANSLATIONS = {
  en: {
    brand: 'Vantis',
    tagline: 'Palantir for Indian real estate',
    heading: 'Know the truth about\nyour K-RERA project',
    sub: 'Search any K-RERA registered project. Instant compliance status. No login required.',
    placeholder: {
      project: 'Search project name...',
      developer: 'Search developer name...',
      rera: 'Enter RERA number...',
    },
    filterLabels: ['Project', 'Developer', 'RERA Number'],
    stats: [
      { value: '8,357', label: 'Projects Monitored' },
      { value: '891',   label: 'QPR Defaulters' },
      { value: '234',   label: 'Litigation Alerts' },
    ],
    langToggle: 'ಕನ್ನಡ',
    officerLogin: 'Officer Login',
    noResults: 'No projects found.',
    poweredBy: 'Powered by Orianode Technologies · Data updated daily from K-RERA',
  },
  kn: {
    brand: 'ವಾಂಟಿಸ್',
    tagline: 'ಭಾರತೀಯ ರಿಯಲ್ ಎಸ್ಟೇಟ್‌ಗಾಗಿ ಪ್ಯಾಲಾಂಟಿರ್',
    heading: 'ನಿಮ್ಮ K-RERA ಯೋಜನೆಯ\nಸತ್ಯ ತಿಳಿಯಿರಿ',
    sub: 'ಯಾವುದೇ K-RERA ನೋಂದಾಯಿತ ಯೋಜನೆ ಹುಡುಕಿ. ತಕ್ಷಣ ಅನುಸರಣೆ ಸ್ಥಿತಿ. ಲಾಗಿನ್ ಅಗತ್ಯವಿಲ್ಲ.',
    placeholder: {
      project: 'ಯೋಜನೆ ಹೆಸರು ಹುಡುಕಿ...',
      developer: 'ಡೆವಲಪರ್ ಹೆಸರು ಹುಡುಕಿ...',
      rera: 'RERA ಸಂಖ್ಯೆ ನಮೂದಿಸಿ...',
    },
    filterLabels: ['ಯೋಜನೆ', 'ಡೆವಲಪರ್', 'RERA ಸಂಖ್ಯೆ'],
    stats: [
      { value: '8,357', label: 'ಮೇಲ್ವಿಚಾರಣೆ ಯೋಜನೆಗಳು' },
      { value: '891',   label: 'QPR ಡೀಫಾಲ್ಟರ್‌ಗಳು' },
      { value: '234',   label: 'ಮೊಕದ್ದಮೆ ಎಚ್ಚರಿಕೆಗಳು' },
    ],
    langToggle: 'English',
    officerLogin: 'ಅಧಿಕಾರಿ ಲಾಗಿನ್',
    noResults: 'ಯಾವುದೇ ಯೋಜನೆ ಕಂಡುಬಂದಿಲ್ಲ.',
    poweredBy: 'ಒರಿಯಾನೋಡ್ ತಂತ್ರಜ್ಞಾನಗಳಿಂದ ಪ್ರಾಯೋಜಿತ · ಪ್ರತಿ ದಿನ K-RERA ನವೀಕರಣ',
  },
}

const filterKeys: FilterType[] = ['project', 'developer', 'rera']

function statusColor(s: string) {
  if (s === 'COMPLIANT') return 'text-green'
  if (s === 'CAUTION')   return 'text-amber'
  return 'text-red'
}
function statusDot(s: string) {
  if (s === 'COMPLIANT') return 'bg-green'
  if (s === 'CAUTION')   return 'bg-amber'
  return 'bg-red'
}

export default function PublicPortalHome() {
  const router = useRouter()
  const [lang, setLang]   = useState<Language>('en')
  const [filter, setFilter] = useState<FilterType>('project')
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const tx = TRANSLATIONS[lang]

  const results = query.length >= 2
    ? (projects as Project[]).filter(p => {
        const q = query.toLowerCase()
        if (filter === 'project')   return p.name.toLowerCase().includes(q)
        if (filter === 'developer') return p.developer_name.toLowerCase().includes(q)
        return p.rera.toLowerCase().includes(q)
      })
    : []

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <main className="min-h-screen bg-background flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-5 sm:px-10 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-gold" />
          <span className="font-syne text-lg text-gold tracking-wide">{tx.brand}</span>
          <span className="hidden sm:inline text-gray text-[10px] font-mono uppercase tracking-[0.15em] ml-2 border-l border-border pl-3">
            by Orianode
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(l => (l === 'en' ? 'kn' : 'en'))}
            className="text-xs text-gray border border-border rounded-sm px-3 py-1.5 hover:border-gold hover:text-gold transition-colors duration-150"
          >
            {tx.langToggle}
          </button>
          <a
            href="/govern"
            className="flex items-center gap-1.5 text-xs text-gray-light hover:text-gold transition-colors duration-150"
          >
            {tx.officerLogin}
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-5 pt-16 pb-12">

        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="font-mono text-[10px] text-gold-dim uppercase tracking-[0.2em]">
            {tx.tagline}
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-syne text-3xl sm:text-5xl text-off-white text-center leading-tight mb-4 whitespace-pre-line">
          {tx.heading}
        </h1>
        <p className="text-gray text-sm sm:text-base text-center max-w-md mb-10 leading-relaxed">
          {tx.sub}
        </p>

        {/* Search */}
        <div ref={searchRef} className="w-full max-w-xl relative">

          {/* Filter pills */}
          <div className="flex gap-2 mb-3">
            {filterKeys.map((f, i) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setQuery(''); setOpen(false) }}
                className={`text-xs px-3 py-1.5 rounded-sm border transition-colors duration-150 ${
                  filter === f
                    ? 'bg-gold/15 border-gold text-gold font-medium'
                    : 'border-border text-gray hover:border-gold/40 hover:text-gold-light'
                }`}
              >
                {tx.filterLabels[i]}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true) }}
              onFocus={() => { if (query.length >= 2) setOpen(true) }}
              placeholder={tx.placeholder[filter]}
              className="w-full bg-surface border border-border rounded-sm pl-11 pr-11 py-3.5 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold/60 transition-colors duration-150"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); setOpen(false) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-gold transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Dropdown */}
          {open && query.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm z-50 overflow-hidden">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-gray text-sm">{tx.noResults}</div>
              ) : (
                results.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setOpen(false); setQuery(''); router.push(`/project/${p.id}`) }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface2 transition-colors duration-150 text-left border-b border-border last:border-0 group"
                  >
                    <div>
                      <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150">
                        {p.name}
                      </div>
                      <div className="font-mono text-gray text-xs mt-0.5">{p.developer_name} · {p.location}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs shrink-0 ml-3 ${statusColor(p.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                      {p.status}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xl mt-12">
          {tx.stats.map((s, i) => (
            <div key={i} className="bg-surface border border-border rounded-sm p-4 sm:p-5 text-center">
              <div className="font-syne text-2xl sm:text-3xl text-gold font-bold">{s.value}</div>
              <div className="font-mono text-[10px] text-gray uppercase tracking-[0.12em] mt-1.5 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="flex items-center gap-3 mt-8">
          <div className="h-px w-8 bg-border" />
          <span className="font-mono text-[10px] text-gray uppercase tracking-[0.15em]">
            K-RERA · Kaveri 2.0 · eCourts · Bhoomi
          </span>
          <div className="h-px w-8 bg-border" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 text-center border-t border-border px-4">
        <span className="font-mono text-[10px] text-gray uppercase tracking-[0.12em]">{tx.poweredBy}</span>
      </footer>
    </main>
  )
}
