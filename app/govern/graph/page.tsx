'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, X, Network, RotateCcw, Play, ZoomIn, ZoomOut } from 'lucide-react'
import type { GraphNode, GraphLink } from './GraphCanvas'

/* ── Dynamic import — ssr:false prevents force-graph's window.innerWidth
      from running on the server (it's called at module-level in the bundle). ── */
const GraphCanvas = dynamic(() => import('./GraphCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0A0A0F]">
      <span className="font-mono text-[10px] text-gray tracking-wider">
        Initialising investigation canvas…
      </span>
    </div>
  ),
})

/* ── Types ───────────────────────────────────────────────────────────────── */
type NodeType = 'developer' | 'project' | 'person' | 'asset' | 'litigation' | 'rrc'
type LinkType =
  | 'owns' | 'controls' | 'spouse-of' | 'subject-of'
  | 'holds' | 'directed-by' | 'related-party'

interface CanvasNode extends GraphNode {
  type: NodeType
  data: Record<string, string | number | null>
  anomaly?: boolean
}

interface CanvasLink extends GraphLink {
  type: LinkType
}

/* ── Entity database ─────────────────────────────────────────────────────── */
const DB: Record<string, CanvasNode> = {
  'ozone-group': {
    id: 'ozone-group', label: 'Ozone Group', type: 'developer', anomaly: true,
    data: {
      Status: 'HIGH RISK', 'Trust Score': '9 / 100', City: 'Bengaluru',
      'Active Projects': 4, 'Homebuyers Affected': 1847,
      'Capital at Risk': '₹927 Cr', 'FIR Filed': 'Q3 2023',
    },
  },
  'ozone-urbana': {
    id: 'ozone-urbana', label: 'Ozone Urbana', type: 'project',
    data: {
      RERA: 'PRM/KA/RERA/1251/309/PR/170517/004521',
      Status: 'HIGH RISK', 'Risk Score': '9 / 100',
      Location: 'Devanahalli, Bengaluru Urban',
      Units: '1,847 sold / 2,300 total',
      'Declared Cost': '₹485 Cr', 'Completion Date': '2021-12-31 (missed)',
      Extensions: 3,
    },
  },
  'ozone-holdings': {
    id: 'ozone-holdings', label: 'Ozone Group Holdings Pvt. Ltd.', type: 'person',
    data: {
      Type: 'Group Holding Company', Role: 'Holds commercial assets for Ozone Group',
      CIN: 'U70200KA2002PTC030182',
    },
  },
  'ozone-spe': {
    id: 'ozone-spe', label: 'Ozone Urbana Promoters Pvt. Ltd.', type: 'person', anomaly: true,
    data: {
      Type: 'Project SPE', Role: 'Project Promoter / Escrow Holder',
      'RERA Reg': 'KA/RERA/1251/2016',
      'Escrow Balance': '₹3.88 Cr', 'Escrow Status': 'CRITICAL',
    },
  },
  'ozone-promoter': {
    id: 'ozone-promoter', label: 'Ozone Group Promoter (withheld)', type: 'person', anomaly: true,
    data: {
      Role: 'Managing Director / Key Promoter',
      Status: 'Withheld pending service of notice',
      Note: 'Director of Ozone Urbana Promoters and Ozone Group Holdings.',
      '⚑ Anomaly Flag': 'Related-party land holding traced via Bhoomi cross-reference',
    },
  },
  'ozone-spouse': {
    id: 'ozone-spouse', label: "Promoter's Spouse (withheld)", type: 'person', anomaly: true,
    data: {
      Role: 'Registered holder of related-party agricultural land',
      Status: 'Withheld — Benami notice pending',
      '⚑ Key Discovery': 'Holds 179-acre Kannehalli parcel not in any prior enforcement record',
      Note: 'Land acquired Feb 2019 — during Ozone Urbana peak collection phase (FY 2018-19)',
    },
  },
  'lit-os-1124': {
    id: 'lit-os-1124', label: 'OS 1124/2022', type: 'litigation',
    data: {
      Court: 'City Civil Court, Bengaluru', Filed: '2022-03-14',
      Plaintiff: 'Homebuyers Association (42 members)',
      Cause: 'Possession delay & breach of agreement',
      'Relief Sought': '₹24.8 Cr', Severity: 'HIGH',
    },
  },
  'lit-os-2247': {
    id: 'lit-os-2247', label: 'OS 2247/2022', type: 'litigation',
    data: {
      Court: 'City Civil Court, Bengaluru', Filed: '2022-07-22',
      Plaintiff: 'Sanjay Kapoor & 18 Others',
      Cause: 'Refund with interest — RERA Sec 18',
      'Relief Sought': '₹11.2 Cr', Severity: 'HIGH',
    },
  },
  'lit-wp-1842': {
    id: 'lit-wp-1842', label: 'WP 1842/2023', type: 'litigation',
    data: {
      Court: 'Karnataka High Court', Filed: '2023-01-05',
      Plaintiff: 'Ozone Urbana Homebuyers Forum',
      Cause: 'Mandamus to K-RERA to initiate enforcement action',
      Severity: 'CRITICAL',
    },
  },
  'rrc-oz-001': {
    id: 'rrc-oz-001', label: 'RRC/K-RERA/2026/OZ-001', type: 'rrc',
    data: {
      'Amount Ordered': '₹423 Cr', 'Amount Recovered': '₹0',
      Stage: 'Stage 5 / 8 — Asset Identification (STALLED)',
      Issued: '11 April 2026',
      'HC Deadline': '06 June 2026 (20 days overdue)',
    },
  },
  'asset-devanahalli': {
    id: 'asset-devanahalli', label: 'Devanahalli Land (18.4 acres)', type: 'asset',
    data: {
      Description: 'Sy. No. 94/1-4, Devanahalli Hobli, Bengaluru Urban',
      Type: 'Agricultural / Development Land',
      Value: '₹82 Cr', Source: 'Kaveri 2.0 + Bhoomi',
      Status: 'Verified — Partial mortgage',
    },
  },
  'asset-bank': {
    id: 'asset-bank', label: 'Bank Accounts ×3', type: 'asset',
    data: {
      Description: 'RERA Escrow + Karnataka Bank + HDFC Bank',
      Type: 'Liquid / Bank Accounts',
      Value: '₹12.4 Cr', Source: 'RERA Escrow Records + RBI CERSAI',
      Attachment: 'Freezable immediately',
    },
  },
  'asset-whitefield': {
    id: 'asset-whitefield', label: 'Whitefield Office (8,400 sqft)', type: 'asset',
    data: {
      Description: 'EPIP Zone, Whitefield, Bengaluru',
      Type: 'Commercial Property',
      Value: '₹14.2 Cr', Source: 'BBMP Property Tax + Kaveri 2.0',
      Note: 'Held in Ozone Group Holdings — IBC s.66 required to pierce corporate veil',
    },
  },
  'asset-sadashiva': {
    id: 'asset-sadashiva', label: 'Sadashivanagar Villa', type: 'asset',
    data: {
      Description: 'No. 28, 4th Cross, Sadashivanagar, Bengaluru — Khata No. 841/20/SN',
      Type: 'Residential Property',
      Value: '₹6.8 Cr', Source: 'BBMP + Kaveri 2.0',
      Status: 'Clear title — straightforward RERA Sec 40 attachment',
    },
  },
  'asset-kannehalli': {
    id: 'asset-kannehalli', label: '⚑ Kannehalli Land (179 acres)', type: 'asset', anomaly: true,
    data: {
      '⚑ DISCOVERY': 'Found via Vantis Bhoomi cross-reference — not in any prior enforcement record',
      Description: 'Sy. No. 48/1–48/9, Kannehalli Village, Tumkur Taluk, Tumkur District',
      Type: 'Agricultural Land',
      Value: '₹202.6 Cr', 'Registered Holder': "Promoter's Spouse",
      Registered: 'February 2019', Source: 'Bhoomi + Kaveri 2.0',
      'Proceedings Required': 'Benami Transactions Act + PMLA proceedings',
    },
  },
  'skylark': {
    id: 'skylark', label: 'Skylark Constructions', type: 'developer',
    data: { Status: 'CAUTION', 'Trust Score': '54 / 100', City: 'Bengaluru', 'Total Projects': 7 },
  },
  'skylark-arcadia': {
    id: 'skylark-arcadia', label: 'Skylark Arcadia', type: 'project',
    data: {
      RERA: 'PRM/KA/RERA/1251/309/PR/220614/009134', Status: 'CAUTION',
      Location: 'Hennur, Bengaluru', Units: '98 / 156', 'Declared Cost': '₹62 Cr',
    },
  },
  'lit-os-3891': {
    id: 'lit-os-3891', label: 'OS 3891/2024', type: 'litigation',
    data: {
      Court: 'City Civil Court, Bengaluru', Filed: '2024-11-03',
      Plaintiff: 'Ramesh Gowda', Cause: 'Construction defect — structural cracks, Block A',
      'Relief Sought': '₹1.8 Cr', Severity: 'MEDIUM',
    },
  },
  'rrc-sky-002': {
    id: 'rrc-sky-002', label: 'RRC/K-RERA/2025/SKY-002', type: 'rrc',
    data: {
      'Amount Ordered': '₹42 Cr', 'Amount Recovered': '₹28 Cr (67%)',
      Stage: 'Stage 7/8 — Attachment & Sale', Status: 'IN_RECOVERY',
    },
  },
  'prestige': {
    id: 'prestige', label: 'Prestige Group', type: 'developer',
    data: { Status: 'COMPLIANT', 'Trust Score': '91 / 100', City: 'Bengaluru', 'Total Projects': 48 },
  },
  'prestige-lakeside': {
    id: 'prestige-lakeside', label: 'Prestige Lakeside Habitat', type: 'project',
    data: {
      RERA: 'PRM/KA/RERA/1251/309/PR/210318/007821', Status: 'COMPLIANT',
      Location: 'Whitefield, Bengaluru', Units: '312 / 480', 'Declared Cost': '₹210 Cr',
    },
  },
  'zion': {
    id: 'zion', label: 'Zion Estate Developers', type: 'developer',
    data: { Status: 'COMPLIANT', 'Trust Score': '78 / 100', City: 'Mysuru', 'Total Projects': 3 },
  },
  'divya-villas': {
    id: 'divya-villas', label: 'Divya Villas', type: 'project',
    data: {
      RERA: 'PRM/KA/RERA/1268378/PR/180924/007034', Status: 'COMPLIANT',
      Location: 'Mysuru', Units: '18 / 23', 'Declared Cost': '₹2.4 Cr',
    },
  },
  'mantri': {
    id: 'mantri', label: 'Mantri Developers', type: 'developer',
    data: { Status: 'HIGH RISK', City: 'Bengaluru', 'RRC Amount': '₹124 Cr' },
  },
  'rrc-man-001': {
    id: 'rrc-man-001', label: 'RRC/K-RERA/2026/MAN-001', type: 'rrc',
    data: {
      'Amount Ordered': '₹124 Cr', 'Amount Recovered': '₹0',
      Stage: 'Stage 4 / 8 — Forwarded to DC', 'Days Overdue': 77,
    },
  },
}

/* ── Connection graph ────────────────────────────────────────────────────── */
type Conn = { node: CanvasNode; link: { label: string; type: LinkType } }

const CONNECTIONS: Record<string, Conn[]> = {
  'ozone-group': [
    { node: DB['ozone-urbana'],   link: { label: 'owns',       type: 'owns' } },
    { node: DB['ozone-holdings'], link: { label: 'controls',   type: 'controls' } },
    { node: DB['ozone-spe'],      link: { label: 'controls',   type: 'controls' } },
    { node: DB['lit-os-1124'],    link: { label: 'subject of', type: 'subject-of' } },
    { node: DB['lit-os-2247'],    link: { label: 'subject of', type: 'subject-of' } },
    { node: DB['lit-wp-1842'],    link: { label: 'subject of', type: 'subject-of' } },
    { node: DB['rrc-oz-001'],     link: { label: 'subject of', type: 'subject-of' } },
  ],
  'ozone-spe': [
    { node: DB['asset-devanahalli'], link: { label: 'owns',        type: 'owns' } },
    { node: DB['asset-bank'],        link: { label: 'holds',       type: 'holds' } },
    { node: DB['ozone-promoter'],    link: { label: 'directed by', type: 'directed-by' } },
  ],
  'ozone-holdings': [
    { node: DB['asset-whitefield'], link: { label: 'owns', type: 'owns' } },
  ],
  'ozone-promoter': [
    { node: DB['asset-sadashiva'], link: { label: 'owns',      type: 'owns' } },
    { node: DB['ozone-spouse'],    link: { label: 'spouse of', type: 'spouse-of' } },
  ],
  'ozone-spouse': [
    { node: DB['asset-kannehalli'], link: { label: 'owns (hidden)', type: 'related-party' } },
  ],
  'skylark': [
    { node: DB['skylark-arcadia'], link: { label: 'owns',       type: 'owns' } },
    { node: DB['lit-os-3891'],     link: { label: 'subject of', type: 'subject-of' } },
    { node: DB['rrc-sky-002'],     link: { label: 'subject of', type: 'subject-of' } },
  ],
  'prestige': [{ node: DB['prestige-lakeside'], link: { label: 'owns', type: 'owns' } }],
  'zion':     [{ node: DB['divya-villas'],      link: { label: 'owns', type: 'owns' } }],
  'mantri':   [{ node: DB['rrc-man-001'],       link: { label: 'subject of', type: 'subject-of' } }],
}

const SEARCH_INDEX = Object.values(DB)

const NODE_COLORS: Record<NodeType, string> = {
  developer: '#C9A84C', project: '#3498DB', person: '#9B59B6',
  asset: '#2ECC71', litigation: '#E74C3C', rrc: '#E67E22',
}

/* ── Dossier panel ───────────────────────────────────────────────────────── */
function DossierPanel({
  node, isExpanded, onExpand, onFocus, onRemove, onClose,
}: {
  node: CanvasNode; isExpanded: boolean
  onExpand: () => void; onFocus: () => void; onRemove: () => void; onClose: () => void
}) {
  const color = NODE_COLORS[node.type]
  const hasConns = !!CONNECTIONS[node.id]

  return (
    <div className="flex flex-col w-72 shrink-0 border-l border-border bg-surface overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-sm border"
            style={{ color, borderColor: color + '55', backgroundColor: color + '15' }}>
            {node.type}
          </span>
          <button onClick={onClose} className="text-gray hover:text-off-white transition-colors">
            <X className="w-4 h-4" />
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

      <div className="p-3 border-t border-border space-y-2 shrink-0">
        {hasConns && !isExpanded && (
          <button onClick={onExpand}
            className="w-full py-2 bg-gold/15 border border-gold/40 text-gold text-xs font-mono rounded-sm hover:bg-gold/25 transition-colors">
            Expand Connections →
          </button>
        )}
        {isExpanded && (
          <div className="w-full py-2 bg-surface2 border border-border text-gray text-xs font-mono rounded-sm text-center">
            Connections loaded ✓
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={onFocus} className="flex-1 py-1.5 bg-surface2 border border-border text-gray-light text-xs font-mono rounded-sm hover:text-gold hover:border-gold/40 transition-colors">Focus</button>
          <button onClick={onRemove} className="flex-1 py-1.5 bg-surface2 border border-border text-gray-light text-xs font-mono rounded-sm hover:text-red hover:border-red/40 transition-colors">Remove</button>
        </div>
      </div>
    </div>
  )
}

/* ── Legend panel ────────────────────────────────────────────────────────── */
function LegendPanel({ isEmpty }: { isEmpty: boolean }) {
  return (
    <div className="w-64 shrink-0 border-l border-border bg-surface flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">Entity Types</div>
        <div className="space-y-2">
          {(Object.entries(NODE_COLORS) as [NodeType, string][]).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: color + '20', borderColor: color + '80' }}>
                <span className="font-mono text-[7px]" style={{ color }}>
                  {type === 'developer' ? 'D' : type === 'project' ? 'P' : type === 'person' ? 'Pe' : type === 'asset' ? 'A' : type === 'litigation' ? 'Li' : 'R'}
                </span>
              </div>
              <span className="font-mono text-[10px] text-gray-light capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 pb-3 border-b border-border">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">Edge Types</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-px bg-[#2A2A3E] shrink-0" />
            <span className="font-mono text-[10px] text-gray">Known relationship</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 border-t-2 border-dashed border-[#9B59B6] shrink-0" />
            <span className="font-mono text-[10px] text-gray">Spouse / family</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 border-t-2 border-dashed border-red shrink-0" />
            <span className="font-mono text-[10px] text-red">Related-party discovery</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">Indicators</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red shrink-0" />
            <span className="font-mono text-[10px] text-gray">Anomaly detected</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gold shrink-0" />
            <span className="font-mono text-[10px] text-gray">Unexpanded connections</span>
          </div>
        </div>
      </div>

      {isEmpty && (
        <div className="px-4 pb-4">
          <div className="border border-border rounded-sm p-3">
            <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-gray mb-2">How to use</div>
            <ol className="space-y-1.5 font-mono text-[10px] text-gray leading-relaxed">
              <li>1. Search for any entity above</li>
              <li>2. Click to add it to the canvas</li>
              <li>3. Click a node to open its dossier</li>
              <li>4. Click "Expand Connections"</li>
              <li>5. Or press "Ozone Trail" for the demo</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Page component ──────────────────────────────────────────────────────── */
export default function InvestigationCanvas() {
  const [nodes, setNodes] = useState<CanvasNode[]>([])
  const [links, setLinks] = useState<CanvasLink[]>([])
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<CanvasNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CanvasNode[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [showKannehalli, setShowKannehalli] = useState(false)

  const fgRef = useRef<any>(null)
  // Keep a ref to expandedNodes to avoid stale closure in expandNode
  const expandedRef = useRef<Set<string>>(expandedNodes)
  useEffect(() => { expandedRef.current = expandedNodes }, [expandedNodes])

  /* ── Search ──────────────────────────────────────────────────── */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const q = searchQuery.toLowerCase()
    setSearchResults(
      SEARCH_INDEX.filter(e => e.label.toLowerCase().includes(q) || e.type.includes(q)).slice(0, 8)
    )
  }, [searchQuery])

  /* ── Graph mutations ─────────────────────────────────────────── */
  function addToCanvas(entity: CanvasNode) {
    setNodes(prev => prev.find(n => n.id === entity.id) ? prev : [...prev, { ...entity }])
    setSearchQuery(''); setSearchResults([])
    setTimeout(() => fgRef.current?.centerAt(0, 0, 600), 200)
  }

  function expandNode(nodeId: string) {
    if (expandedRef.current.has(nodeId)) return
    const conns = CONNECTIONS[nodeId] ?? []

    setNodes(prev => {
      const existIds = new Set(prev.map(n => n.id))
      const newNodes = conns.filter(c => !existIds.has(c.node.id)).map(c => ({ ...c.node }))
      if (conns.some(c => c.node.id === 'asset-kannehalli') && !existIds.has('asset-kannehalli')) {
        setTimeout(() => setShowKannehalli(true), 900)
      }
      return [...prev.map(n => n.id === nodeId ? { ...n, expanded: true } : n), ...newNodes]
    })

    setLinks(prev => {
      const existKeys = new Set(prev.map(l => {
        const s = typeof l.source === 'string' ? l.source : (l.source as CanvasNode).id
        const t = typeof l.target === 'string' ? l.target : (l.target as CanvasNode).id
        return `${s}→${t}`
      }))
      const newLinks: CanvasLink[] = conns
        .filter(c => !existKeys.has(`${nodeId}→${c.node.id}`))
        .map(c => ({ source: nodeId, target: c.node.id, label: c.link.label, type: c.link.type }))
      return [...prev, ...newLinks]
    })

    setExpandedNodes(prev => new Set(Array.from(prev).concat(nodeId)))
  }

  function removeNode(nodeId: string) {
    setNodes(prev => prev.filter(n => n.id !== nodeId))
    setLinks(prev => prev.filter(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as CanvasNode).id
      const t = typeof l.target === 'string' ? l.target : (l.target as CanvasNode).id
      return s !== nodeId && t !== nodeId
    }))
    setExpandedNodes(prev => { const s = new Set(Array.from(prev)); s.delete(nodeId); return s })
    if (selectedNode?.id === nodeId) setSelectedNode(null)
  }

  function resetCanvas() {
    setNodes([]); setLinks([])
    setExpandedNodes(new Set()); setSelectedNode(null); setShowKannehalli(false)
  }

  /* ── Ozone trail ─────────────────────────────────────────────── */
  async function runOzoneTrail() {
    if (isAnimating) return
    setIsAnimating(true)
    setShowKannehalli(false)
    setNodes([]); setLinks([]); setExpandedNodes(new Set()); setSelectedNode(null)
    // also reset the ref immediately
    expandedRef.current = new Set()
    await sleep(300)

    setNodes([{ ...DB['ozone-group'] }])
    setSelectedNode(DB['ozone-group'])
    await sleep(1200)

    expandNode('ozone-group')
    setSelectedNode(DB['ozone-spe'])
    await sleep(1500)

    expandNode('ozone-spe')
    setSelectedNode(DB['ozone-promoter'])
    await sleep(1500)

    expandNode('ozone-promoter')
    setSelectedNode(DB['ozone-spouse'])
    await sleep(1500)

    expandNode('ozone-spouse')
    setSelectedNode(DB['asset-kannehalli'])
    setIsAnimating(false)
  }

  function sleep(ms: number) { return new Promise<void>(r => setTimeout(r, ms)) }

  /* ── Stable callbacks for GraphCanvas ───────────────────────── */
  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(DB[node.id] ?? (node as CanvasNode))
  }, [])

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node ? (DB[node.id] ?? (node as CanvasNode)) : null)
  }, [])

  const handleBackgroundClick = useCallback(() => setSelectedNode(null), [])

  const handleReady = useCallback((fg: any) => { fgRef.current = fg }, [])

  const nodeCount = nodes.length

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100dvh - 48px)' }}>
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface/95 z-10">
        <div className="flex items-center gap-2 shrink-0">
          <Network className="w-4 h-4 text-gold" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-gray hidden sm:block">
            Investigation Canvas
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
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm shadow-2xl z-50 overflow-hidden">
              {searchResults.map(r => (
                <button key={r.id} onClick={() => addToCanvas(r)}
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

        <button onClick={runOzoneTrail} disabled={isAnimating}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 border border-gold/40 text-gold text-xs font-mono rounded-sm hover:bg-gold/25 disabled:opacity-40 transition-colors">
          <Play className="w-3 h-3" />
          <span className="hidden sm:inline">{isAnimating ? 'Investigating…' : 'Ozone Trail'}</span>
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => { const fg = fgRef.current; if (fg) fg.zoom(fg.zoom() * 1.35, 200) }}
            className="p-1.5 text-gray hover:text-gold transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { const fg = fgRef.current; if (fg) fg.zoom(fg.zoom() / 1.35, 200) }}
            className="p-1.5 text-gray hover:text-gold transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {nodeCount > 0 && (
          <button onClick={resetCanvas} className="shrink-0 p-1.5 text-gray hover:text-red transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
        {nodeCount > 0 && (
          <span className="shrink-0 font-mono text-[9px] text-gray hidden md:block">
            {nodeCount}N · {links.length}E
          </span>
        )}
      </div>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative bg-[#0A0A0F] overflow-hidden">
          {/* GraphCanvas is never SSR'd — force-graph module stays browser-only */}
          <GraphCanvas
            nodes={nodes}
            links={links}
            selectedNodeId={selectedNode?.id ?? null}
            expandedNodeIds={Array.from(expandedNodes)}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onBackgroundClick={handleBackgroundClick}
            onReady={handleReady}
          />

          {nodeCount === 0 && !isAnimating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <Network className="w-14 h-14 text-border mb-4" />
              <div className="text-gray font-mono text-sm">Investigation canvas is empty</div>
              <div className="text-gray/50 font-mono text-xs mt-1">Search for an entity above, or click Ozone Trail</div>
            </div>
          )}

          {hoveredNode && !selectedNode && (
            <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-sm px-3 py-2 pointer-events-none shadow-xl z-10">
              <div className="font-mono text-xs text-off-white">{hoveredNode.label}</div>
              <div className="font-mono text-[9px] text-gray capitalize mt-0.5">{hoveredNode.type}</div>
            </div>
          )}

          {showKannehalli && (
            <div className="absolute bottom-4 right-4 w-72 bg-[#0A0A0F] border border-gold/60 rounded-sm p-4 shadow-2xl z-20">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold mb-1.5">⚑ Key Discovery</div>
                  <div className="text-off-white text-xs leading-relaxed">
                    <strong>Kannehalli Land — 179 acres (₹202.6 Cr)</strong> surfaced via Vantis Bhoomi
                    cross-reference. Registered in the promoter&apos;s spouse&apos;s name — not in any prior enforcement record.
                  </div>
                  <button
                    onClick={() => { setSelectedNode(DB['asset-kannehalli']); setShowKannehalli(false) }}
                    className="mt-2 text-[9px] font-mono text-gold hover:text-gold-light transition-colors">
                    View asset dossier →
                  </button>
                </div>
                <button onClick={() => setShowKannehalli(false)} className="text-gray hover:text-off-white transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedNode ? (
          <DossierPanel
            node={selectedNode}
            isExpanded={expandedNodes.has(selectedNode.id)}
            onExpand={() => expandNode(selectedNode.id)}
            onFocus={() => {
              const n = nodes.find(n => n.id === selectedNode.id)
              if (fgRef.current && n?.x != null && n?.y != null) {
                fgRef.current.centerAt(n.x, n.y, 500)
                fgRef.current.zoom(2.5, 500)
              }
            }}
            onRemove={() => removeNode(selectedNode.id)}
            onClose={() => setSelectedNode(null)}
          />
        ) : (
          <LegendPanel isEmpty={nodeCount === 0} />
        )}
      </div>
    </div>
  )
}
