'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { Search, Network, Play, ZoomIn, ZoomOut, Eye, EyeOff } from 'lucide-react'
import {
  FULL_GRAPH, ADJACENCY, OZONE_TRAIL, NODE_COLORS,
  type FGNode, type NodeType,
} from './graphData'

/* ── Dynamic import — ssr:false prevents force-graph's window.innerWidth
      from running on the server (it is called at module-level in the bundle). ── */
const GraphCanvas = dynamic(() => import('./GraphCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0A0A0F]">
      <div className="text-center">
        <div className="font-mono text-[10px] text-gray tracking-wider mb-2">
          Pre-computing 1,000+ node layout…
        </div>
        <div className="w-32 h-px bg-border mx-auto overflow-hidden">
          <div className="h-full bg-gold/60 animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  ),
})

/* ── Pre-compute lookups once at module level ────────────────────────────── */
const ALL_TYPES: NodeType[] = ['developer', 'project', 'person', 'asset', 'litigation', 'rrc']

const TYPE_COUNTS: Record<NodeType, number> = {
  developer: 0, project: 0, person: 0, asset: 0, litigation: 0, rrc: 0,
}
for (const n of FULL_GRAPH.nodes) TYPE_COUNTS[n.type]++

// O(1) node lookup by id — avoids O(N) find() calls on every hover/render
const NODE_MAP = new Map(FULL_GRAPH.nodes.map(n => [n.id, n]))

/* ── Dossier panel ───────────────────────────────────────────────────────── */
function DossierPanel({ node, onFocus, onClose }: {
  node: FGNode
  onFocus: () => void
  onClose: () => void
}) {
  const color = NODE_COLORS[node.type]
  return (
    <div className="flex flex-col w-72 shrink-0 border-l border-border bg-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-sm border"
            style={{ color, borderColor: color + '55', backgroundColor: color + '15' }}>
            {node.type}
          </span>
          <button onClick={onClose} className="text-gray hover:text-off-white transition-colors p-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <h2 className="font-syne text-sm font-bold text-off-white leading-snug">{node.label}</h2>
        {node.anomaly && (
          <div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-red/10 border border-red/25 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-red shrink-0 animate-pulse" />
            <span className="text-[9px] font-mono text-red uppercase tracking-wider">Anomaly detected</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/50">
        {Object.entries(node.data).map(([k, v]) => (
          <div key={k} className="px-4 py-2.5">
            <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gray mb-0.5">{k}</div>
            <div className={`text-xs leading-relaxed ${k.startsWith('⚑') ? 'text-gold font-medium' : 'text-off-white'}`}>
              {String(v ?? '—')}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border shrink-0">
        <button onClick={onFocus}
          className="w-full py-2 bg-surface2 border border-border text-gray-light text-xs font-mono rounded-sm hover:text-gold hover:border-gold/40 transition-colors">
          Focus in graph →
        </button>
      </div>
    </div>
  )
}

/* ── Filter + legend panel ───────────────────────────────────────────────── */
function FilterPanel({ visibleTypes, onToggle }: {
  visibleTypes: Set<string>
  onToggle: (type: NodeType) => void
}) {
  return (
    <div className="w-56 shrink-0 border-l border-border bg-surface flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">Filter by Type</div>
        <div className="space-y-1.5">
          {ALL_TYPES.map(type => {
            const on = visibleTypes.has(type)
            const color = NODE_COLORS[type]
            return (
              <button key={type} onClick={() => onToggle(type)}
                className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-sm border transition-colors"
                style={{
                  borderColor: on ? color + '60' : '#2A2A3E',
                  backgroundColor: on ? color + '10' : 'transparent',
                }}>
                <div className="flex items-center gap-2 min-w-0">
                  {on
                    ? <Eye className="w-3 h-3 shrink-0" style={{ color }} />
                    : <EyeOff className="w-3 h-3 shrink-0 text-gray" />}
                  <span className="font-mono text-[10px] capitalize truncate"
                    style={{ color: on ? color : '#666' }}>
                    {type}
                  </span>
                </div>
                <span className="font-mono text-[9px] shrink-0"
                  style={{ color: on ? color + 'AA' : '#444' }}>
                  {TYPE_COUNTS[type]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pt-3 pb-3 border-b border-border">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">Edge Types</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-px" style={{ background: '#1A1A44' }} />
            <span className="font-mono text-[10px] text-gray">Relationship</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 border-t-2 border-dashed border-[#9B59B6] shrink-0" />
            <span className="font-mono text-[10px] text-gray">Spouse / family</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 border-t-2 border-dashed border-red shrink-0" />
            <span className="font-mono text-[10px] text-red">Hidden / related-party</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">How to use</div>
        <ol className="space-y-1.5 font-mono text-[10px] text-gray leading-relaxed">
          <li>1. Search + zoom to any entity</li>
          <li>2. Click a node for its dossier</li>
          <li>3. Hover to highlight connections</li>
          <li>4. Press Ozone Trail to reveal</li>
          <li>5. Toggle types to filter view</li>
        </ol>
      </div>
    </div>
  )
}

/* ── Page component ──────────────────────────────────────────────────────── */
export default function InvestigationCanvas() {
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(ALL_TYPES)
  )
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set())
  const [hoveredId, setHoveredId]           = useState<string | null>(null)
  const [selectedNode, setSelectedNode]     = useState<FGNode | null>(null)
  const [searchQuery, setSearchQuery]       = useState('')
  const [isAnimating, setIsAnimating]       = useState(false)
  const [showKannehalli, setShowKannehalli] = useState(false)
  const [fgReady, setFgReady]               = useState(false)

  const fgRef = useRef<any>(null)

  /* ── Search results ──────────────────────────────────────────────── */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return FULL_GRAPH.nodes
      .filter(n => n.label.toLowerCase().includes(q) || n.type.includes(q))
      .slice(0, 10)
  }, [searchQuery])

  /* ── Zoom to a node in the full web ─────────────────────────────── */
  function focusNode(node: FGNode) {
    setSelectedNode(node)
    setSearchQuery('')
    if (fgRef.current && node.x != null && node.y != null) {
      fgRef.current.centerAt(node.x, node.y, 500)
      fgRef.current.zoom(2.5, 500)
    }
  }

  /* ── Type filter toggle ──────────────────────────────────────────── */
  function toggleType(type: NodeType) {
    setVisibleTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  /* ── Ozone trail ─────────────────────────────────────────────────── */
  async function runOzoneTrail() {
    if (isAnimating) return
    setIsAnimating(true)
    setHighlightedIds(new Set())
    setSelectedNode(null)
    setShowKannehalli(false)

    // Ensure all types visible
    setVisibleTypes(new Set(ALL_TYPES))

    await sleep(200)

    // Zoom out to see full constellation
    if (fgRef.current) {
      fgRef.current.zoom(0.4, 800)
      fgRef.current.centerAt(0, 0, 800)
    }
    await sleep(1000)

    // Walk the trail
    for (let i = 0; i < OZONE_TRAIL.length; i++) {
      const nodeId = OZONE_TRAIL[i]
      const node = NODE_MAP.get(nodeId)
      if (!node) continue

      setHighlightedIds(new Set(OZONE_TRAIL.slice(0, i + 1)))
      setSelectedNode(node)

      if (fgRef.current && node.x != null && node.y != null) {
        const zoomLevel = i === 0 ? 1.2 : i < 3 ? 2 : 3
        fgRef.current.centerAt(node.x, node.y, 600)
        fgRef.current.zoom(zoomLevel, 600)
      }

      if (i === OZONE_TRAIL.length - 1) {
        // Kannehalli reveal
        await sleep(800)
        setShowKannehalli(true)
      } else {
        await sleep(1800)
      }
    }

    setIsAnimating(false)
  }

  function sleep(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

  /* ── Stable callbacks for GraphCanvas ───────────────────────────── */
  const handleNodeClick = useCallback((node: FGNode) => {
    setSelectedNode(node)
  }, [])

  const handleNodeHover = useCallback((node: FGNode | null) => {
    setHoveredId(node?.id ?? null)
  }, [])

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const handleReady = useCallback((fg: any) => {
    fgRef.current = fg
    setFgReady(true)
  }, [])

  const totalVisible = useMemo(
    () => FULL_GRAPH.nodes.filter(n => visibleTypes.has(n.type)).length,
    [visibleTypes]
  )

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100dvh - 48px)' }}>
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface/95 z-10">
        <div className="flex items-center gap-2 shrink-0">
          <Network className="w-4 h-4 text-gold" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray hidden sm:block">
            K-RERA Statewide Web
          </span>
        </div>
        <div className="w-px h-5 bg-border shrink-0 hidden sm:block" />

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray pointer-events-none" />
          <input
            type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entity…"
            className="w-full pl-7 pr-3 py-1.5 bg-surface2 border border-border rounded-sm text-off-white text-xs font-mono placeholder:text-gray focus:outline-none focus:border-gold/50 transition-colors"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
              {searchResults.map(r => (
                <button key={r.id} onClick={() => focusNode(r)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface2 transition-colors">
                  <div className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: NODE_COLORS[r.type] + '55', border: `1px solid ${NODE_COLORS[r.type]}` }} />
                  <span className="text-off-white text-xs flex-1 truncate">{r.label}</span>
                  <span className="font-mono text-[9px] text-gray shrink-0">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={runOzoneTrail} disabled={isAnimating || !fgReady}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 border border-gold/40 text-gold text-xs font-mono rounded-sm hover:bg-gold/25 disabled:opacity-40 transition-colors">
          <Play className="w-3 h-3" />
          <span className="hidden sm:inline">
            {!fgReady ? 'Loading…' : isAnimating ? 'Investigating…' : 'Ozone Trail'}
          </span>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.35, 200)}
            className="p-1.5 text-gray hover:text-gold transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.35, 200)}
            className="p-1.5 text-gray hover:text-gold transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="shrink-0 font-mono text-[9px] text-gray hidden md:block">
          {totalVisible.toLocaleString()}N · {FULL_GRAPH.links.length.toLocaleString()}E
        </span>
      </div>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative bg-[#0A0A0F] overflow-hidden">
          <GraphCanvas
            nodes={FULL_GRAPH.nodes}
            links={FULL_GRAPH.links}
            selectedNodeId={selectedNode?.id ?? null}
            visibleTypes={visibleTypes}
            highlightedIds={highlightedIds}
            hoveredId={hoveredId}
            adjacencyMap={ADJACENCY}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onBackgroundClick={handleBackgroundClick}
            onReady={handleReady}
          />

          {/* Hover tooltip — O(1) lookup via pre-built NODE_MAP */}
          {hoveredId && !selectedNode && (() => {
            const n = NODE_MAP.get(hoveredId)
            return n ? (
              <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-sm px-3 py-2 pointer-events-none shadow-xl z-10">
                <div className="font-mono text-xs text-off-white">{n.label}</div>
                <div className="font-mono text-[9px] text-gray capitalize mt-0.5">{n.type}</div>
              </div>
            ) : null
          })()}

          {/* Kannehalli discovery toast */}
          {showKannehalli && (
            <div className="absolute bottom-4 right-4 w-72 bg-[#0A0A0F] border border-gold/60 rounded-sm p-4 shadow-2xl z-20">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold mb-1.5">⚑ Key Discovery</div>
                  <div className="text-off-white text-xs leading-relaxed">
                    <strong>Kannehalli Land — 179 acres (₹202.6 Cr)</strong> surfaced via Vantis Bhoomi
                    cross-reference. Registered in the promoter&apos;s spouse&apos;s name — not in any prior
                    enforcement record.
                  </div>
                  <button
                    onClick={() => {
                      const n = NODE_MAP.get('asset-kannehalli')
                      if (n) { setSelectedNode(n); setShowKannehalli(false) }
                    }}
                    className="mt-2 text-[9px] font-mono text-gold hover:text-gold-light transition-colors">
                    View asset dossier →
                  </button>
                </div>
                <button onClick={() => setShowKannehalli(false)} className="text-gray hover:text-off-white shrink-0">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedNode ? (
          <DossierPanel
            node={selectedNode}
            onFocus={() => focusNode(selectedNode)}
            onClose={() => setSelectedNode(null)}
          />
        ) : (
          <FilterPanel visibleTypes={visibleTypes} onToggle={toggleType} />
        )}
      </div>
    </div>
  )
}
