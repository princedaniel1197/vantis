'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ArrowLeft, Landmark, Scale, User, FileText } from 'lucide-react'
import { useVerify, T } from '../VerifyContext'
import projectsData from '@/data/verify-projects.json'

type Check = {
  pass: boolean
  label: string
  detail: string
  source: string
  severity?: string
}

type TitleEntry = {
  date: string
  type: string
  from: string
  to: string
  value_lakh: number
  doc_no: string
  note?: string
}

type LitigationCase = {
  case_no: string
  court: string
  type: string
  status: string
  next_hearing: string | null
  plaintiff: string
  detail?: string
}

type DevProject = {
  name: string
  location: string
  status: string
  year: number | null
  units: number
  delay_months: number
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
  rera_expiry: string | null
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
  title_chain: TitleEntry[]
  litigation_cases: LitigationCase[]
  developer_projects: DevProject[]
  plan_details?: {
    authority: string
    plan_no: string
    sanctioned_area_sqft: number
    fsi: number
    sanction_date: string
    validity: string
  }
}

const PROJECTS: Project[] = projectsData.projects as Project[]

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'rgba(63,166,106,0.12)', text: '#3FA66A', border: 'rgba(63,166,106,0.3)' },
  B: { bg: 'rgba(201,168,76,0.12)', text: '#C9A84C', border: 'rgba(201,168,76,0.3)' },
  C: { bg: 'rgba(192,57,43,0.12)', text: '#C0392B', border: 'rgba(192,57,43,0.3)' },
}

const SOURCE_COLORS: Record<string, string> = {
  'K-RERA': '#3498DB',
  'Kaveri 2.0': '#9B59B6',
  'eCourts': '#E67E22',
  'BBMP/MUDA': '#27AE60',
  'Vantis': '#C9A84C',
}

function SectionHeader({ icon: Icon, label }: { icon: React.ComponentType<{ style?: React.CSSProperties }>; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.5rem' }}>
      <Icon style={{ width: '16px', height: '16px', color: '#C9A84C' }} />
      <h3 style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A84C', margin: 0 }}>
        {label}
      </h3>
    </div>
  )
}

export default function FullCheckPage() {
  const { lang } = useVerify()
  const t = T[lang]
  const [selectedId, setSelectedId] = useState<string>('divya-villas')
  const [selectorOpen, setSelectorOpen] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    if (id && PROJECTS.find(p => p.id === id)) {
      setSelectedId(id)
    }
  }, [])

  const project = PROJECTS.find(p => p.id === selectedId) ?? PROJECTS[0]
  const gc = GRADE_COLORS[project.trust_grade]

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      {/* Back */}
      <Link href="/verify" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none', color: '#6B6258', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', marginBottom: '2rem' }}>
        <ArrowLeft style={{ width: '14px', height: '14px' }} />
        {t.nav_trust}
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{
            display: 'inline-block',
            padding: '0.25rem 0.875rem',
            borderRadius: '100px',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            fontFamily: 'var(--font-dm-mono, monospace)',
            fontSize: '10px',
            color: '#C9A84C',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}>
            {t.full_premium_badge}
          </div>
          <h1 style={{ fontFamily: 'var(--font-cg, serif)', fontStyle: 'italic', fontSize: '36px', color: '#F2EBDD', margin: '0 0 0.5rem', fontWeight: 300 }}>
            {t.full_title}
          </h1>
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '16px', color: '#6B6258', margin: 0 }}>
            {t.full_sub}
          </p>
        </div>

        {/* Property selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setSelectorOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              background: '#121110',
              border: '1px solid #2A2520',
              borderRadius: '6px',
              color: '#F2EBDD',
              fontSize: '14px',
              fontFamily: 'var(--font-dm-sans, sans-serif)',
              cursor: 'pointer',
              minWidth: '220px',
            }}
          >
            <span style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: gc.bg, border: `1px solid ${gc.border}`,
              color: gc.text, fontSize: '11px', fontFamily: 'var(--font-dm-mono, monospace)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {project.trust_grade}
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: '13px' }}>{project.name}</span>
            <ChevronDown style={{ width: '14px', height: '14px', color: '#4A4238', transform: selectorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>

          {selectorOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: '#1A1510',
              border: '1px solid #2A2520',
              borderRadius: '6px',
              overflow: 'hidden',
              zIndex: 50,
              width: '280px',
              maxHeight: '320px',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}>
              {PROJECTS.map(p => {
                const pgc = GRADE_COLORS[p.trust_grade]
                return (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedId(p.id); setSelectorOpen(false) }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: p.id === selectedId ? '#201C16' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #1A1510',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.08s',
                    }}
                    onMouseEnter={e => { if (p.id !== selectedId) e.currentTarget.style.background = '#1A1510' }}
                    onMouseLeave={e => { if (p.id !== selectedId) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: pgc.bg, border: `1px solid ${pgc.border}`,
                      color: pgc.text, fontSize: '10px', fontFamily: 'var(--font-dm-mono, monospace)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {p.trust_grade}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', color: '#F2EBDD', fontFamily: 'var(--font-dm-sans, sans-serif)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#6B6258', fontFamily: 'var(--font-dm-sans, sans-serif)' }}>{p.micro_market}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trust Summary */}
      <div style={{ background: '#0F0D0B', border: `1px solid ${gc.border}`, borderRadius: '10px', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <SectionHeader icon={CheckCircle} label={t.section_summary} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: gc.bg, border: `2px solid ${gc.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-cg, serif)', fontSize: '28px', fontWeight: '600', color: gc.text }}>{project.trust_grade}</span>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-cg, serif)', fontStyle: 'italic', fontSize: '22px', color: gc.text, marginBottom: '0.2rem' }}>
              {project.trust_grade === 'A' ? t.grade_A_verdict : project.trust_grade === 'B' ? t.grade_B_verdict : t.grade_C_verdict}
            </div>
            <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#6B6258' }}>
              {project.verdict_detail}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(project.checks).map(([key, check]) => {
            const CheckIcon = check.pass ? CheckCircle : check.severity === 'critical' ? XCircle : AlertTriangle
            const iconColor = check.pass ? '#3FA66A' : check.severity === 'critical' ? '#C0392B' : '#C9A84C'
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckIcon style={{ width: '15px', height: '15px', color: iconColor, flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: check.pass ? '#A89880' : iconColor, lineHeight: 1.4 }}>
                  {check.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Title Chain */}
      <div style={{ background: '#0F0D0B', border: '1px solid #1E1A14', borderRadius: '10px', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <SectionHeader icon={Landmark} label={t.section_title_chain} />
        {project.title_chain.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#4A4238', margin: 0 }}>
            {t.title_chain_clean}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {project.title_chain.map((entry, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', paddingBottom: i < project.title_chain.length - 1 ? '1.5rem' : 0, position: 'relative' }}>
                {/* Timeline line */}
                {i < project.title_chain.length - 1 && (
                  <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: 0, width: '1px', background: '#2A2520' }} />
                )}
                <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: `2px solid ${entry.note?.includes('ACTIVE') ? '#C0392B' : '#3FA66A'}`, background: '#0F0D0B', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', fontWeight: '500', color: '#F2EBDD' }}>{entry.type}</span>
                    <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#4A4238' }}>{entry.date}</span>
                    {entry.value_lakh > 0 && (
                      <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#C9A84C' }}>
                        ₹{entry.value_lakh.toLocaleString('en-IN')} L
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#6B6258' }}>
                    {entry.from} → {entry.to}
                  </div>
                  <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#4A4238', marginTop: '0.2rem' }}>{entry.doc_no}</div>
                  {entry.note && (
                    <div style={{
                      display: 'inline-block',
                      marginTop: '0.4rem',
                      padding: '0.2rem 0.625rem',
                      borderRadius: '100px',
                      background: entry.note.includes('ACTIVE') ? 'rgba(192,57,43,0.15)' : 'rgba(63,166,106,0.1)',
                      color: entry.note.includes('ACTIVE') ? '#C0392B' : '#3FA66A',
                      fontSize: '11px',
                      fontFamily: 'var(--font-dm-mono, monospace)',
                    }}>
                      {entry.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Litigation */}
      <div style={{ background: '#0F0D0B', border: '1px solid #1E1A14', borderRadius: '10px', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <SectionHeader icon={Scale} label={t.section_litigation} />
        {project.litigation_cases.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CheckCircle style={{ width: '18px', height: '18px', color: '#3FA66A' }} />
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#3FA66A', margin: 0 }}>
              {t.no_litigation}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {project.litigation_cases.map((c, i) => (
              <div key={i} style={{
                padding: '1.25rem',
                background: '#0C0B09',
                border: `1px solid ${c.status === 'Active' ? 'rgba(192,57,43,0.3)' : '#1E1A14'}`,
                borderLeft: `3px solid ${c.status === 'Active' ? '#C0392B' : '#3FA66A'}`,
                borderRadius: '6px',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.2rem 0.625rem',
                    borderRadius: '100px',
                    background: c.status === 'Active' ? 'rgba(192,57,43,0.15)' : 'rgba(63,166,106,0.1)',
                    color: c.status === 'Active' ? '#C0392B' : '#3FA66A',
                    fontSize: '10px',
                    fontFamily: 'var(--font-dm-mono, monospace)',
                    letterSpacing: '0.06em',
                  }}>
                    {c.status}
                  </span>
                  <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#C9A84C' }}>{c.case_no}</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#6B6258' }}>{c.court}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '15px', color: '#F2EBDD', fontWeight: '500', marginBottom: '0.375rem' }}>
                  {c.type}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#6B6258', marginBottom: '0.375rem' }}>
                  Plaintiff: {c.plaintiff}
                </div>
                {c.detail && (
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#A89880', lineHeight: 1.5 }}>
                    {c.detail}
                  </div>
                )}
                {c.next_hearing && (
                  <div style={{ marginTop: '0.625rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#E67E22' }}>
                    Next hearing: {c.next_hearing}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Developer Track Record */}
      <div style={{ background: '#0F0D0B', border: '1px solid #1E1A14', borderRadius: '10px', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
        <SectionHeader icon={User} label={t.section_developer} />
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>Developer</div>
            <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '16px', color: '#F2EBDD', fontWeight: '500' }}>{project.developer}</div>
          </div>
        </div>
        {project.developer_projects.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#4A4238' }}>
            No other verified projects in our database for this developer.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {project.developer_projects.map((dp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: '#0C0B09', borderRadius: '6px', border: '1px solid #1A1510', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#F2EBDD' }}>{dp.name}</div>
                  <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#4A4238' }}>{dp.location} · {dp.year ?? 'Ongoing'}</div>
                </div>
                <span style={{
                  padding: '0.2rem 0.625rem',
                  borderRadius: '100px',
                  background: dp.status === 'Completed' ? 'rgba(63,166,106,0.12)' : dp.status === 'Stalled' ? 'rgba(192,57,43,0.12)' : 'rgba(201,168,76,0.12)',
                  color: dp.status === 'Completed' ? '#3FA66A' : dp.status === 'Stalled' ? '#C0392B' : '#C9A84C',
                  fontSize: '11px',
                  fontFamily: 'var(--font-dm-mono, monospace)',
                  letterSpacing: '0.06em',
                }}>
                  {dp.status}
                </span>
                <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#4A4238' }}>{dp.units} units</span>
                {dp.delay_months > 0 && (
                  <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#C9A84C' }}>
                    +{dp.delay_months}mo delay
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan & RERA Details */}
      <div style={{ background: '#0F0D0B', border: '1px solid #1E1A14', borderRadius: '10px', padding: '1.5rem 2rem', marginBottom: '2rem' }}>
        <SectionHeader icon={FileText} label={t.section_plan} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'RERA Number', value: project.rera_id ?? 'Not Registered', mono: true, highlight: !project.rera_id },
            { label: 'RERA Valid Until', value: project.rera_expiry ?? 'N/A', mono: false, highlight: !project.rera_expiry },
            { label: 'Survey Number', value: project.survey_no, mono: true, highlight: false },
            { label: 'Configuration', value: project.config_types.join(', '), mono: false, highlight: false },
            ...(project.plan_details ? [
              { label: 'Plan Authority', value: project.plan_details.authority, mono: false, highlight: false },
              { label: 'Plan Number', value: project.plan_details.plan_no, mono: true, highlight: false },
              { label: 'Sanctioned Area', value: `${project.plan_details.sanctioned_area_sqft.toLocaleString('en-IN')} sqft`, mono: false, highlight: false },
              { label: 'FSI', value: project.plan_details.fsi.toString(), mono: true, highlight: false },
              { label: 'Plan Status', value: project.plan_details.validity, mono: false, highlight: project.plan_details.validity.includes('LAPSED') },
            ] : []),
          ].map(item => (
            <div key={item.label} style={{ padding: '1rem', background: '#0C0B09', borderRadius: '6px', border: item.highlight ? '1px solid rgba(192,57,43,0.3)' : '1px solid #1A1510' }}>
              <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#4A4238', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>
                {item.label}
              </div>
              <div style={{ fontFamily: item.mono ? 'var(--font-dm-mono, monospace)' : 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: item.highlight ? '#C0392B' : '#A89880', wordBreak: 'break-all' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding: '1.25rem', background: '#0C0B09', border: '1px solid #1A1510', borderRadius: '6px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#4A4238', margin: 0, lineHeight: 1.6 }}>
          This report is for informational purposes only, sourced from public government databases as of the date of generation.
          It is not a substitute for independent legal advice. Consult a registered property lawyer before making any payment.
        </p>
      </div>
    </div>
  )
}
