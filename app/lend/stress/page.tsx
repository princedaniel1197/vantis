'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, Activity, CheckCircle2, TrendingDown } from 'lucide-react'

const BASE = { red: 3, amber: 9, green: 28, total: 40, exposure: 2400, at_risk: 420 }

function computeStress(downturn: number, costInflation: number, rateBps: number) {
  // Each 10% downturn: ~1 green→amber, ~0.5 amber→red
  // Each 10% cost inflation: ~0.8 green→amber, ~0.3 amber→red
  // Each 100 bps: ~0.4 green→amber, ~0.2 amber→red
  const fromDownturn     = (downturn / 10)
  const fromCost         = (costInflation / 10)
  const fromRate         = (rateBps / 100)

  const greenToAmber = Math.min(BASE.green - 1, Math.round(fromDownturn * 1.0 + fromCost * 0.8 + fromRate * 0.4))
  const amberToRed   = Math.min(BASE.amber - 1, Math.round(fromDownturn * 0.5 + fromCost * 0.3 + fromRate * 0.2))

  const newGreen = Math.max(1, BASE.green - greenToAmber)
  const newAmber = Math.max(0, BASE.amber + greenToAmber - amberToRed)
  const newRed   = BASE.red + amberToRed

  const newAtRisk = Math.round(BASE.at_risk + amberToRed * 78 + greenToAmber * 20)

  return { red: newRed, amber: newAmber, green: newGreen, at_risk: Math.min(2400, newAtRisk) }
}

function SliderRow({
  label, value, min, max, step, unit, setValue,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  setValue: (v: number) => void
}) {
  const pct        = ((value - min) / (max - min)) * 100
  const stressColor = value === min ? '#2ECC71' : value <= max * 0.33 ? '#2ECC71' : value <= max * 0.66 ? '#F39C12' : '#E74C3C'
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs text-off-white font-medium">{label}</label>
        <span className="text-sm font-mono font-bold" style={{ color: stressColor }}>
          {unit === 'bps' ? `+${value} bps` : `+${value}%`}
        </span>
      </div>
      <div className="relative">
        {/* Visual track */}
        <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1 pointer-events-none">
          <div className="h-full rounded-full transition-all duration-200"
            style={{ width: `${pct}%`, background: stressColor }} />
        </div>
        {/* Interactive input absolutely over track */}
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="absolute inset-x-0 cursor-pointer opacity-0"
          style={{ top: '-2px', height: '22px' }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-gray mt-1">
        <span>0{unit === 'bps' ? ' bps' : '%'}</span>
        <span>{max}{unit === 'bps' ? ' bps' : '%'}</span>
      </div>
    </div>
  )
}

function BandBar({ label, count, total, color, bg, border }: {
  label: string; count: number; total: number; color: string; bg: string; border: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-mono uppercase tracking-[0.1em]" style={{ color }}>{label}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>{count}</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${(count / total) * 100}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function StressTestPage() {
  const [downturn,      setDownturn]      = useState(0)
  const [costInflation, setCostInflation] = useState(0)
  const [rateBps,       setRateBps]       = useState(0)

  const stressed  = useMemo(() => computeStress(downturn, costInflation, rateBps), [downturn, costInflation, rateBps])
  const isBase    = downturn === 0 && costInflation === 0 && rateBps === 0

  const scenarios = [
    { label: 'Mild Downturn',     downturn: 10, cost: 5,  rate: 100 },
    { label: 'Moderate Stress',   downturn: 25, cost: 15, rate: 200 },
    { label: 'Severe Downturn',   downturn: 40, cost: 30, rate: 350 },
    { label: '2008 Analog',       downturn: 50, cost: 40, rate: 400 },
  ]

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Portfolio Stress Test</h1>
        <p className="text-gray text-sm mt-0.5">
          Adjust macro assumptions to see how the Kaveri HFC book migrates between risk bands in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sliders */}
        <div className="flex flex-col gap-5">
          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-5">
              Macro Assumptions
            </div>
            <div className="space-y-6">
              <SliderRow
                label="Real Estate Price Downturn"
                value={downturn} min={0} max={50} step={5} unit="%"
                setValue={setDownturn}
              />
              <SliderRow
                label="Construction Cost Inflation"
                value={costInflation} min={0} max={40} step={5} unit="%"
                setValue={setCostInflation}
              />
              <SliderRow
                label="Interest Rate Hike"
                value={rateBps} min={0} max={400} step={25} unit="bps"
                setValue={setRateBps}
              />
            </div>

            {/* Quick scenarios */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Quick Scenarios</div>
              <div className="grid grid-cols-2 gap-2">
                {scenarios.map(s => (
                  <button
                    key={s.label}
                    onClick={() => { setDownturn(s.downturn); setCostInflation(s.cost); setRateBps(s.rate) }}
                    className="text-left px-3 py-2.5 rounded-sm border border-border hover:border-gold/40 bg-surface2 hover:bg-surface2/80 transition-colors"
                  >
                    <div className="text-xs text-off-white font-medium">{s.label}</div>
                    <div className="text-[9px] text-gray mt-0.5 font-mono">
                      -{s.downturn}% RE · +{s.cost}% cost · +{s.rate}bps
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setDownturn(0); setCostInflation(0); setRateBps(0) }}
                className="mt-2 w-full text-xs text-gray hover:text-gold font-mono transition-colors py-2"
              >
                Reset to base case
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-4">

          {/* Before / After at-risk */}
          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
              Capital at Risk
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-mono text-gray mb-1">Base Case</div>
                <div className="font-syne text-3xl text-off-white">₹{BASE.at_risk} Cr</div>
                <div className="text-[10px] text-gray mt-0.5">{BASE.red} flagged · {BASE.amber} watch</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-gray mb-1">Stressed</div>
                <div
                  className="font-syne text-3xl transition-all duration-500"
                  style={{ color: stressed.at_risk > BASE.at_risk + 200 ? '#E74C3C' : stressed.at_risk > BASE.at_risk + 50 ? '#F39C12' : '#2ECC71' }}
                >
                  ₹{stressed.at_risk.toLocaleString('en-IN')} Cr
                </div>
                <div className="text-[10px] text-gray mt-0.5">{stressed.red} flagged · {stressed.amber} watch</div>
              </div>
            </div>

            {stressed.at_risk > BASE.at_risk && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-red/8 border border-red/20 rounded-sm">
                <TrendingDown className="w-4 h-4 text-red shrink-0" />
                <div>
                  <span className="text-red text-xs font-mono font-bold">
                    +₹{(stressed.at_risk - BASE.at_risk).toLocaleString('en-IN')} Cr additional exposure at risk
                  </span>
                  <p className="text-gray text-[10px] mt-0.5">
                    {stressed.red - BASE.red} more projects flip to HIGH RISK in this scenario.
                  </p>
                </div>
              </div>
            )}

            {isBase && (
              <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-green/8 border border-green/20 rounded-sm">
                <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
                <span className="text-green text-xs">Base case — no stress applied. Move sliders to test.</span>
              </div>
            )}
          </div>

          {/* Band distribution */}
          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
              Portfolio Band Distribution (40 projects)
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray mb-3">Base Case</div>
                <div className="space-y-3">
                  <BandBar label="High Risk" count={BASE.red}   total={40} color="#E74C3C" bg="rgba(231,76,60,0.1)" border="rgba(231,76,60,0.3)" />
                  <BandBar label="Watch"     count={BASE.amber} total={40} color="#F39C12" bg="rgba(243,156,18,0.1)" border="rgba(243,156,18,0.3)" />
                  <BandBar label="Healthy"   count={BASE.green} total={40} color="#2ECC71" bg="rgba(46,204,113,0.1)" border="rgba(46,204,113,0.3)" />
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase tracking-[0.1em] text-gray mb-3">Stressed</div>
                <div className="space-y-3">
                  <BandBar label="High Risk" count={stressed.red}   total={40} color="#E74C3C" bg="rgba(231,76,60,0.1)" border="rgba(231,76,60,0.3)" />
                  <BandBar label="Watch"     count={stressed.amber} total={40} color="#F39C12" bg="rgba(243,156,18,0.1)" border="rgba(243,156,18,0.3)" />
                  <BandBar label="Healthy"   count={stressed.green} total={40} color="#2ECC71" bg="rgba(46,204,113,0.1)" border="rgba(46,204,113,0.3)" />
                </div>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          {!isBase && (
            <div className="bg-surface border border-border rounded-sm p-5 text-xs text-gray-light leading-relaxed">
              <p className="text-off-white font-medium mb-2">Interpretation</p>
              <p>
                Under this scenario,{' '}
                <strong className="text-amber">{Math.max(0, stressed.amber - BASE.amber)} projects migrate from Healthy → Watch</strong>
                {stressed.red > BASE.red && (
                  <> and <strong className="text-red">{stressed.red - BASE.red} projects migrate from Watch → High Risk</strong></>
                )}.
                Early warning from Vantis means Kaveri HFC can begin restructuring conversations with at-risk developers
                before the macro scenario materialises — rather than reacting to an already-distressed book.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
