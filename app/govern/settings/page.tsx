'use client'

import { useState, useEffect } from 'react'
import { User, Bell, Database, FlaskConical, CheckCircle2, Clock } from 'lucide-react'

interface OfficerProfile {
  email: string
  role: string
  name: string
}

const ROLE_DISPLAY: Record<string, string> = {
  chairman:  'Chairman',
  technical: 'Member — Technical',
  legal:     'Member — Legal',
  secretary: 'Secretary',
}

const NAME_MAP: Record<string, string> = {
  'chairman@krera.gov.in':  'DK Shivakumar (Chairman)',
  'technical@krera.gov.in': 'Ar. Suresh Babu',
  'legal@krera.gov.in':     'Adv. Meera Iyer',
  'secretary@krera.gov.in': 'R. Krishnamurthy',
}

const DATA_SOURCES = [
  { name: 'K-RERA Project Registry',  last_sync: '6 hours ago',  frequency: 'Every 6 hours', status: 'SYNCED' },
  { name: 'eCourts (High Court)',      last_sync: '4 hours ago',  frequency: 'Every 4 hours', status: 'SYNCED' },
  { name: 'Kaveri 2.0 (Land Titles)',  last_sync: '3 days ago',   frequency: 'Weekly',        status: 'OK' },
  { name: 'Bhoomi (Land Records)',     last_sync: '5 days ago',   frequency: 'Weekly',        status: 'OK' },
  { name: 'BBMP / BDA (Zoning)',       last_sync: '6 days ago',   frequency: 'Weekly',        status: 'OK' },
  { name: 'Internal QPR Database',     last_sync: 'Live',          frequency: 'Real-time',     status: 'LIVE' },
]

export default function Settings() {
  const [mounted, setMounted] = useState(false)
  const [officer, setOfficer] = useState<OfficerProfile | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  const [notif, setNotif] = useState({
    priority1:    true,
    qprDefaults:  true,
    newLitigation: false,
    weeklyReport: true,
  })

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('vantis_officer')
      if (stored) {
        const parsed = JSON.parse(stored) as { email: string; role: string }
        setOfficer({
          email: parsed.email,
          role: parsed.role,
          name: NAME_MAP[parsed.email] ?? parsed.email,
        })
      }
      const dm = localStorage.getItem('vantis_demo_mode')
      if (dm === 'true') setDemoMode(true)
    } catch {}
  }, [])

  function toggleDemoMode() {
    const next = !demoMode
    setDemoMode(next)
    try { localStorage.setItem('vantis_demo_mode', String(next)) } catch {}
  }

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-1">GOVERN · CONFIGURATION</div>
        <h1 className="font-syne text-2xl sm:text-3xl text-off-white font-bold">Settings</h1>
        <p className="text-gray text-xs mt-1">Account, notifications, data freshness, and demo mode</p>
      </div>

      {/* Section 1 — Current User */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-gold" />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Current User</span>
        </div>
        {officer ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Name</div>
              <div className="text-off-white text-sm">{officer.name}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Email</div>
              <div className="font-mono text-xs text-gold">{officer.email}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Role</div>
              <div className="text-off-white text-sm">{ROLE_DISPLAY[officer.role] ?? officer.role}</div>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1">Session</div>
              <div className="text-green text-[9px] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green rounded-full inline-block" />
                Active
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray text-xs">No session found. <a href="/govern" className="text-gold hover:underline">Log in</a></p>
        )}
      </div>

      {/* Section 2 — Notification Preferences */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-gold" />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Notification Preferences</span>
        </div>
        <div className="space-y-4">
          {[
            { key: 'priority1',     label: 'Priority 1 Alerts',            desc: 'Critical risk escalations — always on', locked: true },
            { key: 'qprDefaults',   label: 'QPR Default Notifications',     desc: 'Notify when a project misses QPR deadline', locked: false },
            { key: 'newLitigation', label: 'New Litigation Filed',          desc: 'Alert when new case filed against registered project', locked: false },
            { key: 'weeklyReport',  label: 'Weekly Intelligence Summary',   desc: 'Automated digest every Monday 9 AM', locked: false },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <div className="text-sm text-off-white flex items-center gap-2">
                  {item.label}
                  {item.locked && (
                    <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-1.5 py-0.5 rounded-sm">LOCKED</span>
                  )}
                </div>
                <div className="text-xs text-gray mt-0.5">{item.desc}</div>
              </div>
              <button
                disabled={item.locked}
                onClick={() => !item.locked && setNotif(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${
                  notif[item.key as keyof typeof notif]
                    ? 'bg-gold'
                    : 'bg-surface2 border border-border'
                } ${item.locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-background rounded-full shadow transition-transform duration-200 ${
                    notif[item.key as keyof typeof notif] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Data Freshness */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-gold" />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Data Freshness</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Data Source', 'Last Sync', 'Frequency', 'Status'].map(h => (
                  <th key={h} className="text-left pb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-gray">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((src, i) => (
                <tr key={i} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 text-xs text-off-white pr-4">{src.name}</td>
                  <td className="py-2.5 text-xs text-gray pr-4 whitespace-nowrap">{src.last_sync}</td>
                  <td className="py-2.5 text-xs text-gray pr-4 whitespace-nowrap">{src.frequency}</td>
                  <td className="py-2.5">
                    {src.status === 'LIVE' ? (
                      <span className="flex items-center gap-1 text-[10px] text-green">
                        <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse" />
                        Live
                      </span>
                    ) : src.status === 'SYNCED' ? (
                      <span className="flex items-center gap-1 text-[10px] text-green">
                        <CheckCircle2 className="w-3 h-3" />
                        Synced
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-gray">
                        <Clock className="w-3 h-3" />
                        Scheduled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4 — Demo Mode */}
      <div className="bg-surface border border-border rounded-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-4 h-4 text-gold" />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Demo Mode</span>
        </div>
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="text-sm text-off-white mb-1">
              Enable Demo Mode
              {demoMode && (
                <span className="ml-2 text-[10px] bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded-sm font-bold">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-xs text-gray leading-relaxed">
              When enabled, a gold DEMO badge appears in all Govern pages and chatbot defaults to
              hardcoded responses. Recommended for presentations with DK Shivakumar.
            </p>
          </div>
          <button
            onClick={toggleDemoMode}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ${
              demoMode ? 'bg-gold' : 'bg-surface2 border border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 bg-background rounded-full shadow transition-transform duration-200 ${
                demoMode ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
