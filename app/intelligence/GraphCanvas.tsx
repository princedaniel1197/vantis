'use client'

import { useEffect, useRef } from 'react'
import { GRAPH_NODES, GRAPH_EDGES, TYPE_COLOR, HERO_INTENSITY, HERO_GAP, type DensityNode } from '@/lib/ontology'

type Skin = 'A' | 'B'
type Mode = 'brain' | 'copilot'

interface Props {
  mode: Mode
  skin: Skin
  /** copilot: node ids to spotlight; the rest ghost. undefined = default Ozone subgraph */
  focusIds?: string[]
  /** brain: id of the node whose neighbourhood to highlight (card hover) */
  externalFocusId?: string | null
  /** 0..1 emphasis ramp for copilot subgraph */
  copilotProgress?: number
  /** dim density field sampled from the full dataset (behind the hero subgraph) */
  density?: DensityNode[]
}

const hexA = (c: string, a: number) => {
  const n = parseInt(c.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5)

export default function GraphCanvas({ mode, skin, focusIds, externalFocusId, copilotProgress = 0, density }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  // live prop mirror so the rAF loop always reads current values
  const props = useRef({ mode, skin, focusIds, externalFocusId, copilotProgress, density })
  props.current = { mode, skin, focusIds, externalFocusId, copilotProgress, density }
  const hoverRef = useRef<string | null>(null)
  const t0Ref = useRef<number | null>(null)
  const posRef = useRef<Record<string, { x: number; y: number }>>({})
  const densPosRef = useRef<Array<{ id: string; x: number; y: number; label: string; meta: string }>>([])

  useEffect(() => {
    const canvas = canvasRef.current!
    const tip = tipRef.current!
    let raf = 0
    const delays: Record<string, number> = {}
    GRAPH_NODES.forEach((n, i) => { delays[n.id] = (i % 9) * 0.05 })

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      const mx = e.clientX - r.left, my = e.clientY - r.top
      let tt = '', tl = '', tm = '', hx = 0, hy = 0, found: string | null = null
      for (const n of GRAPH_NODES) {
        const p = posRef.current[n.id]; if (!p) continue
        const dx = mx - p.x, dy = my - p.y
        if (dx * dx + dy * dy < (n.r + 9) * (n.r + 9)) { found = n.id; tt = n.type.toUpperCase(); tl = n.label; tm = n.meta; hx = p.x; hy = p.y; break }
      }
      if (!found) {
        for (const d of densPosRef.current) {
          const dx = mx - d.x, dy = my - d.y
          if (dx * dx + dy * dy < 25) { found = d.id; tt = 'PROJECT · K-RERA'; tl = d.label; tm = d.meta; hx = d.x; hy = d.y; break }
        }
      }
      hoverRef.current = found
      if (found) {
        tip.style.display = 'block'
        tip.style.left = hx + 'px'; tip.style.top = hy + 'px'
        ;(tip.querySelector('[data-tt]') as HTMLElement).textContent = tt
        ;(tip.querySelector('[data-tl]') as HTMLElement).textContent = tl
        ;(tip.querySelector('[data-tm]') as HTMLElement).textContent = tm
        canvas.style.cursor = 'pointer'
      } else { tip.style.display = 'none'; canvas.style.cursor = 'default' }
    }
    const onLeave = () => { hoverRef.current = null; tip.style.display = 'none' }
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    const loop = (now: number) => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width, h = rect.height
      if (w < 2 || h < 2) { raf = requestAnimationFrame(loop); return }
      if (t0Ref.current == null) t0Ref.current = now
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      }
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2, cy = h / 2
      const settle = Math.min(1, (now - (t0Ref.current || now)) / 1600)
      const sp = easeOutQuint(settle)
      // fixed target positions (fractional → px), settling out from centre
      const pos = posRef.current
      for (const n of GRAPH_NODES) {
        const tx = n.x * w, ty = n.y * h
        pos[n.id] = { x: cx + (tx - cx) * sp, y: cy + (ty - cy) * sp }
      }

      const { mode, skin, focusIds, externalFocusId, copilotProgress } = props.current
      const copilot = mode === 'copilot'
      const spotlight = copilot ? new Set(focusIds && focusIds.length ? focusIds : GRAPH_NODES.filter(n => n.focus).map(n => n.id)) : null

      // hover / card-focus neighbourhood
      const focusId = hoverRef.current || externalFocusId
      let hi: Set<string> | null = null
      if (focusId) {
        hi = new Set([focusId])
        for (const e of GRAPH_EDGES) {
          if (e.from === focusId) hi.add(e.to)
          if (e.to === focusId) hi.add(e.from)
        }
      }

      // depth glow
      ctx.save(); ctx.globalAlpha = 0.5
      const gx = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(w, h) * 0.7)
      gx.addColorStop(0, 'rgba(20,40,58,0.35)'); gx.addColorStop(1, 'rgba(5,6,11,0)')
      ctx.fillStyle = gx; ctx.fillRect(0, 0, w, h); ctx.restore()

      // ── density field (dim, cheap dots sampled from the full 8,771 dataset) ──
      const dens = props.current.density
      if (dens && dens.length) {
        const arr = densPosRef.current; arr.length = 0
        const dAlpha = (copilot ? 0.07 : 0.16) * sp
        ctx.save()
        for (let k = 0; k < dens.length; k++) {
          const d = dens[k]
          const tx = d.x * w, ty = d.y * h
          const px = cx + (tx - cx) * sp, py = cy + (ty - cy) * sp
          arr.push({ id: d.id, x: px, y: py, label: d.label, meta: d.meta })
          const hovered = hoverRef.current === d.id
          ctx.globalAlpha = hovered ? 0.85 : dAlpha
          ctx.fillStyle = hovered ? '#3fe0ff' : 'rgba(120,180,205,1)'
          ctx.beginPath(); ctx.arc(px, py, hovered ? 3.4 : 2.6, 0, Math.PI * 2); ctx.fill()
        }
        ctx.restore()
      }

      // ── edges ──
      for (const e of GRAPH_EDGES) {
        const a = pos[e.from], b = pos[e.to]; if (!a || !b) continue
        const appear = Math.max(0, Math.min(1, (sp - (delays[e.from] + delays[e.to]) * 0.4) / 0.5))
        if (appear <= 0) continue
        const mx = a.x + (b.x - a.x) * appear, my = a.y + (b.y - a.y) * appear
        let baseAlpha = 0.22
        if (hi) baseAlpha = (hi.has(e.from) && hi.has(e.to)) ? 0.5 : 0.05
        if (copilot) baseAlpha = (spotlight!.has(e.from) && spotlight!.has(e.to)) ? Math.min(0.55, 0.15 + copilotProgress * 0.5) : 0.04

        if (e.hero) { drawHero(ctx, a, b, appear, now, copilot ? Math.min(1, 0.4 + copilotProgress) : HERO_INTENSITY); continue }
        let color = 'rgba(120,180,205,'
        if (e.minihero) { color = 'rgba(240,162,74,'; baseAlpha = Math.max(baseAlpha, 0.4) }

        if (skin === 'B') {
          ctx.strokeStyle = color + baseAlpha + ')'; ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke()
          if (appear > 0.9 && (!hi || (hi.has(e.from) && hi.has(e.to)))) {
            ctx.fillStyle = 'rgba(140,175,195,' + (baseAlpha + 0.15) + ')'
            ctx.font = '8px var(--font-jet), monospace'; ctx.textAlign = 'center'
            ctx.fillText(e.label, (a.x + b.x) / 2, (a.y + b.y) / 2 - 3)
          }
        } else {
          ctx.save(); ctx.strokeStyle = color + baseAlpha + ')'; ctx.lineWidth = 1.1
          ctx.shadowColor = 'rgba(63,224,255,0.4)'; ctx.shadowBlur = hi && hi.has(e.from) && hi.has(e.to) ? 6 : 0
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mx, my); ctx.stroke(); ctx.restore()
        }
      }

      // ── nodes ──
      for (const n of GRAPH_NODES) {
        const p = pos[n.id]; if (!p) continue
        const app = Math.max(0, Math.min(1, (sp - delays[n.id] * 0.5) / 0.5))
        if (app <= 0) continue
        const dim = hi ? (hi.has(n.id) ? 1 : 0.18) : 1
        const ghosted = copilot && !spotlight!.has(n.id)
        const vis = copilot ? (spotlight!.has(n.id) ? Math.min(1, 0.3 + copilotProgress) : 1) : 1
        const alpha = app * dim * (ghosted ? 0.16 : 1)
        const r = n.r * (0.5 + app * 0.5)
        const col = TYPE_COLOR[n.type]

        ctx.save(); ctx.globalAlpha = alpha
        if (skin === 'A') {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.4)
          glow.addColorStop(0, hexA(col, 0.55 * vis)); glow.addColorStop(0.4, hexA(col, 0.16 * vis)); glow.addColorStop(1, hexA(col, 0))
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3.4, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = hexA(col, 0.9); ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.62, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = `rgba(255,255,255,${0.85 * vis})`; ctx.beginPath(); ctx.arc(p.x - r * 0.12, p.y - r * 0.12, r * 0.24, 0, Math.PI * 2); ctx.fill()
          if (n.hub) { ctx.strokeStyle = hexA(col, 0.5); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.5, 0, Math.PI * 2); ctx.stroke() }
        } else {
          ctx.strokeStyle = hexA(col, 0.85 * vis); ctx.lineWidth = 1.4
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke()
          ctx.fillStyle = hexA(col, 0.14 * vis); ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = hexA(col, 0.95 * vis); ctx.beginPath(); ctx.arc(p.x, p.y, r * 0.32, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = hexA(col, 0.5 * vis); ctx.lineWidth = 1
          const tk = r + 4
          ;[[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(d => { ctx.beginPath(); ctx.moveTo(p.x + d[0] * r, p.y + d[1] * r); ctx.lineTo(p.x + d[0] * tk, p.y + d[1] * tk); ctx.stroke() })
          if (n.hub) { ctx.strokeStyle = hexA(col, 0.4 * vis); ctx.beginPath(); ctx.arc(p.x, p.y, r + 6, 0, Math.PI * 2); ctx.stroke() }
        }
        if (n.risk && !ghosted) {
          const pr = r + 6 + Math.sin(now / 400) * 3
          ctx.strokeStyle = hexA('#ff5a4d', 0.5 + Math.sin(now / 400) * 0.3)
          ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2); ctx.stroke()
        }
        ctx.restore()

        // labels
        const showLabel = app > 0.85 && (!hi || hi.has(n.id)) && (skin === 'B' ? true : (n.hub || n.type === 'Project' || n.hero || (hi && hi.has(n.id))))
        if (showLabel && alpha > 0.3) {
          ctx.save(); ctx.globalAlpha = Math.min(1, alpha)
          ctx.font = (n.hub || n.type === 'Project') ? '600 10.5px var(--font-space), sans-serif' : '9px var(--font-jet), monospace'
          ctx.textAlign = 'center'
          ctx.fillStyle = n.hub ? '#e8d5a3' : (n.type === 'Project' ? '#dbeef4' : '#a8bcc6')
          const ly = p.y + r + (skin === 'B' ? 15 : 13)
          if (skin === 'B') {
            const tw = ctx.measureText(n.label).width
            ctx.fillStyle = 'rgba(120,175,200,0.55)'; ctx.font = '9px var(--font-jet), monospace'
            ctx.fillText('[', p.x - tw / 2 - 6, ly); ctx.fillText(']', p.x + tw / 2 + 6, ly)
            ctx.fillStyle = n.hub ? '#e8d5a3' : '#b8ccd6'
          }
          ctx.fillText(n.label, p.x, ly); ctx.restore()
        }
      }
      raf = requestAnimationFrame(loop)
    }

    function drawHero(ctx: CanvasRenderingContext2D, a: { x: number; y: number }, b: { x: number; y: number }, appear: number, now: number, intensity: number) {
      const ex = a.x + (b.x - a.x) * appear, ey = a.y + (b.y - a.y) * appear
      ctx.save()
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y)
      grad.addColorStop(0, hexA('#8fb3ff', 0.9 * intensity)); grad.addColorStop(0.5, hexA('#ff5a4d', intensity)); grad.addColorStop(1, hexA('#45e0c0', 0.9 * intensity))
      ctx.strokeStyle = grad; ctx.lineWidth = 3.2
      ctx.shadowColor = 'rgba(255,90,77,0.8)'; ctx.shadowBlur = 16 * intensity
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(ex, ey); ctx.stroke()
      if (appear >= 0.99) {
        const tt = (now % 2000) / 2000
        const px = a.x + (b.x - a.x) * tt, py = a.y + (b.y - a.y) * tt
        const g2 = ctx.createRadialGradient(px, py, 0, px, py, 9)
        g2.addColorStop(0, hexA('#ffffff', intensity)); g2.addColorStop(0.5, hexA('#ff5a4d', 0.8 * intensity)); g2.addColorStop(1, hexA('#ff5a4d', 0))
        ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0; ctx.font = '700 9px var(--font-jet), monospace'; ctx.textAlign = 'center'
        ctx.fillStyle = hexA('#ff8f84', intensity)
        ctx.fillText('GAP −' + HERO_GAP, (a.x + b.x) / 2, (a.y + b.y) / 2 - 8)
      }
      ctx.restore()
    }

    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave) }
  }, [])

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div ref={tipRef} style={{ position: 'absolute', display: 'none', pointerEvents: 'none', padding: '8px 11px', borderRadius: 9, background: 'rgba(10,16,24,0.92)', border: '1px solid rgba(63,224,255,0.3)', backdropFilter: 'blur(8px)', boxShadow: '0 12px 40px -12px rgba(0,0,0,0.8)', zIndex: 5, transform: 'translate(-50%,-130%)' }}>
        <div data-tt style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.14em', color: '#5fd6f0' }} />
        <div data-tl style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 12.5, color: '#eaf2f6', marginTop: 2 }} />
        <div data-tm style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, color: '#94a6b0', marginTop: 2 }} />
      </div>
    </div>
  )
}
