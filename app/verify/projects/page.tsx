'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, CheckCircle, XCircle, AlertTriangle, MapPin } from 'lucide-react'
import { useVerify, T } from '../VerifyContext'
import projectsData from '@/data/verify-projects.json'

type Check = {
  pass: boolean
  label: string
  detail: string
  source: string
  severity?: string
}

type Project = {
  id: string
  name: string
  developer: string
  micro_market: string
  address: string
  type: string
  config_types: string[]
  rera_id: string | null
  trust_grade: 'A' | 'B' | 'C'
  trust_score: number
  verdict: string
  checks: { rera: Check; title: Check; court: Check; plan: Check; developer: Check }
  asking_price_min: number
  asking_price_max: number
  possession: string
  units_total: number
  units_sold: number
  tags: string[]
}

const PROJECTS: Project[] = projectsData.projects as Project[]

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'rgba(63,166,106,0.12)', text: '#3FA66A', border: 'rgba(63,166,106,0.3)' },
  B: { bg: 'rgba(201,168,76,0.12)', text: '#C9A84C', border: 'rgba(201,168,76,0.3)' },
  C: { bg: 'rgba(192,57,43,0.12)', text: '#C0392B', border: 'rgba(192,57,43,0.3)' },
}

const MARKETS = ['Whitefield', 'Devanahalli', 'Sarjapur', 'Hebbal', 'KR Puram', 'Mysuru']

export default function ProjectsPage() {
  const { lang } = useVerify()
  const t = T[lang]
  const [searchQ, setSearchQ] = useState('')
  const [gradeFilter, setGradeFilter] = useState<'all' | 'A' | 'B' | 'C'>('all')
  const [marketFilter, setMarketFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return PROJECTS.filter(p => {
      if (gradeFilter !== 'all' && p.trust_grade !== gradeFilter) return false
      if (marketFilter !== 'all' && p.micro_market !== marketFilter) return false
      if (searchQ.trim().length >= 2) {
        const q = searchQ.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.developer.toLowerCase().includes(q) && !p.micro_market.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [searchQ, gradeFilter, marketFilter])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>
      {/* Page header */}
      <div style={{
        padding: '1.25rem 0 1.25rem',
        borderBottom: '1px solid #2A2520',
        marginBottom: '2rem',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-mono, monospace)',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          color: '#4A4238',
          marginBottom: '0.5rem',
        }}>
          Vantis Verify · Karnataka · 2024
        </div>
        <h1 style={{
          fontFamily: 'var(--font-cg, serif)',
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 5vw, 44px)',
          color: '#F2EBDD',
          margin: 0,
          fontWeight: 300,
          lineHeight: 1.1,
        }}>
          {t.projects_title}
        </h1>
      </div>

      {/* Sub */}
      <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '17px', color: '#6B6258', margin: '0 0 2rem' }}>
        {t.projects_sub}
      </p>

      {/* Search + filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#4A4238', pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder={t.search_projects}
            style={{
              width: '100%',
              padding: '0.75rem 0.875rem 0.75rem 2.5rem',
              background: '#121110',
              border: '1px solid #2A2520',
              borderRadius: '6px',
              fontSize: '15px',
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              color: '#F2EBDD',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#C9A84C' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#2A2520' }}
          />
        </div>
      </div>

      {/* Grade filter */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['all', 'A', 'B', 'C'] as const).map(g => {
          const active = gradeFilter === g
          const gc = g !== 'all' ? GRADE_COLORS[g] : { bg: 'rgba(242,235,221,0.08)', text: '#F2EBDD', border: 'rgba(242,235,221,0.2)' }
          const labels: Record<string, string> = { all: t.filter_all, A: t.filter_A, B: t.filter_B, C: t.filter_C }
          return (
            <button
              key={g}
              onClick={() => setGradeFilter(g)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                border: `1px solid ${active ? gc.border : '#2A2520'}`,
                background: active ? gc.bg : 'transparent',
                color: active ? gc.text : '#6B6258',
                fontSize: '13px',
                fontFamily: 'var(--font-dm-sans, sans-serif)',
                cursor: 'pointer',
                transition: 'all 0.1s',
              }}
            >
              {labels[g]}
            </button>
          )
        })}
      </div>

      {/* Market filter */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setMarketFilter('all')}
          style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '100px',
            border: `1px solid ${marketFilter === 'all' ? '#C9A84C' : '#1E1A14'}`,
            background: marketFilter === 'all' ? 'rgba(201,168,76,0.1)' : 'transparent',
            color: marketFilter === 'all' ? '#C9A84C' : '#4A4238',
            fontSize: '12px',
            fontFamily: 'var(--font-dm-mono, monospace)',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          {t.market_all}
        </button>
        {MARKETS.map(m => (
          <button
            key={m}
            onClick={() => setMarketFilter(m)}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '100px',
              border: `1px solid ${marketFilter === m ? '#C9A84C' : '#1E1A14'}`,
              background: marketFilter === m ? 'rgba(201,168,76,0.1)' : 'transparent',
              color: marketFilter === m ? '#C9A84C' : '#4A4238',
              fontSize: '12px',
              fontFamily: 'var(--font-dm-mono, monospace)',
              cursor: 'pointer',
              letterSpacing: '0.06em',
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Count */}
      <p style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#4A4238', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
        {t.results_count(filtered.length)}
      </p>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {filtered.map((p, i) => {
          const gc = GRADE_COLORS[p.trust_grade]
          const checks = Object.values(p.checks)
          const passCount = checks.filter(c => c.pass).length

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              style={{
                background: '#0F0D0B',
                border: `1px solid ${p.trust_grade === 'C' ? 'rgba(192,57,43,0.2)' : '#1E1A14'}`,
                borderRadius: '10px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = gc.border }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = p.trust_grade === 'C' ? 'rgba(192,57,43,0.2)' : '#1E1A14' }}
            >
              {/* Card header */}
              <div style={{ padding: '1.25rem 1.25rem 1rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', marginBottom: '1rem' }}>
                  {/* Grade */}
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: gc.bg, border: `1.5px solid ${gc.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: 'var(--font-cg, serif)', fontSize: '22px', fontWeight: '600', color: gc.text }}>
                      {p.trust_grade}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', fontWeight: '600', color: '#F2EBDD', margin: '0 0 0.2rem', lineHeight: 1.3 }}>
                      {p.name}
                    </h3>
                    <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#6B6258' }}>
                      {p.developer}
                    </div>
                  </div>
                </div>

                {/* Location + config */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '12px', color: '#4A4238', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                    <MapPin style={{ width: '11px', height: '11px' }} />
                    {p.micro_market}
                  </span>
                  <span style={{ fontSize: '12px', color: '#2A2520' }}>·</span>
                  <span style={{ fontSize: '12px', color: '#4A4238', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                    {p.config_types.join(', ')}
                  </span>
                </div>

                {/* Verdict */}
                <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: gc.text, marginBottom: '1rem', fontStyle: 'italic' }}>
                  {p.verdict}
                </div>

                {/* 5-check dots */}
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem' }}>
                  {Object.values(p.checks).map((c, ci) => {
                    const dotColor = c.pass ? '#3FA66A' : c.severity === 'critical' ? '#C0392B' : '#C9A84C'
                    const DotIcon = c.pass ? CheckCircle : c.severity === 'critical' ? XCircle : AlertTriangle
                    return (
                      <DotIcon key={ci} style={{ width: '16px', height: '16px', color: dotColor }} />
                    )
                  })}
                  <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', marginLeft: '0.25rem', alignSelf: 'center' }}>
                    {passCount}/5 checks
                  </span>
                </div>

                {/* Price + possession */}
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#A89880', marginTop: '0.15rem' }}>
                      ₹{p.asking_price_min}–{p.asking_price_max} Cr
                    </div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Possession</div>
                    <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#A89880', marginTop: '0.15rem' }}>
                      {p.possession.length > 22 ? p.possession.slice(0, 22) + '…' : p.possession}
                    </div>
                  </div>
                </div>
              </div>

              {/* Units bar */}
              <div style={{ padding: '0 1.25rem 0.5rem' }}>
                <div style={{ height: '2px', background: '#1A1510', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.round((p.units_sold / p.units_total) * 100)}%`,
                    background: gc.text,
                    borderRadius: '2px',
                  }} />
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', marginTop: '0.25rem' }}>
                  {p.units_sold}/{p.units_total} {t.units_sold}
                </div>
              </div>

              {/* View report link */}
              <Link
                href={`/verify?id=${p.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1.25rem',
                  borderTop: '1px solid #1A1510',
                  textDecoration: 'none',
                  background: 'transparent',
                  transition: 'background 0.1s',
                  color: gc.text,
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = gc.bg }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >
                {t.view_report}
                <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#4A4238', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '16px' }}>
          No projects match your search. Try adjusting the filters.
        </div>
      )}
    </div>
  )
}
