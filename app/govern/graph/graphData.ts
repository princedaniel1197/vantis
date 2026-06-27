// Full Karnataka RERA graph data — built from all JSON sources at module load.
// force-graph mutates node objects in-place (adds x, y, vx, vy) after graphData() call.
// This file must never be imported from a server component; it is only referenced
// inside GraphCanvas.tsx which is gated behind next/dynamic + ssr:false.

/* eslint-disable @typescript-eslint/no-explicit-any */
import rawProjectsJSON from '@/data/projects.json'
import rawDevelopersJSON from '@/data/developers.json'
import rawLitigationJSON from '@/data/litigation.json'

const rawProjects = rawProjectsJSON as unknown as any[]
const rawDevelopers = rawDevelopersJSON as unknown as any[]
const rawLitigation = rawLitigationJSON as unknown as any[]

export type NodeType = 'developer' | 'project' | 'person' | 'asset' | 'litigation' | 'rrc'
export type LinkType =
  | 'owns' | 'controls' | 'spouse-of' | 'subject-of'
  | 'holds' | 'directed-by' | 'related-party'

export interface FGNode {
  id: string
  label: string
  type: NodeType
  data: Record<string, string | number | null>
  anomaly?: boolean
  x?: number; y?: number
  fx?: number | null; fy?: number | null
}

export interface FGLink {
  source: string | FGNode
  target: string | FGNode
  label: string
  type: LinkType
}

export const NODE_COLORS: Record<NodeType, string> = {
  developer:  '#C9A84C',
  project:    '#3498DB',
  person:     '#9B59B6',
  asset:      '#2ECC71',
  litigation: '#E74C3C',
  rrc:        '#E67E22',
}

export const NODE_RADIUS: Record<NodeType, number> = {
  developer: 7,
  project:   2.5,
  person:    5,
  asset:     4,
  litigation: 4,
  rrc:       4.5,
}

export const NODE_LETTER: Record<NodeType, string> = {
  developer: 'D', project: 'P', person: 'Pe', asset: 'A', litigation: 'Li', rrc: 'R',
}

export const OZONE_TRAIL: string[] = [
  'ozone-group', 'ozone-spe', 'ozone-promoter', 'ozone-spouse', 'asset-kannehalli',
]

// Extra data fields to enrich specific developer nodes beyond what developers.json provides
const DEV_EXTRA: Record<string, Record<string, string | number>> = {
  'ozone-group': {
    'Homebuyers Affected': '1,847',
    'Capital at Risk': '₹927 Cr',
    'FIR Filed': 'Q3 2023',
  },
}

// Ozone investigation sub-graph (persons, assets, RRCs) not in any JSON file
const EXTRA_NODES: FGNode[] = [
  {
    id: 'ozone-spe', label: 'Ozone Urbana Promoters Pvt. Ltd.', type: 'person', anomaly: true,
    data: {
      Type: 'Project SPE', Role: 'Project Promoter / Escrow Holder',
      'RERA Reg': 'KA/RERA/1251/2016',
      'Escrow Balance': '₹3.88 Cr', 'Escrow Status': 'CRITICAL',
    },
  },
  {
    id: 'ozone-holdings', label: 'Ozone Group Holdings Pvt. Ltd.', type: 'person',
    data: {
      Type: 'Group Holding Company', CIN: 'U70200KA2002PTC030182',
      Role: 'Holds commercial assets for Ozone Group',
    },
  },
  {
    id: 'ozone-promoter', label: 'Ozone Group Promoter (withheld)', type: 'person', anomaly: true,
    data: {
      Role: 'Managing Director / Key Promoter',
      Status: 'Withheld pending service of notice',
      '⚑ Anomaly Flag': 'Related-party land holding traced via Bhoomi cross-reference',
    },
  },
  {
    id: 'ozone-spouse', label: "Promoter's Spouse (withheld)", type: 'person', anomaly: true,
    data: {
      Role: 'Registered holder of related-party agricultural land',
      Status: 'Withheld — Benami notice pending',
      '⚑ Key Discovery': 'Holds 179-acre Kannehalli parcel not in any prior enforcement record',
    },
  },
  {
    id: 'asset-devanahalli', label: 'Devanahalli Land (18.4 acres)', type: 'asset',
    data: {
      Description: 'Sy. No. 94/1-4, Devanahalli Hobli, Bengaluru Urban',
      Value: '₹82 Cr', Source: 'Kaveri 2.0 + Bhoomi',
      Status: 'Verified — Partial mortgage',
    },
  },
  {
    id: 'asset-bank', label: 'Bank Accounts ×3', type: 'asset',
    data: {
      Description: 'RERA Escrow + Karnataka Bank + HDFC Bank',
      Value: '₹12.4 Cr', Attachment: 'Freezable immediately',
    },
  },
  {
    id: 'asset-whitefield', label: 'Whitefield Office (8,400 sqft)', type: 'asset',
    data: {
      Description: 'EPIP Zone, Whitefield, Bengaluru',
      Value: '₹14.2 Cr',
      Note: 'Held in Holdings entity — IBC s.66 required to pierce corporate veil',
    },
  },
  {
    id: 'asset-sadashiva', label: 'Sadashivanagar Villa', type: 'asset',
    data: {
      Description: 'No. 28, 4th Cross, Sadashivanagar, Bengaluru',
      Value: '₹6.8 Cr',
      Status: 'Clear title — RERA Sec 40 attachment',
    },
  },
  {
    id: 'asset-kannehalli', label: '⚑ Kannehalli Land (179 acres)', type: 'asset', anomaly: true,
    data: {
      '⚑ DISCOVERY': 'Found via Vantis Bhoomi cross-reference — not in any prior enforcement record',
      Description: 'Sy. No. 48/1–48/9, Kannehalli Village, Tumkur Taluk, Tumkur District',
      Value: '₹202.6 Cr',
      'Registered Holder': "Promoter's Spouse",
      Registered: 'February 2019',
      'Proceedings Required': 'Benami Transactions Act + PMLA proceedings',
    },
  },
  {
    id: 'rrc-oz-001', label: 'RRC/K-RERA/2026/OZ-001', type: 'rrc',
    data: {
      'Amount Ordered': '₹423 Cr', 'Amount Recovered': '₹0',
      Stage: 'Stage 5/8 — Asset Identification (STALLED)',
      Issued: '11 April 2026', 'HC Deadline': '06 June 2026 (overdue)',
    },
  },
  {
    id: 'rrc-sky-002', label: 'RRC/K-RERA/2025/SKY-002', type: 'rrc',
    data: {
      'Amount Ordered': '₹42 Cr', 'Amount Recovered': '₹28 Cr (67%)',
      Stage: 'Stage 7/8 — Attachment & Sale', Status: 'IN_RECOVERY',
    },
  },
  {
    id: 'rrc-man-001', label: 'RRC/K-RERA/2026/MAN-001', type: 'rrc',
    data: {
      'Amount Ordered': '₹124 Cr', 'Amount Recovered': '₹0',
      Stage: 'Stage 4/8 — Forwarded to DC', 'Days Overdue': 77,
    },
  },
]

const EXTRA_LINKS: FGLink[] = [
  { source: 'ozone-group', target: 'ozone-spe',          label: 'controls',    type: 'controls' },
  { source: 'ozone-group', target: 'ozone-holdings',     label: 'controls',    type: 'controls' },
  { source: 'ozone-spe',   target: 'ozone-promoter',     label: 'directed by', type: 'directed-by' },
  { source: 'ozone-spe',   target: 'asset-devanahalli',  label: 'owns',        type: 'owns' },
  { source: 'ozone-spe',   target: 'asset-bank',         label: 'holds',       type: 'holds' },
  { source: 'ozone-holdings', target: 'asset-whitefield', label: 'owns',       type: 'owns' },
  { source: 'ozone-promoter', target: 'asset-sadashiva', label: 'owns',        type: 'owns' },
  { source: 'ozone-promoter', target: 'ozone-spouse',    label: 'spouse of',   type: 'spouse-of' },
  { source: 'ozone-spouse', target: 'asset-kannehalli',  label: 'owns (hidden)', type: 'related-party' },
  { source: 'ozone-group', target: 'rrc-oz-001',         label: 'subject of',  type: 'subject-of' },
  { source: 'skylark-constructions', target: 'rrc-sky-002', label: 'subject of', type: 'subject-of' },
  { source: 'mantri-developers-pvt-ltd', target: 'rrc-man-001', label: 'subject of', type: 'subject-of' },
]

function deriveStatus(projs: any[]): 'COMPLIANT' | 'CAUTION' | 'HIGH RISK' {
  if (projs.some(p => p.status === 'HIGH RISK')) return 'HIGH RISK'
  if (projs.some(p => p.status === 'CAUTION')) return 'CAUTION'
  return 'COMPLIANT'
}

function buildGraph(): { nodes: FGNode[]; links: FGLink[] } {
  const nodes: FGNode[] = []
  const links: FGLink[] = []
  const nodeIds = new Set<string>()

  const addNode = (n: FGNode) => { if (!nodeIds.has(n.id)) { nodes.push(n); nodeIds.add(n.id) } }

  // Rich developer data from developers.json, keyed by id
  const richDevMap: Record<string, any> = {}
  for (const d of rawDevelopers) richDevMap[d.id] = d

  // Group projects by developer_id — only include demo projects with a developer_id
  const projsByDev: Record<string, any[]> = {}
  for (const p of rawProjects) {
    if (!p.developer_id) continue
    if (!projsByDev[p.developer_id]) projsByDev[p.developer_id] = []
    projsByDev[p.developer_id].push(p)
  }

  // Developer nodes (one per unique developer_id in projects.json)
  for (const devId of Object.keys(projsByDev)) {
    const projs = projsByDev[devId]
    const rich = richDevMap[devId]
    const status = rich?.status ?? deriveStatus(projs)
    const name = rich?.name ?? projs[0].developer_name
    addNode({
      id: devId, label: name, type: 'developer',
      anomaly: status === 'HIGH RISK',
      data: {
        Status: status,
        ...(rich ? {
          'Trust Score': `${rich.trust_score} / 100`,
          City: rich.city,
          'Total Projects': rich.total_projects,
          'Years Active': rich.years_active,
        } : {
          City: String(projs[0].location ?? '').split(',').pop()?.trim() ?? 'Karnataka',
          'Projects in K-RERA': projs.length,
        }),
        ...(DEV_EXTRA[devId] ?? {}),
      },
    })
  }

  // Project nodes + developer→project edges (demo projects only, which have developer_id)
  for (const proj of rawProjects) {
    if (!proj.developer_id) continue
    addNode({
      id: proj.id, label: proj.name, type: 'project',
      anomaly: proj.status === 'HIGH RISK',
      data: {
        RERA: proj.rera,
        Status: proj.status,
        'Risk Score': proj.risk_score ?? null,
        Location: proj.location,
        Units: `${proj.units_sold ?? 0} / ${proj.total_units ?? 0}`,
        'Declared Cost': `₹${proj.declared_cost_crore ?? 0} Cr`,
        'Completion Date': proj.completion_date ?? null,
      },
    })
    links.push({ source: proj.developer_id, target: proj.id, label: 'owns', type: 'owns' })
  }

  // Litigation nodes + project→litigation edges
  for (const lit of rawLitigation) {
    addNode({
      id: lit.id, label: lit.case_number, type: 'litigation',
      data: {
        Court: lit.court,
        Plaintiff: lit.plaintiff,
        Cause: lit.cause,
        Filed: lit.filed_date,
        'Relief Sought': lit.relief_sought_crore ? `₹${lit.relief_sought_crore} Cr` : 'N/A',
        Severity: lit.severity,
        'Next Hearing': lit.next_hearing ?? null,
      },
    })
    if (nodeIds.has(lit.project_id)) {
      links.push({ source: lit.project_id, target: lit.id, label: 'subject of', type: 'subject-of' })
    }
  }

  // Ozone investigation extras
  for (const n of EXTRA_NODES) addNode(n)
  for (const l of EXTRA_LINKS) {
    const s = typeof l.source === 'string' ? l.source : (l.source as FGNode).id
    const t = typeof l.target === 'string' ? l.target : (l.target as FGNode).id
    if (nodeIds.has(s) && nodeIds.has(t)) links.push(l)
  }

  return { nodes, links }
}

export const FULL_GRAPH = buildGraph()

export function buildAdjacency(links: FGLink[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>()
  for (const l of links) {
    const s = typeof l.source === 'string' ? l.source : (l.source as FGNode).id
    const t = typeof l.target === 'string' ? l.target : (l.target as FGNode).id
    if (!map.has(s)) map.set(s, new Set())
    if (!map.has(t)) map.set(t, new Set())
    map.get(s)!.add(t)
    map.get(t)!.add(s)
  }
  return map
}

export const ADJACENCY = buildAdjacency(FULL_GRAPH.links)
