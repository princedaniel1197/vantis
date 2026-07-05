'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Landmark, Building2, Save, X, ArrowRight } from 'lucide-react'

// ⊕ Vantis column — real local inputs from the government record (BBMP FAR + Kaveri price)
const GOV_PARCELS = [
  { key: 'meridian', label: 'Prestige Skyline · Whitefield', far: 3.25, selling_price_psf: 11200, construction_cost_psf: 2600, land_area_sqft: 27000, land_cost_cr: 34, note: 'BBMP FAR 3.25 (TOD zone) · Kaveri median ₹11,200/sqft (Q4 2025, 284 deals)' },
  { key: 'ozone', label: 'Ozone Urbana · Devanahalli', far: 1.75, selling_price_psf: 6400, construction_cost_psf: 2200, land_area_sqft: 40000, land_cost_cr: 12, note: 'BBMP FAR 1.75 (peripheral) · Kaveri distressed ₹6,400/sqft — conversion revoked, buildable area disputed' },
  { key: 'divya', label: 'Divya Villas · Mysuru', far: 1.5, selling_price_psf: 4900, construction_cost_psf: 1900, land_area_sqft: 18000, land_cost_cr: 6.2, note: 'MUDA FAR 1.5 (villa plotted) · Kaveri median ₹4,900/sqft (Kadakola)' },
] as const

type SchemeSlot = 'A' | 'B' | 'C'
const SLOT_COLOR: Record<SchemeSlot, string> = { A: 'var(--gold)', B: 'var(--blue)', C: 'var(--rb)' }

const DEFAULTS = {
  land_area_sqft: 20000,
  land_cost_cr: 8.4,
  far: 2.5,
  efficiency_pct: 72,
  avg_unit_size_sqft: 1400,
  selling_price_psf: 9800,
  construction_cost_psf: 2400,
  marketing_pct: 3,
  contingency_pct: 5,
  approval_cost_cr: 0.8,
}

function compute(inputs: typeof DEFAULTS) {
  const buildable_sqft = inputs.land_area_sqft * inputs.far * (inputs.efficiency_pct / 100)
  const total_units = Math.floor(buildable_sqft / inputs.avg_unit_size_sqft)
  const revenue_cr = (total_units * inputs.avg_unit_size_sqft * inputs.selling_price_psf) / 1e7
  const construction_cost_cr = (buildable_sqft * inputs.construction_cost_psf) / 1e7
  const marketing_cost_cr = revenue_cr * (inputs.marketing_pct / 100)
  const contingency_cr = (construction_cost_cr + marketing_cost_cr) * (inputs.contingency_pct / 100)
  const total_cost_cr = inputs.land_cost_cr + inputs.approval_cost_cr + construction_cost_cr + marketing_cost_cr + contingency_cr
  const gross_profit_cr = revenue_cr - total_cost_cr
  const margin_pct = (gross_profit_cr / revenue_cr) * 100
  const roi_pct = (gross_profit_cr / inputs.land_cost_cr) * 100
  return { buildable_sqft, total_units, revenue_cr, construction_cost_cr, marketing_cost_cr, contingency_cr, total_cost_cr, gross_profit_cr, margin_pct, roi_pct }
}

export default function FeasibilityPage() {
  const [inputs, setInputs] = useState(DEFAULTS)
  const result = compute(inputs)

  const set = (key: keyof typeof DEFAULTS, value: number) => setInputs(prev => ({ ...prev, [key]: value }))
  const isViable = result.margin_pct >= 20
  const isMarginal = result.margin_pct >= 12 && result.margin_pct < 20

  const [govParcel, setGovParcel] = useState<string | null>(null)
  const [schemes, setSchemes] = useState<Record<SchemeSlot, typeof DEFAULTS | null>>({ A: null, B: null, C: null })

  const applyGov = (p: (typeof GOV_PARCELS)[number]) => {
    setGovParcel(p.key)
    setInputs(prev => ({ ...prev, far: p.far, selling_price_psf: p.selling_price_psf, construction_cost_psf: p.construction_cost_psf, land_area_sqft: p.land_area_sqft, land_cost_cr: p.land_cost_cr }))
  }
  const saveScheme = (slot: SchemeSlot) => setSchemes(prev => ({ ...prev, [slot]: inputs }))
  const clearScheme = (slot: SchemeSlot) => setSchemes(prev => ({ ...prev, [slot]: null }))
  const activeGov = GOV_PARCELS.find(p => p.key === govParcel)
  const savedSlots = (Object.keys(schemes) as SchemeSlot[]).filter(s => schemes[s])

  const FIELDS: { key: keyof typeof DEFAULTS; label: string; unit: string; step: number }[] = [
    { key: 'land_area_sqft', label: 'Land Area', unit: 'sqft', step: 1000 },
    { key: 'land_cost_cr', label: 'Land Cost', unit: '₹ Cr', step: 0.1 },
    { key: 'far', label: 'FAR / FSI', unit: 'x', step: 0.25 },
    { key: 'efficiency_pct', label: 'Efficiency', unit: '%', step: 1 },
    { key: 'avg_unit_size_sqft', label: 'Avg Unit Size', unit: 'sqft', step: 50 },
    { key: 'selling_price_psf', label: 'Selling Price', unit: '₹/sqft', step: 100 },
    { key: 'construction_cost_psf', label: 'Construction Cost', unit: '₹/sqft', step: 100 },
    { key: 'marketing_pct', label: 'Marketing', unit: '%', step: 0.5 },
    { key: 'approval_cost_cr', label: 'Approvals', unit: '₹ Cr', step: 0.1 },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Intelligence · Finance</div>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Feasibility Engine</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Instant project feasibility with Kaveri market data and live BBMP FAR limits built in.
        </p>
      </div>

      {/* ⊕ Vantis column — run the model on the government's numbers */}
      <div className="p-4 rounded-sm mb-5" style={{ background: 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 25%, var(--bord))' }}>
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="w-4 h-4" style={{ color: 'var(--gold)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--gold)' }}>Prefill from Government Record — BBMP FAR + Kaveri Price</span>
          <span className="font-mono text-[9px] ml-auto" style={{ color: 'var(--muted)' }}>TestFit uses your assumptions; we use the record.</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {GOV_PARCELS.map(p => {
            const active = govParcel === p.key
            return (
              <button key={p.key} onClick={() => applyGov(p)}
                className="px-3 py-2 rounded-sm text-xs font-mono flex items-center gap-2"
                style={{ background: active ? 'color-mix(in srgb, var(--gold) 12%, var(--surf))' : 'var(--surf)', color: active ? 'var(--ink)' : 'var(--muted)', border: `1px solid ${active ? 'var(--gold)' : 'var(--bord)'}` }}>
                <Landmark className="w-3 h-3" style={{ color: 'var(--gold)' }} />{p.label}
              </button>
            )
          })}
        </div>
        {activeGov && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <div className="font-mono text-[10px] flex-1 min-w-[220px]" style={{ color: 'var(--muted)' }}>
              Loaded: <span style={{ color: 'var(--gold)' }}>FAR {activeGov.far}</span> · <span style={{ color: 'var(--gold)' }}>₹{activeGov.selling_price_psf.toLocaleString()}/sqft</span> — {activeGov.note}
            </div>
            <Link href="/land" className="font-mono text-[10px] flex items-center gap-1 shrink-0 hover:underline" style={{ color: 'var(--gold)' }}>Parcel title &amp; risk <ArrowRight className="w-3 h-3" /></Link>
            <Link href="/market" className="font-mono text-[10px] flex items-center gap-1 shrink-0 hover:underline" style={{ color: 'var(--gold)' }}>Market pricing <ArrowRight className="w-3 h-3" /></Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-4 block" style={{ color: 'var(--muted)' }}>Project Parameters</span>
          <div className="space-y-3">
            {FIELDS.map(f => (
              <div key={f.key} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-1" style={{ color: 'var(--ink)' }}>{f.label}</div>
                  <input
                    type="range"
                    min={f.key === 'land_area_sqft' ? 5000 : f.key === 'land_cost_cr' ? 0.5 : f.key === 'far' ? 0.5 : f.key === 'efficiency_pct' ? 50 : f.key === 'avg_unit_size_sqft' ? 600 : f.key === 'selling_price_psf' ? 4000 : f.key === 'construction_cost_psf' ? 1500 : 0}
                    max={f.key === 'land_area_sqft' ? 100000 : f.key === 'land_cost_cr' ? 50 : f.key === 'far' ? 5 : f.key === 'efficiency_pct' ? 90 : f.key === 'avg_unit_size_sqft' ? 3000 : f.key === 'selling_price_psf' ? 20000 : f.key === 'construction_cost_psf' ? 5000 : 15}
                    step={f.step}
                    value={inputs[f.key]}
                    onChange={e => set(f.key, parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: 'var(--gold)' }}
                  />
                </div>
                <div className="text-right shrink-0 w-24">
                  <div className="font-mono text-sm" style={{ color: 'var(--gold)' }}>{inputs[f.key].toLocaleString()}</div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{f.unit}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Verdict */}
          <motion.div key={isViable ? 'viable' : isMarginal ? 'marginal' : 'not-viable'}
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="p-5 rounded-sm"
            style={{
              background: isViable ? 'color-mix(in srgb, var(--ra) 6%, var(--surf))' : isMarginal ? 'color-mix(in srgb, var(--rb) 6%, var(--surf))' : 'color-mix(in srgb, var(--rc) 6%, var(--surf))',
              border: `2px solid ${isViable ? 'var(--ra)' : isMarginal ? 'var(--rb)' : 'var(--rc)'}`,
            }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="font-display italic text-5xl" style={{ color: isViable ? 'var(--ra)' : isMarginal ? 'var(--rb)' : 'var(--rc)' }}>
                {result.margin_pct.toFixed(1)}%
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: isViable ? 'var(--ra)' : isMarginal ? 'var(--rb)' : 'var(--rc)' }}>
                  {isViable ? 'Viable ✓' : isMarginal ? 'Marginal — Review ⚠' : 'Not Viable ✗'}
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Gross Margin</div>
              </div>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'var(--surf2)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, result.margin_pct)}%`, background: isViable ? 'var(--ra)' : isMarginal ? 'var(--rb)' : 'var(--rc)' }} />
            </div>
          </motion.div>

          {/* Breakdown */}
          <div className="p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-4 block" style={{ color: 'var(--muted)' }}>Financial Breakdown</span>
            <div className="space-y-2">
              {[
                { label: 'Buildable Area', value: `${result.buildable_sqft.toLocaleString()} sqft`, color: 'var(--ink)' },
                { label: 'Total Units', value: result.total_units.toString(), color: 'var(--gold)' },
                { label: 'Gross Revenue', value: `₹${result.revenue_cr.toFixed(2)} Cr`, color: 'var(--ra)' },
                { label: 'Land Cost', value: `₹${inputs.land_cost_cr.toFixed(2)} Cr`, color: 'var(--muted)' },
                { label: 'Construction Cost', value: `₹${result.construction_cost_cr.toFixed(2)} Cr`, color: 'var(--muted)' },
                { label: 'Marketing', value: `₹${result.marketing_cost_cr.toFixed(2)} Cr`, color: 'var(--muted)' },
                { label: 'Approvals + Contingency', value: `₹${(inputs.approval_cost_cr + result.contingency_cr).toFixed(2)} Cr`, color: 'var(--muted)' },
                { label: 'Total Cost', value: `₹${result.total_cost_cr.toFixed(2)} Cr`, color: 'var(--ink)' },
                { label: 'Gross Profit', value: `₹${result.gross_profit_cr.toFixed(2)} Cr`, color: result.gross_profit_cr >= 0 ? 'var(--ra)' : 'var(--rc)' },
                { label: 'ROI on Land', value: `${result.roi_pct.toFixed(1)}%`, color: result.roi_pct >= 150 ? 'var(--ra)' : result.roi_pct >= 80 ? 'var(--rb)' : 'var(--rc)' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1.5 text-xs" style={{ borderBottom: '1px solid var(--bord)' }}>
                  <span style={{ color: 'var(--muted)' }}>{row.label}</span>
                  <span className="font-mono" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Massing schematic + save-to-scheme */}
          <div className="p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Massing (schematic)</span>
              <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{Math.max(1, Math.round(result.total_units / 90))} blocks · {Math.round(result.total_units * 1.2)} car stalls · {(inputs.far).toFixed(2)} FAR</span>
            </div>
            {(() => {
              const towers = Math.max(1, Math.min(6, Math.round(result.total_units / 90)))
              const floors = Math.max(4, Math.min(30, Math.round(inputs.far * 7)))
              const bw = 640 / (towers * 1.4)
              return (
                <svg viewBox="0 0 640 200" className="w-full" style={{ maxHeight: 180 }}>
                  <rect x="0" y="150" width="640" height="50" fill="var(--surf2)" />
                  {Array.from({ length: Math.round(result.total_units * 1.2 / 12) }).slice(0, 40).map((_, i) => (
                    <rect key={`p${i}`} x={8 + i * 15} y="168" width="10" height="16" rx="1" fill="none" stroke="var(--bord)" strokeWidth="1" />
                  ))}
                  {Array.from({ length: towers }).map((_, t) => {
                    const h = floors * 4.2
                    const x = 30 + t * (bw + bw * 0.4)
                    return (
                      <g key={`t${t}`}>
                        <rect x={x} y={150 - h} width={bw} height={h} fill="color-mix(in srgb, var(--gold) 18%, var(--surf2))" stroke="var(--gold)" strokeWidth="1" />
                        {Array.from({ length: floors }).map((__, f) => (
                          <line key={f} x1={x} y1={150 - h + f * 4.2} x2={x + bw} y2={150 - h + f * 4.2} stroke="var(--bord)" strokeWidth="0.5" />
                        ))}
                      </g>
                    )
                  })}
                </svg>
              )
            })()}
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(['A', 'B', 'C'] as SchemeSlot[]).map(slot => (
                <button key={slot} onClick={() => saveScheme(slot)}
                  className="py-1.5 text-xs font-mono flex items-center justify-center gap-1 rounded-sm"
                  style={{ border: `1px solid ${schemes[slot] ? SLOT_COLOR[slot] : 'var(--bord)'}`, color: schemes[slot] ? SLOT_COLOR[slot] : 'var(--muted)' }}>
                  <Save className="w-3 h-3" /> Save to {slot}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scheme A/B/C compare */}
      {savedSlots.length > 0 && (
        <div className="mt-6 rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--bord)' }}>
            <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Scheme Compare — A / B / C</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bord)' }}>
                {['Metric', ...savedSlots].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: h === 'Metric' ? 'var(--muted)' : SLOT_COLOR[h as SchemeSlot] }}>
                    {h === 'Metric' ? h : `Scheme ${h}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                ['FAR / FSI', (s: typeof DEFAULTS) => `${s.far.toFixed(2)}x`],
                ['Total Units', (s: typeof DEFAULTS) => compute(s).total_units.toString()],
                ['Gross Revenue', (s: typeof DEFAULTS) => `₹${compute(s).revenue_cr.toFixed(1)} Cr`],
                ['Total Cost', (s: typeof DEFAULTS) => `₹${compute(s).total_cost_cr.toFixed(1)} Cr`],
                ['Gross Margin', (s: typeof DEFAULTS) => `${compute(s).margin_pct.toFixed(1)}%`],
                ['ROI on Land', (s: typeof DEFAULTS) => `${compute(s).roi_pct.toFixed(0)}%`],
              ] as [string, (s: typeof DEFAULTS) => string][]).map(([label, fn]) => (
                <tr key={label} style={{ borderBottom: '1px solid var(--bord)' }}>
                  <td className="px-4 py-2" style={{ color: 'var(--muted)' }}>{label}</td>
                  {savedSlots.map(slot => {
                    const s = schemes[slot]!
                    const isMargin = label === 'Gross Margin'
                    const mv = compute(s).margin_pct
                    return (
                      <td key={slot} className="px-4 py-2 font-mono" style={{ color: isMargin ? (mv >= 20 ? 'var(--ra)' : mv >= 12 ? 'var(--rb)' : 'var(--rc)') : 'var(--ink)' }}>{fn(s)}</td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className="px-4 py-2" style={{ color: 'var(--muted)' }}></td>
                {savedSlots.map(slot => (
                  <td key={slot} className="px-4 py-2">
                    <button onClick={() => clearScheme(slot)} className="font-mono text-[10px] flex items-center gap-1" style={{ color: 'var(--muted)' }}>
                      <X className="w-2.5 h-2.5" /> clear
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
