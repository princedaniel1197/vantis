'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Search, X, Network, RotateCcw, Play, ZoomIn, ZoomOut } from 'lucide-react'

/* ── Dynamic import — canvas API not available on SSR ────────────────────── */
const ForceGraph2D = dynamic(
  () => import('react-force-graph').then(m => ({ default: m.ForceGraph2D })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-gray text-sm font-mono tracking-wider">
        Initialising investigation canvas…
      </div>
    ),
  }
)

/* ── Types ───────────────────────────────────────────────────────────────── */
type NodeType = 'developer' | 'project' | 'person' | 'asset' | 'litigation' | 'rrc'
type LinkType =
  | 'owns' | 'controls' | 'spouse-of' | 'subject-of'
  | 'holds' | 'directed-by' | 'related-party'

interface CanvasNode {
  id: string
  label: string
  type: NodeType
  data: Record<string, string | number | null>
  anomaly?: boolean
  expanded?: boolean
  x?: number
  y?: number
  vx?: number
  vy?: number
  fx?: number
  fy?: number
}

interface CanvasLink {
  source: string | CanvasNode
  target: string | CanvasNode
  label: string
  type: LinkType
}

/* ── Visual constants ────────────────────────────────────────────────────── */
const NODE_R = 10

const NODE_COLORS: Record<NodeType, string> = {
  developer:  '#C9A84C',
  project:    '#3498DB',
  person:     '#9B59B6',
  asset:      '#2ECC71',
  litigation: '#E74C3C',
  rrc:        '#E67E22',
}

const NODE_LETTER: Record<NodeType, string> = {
  developer:  'D',
  project:    'P',
  person:     'Pe',
  asset:      'A',
  litigation: 'Li',
  rrc:        'R',
}

/* ── Entity database ─────────────────────────────────────────────────────── */
const DB: Record<string, CanvasNode> = {
  'ozone-group': {
    id: 'ozone-group', label: 'Ozone Group', type: 'developer', anomaly: true,
    data: {
      Status: 'HIGH RISK', 'Trust Score': '9 / 100', City: 'Bengaluru',
      'Active Projects': 4, 'Homebuyers Affected': 1847,
      'Capital at Risk': '₹927 Cr', 'FIR Filed': 'Q3 2023',
      'RERA ID': 'DEV/KA/RERA/OG/001',
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
      Type: 'Project SPE (Special Purpose Entity)', Role: 'Project Promoter / Escrow Holder',
      'RERA Reg': 'KA/RERA/1251/2016',
      'Escrow Balance': '₹3.88 Cr', 'Escrow Status': 'CRITICAL',
    },
  },
  'ozone-promoter': {
    id: 'ozone-promoter', label: 'Ozone Group Promoter (withheld)', type: 'person', anomaly: true,
    data: {
      Role: 'Managing Director / Key Promoter',
      Status: 'Withheld pending service of notice',
      Note: 'Director of Ozone Urbana Promoters Pvt. Ltd. and Ozone Group Holdings. Signatory to all project agreements.',
      '⚑ Anomaly Flag': 'Related-party land holding traced via Bhoomi cross-reference',
    },
  },
  'ozone-spouse': {
    id: 'ozone-spouse', label: "Promoter's Spouse (withheld)", type: 'person', anomaly: true,
    data: {
      Role: 'Registered holder of related-party agricultural land',
      Status: 'Withheld — Benami notice pending',
      '⚑ Key Discovery': 'Holds 179-acre Kannehalli parcel not surfaced in any prior enforcement record',
      Note: 'Land acquired Feb 2019 — coincides with Ozone Urbana peak collection phase (FY 2018-19)',
    },
  },
  'lit-os-1124': {
    id: 'lit-os-1124', label: 'OS 1124/2022', type: 'litigation',
    data: {
      Court: 'City Civil Court, Bengaluru', Filed: '2022-03-14',
      Plaintiff: 'Homebuyers Association (42 members)',
      Cause: 'Possession delay & breach of agreement',
      'Relief Sought': '₹24.8 Cr', Severity: 'HIGH', Status: 'Pending',
    },
  },
  'lit-os-2247': {
    id: 'lit-os-2247', label: 'OS 2247/2022', type: 'litigation',
    data: {
      Court: 'City Civil Court, Bengaluru', Filed: '2022-07-22',
      Plaintiff: 'Sanjay Kapoor & 18 Others',
      Cause: 'Refund with interest — RERA Sec 18',
      'Relief Sought': '₹11.2 Cr', Severity: 'HIGH', Status: 'Pending',
    },
  },
  'lit-wp-1842': {
    id: 'lit-wp-1842', label: 'WP 1842/2023', type: 'litigation',
    data: {
      Court: 'Karnataka High Court', Filed: '2023-01-05',
      Plaintiff: 'Ozone Urbana Homebuyers Forum',
      Cause: 'Mandamus to K-RERA to initiate enforcement action',
      Severity: 'CRITICAL', Status: 'Pending',
    },
  },
  'rrc-oz-001': {
    id: 'rrc-oz-001', label: 'RRC/K-RERA/2026/OZ-001', type: 'rrc',
    data: {
      'Amount Ordered': '₹423 Cr', 'Amount Recovered': '₹0',
      Stage: 'Stage 5 / 8 — Asset Identification (STALLED)',
      'Issued': '11 April 2026',
      'HC Deadline': '06 June 2026 (20 days overdue)',
      Status: 'ISSUED — Unacknowledged 32 days',
    },
  },
  'asset-devanahalli': {
    id: 'asset-devanahalli', label: 'Devanahalli Land (18.4 acres)', type: 'asset',
    data: {
      Description: 'Sy. No. 94/1-4, Devanahalli Hobli, Bengaluru Urban',
      Type: 'Agricultural / Development Land',
      Value: '₹82 Cr', Source: 'Kaveri 2.0 + Bhoomi',
      Status: 'Verified — Partial mortgage',
      Attachment: 'Eligible under RERA Sec 40',
    },
  },
  'asset-bank': {
    id: 'asset-bank', label: 'Bank Accounts ×3', type: 'asset',
    data: {
      Description: 'RERA Escrow (KA/RERA/ESC/1251/2016) + Karnataka Bank + HDFC Bank',
      Type: 'Liquid / Bank Accounts',
      Value: '₹12.4 Cr', 'Escrow Balance': '₹3.88 Cr',
      Source: 'RERA Escrow Records + RBI CERSAI',
      Attachment: 'Freezable immediately',
    },
  },
  'asset-whitefield': {
    id: 'asset-whitefield', label: 'Whitefield Office (8,400 sqft)', type: 'asset',
    data: {
      Description: 'EPIP Zone, Whitefield, Bengaluru — BBMP Ref KA/WH/BBMP/2019/4421',
      Type: 'Commercial Property',
      Value: '₹14.2 Cr', Source: 'BBMP Property Tax + Kaveri 2.0',
      Note: 'Held in Ozone Group Holdings — corporate veil. IBC s.66 required.',
      Attachment: 'Requires lifting corporate veil',
    },
  },
  'asset-sadashiva': {
    id: 'asset-sadashiva', label: 'Sadashivanagar Villa', type: 'asset',
    data: {
      Description: 'No. 28, 4th Cross, Sadashivanagar, Bengaluru — Khata No. 841/20/SN',
      Type: 'Residential Property',
      Value: '₹6.8 Cr', Source: 'BBMP + Kaveri 2.0',
      Status: 'Clear title — no mortgage or encumbrance',
      Attachment: 'Straightforward — RERA Sec 40',
    },
  },
  'asset-kannehalli': {
    id: 'asset-kannehalli', label: '⚑ Kannehalli Land (179 acres)', type: 'asset', anomaly: true,
    data: {
      '⚑ DISCOVERY': 'Found via Vantis Bhoomi cross-reference — not in any prior enforcement record',
      Description: 'Sy. No. 48/1–48/9, Kannehalli Village, Tumkur Taluk, Tumkur District',
      Type: 'Agricultural Land',
      Value: '₹202.6 Cr', 'Registered Holder': "Promoter's Spouse",
      'Registered': 'February 2019', Source: 'Bhoomi + Kaveri 2.0 cross-reference',
      Note: 'Purchase during Ozone Urbana peak collection phase FY 2018-19.',
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
      Location: 'Hennur, Bengaluru', Units: '98 sold / 156 total', 'Declared Cost': '₹62 Cr',
    },
  },
  'lit-os-3891': {
    id: 'lit-os-3891', label: 'OS 3891/2024', type: 'litigation',
    data: {
      Court: 'City Civil Court, Bengaluru', Filed: '2024-11-03',
      Plaintiff: 'Ramesh Gowda',
      Cause: 'Construction defect — structural cracks, Block A',
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
    { node: DB['ozone-urbana'],   link: { label: 'owns',        type: 'owns' } },
    { node: DB['ozone-holdings'], link: { label: 'controls',    type: 'controls' } },
    { node: DB['ozone-spe'],      link: { label: 'controls',    type: 'controls' } },
    { node: DB['lit-os-1124'],    link: { label: 'subject of',  type: 'subject-of' } },
    { node: DB['lit-os-2247'],    link: { label: 'subject of',  type: 'subject-of' } },
    { node: DB['lit-wp-1842'],    link: { label: 'subject of',  type: 'subject-of' } },
    { node: DB['rrc-oz-001'],     link: { label: 'subject of',  type: 'subject-of' } },
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

/* ── Dossier panel ───────────────────────────────────────────────────────── */
interface DossierProps {
  node: CanvasNode
  isExpanded: boolean
  onExpand: () => void
  onFocus: () => void
  onRemove: () => void
  onClose: () => void
}

function DossierPanel({ node, isExpanded, onExpand, onFocus, onRemove, onClose }: DossierProps) {
  const color = NODE_COLORS[node.type]
  const hasConns = !!CONNECTIONS[node.id]

  return (
    <div className="flex flex-col w-72 shrink-0 border-l border-border bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span
            className="font-mono text-[9px] uppercase tracking-[0.22em] px-2 py-0.5 rounded-sm border"
            style={{ color, borderColor: color + '55', backgroundColor: color + '15' }}
          >
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

      {/* Data fields */}
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

      {/* Actions */}
      <div className="p-3 border-t border-border space-y-2 shrink-0">
        {hasConns && !isExpanded && (
          <button
            onClick={onExpand}
            className="w-full py-2 bg-gold/15 border border-gold/40 text-gold text-xs font-mono rounded-sm hover:bg-gold/25 transition-colors"
          >
            Expand Connections →
          </button>
        )}
        {isExpanded && (
          <div className="w-full py-2 bg-surface2 border border-border text-gray text-xs font-mono rounded-sm text-center">
            Connections loaded ✓
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={onFocus}
            className="flex-1 py-1.5 bg-surface2 border border-border text-gray-light text-xs font-mono rounded-sm hover:text-gold hover:border-gold/40 transition-colors"
          >
            Focus
          </button>
          <button
            onClick={onRemove}
            className="flex-1 py-1.5 bg-surface2 border border-border text-gray-light text-xs font-mono rounded-sm hover:text-red hover:border-red/40 transition-colors"
          >
            Remove
          </button>
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
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 border"
                style={{ backgroundColor: color + '20', borderColor: color + '80' }}
              >
                <span className="font-mono text-[7px]" style={{ color }}>{NODE_LETTER[type]}</span>
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
            <span className="font-mono text-[10px] text-gray">Spouse / family link</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 border-t-2 border-dashed border-red shrink-0" />
            <span className="font-mono text-[10px] text-red">Related-party discovery</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 pb-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-3">Node Indicators</div>
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
              <li>1. Search for any developer, project, or entity</li>
              <li>2. Click a result to add it to the canvas</li>
              <li>3. Click a node to open its dossier</li>
              <li>4. Click "Expand Connections" to reveal links</li>
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
  const [graphData, setGraphData] = useState<{ nodes: CanvasNode[]; links: CanvasLink[] }>({
    nodes: [],
    links: [],
  })
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNode, setSelectedNode] = useState<CanvasNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<CanvasNode | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CanvasNode[]>([])
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 600 })
  const [isAnimating, setIsAnimating] = useState(false)
  const [showKannehalli, setShowKannehalli] = useState(false)

  const fgRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedIdRef = useRef<string | null>(null)
  const expandedRef = useRef<Set<string>>(new Set())

  /* sync refs */
  useEffect(() => { selectedIdRef.current = selectedNode?.id ?? null }, [selectedNode])
  useEffect(() => { expandedRef.current = expandedNodes }, [expandedNodes])

  /* resize observer */
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const rect = entries[0].contentRect
      setCanvasSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  /* search */
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const q = searchQuery.toLowerCase()
    setSearchResults(
      SEARCH_INDEX.filter(e => e.label.toLowerCase().includes(q) || e.type.includes(q)).slice(0, 8)
    )
  }, [searchQuery])

  /* ── Actions ─────────────────────────────────────────────────── */
  function addToCanvas(entity: CanvasNode) {
    setGraphData(prev => {
      if (prev.nodes.find(n => n.id === entity.id)) return prev
      return { ...prev, nodes: [...prev.nodes, { ...entity }] }
    })
    setSearchQuery('')
    setSearchResults([])
    setTimeout(() => fgRef.current?.centerAt(0, 0, 600), 200)
  }

  function expandNode(nodeId: string) {
    if (expandedRef.current.has(nodeId)) return
    const conns = CONNECTIONS[nodeId] ?? []
    setGraphData(prev => {
      const existIds = new Set(prev.nodes.map(n => n.id))
      const existLinkKeys = new Set(
        prev.links.map(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as CanvasNode).id
          const t = typeof l.target === 'string' ? l.target : (l.target as CanvasNode).id
          return `${s}→${t}`
        })
      )
      const newNodes = conns.filter(c => !existIds.has(c.node.id)).map(c => ({ ...c.node }))
      const newLinks: CanvasLink[] = conns
        .filter(c => !existLinkKeys.has(`${nodeId}→${c.node.id}`))
        .map(c => ({ source: nodeId, target: c.node.id, label: c.link.label, type: c.link.type }))

      if (conns.some(c => c.node.id === 'asset-kannehalli') && !existIds.has('asset-kannehalli')) {
        setTimeout(() => setShowKannehalli(true), 900)
      }

      return {
        nodes: [...prev.nodes.map(n => n.id === nodeId ? { ...n, expanded: true } : n), ...newNodes],
        links: [...prev.links, ...newLinks],
      }
    })
    setExpandedNodes(prev => new Set(Array.from(prev).concat(nodeId)))
  }

  function focusNode(node: CanvasNode) {
    if (fgRef.current && node.x != null && node.y != null) {
      fgRef.current.centerAt(node.x, node.y, 500)
      fgRef.current.zoom(2.5, 500)
    }
  }

  function removeNode(nodeId: string) {
    setGraphData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      links: prev.links.filter(l => {
        const s = typeof l.source === 'string' ? l.source : (l.source as CanvasNode).id
        const t = typeof l.target === 'string' ? l.target : (l.target as CanvasNode).id
        return s !== nodeId && t !== nodeId
      }),
    }))
    setExpandedNodes(prev => { const s = new Set(prev); s.delete(nodeId); return s })
    if (selectedNode?.id === nodeId) setSelectedNode(null)
  }

  function resetCanvas() {
    setGraphData({ nodes: [], links: [] })
    setExpandedNodes(new Set())
    setSelectedNode(null)
    setShowKannehalli(false)
  }

  /* ── Animated Ozone trail ─────────────────────────────────────── */
  async function runOzoneTrail() {
    if (isAnimating) return
    setIsAnimating(true)
    setShowKannehalli(false)
    // Reset
    setGraphData({ nodes: [], links: [] })
    setExpandedNodes(new Set())
    setSelectedNode(null)
    await sleep(300)
    // Step 1: drop Ozone Group
    setGraphData({ nodes: [{ ...DB['ozone-group'] }], links: [] })
    setSelectedNode(DB['ozone-group'])
    await sleep(1200)
    // Step 2: expand group
    expandNode('ozone-group')
    setSelectedNode(DB['ozone-spe'])
    await sleep(1500)
    // Step 3: expand SPE
    expandNode('ozone-spe')
    setSelectedNode(DB['ozone-promoter'])
    await sleep(1500)
    // Step 4: expand promoter
    expandNode('ozone-promoter')
    setSelectedNode(DB['ozone-spouse'])
    await sleep(1500)
    // Step 5: expand spouse → KANNEHALLI
    expandNode('ozone-spouse')
    setSelectedNode(DB['asset-kannehalli'])
    setIsAnimating(false)
  }

  function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms))
  }

  /* ── Canvas callbacks ────────────────────────────────────────── */
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, gs: number) => {
    const { x = 0, y = 0, id, type, label, anomaly } = node as CanvasNode & { x: number; y: number }
    const color = NODE_COLORS[type as NodeType] ?? '#888'
    const selected = selectedIdRef.current === id
    const hasMore = !!CONNECTIONS[id] && !expandedRef.current.has(id)

    // Glow for selected / kannehalli discovery
    if (selected) {
      ctx.beginPath()
      ctx.arc(x, y, NODE_R + 7, 0, 2 * Math.PI)
      ctx.fillStyle = color + '18'
      ctx.fill()
    }

    // Fill
    ctx.beginPath()
    ctx.arc(x, y, NODE_R, 0, 2 * Math.PI)
    ctx.fillStyle = selected ? color + '35' : color + '20'
    ctx.fill()

    // Stroke
    ctx.beginPath()
    ctx.arc(x, y, NODE_R, 0, 2 * Math.PI)
    ctx.strokeStyle = selected ? color : anomaly ? color + 'CC' : color + '66'
    ctx.lineWidth = selected ? 2 : 1.5
    ctx.stroke()

    // Type letter
    ctx.font = `bold ${NODE_R * 0.95}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.fillText(NODE_LETTER[type as NodeType] ?? '?', x, y)

    // Label (below node)
    if (gs > 0.45) {
      const truncated = label.replace('⚑ ', '').slice(0, 22)
      ctx.font = `${9 / gs}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#F0EEE8BB'
      ctx.fillText(truncated, x, y + NODE_R + 3)
    }

    // Anomaly red dot (top-right)
    if (anomaly) {
      ctx.beginPath()
      ctx.arc(x + NODE_R * 0.68, y - NODE_R * 0.68, 3.5, 0, 2 * Math.PI)
      ctx.fillStyle = '#E74C3C'
      ctx.fill()
    }

    // Gold "has more" dot (bottom)
    if (hasMore) {
      ctx.beginPath()
      ctx.arc(x, y + NODE_R + 1.5, 2.5, 0, 2 * Math.PI)
      ctx.fillStyle = '#C9A84C'
      ctx.fill()
    }

    // Selection dashed ring
    if (selected) {
      ctx.beginPath()
      ctx.arc(x, y, NODE_R + 5, 0, 2 * Math.PI)
      ctx.strokeStyle = color + 'AA'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 2])
      ctx.stroke()
      ctx.setLineDash([])
    }
  }, [])

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x ?? 0, node.y ?? 0, NODE_R + 8, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, gs: number) => {
    const src = link.source as CanvasNode & { x: number; y: number }
    const tgt = link.target as CanvasNode & { x: number; y: number }
    if (src.x == null || tgt.x == null) return

    const isRelated = link.type === 'related-party'
    const isSpouse  = link.type === 'spouse-of'

    const dx   = tgt.x - src.x
    const dy   = tgt.y - src.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return

    const sx = src.x + (dx / dist) * NODE_R
    const sy = src.y + (dy / dist) * NODE_R
    const ex = tgt.x - (dx / dist) * (NODE_R + 5)
    const ey = tgt.y - (dy / dist) * (NODE_R + 5)

    ctx.beginPath()
    if (isRelated) {
      ctx.setLineDash([5, 4])
      ctx.strokeStyle = '#E74C3C'
      ctx.lineWidth = 2
    } else if (isSpouse) {
      ctx.setLineDash([3, 3])
      ctx.strokeStyle = '#9B59B6AA'
      ctx.lineWidth = 1.5
    } else {
      ctx.setLineDash([])
      ctx.strokeStyle = '#2A2A3EDD'
      ctx.lineWidth = 1
    }
    ctx.moveTo(sx, sy)
    ctx.lineTo(ex, ey)
    ctx.stroke()
    ctx.setLineDash([])

    // Arrowhead
    const angle = Math.atan2(ey - sy, ex - sx)
    const al = 6
    ctx.beginPath()
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex - al * Math.cos(angle - 0.42), ey - al * Math.sin(angle - 0.42))
    ctx.lineTo(ex - al * Math.cos(angle + 0.42), ey - al * Math.sin(angle + 0.42))
    ctx.closePath()
    ctx.fillStyle = isRelated ? '#E74C3C' : '#2A2A3EDD'
    ctx.fill()

    // Edge label at midpoint (only when zoomed in)
    if (gs > 0.85 && link.label) {
      const mx = (sx + ex) / 2
      const my = (sy + ey) / 2
      ctx.font = `${9 / gs}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isRelated ? '#E74C3CAA' : '#6B6B88'
      ctx.fillText(link.label as string, mx, my - 8 / gs)
    }
  }, [])

  /* ── Render ─────────────────────────────────────────────────────────────── */
  const nodeCount = graphData.nodes.length

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100dvh - 48px)' }}>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface/95 backdrop-blur-sm z-10">
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
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entity…"
            className="w-full pl-7 pr-3 py-1.5 bg-surface2 border border-border rounded-sm text-off-white text-xs font-mono placeholder:text-gray focus:outline-none focus:border-gold/50 transition-colors"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-sm shadow-2xl z-50 overflow-hidden">
              {searchResults.map(r => (
                <button
                  key={r.id}
                  onClick={() => addToCanvas(r)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface2 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: NODE_COLORS[r.type] + '55', border: `1px solid ${NODE_COLORS[r.type]}` }}
                  />
                  <span className="text-off-white text-xs flex-1 truncate">{r.label}</span>
                  <span className="font-mono text-[9px] text-gray shrink-0">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ozone trail */}
        <button
          onClick={runOzoneTrail}
          disabled={isAnimating}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 border border-gold/40 text-gold text-xs font-mono rounded-sm hover:bg-gold/25 disabled:opacity-40 transition-colors"
        >
          <Play className="w-3 h-3" />
          <span className="hidden sm:inline">{isAnimating ? 'Investigating…' : 'Ozone Trail'}</span>
        </button>

        {/* Zoom */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 200)}
            className="p-1.5 text-gray hover:text-gold transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 200)}
            className="p-1.5 text-gray hover:text-gold transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reset */}
        {nodeCount > 0 && (
          <button
            onClick={resetCanvas}
            className="shrink-0 p-1.5 text-gray hover:text-red transition-colors"
            title="Reset canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {nodeCount > 0 && (
          <span className="shrink-0 font-mono text-[9px] text-gray hidden md:block">
            {nodeCount}N · {graphData.links.length}E
          </span>
        )}
      </div>

      {/* ── Main area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative bg-[#0A0A0F]">
          {canvasSize.w > 0 && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData as any}
              width={canvasSize.w}
              height={canvasSize.h}
              backgroundColor="#0A0A0F"
              nodeCanvasObject={nodeCanvasObject}
              nodeCanvasObjectMode={() => 'replace'}
              nodePointerAreaPaint={nodePointerAreaPaint}
              linkCanvasObject={linkCanvasObject}
              linkCanvasObjectMode={() => 'replace'}
              onNodeClick={(node: any) => setSelectedNode(node as CanvasNode)}
              onNodeHover={(node: any) => setHoveredNode(node as CanvasNode | null)}
              onNodeDragEnd={(node: any) => { node.fx = node.x; node.fy = node.y }}
              onBackgroundClick={() => setSelectedNode(null)}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
              linkDirectionalArrowLength={0}
            />
          )}

          {/* Empty state */}
          {nodeCount === 0 && !isAnimating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <Network className="w-14 h-14 text-border mb-4" />
              <div className="text-gray font-mono text-sm">Investigation canvas is empty</div>
              <div className="text-gray/50 font-mono text-xs mt-1">
                Search for an entity above, or click Ozone Trail
              </div>
            </div>
          )}

          {/* Hover tooltip */}
          {hoveredNode && !selectedNode && (
            <div className="absolute bottom-4 left-4 bg-surface border border-border rounded-sm px-3 py-2 pointer-events-none shadow-xl">
              <div className="font-mono text-xs text-off-white">{hoveredNode.label}</div>
              <div className="font-mono text-[9px] text-gray capitalize mt-0.5">{hoveredNode.type}</div>
            </div>
          )}

          {/* Kannehalli discovery alert */}
          {showKannehalli && (
            <div className="absolute bottom-4 right-4 w-72 bg-[#0A0A0F] border border-gold/60 rounded-sm p-4 shadow-2xl z-20">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold mb-1.5">
                    ⚑ Key Discovery
                  </div>
                  <div className="text-off-white text-xs leading-relaxed">
                    <strong>Kannehalli Land — 179 acres (₹202.6 Cr)</strong> surfaced via Vantis
                    Bhoomi cross-reference. Registered in the promoter's spouse's name — not
                    in any prior enforcement record.
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNode(DB['asset-kannehalli'])
                      setShowKannehalli(false)
                    }}
                    className="mt-2 text-[9px] font-mono text-gold hover:text-gold-light transition-colors pointer-events-auto"
                  >
                    View asset dossier →
                  </button>
                </div>
                <button
                  onClick={() => setShowKannehalli(false)}
                  className="text-gray hover:text-off-white transition-colors shrink-0 pointer-events-auto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {selectedNode ? (
          <DossierPanel
            node={selectedNode}
            isExpanded={expandedNodes.has(selectedNode.id)}
            onExpand={() => expandNode(selectedNode.id)}
            onFocus={() => focusNode(selectedNode)}
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
