'use client'

import { Sparkles, MessageSquare, Shield, Database, Scale } from 'lucide-react'

const CAPABILITIES = [
  { icon: Shield,       label: 'QPR & Compliance',   desc: 'Instant answers on any project\'s filing status, penalty exposure, and next actions' },
  { icon: Database,     label: 'Project Intelligence', desc: 'Cross-reference K-RERA, Kaveri 2.0, eCourts, and escrow data in a single query' },
  { icon: Scale,        label: 'Notice Drafting',     desc: 'Draft show cause notices, RRC orders, and enforcement letters in seconds' },
  { icon: MessageSquare,label: 'Risk Analysis',       desc: 'Ask about any developer\'s risk profile, litigation exposure, or predictive default signals' },
]

export default function GovernIntelligence() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-5 pb-32">
      <div className="max-w-[520px] w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-gold" />
          <span className="font-syne text-2xl text-gold">Vantis Intelligence</span>
        </div>
        <p className="text-gray text-sm leading-relaxed mb-8">
          Your K-RERA AI assistant is open in the bottom-right corner.
          Ask anything about projects, compliance, litigation, or enforcement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          {CAPABILITIES.map(c => {
            const Icon = c.icon
            return (
              <div key={c.label} className="bg-surface border border-border rounded-sm px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-3.5 h-3.5 text-gold shrink-0" />
                  <span className="text-xs text-off-white font-medium">{c.label}</span>
                </div>
                <p className="text-[11px] text-gray leading-relaxed">{c.desc}</p>
              </div>
            )
          })}
        </div>

        <p className="text-[10px] font-mono text-gray mt-8 tracking-[0.1em]">
          DEMO MODE · CLICK THE BADGE TO SWITCH TO LIVE API
        </p>
      </div>
    </main>
  )
}
