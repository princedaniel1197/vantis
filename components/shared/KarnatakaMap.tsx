'use client'

import { useState } from 'react'

interface District {
  id: string
  label: string
  points: string
  risk: 'compliant' | 'caution' | 'high-risk'
  projects: string[]
}

interface KarnatakaMapProps {
  selectedDistrict: string | null
  onDistrictClick: (d: District) => void
}

const DISTRICTS: District[] = [
  { id: 'belagavi',    label: 'Belagavi',             points: '0,0 130,0 125,95 0,95',                 risk: 'caution',    projects: [] },
  { id: 'vijayapura',  label: 'Vijayapura',            points: '130,0 262,0 257,95 125,95',             risk: 'compliant',  projects: [] },
  { id: 'kalaburagi',  label: 'Kalaburagi',            points: '262,0 400,0 395,95 257,95',             risk: 'caution',    projects: [] },
  { id: 'dharwad',     label: 'Dharwad',               points: '0,95 125,95 120,190 0,190',             risk: 'compliant',  projects: [] },
  { id: 'koppal',      label: 'Koppal & Gadag',        points: '125,95 257,95 252,190 120,190',         risk: 'caution',    projects: [] },
  { id: 'raichur',     label: 'Raichur & Ballari',     points: '257,95 395,95 390,190 252,190',         risk: 'caution',    projects: [] },
  { id: 'shivamogga',  label: 'Shivamogga',            points: '0,190 120,190 115,290 0,290',           risk: 'compliant',  projects: [] },
  { id: 'davangere',   label: 'Davangere',             points: '120,190 252,190 247,290 115,290',       risk: 'caution',    projects: [] },
  { id: 'east-ka',     label: 'East Karnataka',        points: '252,190 390,190 385,290 247,290',       risk: 'caution',    projects: [] },
  { id: 'dk-udupi',    label: 'DK & Udupi',            points: '0,290 95,290 90,375 0,375',             risk: 'compliant',  projects: [] },
  { id: 'hassan',      label: 'Hassan & Chikkamagaluru', points: '95,290 220,290 215,375 90,375',       risk: 'compliant',  projects: [] },
  { id: 'tumkur',      label: 'Tumkur & BLR Rural',    points: '220,290 330,290 325,375 215,375',       risk: 'caution',    projects: [] },
  { id: 'kolar',       label: 'Kolar & Chikkaballapur', points: '330,290 390,290 385,375 325,375',      risk: 'caution',    projects: [] },
  { id: 'kodagu',      label: 'Kodagu',                points: '0,375 65,375 60,460 0,460',             risk: 'compliant',  projects: [] },
  { id: 'mysuru',      label: 'Mysuru & Mandya',       points: '65,375 220,375 215,460 60,460',         risk: 'compliant',  projects: ['divya-villas'] },
  { id: 'bengaluru-urban', label: 'Bengaluru Urban',   points: '220,375 325,375 320,460 215,460',       risk: 'high-risk',  projects: ['ozone-urbana', 'prestige-lakeside', 'skylark-arcadia'] },
  { id: 'chamarajanagar', label: 'Chamarajanagar',     points: '325,375 390,375 385,460 320,460',       risk: 'compliant',  projects: [] },
]

function riskFill(risk: string, selected: boolean, hovered: boolean): string {
  const base = {
    'compliant':  { fill: 'rgba(46,204,113,0.18)',  stroke: 'rgba(46,204,113,0.5)' },
    'caution':    { fill: 'rgba(243,156,18,0.18)',  stroke: 'rgba(243,156,18,0.5)' },
    'high-risk':  { fill: 'rgba(231,76,60,0.28)',   stroke: 'rgba(231,76,60,0.75)' },
  }[risk] ?? { fill: 'rgba(107,107,136,0.2)', stroke: 'rgba(107,107,136,0.4)' }

  if (selected) return `fill:rgba(201,168,76,0.3);stroke:#C9A84C;stroke-width:2`
  if (hovered)  return `fill:${base.fill.replace('0.18','0.32').replace('0.28','0.42')};stroke:${base.stroke};stroke-width:1.5`
  return `fill:${base.fill};stroke:${base.stroke};stroke-width:1`
}

export default function KarnatakaMap({ selectedDistrict, onDistrictClick }: KarnatakaMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className="w-full relative">
      <svg
        viewBox="0 0 400 460"
        className="w-full h-auto"
        style={{ maxHeight: '420px' }}
      >
        {DISTRICTS.map(d => {
          const isSelected = selectedDistrict === d.id
          const isHovered = hovered === d.id
          const styleStr = riskFill(d.risk, isSelected, isHovered)

          const [fill, stroke, strokeWidth] = (() => {
            if (isSelected) return ['rgba(201,168,76,0.3)', '#C9A84C', '2']
            const fills = {
              'compliant': 'rgba(46,204,113,0.18)',
              'caution':   'rgba(243,156,18,0.18)',
              'high-risk': 'rgba(231,76,60,0.28)',
            }
            const strokes = {
              'compliant': 'rgba(46,204,113,0.55)',
              'caution':   'rgba(243,156,18,0.55)',
              'high-risk': 'rgba(231,76,60,0.8)',
            }
            const baseFill = fills[d.risk as keyof typeof fills]
            return [
              isHovered ? baseFill.replace('0.18','0.35').replace('0.28','0.45') : baseFill,
              strokes[d.risk as keyof typeof strokes],
              isHovered ? '1.5' : '1',
            ]
          })()

          // Compute centroid for label
          const pts = d.points.split(' ').map(p => p.split(',').map(Number))
          const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length
          const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length

          return (
            <g key={d.id}>
              <polygon
                points={d.points}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
                style={{ cursor: 'pointer', transition: 'fill 0.15s, stroke-width 0.15s' }}
                onMouseEnter={() => setHovered(d.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onDistrictClick(d)}
              />
              {/* Label — only show for larger districts */}
              {d.label.length < 14 && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={isSelected ? '#C9A84C' : 'rgba(240,238,232,0.6)'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {d.label}
                </text>
              )}
              {/* Red dot for high-risk districts with projects */}
              {d.risk === 'high-risk' && d.projects.length > 0 && (
                <circle cx={cx + 12} cy={cy - 8} r="4" fill="#E74C3C" stroke="#080810" strokeWidth="1" style={{ pointerEvents: 'none' }} />
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 flex-wrap">
        {[
          { color: 'bg-green/40', label: 'Compliant' },
          { color: 'bg-amber/40', label: 'Caution' },
          { color: 'bg-red/40',   label: 'High Risk' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            <span className="text-gray text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { DISTRICTS }
