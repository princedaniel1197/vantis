'use client'

// This file is ONLY ever loaded client-side (via next/dynamic + ssr:false in page.tsx).
// force-graph uses window.innerWidth at module-level, so it must never be evaluated on the server.

import { useEffect, useRef, useCallback } from 'react'

const NODE_R = 10

const NODE_COLORS: Record<string, string> = {
  developer:  '#C9A84C',
  project:    '#3498DB',
  person:     '#9B59B6',
  asset:      '#2ECC71',
  litigation: '#E74C3C',
  rrc:        '#E67E22',
}

const NODE_LETTER: Record<string, string> = {
  developer: 'D', project: 'P', person: 'Pe',
  asset: 'A', litigation: 'Li', rrc: 'R',
}

const CONNECTIONS_KEYS = new Set([
  'ozone-group','ozone-spe','ozone-holdings','ozone-promoter','ozone-spouse',
  'skylark','prestige','zion','mantri',
])

export interface GraphNode {
  id: string; label: string; type: string
  anomaly?: boolean; expanded?: boolean
  x?: number; y?: number; fx?: number | null; fy?: number | null
}

export interface GraphLink {
  source: string | GraphNode; target: string | GraphNode
  label: string; type: string
}

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
  selectedNodeId: string | null
  expandedNodeIds: string[]
  onNodeClick: (node: GraphNode) => void
  onNodeHover: (node: GraphNode | null) => void
  onBackgroundClick: () => void
  onReady: (fg: any) => void
}

export default function GraphCanvas({
  nodes, links, selectedNodeId, expandedNodeIds,
  onNodeClick, onNodeHover, onBackgroundClick, onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const fgRef = useRef<any>(null)

  // Mutable refs so init useEffect never needs to re-run when callbacks change
  const selectedIdRef    = useRef<string | null>(null)
  const expandedRef      = useRef<Set<string>>(new Set())
  const onNodeClickRef   = useRef(onNodeClick)
  const onNodeHoverRef   = useRef(onNodeHover)
  const onBackgroundRef  = useRef(onBackgroundClick)
  const onReadyRef       = useRef(onReady)

  useEffect(() => { selectedIdRef.current = selectedNodeId }, [selectedNodeId])
  useEffect(() => { expandedRef.current = new Set(expandedNodeIds) }, [expandedNodeIds])
  useEffect(() => { onNodeClickRef.current  = onNodeClick },  [onNodeClick])
  useEffect(() => { onNodeHoverRef.current  = onNodeHover },  [onNodeHover])
  useEffect(() => { onBackgroundRef.current = onBackgroundClick }, [onBackgroundClick])
  useEffect(() => { onReadyRef.current      = onReady },      [onReady])

  /* ── canvas draw callbacks (stable, read from refs) ──────────── */
  const drawNode = useCallback((node: any, ctx: CanvasRenderingContext2D, gs: number) => {
    const { x = 0, y = 0, id, type, label, anomaly } = node as GraphNode & { x: number; y: number }
    const color = NODE_COLORS[type] ?? '#888'
    const selected = selectedIdRef.current === id
    const hasMore  = CONNECTIONS_KEYS.has(id) && !expandedRef.current.has(id)

    if (selected) {
      ctx.beginPath(); ctx.arc(x, y, NODE_R + 7, 0, 2 * Math.PI)
      ctx.fillStyle = color + '18'; ctx.fill()
    }

    ctx.beginPath(); ctx.arc(x, y, NODE_R, 0, 2 * Math.PI)
    ctx.fillStyle = selected ? color + '35' : color + '20'; ctx.fill()

    ctx.beginPath(); ctx.arc(x, y, NODE_R, 0, 2 * Math.PI)
    ctx.strokeStyle = selected ? color : anomaly ? color + 'CC' : color + '66'
    ctx.lineWidth = selected ? 2 : 1.5; ctx.stroke()

    ctx.font = `bold ${NODE_R * 0.95}px monospace`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(NODE_LETTER[type] ?? '?', x, y)

    if (gs > 0.45) {
      const truncated = (label || '').replace('⚑ ', '').slice(0, 22)
      ctx.font = `${9 / gs}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'top'
      ctx.fillStyle = '#F0EEE8BB'
      ctx.fillText(truncated, x, y + NODE_R + 3)
    }

    if (anomaly) {
      ctx.beginPath(); ctx.arc(x + NODE_R * 0.68, y - NODE_R * 0.68, 3.5, 0, 2 * Math.PI)
      ctx.fillStyle = '#E74C3C'; ctx.fill()
    }

    if (hasMore) {
      ctx.beginPath(); ctx.arc(x, y + NODE_R + 1.5, 2.5, 0, 2 * Math.PI)
      ctx.fillStyle = '#C9A84C'; ctx.fill()
    }

    if (selected) {
      ctx.beginPath(); ctx.arc(x, y, NODE_R + 5, 0, 2 * Math.PI)
      ctx.strokeStyle = color + 'AA'; ctx.lineWidth = 1
      ctx.setLineDash([3, 2]); ctx.stroke(); ctx.setLineDash([])
    }
  }, [])

  const drawPointerArea = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(node.x ?? 0, node.y ?? 0, NODE_R + 8, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, gs: number) => {
    const src = link.source as GraphNode & { x: number; y: number }
    const tgt = link.target as GraphNode & { x: number; y: number }
    if (src.x == null || tgt.x == null) return

    const isRelated = link.type === 'related-party'
    const isSpouse  = link.type === 'spouse-of'
    const dx = tgt.x - src.x, dy = tgt.y - src.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return

    const sx = src.x + (dx / dist) * NODE_R,    sy = src.y + (dy / dist) * NODE_R
    const ex = tgt.x - (dx / dist) * (NODE_R + 5), ey = tgt.y - (dy / dist) * (NODE_R + 5)

    ctx.beginPath()
    if (isRelated)      { ctx.setLineDash([5, 4]); ctx.strokeStyle = '#E74C3C';    ctx.lineWidth = 2 }
    else if (isSpouse)  { ctx.setLineDash([3, 3]); ctx.strokeStyle = '#9B59B6AA';  ctx.lineWidth = 1.5 }
    else                { ctx.setLineDash([]);     ctx.strokeStyle = '#2A2A3EDD';  ctx.lineWidth = 1 }
    ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([])

    const angle = Math.atan2(ey - sy, ex - sx), al = 6
    ctx.beginPath()
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex - al * Math.cos(angle - 0.42), ey - al * Math.sin(angle - 0.42))
    ctx.lineTo(ex - al * Math.cos(angle + 0.42), ey - al * Math.sin(angle + 0.42))
    ctx.closePath()
    ctx.fillStyle = isRelated ? '#E74C3C' : '#2A2A3EDD'; ctx.fill()

    if (gs > 0.85 && link.label) {
      const mx = (sx + ex) / 2, my = (sy + ey) / 2
      ctx.font = `${9 / gs}px monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillStyle = isRelated ? '#E74C3CAA' : '#6B6B88'
      ctx.fillText(link.label as string, mx, my - 8 / gs)
    }
  }, [])

  /* ── force-graph init (runs once, browser only) ──────────────── */
  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    let ro: ResizeObserver | null = null

    import('force-graph').then(mod => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        .onNodeClick((node: any) => onNodeClickRef.current(node as GraphNode))
        .onNodeHover((node: any) => onNodeHoverRef.current(node ? (node as GraphNode) : null))
        .onNodeDragEnd((node: any) => { node.fx = node.x; node.fy = node.y })
        .onBackgroundClick(() => onBackgroundRef.current())
        .cooldownTicks(100)
        .d3AlphaDecay(0.02)
        .d3VelocityDecay(0.3)
        .graphData({ nodes: [], links: [] })

      fgRef.current = fg
      onReadyRef.current(fg)

      ro = new ResizeObserver(() => {
        if (fg && container) fg.width(container.offsetWidth).height(container.offsetHeight)
      })
      ro.observe(container)
    }).catch(err => {
      // eslint-disable-next-line no-console
      console.error('[GraphCanvas] force-graph load error:', err)
    })

    return () => {
      ro?.disconnect()
      if (container) container.innerHTML = ''
      fgRef.current = null
    }
  }, [drawNode, drawPointerArea, drawLink]) // canvas fns are stable (useCallback [])

  /* ── sync data whenever nodes/links change ───────────────────── */
  useEffect(() => {
    if (fgRef.current) fgRef.current.graphData({ nodes, links })
  }, [nodes, links])

  return <div ref={containerRef} className="w-full h-full" />
}
