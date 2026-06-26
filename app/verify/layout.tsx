'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { VerifyProvider, useVerify, T } from './VerifyContext'

function VerifyNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { lang, setLang } = useVerify()
  const t = T[lang]

  const tabs = [
    { href: '/verify', label: t.nav_trust, exact: true },
    { href: '/verify/full', label: t.nav_full, exact: true },
    { href: '/verify/projects', label: t.nav_projects, exact: false },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F2EBDD' }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1E1A14',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          {/* Back to workspace */}
          <Link
            href="/"
            style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A3530', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, transition: 'color 0.1s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#3A3530' }}
          >
            ← Hub
          </Link>

          {/* Logo */}
          <Link href="/verify" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, textDecoration: 'none' }}>
            <Image
              src="/vantislockuponnight.png"
              alt="Vantis"
              width={90}
              height={28}
              style={{ height: '24px', width: 'auto' }}
              priority
            />
          </Link>

          {/* Divider + product name */}
          <div style={{
            width: '1px',
            height: '20px',
            background: '#2A2520',
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: 'var(--font-dm-mono, monospace)',
            fontSize: '10px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C9A84C',
            flexShrink: 0,
          }}>
            Verify
          </span>

          {/* Tabs */}
          <nav style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
            {tabs.map(tab => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    padding: '0 0.875rem',
                    height: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: 'var(--font-dm-sans, sans-serif)',
                    fontSize: '14px',
                    fontWeight: active ? '500' : '400',
                    textDecoration: 'none',
                    color: active ? '#F2EBDD' : '#6B6258',
                    borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
                    transition: 'color 0.1s, border-color 0.1s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
            style={{
              padding: '0.375rem 0.875rem',
              borderRadius: '4px',
              border: '1px solid #2A2520',
              background: 'transparent',
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: '11px',
              color: '#C9A84C',
              cursor: 'pointer',
              letterSpacing: '0.06em',
              flexShrink: 0,
              transition: 'border-color 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#C9A84C' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A2520' }}
          >
            {t.lang_toggle}
          </button>
        </div>
      </header>

      {children}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #1A1510',
        padding: '2.5rem 1.5rem',
        marginTop: '6rem',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
          <Image
            src="/vantislockuponnight.png"
            alt="Vantis"
            width={80}
            height={26}
            style={{ height: '20px', width: 'auto', opacity: 0.5 }}
          />
          <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#4A4238', margin: 0 }}>
            Data sourced from K-RERA · Kaveri 2.0 · eCourts · BBMP · Bhoomi. For informational purposes. Not legal advice.
          </p>
          <p style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#2A2520', margin: 0, letterSpacing: '0.12em' }}>
            ORIANODE TECHNOLOGIES PVT. LTD.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <VerifyProvider>
      <VerifyNav>{children}</VerifyNav>
    </VerifyProvider>
  )
}
