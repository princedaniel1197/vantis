'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Users, Calendar, Building2, Handshake,
  HardHat, Wrench, UserCheck,
  BookOpen, CreditCard,
  Map, Calculator, TrendingUp, Scale,
  ShieldCheck, Award,
  Sun, Moon, MessageSquare, ChevronDown, Menu, X
} from 'lucide-react'
import { useTheme } from '@/app/context/ThemeContext'
import Image from 'next/image'

const NAV_GROUPS = [
  {
    label: 'Sales',
    items: [
      { label: 'Command Centre', path: '/', icon: LayoutGrid, desc: 'Portfolio health + today' },
      { label: 'Leads & Pipeline', path: '/leads', icon: Users, desc: 'CRM, scoring, verification' },
      { label: 'Site Visits', path: '/visits', icon: Calendar, desc: 'Schedule, assign, follow-up' },
      { label: 'Inventory', path: '/inventory', icon: Building2, desc: 'Unit grid, booking flow' },
      { label: 'Channel Partners', path: '/partners', icon: Handshake, desc: 'Broker network, payouts' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { label: 'Projects', path: '/projects', icon: HardHat, desc: 'Construction + RERA status' },
      { label: 'Construction', path: '/construction', icon: Wrench, desc: 'Site progress, materials' },
      { label: 'Customers', path: '/customers', icon: UserCheck, desc: 'Post-sale, handover, docs' },
    ]
  },
  {
    label: 'Finance',
    items: [
      { label: 'ERP / Finance', path: '/finance', icon: BookOpen, desc: 'P&L, cash flow, ledgers' },
      { label: 'Payments', path: '/payments', icon: CreditCard, desc: 'Collections, milestones' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { label: 'Land Intelligence', path: '/land', icon: Map, desc: 'Risk score, title chain' },
      { label: 'Feasibility Engine', path: '/feasibility', icon: Calculator, desc: 'FSI, product mix, P&L' },
      { label: 'Market Truth', path: '/market', icon: TrendingUp, desc: 'Real Kaveri prices' },
      { label: 'Litigation X-ray', path: '/litigation', icon: Scale, desc: 'eCourts, NCLT, ED' },
    ]
  },
  {
    label: 'Compliance',
    items: [
      { label: 'Compliance Autopilot', path: '/compliance', icon: ShieldCheck, desc: 'QPR, RERA, penalties' },
      { label: 'Buyer-Trust Certificate', path: '/certificate', icon: Award, desc: 'Verified cert + QR' },
    ]
  },
]

function getActiveGroup(pathname: string): string | null {
  for (const g of NAV_GROUPS) {
    for (const item of g.items) {
      if (item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)) {
        return g.label
      }
    }
  }
  return null
}

export default function OSNav() {
  const { theme, toggle } = useTheme()
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const activeGroup = getActiveGroup(pathname)

  useEffect(() => {
    setOpenGroup(null)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 h-14"
      style={{ background: 'var(--bg)', borderBottom: '1px solid var(--bord)' }}
    >
      <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center h-8">
          <Image
            src={theme === 'pitch' ? '/vantislockuponnight.png' : '/vantislockuponivory.png'}
            alt="Vantis"
            width={100}
            height={32}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop nav groups */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1">
          {NAV_GROUPS.map(group => {
            const isActive = activeGroup === group.label
            const isOpen = openGroup === group.label
            return (
              <div key={group.label} className="relative">
                <button
                  onClick={() => setOpenGroup(isOpen ? null : group.label)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-[0.1em] transition-colors duration-100"
                  style={{
                    color: isActive ? 'var(--gold)' : 'var(--muted)',
                    background: isOpen ? 'color-mix(in srgb, var(--gold) 8%, var(--surf))' : 'transparent',
                  }}
                >
                  {group.label}
                  <ChevronDown
                    className="w-3 h-3 transition-transform duration-150"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', opacity: 0.6 }}
                  />
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px]"
                      style={{ background: 'var(--gold)' }}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.1 }}
                      className="absolute top-full left-0 mt-1.5 w-60 py-1.5 rounded-sm"
                      style={{
                        background: 'var(--surf)',
                        border: '1px solid var(--bord)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                        zIndex: 100,
                      }}
                    >
                      {group.items.map(item => {
                        const isCurrentItem = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            className="flex items-start gap-3 px-3 py-2.5 transition-colors duration-75"
                            style={{
                              background: isCurrentItem ? 'color-mix(in srgb, var(--gold) 8%, var(--surf))' : 'transparent',
                              borderLeft: isCurrentItem ? '2px solid var(--gold)' : '2px solid transparent',
                            }}
                            onMouseEnter={e => { if (!isCurrentItem) e.currentTarget.style.background = 'var(--surf2)' }}
                            onMouseLeave={e => { if (!isCurrentItem) e.currentTarget.style.background = 'transparent' }}
                          >
                            <item.icon
                              className="w-3.5 h-3.5 mt-0.5 shrink-0"
                              style={{ color: isCurrentItem ? 'var(--gold)' : 'var(--muted)' }}
                            />
                            <div>
                              <div className="text-xs" style={{ color: isCurrentItem ? 'var(--gold)' : 'var(--ink)' }}>
                                {item.label}
                              </div>
                              <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                                {item.desc}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/vision"
            className="hidden sm:flex items-center text-[10px] font-mono uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-sm transition-colors"
            style={{ color: pathname === '/vision' ? 'var(--gold)' : 'var(--muted)', border: '1px solid var(--bord)' }}
          >
            Vision
          </Link>
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors"
            style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}
            title={theme === 'pitch' ? 'Switch to Work mode' : 'Switch to Pitch mode'}
          >
            {theme === 'pitch' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <Link
            href="/assistant"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-[0.08em] transition-colors"
            style={{ background: 'var(--gold)', color: 'var(--bg)' }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Ask AI
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-sm"
            style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
            style={{ background: 'var(--surf)', borderBottom: '1px solid var(--bord)' }}
          >
            <div className="px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--muted)' }}>
                    {group.label}
                  </div>
                  <div className="space-y-1">
                    {group.items.map(item => {
                      const active = item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm"
                          style={{
                            color: active ? 'var(--gold)' : 'var(--ink)',
                            background: active ? 'color-mix(in srgb, var(--gold) 8%, var(--surf2))' : 'transparent',
                          }}
                        >
                          <item.icon className="w-4 h-4 shrink-0" style={{ color: active ? 'var(--gold)' : 'var(--muted)' }} />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
              <div className="pt-2 flex items-center gap-3">
                <Link href="/vision" className="text-xs font-mono px-3 py-2 rounded-sm" style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}>
                  Vision
                </Link>
                <Link href="/assistant" className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-mono" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                  <MessageSquare className="w-3.5 h-3.5" /> Ask AI
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
