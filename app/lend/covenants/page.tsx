'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react'

const COVENANT_PROJECTS = [
  { id: 'ozone-urbana',     name: 'Ozone Urbana',      escrow_pct: 54, escrow_ok: false, qpr_ok: false, noc_ok: false, dcco_ok: false, overall: 'red' },
  { id: 'concord-meridian', name: 'Concord Meridian',  escrow_pct: 61, escrow_ok: false, qpr_ok: true,  noc_ok: true,  dcco_ok: false, overall: 'amber' },
  { id: 'regent-heights',   name: 'Regent Heights',    escrow_pct: 58, escrow_ok: false, qpr_ok: true,  noc_ok: true,  dcco_ok: true,  overall: 'amber' },
  { id: 'skylark-arcadia',  name: 'Skylark Arcadia',   escrow_pct: 66, escrow_ok: false, qpr_ok: false, noc_ok: true,  dcco_ok: true,  overall: 'amber' },
  { id: 'mantri-techzone',  name: 'Mantri Techzone',   escrow_pct: 71, escrow_ok: true,  qpr_ok: true,  noc_ok: false, dcco_ok: true,  overall: 'amber' },
  { id: 'prestige-lakeside',name: 'Prestige Lakeside', escrow_pct: 78, escrow_ok: true,  qpr_ok: true,  noc_ok: true,  dcco_ok: true,  overall: 'green' },
  { id: 'divya-villas',     name: 'Divya Villas',      escrow_pct: 82, escrow_ok: true,  qpr_ok: true,  noc_ok: true,  dcco_ok: true,  overall: 'green' },
  { id: 'brigade-horizon',  name: 'Brigade Horizon',   escrow_pct: 75, escrow_ok: true,  qpr_ok: true,  noc_ok: true,  dcco_ok: true,  overall: 'green' },
  { id: 'sobha-crystal',    name: 'Sobha Crystal',     escrow_pct: 80, escrow_ok: true,  qpr_ok: true,  noc_ok: true,  dcco_ok: true,  overall: 'green' },
  { id: 'phoenix-metro',    name: 'Phoenix Metro',     escrow_pct: 77, escrow_ok: true,  qpr_ok: true,  noc_ok: true,  dcco_ok: true,  overall: 'green' },
]

const OZONE_COVENANTS = [
  { label: 'RERA Escrow 70% Rule',   status: 'BREACH',  detail: '54% deposited vs 70% mandate. ₹8.4 Cr shortfall on ₹28 Cr collected.', recommendation: 'Freeze further disbursements until escrow reaches 70%.' },
  { label: 'QPR Filing Currency',     status: 'BREACH',  detail: 'Q3 2023 QPR not filed. 47 days overdue. K-RERA show-cause pending.', recommendation: 'Demand QPR filing within 7 days or initiate covenant breach notice.' },
  { label: 'DCCO Compliance',         status: 'FLAGGED', detail: 'Original DCCO: Dec 2022. Extension filed: Mar 2023. 2nd extension risk flagged.', recommendation: 'Review construction schedule before next tranche approval.' },
]

export default function CovenantsPage() {
  const [expanded, setExpanded] = useState(false)

  const statusColor = { red: '#E74C3C', amber: '#F39C12', green: '#2ECC71' } as const
  const statusLabel = { red: 'BREACH', amber: 'WATCH', green: 'OK' } as const
  const covenantStatusColor: Record<string, string> = { BREACH: '#E74C3C', FLAGGED: '#F39C12', OK: '#2ECC71' }

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Covenant & Escrow Monitor</h1>
        <p className="text-gray text-sm mt-0.5">Real-time rule engine on RERA 70%, QPR currency, NOC validity, and DCCO compliance.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          { label: 'Covenant Breaches', value: 3,  color: '#E74C3C', bg: 'bg-red/8 border-red/20' },
          { label: 'Watch Items',       value: 6,  color: '#F39C12', bg: 'bg-amber/8 border-amber/20' },
          { label: 'Compliant',         value: 31, color: '#2ECC71', bg: 'bg-green/8 border-green/20' },
          { label: 'DCCO Extensions',   value: 2,  color: '#F39C12', bg: 'bg-amber/8 border-amber/20' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} border rounded-sm px-4 py-3`}>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] mb-1" style={{ color: k.color, opacity: 0.7 }}>{k.label}</div>
            <div className="font-syne text-3xl font-bold" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Hero breach — Ozone Urbana */}
      <div className="bg-surface border border-red/30 rounded-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[9px] font-mono text-red uppercase tracking-[0.15em] mb-0.5">ACTIVE BREACH — PRIORITY ACTION REQUIRED</div>
            <h2 className="font-syne text-lg text-off-white">Ozone Urbana</h2>
          </div>
          <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-xs text-gray hover:text-gold transition-colors">
            {expanded ? 'Collapse' : 'Expand Detail'}{expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
        <div className="space-y-3">
          {OZONE_COVENANTS.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-surface2 rounded-sm border border-border">
              <div className="shrink-0 mt-0.5">
                {c.status === 'BREACH' ? <AlertTriangle className="w-4 h-4 text-red" /> : <Clock className="w-4 h-4 text-amber" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-off-white font-medium">{c.label}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: covenantStatusColor[c.status], background: covenantStatusColor[c.status] + '20' }}>{c.status}</span>
                </div>
                <p className="text-[10px] text-gray leading-relaxed">{c.detail}</p>
                {expanded && <p className="text-[10px] text-gold mt-1.5 leading-relaxed">→ {c.recommendation}</p>}
              </div>
            </div>
          ))}
        </div>
        {expanded && (
          <div className="mt-4 px-4 py-3 bg-red/6 border border-red/20 rounded-sm">
            <p className="text-red text-xs font-medium">Recommended Action</p>
            <p className="text-gray-light text-xs mt-1 leading-relaxed">Withhold T5 disbursement (₹40 Cr) until: (1) RERA escrow reaches 70% threshold, (2) Q3 2023 QPR is filed with K-RERA, (3) DCCO extension risk assessed by site inspection.</p>
          </div>
        )}
      </div>

      {/* Project table */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-surface2">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">All Projects — Covenant Status</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface2">
              <tr>
                {['Project', 'Escrow %', 'QPR', 'NOC', 'DCCO', 'Overall'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-[0.1em] text-gray">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COVENANT_PROJECTS.map(p => (
                <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-surface2/50 transition-colors">
                  <td className="px-4 py-2.5 text-xs text-off-white">{p.name}</td>
                  <td className="px-4 py-2.5 text-xs font-mono" style={{ color: p.escrow_ok ? '#2ECC71' : p.escrow_pct >= 60 ? '#F39C12' : '#E74C3C' }}>{p.escrow_pct}%</td>
                  <td className="px-4 py-2.5">{p.qpr_ok ? <CheckCircle2 className="w-3.5 h-3.5 text-green" /> : <AlertTriangle className="w-3.5 h-3.5 text-red" />}</td>
                  <td className="px-4 py-2.5">{p.noc_ok ? <CheckCircle2 className="w-3.5 h-3.5 text-green" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber" />}</td>
                  <td className="px-4 py-2.5">{p.dcco_ok ? <CheckCircle2 className="w-3.5 h-3.5 text-green" /> : <Clock className="w-3.5 h-3.5 text-amber" />}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm" style={{ color: statusColor[p.overall as keyof typeof statusColor], background: statusColor[p.overall as keyof typeof statusColor] + '20' }}>
                      {statusLabel[p.overall as keyof typeof statusLabel]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
