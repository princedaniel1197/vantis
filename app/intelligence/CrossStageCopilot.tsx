'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import GraphCanvas from './GraphCanvas'
import { SCENARIOS, conversationalAnswer, strongMatch, UNKNOWN_ANSWER, type CopilotAnswer, type DensityNode } from '@/lib/ontology'

const STAGE_CHIPS = ['QPR FILING', 'SITE VERIFICATION', 'ESCROW', 'LITIGATION', 'ENCUMBRANCE']
const CHIP_COLOR = ['#8fb3ff', '#45e0c0', '#6ea0ff', '#ff5a4d', '#e8b24c']
const TIER_COLOR = { AT_RISK: '#ff7a6d', WATCH: '#f0a24a', HEALTHY: '#45e0c0' } as const

interface Segment { kind: 'para' | 'verdict' | 'contrast' | 'citations'; a: CopilotAnswer; i?: number }

function segmentsOf(a: CopilotAnswer): Segment[] {
  const segs: Segment[] = a.paras.map((_, i) => ({ kind: 'para' as const, a, i }))
  if (a.verdict) segs.push({ kind: 'verdict', a })
  if (a.contrast) segs.push({ kind: 'contrast', a })
  if (a.citations.length) segs.push({ kind: 'citations', a })
  return segs
}

export default function CrossStageCopilot({ skin, density, onProgress }: { skin: 'A' | 'B'; density?: DensityNode[]; onProgress?: (p: number) => void }) {
  const [input, setInput] = useState(SCENARIOS[0].query)
  const [answer, setAnswer] = useState<CopilotAnswer>(SCENARIOS[0].answer)
  const [userQuery, setUserQuery] = useState(SCENARIOS[0].query)
  const [lit, setLit] = useState<Set<number>>(new Set())
  const [revealed, setRevealed] = useState(0)
  const [progress, setProgress] = useState(0)
  const [live, setLive] = useState(true)      // AI grounded by default; toggle → offline demo
  const [thinking, setThinking] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const bump = (p: number) => { setProgress(p); onProgress?.(p) }

  function assemble(a: CopilotAnswer) {
    timers.current.forEach(clearTimeout); timers.current = []
    setLit(new Set()); setRevealed(0); bump(0)
    const chipIdx = STAGE_CHIPS.map((c, i) => (a.chips.includes(c) ? i : -1)).filter(i => i >= 0)
    chipIdx.forEach((idx, k) => {
      timers.current.push(setTimeout(() => {
        setLit(prev => new Set(prev).add(idx))
        bump(Math.min(0.5, (k + 1) / chipIdx.length * 0.5))
      }, 220 * k + 200))
    })
    const segs = segmentsOf(a)
    const start = 220 * chipIdx.length + 500
    segs.forEach((_, i) => {
      timers.current.push(setTimeout(() => {
        setRevealed(i + 1)
        bump(Math.min(1, 0.5 + (i + 1) / segs.length * 0.5))
      }, start + 260 * i))
    })
  }

  function show(a: CopilotAnswer) { setThinking(false); setAnswer(a); assemble(a) }

  async function run(q: string) {
    const trimmed = q.trim(); if (!trimmed) return
    setUserQuery(trimmed)

    // Instant, deterministic, no-network: greetings/meta then strong seeded prompts.
    const convo = conversationalAnswer(trimmed)
    if (convo) return show(convo)
    const strong = strongMatch(trimmed)
    if (strong) return show(strong.answer)

    // Free-form. Offline demo mode → graceful "not in data". AI mode → grounded LLM.
    if (!live) return show(UNKNOWN_ANSWER)

    timers.current.forEach(clearTimeout); timers.current = []
    setLit(new Set()); setRevealed(0); bump(0); setThinking(true)
    try {
      const res = await fetch('/api/copilot/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: trimmed }) })
      if (res.ok) {
        const data = await res.json()
        if (data && Array.isArray(data.paras)) return show(data)
      }
    } catch { /* network failure → graceful */ }
    show(UNKNOWN_ANSWER)
  }

  useEffect(() => { assemble(SCENARIOS[0].answer); return () => timers.current.forEach(clearTimeout) }, [])

  const segs = segmentsOf(answer)

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {/* conversation column */}
        <div style={{ width: 560, flex: 'none', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(90,150,175,0.1)', background: 'linear-gradient(180deg, rgba(9,14,22,0.5), rgba(6,9,15,0.2))' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(90,150,175,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.22em', color: '#5fd6f0', textShadow: '0 0 14px rgba(63,224,255,0.5)' }}>CROSS-STAGE COPILOT</div>
              <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 19, marginTop: 6 }}>Reasoning across the ontology</div>
            </div>
            <button onClick={() => setLive(v => !v)} title={live ? 'Grounded AI — answers any question from the ontology' : 'Offline demo — seeded prompts only'}
              style={{ cursor: 'pointer', border: `1px solid ${live ? 'rgba(63,224,255,0.4)' : 'rgba(90,150,175,0.2)'}`, background: live ? 'rgba(63,224,255,0.1)' : 'transparent', color: live ? '#b8f4ff' : '#7f97a4', fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.12em', padding: '5px 9px', borderRadius: 7 }}>
              {live ? 'AI · GROUNDED' : 'DEMO'}
            </button>
          </div>

          <div className="vg-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
            {/* user query */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
              <div style={{ maxWidth: '82%', padding: '12px 16px', borderRadius: '14px 14px 4px 14px', background: 'rgba(63,224,255,0.09)', border: '1px solid rgba(63,224,255,0.24)', fontSize: 14, lineHeight: 1.5, color: '#dbeef4' }}>{userQuery}</div>
            </div>

            {/* reasoning stage rail */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.16em', color: '#5e7280', marginBottom: 9 }}>REASONING ACROSS STAGES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {STAGE_CHIPS.map((c, i) => {
                  const on = lit.has(i)
                  return (
                    <span key={c} style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9.5, letterSpacing: '0.06em', color: on ? CHIP_COLOR[i] : '#5e7280', padding: '5px 10px', borderRadius: 20, background: on ? 'rgba(63,224,255,0.05)' : 'rgba(90,150,175,0.06)', border: `1px solid ${on ? CHIP_COLOR[i] : 'rgba(90,150,175,0.16)'}`, boxShadow: on ? `0 0 14px -4px ${CHIP_COLOR[i]}` : 'none', transition: 'all .25s ease' }}>{c}</span>
                  )
                })}
              </div>
            </div>

            {/* answer */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 'none', width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, rgba(63,224,255,0.2), rgba(63,224,255,0.06))', border: '1px solid rgba(63,224,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px -4px rgba(63,224,255,0.5)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5fd6f0', boxShadow: '0 0 8px rgba(63,224,255,0.9)' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {thinking && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-jet), monospace', fontSize: 11, letterSpacing: '0.06em', color: '#5fd6f0' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#5fd6f0', boxShadow: '0 0 10px 1px rgba(63,224,255,0.8)', animation: 'vg-dot 1.1s ease-in-out infinite' }} />
                    reasoning over the ontology…
                  </div>
                )}
                {segs.map((seg, i) => {
                  const shown = i < revealed
                  const base: CSSProperties = { opacity: shown ? 1 : 0, transform: shown ? 'translateY(0)' : 'translateY(9px)', transition: 'opacity .5s ease, transform .5s ease' }
                  if (seg.kind === 'para') {
                    const isFirst = seg.i === 0
                    return <div key={i} style={{ ...base, fontSize: 14, lineHeight: 1.62, color: isFirst ? '#dbeef4' : '#c4d4dc', marginTop: isFirst ? 0 : 12, opacity: shown ? (isFirst ? 1 : 0.95) : 0 }} dangerouslySetInnerHTML={{ __html: answer.paras[seg.i!] }} />
                  }
                  if (seg.kind === 'verdict' && answer.verdict) {
                    const v = answer.verdict, tc = TIER_COLOR[v.tier]
                    return (
                      <div key={i} style={{ ...base, marginTop: 16, padding: 15, borderRadius: 13, background: 'linear-gradient(180deg, rgba(30,14,14,0.5), rgba(16,10,12,0.3))', border: `1px solid ${tc}66`, boxShadow: `0 0 46px -14px ${tc}80` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.14em', color: '#ff8f84' }}>{v.eyebrow}</div>
                            <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 15, marginTop: 5 }}>{v.title}</div>
                            <div style={{ fontSize: 12.5, color: '#94a6b0', marginTop: 3, lineHeight: 1.4 }}>{v.sub}</div>
                          </div>
                          <div style={{ textAlign: 'center', flex: 'none', paddingLeft: 14 }}>
                            <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 700, fontSize: 34, lineHeight: 0.9, color: tc, textShadow: `0 0 20px ${tc}80` }}>{v.score}</div>
                            <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.1em', color: '#94a6b0' }}>EXECUTION</div>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  if (seg.kind === 'contrast' && answer.contrast) {
                    return <div key={i} style={{ ...base, fontSize: 13, lineHeight: 1.55, color: '#94a6b0', marginTop: 14, opacity: shown ? 0.95 : 0 }} dangerouslySetInnerHTML={{ __html: answer.contrast }} />
                  }
                  if (seg.kind === 'citations') {
                    return (
                      <div key={i} style={{ ...base, marginTop: 16 }}>
                        <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.16em', color: '#5e7280', marginBottom: 8 }}>CITED OBJECTS · VERIFIED</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                          {answer.citations.map(c => (
                            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-jet), monospace', fontSize: 9, color: '#c8d6de', padding: '5px 9px', borderRadius: 7, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.28)' }}><span style={{ color: '#e8d5a3' }}>✦</span> {c}</span>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            {/* suggested queries */}
            <div style={{ marginTop: 22 }}>
              <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8.5, letterSpacing: '0.16em', color: '#5e7280', marginBottom: 9 }}>TRY A CROSS-LIFECYCLE QUERY</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {SCENARIOS.map(s => (
                  <button key={s.id} onClick={() => { setInput(s.query); run(s.query) }}
                    style={{ cursor: 'pointer', fontFamily: 'var(--font-dmsans), sans-serif', fontSize: 12, color: '#9fb2be', padding: '6px 11px', borderRadius: 9, background: 'rgba(10,16,24,0.6)', border: '1px solid rgba(90,150,175,0.16)', textAlign: 'left' }}>{s.query}</button>
                ))}
              </div>
            </div>
          </div>

          {/* input */}
          <div style={{ padding: '16px 24px 20px', borderTop: '1px solid rgba(90,150,175,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 13, background: 'rgba(10,16,24,0.7)', border: '1px solid rgba(63,224,255,0.22)', boxShadow: '0 0 30px -14px rgba(63,224,255,0.4)' }}>
              <span style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 14, color: '#5fd6f0' }}>›</span>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') run(input) }}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#dbeef4', fontFamily: 'var(--font-dmsans), sans-serif', fontSize: 13.5 }} />
              <button onClick={() => run(input)} style={{ cursor: 'pointer', border: 'none', borderRadius: 9, padding: '7px 14px', background: 'linear-gradient(135deg,#3fe0ff,#2ba8c4)', color: '#04121a', fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 12, boxShadow: '0 0 18px -4px rgba(63,224,255,0.6)' }}>Ask ↵</button>
            </div>
            <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 8, letterSpacing: '0.1em', color: '#5e7280', marginTop: 9, textAlign: 'center' }}>GROUNDED IN THE VANTIS ONTOLOGY · NO DATA INVENTED {live ? '· AI' : '· DEMO'}</div>
          </div>
        </div>

        {/* graph theatre */}
        <div style={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <GraphCanvas mode="copilot" skin={skin} focusIds={answer.focusIds} copilotProgress={progress} density={density} />
          <div style={{ position: 'absolute', top: 20, left: 22, pointerEvents: 'none' }}>
            <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.24em', color: '#5fd6f0', textShadow: '0 0 14px rgba(63,224,255,0.5)' }}>OZONE URBANA · SUBGRAPH</div>
            <div style={{ fontFamily: 'var(--font-cormorant), serif', fontStyle: 'italic', fontSize: 20, color: '#c8d6de', marginTop: 4, opacity: 0.8 }}>every claim, traced to its object</div>
          </div>
        </div>
      </div>
    </div>
  )
}
