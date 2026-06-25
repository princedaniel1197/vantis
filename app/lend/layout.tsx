'use client'

import { useState, useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, Search, CreditCard, Users, ShieldCheck, Bell, FileText,
  BarChart2, LogOut, TrendingDown, ChevronDown, Check, X, Menu,
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

const CREDENTIAL = { email: 'credit@kaverihfc.in', password: 'demo' }

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (email.toLowerCase() === CREDENTIAL.email && password === CREDENTIAL.password) {
      try { localStorage.setItem('vantis_lend_user', '1') } catch {}
      onLogin()
    } else {
      setError('Invalid credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <TrendingDown className="w-5 h-5 text-gold" />
            <span className="font-syne text-xl text-gold">Kaveri Housing Finance</span>
          </div>
          <div className="text-gray text-xs mt-0.5">Powered by Vantis Lend</div>
          <div className="text-gray text-[11px] mt-0.5">Real-Estate Credit Intelligence</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-light block mb-1.5">Email</label>
            <input type="email" value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="officer@kaverihfc.in"
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-light block mb-1.5">Password</label>
            <input type="password" value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors"
              required
            />
          </div>
          {error && <div className="text-red text-xs px-3 py-2 bg-red/10 border border-red/20 rounded-sm">{error}</div>}
          <button type="submit"
            className="w-full bg-gold hover:bg-gold-light text-background font-semibold text-sm py-3 rounded-sm transition-colors"
          >
            Sign in to Vantis Lend
          </button>
        </form>
        <div className="mt-6 bg-surface border border-border rounded-sm p-4">
          <div className="text-gray text-xs mb-2">Demo credential</div>
          <div className="font-mono text-xs text-gold">{CREDENTIAL.email}</div>
          <div className="font-mono text-xs text-gray-light mt-0.5">password: demo</div>
        </div>
        <div className="mt-5 text-center">
          <Link href="/" className="text-xs text-gray-light hover:text-gold transition-colors">
            ← Back to workspace
          </Link>
        </div>
      </div>
    </div>
  )
}

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
function LendSidebar({ onLogout, onClose }: { onLogout: () => void; onClose?: () => void }) {
  const pathname    = usePathname()
  const { personaMeta } = useLendContext()

  return (
    <div className="w-[220px] h-full flex flex-col bg-surface border-r border-border">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <TrendingDown className="w-4 h-4 text-gold shrink-0" />
          <div className="min-w-0">
            <div className="font-syne text-xs text-gold leading-tight truncate">{personaMeta.shortName}</div>
            <div className="text-[9px] font-mono text-gray mt-0.5">via Vantis Lend</div>
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
        <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray/60 mb-1.5">Signed in as</div>
        <div className="text-xs text-off-white font-medium">Credit Risk Officer</div>
        <div className="text-[10px] text-gray mt-0.5 truncate">{personaMeta.name}</div>
        <button
          onClick={onLogout}
          className="mt-3 flex items-center gap-1.5 text-gray hover:text-red text-xs transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Sign out
        </button>
      </div>
    </div>
  )
}

// ── Inner layout (has context access) ────────────────────────────────────────
function LendLayoutInner({ children }: { children: ReactNode }) {
  const [mounted, setMounted]         = useState(false)
  const [authed, setAuthed]           = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { personaMeta }               = useLendContext()

  useEffect(() => {
    setMounted(true)
    try {
      if (localStorage.getItem('vantis_lend_user') === '1') setAuthed(true)
    } catch {}
  }, [])

  if (!mounted) return <div className="min-h-screen bg-background" />
  if (!authed)  return <LoginScreen onLogin={() => setAuthed(true)} />

  function logout() {
    try { localStorage.removeItem('vantis_lend_user') } catch {}
    setAuthed(false)
  }

  return (
    <div className="min-h-screen bg-background text-off-white font-sans flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <LendSidebar onLogout={logout} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="md:hidden fixed left-0 top-0 h-full z-50">
            <LendSidebar onLogout={logout} onClose={() => setSidebarOpen(false)} />
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
