'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Shield, LayoutGrid, TrendingDown, Brain, Search, Network } from 'lucide-react'
import ExecutionBrain from './ExecutionBrain'
import ERPFinance from './ERPFinance'
import CRMSales from './CRMSales'
import CrossStageCopilot from './CrossStageCopilot'
import CaseCockpit from './CaseCockpit'
import SpecPanel from './SpecPanel'
import type { DensityNode } from '@/lib/ontology'
import type { DatasetStats } from '@/lib/ontology/dataset'

// left-rail cross-product nav
const RAIL = [
  { href: '/', label: 'Hub', icon: Home },
  { href: '/govern', label: 'Govern', icon: Shield },
  { href: '/command', label: 'Build', icon: LayoutGrid },
  { href: '/lend', label: 'Lend', icon: TrendingDown },
  { href: '/connect', label: 'Connect', icon: Brain },
  { href: '/verify', label: 'Verify', icon: Search },
]

type Screen = 'brain' | 'erp' | 'crm' | 'copilot' | 'cockpit'
type Skin = 'A' | 'B'

interface Props { total: number; stats: DatasetStats; density: DensityNode[] }

export default function IntelligenceClient({ total, stats, density }: Props) {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" title="Back to hub" style={{ display: 'flex', alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vantislockuponnight.png" alt="Vantis" style={{ height: 22, width: 'auto', display: 'block' }} />
          </Link>
          <div style={{ width: 1, height: 16, background: 'rgba(120,160,180,0.22)' }} />
          <div style={{ fontFamily: 'var(--font-jet), monospace', fontSize: 10, letterSpacing: '0.24em', color: '#5fd6f0', textTransform: 'uppercase', textShadow: '0 0 14px rgba(63,224,255,0.5)' }}>Intelligence Layer</div>
        </div>
        <div style={{ marginLeft: 8, display: 'flex', gap: 3, padding: 3, borderRadius: 11, background: 'rgba(8,14,22,0.6)', border: '1px solid rgba(90,150,175,0.14)' }}>
          {navBtn('brain', 'Execution Brain')}
          {navBtn('erp', 'ERP · Finance')}
          {navBtn('crm', 'CRM · Sales')}
          {navBtn('cockpit', 'Case Cockpit')}
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
          <Link href="/" title="Back to hub" style={{ cursor: 'pointer', border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.08)', color: '#e8d5a3', fontFamily: 'var(--font-jet), monospace', fontSize: 10, letterSpacing: '0.1em', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}>← HUB</Link>
          <button onClick={() => setSpec(true)} style={{ cursor: 'pointer', border: '1px solid rgba(90,150,175,0.2)', background: 'rgba(12,20,30,0.5)', color: '#b8f4ff', fontFamily: 'var(--font-jet), monospace', fontSize: 10, letterSpacing: '0.1em', padding: '6px 12px', borderRadius: 8 }}>SPEC ↗</button>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ width: 56, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '16px 0', borderRight: '1px solid rgba(90,150,175,0.1)', background: 'rgba(7,11,18,0.5)' }}>
          <div title="Intelligence Layer" style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(63,224,255,0.1)', border: '1px solid rgba(63,224,255,0.32)', boxShadow: '0 0 18px -4px rgba(63,224,255,0.5)' }}>
            <Network size={17} color="#5fd6f0" />
          </div>
          <div style={{ width: 20, height: 1, background: 'rgba(90,150,175,0.15)', margin: '5px 0' }} />
          {RAIL.map(item => (
            <Link key={item.href} href={item.href} title={item.label}
              style={{ width: 34, height: 34, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5e7280', textDecoration: 'none', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9fb2be'; e.currentTarget.style.background = 'rgba(90,150,175,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#5e7280'; e.currentTarget.style.background = 'transparent' }}>
              <item.icon size={16} />
            </Link>
          ))}
        </div>

        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          {screen === 'brain' && <ExecutionBrain skin={skin} density={density} total={total} stats={stats} />}
          {screen === 'erp' && <ERPFinance skin={skin} density={density} />}
          {screen === 'crm' && <CRMSales skin={skin} density={density} />}
          {screen === 'cockpit' && <CaseCockpit />}
          {screen === 'copilot' && <CrossStageCopilot skin={skin} density={density} />}
        </div>
      </div>

      {spec && <SpecPanel onClose={() => setSpec(false)} />}
    </div>
  )
}
