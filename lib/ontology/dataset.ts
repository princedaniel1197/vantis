// ── Full project dataset (server-only) ──
// Reads the REAL ~8,771-project file for true counts/search/stats and to sample
// density nodes for the graph. NOT re-exported from index.ts and imported only by
// the server page — so data/projects.json never enters the client bundle.
import projectsRaw from '@/data/projects.json'
import type { DensityNode } from './graph'

interface RawProject {
  id?: string; name?: string; rera?: string; developer_name?: string; district?: string; location?: string
}
const ALL = projectsRaw as unknown as RawProject[]

export const TOTAL_PROJECTS = ALL.length

export interface DatasetStats {
  total: number
  developers: number
  districts: number
  topDistricts: { name: string; count: number }[]
}

export function datasetStats(): DatasetStats {
  const devSet = new Set<string>()
  const distCount: Record<string, number> = {}
  for (const p of ALL) {
    if (p.developer_name) devSet.add(p.developer_name)
    const d = p.district || 'Unknown'
    distCount[d] = (distCount[d] || 0) + 1
  }
  const topDistricts = Object.entries(distCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 4)
    .map(([name, count]) => ({ name, count }))
  return { total: ALL.length, developers: devSet.size, districts: Object.keys(distCount).length, topDistricts }
}

// Deterministic phyllotaxis field of `n` real projects — dim density behind the
// bright Ozone hero subgraph. Positions are fractional (0..1), no RNG.
const GOLDEN = 2.399963229728653
export function buildDensityNodes(n: number): DensityNode[] {
  const step = Math.max(1, Math.floor(TOTAL_PROJECTS / n))
  const out: DensityNode[] = []
  for (let i = 0; i < n; i++) {
    const p = ALL[(i * step) % TOTAL_PROJECTS]
    const t = i / n
    const r = 0.07 + Math.sqrt(t) * 0.47
    const theta = i * GOLDEN
    const x = 0.5 + Math.cos(theta) * r * 0.66
    const y = 0.5 + Math.sin(theta) * r
    out.push({
      id: 'ds' + i,
      label: (p?.name || 'Project ' + i).slice(0, 42),
      meta: [p?.developer_name, p?.district].filter(Boolean).join(' · ') || 'K-RERA project',
      x, y,
    })
  }
  return out
}
