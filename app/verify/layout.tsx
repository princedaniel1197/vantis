'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Search, FileText, Globe, Menu, X, Building2, CheckCircle, Scale, Database, AlertTriangle, ChevronLeft } from 'lucide-react'
import { VerifyProvider, useVerify, T } from './VerifyContext'
import ProductChatbot from '@/components/shared/ProductChatbot'

type NavItem  = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }
type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'SEARCH',
    items: [
      { href: '/verify',          label: 'Trust Check',    icon: ShieldCheck, exact: true },
      { href: '/verify/full',     label: 'Full Report',    icon: FileText,    exact: true },
      { href: '/verify/projects', label: 'All Projects',   icon: Building2,   exact: false },
    ],
  },
  {
    label: 'DATA SOURCES',
    items: [
      { href: '/verify', label: 'K-RERA Registry',  icon: CheckCircle, exact: true },
      { href: '/verify', label: 'Kaveri 2.0',        icon: Database,    exact: true },
      { href: '/verify', label: 'eCourts',           icon: Scale,       exact: true },
      { href: '/verify', label: 'BBMP / Bhoomi',     icon: Globe,       exact: true },
    ],
  },
  {
    label: 'ALERTS',
    items: [
      { href: '/verify', label: 'Fraud Flags',      icon: AlertTriangle, exact: true },
      { href: '/verify', label: 'Recent Searches',  icon: Search,        exact: true },
    ],
  },
]

function VerifySidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { lang, setLang } = useVerify()
  const t = T[lang]

  return (
    <div className="w-[220px] h-full flex flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-1 text-[10px] font-mono transition-colors duration-150"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)' }}
          >
            <ChevronLeft className="w-3 h-3" />
            Workspace
          </Link>
          {onClose && (
            <button onClick={onClose} className="md:hidden transition-colors" style={{ color: 'var(--muted)' }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="font-syne text-base" style={{ color: 'var(--accent)' }}>Vantis Verify</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="px-3 pt-4 pb-1 text-[9px] font-mono uppercase tracking-[0.18em] select-none" style={{ color: 'var(--muted)', opacity: 0.5 }}>
              {group.label}
            </div>
            {group.items.map(({ href, label, icon: Icon, exact }, idx) => {
              const isDataSource = group.label === 'DATA SOURCES' || group.label === 'ALERTS'
              const active = !isDataSource && (exact ? pathname === href : pathname.startsWith(href))
              return (
                <Link
                  key={`${href}-${idx}`}
                  href={isDataSource ? '#' : href}
                  onClick={isDataSource ? (e) => e.preventDefault() : onClose}
                  className="flex items-center gap-2.5 px-4 py-2 text-[11px] transition-colors duration-100 relative"
                  style={{
                    color:      isDataSource ? 'var(--muted)' : active ? 'var(--accent)' : 'var(--muted)',
                    background: active ? 'var(--accent-tint)' : 'transparent',
                    opacity:    isDataSource ? 0.55 : 1,
                    cursor:     isDataSource ? 'default' : 'pointer',
                  }}
                >
                  {active && <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm" style={{ background: 'var(--accent)' }} />}
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className={active ? 'font-medium' : ''}>{label}</span>
                  {isDataSource && (
                    <span className="ml-auto text-[8px] font-mono px-1 rounded" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>LIVE</span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-[9px] font-mono uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--muted)', opacity: 0.6 }}>Language</div>
        <button
          onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
          className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1.5 rounded-sm transition-colors w-full"
          style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'transparent' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
        >
          <Globe className="w-3 h-3" />
          {t.lang_toggle}
        </button>
        <div className="mt-3 text-[9px] font-mono" style={{ color: 'var(--muted)', opacity: 0.4, letterSpacing: '0.1em' }}>
          ORIANODE TECHNOLOGIES
        </div>
      </div>
    </div>
  )
}

function VerifyLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div data-theme="forest" className="min-h-screen font-sans flex" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <VerifySidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 h-full z-50">
            <VerifySidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Content area */}
      <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">
        {/* Top bar (mobile only) */}
        <header
          className="md:hidden sticky top-0 z-20 flex items-center px-4 gap-3"
          style={{ height: '48px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <button
            className="transition-colors"
            style={{ color: 'var(--muted)' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>
          <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-syne" style={{ color: 'var(--accent)' }}>Vantis Verify</span>
        </header>

        {/* Desktop top bar */}
        <header
          className="hidden md:flex sticky top-0 z-20 items-center px-6 gap-3"
          style={{ height: '48px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
            Vantis Verify · Karnataka Project Intelligence
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            <span className="text-[10px] font-mono" style={{ color: 'var(--accent)' }}>Live · K-RERA</span>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <ProductChatbot
        product="verify"
        title="Vantis Verify AI"
        subtitle="Trust & Verification Assistant"
      />
    </div>
  )
}

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
  return (
    <VerifyProvider>
      <VerifyLayoutInner>{children}</VerifyLayoutInner>
    </VerifyProvider>
  )
}
