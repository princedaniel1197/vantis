'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Building2, BarChart2, Scale, ScanLine,
  AlertTriangle, TrendingDown, Users, MessageCircle, Gavel,
  FileText, Sparkles, Settings, Menu, X, LogOut, Shield,
} from 'lucide-react'

interface Officer {
  email: string
  name: string
  role: string
}

const OFFICERS: Record<string, { password: string; name: string; role: string }> = {
  'chairman@krera.gov.in':  { password: 'demo', name: 'K-RERA Chairman',  role: 'Chairman' },
  'technical@krera.gov.in': { password: 'demo', name: 'Member Technical', role: 'Member Technical' },
  'legal@krera.gov.in':     { password: 'demo', name: 'Member Legal',     role: 'Member Legal' },
  'secretary@krera.gov.in': { password: 'demo', name: 'Secretary',        role: 'Secretary' },
}

const NAV = [
  { href: '/govern',              label: 'Command Centre',      icon: LayoutDashboard, exact: true },
  { href: '/govern/projects',     label: 'Project Registry',    icon: Building2 },
  { href: '/govern/qpr',          label: 'QPR Tracker',         icon: BarChart2 },
  { href: '/govern/litigation',   label: 'Litigation Watchlist', icon: Scale },
  { href: '/govern/scanner',      label: 'Submission Scanner',  icon: ScanLine },
  { href: '/govern/risk',         label: 'Developer Risk',      icon: AlertTriangle },
  { href: '/govern/predictive',   label: 'Predictive Default',  icon: TrendingDown },
  { href: '/govern/homebuyer',    label: 'Homebuyer Warning',   icon: Users },
  { href: '/govern/complaints',   label: 'Complaints',          icon: MessageCircle },
  { href: '/govern/rrc',          label: 'RRC Tracker',         icon: Gavel },
  { href: '/govern/notices',      label: 'Notice Generator',    icon: FileText },
  { href: '/govern/intelligence', label: 'Vantis Intelligence', icon: Sparkles },
  { href: '/govern/settings',     label: 'Settings',            icon: Settings },
]

function roleTextColor(role: string) {
  if (role === 'Chairman')         return 'text-gold'
  if (role === 'Member Technical') return 'text-blue'
  if (role === 'Member Legal')     return 'text-red'
  return 'text-gray-light'
}
function roleDotBg(role: string) {
  if (role === 'Chairman')         return 'bg-gold'
  if (role === 'Member Technical') return 'bg-blue'
  if (role === 'Member Legal')     return 'bg-red'
  return 'bg-gray-light'
}

function SidebarNav({ officer, onLogout, onClose }: { officer: Officer; onLogout: () => void; onClose: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full w-[220px] bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          <span className="font-syne text-base text-gold">Vantis Govern</span>
        </div>
        <button onClick={onClose} className="md:hidden text-gray hover:text-gold transition-colors duration-150">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 border-l-2 ${
                active
                  ? 'text-gold bg-border-gold/40 border-gold'
                  : 'text-gray-light hover:text-gold hover:bg-surface2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Officer */}
      <div className="border-t border-border px-4 py-3 shrink-0">
        <div className="text-off-white text-xs font-medium truncate">{officer.name}</div>
        <span className={`inline-flex items-center gap-1.5 text-[10px] mt-1.5 ${roleTextColor(officer.role)}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${roleDotBg(officer.role)}`} />
          {officer.role}
        </span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-gray hover:text-red text-xs mt-3 transition-colors duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin: (o: Officer) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const officer = OFFICERS[email.toLowerCase()]
    if (officer && officer.password === password) {
      onLogin({ email: email.toLowerCase(), name: officer.name, role: officer.role })
    } else {
      setError('Invalid credentials. Check your email and password.')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-gold" />
            <span className="font-syne text-2xl text-gold">Vantis Govern</span>
          </div>
          <div className="text-gray text-sm">K-RERA Officer Portal</div>
          <div className="text-gray text-xs mt-0.5">Karnataka Real Estate Regulatory Authority</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-light block mb-1.5">Officer Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="officer@krera.gov.in"
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors duration-150"
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-light block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              className="w-full bg-surface border border-border rounded-sm px-4 py-3 text-off-white placeholder-gray text-sm focus:outline-none focus:border-gold transition-colors duration-150"
              required
            />
          </div>
          {error && (
            <div className="text-red text-xs px-3 py-2 bg-red/10 border border-red/20 rounded-sm">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-gold hover:bg-gold-light text-background font-semibold text-sm py-3 rounded-sm transition-colors duration-150"
          >
            Sign In to Govern
          </button>
        </form>

        <div className="mt-5 text-center">
          <a href="/" className="text-xs text-gray-light hover:text-gold transition-colors duration-150">
            ← Back to Public Portal
          </a>
        </div>

        <div className="mt-8 bg-surface border border-border rounded-sm p-4">
          <div className="text-gray text-xs mb-2">Demo credentials — password: demo</div>
          <div className="font-mono text-xs space-y-1">
            <div className="text-gold">chairman@krera.gov.in</div>
            <div className="text-blue">technical@krera.gov.in</div>
            <div className="text-red">legal@krera.gov.in</div>
            <div className="text-gray-light">secretary@krera.gov.in</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GovernLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [officer, setOfficer] = useState<Officer | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('vantis_officer')
      if (stored) setOfficer(JSON.parse(stored))
      if (localStorage.getItem('vantis_demo_mode') === 'true') setDemoMode(true)
    } catch {
      // ignore
    }

    function handleKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        setDemoMode(prev => {
          const next = !prev
          try { localStorage.setItem('vantis_demo_mode', String(next)) } catch {}
          return next
        })
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  if (!mounted) return <div className="min-h-screen bg-background" />

  if (!officer) {
    return (
      <LoginScreen
        onLogin={o => {
          localStorage.setItem('vantis_officer', JSON.stringify(o))
          setOfficer(o)
        }}
      />
    )
  }

  function handleLogout() {
    localStorage.removeItem('vantis_officer')
    setOfficer(null)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — fixed */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <SidebarNav officer={officer} onLogout={handleLogout} onClose={() => {}} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <SidebarNav officer={officer} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-light hover:text-gold transition-colors duration-150">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold" />
            <span className="font-syne text-sm text-gold">Vantis Govern</span>
            {demoMode && (
              <span className="text-[9px] font-bold bg-gold text-background px-1.5 py-0.5 rounded tracking-widest">DEMO</span>
            )}
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[10px] ${roleTextColor(officer.role)}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${roleDotBg(officer.role)}`} />
            {officer.role}
          </span>
        </div>

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-surface sticky top-0 z-20">
          <span className="font-mono text-xs text-gray tracking-widest uppercase">K-RERA Officer Portal</span>
          <div className="flex items-center gap-3">
            {demoMode && (
              <span className="text-[10px] font-bold bg-gold text-background px-2 py-0.5 rounded tracking-widest">DEMO</span>
            )}
            <span className="text-off-white text-xs">{officer.name}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs ${roleTextColor(officer.role)}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${roleDotBg(officer.role)}`} />
              {officer.role}
            </span>
          </div>
        </div>

        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
