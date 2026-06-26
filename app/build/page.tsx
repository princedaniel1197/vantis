import Link from 'next/link'
import { Box, MapPin, Activity, BarChart2, Database } from 'lucide-react'

const MODULES = [
  {
    href: '/build/sales/tower',
    label: '3D Interactive Tower',
    desc: 'Click any unit → CRM + government truth + AI query in 3 layers.',
    icon: Box,
    accent: 'text-gold',
    border: 'border-gold/30',
    dotColor: 'bg-gold',
    context: 'Sales · CRM · Gov Truth',
  },
  {
    href: '/build/land/parcel',
    label: 'Parcel Intelligence',
    desc: 'Survey boundary vs Bhoomi land record vs Kaveri title check.',
    icon: MapPin,
    accent: 'text-green',
    border: 'border-green/30',
    dotColor: 'bg-green',
    context: 'Land · Title · Registry',
  },
  {
    href: '/build/construction/reconciliation',
    label: 'Drone Reconciliation',
    desc: 'Physical vs QPR vs Finance — the three-way gap that moves lenders.',
    icon: Activity,
    accent: 'text-amber',
    border: 'border-amber/30',
    dotColor: 'bg-amber',
    context: 'Construction · RERA · Finance',
  },
  {
    href: '/build/approvals/market',
    label: 'Competitive Supply',
    desc: 'Every RERA project within 2.5km · pricing · absorption velocity.',
    icon: BarChart2,
    accent: 'text-blue',
    border: 'border-blue/30',
    dotColor: 'bg-blue',
    context: 'Market · Absorption · Pricing',
  },
  {
    href: '/dataroom',
    label: 'Lender Data Room',
    desc: 'Your verified government package — RERA, title, EC, QPR, escrow — shared with lender in one click.',
    icon: Database,
    accent: 'text-blue',
    border: 'border-blue/30',
    dotColor: 'bg-blue',
    context: 'Lend · Documents · Escrow',
  },
]

export default function BuildHubPage() {
  return (
    <div className="min-h-screen bg-background max-w-[900px] mx-auto">
      {/* Page header */}
      <div className="px-6 sm:px-8 py-5 border-b border-border shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">
          Vantis Build · Developer Intelligence · Divya Villas · JDA Projects
        </div>
        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white leading-none">
          Build Hub
        </h1>
      </div>

      <div className="px-6 sm:px-8 py-6">
        <div className="mb-6">
          <p className="text-gray text-sm">
            The developer OS wired into government truth. 8-stage project lifecycle
            with satellite, drone, registry, and AI.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODULES.map(m => (
            <Link
              key={m.href}
              href={m.href}
              className={`bg-surface border border-border rounded-sm p-4 sm:p-5 hover:border-gold/30 transition-all block group`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`flex items-center gap-1.5`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${m.dotColor}`} />
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">
                    {m.context}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-2 mt-2 mb-2 ${m.accent}`}>
                <m.icon className="w-4 h-4" />
                <span className="font-syne text-base font-bold text-off-white">{m.label}</span>
              </div>
              <p className="text-gray text-xs leading-relaxed">{m.desc}</p>
              <div
                className={`text-[9px] font-mono uppercase mt-3 ${m.accent} opacity-60 group-hover:opacity-100 transition-opacity`}
              >
                Open →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
