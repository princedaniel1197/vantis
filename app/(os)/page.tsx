'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Shield, LayoutGrid, TrendingDown, Database, Brain, Search, ChevronRight, Globe } from 'lucide-react'

const PRODUCTS = [
  {
    id: 'govern',
    tag: 'For Regulators',
    name: 'Vantis Govern',
    desc: 'AI-powered intelligence for K-RERA officers. Monitor compliance, predict defaults, issue notices — before crises happen.',
    href: '/govern',
    icon: Shield,
    features: ['QPR Compliance Tracking', 'Predictive Default Analytics', 'Litigation X-ray', 'AI Notice Generator'],
    accent: '#C9A84C',
    borderIdle: 'rgba(201,168,76,0.18)',
    borderHover: 'rgba(201,168,76,0.55)',
    bgIdle: 'rgba(201,168,76,0.04)',
    bgHover: 'rgba(201,168,76,0.09)',
    cta: 'Enter Govern',
  },
  {
    id: 'build',
    tag: 'For Developers',
    name: 'Vantis Build',
    desc: 'The operating system for real estate developers. CRM, ERP, land intelligence, and feasibility — unified in one platform.',
    href: '/command',
    icon: LayoutGrid,
    features: ['Command Centre', 'CRM & Sales Pipeline', 'Land Intelligence', 'Feasibility Engine'],
    accent: '#B8C8D8',
    borderIdle: 'rgba(184,200,216,0.15)',
    borderHover: 'rgba(184,200,216,0.45)',
    bgIdle: 'rgba(184,200,216,0.03)',
    bgHover: 'rgba(184,200,216,0.07)',
    cta: 'Enter Build',
  },
  {
    id: 'lend',
    tag: 'For Lenders',
    name: 'Vantis Lend',
    desc: 'Real-estate credit intelligence for housing finance companies. Early-warning portfolio monitoring, property verification, and developer risk scoring.',
    href: '/lend',
    icon: TrendingDown,
    features: ['Portfolio Early-Warning Heatmap', 'Kaveri Source Verification', 'Developer Risk Score', '6-Quarter Default Prediction'],
    accent: '#4ABFBF',
    borderIdle: 'rgba(74,191,191,0.15)',
    borderHover: 'rgba(74,191,191,0.45)',
    bgIdle: 'rgba(74,191,191,0.03)',
    bgHover: 'rgba(74,191,191,0.08)',
    cta: 'Enter Lend',
  },
  {
    id: 'dataroom',
    tag: 'Developer → Lender',
    name: 'Vantis Data Room',
    desc: 'Verified financing handoff in 4 seconds. RERA, title chain, encumbrance, litigation, escrow — pulled from government sources, shared with your lender in one click.',
    href: '/dataroom',
    icon: Database,
    features: ['Government-Verified Checklist', 'Kaveri Title & EC Check', 'QPR Drone Reconciliation', 'Live API for Bank Systems'],
    accent: '#C9A84C',
    borderIdle: 'rgba(201,168,76,0.12)',
    borderHover: 'rgba(201,168,76,0.45)',
    bgIdle: 'rgba(201,168,76,0.03)',
    bgHover: 'rgba(201,168,76,0.08)',
    cta: 'Open Data Room',
  },
  {
    id: 'connect',
    tag: 'For Brokers',
    name: 'Vantis Connect',
    desc: "The broker's brain — AI buyer-property matching, WhatsApp-native CRM, and Kaveri market truth. Built for Karnataka's 50,000+ brokers.",
    href: '/connect',
    icon: Brain,
    features: ['AI Buyer-Property Matching', 'Government-Verified Results', 'WhatsApp Lead Pipeline', 'Real Kaveri Price Intelligence'],
    accent: '#9B59B6',
    borderIdle: 'rgba(155,89,182,0.12)',
    borderHover: 'rgba(155,89,182,0.45)',
    bgIdle: 'rgba(155,89,182,0.03)',
    bgHover: 'rgba(155,89,182,0.08)',
    cta: 'Open Connect',
  },
  {
    id: 'verify',
    tag: 'For Homebuyers',
    name: 'Vantis Verify',
    desc: "Know before you buy. Government truth about any Karnataka property — RERA, title, litigation, and plan approval — free, in 60 seconds.",
    href: '/verify',
    icon: Search,
    features: ['Free Instant Trust Report', 'A-to-C Grade (Plain Language)', '5 Government Database Check', 'Kannada Language Support'],
    accent: '#3FA66A',
    borderIdle: 'rgba(63,166,106,0.12)',
    borderHover: 'rgba(63,166,106,0.45)',
    bgIdle: 'rgba(63,166,106,0.03)',
    bgHover: 'rgba(63,166,106,0.08)',
    cta: 'Open Verify',
  },
]

export default function HubPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1rem',
      }}
    >
      {/* Logo + tagline */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <Image
          src="/vantislockuponnight.png"
          alt="Vantis"
          width={140}
          height={44}
          style={{ height: '36px', width: 'auto', marginBottom: '1.25rem' }}
          priority
        />
        <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#3A3A55' }}>
          Choose your workspace
        </div>
      </div>

      {/* Product cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', width: '100%', maxWidth: '1400px', marginBottom: '2rem' }}>
        {PRODUCTS.map(p => (
          <Link
            key={p.id}
            href={p.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '1.75rem',
              borderRadius: '2px',
              border: `1px solid ${p.borderIdle}`,
              background: p.bgIdle,
              textDecoration: 'none',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = p.borderHover
              e.currentTarget.style.background = p.bgHover
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = p.borderIdle
              e.currentTarget.style.background = p.bgIdle
            }}
          >
            {/* Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <p.icon style={{ width: '14px', height: '14px', color: p.accent }} />
              <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: p.accent }}>
                {p.tag}
              </span>
            </div>

            {/* Name */}
            <div style={{ fontFamily: 'var(--font-cg, serif)', fontStyle: 'italic', fontSize: '26px', lineHeight: 1.2, color: '#F0EEE8', marginBottom: '0.75rem' }}>
              {p.name}
            </div>

            {/* Description */}
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', lineHeight: 1.6, color: '#5A5A72', marginBottom: '1.5rem', flexGrow: 1 }}>
              {p.desc}
            </p>

            {/* Feature list */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {p.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#6B6B88' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: p.accent, opacity: 0.7, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '13px', color: p.accent }}>
              {p.cta}
              <ChevronRight style={{ width: '14px', height: '14px' }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Coming soon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '3.5rem' }}>
        {['Vantis Diligence', 'Vantis Public API'].map(name => (
          <div
            key={name}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', borderRadius: '2px', border: '1px solid #1C1C28' }}
          >
            <Globe style={{ width: '12px', height: '12px', color: '#2A2A3E' }} />
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#2E2E45' }}>{name}</span>
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '2px', background: '#14141E', color: '#2E2E45' }}>
              Soon
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2A2A3E' }}>
        Orianode Technologies Pvt. Ltd.
      </div>
    </div>
  )
}
