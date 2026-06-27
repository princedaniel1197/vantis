'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutGrid, Box, Activity, MapPin, BarChart2, Menu, X, ChevronLeft } from 'lucide-react'

const NAV_ITEMS = [
  {
    label: 'Build Hub',
    href: '/build',
    icon: LayoutGrid,
    desc: null,
    exact: true,
  },
  {
    label: '3D Tower View',
    href: '/build/sales/tower',
    icon: Box,
    desc: '73 units · AI gov-truth query',
    exact: false,
  },
  {
    label: 'Drone Reconciliation',
    href: '/build/construction/reconciliation',
    icon: Activity,
    desc: 'Physical vs QPR gap',
    exact: false,
  },
  {
    label: 'Parcel Intelligence',
    href: '/build/land/parcel',
    icon: MapPin,
    desc: 'Bhoomi title + satellite',
    exact: false,
  },
  {
    label: 'Competitive Supply',
    href: '/build/approvals/market',
    icon: BarChart2,
    desc: '2.5km RERA absorption',
    exact: false,
  },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  function isActive(item: typeof NAV_ITEMS[number]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        width: '220px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo area */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono mb-3 transition-colors"
          style={{ color: 'var(--muted)' }}
          onClick={onClose}
        >
          <ChevronLeft className="w-3 h-3" />
          Vantis OS
        </Link>
        <div className="font-syne text-sm font-bold" style={{ color: 'var(--ink)' }}>
          Vantis Build
        </div>
        <div className="text-[9px] font-mono uppercase tracking-[0.12em] mt-0.5" style={{ color: 'var(--muted)' }}>
          Developer Intelligence OS
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const active = isActive(item)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-start gap-2.5 px-3 py-2 transition-colors block border-l-2"
              style={
                active
                  ? {
                      background: 'var(--accent-tint)',
                      color: 'var(--accent)',
                      borderLeftColor: 'var(--accent)',
                    }
                  : {
                      color: 'var(--muted)',
                      borderLeftColor: 'transparent',
                    }
              }
            >
              <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs leading-tight">{item.label}</div>
                {item.desc && (
                  <div
                    className="text-[9px] font-mono mt-0.5 leading-tight"
                    style={{ color: active ? 'var(--accent)' : 'var(--dim)' }}
                  >
                    {item.desc}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-[9px] font-mono leading-relaxed" style={{ color: 'var(--dim)' }}>
          Demo Project
        </div>
        <div className="text-[9px] font-mono" style={{ color: 'var(--dim)' }}>
          Divya Villas · JDA Projects
        </div>
      </div>
    </div>
  )
}

export default function BuildLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div data-theme="daylight" className="min-h-screen bg-background text-ink flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col shrink-0 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center px-4"
        style={{
          height: '48px',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-sm transition-colors"
          style={{ color: 'var(--muted)' }}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-syne text-sm ml-3" style={{ color: 'var(--ink)' }}>
          Vantis Build
        </span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative flex flex-col h-full">
            <div className="absolute top-2 right-[-44px]">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-sm"
                style={{ color: 'var(--muted)' }}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 min-w-0 md:pt-0 pt-12">
        {children}
      </div>
    </div>
  )
}
