'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>Project Parameters</div>
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
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] mb-4" style={{ color: 'var(--muted)' }}>Financial Breakdown</div>
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
        </div>
      </div>
    </div>
  )
}
