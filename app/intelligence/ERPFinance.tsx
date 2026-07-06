'use client'

import StageView, { type StageRow } from './StageView'
import { financeRows, type DensityNode } from '@/lib/ontology'

export default function ERPFinance({ skin, density }: { skin: 'A' | 'B'; density?: DensityNode[] }) {
  const rows = financeRows()
  const stageRows: StageRow[] = rows.map(r => ({
    id: r.id, project: r.project, developer: r.developer, tier: r.tier,
    declLabel: 'DECLARED', declPct: r.declared_pct, verLabel: 'KAVERI', verPct: r.registered_pct, gap: r.fin_gap,
    extra: `Escrow ${r.escrow_funded}% / ${r.escrow_mandate}%`,
  }))
  const worst = rows.reduce((a, b) => (b.fin_gap > a.fin_gap ? b : a), rows[0])
  const counts = {
    atRisk: rows.filter(r => r.tier === 'AT_RISK').length,
    watch: rows.filter(r => r.tier === 'WATCH').length,
    healthy: rows.filter(r => r.tier === 'HEALTHY').length,
  }
  return (
    <StageView
      skin={skin} density={density}
      eyebrow="ERP · FINANCIAL VERIFICATION"
      title="Escrow & Collections"
      subtitle="Declared RERA collections vs actual Kaveri registrations, and escrow vs the 70% mandate."
      headlineValue={`−${worst.fin_gap}`} headlineLabel="OZONE FIN GAP" headlineColor="#ff7a6d"
      counts={counts} rows={stageRows}
      captionTop="ERP · ESCROW & COLLECTIONS"
      captionSub="the money follows the concrete"
      roadmap="Farvision / ERP + Kaveri connectors are roadmap — figures shown are demo data, not a live third-party or government feed."
    />
  )
}
