'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, Users, TrendingUp } from 'lucide-react'
import { ConnectProvider, useConnect, T } from './ConnectContext'

function ConnectSubNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { lang, setLang } = useConnect()
  const t = T[lang]

  const tabs = [
    { href: '/connect', label: t.tab_match, icon: Search, exact: true },
    { href: '/connect/leads', label: t.tab_leads, icon: Users, exact: false },
    { href: '/connect/market', label: t.tab_market, icon: TrendingUp, exact: false },
  ]

  return (
    <div>
      {/* Connect sub-header */}
      <div style={{
        borderBottom: '1px solid #1A1A2A',
        background: '#0C0C14',
        position: 'sticky',
        top: '56px',
        zIndex: 40,
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          height: '44px',
        }}>
          {/* Module badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <span style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: '9px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C9A84C',
            }}>
              {t.module}
            </span>
            <span style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: '9px',
              color: '#2A2A3E',
            }}>·</span>
            <span style={{
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: '9px',
              color: '#3A3A52',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}>
              {t.for_brokers}
            </span>
          </div>

          {/* Tabs */}
          <nav style={{ display: 'flex', gap: '0.125rem', flex: 1 }}>
            {tabs.map(tab => {
              const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0 0.875rem',
                    height: '44px',
                    fontFamily: 'var(--font-dm-mono, monospace)',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: active ? '#C9A84C' : '#3A3A52',
                    borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
                    transition: 'color 0.1s, border-color 0.1s',
                  }}
                >
                  <tab.icon style={{ width: '12px', height: '12px' }} />
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
            style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '2px',
              border: '1px solid #1E1E2E',
              background: 'rgba(201,168,76,0.06)',
              fontFamily: 'var(--font-dm-mono, monospace)',
              fontSize: '11px',
              color: '#C9A84C',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              flexShrink: 0,
            }}
          >
            {t.toggle_lang}
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}

export default function ConnectLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConnectProvider>
      <ConnectSubNav>{children}</ConnectSubNav>
    </ConnectProvider>
  )
}
