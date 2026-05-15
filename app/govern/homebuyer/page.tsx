'use client'

import Link from 'next/link'
import { Users, AlertTriangle, ChevronRight, Shield } from 'lucide-react'

interface HomebuyerRow {
  project_id: string
  project_name: string
  developer: string
  status: string
  homebuyers: number
  capital_crore: number
  possession_status: string
  tier: 'CRITICAL' | 'WATCH' | 'CLEAR'
}

const ROWS: HomebuyerRow[] = [
  {
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    developer: 'Ozone Group',
    status: 'HIGH RISK',
    homebuyers: 1847,
    capital_crore: 927,
    possession_status: 'Overdue 4+ years — possession not given',
    tier: 'CRITICAL',
  },
  {
    project_id: 'skylark-arcadia',
    project_name: 'Skylark Arcadia',
    developer: 'Skylark Constructions',
    status: 'CAUTION',
    homebuyers: 98,
    capital_crore: 18.4,
    possession_status: 'Due Sep 2026 — 4 months',
    tier: 'WATCH',
  },
  {
    project_id: 'prestige-lakeside',
    project_name: 'Prestige Lakeside Habitat',
    developer: 'Prestige Group',
    status: 'COMPLIANT',
    homebuyers: 312,
    capital_crore: 189,
    possession_status: 'Due Jun 2027 — on track',
    tier: 'CLEAR',
  },
  {
    project_id: 'divya-villas',
    project_name: 'Divya Villas',
    developer: 'Zion Estate Developers',
    status: 'COMPLIANT',
    homebuyers: 18,
    capital_crore: 2.4,
    possession_status: 'Handover phase · 96% complete',
    tier: 'CLEAR',
  },
]

function tierConfig(t: string) {
  if (t === 'CRITICAL') return { textColor: 'text-red',   dotBg: 'bg-red',   label: 'CRITICAL', row: 'bg-red/5' }
  if (t === 'WATCH')    return { textColor: 'text-amber', dotBg: 'bg-amber', label: 'WATCH',    row: 'bg-amber/5' }
  return                       { textColor: 'text-green', dotBg: 'bg-green', label: 'CLEAR',    row: '' }
}

function statusColor(s: string) {
  if (s === 'COMPLIANT') return 'text-green'
  if (s === 'CAUTION')   return 'text-amber'
  return 'text-red'
}
function statusDot(s: string) {
  if (s === 'COMPLIANT') return 'bg-green'
  if (s === 'CAUTION')   return 'bg-amber'
  return 'bg-red'
}

export default function HomebuyerEarlyWarning() {
  const totalDistressed = ROWS.filter(r => r.tier === 'CRITICAL').reduce((s, r) => s + r.homebuyers, 0)
  const totalCapital    = ROWS.filter(r => r.tier !== 'CLEAR').reduce((s, r) => s + r.capital_crore, 0)
  const criticalCount   = ROWS.filter(r => r.tier === 'CRITICAL').length

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white">Homebuyer Early Warning</h1>
          <p className="text-gray text-xs mt-1">Proactive protection for at-risk homebuyers</p>
        </div>
        <Users className="w-6 h-6 text-gray hidden sm:block" />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-red/20 rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-red">{totalDistressed.toLocaleString('en-IN')}</div>
          <div className="text-gray text-xs mt-1">Homebuyers in Distressed Projects</div>
        </div>
        <div className="bg-surface border border-red/20 rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-red">₹{totalCapital.toFixed(0)} Cr</div>
          <div className="text-gray text-xs mt-1">Total Capital at Risk</div>
        </div>
        <div className="bg-surface border border-amber/20 rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-amber">{criticalCount}</div>
          <div className="text-gray text-xs mt-1">Projects in Critical State</div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-surface border border-border rounded-sm overflow-hidden mb-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface2">
              {['Project Name', 'Developer', 'Status', 'Homebuyers', 'Capital at Risk', 'Possession Status', 'Alert Tier', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-gray font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => {
              const tc = tierConfig(row.tier)
              return (
                <tr
                  key={row.project_id}
                  className={`border-b border-border last:border-0 group ${tc.row}`}
                >
                  <td className="px-4 py-4">
                    <div className="text-off-white text-sm font-medium">{row.project_name}</div>
                  </td>
                  <td className="px-4 py-4 text-gray text-xs">{row.developer}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${statusColor(row.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(row.status)}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`font-syne text-lg font-bold ${row.tier === 'CRITICAL' ? 'text-red' : row.tier === 'WATCH' ? 'text-amber' : 'text-off-white'}`}>
                      {row.homebuyers.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`font-mono text-sm font-bold ${row.tier === 'CRITICAL' ? 'text-red' : row.tier === 'WATCH' ? 'text-amber' : 'text-off-white'}`}>
                      ₹{row.capital_crore} Cr
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs leading-snug ${row.tier === 'CRITICAL' ? 'text-red' : row.tier === 'WATCH' ? 'text-amber' : 'text-gray'}`}>
                      {row.possession_status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${tc.textColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tc.dotBg}`} />
                      {tc.label}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/govern/projects/${row.project_id}`}
                      className="flex items-center gap-1 text-xs text-gray hover:text-gold transition-colors duration-150 whitespace-nowrap group/link"
                    >
                      View <ChevronRight className="w-3 h-3 group-hover/link:text-gold" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 mb-6">
        {ROWS.map(row => {
          const tc = tierConfig(row.tier)
          return (
            <div
              key={row.project_id}
              className={`border rounded-sm p-4 ${
                row.tier === 'CRITICAL' ? 'border-red/30 bg-red/5' :
                row.tier === 'WATCH'    ? 'border-amber/30 bg-amber/5' :
                'border-border bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-off-white text-sm font-medium">{row.project_name}</div>
                  <div className="text-gray text-xs">{row.developer}</div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold shrink-0 ${tc.textColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tc.dotBg}`} />
                  {tc.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Homebuyers</div>
                  <div className={`font-syne text-xl font-bold ${row.tier === 'CRITICAL' ? 'text-red' : row.tier === 'WATCH' ? 'text-amber' : 'text-off-white'}`}>
                    {row.homebuyers.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray uppercase tracking-wide mb-0.5">Capital at Risk</div>
                  <div className={`font-mono text-sm font-bold ${row.tier === 'CRITICAL' ? 'text-red' : row.tier === 'WATCH' ? 'text-amber' : 'text-off-white'}`}>
                    ₹{row.capital_crore} Cr
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className={`text-xs ${row.tier === 'CRITICAL' ? 'text-red' : row.tier === 'WATCH' ? 'text-amber' : 'text-gray'}`}>
                  {row.possession_status}
                </span>
                <Link
                  href={`/govern/projects/${row.project_id}`}
                  className="flex items-center gap-1 text-xs text-gray hover:text-gold transition-colors duration-150"
                >
                  View Project <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom callout */}
      <div className="border-l-2 border-gold pl-4 bg-surface rounded-sm p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div>
            <div className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">Vantis Proactive Intelligence</div>
            <div className="text-off-white text-sm leading-relaxed">
              K-RERA currently waits for homebuyers to file complaints.{' '}
              <strong>Vantis flags projects before the complaints arrive</strong> — using QPR patterns, escrow velocity,
              and litigation signals to identify distress 6–8 quarters early.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
