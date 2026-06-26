'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Search, CreditCard, Users, ShieldCheck, Bell, FileText,
  BarChart2, TrendingDown, ChevronDown, Check, X, Menu,
  Shield, MessageSquare, Camera, Scale, Network, Store, Home, Plug, Award, Database,
} from 'lucide-react'
import { LendContextProvider, useLendContext } from './LendContext'
import { PERSONAS, type PersonaKey } from '@/lib/lend-personas'
import LendChatbot from '@/components/lend/LendChatbot'

type NavItem  = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; exact: boolean }
type NavGroup = { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'MONITOR',
    items: [
      { href: '/lend',                       label: 'Portfolio',          icon: Building2,     exact: true  },
      { href: '/lend/project/ozone-urbana',  label: 'Project Drill-down', icon: Search,        exact: false },
      { href: '/lend/tranche/ozone-urbana',  label: 'Tranche Control',    icon: CreditCard,    exact: false },
      { href: '/lend/alerts',                label: 'Alerts',             icon: Bell,          exact: true  },
      { href: '/lend/covenants',             label: 'Covenants',          icon: Shield,        exact: true  },
      { href: '/lend/copilot',               label: 'RM Copilot',         icon: MessageSquare, exact: true  },
    ],
  },
  {
    label: 'VERIFY',
    items: [
      { href: '/lend/verify-progress', label: 'CV Progress',        icon: Camera,      exact: true },
      { href: '/lend/verify',          label: 'Title & Collateral', icon: ShieldCheck, exact: true },
      { href: '/lend/litigation',      label: 'Litigation',         icon: Scale,       exact: true },
      { href: '/dataroom',             label: 'Data Room',          icon: Database,    exact: true },
    ],
  },
  {
    label: 'SCORE',
    items: [
      { href: '/lend/developer/ozone-group', label: 'Developer Score',   icon: Users,        exact: false },
      { href: '/lend/network',               label: 'Network Graph',     icon: Network,      exact: true  },
      { href: '/lend/models',                label: 'Predictive Models', icon: TrendingDown, exact: true  },
    ],
  },
  {
    label: 'PLATFORM',
    items: [
      { href: '/lend/marketplace',  label: 'Marketplace',   icon: Store,    exact: true },
      { href: '/lend/buyer-check',  label: 'Buyer Check',   icon: Home,     exact: true },
      { href: '/lend/integrations', label: 'Integrations',  icon: Plug,     exact: true },
      { href: '/lend/assurance',    label: 'Assurance',     icon: Award,    exact: true },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { href: '/lend/compliance', label: 'RBI Compliance', icon: FileText,  exact: true },
      { href: '/lend/stress',     label: 'Stress Test',    icon: BarChart2, exact: true },
    ],
  },
]

// ── Persona Switcher ──────────────────────────────────────────────────────────
function PersonaSwitcher() {
  const { persona, setPersona, personaMeta } = useLendContext()
  const [open, setOpen]                      = useState(false)
  const ref                                  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface2 border border-border hover:border-gold/40 transition-colors"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <span className="text-off-white text-[11px] font-mono">{personaMeta.shortName}</span>
        <ChevronDown
          className="w-3 h-3 text-gray transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-80 bg-surface border border-border rounded-sm z-50 shadow-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-surface2">
            <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-gray">Switch Lender Persona</span>
          </div>
          {(Object.keys(PERSONAS) as PersonaKey[]).map(key => {
            const p = PERSONAS[key]
            return (
              <button
                key={key}
                onClick={() => { setPersona(key); setOpen(false) }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface2 transition-colors text-left border-b border-border/40 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-off-white text-xs font-medium">{p.name}</div>
                  <div className="text-gray text-[10px] mt-0.5">{p.type}</div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-mono text-gray-light">₹{p.total_cr.toLocaleString('en-IN')} Cr</span>
                    <span className="text-gray text-[10px]">{p.projects} projects</span>
                    <span className="text-red text-[10px]">{p.red} flagged</span>
                  </div>
                </div>
                {key === persona && <Check className="w-3.5 h-3.5 text-gold mt-1 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function LendSidebar({ onClose }: { onClose?: () => void }) {
  const pathname    = usePathname()
  const { personaMeta } = useLendContext()

  return (
    <div className="w-[220px] h-full flex flex-col bg-surface border-r border-border">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <TrendingDown className="w-4 h-4 text-gold shrink-0" />
          <div className="min-w-0">
            <div className="font-syne text-xs text-gold leading-tight truncate">{personaMeta.shortName}</div>
            <Link href="/" onClick={onClose} className="text-[9px] font-mono text-gray mt-0.5 hover:text-gold transition-colors">
              ← Workspace
            </Link>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray hover:text-off-white ml-2 shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-1 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="px-3 pt-4 pb-1 text-[9px] font-mono uppercase tracking-[0.18em] text-gray/40 select-none">
              {group.label}
            </div>
            {group.items.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-4 py-2 text-[11px] transition-colors duration-100 relative"
                  style={{
                    color:      active ? '#C9A84C' : '#6B6B88',
                    background: active ? 'rgba(201,168,76,0.07)' : 'transparent',
                  }}
                >
                  {active && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold rounded-r-sm" />}
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className={active ? 'font-medium' : ''}>{label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray/60 mb-1.5">Viewing as</div>
        <div className="text-xs text-off-white font-medium">Credit Risk Officer</div>
        <div className="text-[10px] text-gray mt-0.5 truncate">{personaMeta.name}</div>
      </div>
    </div>
  )
}

// ── Inner layout (has context access) ────────────────────────────────────────
function LendLayoutInner({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { personaMeta }               = useLendContext()

  return (
    <div className="min-h-screen bg-background text-off-white font-sans flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <LendSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 h-full z-50">
            <LendSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Content area */}
      <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 bg-surface border-b border-border flex items-center px-4 gap-3"
          style={{ height: '48px' }}
        >
          <button
            className="md:hidden text-gray hover:text-off-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="md:hidden flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs font-syne text-gold">{personaMeta.shortName}</span>
          </div>

          <div className="hidden md:block text-[10px] font-mono text-gray uppercase tracking-[0.12em]">
            Vantis Lend · Credit Intelligence Platform
          </div>

          <div className="flex-1" />
          <PersonaSwitcher />
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <LendChatbot />
    </div>
  )
}

// ── Exported layout ───────────────────────────────────────────────────────────
export default function LendLayout({ children }: { children: ReactNode }) {
  return (
    <LendContextProvider>
      <LendLayoutInner>{children}</LendLayoutInner>
    </LendContextProvider>
  )
}
