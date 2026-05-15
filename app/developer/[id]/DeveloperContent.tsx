'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, ChevronRight, Building2, TrendingUp } from 'lucide-react'
import developersData from '@/data/developers.json'
import projectsData from '@/data/projects.json'

type Language = 'en' | 'kn'

interface Developer {
  id: string
  name: string
  city: string
  state: string
  trust_score: number
  total_projects: number
  active_projects: number
  completed_projects: number
  total_units: number
  status: string
  years_active: number
  contact_email: string
  contact_phone: string
  projects: string[]
}

interface Project {
  id: string
  name: string
  location: string
  status: string
  total_units: number
  units_sold: number
  completion_date: string
  risk_score: number
}

const DEVELOPERS = developersData as Developer[]
const PROJECTS = projectsData as Project[]

const TX = {
  en: {
    notFound: 'Developer not found.',
    back: '← Back',
    registered: 'Registered',
    yearsActive: 'Years Active',
    trustScore: 'Vantis Trust Score',
    stats: ['Total Projects', 'Active Projects', 'Completed', 'Total Units'],
    compliance: 'Compliance Components',
    labels: ['QPR Compliance Rate', 'Complaint Density', 'Completion Rate'],
    projects: 'Registered Projects',
    units: 'units sold of',
    due: 'Due',
    cta: 'Get Full Developer Intelligence Report',
    ctaSub: '₹499 · Includes litigation history, financial analysis, homebuyer risk assessment',
    langToggle: 'ಕನ್ನಡ',
    riskScore: 'Risk Score',
  },
  kn: {
    notFound: 'ಡೆವಲಪರ್ ಕಂಡುಬಂದಿಲ್ಲ.',
    back: '← ಹಿಂದೆ',
    registered: 'ನೋಂದಾಯಿತ',
    yearsActive: 'ವರ್ಷಗಳ ಸಕ್ರಿಯ',
    trustScore: 'ವಾಂಟಿಸ್ ವಿಶ್ವಾಸ ಸ್ಕೋರ್',
    stats: ['ಒಟ್ಟು ಯೋಜನೆಗಳು', 'ಸಕ್ರಿಯ ಯೋಜನೆಗಳು', 'ಪೂರ್ಣಗೊಂಡವು', 'ಒಟ್ಟು ಘಟಕಗಳು'],
    compliance: 'ಅನುಸರಣೆ ಘಟಕಗಳು',
    labels: ['QPR ಅನುಸರಣೆ ದರ', 'ದೂರು ಸಾಂದ್ರತೆ', 'ಪೂರ್ಣಗೊಳಿಸುವ ದರ'],
    projects: 'ನೋಂದಾಯಿತ ಯೋಜನೆಗಳು',
    units: 'ಘಟಕಗಳು ಮಾರಾಟ',
    due: 'ಮುಕ್ತಾಯ',
    cta: 'ಪೂರ್ಣ ಡೆವಲಪರ್ ಇಂಟೆಲಿಜೆನ್ಸ್ ವರದಿ ಪಡೆಯಿರಿ',
    ctaSub: '₹499 · ಮೊಕದ್ದಮೆ ಇತಿಹಾಸ, ಆರ್ಥಿಕ ವಿಶ್ಲೇಷಣೆ, ಗೃಹಖರೀದಿದಾರ ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ ಒಳಗೊಂಡಿದೆ',
    langToggle: 'English',
    riskScore: 'ರಿಸ್ಕ್ ಸ್ಕೋರ್',
  },
}

const COMPONENT_SCORES: Record<string, number[]> = {
  'prestige-group':       [95, 90, 98],
  'zion-estate':          [88, 72, 85],
  'skylark-constructions':[62, 48, 45],
  'ozone-group':          [8,  10, 12],
}

function scoreColor(s: number) {
  if (s >= 70) return 'text-green'
  if (s >= 45) return 'text-amber'
  return 'text-red'
}

function scoreBorder(s: number) {
  if (s >= 70) return 'border-green/20'
  if (s >= 45) return 'border-amber/30'
  return 'border-red/30'
}

function barColor(v: number) {
  if (v >= 70) return 'bg-green'
  if (v >= 45) return 'bg-amber'
  return 'bg-red'
}

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

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

export default function DeveloperContent({ params }: { params: { id: string } }) {
  const [lang, setLang] = useState<Language>('en')
  const tx = TX[lang]

  const dev = DEVELOPERS.find(d => d.id === params.id)

  if (!dev) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-gray text-sm mb-3">{tx.notFound}</div>
          <Link href="/" className="text-xs text-gold hover:underline">← Home</Link>
        </div>
      </main>
    )
  }

  const devProjects = PROJECTS.filter(p => dev.projects.includes(p.id))
  const components = COMPONENT_SCORES[dev.id] ?? [50, 50, 50]

  return (
    <main className="min-h-screen bg-background flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          <span className="font-syne text-base text-gold">Vantis</span>
        </Link>
        <button
          onClick={() => setLang(l => l === 'en' ? 'kn' : 'en')}
          className="text-xs text-gray-light border border-border rounded-sm px-3 py-1.5 hover:border-gold hover:text-gold transition-colors duration-150"
        >
          {tx.langToggle}
        </button>
      </header>

      <div className="flex-1 px-5 sm:px-8 py-6 max-w-3xl mx-auto w-full">

        {/* Back */}
        <Link href="/" className="text-xs text-gray hover:text-gold transition-colors duration-150 mb-4 inline-block">
          {tx.back}
        </Link>

        {/* Hero card */}
        <div className={`bg-surface border rounded-sm p-5 mb-5 ${scoreBorder(dev.trust_score)}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Building2 className="w-4 h-4 text-gold" />
                <h1 className="font-syne text-xl sm:text-2xl text-off-white">{dev.name}</h1>
              </div>
              <div className="text-gray text-xs mb-3">{dev.city}, {dev.state}</div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 text-xs ${statusColor(dev.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(dev.status)}`} />
                  {dev.status}
                </span>
                <span className="text-xs text-gray-light">{dev.years_active} {tx.yearsActive}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`font-syne text-5xl sm:text-6xl font-bold leading-none ${scoreColor(dev.trust_score)}`}>
                {dev.trust_score}
              </div>
              <div className="text-gray text-[10px] mt-1 uppercase tracking-widest">{tx.trustScore}</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[dev.total_projects, dev.active_projects, dev.completed_projects, dev.total_units.toLocaleString('en-IN')].map((v, i) => (
            <div key={i} className="bg-surface border border-border rounded-sm p-3 text-center">
              <div className="font-syne text-xl font-bold text-off-white">{v}</div>
              <div className="text-gray text-[10px] mt-0.5 leading-tight">{tx.stats[i]}</div>
            </div>
          ))}
        </div>

        {/* Component scores */}
        <div className="bg-surface border border-border rounded-sm p-5 mb-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray mb-4">{tx.compliance}</div>
          <div className="space-y-3">
            {tx.labels.map((label, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray">{label}</span>
                  <span className={`font-mono text-xs font-bold ${barColor(components[i]).replace('bg-', 'text-')}`}>
                    {components[i]}%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor(components[i])}`} style={{ width: `${components[i]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h2 className="font-mono text-[10px] text-gray uppercase tracking-[0.15em] mb-3">{tx.projects}</h2>
          <div className="space-y-3">
            {devProjects.map(p => {
              const pct = Math.round((p.units_sold / p.total_units) * 100)
              return (
                <Link
                  key={p.id}
                  href={`/project/${p.id}`}
                  className="block bg-surface border border-border rounded-sm p-4 hover:border-gold/50 transition-colors duration-150 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150">
                        {p.name}
                      </div>
                      <div className="text-gray text-xs">{p.location}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${statusColor(p.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                        {p.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray group-hover:text-gold transition-colors duration-150" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-gray mb-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wide mb-0.5">{tx.riskScore}</div>
                      <span className={`font-mono font-bold ${scoreColor(p.risk_score)}`}>{p.risk_score}</span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide mb-0.5">{tx.units}</div>
                      <span className="text-off-white">{p.units_sold} / {p.total_units}</span>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wide mb-0.5">{tx.due}</div>
                      <span className="text-off-white">{fmtDate(p.completion_date)}</span>
                    </div>
                  </div>
                  {/* Units sold bar */}
                  <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor(p.risk_score)}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-gray mt-1">{pct}% sold</div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-surface border border-gold/20 rounded-sm p-5 text-center">
          <TrendingUp className="w-5 h-5 text-gold mx-auto mb-2" />
          <div className="font-syne text-base text-off-white mb-1">{tx.cta}</div>
          <div className="text-gray text-xs mb-4">{tx.ctaSub}</div>
          <button className="px-6 py-2.5 bg-gold text-background font-semibold text-sm rounded-sm hover:bg-gold-light transition-colors duration-150">
            {lang === 'en' ? 'Get Report — ₹499' : 'ವರದಿ ಪಡೆಯಿರಿ — ₹499'}
          </button>
        </div>
      </div>
    </main>
  )
}
