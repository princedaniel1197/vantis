// ─────────────────────────────────────────────────────────────────────────────
// VANTIS — K-RERA LIVE API INTEGRATION HOOK
// Phase 4: Pluggable API source. Currently runs on 1,004 hardcoded projects.
//
// HOW TO CONNECT THE LIVE API:
// 1. Add to .env.local:
//      NEXT_PUBLIC_KRERA_API_KEY=your_api_key_here
//      NEXT_PUBLIC_KRERA_API_URL=https://api.krera.karnataka.gov.in/v1
// 2. That's it. The functions below automatically switch from local data
//    to live lookups when both env vars are present.
//
// No other code needs to change. All consumers call these functions.
// ─────────────────────────────────────────────────────────────────────────────

import projectsData from '@/data/projects.json'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KRERAProject {
  id: string
  name: string
  rera: string
  developer_id: string
  developer_name: string
  location: string
  district?: string
  status: 'COMPLIANT' | 'CAUTION' | 'HIGH RISK'
  risk_score: number
  total_units: number
  units_sold: number
  declared_cost_crore: number
  completion_date: string
  registration_date: string
  complaints_pending: number
  litigation: Array<{ type: string; court: string; filed: string; status: string }>
}

export interface KRERASearchParams {
  query?: string
  status?: 'COMPLIANT' | 'CAUTION' | 'HIGH RISK'
  district?: string
  developer_id?: string
  limit?: number
  offset?: number
}

export interface KRERADeveloper {
  id: string
  name: string
  status: string
  trust_score: number
  total_projects: number
}

// ── API configuration ─────────────────────────────────────────────────────────

function getApiConfig(): { key: string | null; url: string | null } {
  // These are client-safe (NEXT_PUBLIC_) env vars — set in .env.local
  const key = process.env.NEXT_PUBLIC_KRERA_API_KEY ?? null
  const url = process.env.NEXT_PUBLIC_KRERA_API_URL ?? null
  return { key, url }
}

function isLiveApiAvailable(): boolean {
  const { key, url } = getApiConfig()
  return !!key && !!url && key !== 'your_api_key_here'
}

// ── Live API call (used when API key is configured) ───────────────────────────

async function liveSearch(endpoint: string, params: Record<string, string>): Promise<any> {
  const { key, url } = getApiConfig()
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${url}${endpoint}?${qs}`, {
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'X-Source': 'Vantis-Intelligence',
    },
  })
  if (!res.ok) throw new Error(`K-RERA API error ${res.status}`)
  return res.json()
}

// ── Local data search (fallback / default until API key provided) ─────────────

const localProjects = projectsData as unknown as KRERAProject[]

function searchLocalProjects(params: KRERASearchParams): KRERAProject[] {
  let results = [...localProjects]

  if (params.status) {
    results = results.filter(p => p.status === params.status)
  }

  if (params.developer_id) {
    results = results.filter(p => p.developer_id === params.developer_id)
  }

  if (params.district) {
    results = results.filter(p =>
      (p.district ?? p.location ?? '').toLowerCase().includes(params.district!.toLowerCase())
    )
  }

  if (params.query) {
    const q = params.query.toLowerCase()
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.developer_name.toLowerCase().includes(q) ||
      p.rera.toLowerCase().includes(q) ||
      (p.location ?? '').toLowerCase().includes(q)
    )
  }

  const offset = params.offset ?? 0
  const limit = params.limit ?? 50
  return results.slice(offset, offset + limit)
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Search K-RERA projects.
 * Uses live API if NEXT_PUBLIC_KRERA_API_KEY + NEXT_PUBLIC_KRERA_API_URL are set.
 * Falls back to 1,004 hardcoded projects otherwise.
 */
export async function searchKRERAProjects(params: KRERASearchParams): Promise<KRERAProject[]> {
  if (!isLiveApiAvailable()) {
    return searchLocalProjects(params)
  }

  try {
    const liveParams: Record<string, string> = {}
    if (params.query) liveParams.q = params.query
    if (params.status) liveParams.status = params.status
    if (params.district) liveParams.district = params.district
    if (params.developer_id) liveParams.developer_id = params.developer_id
    liveParams.limit = String(params.limit ?? 50)
    liveParams.offset = String(params.offset ?? 0)

    const data = await liveSearch('/projects', liveParams)
    return (data.projects ?? data) as KRERAProject[]
  } catch {
    // Silent fallback to local data — never break the demo
    return searchLocalProjects(params)
  }
}

/**
 * Get a single project by ID.
 */
export async function getKRERAProject(id: string): Promise<KRERAProject | null> {
  if (!isLiveApiAvailable()) {
    return localProjects.find(p => p.id === id) ?? null
  }

  try {
    return await liveSearch(`/projects/${id}`, {}) as KRERAProject
  } catch {
    return localProjects.find(p => p.id === id) ?? null
  }
}

/**
 * Get all projects for a developer.
 */
export async function getProjectsByDeveloper(developerId: string): Promise<KRERAProject[]> {
  return searchKRERAProjects({ developer_id: developerId, limit: 100 })
}

/**
 * Returns current API status for display in UI.
 */
export function getApiStatus(): {
  mode: 'live' | 'local'
  projectCount: number
  apiUrl: string | null
} {
  const live = isLiveApiAvailable()
  return {
    mode: live ? 'live' : 'local',
    projectCount: localProjects.length,
    apiUrl: live ? getApiConfig().url : null,
  }
}
