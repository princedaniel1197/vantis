'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, XCircle, Search, ArrowRight, Shield, Scale, MapPin } from 'lucide-react'
import { useVerify, T } from './VerifyContext'
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
  micro_market_kn: string
  address: string
  type: string
  config_types: string[]
  rera_id: string | null
  survey_no: string
  trust_grade: 'A' | 'B' | 'C'
  trust_score: number
  verdict: string
  verdict_detail: string
  flag_reason?: string
  checks: { rera: Check; title: Check; court: Check; plan: Check; developer: Check }
  asking_price_min: number
  asking_price_max: number
  kaveri_price: number
  possession: string
  units_total: number
  units_sold: number
}

const PROJECTS: Project[] = projectsData.projects as Project[]

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  A: { bg: 'rgba(63,166,106,0.12)', text: '#3FA66A', border: 'rgba(63,166,106,0.3)', dot: '#3FA66A' },
  B: { bg: 'rgba(201,168,76,0.12)', text: '#C9A84C', border: 'rgba(201,168,76,0.3)', dot: '#C9A84C' },
  C: { bg: 'rgba(192,57,43,0.12)', text: '#C0392B', border: 'rgba(192,57,43,0.3)', dot: '#C0392B' },
}

const SOURCE_COLORS: Record<string, string> = {
  'K-RERA': '#3498DB',
  'Kaveri 2.0': '#9B59B6',
  'eCourts': '#E67E22',
  'BBMP/MUDA': '#27AE60',
  'Vantis': '#C9A84C',
}

type State = 'idle' | 'loading' | 'result' | 'no_result'

const LOADING_STEPS = ['loading_1', 'loading_2', 'loading_3', 'loading_4'] as const

function searchProjects(query: string): Project[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return PROJECTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.developer.toLowerCase().includes(q) ||
    (p.rera_id && p.rera_id.toLowerCase().includes(q)) ||
    p.micro_market.toLowerCase().includes(q) ||
    p.survey_no.toLowerCase().includes(q)
  )
}

export default function VerifyPage() {
  const { lang } = useVerify()
  const t = T[lang]
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Project[]>([])
  const [state, setState] = useState<State>('idle')
  const [loadStep, setLoadStep] = useState(0)
  const [result, setResult] = useState<Project | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Check URL params on mount for direct links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id) {
      const project = PROJECTS.find(p => p.id === id)
      if (project) {
        setQuery(project.name)
        triggerSearch(project)
      }
    }
  }, [])

  // Update suggestions as user types
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    const results = searchProjects(query)
    setSuggestions(results.slice(0, 5))
    setShowDropdown(results.length > 0)
  }, [query])

  function triggerSearch(project: Project) {
    setShowDropdown(false)
    setState('loading')
    setLoadStep(0)

    const steps = [0, 1, 2, 3]
    steps.forEach(i => {
      setTimeout(() => setLoadStep(i), i * 150)
    })

    setTimeout(() => {
      setResult(project)
      setState('result')
    }, 700)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const matches = searchProjects(query)
    if (matches.length === 0) {
      setState('no_result')
      return
    }
    triggerSearch(matches[0])
  }

  function handleReset() {
    setQuery('')
    setResult(null)
    setState('idle')
    setSuggestions([])
    setShowDropdown(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const gc = result ? GRADE_COLORS[result.trust_grade] : GRADE_COLORS.A

  return (
    <div>
      {/* Page header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #2A2520',
      }}>
        <div style={{
          fontFamily: 'var(--font-dm-mono, monospace)',
          fontSize: '9px',
          textTransform: 'uppercase',
          letterSpacing: '0.28em',
          color: '#4A4238',
          marginBottom: '0.5rem',
        }}>
          Vantis Verify · Property Trust Check · Karnataka
        </div>
        <h1 style={{
          fontFamily: 'var(--font-syne, var(--font-dm-sans, sans-serif))',
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 700,
          color: '#F2EBDD',
          margin: 0,
          lineHeight: 1,
        }}>
          Trust Report
        </h1>
      </div>

      {/* Hero */}
      <section style={{ paddingTop: '5rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 1rem',
            borderRadius: '100px',
            border: '1px solid #2A2520',
            marginBottom: '2rem',
            background: 'rgba(201,168,76,0.06)',
          }}>
            <Shield style={{ width: '12px', height: '12px', color: '#C9A84C' }} />
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', letterSpacing: '0.16em', color: '#C9A84C', textTransform: 'uppercase' }}>
              {t.for_buyers}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-cg, serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(42px, 7vw, 72px)',
            lineHeight: 1.1,
            color: '#F2EBDD',
            margin: '0 0 1.25rem 0',
            fontWeight: 300,
          }}>
            {t.tagline}
          </h1>

          {/* Sub */}
          <p style={{
            fontFamily: 'var(--font-dm-sans, sans-serif)',
            fontSize: '18px',
            lineHeight: 1.6,
            color: '#7A6E62',
            margin: '0 0 3rem 0',
            maxWidth: '540px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            {t.sub}
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: '#4A4238',
                  pointerEvents: 'none',
                }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={e => { if (suggestions.length > 0) setShowDropdown(true); e.currentTarget.style.borderColor = '#C9A84C' }}
                  onBlur={e => { setTimeout(() => setShowDropdown(false), 150); e.currentTarget.style.borderColor = '#2A2520' }}
                  placeholder={t.placeholder}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 2.75rem',
                    background: '#121110',
                    border: '1px solid #2A2520',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    color: '#F2EBDD',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showDropdown && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '4px',
                        background: '#1A1510',
                        border: '1px solid #2A2520',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        zIndex: 100,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                      }}
                    >
                      {suggestions.map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={() => { setQuery(s.name); triggerSearch(s) }}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.875rem',
                            padding: '0.875rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #1E1A14',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.08s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#201C16' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          {/* Grade badge */}
                          <span style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: GRADE_COLORS[s.trust_grade].bg,
                            border: `1px solid ${GRADE_COLORS[s.trust_grade].border}`,
                            color: GRADE_COLORS[s.trust_grade].text,
                            fontSize: '11px',
                            fontFamily: 'var(--font-dm-mono, monospace)',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {s.trust_grade}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', color: '#F2EBDD', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>
                              {s.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B6258', fontFamily: 'var(--font-dm-sans, sans-serif)', marginTop: '2px' }}>
                              {s.developer} · {s.micro_market}
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                style={{
                  padding: '1rem 1.5rem',
                  background: '#C9A84C',
                  color: '#0A0A0A',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-dm-sans, sans-serif)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#E8CE7E' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C9A84C' }}
              >
                {t.btn_search}
              </button>
            </form>

            {/* Example chips */}
            {state === 'idle' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#4A4238' }}>
                  {t.try_label}
                </span>
                {[
                  { label: 'Divya Villas', id: 'divya-villas' },
                  { label: 'Ozone Urbana', id: 'ozone-urbana' },
                  { label: 'Brigade Parkside', id: 'brigade-parkside' },
                  { label: 'Green Valley Homes', id: 'green-valley-homes' },
                ].map(chip => {
                  const proj = PROJECTS.find(p => p.id === chip.id)!
                  const gc2 = GRADE_COLORS[proj.trust_grade]
                  return (
                    <button
                      key={chip.id}
                      onClick={() => { setQuery(chip.label); triggerSearch(proj) }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '100px',
                        border: `1px solid ${gc2.border}`,
                        background: gc2.bg,
                        color: gc2.text,
                        fontSize: '13px',
                        fontFamily: 'var(--font-dm-sans, sans-serif)',
                        cursor: 'pointer',
                        transition: 'opacity 0.1s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                    >
                      {chip.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Loading state */}
      <AnimatePresence>
        {state === 'loading' && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1.5rem 4rem' }}
          >
            <div style={{
              background: '#121110',
              border: '1px solid #2A2520',
              borderRadius: '12px',
              padding: '2.5rem',
            }}>
              <p style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#C9A84C', letterSpacing: '0.14em', textTransform: 'uppercase', margin: '0 0 1.5rem 0' }}>
                Running 5-point government check on &ldquo;{query}&rdquo;
              </p>
              {LOADING_STEPS.map((key, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: loadStep >= i ? 1 : 0.2, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0',
                    borderBottom: i < 3 ? '1px solid #1A1510' : 'none',
                  }}
                >
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: loadStep > i ? '#3FA66A' : loadStep === i ? '#C9A84C' : '#2A2520',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                  }} />
                  <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: loadStep >= i ? '#F2EBDD' : '#3A3028' }}>
                    {t[key]}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* No result */}
      <AnimatePresence>
        {state === 'no_result' && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: '600px', margin: '0 auto', padding: '0 1.5rem 4rem', textAlign: 'center' }}
          >
            <div style={{ background: '#121110', border: '1px solid #2A2520', borderRadius: '12px', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '18px', color: '#F2EBDD', margin: '0 0 0.5rem' }}>
                {t.no_result}
              </h3>
              <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#6B6258', margin: '0 0 1.5rem' }}>
                {t.no_result_sub}
              </p>
              <button onClick={handleReset} style={{ padding: '0.75rem 1.5rem', background: '#C9A84C', color: '#0A0A0A', border: 'none', borderRadius: '6px', fontSize: '15px', fontFamily: 'var(--font-dm-sans, sans-serif)', fontWeight: '600', cursor: 'pointer' }}>
                {t.check_another}
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Trust Report result */}
      <AnimatePresence>
        {state === 'result' && result && (
          <motion.section
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem 6rem' }}
          >
            {/* Trust Report Card */}
            <div style={{
              background: '#0F0D0B',
              border: `1px solid ${gc.border}`,
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '2rem 2rem 1.5rem',
                borderBottom: '1px solid #1A1510',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}>
                {/* Grade circle */}
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: gc.bg,
                  border: `2px solid ${gc.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'var(--font-cg, serif)', fontSize: '36px', fontWeight: '600', color: gc.text, lineHeight: 1 }}>
                    {result.trust_grade}
                  </span>
                </div>

                {/* Verdict */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.16em', color: '#6B6258', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                    {t.grade_label} · {result.name}
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-cg, serif)',
                    fontStyle: 'italic',
                    fontSize: '30px',
                    color: gc.text,
                    margin: '0 0 0.375rem',
                    fontWeight: 400,
                  }}>
                    {result.trust_grade === 'A' ? t.grade_A_verdict : result.trust_grade === 'B' ? t.grade_B_verdict : t.grade_C_verdict}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#7A6E62', margin: 0 }}>
                    {result.trust_grade === 'A' ? t.grade_A_sub : result.trust_grade === 'B' ? t.grade_B_sub : t.grade_C_sub}
                  </p>
                </div>

                {/* Trust score */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Trust Score
                  </div>
                  <div style={{ fontFamily: 'var(--font-cg, serif)', fontSize: '40px', color: gc.text, lineHeight: 1.1 }}>
                    {result.trust_score}
                  </div>
                  <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238' }}>
                    / 100
                  </div>
                </div>
              </div>

              {/* Caution banner for grade C */}
              {result.trust_grade === 'C' && result.flag_reason && (
                <div style={{
                  background: 'rgba(192,57,43,0.12)',
                  borderBottom: '1px solid rgba(192,57,43,0.3)',
                  padding: '1rem 2rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                }}>
                  <AlertTriangle style={{ width: '18px', height: '18px', color: '#C0392B', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#C0392B', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      {t.caution_title}
                    </div>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#E57373', margin: 0, lineHeight: 1.5 }}>
                      {result.flag_reason}
                    </p>
                    <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#9A4A42', margin: '0.5rem 0 0' }}>
                      {t.caution_legal}
                    </p>
                  </div>
                </div>
              )}

              {/* 5 Checks */}
              <div style={{ padding: '1rem 0' }}>
                {Object.entries(result.checks).map(([key, check], i) => {
                  const CheckIcon = check.pass
                    ? CheckCircle
                    : check.severity === 'critical' ? XCircle : AlertTriangle
                  const iconColor = check.pass
                    ? '#3FA66A'
                    : check.severity === 'critical' ? '#C0392B' : '#C9A84C'
                  const srcColor = SOURCE_COLORS[check.source] || '#6B6258'

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.1 + i * 0.07 }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        padding: '1.25rem 2rem',
                        borderBottom: i < 4 ? '1px solid #1A1510' : 'none',
                        background: !check.pass && check.severity === 'critical' ? 'rgba(192,57,43,0.04)' : 'transparent',
                      }}
                    >
                      <CheckIcon style={{ width: '22px', height: '22px', color: iconColor, flexShrink: 0, marginTop: '1px' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'var(--font-dm-sans, sans-serif)',
                          fontSize: '16px',
                          fontWeight: '500',
                          color: check.pass ? '#F2EBDD' : iconColor,
                          marginBottom: '0.25rem',
                        }}>
                          {check.label}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-dm-sans, sans-serif)',
                          fontSize: '14px',
                          color: '#7A6E62',
                          lineHeight: 1.5,
                        }}>
                          {check.detail}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '100px',
                        background: `${srcColor}1A`,
                        color: srcColor,
                        fontSize: '10px',
                        fontFamily: 'var(--font-dm-mono, monospace)',
                        letterSpacing: '0.06em',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {check.source}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Property meta */}
              <div style={{
                padding: '1.25rem 2rem',
                borderTop: '1px solid #1A1510',
                background: '#0C0B09',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}>
                {[
                  { label: 'Developer', value: result.developer },
                  { label: 'Location', value: result.micro_market },
                  { label: 'Asking Price', value: `₹${result.asking_price_min}–${result.asking_price_max} Cr` },
                  { label: 'Kaveri Price', value: `₹${result.kaveri_price} Cr avg` },
                  { label: 'Possession', value: result.possession },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.2rem' }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#A89880' }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap',
                borderTop: '1px solid #1A1510',
              }}>
                <Link
                  href={`/verify/full?id=${result.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.875rem 1.5rem',
                    background: '#C9A84C',
                    color: '#0A0A0A',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '15px',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontWeight: '600',
                  }}
                >
                  {t.get_full_check} · {t.full_check_price}
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </Link>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#4A4238' }}>
                    {t.full_check_sub}
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  style={{ background: 'none', border: 'none', color: '#6B6258', fontSize: '14px', fontFamily: 'var(--font-dm-sans, sans-serif)', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                >
                  {t.check_another}
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How it works — shown only in idle state */}
      {state === 'idle' && (
        <section style={{ padding: '4rem 1.5rem 6rem', maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-dm-mono, monospace)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#4A4238',
            textAlign: 'center',
            margin: '0 0 3rem',
          }}>
            {t.how_title}
          </h2>

          {/* 3-step how it works */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '5rem' }}>
            {[
              { num: '01', title: t.how_1_title, sub: t.how_1_sub, icon: Search },
              { num: '02', title: t.how_2_title, sub: t.how_2_sub, icon: Shield },
              { num: '03', title: t.how_3_title, sub: t.how_3_sub, icon: CheckCircle },
            ].map(step => (
              <div key={step.num} style={{
                padding: '2rem',
                background: '#0F0D0B',
                border: '1px solid #1E1A14',
                borderRadius: '8px',
              }}>
                <div style={{ fontFamily: 'var(--font-cg, serif)', fontSize: '32px', color: '#2A2520', marginBottom: '1rem', fontWeight: 300 }}>
                  {step.num}
                </div>
                <step.icon style={{ width: '24px', height: '24px', color: '#C9A84C', marginBottom: '1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '18px', color: '#F2EBDD', margin: '0 0 0.5rem', fontWeight: '500' }}>
                  {step.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#6B6258', margin: 0, lineHeight: 1.6 }}>
                  {step.sub}
                </p>
              </div>
            ))}
          </div>

          {/* 5 data sources */}
          <h2 style={{
            fontFamily: 'var(--font-dm-mono, monospace)',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#4A4238',
            textAlign: 'center',
            margin: '0 0 2rem',
          }}>
            5 Government databases, checked every time
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {[
              { name: 'K-RERA', desc: 'Project & developer registration', color: '#3498DB' },
              { name: 'Kaveri 2.0', desc: 'Land title & encumbrance', color: '#9B59B6' },
              { name: 'eCourts', desc: 'Active & past litigation', color: '#E67E22' },
              { name: 'BBMP / MUDA', desc: 'Building plan approval', color: '#27AE60' },
              { name: 'Bhoomi', desc: 'Land records & ownership', color: '#C9A84C' },
            ].map(src => (
              <div key={src.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.625rem 1rem',
                background: '#0F0D0B',
                border: '1px solid #1E1A14',
                borderRadius: '100px',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: src.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#F2EBDD' }}>{src.name}</span>
                <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#4A4238' }}>·</span>
                <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#4A4238' }}>{src.desc}</span>
              </div>
            ))}
          </div>

          {/* Links to other sections */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
            <Link href="/verify/projects" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: '1px solid #2A2520',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '15px',
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              color: '#A89880',
              transition: 'border-color 0.1s',
            }}>
              <MapPin style={{ width: '16px', height: '16px' }} />
              Browse all 30 verified projects
            </Link>
            <Link href="/verify/full" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: '1px solid #2A2520',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '15px',
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              color: '#A89880',
            }}>
              <Scale style={{ width: '16px', height: '16px' }} />
              Pre-purchase full check (₹499)
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
