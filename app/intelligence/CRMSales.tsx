'use client'

import StageView, { type StageRow } from './StageView'
import { salesRows, type DensityNode } from '@/lib/ontology'

export default function CRMSales({ skin, density }: { skin: 'A' | 'B'; density?: DensityNode[] }) {
  const rows = salesRows()
  const stageRows: StageRow[] = rows.map(r => ({
    id: r.id, project: r.project, developer: r.developer, tier: r.tier,
    declLabel: 'CLAIMED', declPct: r.claimed_pct, verLabel: 'REGISTERED', verPct: r.registered_pct, gap: r.sales_gap,
    extra: `${r.booked_units}/${r.total_units} units`,
  }))
  const worst = rows.reduce((a, b) => (b.sales_gap > a.sales_gap ? b : a), rows[0])
  const counts = {
    atRisk: rows.filter(r => r.tier === 'AT_RISK').length,
    watch: rows.filter(r => r.tier === 'WATCH').length,
    healthy: rows.filter(r => r.tier === 'HEALTHY').length,
  }
  return (
    <StageView
      skin={skin} density={density}
      eyebrow="CRM · SALES VERIFICATION"
      title="Booking Velocity"
      subtitle="Claimed bookings vs actual Kaveri registrations — a declared-vs-delivered signal for sales."
      headlineValue={`−${worst.sales_gap}`} headlineLabel="OZONE SALES GAP" headlineColor="#ff7a6d"
      counts={counts} rows={stageRows}
      captionTop="CRM · BOOKINGS"
      captionSub="claimed velocity vs the registry"
      roadmap="Sell.Do / CRM + Kaveri connectors are roadmap — figures shown are demo data, not a live third-party or government feed."
    />
  )
}
