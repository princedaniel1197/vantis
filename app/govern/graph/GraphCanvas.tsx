'use client'

// Sigma.js (WebGL) — loaded client-side only via next/dynamic + ssr:false.
// Uses graphology for the graph data structure and ForceAtlas2 for layout.

import { useEffect, useRef } from 'react'
import type { FGNode, FGLink, NodeType } from './graphData'
import { NODE_COLORS, NODE_RADIUS } from './graphData'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  nodes: FGNode[]
  links: FGLink[]
  selectedNodeId: string | null
  visibleTypes: Set<string>
  highlightedIds: Set<string>
  hoveredId: string | null
  adjacencyMap: Map<string, Set<string>>
  onNodeClick: (node: FGNode) => void
  onNodeHover: (node: FGNode | null) => void
  onBackgroundClick: () => void
  onReady: (fg: any) => void
}

function rgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${a})`
}

export default function GraphCanvas({
  nodes, links,
  selectedNodeId, visibleTypes, highlightedIds, hoveredId, adjacencyMap,
  onNodeClick, onNodeHover, onBackgroundClick, onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef  = useRef<any>(null)
  const graphRef     = useRef<any>(null)
  const nodeMapRef   = useRef<Map<string, FGNode>>(new Map(nodes.map(n => [n.id, n])))

  // Mutable state refs — read inside sigma reducers without re-creating them
  const selRef  = useRef<string | null>(selectedNodeId)
  const hlRef   = useRef<Set<string>>(highlightedIds)
  const hovRef  = useRef<string | null>(hoveredId)
  const vtRef   = useRef<Set<string>>(visibleTypes)
  const adjRef  = useRef<Map<string, Set<string>>>(adjacencyMap)
  const nodesRef = useRef(nodes)

  const onClickRef = useRef(onNodeClick)
  const onHovRef   = useRef(onNodeHover)
  const onBgRef    = useRef(onBackgroundClick)
  const onReadyRef = useRef(onReady)

  // Sync all visual-state refs + trigger sigma refresh in one effect
  useEffect(() => {
    selRef.current  = selectedNodeId
    hlRef.current   = highlightedIds
    hovRef.current  = hoveredId
    vtRef.current   = visibleTypes
    adjRef.current  = adjacencyMap
    rendererRef.current?.refresh()
  }, [selectedNodeId, highlightedIds, hoveredId, visibleTypes, adjacencyMap])

  useEffect(() => { onClickRef.current = onNodeClick    }, [onNodeClick])
  useEffect(() => { onHovRef.current   = onNodeHover    }, [onNodeHover])
  useEffect(() => { onBgRef.current    = onBackgroundClick }, [onBackgroundClick])
  useEffect(() => { onReadyRef.current = onReady        }, [onReady])
  useEffect(() => {
    nodesRef.current = nodes
    nodeMapRef.current = new Map(nodes.map(n => [n.id, n]))
  }, [nodes])

  /* ── Main init effect (browser only, runs once) ───────────────────── */
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    let ro: ResizeObserver | null = null

    Promise.all([
      import('graphology')                      as Promise<{ default: any }>,
      import('sigma')                           as Promise<{ default: any }>,
      import('graphology-layout-forceatlas2')   as Promise<{ default: any }>,
      import('@sigma/node-border')              as Promise<{ createNodeBorderProgram: any }>,
    ]).then(([
      { default: Graph },
      { default: Sigma },
      { default: forceAtlas2 },
      { createNodeBorderProgram },
    ]) => {
      if (cancelled || !containerRef.current) return

      // ── 1. Build graphology graph ────────────────────────────────
      const graph = new Graph({ type: 'directed', multi: true })

      nodesRef.current.forEach(node => {
        const color = NODE_COLORS[node.type as NodeType] ?? '#888888'
        const size  = (NODE_RADIUS[node.type as NodeType] ?? 5) * 3.2

        graph.addNode(node.id, {
          // Random seed positions; ForceAtlas2 resolves the layout
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          size,
          color:       rgba(color, 0.3),    // inner fill (dim)
          borderColor: rgba(color, 0.85),   // outer ring (bright)
          label:       node.label.replace('⚑ ', ''),
          type:        'obsidian',
          // Private attrs (prefixed _) read by reducers
          _color: color,
          _size:  size,
          _type:  node.type,
          _anomaly: node.anomaly ?? false,
        })
      })

      links.forEach(link => {
        const src = typeof link.source === 'string' ? link.source : link.source.id
        const tgt = typeof link.target === 'string' ? link.target : link.target.id
        if (!graph.hasNode(src) || !graph.hasNode(tgt)) return

        const edgeColor = link.type === 'related-party' ? '#E74C3C'
          : link.type === 'spouse-of'                   ? '#9B59B6'
          : '#8888CC'
        const edgeAlpha = link.type === 'related-party' ? 0.50
          : link.type === 'spouse-of'                   ? 0.32
          : 0.09

        try {
          graph.addEdge(src, tgt, {
            size:   link.type === 'related-party' ? 1.4 : 0.55,
            color:  rgba(edgeColor, edgeAlpha),
            _color: edgeColor,
            _alpha: edgeAlpha,
            _type:  link.type,
          })
        } catch { /* multigraph: ignore duplicate edges */ }
      })

      // ── 2. ForceAtlas2 layout (synchronous) ─────────────────────
      // Scale iterations down for large graphs to keep load time acceptable
      const nodeCount = graph.order
      const fa2Iters  = nodeCount > 10000 ? 30
        : nodeCount > 5000  ? 60
        : nodeCount > 2000  ? 100
        : 200
      forceAtlas2.assign(graph, {
        iterations: fa2Iters,
        settings: {
          barnesHutOptimize: true,
          gravity:      0.8,
          scalingRatio: 4,
          slowDown:     3,
        },
      })

      // Stamp sigma positions onto FGNode objects so page.tsx focusNode works
      nodesRef.current.forEach(fgNode => {
        if (graph.hasNode(fgNode.id)) {
          const a = graph.getNodeAttributes(fgNode.id)
          fgNode.x = a.x
          fgNode.y = a.y
        }
      })
      graphRef.current = graph

      // ── 3. Custom bordered-circle program (Obsidian ring style) ──
      const ObsidianNodeProgram = createNodeBorderProgram({
        borders: [
          // Outer ring — bright colored ring (25% of radius)
          {
            size:  { value: 0.25, mode: 'relative' },
            color: { attribute: 'borderColor', defaultValue: '#888888' },
          },
          // Inner fill — dim colored fill
          {
            size:  { fill: true },
            color: { attribute: 'color' },
          },
        ],
      })

      // ── 4. Sigma renderer ────────────────────────────────────────
      // For large graphs (>5k nodes) only render labels on interaction
      const largeGraph = nodeCount > 5000
      const renderer = new Sigma(graph, containerRef.current!, {
        renderEdgeLabels: false,
        labelFont:   '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
        labelSize:   10,
        labelWeight: '400',
        labelColor:  { color: '#FFFFFF66' },
        labelDensity: largeGraph ? 0.15 : 0.5,
        minCameraRatio: 0.001,
        maxCameraRatio: 50,
        enableEdgeClickEvents:  false,
        enableEdgeHoverEvents:  false,
        enableEdgeWheelEvents:  false,
        nodeProgramClasses:  { obsidian: ObsidianNodeProgram },
        defaultNodeType:     'obsidian',

        // ── Node reducer: Obsidian visual states ─────────────────
        nodeReducer: (nodeId: string, data: any) => {
          const color  = data._color as string
          const size   = data._size  as number
          const type   = data._type  as string

          const selected  = selRef.current === nodeId
          const isHl      = hlRef.current.has(nodeId)
          const hov       = hovRef.current
          const isSelf    = hov === nodeId
          const isNeighbor = hov
            ? (adjRef.current.get(hov)?.has(nodeId) ?? false)
            : false
          const isDim    = !!hov && !isSelf && !isNeighbor
          const isHidden = !vtRef.current.has(type)

          if (isHidden) return { ...data, hidden: true }

          // For large graphs only show labels on active/selected nodes to avoid clutter
          const showLabel = largeGraph
            ? (selected || isHl || isSelf || isNeighbor)
            : (type === 'developer' || type === 'person' || type === 'asset'
               || selected || isHl || isSelf)

          // Sizes
          const displaySize = selected  ? size * 1.55
            : isHl        ? size * 1.45
            : isSelf      ? size * 1.30
            : isNeighbor  ? size * 1.10
            : size

          // Fill colors (inner circle)
          const fillColor = isDim       ? rgba(color, 0.03)
            : isHl                      ? 'rgba(255,215,0,0.55)'
            : (selected || isSelf)      ? rgba(color, 0.70)
            : isNeighbor                ? rgba(color, 0.48)
            : rgba(color, 0.28)

          // Border ring colors
          const borderCol = isDim       ? rgba(color, 0.06)
            : isHl                      ? '#FFD700'
            : selected                  ? color
            : isSelf                    ? color
            : isNeighbor                ? rgba(color, 0.88)
            : rgba(color, 0.65)

          return {
            ...data,
            hidden:      false,
            size:        displaySize,
            color:       fillColor,
            borderColor: borderCol,
            label:       showLabel ? data.label : '',
            zIndex:      (selected || isHl || isSelf) ? 1 : isDim ? -1 : 0,
          }
        },

        // ── Edge reducer ─────────────────────────────────────────
        edgeReducer: (edgeId: string, data: any) => {
          const hov = hovRef.current
          if (!hov) {
            return {
              ...data,
              color: rgba(data._color, data._alpha),
              size:  data._type === 'related-party' ? 1.4 : 0.55,
            }
          }
          const [src, tgt] = graph.extremities(edgeId)
          const isActive = src === hov || tgt === hov
          return {
            ...data,
            color: isActive
              ? rgba(data._color, Math.min(0.92, (data._alpha as number) * 2.8))
              : rgba(data._color, 0.018),
            size: isActive
              ? (data._type === 'related-party' ? 2.4 : 1.4)
              : (data._type === 'related-party' ? 1.4 : 0.55),
          }
        },
      })

      rendererRef.current = renderer

      // ── 5. Events ────────────────────────────────────────────────
      renderer.on('clickNode',  ({ node }: { node: string }) => {
        const n = nodeMapRef.current.get(node)
        if (n) onClickRef.current(n)
      })
      renderer.on('enterNode', ({ node }: { node: string }) => {
        onHovRef.current(nodeMapRef.current.get(node) ?? null)
      })
      renderer.on('leaveNode', () => {
        onHovRef.current(null)
      })
      renderer.on('clickStage', () => {
        onBgRef.current()
      })

      // ── 6. force-graph–compatible adapter for page.tsx ────────────
      // page.tsx uses fgRef.current.centerAt(x,y,ms) and .zoom(level,ms)
      const adapter = {
        centerAt(x: number, y: number, duration: number) {
          const cam = renderer.getCamera()
          if (x === 0 && y === 0) {
            cam.animatedReset({ duration })
          } else {
            cam.animate({ x, y }, { duration })
          }
        },
        zoom(levelOrGet?: number, duration?: number) {
          const cam = renderer.getCamera()
          if (levelOrGet === undefined) return 1 / Math.max(0.001, cam.ratio)
          const ratio = 1 / Math.max(0.005, levelOrGet)
          if (duration !== undefined) {
            cam.animate({ ratio }, { duration })
          } else {
            cam.setState({ ...cam.getState(), ratio })
          }
        },
        pauseAnimation() { /* no-op — sigma has no explicit animation stop */ },
      }

      onReadyRef.current(adapter)

      // ── 7. Resize observer ───────────────────────────────────────
      ro = new ResizeObserver(() => renderer.refresh())
      ro.observe(containerRef.current!)
    }).catch(err => {
      console.error('[GraphCanvas] sigma init error:', err)
    })

    return () => {
      cancelled = true
      ro?.disconnect()
      rendererRef.current?.kill()
      rendererRef.current = null
      graphRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: '#0A0A0F' }}
    />
  )
}
