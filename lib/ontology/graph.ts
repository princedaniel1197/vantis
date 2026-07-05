import type { ObjectType } from './types'
import { executionScore, signalsFor } from './scoring'

// Node fill colors by object type (design token map)
export const TYPE_COLOR: Record<string, string> = {
  Developer: '#c9a84c', Project: '#3fe0ff', Parcel: '#6fa8c7', QPR: '#8fb3ff',
  SiteVerification: '#45e0c0', EscrowAccount: '#6ea0ff', Litigation: '#ff5a4d',
  Encumbrance: '#e8b24c', Approval: '#7e8ce8', Unit: '#7a8a96',
}

export interface GraphNode {
  id: string
  type: ObjectType
  label: string
  meta: string
  x: number          // fractional position 0..1 (art-directed, pixel-stable)
  y: number
  r: number
  hub?: boolean
  risk?: boolean
  hero?: boolean
  focus?: boolean    // part of the Ozone subgraph (kept lit in copilot; peers ghost)
}

export interface GraphEdge {
  from: string
  to: string
  label: string
  hero?: boolean
  minihero?: boolean
  focus?: boolean
}

// Art-directed fixed layout — identical every load. Ozone cluster dominates
// centre; three clean peers sit in the corners.
export const GRAPH_NODES: GraphNode[] = [
  // Ozone cluster (focus)
  { id: 'ozone', type: 'Developer', label: 'OZONE GROUP', meta: 'Developer · rep 9 · flagged', x: 0.44, y: 0.52, r: 15, hub: true, focus: true },
  { id: 'p1', type: 'Project', label: 'OZONE URBANA', meta: 'Project · AT RISK', x: 0.52, y: 0.44, r: 12, risk: true, focus: true },
  { id: 'qpr', type: 'QPR', label: "QPR Q1'26", meta: 'Declared 78%', x: 0.435, y: 0.25, r: 9, hero: true, focus: true },
  { id: 'cv', type: 'SiteVerification', label: 'CV SCAN', meta: 'Delivered 54% · roadmap', x: 0.6, y: 0.23, r: 9, hero: true, focus: true },
  { id: 'par', type: 'Parcel', label: 'PARCEL Sy.114/2', meta: 'Land parcel', x: 0.67, y: 0.4, r: 8, focus: true },
  { id: 'enc', type: 'Encumbrance', label: 'LIEN · KAVERI EC', meta: 'Active encumbrance', x: 0.79, y: 0.31, r: 8, focus: true },
  { id: 'lit', type: 'Litigation', label: 'VB/CC/2023/1847', meta: 'eCourts · admitted', x: 0.81, y: 0.47, r: 8, focus: true },
  { id: 'esc', type: 'EscrowAccount', label: 'ESCROW A/C', meta: 'Funded 54% / 70%', x: 0.63, y: 0.57, r: 8, focus: true },
  { id: 'apr', type: 'Approval', label: 'BBMP SANCTION', meta: 'Plan approval · valid', x: 0.52, y: 0.63, r: 7, focus: true },
  { id: 'unit', type: 'Unit', label: 'UNITS · 240', meta: '168 sold', x: 0.43, y: 0.66, r: 7, focus: true },
  // Skylark peer (watch) — bottom-left
  { id: 'skylark', type: 'Developer', label: 'SKYLARK MANSIONS', meta: 'Developer · rep 54', x: 0.2, y: 0.74, r: 10 },
  { id: 'p2', type: 'Project', label: 'SKYLARK ARCADIA', meta: 'Project · WATCH', x: 0.3, y: 0.66, r: 11 },
  { id: 'q2', type: 'QPR', label: 'QPR · SKYLARK', meta: 'Declared 60%', x: 0.18, y: 0.85, r: 7 },
  { id: 'c2', type: 'SiteVerification', label: 'CV · SKYLARK', meta: 'Delivered 52%', x: 0.33, y: 0.85, r: 7 },
  // JDA / Divya peer (healthy) — bottom-right
  { id: 'jda', type: 'Developer', label: 'JDA PROJECTS', meta: 'Developer · rep 78', x: 0.83, y: 0.75, r: 10 },
  { id: 'p3', type: 'Project', label: 'DIVYA VILLAS', meta: 'Project · HEALTHY', x: 0.73, y: 0.68, r: 11 },
  { id: 'c3', type: 'SiteVerification', label: 'CV · DIVYA', meta: 'Delivered 88%', x: 0.87, y: 0.62, r: 7 },
  // Prestige peer (healthy) — top-left
  { id: 'prestige', type: 'Developer', label: 'PRESTIGE GROUP', meta: 'Developer · rep 91', x: 0.19, y: 0.24, r: 10 },
  { id: 'p4', type: 'Project', label: 'PRESTIGE LAKESIDE', meta: 'Project · HEALTHY', x: 0.28, y: 0.34, r: 11 },
  { id: 'e4', type: 'EscrowAccount', label: 'ESCROW · PRESTIGE', meta: 'Funded 81%', x: 0.13, y: 0.15, r: 7 },
]

export const GRAPH_EDGES: GraphEdge[] = [
  { from: 'ozone', to: 'p1', label: 'promotes', focus: true },
  { from: 'p1', to: 'par', label: 'sits-on', focus: true },
  { from: 'par', to: 'enc', label: 'has', focus: true },
  { from: 'par', to: 'lit', label: 'subject-of', focus: true },
  { from: 'ozone', to: 'lit', label: 'named-in', focus: true },
  { from: 'p1', to: 'qpr', label: 'filed', focus: true },
  { from: 'p1', to: 'cv', label: 'verified-by', focus: true },
  { from: 'p1', to: 'esc', label: 'funded-through', focus: true },
  { from: 'p1', to: 'apr', label: 'sanctioned-by', focus: true },
  { from: 'p1', to: 'unit', label: 'sold-as', focus: true },
  { from: 'qpr', to: 'cv', label: 'declared⟷delivered', hero: true, focus: true },
  { from: 'skylark', to: 'p2', label: 'promotes' },
  { from: 'p2', to: 'q2', label: 'filed' },
  { from: 'p2', to: 'c2', label: 'verified-by' },
  { from: 'q2', to: 'c2', label: 'gap', minihero: true },
  { from: 'jda', to: 'p3', label: 'promotes' },
  { from: 'p3', to: 'c3', label: 'verified-by' },
  { from: 'prestige', to: 'p4', label: 'promotes' },
  { from: 'p4', to: 'e4', label: 'funded-through' },
]

// The hero gap magnitude drives the live-wire intensity (design: −24 → full).
export const HERO_GAP = signalsFor('p1').gap            // 24
export const HERO_INTENSITY = Math.min(1, HERO_GAP / 24)
export const P1_SCORE = executionScore('p1')            // 41
