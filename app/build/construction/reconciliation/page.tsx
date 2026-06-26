'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
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

function DroneOrtho({ project, captureDate }: { project: ProjectId; captureDate: string }) {
  if (project === 'ozone-urbana') {
    return (
      <svg viewBox="0 0 800 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="droneGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="droneScan" width="1" height="4" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" fill="rgba(255,255,255,0.012)"/>
          </pattern>
        </defs>
        {/* Base earth */}
        <rect width="800" height="450" fill="#221408"/>
        {/* Cleared site area */}
        <rect x="60" y="40" width="680" height="370" rx="2" fill="#7A5530"/>
        {/* Soil texture */}
        <ellipse cx="250" cy="200" rx="120" ry="80" fill="#6A4A26" opacity="0.5"/>
        <ellipse cx="560" cy="280" rx="100" ry="65" fill="#845A34" opacity="0.4"/>
        <ellipse cx="430" cy="120" rx="90" ry="40" fill="#7C5230" opacity="0.35"/>
        {/* Measurement grid */}
        <rect x="60" y="40" width="680" height="370" fill="url(#droneGrid)"/>
        {/* Perimeter vegetation */}
        <ellipse cx="30" cy="60" rx="38" ry="55" fill="#1C2E12"/>
        <ellipse cx="30" cy="200" rx="32" ry="60" fill="#213618"/>
        <ellipse cx="30" cy="360" rx="36" ry="55" fill="#1C2E12"/>
        <ellipse cx="770" cy="80" rx="36" ry="50" fill="#1C2E12"/>
        <ellipse cx="770" cy="240" rx="30" ry="65" fill="#213618"/>
        <ellipse cx="770" cy="400" rx="36" ry="50" fill="#1C2E12"/>
        <ellipse cx="200" cy="18" rx="80" ry="22" fill="#1C2E12"/>
        <ellipse cx="550" cy="18" rx="70" ry="20" fill="#213618"/>
        <ellipse cx="350" cy="438" rx="90" ry="22" fill="#1C2E12"/>
        {/* ZONE 1: COMPLETE — Tower 1 built structure (left ~30% of site) */}
        <rect x="75" y="55" width="205" height="340" fill="#999288" rx="1"/>
        {/* Roof floor plan grid */}
        {[115, 155, 195, 235].map((x, i) => (
          <line key={`rv${i}`} x1={x} y1="55" x2={x} y2="395" stroke="#7A7870" strokeWidth="0.8" opacity="0.6"/>
        ))}
        {[115, 175, 235, 295, 355].map((y, i) => (
          <line key={`rh${i}`} x1="75" y1={y} x2="280" y2={y} stroke="#7A7870" strokeWidth="0.8" opacity="0.6"/>
        ))}
        {/* Building shadow */}
        <rect x="280" y="57" width="8" height="340" fill="#1A1208" opacity="0.6"/>
        <rect x="77" y="395" width="205" height="7" fill="#1A1208" opacity="0.5"/>
        {/* COMPLETE zone label */}
        <rect x="82" y="62" width="88" height="18" rx="2" fill="rgba(46,204,113,0.2)" stroke="#2ECC71" strokeWidth="0.8"/>
        <text x="86" y="74" fontFamily="monospace" fontSize="9" fill="#2ECC71">✓ COMPLETE</text>
        {/* ZONE 2: IN PROGRESS — Scaffolding / partial floors (center ~10%) */}
        <rect x="293" y="90" width="100" height="270" fill="#8A8678" rx="1" opacity="0.8"/>
        {/* Scaffolding verticals */}
        {[298, 308, 318, 328, 338, 348, 358, 368, 378, 388].map((x, i) => (
          <line key={`sv${i}`} x1={x} y1="88" x2={x} y2="362" stroke="#9A9A8A" strokeWidth="1.2" opacity="0.5"/>
        ))}
        {[102, 120, 138, 156, 174, 192, 210, 228, 246, 264, 282, 300, 318, 336, 354].map((y, i) => (
          <line key={`sh${i}`} x1="292" y1={y} x2="394" y2={y} stroke="#9A9A8A" strokeWidth="0.8" opacity="0.4"/>
        ))}
        {/* IN PROGRESS label */}
        <rect x="298" y="96" width="88" height="18" rx="2" fill="rgba(243,156,18,0.2)" stroke="#F39C12" strokeWidth="0.8"/>
        <text x="302" y="108" fontFamily="monospace" fontSize="9" fill="#F39C12">⟳ IN PROGRESS</text>
        {/* ZONE 3: BARE SITE — right ~55% */}
        {/* Material dumps */}
        <ellipse cx="470" cy="160" rx="45" ry="28" fill="#5C4A2E" opacity="0.85"/>
        <ellipse cx="485" cy="152" rx="26" ry="14" fill="#6A5838" opacity="0.8"/>
        <ellipse cx="560" cy="230" rx="38" ry="24" fill="#5C4A2E" opacity="0.75"/>
        <ellipse cx="480" cy="300" rx="32" ry="20" fill="#604E32" opacity="0.8"/>
        <ellipse cx="620" cy="170" rx="28" ry="18" fill="#5A4830" opacity="0.7"/>
        <ellipse cx="660" cy="310" rx="35" ry="22" fill="#5C4A2E" opacity="0.75"/>
        <ellipse cx="550" cy="360" rx="30" ry="16" fill="#604E32" opacity="0.65"/>
        {/* BARE SITE annotation */}
        <rect x="415" y="45" width="320" height="360" fill="rgba(231,76,60,0.06)" stroke="#E74C3C" strokeWidth="1" strokeDasharray="8 4"/>
        <text x="575" y="225" fontFamily="monospace" fontSize="14" fill="#E74C3C" textAnchor="middle" opacity="0.8">BARE SITE</text>
        <text x="575" y="245" fontFamily="monospace" fontSize="10" fill="#E74C3C" textAnchor="middle" opacity="0.7">~55% of footprint</text>
        {/* Site boundary */}
        <rect x="60" y="40" width="680" height="370" fill="none" stroke="#C9A84C" strokeWidth="2" strokeDasharray="12 5" opacity="0.8"/>
        {/* Scan lines */}
        <rect width="800" height="450" fill="url(#droneScan)"/>
        {/* Physical % callout */}
        <rect x="8" y="8" width="130" height="20" rx="2" fill="rgba(231,76,60,0.18)" stroke="#E74C3C" strokeWidth="0.8"/>
        <text x="13" y="22" fontFamily="monospace" fontSize="9.5" fill="#E74C3C">PHYSICAL · 30%</text>
        {/* QPR claimed */}
        <rect x="8" y="32" width="112" height="17" rx="2" fill="rgba(107,107,136,0.2)" stroke="#6B6B88" strokeWidth="0.8"/>
        <text x="13" y="44" fontFamily="monospace" fontSize="8.5" fill="#9090AA">QPR CLAIMED · 62%</text>
        {/* FLAGGED badge */}
        <rect x="614" y="8" width="178" height="20" rx="2" fill="rgba(231,76,60,0.18)" stroke="#E74C3C" strokeWidth="0.8"/>
        <text x="619" y="22" fontFamily="monospace" fontSize="9.5" fill="#E74C3C">⚑ VANTIS FLAGGED — 32pt GAP</text>
        {/* North */}
        <text x="774" y="56" fontFamily="monospace" fontSize="11" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
        <polygon points="774,60 771,72 774,68 777,72" fill="#C9A84C"/>
        <line x1="774" y1="72" x2="774" y2="78" stroke="#C9A84C" strokeWidth="1.2"/>
        {/* Scale bar */}
        <line x1="650" y1="432" x2="750" y2="432" stroke="#9090AA" strokeWidth="1"/>
        <line x1="650" y1="428" x2="650" y2="436" stroke="#9090AA" strokeWidth="1"/>
        <line x1="750" y1="428" x2="750" y2="436" stroke="#9090AA" strokeWidth="1"/>
        <text x="700" y="445" fontFamily="monospace" fontSize="7" fill="#9090AA" textAnchor="middle">100m</text>
        {/* Metadata */}
        <text x="10" y="445" fontFamily="monospace" fontSize="7.5" fill="#4A4A5A">12°58′22″N 77°41′08″E · DroneDeploy P4RTK · GSD 2.1cm/px · {captureDate}</text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 800 450" className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id="droneGridDV" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5"/>
        </pattern>
        <pattern id="droneScanDV" width="1" height="4" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="rgba(255,255,255,0.012)"/>
        </pattern>
      </defs>
      {/* Base */}
      <rect width="800" height="450" fill="#1A1208"/>
      {/* Site area — mostly built */}
      <rect x="50" y="35" width="700" height="380" rx="2" fill="#7A5530"/>
      {/* Measurement grid */}
      <rect x="50" y="35" width="700" height="380" fill="url(#droneGridDV)"/>
      {/* Perimeter vegetation */}
      <ellipse cx="25" cy="120" rx="30" ry="90" fill="#1C2E12"/>
      <ellipse cx="775" cy="200" rx="28" ry="80" fill="#213618"/>
      <ellipse cx="300" cy="18" rx="90" ry="20" fill="#1C2E12"/>
      <ellipse cx="580" cy="438" rx="80" ry="20" fill="#1C2E12"/>
      {/* COMPLETE — large L-shaped building footprint (94% of site) */}
      {/* Main block */}
      <rect x="65" y="50" width="490" height="355" fill="#9A9590" rx="1"/>
      {/* Roof grid */}
      {[115, 165, 215, 265, 315, 365, 415, 465].map((x, i) => (
        <line key={`dv${i}`} x1={x} y1="50" x2={x} y2="405" stroke="#7E7C74" strokeWidth="0.8" opacity="0.55"/>
      ))}
      {[100, 150, 200, 250, 300, 350].map((y, i) => (
        <line key={`dvh${i}`} x1="65" y1={y} x2="555" y2={y} stroke="#7E7C74" strokeWidth="0.8" opacity="0.55"/>
      ))}
      {/* Right extension block */}
      <rect x="558" y="50" width="175" height="230" fill="#959088" rx="1"/>
      {[585, 615, 645, 675, 705].map((x, i) => (
        <line key={`dvr${i}`} x1={x} y1="50" x2={x} y2="280" stroke="#7E7C74" strokeWidth="0.8" opacity="0.55"/>
      ))}
      {/* Building shadows */}
      <rect x="555" y="52" width="7" height="355" fill="#181008" opacity="0.55"/>
      <rect x="733" y="52" width="7" height="230" fill="#181008" opacity="0.55"/>
      {/* BARE corner (the remaining 6%) */}
      <rect x="560" y="285" width="175" height="120" fill="#7A5530" rx="1"/>
      <ellipse cx="620" cy="330" rx="28" ry="18" fill="#5C4A2E" opacity="0.7"/>
      <rect x="565" y="292" width="164" height="108" fill="rgba(243,156,18,0.07)" stroke="#F39C12" strokeWidth="1" strokeDasharray="5 3"/>
      <text x="647" y="344" fontFamily="monospace" fontSize="9" fill="#F39C12" textAnchor="middle">PENDING</text>
      <text x="647" y="356" fontFamily="monospace" fontSize="8" fill="#F39C12" textAnchor="middle">6%</text>
      {/* COMPLETE overlay */}
      <rect x="58" y="44" width="498" height="358" fill="none" stroke="#2ECC71" strokeWidth="1.5" opacity="0.4"/>
      {/* Site boundary */}
      <rect x="50" y="35" width="700" height="380" fill="none" stroke="#C9A84C" strokeWidth="2" strokeDasharray="12 5" opacity="0.8"/>
      {/* Scan lines */}
      <rect width="800" height="450" fill="url(#droneScanDV)"/>
      {/* COMPLETE label */}
      <rect x="8" y="8" width="130" height="20" rx="2" fill="rgba(46,204,113,0.18)" stroke="#2ECC71" strokeWidth="0.8"/>
      <text x="13" y="22" fontFamily="monospace" fontSize="9.5" fill="#2ECC71">PHYSICAL · 94%</text>
      {/* Aligned badge */}
      <rect x="600" y="8" width="192" height="20" rx="2" fill="rgba(46,204,113,0.15)" stroke="#2ECC71" strokeWidth="0.8"/>
      <text x="605" y="22" fontFamily="monospace" fontSize="9.5" fill="#2ECC71">✓ ALIGNED — within tolerance</text>
      {/* North */}
      <text x="774" y="56" fontFamily="monospace" fontSize="11" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
      <polygon points="774,60 771,72 774,68 777,72" fill="#C9A84C"/>
      <line x1="774" y1="72" x2="774" y2="78" stroke="#C9A84C" strokeWidth="1.2"/>
      {/* Scale bar */}
      <line x1="650" y1="432" x2="750" y2="432" stroke="#9090AA" strokeWidth="1"/>
      <line x1="650" y1="428" x2="650" y2="436" stroke="#9090AA" strokeWidth="1"/>
      <line x1="750" y1="428" x2="750" y2="436" stroke="#9090AA" strokeWidth="1"/>
      <text x="700" y="445" fontFamily="monospace" fontSize="7" fill="#9090AA" textAnchor="middle">50m</text>
      {/* Metadata */}
      <text x="10" y="445" fontFamily="monospace" fontSize="7.5" fill="#4A4A5A">13°22′14″N 76°38′42″E · DroneDeploy P4RTK · GSD 2.1cm/px · {captureDate}</text>
    </svg>
  )
}

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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/build" className="text-gray hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[10px] font-mono text-gray uppercase tracking-[0.12em]">Build Hub</span>
          <span className="text-border text-xs">/</span>
          <span className="text-[10px] font-mono text-gray-light uppercase tracking-[0.12em]">Drone Reconciliation</span>
        </div>
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

      {/* Drone orthomosaic — SVG mock */}
      <div className="bg-surface border border-border rounded-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">Latest Drone Orthomosaic</div>
          <div className="text-[9px] font-mono text-gray/50 uppercase">DroneDeploy P4RTK · {data.captureDate}</div>
        </div>
        <div className="aspect-video border border-border rounded-sm overflow-hidden">
          <DroneOrtho project={project} captureDate={data.captureDate} />
        </div>
      </div>
    </div>
  )
}
