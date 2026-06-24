'use client'

import { useState } from 'react'

type NodeType = 'parent' | 'spv' | 'holding' | 'director' | 'external' | 'benami'

interface NetworkNode {
  id: string
  label: string
  sub: string
  x: number
  y: number
  r: number
  color: string
  type: NodeType
}

interface NetworkEdge {
  from: string
  to: string
  type: 'solid' | 'dashed'
  color: string
}

const NODES: NetworkNode[] = [
  { id: 'ozone-group',  label: 'Ozone Group',      sub: 'Parent Entity',       x: 400, y: 280, r: 32, color: '#E74C3C', type: 'parent' },
  { id: 'urbana-spv',   label: 'Urbana SPV',        sub: 'Ozone Constructions', x: 210, y: 140, r: 22, color: '#E74C3C', type: 'spv' },
  { id: 'westgate-spv', label: 'Westgate SPV',      sub: 'Ozone Westgate Pvt',  x: 590, y: 140, r: 22, color: '#F39C12', type: 'spv' },
  { id: 'parkave-spv',  label: 'Park Ave SPV',      sub: 'Ozone Realty Pvt',    x: 640, y: 360, r: 22, color: '#F39C12', type: 'spv' },
  { id: 'holdings',     label: 'Ozone Holdings',    sub: 'Holding Entity',      x: 160, y: 380, r: 20, color: '#6B6B88', type: 'holding' },
  { id: 'dir-mahesh',   label: 'R. Mahesh Kumar',   sub: 'Director',            x: 380, y: 500, r: 18, color: '#3498DB', type: 'director' },
  { id: 'dir-priya',    label: 'S. Priya Venkat',   sub: 'Director (SHARED)',   x: 220, y: 520, r: 18, color: '#3498DB', type: 'director' },
  { id: 'skylark',      label: 'Skylark Mansions',  sub: 'Other Developer',     x: 100, y: 620, r: 20, color: '#F39C12', type: 'external' },
  { id: 'benami',       label: 'R. Venkat',         sub: '⚠ Benami Flag',       x: 560, y: 560, r: 18, color: '#E74C3C', type: 'benami' },
]

const EDGES: NetworkEdge[] = [
  { from: 'ozone-group', to: 'urbana-spv',   type: 'solid',  color: '#2A2A3E' },
  { from: 'ozone-group', to: 'westgate-spv', type: 'solid',  color: '#2A2A3E' },
  { from: 'ozone-group', to: 'parkave-spv',  type: 'solid',  color: '#2A2A3E' },
  { from: 'ozone-group', to: 'holdings',     type: 'dashed', color: '#6B6B88' },
  { from: 'dir-mahesh',  to: 'urbana-spv',   type: 'solid',  color: '#3498DB' },
  { from: 'dir-mahesh',  to: 'westgate-spv', type: 'solid',  color: '#3498DB' },
  { from: 'dir-priya',   to: 'ozone-group',  type: 'dashed', color: '#E74C3C' },
  { from: 'dir-priya',   to: 'skylark',      type: 'dashed', color: '#E74C3C' },
  { from: 'dir-mahesh',  to: 'benami',       type: 'dashed', color: '#E74C3C' },
]

const NODE_DESC: Partial<Record<NodeType, string>> = {
  parent:   'Parent holding company for the Ozone Group. Controls all SPVs. NCLT petition admitted by IndusInd Bank against this entity.',
  spv:      'Special Purpose Vehicle. Holds RERA registration for a single project. Escrow anomalies detected — possible cross-project fund flow.',
  holding:  'Intermediate holding entity. Shareholding structure shows minimal paid-up capital. Potential shell for liability shielding.',
  director: 'Individual director. Shared directorship across Ozone entities and an unrelated developer (Skylark Mansions) flagged for conflict of interest.',
  external: 'External developer with shared director. Shared directorship creates potential conflict of interest with Kaveri HFC lending decisions.',
  benami:   'Individual linked to Director Mahesh Kumar. Flagged in PMLA/benami screening. Property holdings under scrutiny.',
}

export default function NetworkPage() {
  const [selected, setSelected] = useState<NetworkNode | null>(null)
  const [mode, setMode] = useState<'exposure' | 'fraud'>('exposure')

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]))

  return (
    <div className="p-5 max-w-[1300px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Entity Network Graph</h1>
        <p className="text-gray text-sm mt-0.5">Corporate structure, directorship cross-links, and benami flags for Ozone Group.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-5 bg-surface border border-border rounded-sm p-1 w-fit">
        {(['exposure', 'fraud'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-4 py-1.5 rounded-sm text-xs font-mono uppercase tracking-[0.08em] transition-colors"
            style={{
              background: mode === m ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: mode === m ? '#C9A84C' : '#6B6B88',
            }}
          >
            {m === 'exposure' ? 'Exposure View' : 'Fraud Signals'}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* SVG graph */}
        <div className="flex-1 bg-surface border border-border rounded-sm overflow-hidden">
          <svg viewBox="0 0 760 680" width="100%" style={{ display: 'block' }}>
            {/* Edges */}
            {EDGES.map((e, i) => {
              const from = nodeMap[e.from]
              const to   = nodeMap[e.to]
              if (!from || !to) return null
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y}
                  x2={to.x}   y2={to.y}
                  stroke={e.color}
                  strokeWidth={e.type === 'dashed' ? 1 : 1.5}
                  strokeDasharray={e.type === 'dashed' ? '4 3' : undefined}
                  strokeOpacity={0.7}
                />
              )
            })}

            {/* Collateral annotation */}
            <text x={210} y={115} textAnchor="middle" fill="#E74C3C" fontSize="9" fontFamily="monospace">
              SAME COLLATERAL Sy.84/2
            </text>
            <text x={210} y={124} textAnchor="middle" fill="#E74C3C" fontSize="9" fontFamily="monospace">
              pledged to 2 lenders
            </text>

            {/* Nodes */}
            {NODES.map(n => {
              const isBenami  = n.type === 'benami' && mode === 'fraud'
              const isSelected = selected?.id === n.id
              return (
                <g
                  key={n.id}
                  onClick={() => setSelected(isSelected ? null : n)}
                  style={{ cursor: 'pointer' }}
                >
                  {isBenami && (
                    <circle cx={n.x} cy={n.y} r={n.r + 8} fill="none" stroke="#E74C3C" strokeWidth="2" opacity="0.4">
                      <animate attributeName="r" from={n.r + 4} to={n.r + 12} dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={n.x} cy={n.y} r={n.r}
                    fill={n.color}
                    fillOpacity={isSelected ? 0.25 : 0.15}
                    stroke={isSelected ? '#C9A84C' : n.color}
                    strokeWidth={isSelected ? 2 : 1.5}
                  />
                  <text x={n.x} y={n.y - 2} textAnchor="middle" fill={n.color} fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {n.label.length > 12 ? n.label.slice(0, 11) + '…' : n.label}
                  </text>
                  <text x={n.x} y={n.y + 10} textAnchor="middle" fill="#6B6B88" fontSize="8" fontFamily="monospace">
                    {n.sub.length > 14 ? n.sub.slice(0, 13) + '…' : n.sub}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Side panel */}
        <div className="lg:w-72 bg-surface border border-border rounded-sm p-5">
          {selected ? (
            <>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Node Detail</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: selected.color + '22', border: `2px solid ${selected.color}` }}>
                <div className="w-2 h-2 rounded-full" style={{ background: selected.color }} />
              </div>
              <div className="font-syne text-lg text-off-white mb-0.5">{selected.label}</div>
              <div className="text-xs text-gray mb-3">{selected.sub}</div>
              <div className="text-[9px] font-mono uppercase tracking-[0.1em] px-2 py-1 rounded-sm mb-4 w-fit" style={{ color: selected.color, background: selected.color + '20' }}>
                {selected.type.toUpperCase()}
              </div>
              <p className="text-xs text-gray-light leading-relaxed">
                {NODE_DESC[selected.type] ?? 'Entity in the Ozone Group corporate structure.'}
              </p>
              <button
                onClick={() => setSelected(null)}
                className="mt-4 text-[10px] font-mono text-gray hover:text-gold uppercase tracking-[0.1em] transition-colors"
              >
                Clear selection
              </button>
            </>
          ) : (
            <>
              <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Legend</div>
              {[
                { color: '#E74C3C', label: 'High-risk entity' },
                { color: '#F39C12', label: 'Watch / amber entity' },
                { color: '#3498DB', label: 'Individual director' },
                { color: '#6B6B88', label: 'Neutral / holding' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: l.color, opacity: 0.7 }} />
                  <span className="text-xs text-gray">{l.label}</span>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-2">Edge types</div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-px bg-surface2 border-t-2 border-solid border-gray-light" />
                  <span className="text-xs text-gray">Ownership</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-px" style={{ borderTop: '1.5px dashed #6B6B88' }} />
                  <span className="text-xs text-gray">Association / flag</span>
                </div>
              </div>
              <p className="text-[10px] text-gray mt-4 leading-relaxed">Click any node to see details.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
