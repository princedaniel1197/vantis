'use client'

import { useState } from 'react'
import ExecutionBrain from './ExecutionBrain'
import CrossStageCopilot from './CrossStageCopilot'
import SpecPanel from './SpecPanel'

type Screen = 'brain' | 'copilot'
type Skin = 'A' | 'B'

export default function IntelligenceClient() {
  const [screen, setScreen] = useState<Screen>('brain')
  const [skin, setSkin] = useState<Skin>('A')
  const [spec, setSpec] = useState(false)

  const navBtn = (s: Screen, label: string) => {
    const on = screen === s
    return (
      <button onClick={() => setScreen(s)} style={{ cursor: 'pointer', border: 'none', background: on ? 'rgba(63,224,255,0.12)' : 'transparent', color: on ? '#b8f4ff' : '#9fb2be', fontFamily: 'var(--font-space), sans-serif', fontWeight: 500, fontSize: 12.5, padding: '6px 14px', borderRadius: 8, boxShadow: on ? '0 0 18px -6px rgba(63,224,255,0.6)' : 'none' }}>{label}</button>
    )
  }
  const skinBtn = (s: Skin, label: string) => {
    const on = skin === s
    return (
      <button onClick={() => setSkin(s)} style={{ cursor: 'pointer', border: 'none', background: on ? 'rgba(63,224,255,0.14)' : 'transparent', color: on ? '#b8f4ff' : '#9fb2be', fontFamily: 'var(--font-jet), monospace', fontSize: 10, letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 7 }}>{label}</button>
    )
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* top bar */}
      <div style={{ height: 58, flex: 'none', display: 'flex', alignItems: 'center', gap: 20, padding: '0 20px', borderBottom: '1px solid rgba(90,150,175,0.12)', background: 'linear-gradient(180deg, rgba(10,16,24,0.72), rgba(8,11,18,0.4))', backdropFilter: 'blur(14px)', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: 'linear-gradient(135deg,#e8d5a3,#c9a84c)', boxShadow: '0 0 16px -2px rgba(201,168,76,0.6)' }} />
          <div style={{ fontFamily: 'var(--font-space), sans-serif', fontWeight: 600, fontSize: 14, letterSpacing: '0.02em' }}>Vantis</div>
          <div style={{ width: 1, height: 16, background: 'rgba(120,160,180,0.22)' }} />
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 10, letterSpacing: '0.24em', color: '#5fd6f0', textTransform: 'uppercase', textShadow: '0 0 14px rgba(63,224,255,0.5)' }}>Intelligence Layer</div>
        </div>
        <div style={{ marginLeft: 8, display: 'flex', gap: 3, padding: 3, borderRadius: 11, background: 'rgba(8,14,22,0.6)', border: '1px solid rgba(90,150,175,0.14)' }}>
          {navBtn('brain', 'Execution Brain')}
          {navBtn('copilot', 'Cross-Stage Copilot')}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9, letterSpacing: '0.16em', color: '#5e7280' }}>GRAPH</span>
            <div style={{ display: 'flex', gap: 2, padding: 2, borderRadius: 9, background: 'rgba(8,14,22,0.6)', border: '1px solid rgba(90,150,175,0.14)' }}>
              {skinBtn('A', 'A · ORBS')}
              {skinBtn('B', 'B · INSTRUMENT')}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#45e0c0', boxShadow: '0 0 10px 1px rgba(69,224,192,0.8)', animation: 'vg-dot 2.4s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 9.5, letterSpacing: '0.14em', color: '#7f97a4' }}>GRAPH LIVE</span>
          </div>
          <button onClick={() => setSpec(true)} style={{ cursor: 'pointer', border: '1px solid rgba(90,150,175,0.2)', background: 'rgba(12,20,30,0.5)', color: '#b8f4ff', fontFamily: 'var(--font-jet), monospace', fontSize: 10, letterSpacing: '0.1em', padding: '6px 12px', borderRadius: 8 }}>SPEC ↗</button>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ width: 56, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '16px 0', borderRight: '1px solid rgba(90,150,175,0.1)', background: 'rgba(7,11,18,0.5)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(63,224,255,0.1)', border: '1px solid rgba(63,224,255,0.32)', boxShadow: '0 0 18px -4px rgba(63,224,255,0.5)' }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="2.4" fill="#5fd6f0" /><circle cx="9" cy="9" r="6.2" fill="none" stroke="#3fe0ff" strokeWidth="1" opacity="0.55" /></svg>
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="none" stroke="#5e7280" strokeWidth="1.1" /></svg>
            </div>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          {screen === 'brain' ? <ExecutionBrain skin={skin} /> : <CrossStageCopilot skin={skin} />}
        </div>
      </div>

      {spec && <SpecPanel onClose={() => setSpec(false)} />}
    </div>
  )
}
