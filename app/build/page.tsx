import Link from 'next/link'
import { Box, MapPin, Activity, BarChart2 } from 'lucide-react'

const MODULES = [
  {
    href: '/build/sales/tower',
    label: '3D Interactive Tower',
    desc: 'Click any unit → CRM + government truth + AI query in 3 layers.',
    icon: Box,
    accent: 'text-gold',
    border: 'border-gold/30',
  },
  {
    href: '/build/land/parcel',
    label: 'Parcel Intelligence',
    desc: 'Survey boundary vs Bhoomi land record vs Kaveri title check.',
    icon: MapPin,
    accent: 'text-green',
    border: 'border-green/30',
  },
  {
    href: '/build/construction/reconciliation',
    label: 'Drone Reconciliation',
    desc: 'Physical vs QPR vs Finance — the three-way gap that moves lenders.',
    icon: Activity,
    accent: 'text-amber',
    border: 'border-amber/30',
  },
  {
    href: '/build/approvals/market',
    label: 'Competitive Supply',
    desc: 'Every RERA project within 2.5km · pricing · absorption velocity.',
    icon: BarChart2,
    accent: 'text-blue',
    border: 'border-blue/30',
  },
]

export default function BuildHubPage() {
  return (
    <div className="min-h-screen bg-background p-8 max-w-[900px] mx-auto">
      <div className="mb-10">
        <h1 className="font-syne text-3xl text-off-white">Vantis Build</h1>
        <p className="text-gray text-sm mt-2">
          The developer OS wired into government truth. 8-stage project lifecycle
          with satellite, drone, registry, and AI.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map(m => (
          <Link
            key={m.href}
            href={m.href}
            className={`bg-surface border ${m.border} rounded-sm p-5 hover:bg-surface2 transition-colors block group`}
          >
            <div className={`flex items-center gap-2 mb-2 ${m.accent}`}>
              <m.icon className="w-4 h-4" />
              <span className="font-syne text-base">{m.label}</span>
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
  )
}
