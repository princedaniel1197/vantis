'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Building2, BarChart2, Scale, ScanLine,
  AlertTriangle, TrendingDown, Users, MessageCircle, Gavel,
  FileText, Sparkles, Settings, Menu, X, Shield, ChevronLeft, Network,
} from 'lucide-react'

const DEFAULT_OFFICER = { name: 'K-RERA Chairman', role: 'Chairman' }

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
  { href: '/govern/graph',        label: 'Link Analysis',       icon: Network },
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

function SidebarNav({ onClose }: { onClose: () => void }) {
  const pathname = usePathname()
  const officer = DEFAULT_OFFICER
  return (
    <div className="flex flex-col h-full w-[220px] bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex flex-col px-4 pt-3 pb-4 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <Link href="/" onClick={onClose} className="flex items-center gap-1 text-[10px] font-mono text-gray hover:text-gold transition-colors duration-150">
            <ChevronLeft className="w-3 h-3" />
            Workspace
          </Link>
          <button onClick={onClose} className="md:hidden text-gray hover:text-gold transition-colors duration-150">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gold" />
          <span className="font-syne text-base text-gold">Vantis Govern</span>
        </div>
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
                  ? 'text-gold bg-accent-tint border-gold'
                  : 'text-gray-light hover:text-gold hover:bg-surface2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Officer identity */}
      <div className="border-t border-border px-4 py-3 shrink-0">
        <div className="text-off-white text-xs font-medium">{officer.name}</div>
        <span className={`inline-flex items-center gap-1.5 text-[10px] mt-1.5 ${roleTextColor(officer.role)}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${roleDotBg(officer.role)}`} />
          {officer.role}
        </span>
      </div>
    </div>
  )
}

export default function GovernLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem('vantis_demo_mode') === 'true') setDemoMode(true)
    } catch {}

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

  const officer = DEFAULT_OFFICER

  return (
    <div data-theme="void" className="min-h-screen bg-background flex">
      {/* Desktop sidebar — fixed */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <SidebarNav onClose={() => {}} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50">
            <SidebarNav onClose={() => setSidebarOpen(false)} />
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
