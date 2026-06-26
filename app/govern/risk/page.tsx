'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, ChevronDown, ChevronUp, AlertTriangle, ExternalLink } from 'lucide-react'

interface Component {
  label: string
  value: number
}

interface Developer {
  id: string
  name: string
  score: number
  components: Component[]
  projects: { id: string; name: string; status: string }[]
  enforcement?: string
}

const DEVELOPERS: Developer[] = [
  {
    id: 'prestige',
    name: 'Prestige Group',
    score: 91,
    components: [
      { label: 'QPR Compliance',        value: 95 },
      { label: 'Escrow Health',         value: 92 },
      { label: 'Litigation Density',    value: 85 },
      { label: 'Completion Rate',       value: 98 },
      { label: 'Complaint Volume',      value: 90 },
      { label: 'Financial Consistency', value: 88 },
    ],
    projects: [
      { id: 'prestige-lakeside', name: 'Prestige Lakeside Habitat', status: 'COMPLIANT' },
    ],
  },
  {
    id: 'zion',
    name: 'Zion Estate Developers',
    score: 78,
    components: [
      { label: 'QPR Compliance',        value: 88 },
      { label: 'Escrow Health',         value: 75 },
      { label: 'Litigation Density',    value: 78 },
      { label: 'Completion Rate',       value: 85 },
      { label: 'Complaint Volume',      value: 72 },
      { label: 'Financial Consistency', value: 68 },
    ],
    projects: [
      { id: 'divya-villas', name: 'Divya Villas', status: 'COMPLIANT' },
    ],
  },
  {
    id: 'skylark',
    name: 'Skylark Constructions',
    score: 54,
    components: [
      { label: 'QPR Compliance',        value: 62 },
      { label: 'Escrow Health',         value: 58 },
      { label: 'Litigation Density',    value: 52 },
      { label: 'Completion Rate',       value: 45 },
      { label: 'Complaint Volume',      value: 48 },
      { label: 'Financial Consistency', value: 60 },
    ],
    projects: [
      { id: 'skylark-arcadia', name: 'Skylark Arcadia', status: 'CAUTION' },
    ],
  },
  {
    id: 'ozone',
    name: 'Ozone Group',
    score: 9,
    components: [
      { label: 'QPR Compliance',        value: 8  },
      { label: 'Escrow Health',         value: 5  },
      { label: 'Litigation Density',    value: 3  },
      { label: 'Completion Rate',       value: 12 },
      { label: 'Complaint Volume',      value: 10 },
      { label: 'Financial Consistency', value: 18 },
    ],
    projects: [
      { id: 'ozone-urbana', name: 'Ozone Urbana', status: 'HIGH RISK' },
    ],
    enforcement: 'Flagged for enforcement review — penalty notices issued, RRC initiated',
  },
]

function scoreColor(s: number): string {
  if (s >= 70) return 'text-green'
  if (s >= 45) return 'text-amber'
  return 'text-red'
}

function scoreBorder(s: number): string {
  if (s >= 70) return 'border-green/20'
  if (s >= 45) return 'border-amber/20'
  return 'border-red/30'
}

function barColor(v: number): string {
  if (v >= 70) return 'bg-green'
  if (v >= 45) return 'bg-amber'
  return 'bg-red'
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

export default function DeveloperRiskIntelligence() {
  const [search,     setSearch]     = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(
    () => DEVELOPERS.filter(d => d.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  )

  function toggle(id: string) {
    setExpandedId(prev => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col min-h-full text-off-white">

      {/* Header */}
      <div className="px-6 sm:px-8 py-5 border-b border-border shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">
          K-RERA · Karnataka Real Estate Regulatory Authority · Developer Intelligence
        </div>
        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white leading-none">
          Developer Risk Intelligence
        </h1>
      </div>

      <div className="px-6 sm:px-8 py-6">

        <p className="text-gray text-xs mb-6">Trust scores across K-RERA registered developers</p>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search developer..."
            className="w-full bg-surface border border-border rounded-sm pl-9 pr-3 py-2 text-sm text-off-white placeholder:text-gray/50 focus:outline-none focus:border-gold/50"
          />
        </div>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((dev, index) => {
            const isExpanded = expandedId === dev.id
            return (
              <motion.div
                key={dev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                className={`bg-surface border rounded-sm overflow-hidden hover:border-gold/30 transition-all ${scoreBorder(dev.score)}`}
              >
                {/* Card top */}
                <div className="p-5">
                  {/* Name + score row */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h2 className="font-syne text-base font-semibold text-off-white mb-0.5">{dev.name}</h2>
                      <div className="flex flex-wrap gap-1.5">
                        {dev.projects.map(p => (
                          <div
                            key={p.id}
                            className="flex items-center gap-1.5"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                            <span className={`text-[9px] font-mono ${statusColor(p.status)}`}>{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-syne text-5xl font-bold leading-none ${scoreColor(dev.score)}`}>
                        {dev.score}
                      </div>
                      <div className="font-mono text-[9px] mt-1 uppercase tracking-[0.22em] text-gray">Trust Score</div>
                    </div>
                  </div>

                  {/* Enforcement warning */}
                  {dev.enforcement && (
                    <div className="flex items-start gap-2 bg-red/5 border border-red/20 rounded-sm px-3 py-2 mb-4">
                      <AlertTriangle className="w-3.5 h-3.5 text-red shrink-0 mt-0.5" />
                      <p className="text-red text-xs leading-snug">{dev.enforcement}</p>
                    </div>
                  )}

                  {/* Component mini bars */}
                  <div className="space-y-2">
                    {dev.components.map(c => (
                      <div key={c.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">{c.label}</span>
                          <span className={`font-mono text-[10px] font-bold ${barColor(c.value).replace('bg-', 'text-')}`}>
                            {c.value}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-surface2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor(c.value)}`}
                            style={{ width: `${c.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expand toggle */}
                <button
                  onClick={() => toggle(dev.id)}
                  className="w-full flex items-center justify-between px-5 py-3 border-t border-border bg-surface2/40 hover:bg-surface2 transition-colors duration-150 text-xs text-gray hover:text-off-white"
                >
                  <span>{isExpanded ? 'Hide projects' : 'View projects'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expanded project links */}
                {isExpanded && (
                  <div className="border-t border-border bg-surface2/20 px-5 py-4 space-y-2">
                    {dev.projects.map(p => (
                      <Link
                        key={p.id}
                        href={`/govern/projects/${p.id}`}
                        className="flex items-center justify-between group py-1.5"
                      >
                        <span className="text-xs text-off-white group-hover:text-gold transition-colors duration-150">
                          {p.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                            <span className={`text-[9px] font-mono ${statusColor(p.status)}`}>{p.status}</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray group-hover:text-gold transition-colors duration-150" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}

          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-12 text-gray text-sm">
              No developers match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
