'use client'

import { useState, useMemo } from 'react'
import { UNITS, type Unit, type UnitStatus } from '@/lib/sales/units'
import Link from 'next/link'
import { ArrowLeft, LayoutGrid, Box, CheckCircle2, AlertTriangle, X } from 'lucide-react'

// ── Isometric SVG tower ──────────────────────────────────────────────────────
interface TowerSceneProps {
  selectedId: string | null
  highlightIds: Set<string>
  onSelect: (unit: Unit) => void
}

function IsoTower({ selectedId, highlightIds, onSelect }: TowerSceneProps) {
  const byFloor = useMemo(() => {
    const map: Record<number, Unit[]> = {}
    for (const u of UNITS) {
      if (!map[u.floor]) map[u.floor] = []
      map[u.floor].push(u)
    }
    for (const f in map) map[+f].sort((a, b) => a.unitOnFloor - b.unitOnFloor)
    return map
  }, [])

  // Building geometry constants
  const FX    = 145   // Front face left-x
  const FY    = 56    // Front face top-y (top of PH)
  const FW    = 294   // Front face width (7 × 42)
  const FH    = 30    // Normal floor height
  const PHH   = 44    // Penthouse floor height
  const DX    = 84    // Right-face x-offset (isometric depth)
  const DY    = 42    // Right-face y-offset (isometric depth)
  const TOTAL = 10 * FH + PHH  // 344px total front-face height

  // Floor top-y on the front face
  function fTop(f: number) { return f === 11 ? FY : FY + PHH + (10 - f) * FH }
  function fHt(f: number)  { return f === 11 ? PHH : FH }
  // Unit width per floor (3 wide PH units, 7 normal)
  function uW(f: number)   { return f === 11 ? FW / 3 : FW / 7 }

  // Polygon points string helper
  function pts(...coords: number[]) {
    const pairs: string[] = []
    for (let i = 0; i < coords.length; i += 2) pairs.push(`${coords[i]},${coords[i + 1]}`)
    return pairs.join(' ')
  }

  const SC: Record<UnitStatus, { fill: string; stroke: string; win: string }> = {
    available: { fill: '#0B0B18', stroke: '#1E1E3A', win: '#131326' },
    held:      { fill: '#1C1000', stroke: '#7A6020', win: '#2A1800' },
    booked:    { fill: '#001208', stroke: '#185530', win: '#001C10' },
    sold:      { fill: '#001808', stroke: '#2ECC71', win: '#003012' },
  }

  const FLOORS = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]

  return (
    <svg
      viewBox="0 0 660 510"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="isoRF" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0D0D1C" />
          <stop offset="100%" stopColor="#080810" />
        </linearGradient>
        <linearGradient id="isoTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1A1A30" />
          <stop offset="100%" stopColor="#0E0E26" />
        </linearGradient>
        <radialGradient id="isoGnd" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="rgba(14,14,28,0.9)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="660" height="510" fill="#05050D" />

      {/* Ground shadow */}
      <ellipse
        cx={FX + FW / 2 + DX / 2} cy={FY + TOTAL + DY + 22}
        rx={218} ry={28}
        fill="url(#isoGnd)"
      />

      {/* ─── RIGHT FACE ────────────────────────────────── */}
      <polygon
        points={pts(
          FX + FW,      FY,
          FX + FW + DX, FY + DY,
          FX + FW + DX, FY + TOTAL + DY,
          FX + FW,      FY + TOTAL,
        )}
        fill="url(#isoRF)"
        stroke="#16163A"
        strokeWidth="1"
      />
      {/* Floor dividers on right face */}
      {FLOORS.map(f => (
        <line key={`rd-${f}`}
          x1={FX + FW}      y1={fTop(f)}
          x2={FX + FW + DX} y2={fTop(f) + DY}
          stroke="#101024" strokeWidth="0.6"
        />
      ))}
      {/* Windows on right face (3 per floor) */}
      {FLOORS.flatMap(f => {
        const units = byFloor[f] || []
        const soldFrac = units.filter(u => u.status === 'sold').length / Math.max(units.length, 1)
        return [0.2, 0.5, 0.8].map((t, wi) => (
          <rect
            key={`rw-${f}-${wi}`}
            x={FX + FW + t * DX - 3.5}
            y={fTop(f) + t * DY + 7}
            width={7} height={Math.max(6, fHt(f) - 16)}
            rx={1}
            fill={soldFrac > 0.5 ? 'rgba(46,204,113,0.10)' : '#090912'}
            stroke={soldFrac > 0.5 ? 'rgba(46,204,113,0.20)' : '#12122E'}
            strokeWidth="0.4"
          />
        ))
      })}

      {/* ─── TOP FACE (roof) ───────────────────────────── */}
      <polygon
        points={pts(
          FX,           FY,
          FX + FW,      FY,
          FX + FW + DX, FY + DY,
          FX + DX,      FY + DY,
        )}
        fill="url(#isoTop)"
        stroke="#20204A"
        strokeWidth="1"
      />
      {/* Water tank */}
      <polygon
        points={pts(
          FX + 88,               FY + 3,
          FX + 150,              FY + 3,
          FX + 150 + DX * 0.22,  FY + 3 + DY * 0.22,
          FX + 88  + DX * 0.22,  FY + 3 + DY * 0.22,
        )}
        fill="#0C0C1E" stroke="#20203C" strokeWidth="0.8"
      />
      {/* Stair housing */}
      <polygon
        points={pts(
          FX + 178,              FY + 3,
          FX + 222,              FY + 3,
          FX + 222 + DX * 0.16,  FY + 3 + DY * 0.16,
          FX + 178 + DX * 0.16,  FY + 3 + DY * 0.16,
        )}
        fill="#0C0C1E" stroke="#20203C" strokeWidth="0.8"
      />
      {/* Lift room */}
      <polygon
        points={pts(
          FX + 238,              FY + 3,
          FX + 262,              FY + 3,
          FX + 262 + DX * 0.12,  FY + 3 + DY * 0.12,
          FX + 238 + DX * 0.12,  FY + 3 + DY * 0.12,
        )}
        fill="#0C0C1E" stroke="#20203C" strokeWidth="0.8"
      />

      {/* ─── FRONT FACE — FLOORS ───────────────────────── */}
      {FLOORS.map(f => {
        const fy    = fTop(f)
        const fh    = fHt(f)
        const uw    = uW(f)
        const units = byFloor[f] || []

        return (
          <g key={f}>
            {/* Floor base */}
            <rect x={FX} y={fy} width={FW} height={fh} fill="#070710" />

            {/* Unit cells */}
            {units.map((unit, ui) => {
              const isSel = unit.id === selectedId
              const isHi  = highlightIds.size > 0 && highlightIds.has(unit.id)
              const faded = highlightIds.size > 0 && !highlightIds.has(unit.id) && !isSel
              const c = SC[unit.status]
              return (
                <g key={unit.id} onClick={() => onSelect(unit)} style={{ cursor: 'pointer' }}>
                  {/* Unit body */}
                  <rect
                    x={FX + ui * uw + 1.5} y={fy + 2}
                    width={uw - 3} height={fh - 4}
                    rx={1}
                    fill={isSel || isHi ? '#C9A84C' : c.fill}
                    stroke={isSel ? '#F4D48C' : isHi ? '#C9A84C' : c.stroke}
                    strokeWidth={isSel ? 1.5 : 0.7}
                    opacity={faded ? 0.08 : 1}
                  />
                  {/* Window highlight */}
                  {!faded && uw > 22 && fh > 16 && (
                    <rect
                      x={FX + ui * uw + uw * 0.2 + 1.5} y={fy + 4}
                      width={uw * 0.6} height={fh * 0.38}
                      rx={0.5}
                      fill={isSel ? 'rgba(0,0,0,0.35)' : c.win}
                    />
                  )}
                  {/* Unit number */}
                  {!faded && uw > 28 && fh > 20 && (
                    <text
                      x={FX + ui * uw + uw / 2} y={fy + fh - 5}
                      textAnchor="middle"
                      fontFamily="monospace" fontSize={Math.min(7.5, uw / 4.5)}
                      fill={isSel ? '#000' : '#1E1E48'}
                    >
                      {unit.unitOnFloor}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Floor separator line */}
            <line x1={FX} y1={fy} x2={FX + FW} y2={fy} stroke="#0C0C28" strokeWidth="0.8" />
          </g>
        )
      })}

      {/* Front face border */}
      <rect x={FX} y={FY} width={FW} height={TOTAL} fill="none" stroke="#1E1E48" strokeWidth="1.2" />

      {/* Floor labels (left side) */}
      {FLOORS.map(f => {
        const fy = fTop(f)
        const fh = fHt(f)
        return (
          <text key={`lbl-${f}`}
            x={FX - 7} y={fy + fh / 2 + 3}
            textAnchor="end"
            fontFamily="monospace" fontSize="7"
            fill="#1A1A44"
          >
            {f === 11 ? 'PH' : `F${String(f).padStart(2, '0')}`}
          </text>
        )
      })}

      {/* ─── STATUS LEGEND ─────────────────────────────── */}
      {[
        { label: 'Available', color: '#1E1E3A' },
        { label: 'Held',      color: '#7A6020' },
        { label: 'Booked',    color: '#185530' },
        { label: 'Sold',      color: '#2ECC71' },
      ].map((item, i) => (
        <g key={item.label} transform={`translate(${FX + i * 76}, ${FY + TOTAL + DY + 12})`}>
          <rect x={0} y={0} width={9} height={9} rx={1.5} fill={item.color} opacity="0.9" />
          <text x={13} y={8} fontFamily="monospace" fontSize="7" fill="#24244E">{item.label}</text>
        </g>
      ))}

      {/* ─── CONSTRUCTION CRANE ───────────────────────── */}
      <g opacity="0.46">
        {/* Mast */}
        <line x1={FX+FW+DX-10} y1={FY+DY}    x2={FX+FW+DX-10} y2={FY+DY-92}
          stroke="#1C1C48" strokeWidth="3" />
        {/* Boom */}
        <line x1={FX+FW+DX-70} y1={FY+DY-90} x2={FX+FW+DX+34} y2={FY+DY-90}
          stroke="#1C1C48" strokeWidth="2.5" />
        {/* Back stay */}
        <line x1={FX+FW+DX-10} y1={FY+DY-92} x2={FX+FW+DX-70} y2={FY+DY-90}
          stroke="#1C1C48" strokeWidth="1.5" />
        {/* Counter weight */}
        <rect x={FX+FW+DX-78} y={FY+DY-93} width={11} height={6}
          rx={1} fill="#10101C" stroke="#1C1C48" strokeWidth="0.7" />
        {/* Hoist cable */}
        <line x1={FX+FW+DX+20} y1={FY+DY-90} x2={FX+FW+DX+20} y2={FY+DY-8}
          stroke="#24245C" strokeWidth="0.8" strokeDasharray="4 3" />
        {/* Load box */}
        <rect x={FX+FW+DX+12} y={FY+DY-11} width={16} height={9}
          rx={1} fill="#0C0C18" stroke="#1C1C48" strokeWidth="0.7" />
      </g>

      {/* ─── SCAFFOLDING (active construction floors) ─── */}
      <g opacity="0.2" stroke="#16165A" strokeWidth="0.9">
        <line x1={FX+5}  y1={FY+PHH}         x2={FX+5}  y2={FY+PHH+5*FH} />
        <line x1={FX+14} y1={FY+PHH}         x2={FX+14} y2={FY+PHH+5*FH} />
        {[1, 2, 3, 4, 5].map(i => (
          <line key={i} x1={FX+3} y1={FY+PHH+i*FH} x2={FX+16} y2={FY+PHH+i*FH} />
        ))}
      </g>

      {/* ─── BUILDING LABEL ───────────────────────────── */}
      <text
        x={FX + FW / 2 + DX * 0.36} y={FY + TOTAL + DY + 36}
        textAnchor="middle"
        fontFamily="monospace" fontSize="8" letterSpacing="1.5"
        fill="#1E1E50"
      >
        DIVYA VILLAS · TOWER A · MYSURU
      </text>
    </svg>
  )
}

// ── gov-truth badge ──────────────────────────────────────────────────────────
function GovBadge({ label, value, pass }: { label: string; value: string; pass: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded-sm border ${
        pass ? 'border-green/30 bg-green/[0.06]' : 'border-red/30 bg-red/[0.06]'
      }`}
    >
      <span className="text-[10px] font-mono text-gray uppercase">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono" style={{ color: pass ? '#2ECC71' : '#E74C3C' }}>
          {value}
        </span>
        {pass
          ? <CheckCircle2 className="w-3.5 h-3.5 text-green" />
          : <AlertTriangle className="w-3.5 h-3.5 text-red" />
        }
      </div>
    </div>
  )
}

// ── status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: UnitStatus }) {
  const cfg = {
    available: { label: 'Available', color: 'text-gray-light', bg: 'bg-surface2',  border: 'border-border' },
    held:      { label: 'Held',      color: 'text-gold',       bg: 'bg-gold/10',   border: 'border-gold/30' },
    booked:    { label: 'Booked',    color: 'text-green',      bg: 'bg-green/10',  border: 'border-green/30' },
    sold:      { label: 'Sold',      color: 'text-gray',       bg: 'bg-surface2',  border: 'border-border' },
  }[status]
  return (
    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

// ── main client component ────────────────────────────────────────────────────
export default function TowerClient() {
  const [view, setView]                 = useState<'3d' | 'list'>('3d')
  const [selected, setSelected]         = useState<Unit | null>(null)
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set())
  const [aiQuery, setAiQuery]           = useState('')
  const [aiRunning, setAiRunning]       = useState(false)
  const [aiResult, setAiResult]         = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all')
  const [typeFilter, setTypeFilter]     = useState<'all' | '1BHK' | '2BHK' | '3BHK'>('all')

  const filtered = useMemo(
    () =>
      UNITS.filter(
        u =>
          (statusFilter === 'all' || u.status === statusFilter) &&
          (typeFilter === 'all' || u.type === typeFilter),
      ),
    [statusFilter, typeFilter],
  )

  const stats = useMemo(
    () => ({
      total:     UNITS.length,
      available: UNITS.filter(u => u.status === 'available').length,
      held:      UNITS.filter(u => u.status === 'held').length,
      booked:    UNITS.filter(u => u.status === 'booked').length,
      sold:      UNITS.filter(u => u.status === 'sold').length,
    }),
    [],
  )

  function handleAiQuery() {
    if (!aiQuery.trim()) return
    setAiRunning(true)
    setHighlightIds(new Set())
    setAiResult(null)

    setTimeout(() => {
      const q = aiQuery.toLowerCase()
      let matched: Unit[] = []
      let explanation = ''

      if (q.includes('unsold') && q.includes('3bhk') && q.includes('floor')) {
        matched = UNITS.filter(
          u =>
            u.status === 'available' &&
            u.type === '3BHK' &&
            u.floor > 10 &&
            u.govTruth.title === 'clean' &&
            !u.collectionStage?.includes('Overdue'),
        )
        explanation = `Found ${matched.length} unsold 3BHK units above floor 10 with clean title and no overdue collections.`
      } else if (
        q.includes('highest') &&
        (q.includes('price') || q.includes('registry'))
      ) {
        const sorted = [...UNITS]
          .filter(u => u.status === 'available')
          .sort((a, b) => b.price - a.price)
          .slice(0, 5)
        matched = sorted
        explanation = `Top ${matched.length} available units by registry-backed price. Highest: ${sorted[0]?.id} at ₹${((sorted[0]?.price ?? 0) / 100000).toFixed(1)}L.`
      } else if (
        q.includes('litigation') ||
        q.includes('rera') ||
        q.includes('flag')
      ) {
        matched = UNITS.filter(
          u =>
            u.govTruth.title === 'flag' ||
            u.govTruth.rera === 'pending' ||
            u.govTruth.litigation === 'active',
        )
        explanation = `Found ${matched.length} unit(s) with government registry flags. Review before processing payment.`
      } else {
        matched = UNITS.filter(u => u.status === 'available').slice(0, 8)
        explanation = `Showing ${matched.length} available units. Try: "unsold 3BHK above floor 10" or "flag anything with litigation".`
      }

      setHighlightIds(new Set(matched.map(u => u.id)))
      setAiResult(explanation)
      setAiRunning(false)
    }, 1200)
  }

  const fmtPrice = (p: number) => `₹${(p / 100000).toFixed(1)}L`

  return (
    <div className="min-h-screen bg-background text-off-white">
      {/* Page header */}
      <div className="px-6 sm:px-8 py-5 border-b border-border shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">
          Vantis Build · Developer Intelligence · Divya Villas · JDA Projects
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white leading-none">
            Tower View
          </h1>
          <div className="flex items-center gap-3">
            <Link href="/build" className="text-gray hover:text-gold transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-[9px] font-mono text-gray bg-surface2 border border-border px-2 py-0.5 rounded-sm">
              73 units
            </span>
            <div className="flex items-center gap-2">
              {(['3d', 'list'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-sm border transition-colors ${
                    view === v
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-border text-gray hover:border-gold/40'
                  }`}
                >
                  {v === '3d' ? <Box className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                  {v.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-px border-b border-border bg-border">
        {[
          { label: 'Total Units',  value: stats.total,               color: 'text-off-white' },
          { label: 'Available',    value: stats.available,           color: 'text-gray-light' },
          { label: 'Booked/Held',  value: stats.booked + stats.held, color: 'text-gold' },
          { label: 'Sold',         value: stats.sold,                color: 'text-green' },
        ].map(k => (
          <div key={k.label} className="bg-surface px-4 py-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">{k.label}</span>
            <div className={`font-syne text-2xl sm:text-3xl font-bold mt-1 ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="flex h-[calc(100vh-130px)]">
        {/* Main view */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* AI query bar */}
          <div className="flex gap-2 px-4 pt-3 pb-2 border-b border-border bg-surface/50">
            <input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiQuery()}
              placeholder="Show me unsold 3BHK above floor 10 with clean title… or flag anything with litigation"
              className="flex-1 bg-surface2 border border-border rounded-sm px-3 py-2 text-xs text-off-white placeholder-gray focus:outline-none focus:border-gold/50 transition-colors"
            />
            <button
              onClick={handleAiQuery}
              disabled={aiRunning}
              className="px-4 py-2 bg-gold/15 border border-gold/40 text-gold text-xs font-mono rounded-sm hover:bg-gold/25 transition-colors disabled:opacity-40"
            >
              {aiRunning ? '...' : 'Query'}
            </button>
            {highlightIds.size > 0 && (
              <button
                onClick={() => { setHighlightIds(new Set()); setAiResult(null) }}
                className="px-2 py-2 border border-border text-gray rounded-sm hover:text-off-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {aiResult && (
            <div className="px-4 py-2 bg-gold/[0.08] border-b border-gold/20 text-xs text-gold-light font-mono">
              {aiResult} · {highlightIds.size} unit{highlightIds.size !== 1 ? 's' : ''} highlighted
            </div>
          )}

          {/* 3D or list */}
          {view === '3d' ? (
            <div className="flex-1 min-h-0">
              <IsoTower
                selectedId={selected?.id ?? null}
                highlightIds={highlightIds}
                onSelect={setSelected}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Filters */}
              <div className="flex gap-2 px-4 py-3 border-b border-border bg-surface/30 flex-wrap">
                {(['all', 'available', 'held', 'booked', 'sold'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase rounded-sm border transition-colors ${
                      statusFilter === s
                        ? 'border-gold text-gold bg-gold/10'
                        : 'border-border text-gray hover:border-gold/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  {(['all', '1BHK', '2BHK', '3BHK'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`px-3 py-1 text-[10px] font-mono uppercase rounded-sm border transition-colors ${
                        typeFilter === t
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-border text-gray hover:border-gold/30'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <table className="w-full">
                <thead className="sticky top-0 bg-surface2 border-b border-border">
                  <tr>
                    {['Unit', 'Floor', 'Type', 'Sq Ft', 'Price', 'Status', 'Buyer', 'Collection', 'Gov Truth'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-[0.1em] text-gray">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(unit => {
                    const allClean =
                      unit.govTruth.title === 'clean' &&
                      unit.govTruth.rera === 'registered' &&
                      unit.govTruth.litigation === 'none'
                    return (
                      <tr
                        key={unit.id}
                        onClick={() => setSelected(unit)}
                        className={`border-b border-border/40 last:border-0 cursor-pointer transition-colors ${
                          selected?.id === unit.id ? 'bg-gold/[0.08]' : 'hover:bg-surface2/60'
                        }`}
                      >
                        <td className="px-4 py-2.5 text-xs font-mono text-gold">{unit.id}</td>
                        <td className="px-4 py-2.5 text-xs font-mono text-off-white">{unit.floor}</td>
                        <td className="px-4 py-2.5 text-xs font-mono text-off-white">{unit.type}</td>
                        <td className="px-4 py-2.5 text-xs font-mono text-gray">{unit.sqft.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-xs font-mono text-off-white">{fmtPrice(unit.price)}</td>
                        <td className="px-4 py-2.5"><StatusChip status={unit.status} /></td>
                        <td className="px-4 py-2.5 text-xs text-gray">{unit.buyer ?? '—'}</td>
                        <td
                          className="px-4 py-2.5 text-xs"
                          style={{
                            color: unit.collectionStage?.includes('Overdue') ? '#E74C3C' : '#6B6B88',
                          }}
                        >
                          {unit.collectionStage ?? '—'}
                        </td>
                        <td className="px-4 py-2.5">
                          {allClean
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-green" />
                            : <AlertTriangle className="w-3.5 h-3.5 text-amber" />
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right panel — unit detail */}
        {selected && (
          <div className="w-72 border-l border-border bg-surface flex flex-col overflow-y-auto shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-syne text-base text-off-white">{selected.id}</span>
              <button
                onClick={() => setSelected(null)}
                className="text-gray hover:text-off-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layer 1: Operating record */}
            <div className="px-4 py-4 border-b border-border">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">① Operating Record</span>
              <div className="space-y-2 text-xs mt-3">
                <div className="flex justify-between">
                  <span className="text-gray">Status</span>
                  <StatusChip status={selected.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray">Type</span>
                  <span className="text-off-white font-mono">{selected.type} · {selected.sqft} sqft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray">Price</span>
                  <span className="text-off-white font-mono font-bold">{fmtPrice(selected.price)}</span>
                </div>
                {selected.buyer && (
                  <div className="flex justify-between">
                    <span className="text-gray">Buyer</span>
                    <span className="text-off-white">{selected.buyer}</span>
                  </div>
                )}
                {selected.collectionStage && (
                  <div className="flex justify-between">
                    <span className="text-gray">Collection</span>
                    <span
                      style={{
                        color: selected.collectionStage.includes('Overdue') ? '#E74C3C' : '#2ECC71',
                      }}
                    >
                      {selected.collectionStage}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Layer 2: Government truth */}
            <div className="px-4 py-4 border-b border-border">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">② Government Truth</span>
              <div className="space-y-2 mt-3">
                <GovBadge
                  label="Title (Kaveri)"
                  value={selected.govTruth.title === 'clean' ? 'Clean' : 'Flag — see EC'}
                  pass={selected.govTruth.title === 'clean'}
                />
                <GovBadge
                  label="RERA (K-RERA)"
                  value={selected.govTruth.rera === 'registered' ? 'Registered' : 'Pending'}
                  pass={selected.govTruth.rera === 'registered'}
                />
                <GovBadge
                  label="Litigation (eCourts)"
                  value={selected.govTruth.litigation === 'none' ? 'None found' : 'Active case'}
                  pass={selected.govTruth.litigation === 'none'}
                />
              </div>
              <p className="text-[9px] text-gray mt-3 leading-relaxed italic">
                No competitor&apos;s 3D viewer can show this — none are wired to the registries.
              </p>
            </div>

            {/* Layer 3: AI result */}
            <div className="px-4 py-4">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">③ AI Query Result</span>
              <div className="mt-3">
              {aiResult && highlightIds.has(selected.id) ? (
                <div className="text-xs text-gold leading-relaxed">
                  This unit matches your query: &quot;{aiQuery}&quot;
                </div>
              ) : aiResult && !highlightIds.has(selected.id) ? (
                <div className="text-xs text-gray leading-relaxed">
                  This unit did not match the last query.
                </div>
              ) : (
                <div className="text-xs text-gray leading-relaxed">
                  Run a query in the search bar above to see why this unit was or wasn&apos;t included.
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
