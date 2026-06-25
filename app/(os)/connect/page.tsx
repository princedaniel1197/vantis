'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, AlertTriangle, CheckCircle, XCircle, Shield,
  Building2, ChevronRight, TrendingDown, Loader2, Info,
} from 'lucide-react'
import { useConnect, T } from './ConnectContext'
import propertiesData from '@/data/connect-properties.json'

interface Property {
  id: string
  name: string
  developer: string
  micro_market: string
  micro_market_kn: string
  address: string
  config: string
  area_sqft: number
  asking_price_cr: number
  kaveri_price_cr: number
  kaveri_date: string
  possession: string
  rera_id: string | null
  rera_valid: boolean
  title_status: string
  survey_no: string
  kaveri_ec: string
  ecourts_status: string
  litigation: boolean
  litigation_detail: string | null
  encumbrance: boolean
  flagged: boolean
  flag_reason: string | null
  price_psf: number
  tags: string[]
  amenities: string[]
  match_weight: number
}

interface ScoredProperty extends Property {
  score: number
  match_reasons: string[]
}

const PROPERTIES = propertiesData as Property[]

function parsePrice(q: string): number | null {
  const crMatch = q.match(/(?:under|below|within|≤|<|ಒಳಗೆ|ಒಳಗೇ)\s*[₹]?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|ಕೋಟಿ)/i)
  if (crMatch) return parseFloat(crMatch[1])
  const lakhMatch = q.match(/(?:under|below|within)\s*[₹]?\s*(\d+)\s*(?:l\b|lakh|lakhs)/i)
  if (lakhMatch) return parseFloat(lakhMatch[1]) / 100
  const crPlain = q.match(/[₹]\s*(\d+(?:\.\d+)?)\s*(?:cr|crore)/i)
  if (crPlain) return parseFloat(crPlain[1])
  return null
}

const LOCATION_MAP: Record<string, string> = {
  whitefield: 'whitefield',
  'ವೈಟ್‌ಫೀಲ್ಡ್': 'whitefield',
  devanahalli: 'devanahalli',
  'ದೇವನಹಳ್ಳಿ': 'devanahalli',
  sarjapur: 'sarjapur',
  'ಸರ್ಜಾಪುರ': 'sarjapur',
  hebbal: 'hebbal',
  'ಹೆಬ್ಬಾಳ': 'hebbal',
  'kr puram': 'kr_puram',
  'ಕೆ.ಆರ್. ಪುರಂ': 'kr_puram',
  mysuru: 'mysuru',
  'ಮೈಸೂರು': 'mysuru',
  mysore: 'mysuru',
}

function matchProperties(query: string): ScoredProperty[] {
  const q = query.toLowerCase()

  const bhkMatch = q.match(/(\d)\s*[-\s]?bhk/)
  const wantsBHK = bhkMatch ? bhkMatch[1] : null

  let wantsArea: string | null = null
  for (const [key, val] of Object.entries(LOCATION_MAP)) {
    if (q.includes(key.toLowerCase())) {
      wantsArea = val
      break
    }
  }

  const maxPrice = parsePrice(query)

  const wantsReady =
    q.includes('ready') || q.includes('ತಕ್ಷಣ') || q.includes('immediate') || q.includes('move-in')
  const wantsClean =
    q.includes('clean title') || q.includes('clear title') || q.includes('ಶುದ್ಧ ಪಟ್ಟ')
  const wantsRERA = q.includes('rera') || q.includes('ನೋಂದಣಿ')

  const scored: ScoredProperty[] = []

  for (const p of PROPERTIES) {
    let score = 0
    const match_reasons: string[] = []

    if (wantsBHK && p.config.toLowerCase().includes(wantsBHK + 'bhk')) {
      score += 30
      match_reasons.push(`${p.config} match`)
    }

    if (wantsArea) {
      const mm = p.micro_market.toLowerCase().replace(/ /g, '_')
      if (mm.includes(wantsArea) || p.tags.includes(wantsArea)) {
        score += 35
        match_reasons.push('Location match')
      }
    }

    if (maxPrice !== null && p.asking_price_cr <= maxPrice) {
      score += 20
      match_reasons.push('Within budget')
    }

    if (wantsReady && p.possession === 'ready') {
      score += 15
      match_reasons.push('Ready possession')
    }

    if (wantsClean && p.title_status === 'clean') {
      score += 10
      match_reasons.push('Clean title')
    }

    if (wantsRERA && p.rera_valid) {
      score += 5
      match_reasons.push('RERA registered')
    }

    if (score > 0 && p.rera_valid) score += 3

    if (score > 0) {
      scored.push({ ...p, score: Math.min(score, 100), match_reasons })
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 8)
}

function Badge({
  ok,
  label,
  flagLabel,
}: {
  ok: boolean
  label: string
  flagLabel: string
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.2rem 0.5rem',
      borderRadius: '2px',
      background: ok ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.1)',
      border: `1px solid ${ok ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.25)'}`,
    }}>
      {ok
        ? <CheckCircle style={{ width: '10px', height: '10px', color: '#2ECC71', flexShrink: 0 }} />
        : <XCircle style={{ width: '10px', height: '10px', color: '#E74C3C', flexShrink: 0 }} />}
      <span style={{
        fontFamily: 'var(--font-dm-mono, monospace)',
        fontSize: '9px',
        letterSpacing: '0.08em',
        color: ok ? '#2ECC71' : '#E74C3C',
      }}>
        {ok ? label : flagLabel}
      </span>
    </div>
  )
}

function PropertyCard({ p, t, index }: { p: ScoredProperty; t: typeof T['en']; index: number }) {
  const isCaution = p.flagged
  const scoreColor =
    p.score >= 70 ? '#2ECC71' : p.score >= 40 ? '#F39C12' : '#6B6B88'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      style={{
        background: isCaution ? 'rgba(231,76,60,0.04)' : '#0F0F1A',
        border: `1px solid ${isCaution ? 'rgba(231,76,60,0.3)' : '#1E1E2E'}`,
        borderRadius: '2px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Caution banner */}
      {isCaution && (
        <div style={{
          background: 'rgba(231,76,60,0.12)',
          borderBottom: '1px solid rgba(231,76,60,0.25)',
          padding: '0.5rem 0.875rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
        }}>
          <AlertTriangle style={{ width: '13px', height: '13px', color: '#E74C3C', flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.12em', color: '#E74C3C', textTransform: 'uppercase' }}>
              {t.caution_banner}
            </div>
            <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#8A3028', marginTop: '2px', lineHeight: 1.4 }}>
              {p.flag_reason}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-cg, serif)',
              fontStyle: 'italic',
              fontSize: '18px',
              color: isCaution ? '#E08070' : '#F0EEE8',
              lineHeight: 1.2,
              marginBottom: '2px',
            }}>
              {p.name}
            </div>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4A62' }}>
              {p.developer}
            </div>
          </div>
          {/* Match score */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '0.375rem 0.625rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '2px',
            border: `1px solid ${scoreColor}22`,
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '18px', fontWeight: 600, color: scoreColor, lineHeight: 1 }}>
              {p.score}
            </div>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '8px', letterSpacing: '0.12em', color: '#4A4A62', textTransform: 'uppercase' }}>
              {t.match_score}
            </div>
          </div>
        </div>

        {/* Location + config strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#C9A84C', background: 'rgba(201,168,76,0.08)', padding: '2px 6px', borderRadius: '2px' }}>
            {p.config}
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4A62' }}>
            {p.micro_market}
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#3A3A52' }}>·</span>
          <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4A62' }}>
            {p.area_sqft.toLocaleString()} sqft
          </span>
          <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#3A3A52' }}>·</span>
          <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: p.possession === 'ready' ? '#2ECC71' : '#F39C12' }}>
            {p.possession === 'ready' ? t.ready : t.uc}
          </span>
        </div>

        {/* Price comparison */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
        }}>
          <div style={{
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '2px',
            padding: '0.5rem 0.625rem',
          }}>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '4px' }}>
              {t.kaveri_price} · {p.kaveri_date}
            </div>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '16px', color: '#C9A84C', lineHeight: 1 }}>
              ₹{p.kaveri_price_cr.toFixed(2)} Cr
            </div>
          </div>
          <div style={{
            background: '#0A0A0F',
            border: '1px solid #1E1E2E',
            borderRadius: '2px',
            padding: '0.5rem 0.625rem',
          }}>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A4A62', marginBottom: '4px' }}>
              {t.asking}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '16px', color: '#6B6B88', lineHeight: 1 }}>
                ₹{p.asking_price_cr.toFixed(2)} Cr
              </div>
              <TrendingDown style={{ width: '10px', height: '10px', color: '#3A3A52' }} />
            </div>
          </div>
        </div>

        {/* Government verification badges */}
        <div>
          <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#3A3A52', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Shield style={{ width: '9px', height: '9px' }} />
            {t.verified}
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            <Badge
              ok={p.rera_valid}
              label={t.rera_valid}
              flagLabel={t.rera_invalid}
            />
            <Badge
              ok={p.title_status === 'clean'}
              label={t.title_clean}
              flagLabel={p.title_status === 'encumbrance' ? t.encumbrance : t.title_litig}
            />
            <Badge
              ok={!p.litigation}
              label={t.no_litigation}
              flagLabel={t.litigation}
            />
          </div>
        </div>

        {/* Survey number */}
        <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#2A2A3E', marginTop: 'auto', paddingTop: '0.25rem', borderTop: '1px solid #141420' }}>
          {p.survey_no}
        </div>
      </div>
    </motion.div>
  )
}

export default function ConnectMatchPage() {
  const { lang } = useConnect()
  const t = T[lang]
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ScoredProperty[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleMatch() {
    if (!query.trim()) return
    setIsMatching(true)
    setHasSearched(false)
    setTimeout(() => {
      setResults(matchProperties(query))
      setHasSearched(true)
      setIsMatching(false)
    }, 900)
  }

  function handleExample(ex: string) {
    setQuery(ex)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleClear() {
    setQuery('')
    setResults([])
    setHasSearched(false)
    inputRef.current?.focus()
  }

  const examples = [t.ex1, t.ex2, t.ex3, t.ex4]

  const flaggedResults = results.filter(r => r.flagged)
  const cleanResults = results.filter(r => !r.flagged)

  return (
    <div style={{ minHeight: 'calc(100vh - 100px)', background: '#0A0A0F' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Hero section */}
        <div style={{ maxWidth: '720px', marginBottom: '2.5rem' }}>
          <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.875rem' }}>
            AI Buyer-Property Matching · K-RERA + Kaveri + eCourts
          </div>
          <h1 style={{
            fontFamily: 'var(--font-cg, serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(28px, 4vw, 44px)',
            lineHeight: 1.15,
            color: '#F0EEE8',
            marginBottom: '1rem',
          }}>
            {t.hero_title}
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', lineHeight: 1.65, color: '#5A5A72' }}>
            {t.hero_sub}
          </p>
        </div>

        {/* Input area */}
        <div style={{
          background: '#0F0F1A',
          border: '1px solid #1E1E2E',
          borderRadius: '2px',
          padding: '1.25rem',
          marginBottom: '1rem',
          maxWidth: '900px',
        }}>
          <textarea
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleMatch() } }}
            placeholder={t.placeholder}
            rows={2}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              fontSize: '15px',
              lineHeight: 1.6,
              color: '#E8E4DC',
              resize: 'none',
              caretColor: '#C9A84C',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid #1A1A2A' }}>
            {/* Example chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
              <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A3A52' }}>
                {t.example_label}:
              </span>
              {examples.slice(0, 3).map((ex, i) => (
                <button
                  key={i}
                  onClick={() => handleExample(ex)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '2px',
                    border: '1px solid #1E1E2E',
                    background: 'transparent',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '11px',
                    color: '#4A4A62',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    maxWidth: '200px',
                    textOverflow: 'ellipsis',
                    transition: 'border-color 0.1s, color 0.1s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#C9A84C44'
                    e.currentTarget.style.color = '#8B8B6A'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#1E1E2E'
                    e.currentTarget.style.color = '#4A4A62'
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
              {query && (
                <button
                  onClick={handleClear}
                  style={{
                    padding: '0.5rem 0.875rem',
                    borderRadius: '2px',
                    border: '1px solid #1E1E2E',
                    background: 'transparent',
                    fontFamily: 'var(--font-dm-mono, monospace)',
                    fontSize: '11px',
                    color: '#4A4A62',
                    cursor: 'pointer',
                  }}
                >
                  {t.btn_clear}
                </button>
              )}
              <button
                onClick={handleMatch}
                disabled={!query.trim() || isMatching}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '2px',
                  border: '1px solid rgba(201,168,76,0.4)',
                  background: query.trim() ? 'rgba(201,168,76,0.12)' : 'transparent',
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  fontSize: '12px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: query.trim() ? '#C9A84C' : '#3A3A52',
                  cursor: query.trim() ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}
              >
                {isMatching
                  ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                  : <Search style={{ width: '13px', height: '13px' }} />}
                {t.btn_match}
              </button>
            </div>
          </div>
        </div>

        {/* Matching indicator */}
        <AnimatePresence>
          {isMatching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.12)', borderRadius: '2px', maxWidth: '900px' }}
            >
              <Loader2 style={{ width: '14px', height: '14px', color: '#C9A84C', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#C9A84C' }}>
                Checking K-RERA · Kaveri 2.0 · eCourts · Bhoomi…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {results.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#3A3A52' }}>
                  <Building2 style={{ width: '32px', height: '32px', margin: '0 auto 1rem', opacity: 0.4 }} />
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', marginBottom: '0.5rem' }}>{t.no_results}</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#2A2A3E' }}>{t.no_results_sub}</div>
                </div>
              ) : (
                <>
                  {/* Results header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A4A62' }}>
                      {t.results_header(results.length)}
                    </div>
                    {flaggedResults.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '4px 10px', borderRadius: '2px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)' }}>
                        <AlertTriangle style={{ width: '11px', height: '11px', color: '#E74C3C' }} />
                        <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#E74C3C' }}>
                          {flaggedResults.length} flagged
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Flagged properties first if any — caution moment */}
                  {flaggedResults.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8A3028', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <AlertTriangle style={{ width: '10px', height: '10px' }} />
                        Vantis Caution — review carefully
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.875rem' }}>
                        {flaggedResults.map((p, i) => (
                          <PropertyCard key={p.id} p={p} t={t} index={i} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean matches */}
                  {cleanResults.length > 0 && (
                    <div>
                      {flaggedResults.length > 0 && (
                        <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#2ECC71', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <CheckCircle style={{ width: '10px', height: '10px' }} />
                          Verified clean — safe to present
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.875rem' }}>
                        {cleanResults.map((p, i) => (
                          <PropertyCard key={p.id} p={p} t={t} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state — before first search */}
        {!hasSearched && !isMatching && (
          <div style={{ marginTop: '3rem', padding: '2.5rem', border: '1px solid #141420', borderRadius: '2px', maxWidth: '900px', background: 'rgba(201,168,76,0.02)' }}>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Info style={{ width: '10px', height: '10px' }} />
              Government sources powering every match
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
              {[
                { src: 'K-RERA Portal', detail: 'RERA ID · expiry · penalties' },
                { src: 'Kaveri 2.0', detail: 'Registered sale price · EC · title chain' },
                { src: 'eCourts', detail: 'Active litigation · injunctions' },
                { src: 'Bhoomi', detail: 'Land record · survey boundaries' },
              ].map(s => (
                <div key={s.src} style={{ padding: '0.75rem', background: '#0A0A0F', border: '1px solid #1A1A2A', borderRadius: '2px' }}>
                  <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#C9A84C', marginBottom: '3px' }}>{s.src}</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '11px', color: '#3A3A52' }}>{s.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
