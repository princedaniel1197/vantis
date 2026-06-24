'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { resolveGovTruth } from '@/lib/gov-truth'

const PROJECTS = {
  'ozone-urbana': {
    name: 'Ozone Urbana',
    physical: 30,
    qpr: 62,
    finance: 72,
    captureDate: '01 Jun 2024',
    verdict: 'flag',
  },
  'divya-villas': {
    name: 'Divya Villas',
    physical: 94,
    qpr: 92,
    finance: 94,
    captureDate: '14 Jun 2024',
    verdict: 'clean',
  },
} as const

type ProjectId = keyof typeof PROJECTS

export default function ReconciliationPage() {
  const [project, setProject] = useState<ProjectId>('ozone-urbana')
  const data = PROJECTS[project]
  const isFlag = data.verdict === 'flag'
  const maxGap = Math.max(
    Math.abs(data.physical - data.qpr),
    Math.abs(data.physical - data.finance),
  )

  // resolveGovTruth is imported to demonstrate integration with the shared module
  void resolveGovTruth(project)

  const barData = [
    { source: 'Drone/Satellite', value: data.physical, color: isFlag ? '#E74C3C' : '#2ECC71' },
    { source: 'RERA QPR',        value: data.qpr,      color: '#F39C12' },
    { source: 'Finance Assumed', value: data.finance,  color: '#6B6B88' },
  ]

  return (
    <div className="min-h-screen bg-background p-5 max-w-[1000px] mx-auto">
      <Link
        href="/build"
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Build Hub
      </Link>

      <div className="mb-6">
        <h1 className="font-syne text-2xl text-off-white">Drone Reconciliation</h1>
        <p className="text-gray text-sm mt-1">
          The three-way gap: what the drone sees vs what was claimed vs what finance assumed.
        </p>
      </div>

      {/* Project tabs */}
      <div className="flex gap-2 mb-6">
        {(Object.entries(PROJECTS) as [ProjectId, typeof PROJECTS[ProjectId]][]).map(([id, p]) => (
          <button
            key={id}
            onClick={() => setProject(id)}
            className={`px-4 py-2 text-xs font-mono rounded-sm border transition-colors ${
              project === id
                ? 'border-gold text-gold bg-gold/10'
                : 'border-border text-gray hover:border-gold/30'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Verdict header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-sm border mb-6 ${
          isFlag ? 'bg-red/[0.06] border-red/30' : 'bg-green/[0.06] border-green/30'
        }`}
      >
        {isFlag
          ? <AlertTriangle className="w-5 h-5 text-red shrink-0" />
          : <CheckCircle2 className="w-5 h-5 text-green shrink-0" />
        }
        <div>
          <div className={`text-sm font-medium ${isFlag ? 'text-red' : 'text-green'}`}>
            {isFlag
              ? `GAP DETECTED — ${maxGap} point divergence between physical and claimed`
              : 'ALIGNED — Physical progress matches filings within tolerance'}
          </div>
          <div className="text-xs text-gray mt-0.5">
            Drone capture: {data.captureDate} · Auto-reconciled on arrival
          </div>
        </div>
      </div>

      {/* Three-bar card */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
          Three-Source Reconciliation
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div>
            <div className="text-[10px] text-gray uppercase mb-1">Physical (Drone)</div>
            <div
              className="font-syne text-4xl font-bold"
              style={{ color: isFlag ? '#E74C3C' : '#2ECC71' }}
            >
              {data.physical}%
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray uppercase mb-1">RERA QPR Filed</div>
            <div className="font-syne text-4xl font-bold text-amber">{data.qpr}%</div>
          </div>
          <div>
            <div className="text-[10px] text-gray uppercase mb-1">Finance Assumed</div>
            <div className="font-syne text-4xl font-bold text-gray-light">{data.finance}%</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" vertical={false} />
            <XAxis
              dataKey="source"
              tick={{ fill: '#6B6B88', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6B6B88', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{ background: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: 2 }}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Three-audience callout */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-6">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
          Why This Matters — Three Audiences
        </div>
        <div className="space-y-3">
          {[
            {
              audience: 'Build (Developer)',
              desc: 'See your own construction slippage before the QPR is due. Course-correct early.',
            },
            {
              audience: 'Lend (Banker)',
              desc: 'Collateral is behind claimed progress 6–12 months before a payment slips. Hold the next tranche.',
            },
            {
              audience: 'Govern (K-RERA)',
              desc: 'QPR overstated vs orbital reality. Basis for show-cause and physical inspection.',
            },
          ].map(a => (
            <div key={a.audience} className="flex gap-3 p-3 bg-surface2 rounded-sm border border-border">
              <div className="shrink-0 w-24 text-[10px] font-mono text-gold uppercase">{a.audience}</div>
              <div className="text-xs text-gray-light leading-relaxed">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Thumbnail placeholder */}
      <div className="bg-surface border border-border rounded-sm p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">
          Latest Drone Orthomosaic
        </div>
        <div className="aspect-video bg-surface2 border border-border rounded-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray text-sm font-mono">REPRESENTATIVE IMAGERY</div>
            <div className="text-gray text-[10px] mt-1">
              Processed ortho · Capture date: {data.captureDate}
            </div>
            <div className="text-gray text-[10px]">
              Production: DroneDeploy webhook → Vantis reconciliation engine
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
