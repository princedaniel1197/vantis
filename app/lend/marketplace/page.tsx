'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react'

const LISTINGS = [
  {
    id: 'prestige',
    developer: 'Prestige Group',
    score: 760,
    band: 'green' as const,
    project: 'Prestige Whitefield Phase 3',
    city: 'Bengaluru',
    seeking_cr: 85,
    dcco: 'Dec 2026',
    rera: 'PRM/KA/RERA/1251/269/PR/2023/003421',
    rate: '7.8%',
    rate_note: 'premium developer discount',
    milestones_verified: 3,
    milestones_total: 5,
  },
  {
    id: 'mantri',
    developer: 'Mantri Developers',
    score: 620,
    band: 'amber' as const,
    project: 'Mantri Techzone Phase 2',
    city: 'Bengaluru',
    seeking_cr: 120,
    dcco: 'Jun 2027',
    rera: 'PRM/KA/RERA/1251/309/PR/2023/002891',
    rate: '9.2%',
    rate_note: 'watch-list premium',
    milestones_verified: 1,
    milestones_total: 5,
  },
  {
    id: 'skylark',
    developer: 'Skylark Mansions',
    score: 540,
    band: 'amber' as const,
    project: 'Skylark Horizon',
    city: 'Mysuru',
    seeking_cr: 60,
    dcco: 'Mar 2026',
    rera: 'PRM/KA/RERA/1251/400/PR/2023/001234',
    rate: '10.5%',
    rate_note: 'enhanced monitoring required',
    milestones_verified: 0,
    milestones_total: 5,
  },
]

const DRAW_SCHEDULE = [
  { id: 'T1', amount: 20, milestone: 'Foundation complete',  verified: true,  gate: 'Auto-release' },
  { id: 'T2', amount: 20, milestone: 'Plinth level',         verified: true,  gate: 'Auto-release' },
  { id: 'T3', amount: 15, milestone: 'Ground floor slab',    verified: true,  gate: 'Auto-release' },
  { id: 'T4', amount: 15, milestone: '4th floor slab',       verified: false, gate: 'CV scan required' },
  { id: 'T5', amount: 15, milestone: '8th floor slab',       verified: false, gate: 'CV scan + QPR required' },
]

const bandColor = {
  green: { text: '#2ECC71', bg: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.25)' },
  amber: { text: '#F39C12', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.25)' },
  red:   { text: '#E74C3C', bg: 'rgba(231,76,60,0.08)',  border: 'rgba(231,76,60,0.25)' },
}

const bandLabel = { green: 'INVESTMENT GRADE', amber: 'STANDARD', red: 'HIGH RISK' }

export default function MarketplacePage() {
  const [selected, setSelected] = useState<string | null>('prestige')

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">Vantis Lend · Deal Origination</div>
        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white leading-none">Vantis Marketplace</h1>
        <p className="text-gray text-sm mt-2">Pre-screened developer listings. Every project verified before appearing here.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active Listings',      value: '3',      color: '#C9A84C' },
          { label: 'Total Seeking',        value: '₹265 Cr', color: '#C9A84C' },
          { label: 'Milestones Verified',  value: '4 / 15', color: '#2ECC71' },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}
            className="bg-surface border border-border rounded-sm px-4 py-3 hover:border-gold/30 transition-all">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-1 block">{k.label}</span>
            <div className="font-syne text-xl sm:text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Listings */}
      <div className="space-y-4 mb-6">
        {LISTINGS.map(l => {
          const bc = bandColor[l.band]
          const isOpen = selected === l.id
          return (
            <div key={l.id} className="bg-surface border border-border rounded-sm overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setSelected(isOpen ? null : l.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface2 transition-colors text-left"
              >
                {/* Score */}
                <div
                  className="w-14 h-14 rounded-sm flex flex-col items-center justify-center shrink-0"
                  style={{ background: bc.bg, border: `1px solid ${bc.border}` }}
                >
                  <span className="font-syne text-xl font-bold" style={{ color: bc.text }}>{l.score}</span>
                  <span className="text-[7px] font-mono" style={{ color: bc.text }}>/ 900</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: bc.text, background: bc.bg, border: `1px solid ${bc.border}` }}>{bandLabel[l.band]}</span>
                  </div>
                  <div className="font-syne text-sm text-off-white">{l.project}</div>
                  <div className="text-xs text-gray">{l.developer} · {l.city}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-syne text-xl text-off-white font-bold">₹{l.seeking_cr} Cr</div>
                  <div className="text-xs font-mono" style={{ color: bc.text }}>{l.rate}</div>
                  <div className="text-[10px] text-gray">{l.rate_note}</div>
                </div>

                <ChevronRight
                  className="w-4 h-4 text-gray shrink-0 transition-transform duration-150"
                  style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
                />
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="border-t border-border px-5 py-4 bg-surface2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                    {[
                      { label: 'RERA Number', value: l.rera },
                      { label: 'DCCO',        value: l.dcco },
                      { label: 'Milestones',  value: `${l.milestones_verified} / ${l.milestones_total} verified` },
                    ].map(f => (
                      <div key={f.label}>
                        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5 block">{f.label}</span>
                        <div className="text-xs font-mono text-off-white break-all">{f.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Draw schedule — only for prestige */}
                  {l.id === 'prestige' && (
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3 block">Draw Schedule — Tranche-Linked Disbursement</span>
                      <div className="space-y-2">
                        {DRAW_SCHEDULE.map(t => (
                          <div key={t.id} className="flex items-center gap-3 p-3 rounded-sm border" style={{
                            background: t.verified ? 'rgba(46,204,113,0.04)' : 'transparent',
                            borderColor: t.verified ? 'rgba(46,204,113,0.2)' : '#1E1E2E',
                          }}>
                            <span className="text-[10px] font-mono text-gray w-6">{t.id}</span>
                            <span className="flex-1 text-xs text-off-white">{t.milestone}</span>
                            <span className="text-xs font-mono text-gray-light">₹{t.amount} Cr</span>
                            <span className="text-[9px] font-mono" style={{ color: t.verified ? '#2ECC71' : '#F39C12' }}>
                              {t.gate}
                            </span>
                            {t.verified
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0" />
                              : <Clock className="w-3.5 h-3.5 text-amber shrink-0" />
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {l.id !== 'prestige' && (
                    <div className="flex items-start gap-2 p-3 bg-amber/6 border border-amber/20 rounded-sm">
                      <AlertTriangle className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-light">Draw schedule requires milestone verification before tranches can be released. {l.milestones_verified === 0 ? 'No milestones verified yet — CV scan pending.' : `${l.milestones_verified} of ${l.milestones_total} milestones verified.`}</p>
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <button className="px-4 py-2 bg-gold text-background text-xs font-semibold rounded-sm hover:bg-gold-light transition-colors">
                      Express Interest
                    </button>
                    <button className="px-4 py-2 bg-surface border border-border text-gray text-xs rounded-sm hover:border-gold/40 hover:text-off-white transition-colors">
                      Request Due Diligence
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-surface border border-gold/20 rounded-sm p-4">
        <p className="text-gold text-xs font-medium mb-1">How Vantis Marketplace works</p>
        <p className="text-gray-light text-xs leading-relaxed">Every listing is pre-screened: RERA registration verified, escrow accounts checked, litigation cross-referenced, and developer score computed before the project appears here. Tranche-linked disbursement is enforced by the platform — funds release only when CV confirms milestone completion.</p>
      </div>
    </div>
  )
}
