'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Sun, Moon, MessageSquare } from 'lucide-react'
import { useTheme } from '@/app/context/ThemeContext'

const NAV = [
  { href: '/command',     label: 'Command' },
  { href: '/land',        label: 'Land' },
  { href: '/market',      label: 'Market' },
  { href: '/feasibility', label: 'Feasibility' },
  { href: '/compliance',  label: 'Compliance' },
  { href: '/litigation',  label: 'Litigation' },
  { href: '/channel',     label: 'Channel' },
  { href: '/dataroom',    label: 'Data Room' },
  { href: '/certificate', label: 'Certificate' },
]

export default function DevTopBar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 sm:px-6 gap-4 border-b"
      style={{ background: 'var(--bg)', borderColor: 'var(--bord)' }}
    >
      {/* Logo — swaps on theme */}
      <Link href="/command" className="shrink-0 flex items-center">
        <Image
          src={theme === 'pitch' ? '/vantislockuponnight.png' : '/vantislockuponivory.png'}
          alt="Vantis"
          width={88}
          height={28}
          className="h-7 w-auto"
          priority
        />
      </Link>

      {/* Divider */}
      <div className="h-5 w-px shrink-0" style={{ background: 'var(--bord)' }} />

      {/* Module Nav — scrollable on mobile */}
      <nav className="flex-1 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-0.5 min-w-max">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || pathname?.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-[0.08em] rounded-sm transition-colors duration-100 whitespace-nowrap"
                style={{
                  color: active ? 'var(--gold)' : 'var(--muted)',
                  background: active ? 'color-mix(in srgb, var(--gold) 10%, transparent)' : 'transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors duration-150"
          style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}
          aria-label={`Switch to ${theme === 'pitch' ? 'work' : 'pitch'} mode`}
          title={theme === 'pitch' ? 'Switch to Work mode' : 'Switch to Pitch mode'}
        >
          {theme === 'pitch' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Ask AI */}
        <Link
          href="/assistant"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-[0.08em] rounded-sm transition-colors duration-150"
          style={{ color: 'var(--gold)', border: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)' }}
        >
          <MessageSquare className="w-3 h-3" />
          <span className="hidden sm:inline">Ask AI</span>
        </Link>
      </div>
    </header>
  )
}
