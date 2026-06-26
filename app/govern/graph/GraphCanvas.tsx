'use client'

// This file is ONLY ever loaded client-side (via next/dynamic + ssr:false in page.tsx).
// force-graph uses window.innerWidth at module-level, so it must never be evaluated on the server.

import { useEffect, useRef, useCallback } from 'react'
import type { FGNode, FGLink, NodeType } from './graphData'
import { NODE_COLORS, NODE_RADIUS, NODE_LETTER } from './graphData'

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

export default function GraphCanvas({
  nodes, links,
  selectedNodeId, visibleTypes, highlightedIds, hoveredId, adjacencyMap,
  onNodeClick, onNodeHover, onBackgroundClick, onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef        = useRef<any>(null)

  // Mutable refs — read inside stable canvas callbacks without re-running init
  const selectedIdRef    = useRef<string | null>(null)
  const visibleTypesRef  = useRef<Set<string>>(visibleTypes)
  const highlightedRef   = useRef<Set<string>>(highlightedIds)
  const hoveredIdRef     = useRef<string | null>(null)
  const adjacencyRef     = useRef<Map<string, Set<string>>>(adjacencyMap)
  const onNodeClickRef   = useRef(onNodeClick)
  const onNodeHoverRef   = useRef(onNodeHover)
  const onBackgroundRef  = useRef(onBackgroundClick)
  const onReadyRef       = useRef(onReady)
  const nodesRef         = useRef(nodes)
  const linksRef         = useRef(links)

  useEffect(() => { selectedIdRef.current   = selectedNodeId  }, [selectedNodeId])
  useEffect(() => { visibleTypesRef.current  = visibleTypes   }, [visibleTypes])
  useEffect(() => { highlightedRef.current   = highlightedIds }, [highlightedIds])
  useEffect(() => { hoveredIdRef.current     = hoveredId      }, [hoveredId])
  useEffect(() => { adjacencyRef.current     = adjacencyMap   }, [adjacencyMap])
  useEffect(() => { onNodeClickRef.current   = onNodeClick    }, [onNodeClick])
  useEffect(() => { onNodeHoverRef.current   = onNodeHover    }, [onNodeHover])
  useEffect(() => { onBackgroundRef.current  = onBackgroundClick }, [onBackgroundClick])
  useEffect(() => { onReadyRef.current       = onReady        }, [onReady])
  useEffect(() => { nodesRef.current         = nodes          }, [nodes])
  useEffect(() => { linksRef.current         = links          }, [links])

  /* ── canvas draw functions (stable — read from refs) ────────────── */
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, gs: number) => {
    const { x = 0, y = 0, id, type, label, anomaly } = node as FGNode & { x: number; y: number }
    const color  = NODE_COLORS[type as NodeType] ?? '#888'
    const r      = NODE_RADIUS[type as NodeType] ?? 6

    const selected     = selectedIdRef.current === id
    const isHighlighted = highlightedRef.current.has(id)
    const hovered      = hoveredIdRef.current
    const isNeighbor   = hovered ? (adjacencyRef.current.get(hovered)?.has(id) ?? false) : false
    const isDimmed     = !!hovered && hovered !== id && !isNeighbor

    ctx.globalAlpha = isDimmed ? 0.07 : 1.0

    const screenR = r * gs

    // ── Level 0: sub-pixel — tiny colored square ──────────────────────
    if (screenR < 1.5) {
      const s = 1.5 / gs
      ctx.fillStyle = isHighlighted ? '#FFD700' : color
      ctx.fillRect(x - s, y - s, s * 2, s * 2)
      ctx.globalAlpha = 1.0
      return
    }

    // ── Level 1: small circle, no label ──────────────────────────────
    if (screenR < 5) {
      if (selected || isHighlighted) {
        ctx.beginPath(); ctx.arc(x, y, r + 5 / gs, 0, 2 * Math.PI)
        ctx.fillStyle = (isHighlighted ? '#FFD700' : color) + '18'
        ctx.fill()
      }
      ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI)
      ctx.fillStyle = color + '30'; ctx.fill()
      ctx.strokeStyle = isHighlighted ? '#FFD700' : selected ? color : color + '80'
      ctx.lineWidth = isHighlighted || selected ? 2 / gs : 1 / gs
      ctx.stroke()
      if (anomaly) {
        ctx.beginPath(); ctx.arc(x + r * 0.68, y - r * 0.68, 3.5 / gs, 0, 2 * Math.PI)
        ctx.fillStyle = '#E74C3C'; ctx.fill()
      }
      ctx.globalAlpha = 1.0
      return
    }

    // ── Level 2: full circle with type letter ─────────────────────────
    if (selected || isHighlighted) {
      ctx.beginPath(); ctx.arc(x, y, r + 7, 0, 2 * Math.PI)
      ctx.fillStyle = (isHighlighted ? '#FFD700' : color) + '18'; ctx.fill()
    }

    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fillStyle = selected ? color + '35' : color + '20'; ctx.fill()

    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.strokeStyle = isHighlighted ? '#FFD700' : selected ? color : anomaly ? color + 'CC' : color + '66'
    ctx.lineWidth = isHighlighted || selected ? 2 : 1.5; ctx.stroke()

    ctx.font = `bold ${r * 0.9}px monospace`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(NODE_LETTER[type as NodeType] ?? '?', x, y)

    // ── Level 3: label (zoomed in enough) ────────────────────────────
    if (screenR > 10) {
      const truncated = (label || '').replace('⚑ ', '').slice(0, 24)
      ctx.font = `${Math.max(8, 9 / gs)}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillStyle = isHighlighted ? '#FFD700CC' : '#F0EEE8BB'
      ctx.fillText(truncated, x, y + r + 3)
    }

    // Anomaly dot (top-right)
    if (anomaly) {
      ctx.beginPath(); ctx.arc(x + r * 0.68, y - r * 0.68, 3.5, 0, 2 * Math.PI)
      ctx.fillStyle = '#E74C3C'; ctx.fill()
    }

    // Selection ring
    if (selected) {
      ctx.beginPath(); ctx.arc(x, y, r + 5, 0, 2 * Math.PI)
      ctx.strokeStyle = color + 'AA'; ctx.lineWidth = 1
      ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([])
    }

    // Highlight pulse ring
    if (isHighlighted && !selected) {
      ctx.beginPath(); ctx.arc(x, y, r + 6, 0, 2 * Math.PI)
      ctx.strokeStyle = '#FFD70088'; ctx.lineWidth = 2
      ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([])
    }

    ctx.globalAlpha = 1.0
  }, [])

  const drawPointerArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const r = NODE_RADIUS[(node as FGNode).type as NodeType] ?? 6
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(node.x ?? 0, node.y ?? 0, r + 8, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, gs: number) => {
    const src = link.source as FGNode & { x: number; y: number }
    const tgt = link.target as FGNode & { x: number; y: number }
    if (src.x == null || tgt.x == null) return

    // Skip link rendering at very low zoom for performance
    if (gs < 0.06) return

    const dx = tgt.x - src.x, dy = tgt.y - src.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return

    const srcR = NODE_RADIUS[src.type as NodeType] ?? 6
    const tgtR = NODE_RADIUS[tgt.type as NodeType] ?? 6
    const sx = src.x + (dx / dist) * srcR
    const sy = src.y + (dy / dist) * srcR
    const ex = tgt.x - (dx / dist) * (tgtR + 4)
    const ey = tgt.y - (dy / dist) * (tgtR + 4)

    const isRelated = link.type === 'related-party'
    const isSpouse  = link.type === 'spouse-of'

    // Simplified line at medium zoom, full style when zoomed in
    const detailed = gs > 0.15
    ctx.beginPath()
    if (detailed) {
      if (isRelated)      { ctx.setLineDash([5, 4]); ctx.strokeStyle = '#E74C3C'; ctx.lineWidth = 2 }
      else if (isSpouse)  { ctx.setLineDash([3, 3]); ctx.strokeStyle = '#9B59B6AA'; ctx.lineWidth = 1.5 }
      else                { ctx.setLineDash([]);     ctx.strokeStyle = '#1A1A3099'; ctx.lineWidth = 1 }
    } else {
      ctx.setLineDash([])
      ctx.strokeStyle = isRelated ? '#E74C3C55' : '#1A1A3066'
      ctx.lineWidth = isRelated ? 1 : 0.5
    }
    ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([])

    if (!detailed) return

    // Arrowhead
    const angle = Math.atan2(ey - sy, ex - sx), al = 6
    ctx.beginPath()
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex - al * Math.cos(angle - 0.42), ey - al * Math.sin(angle - 0.42))
    ctx.lineTo(ex - al * Math.cos(angle + 0.42), ey - al * Math.sin(angle + 0.42))
    ctx.closePath()
    ctx.fillStyle = isRelated ? '#E74C3C' : '#1A1A3099'; ctx.fill()

    if (gs > 0.85 && link.label) {
      const mx = (sx + ex) / 2, my = (sy + ey) / 2
      ctx.font = `${9 / gs}px monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = isRelated ? '#E74C3CAA' : '#6B6B88'
      ctx.fillText(link.label as string, mx, my - 8 / gs)
    }
  }, [])

  /* ── force-graph init (runs once, browser only) ──────────────────── */
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    let ro: ResizeObserver | null = null
    let cancelled = false // guard against unmount-before-import race

    import('force-graph').then(mod => {
      if (cancelled) return
      const ForceGraph = (mod as any).default ?? mod
      const fg = ForceGraph()(container)

      fg
        .width(container.offsetWidth || 800)
        .height(container.offsetHeight || 600)
        .backgroundColor('#0A0A0F')
        .nodeId('id')
        .nodeCanvasObject(drawNode)
        .nodeCanvasObjectMode(() => 'replace')
        .nodePointerAreaPaint(drawPointerArea)
        .linkCanvasObject(drawLink)
        .linkCanvasObjectMode(() => 'replace')
        .onNodeClick((node: any) => onNodeClickRef.current(node as FGNode))
        .onNodeHover((node: any) => onNodeHoverRef.current(node ? (node as FGNode) : null))
        .onNodeDragEnd((node: any) => { node.fx = node.x; node.fy = node.y })
        .onBackgroundClick(() => onBackgroundRef.current())
        // Visibility filters — read from refs so toggling types needs no re-init
        .nodeVisibility((node: any) => visibleTypesRef.current.has((node as FGNode).type))
        .linkVisibility((link: any) => {
          const sType = (link.source as any)?.type as string | undefined
          const tType = (link.target as any)?.type as string | undefined
          if (!sType || !tType) return true // links before force-graph resolves nodes
          return visibleTypesRef.current.has(sType) && visibleTypesRef.current.has(tType)
        })
        // Pre-cool: 100 warmup ticks synchronously (~40ms), then freeze immediately
        .warmupTicks(100)
        .cooldownTicks(0)
        // Keep render loop alive so nodeVisibility updates paint without user interaction
        .autoPauseRedraw(false)
        .d3AlphaDecay(0.03)
        .d3VelocityDecay(0.3)

      // Stronger repulsion so developer clusters spread out
      fg.d3Force('charge')?.strength(-120)
      fg.d3Force('link')?.distance(40)

      // Load data — warmupTicks run synchronously inside graphData(), positions are ready
      fg.graphData({ nodes: nodesRef.current, links: linksRef.current })

      // Freeze all positions once settled (preserves layout on subsequent renders)
      fg.onEngineStop(() => {
        fg.graphData().nodes.forEach((n: any) => { n.fx = n.x; n.fy = n.y })
        onReadyRef.current(fg)
      })

      fgRef.current = fg

      ro = new ResizeObserver(() => {
        if (fg && container) fg.width(container.offsetWidth).height(container.offsetHeight)
      })
      ro.observe(container)
    }).catch((err: unknown) => {
      // eslint-disable-next-line no-console
      console.error('[GraphCanvas] force-graph load error:', err)
    })

    return () => {
      cancelled = true
      ro?.disconnect()
      if (fgRef.current) fgRef.current.pauseAnimation() // stop RAF before innerHTML clear
      if (container) container.innerHTML = ''
      fgRef.current = null
    }
  }, [drawNode, drawPointerArea, drawLink])

  /* ── sync data updates if nodes/links ever change at runtime ──────── */
  useEffect(() => {
    // nodes/links are FULL_GRAPH constants and never change reference in this build.
    // This hook exists as the extension point for future dynamic graph updates.
    if (fgRef.current && (nodes !== nodesRef.current || links !== linksRef.current)) {
      fgRef.current.graphData({ nodes, links })
    }
  }, [nodes, links])

  return <div ref={containerRef} className="w-full h-full" />
}
