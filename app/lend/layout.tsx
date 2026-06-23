'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { TrendingDown, LogOut, Building2, ShieldCheck, Users } from 'lucide-react'

const CREDENTIAL = { email: 'credit@kaverihfc.in', password: 'demo', name: 'Credit Risk Officer', org: 'Kaveri Housing Finance' }

const NAV = [
  { href: '/lend',           label: 'Portfolio',    icon: Building2,   exact: true },
  { href: '/lend/verify',    label: 'Verify',       icon: ShieldCheck, exact: true },
  { href: '/lend/developer/prestige-group', label: 'Developer Risk', icon: Users, exact: false },
]

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
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              placeholder="officer@kaverihfc.in"
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
            Sign in to Vantis Lend
          </button>
        </form>

        <div className="mt-6 bg-surface border border-border rounded-sm p-4">
          <div className="text-gray text-xs mb-2">Demo credential</div>
          <div className="font-mono text-xs text-gold">{CREDENTIAL.email}</div>
          <div className="font-mono text-xs text-gray-light mt-0.5">password: demo</div>
        </div>

        <div className="mt-5 text-center">
          <Link href="/" className="text-xs text-gray-light hover:text-gold transition-colors duration-150">
            ← Back to workspace
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function LendLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [authed, setAuthed]   = useState(false)
  const pathname              = usePathname()

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
    <div className="min-h-screen bg-background text-off-white font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-30 h-13 bg-surface border-b border-border flex items-center px-4 sm:px-6 gap-6" style={{ height: '52px' }}>
        {/* Brand */}
        <div className="flex items-center gap-2 shrink-0">
          <TrendingDown className="w-4 h-4 text-gold" />
          <span className="font-syne text-sm text-gold">Kaveri HFC</span>
          <span className="hidden sm:inline text-gray text-[10px] font-mono ml-1 mt-0.5">via Vantis Lend</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 flex-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href.replace('/prestige-group', ''))
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-[0.08em] transition-colors duration-100"
                style={{
                  color:      active ? '#C9A84C' : '#6B6B88',
                  background: active ? 'rgba(201,168,76,0.08)' : 'transparent',
                  borderBottom: active ? '2px solid #C9A84C' : '2px solid transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block text-right">
            <div className="text-off-white text-xs">{CREDENTIAL.name}</div>
            <div className="text-gray text-[10px]">{CREDENTIAL.org}</div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-gray hover:text-red text-xs transition-colors duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
