'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, BarChart2, Building2, Clock, Scale, Users, ChevronRight } from 'lucide-react'
import KarnatakaMap, { DISTRICTS } from '@/components/shared/KarnatakaMap'
import projectsData from '@/data/projects.json'
import litigationData from '@/data/litigation.json'
import qprData from '@/data/qpr.json'

interface Project {
  id: string
  name: string
  developer_name: string
  location: string
  status: string
  risk_score: number
  complaints_pending: number
}

interface LitigationItem {
  id: string
  project_name: string
  developer_name: string
  type: string
  court: string
  filed_date: string
  severity: string
}

interface District {
  id: string
  label: string
  risk: string
  projects: string[]
}

const KPIs = [
  { label: 'Total Projects',      value: '8,357', icon: Building2,     color: 'text-gold',       sub: 'K-RERA registered' },
  { label: 'Distressed Projects', value: '234',   icon: AlertTriangle, color: 'text-red',        sub: 'High risk flagged' },
  { label: 'QPR Defaulters',      value: '891',   icon: BarChart2,     color: 'text-amber',      sub: 'Missed this quarter' },
  { label: 'Litigation Alerts',   value: '47',    icon: Scale,         color: 'text-red',        sub: 'Active court cases' },
  { label: 'Pending Complaints',  value: '1,243', icon: Users,         color: 'text-amber',      sub: 'Awaiting resolution' },
]

function statusColor(s: string) {
  if (s === 'COMPLIANT') return 'text-green'
  if (s === 'CAUTION')   return 'text-amber'
  return 'text-red'
}
function statusDot(s: string) {
  if (s === 'COMPLIANT') return 'bg-green'
  if (s === 'CAUTION')   return 'bg-amber'
  return 'bg-red'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function qprKey(quarter: string) {
  return quarter.toLowerCase().replace(' ', '_')
}

export default function GovernCommandCentre() {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)

  const projects = projectsData as Project[]

  const districtProjects = selectedDistrict
    ? projects.filter(p => selectedDistrict.projects.includes(p.id))
    : []

  // Critical alert projects (HIGH RISK)
  const criticalProjects = projects.filter(p => p.status === 'HIGH RISK')

  // QPR default projects
  const qprDefaulters = qprData.submissions
    .filter(s => {
      const lastKey = qprKey(qprData.quarters[qprData.quarters.length - 1])
      const entry = s[lastKey as keyof typeof s] as { status: string } | undefined
      return entry?.status === 'MISSED'
    })
    .map(s => projects.find(p => p.id === s.project_id))
    .filter(Boolean) as Project[]

  // Active litigation
  const activeLitigation = (litigationData as LitigationItem[]).filter(l => l.severity === 'CRITICAL' || l.severity === 'HIGH')

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white">Command Centre</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-gray" />
            <span className="text-gray text-xs">Data as of 12 May 2026 · Updated daily from K-RERA</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
          <span className="text-green text-xs">Live</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {KPIs.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-surface border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray text-xs leading-tight">{label}</span>
              <Icon className={`w-4 h-4 ${color} shrink-0`} />
            </div>
            <div className={`font-syne text-2xl sm:text-3xl font-bold ${color}`}>{value}</div>
            <div className="text-gray text-xs mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Map + District Panel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-[10px] text-gray uppercase tracking-[0.15em]">Karnataka District Map</h2>
          <span className="text-gray text-xs">Click a district to view projects</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Map */}
          <div className="lg:col-span-3 bg-surface border border-border rounded-sm p-4">
            <KarnatakaMap
              selectedDistrict={selectedDistrict?.id ?? null}
              onDistrictClick={d => setSelectedDistrict(d as District)}
            />
          </div>

          {/* District info panel */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-sm p-4 flex flex-col">
            {!selectedDistrict ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <div className="text-gray-light text-sm mb-1">Select a district</div>
                  <div className="text-gray text-xs">Click any district on the map to see registered projects and risk status.</div>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-syne text-base text-off-white">{selectedDistrict.label}</div>
                    <div className="text-gray text-xs mt-0.5">{districtProjects.length} project{districtProjects.length !== 1 ? 's' : ''} in database</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs ${
                    selectedDistrict.risk === 'high-risk' ? 'text-red' :
                    selectedDistrict.risk === 'caution'   ? 'text-amber' :
                    'text-green'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      selectedDistrict.risk === 'high-risk' ? 'bg-red' :
                      selectedDistrict.risk === 'caution'   ? 'bg-amber' :
                      'bg-green'
                    }`} />
                    {selectedDistrict.risk === 'high-risk' ? 'HIGH RISK' : selectedDistrict.risk.toUpperCase()}
                  </span>
                </div>

                {districtProjects.length === 0 ? (
                  <div className="text-gray text-sm text-center py-8">No projects in current database for this district.</div>
                ) : (
                  <div className="space-y-3">
                    {districtProjects.map(p => (
                      <Link
                        key={p.id}
                        href={`/govern/projects/${p.id}`}
                        className="block bg-background border border-border hover:border-gold rounded-sm p-3 transition-colors duration-150 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-off-white text-sm font-medium group-hover:text-gold transition-colors duration-150">{p.name}</div>
                            <div className="text-gray text-xs mt-0.5">{p.developer_name}</div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 text-xs shrink-0 ${statusColor(p.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot(p.status)}`} />
                            {p.status === 'HIGH RISK' ? 'HIGH RISK' : p.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray text-xs">Risk Score</span>
                            <span className={`font-mono text-xs font-bold ${
                              p.risk_score >= 70 ? 'text-green' : p.risk_score >= 40 ? 'text-amber' : 'text-red'
                            }`}>{p.risk_score}</span>
                          </div>
                          {p.complaints_pending > 0 && (
                            <div className="text-xs text-amber">{p.complaints_pending} complaint{p.complaints_pending > 1 ? 's' : ''}</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSelectedDistrict(null)}
                  className="mt-4 text-xs text-gray hover:text-gold transition-colors duration-150"
                >
                  ← Clear selection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Feeds */}
      <div className="mb-6">
        <h2 className="font-mono text-[10px] text-gray uppercase tracking-[0.15em] mb-4">Live Feeds</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Feed 1: Critical Alerts */}
          <div className="bg-surface border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red" />
                <span className="font-syne text-sm text-off-white">Critical Alerts</span>
              </div>
              <span className="text-xs font-mono text-red bg-red/10 border border-red/20 px-2 py-0.5 rounded-sm">{criticalProjects.length}</span>
            </div>
            <div className="space-y-2.5">
              {criticalProjects.map(p => (
                <Link key={p.id} href={`/govern/projects/${p.id}`} className="block group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-off-white group-hover:text-gold transition-colors duration-150 truncate">{p.name}</span>
                    <ChevronRight className="w-3 h-3 text-gray shrink-0" />
                  </div>
                  <div className="text-gray text-xs mt-0.5">{p.complaints_pending} complaints pending</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Feed 2: QPR Defaults */}
          <div className="bg-surface border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber" />
                <span className="font-syne text-sm text-off-white">QPR Defaults</span>
              </div>
              <span className="text-xs font-mono text-amber bg-amber/10 border border-amber/20 px-2 py-0.5 rounded-sm">{qprDefaulters.length}</span>
            </div>
            <div className="space-y-2.5">
              {qprDefaulters.map(p => (
                <Link key={p.id} href={`/govern/projects/${p.id}`} className="block group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-off-white group-hover:text-gold transition-colors duration-150 truncate">{p.name}</span>
                    <ChevronRight className="w-3 h-3 text-gray shrink-0" />
                  </div>
                  <div className="text-gray text-xs mt-0.5">Q1 2026 — Missed</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Feed 3: Active Litigation */}
          <div className="bg-surface border border-border rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-red" />
                <span className="font-syne text-sm text-off-white">Active Litigation</span>
              </div>
              <span className="text-xs font-mono text-red bg-red/10 border border-red/20 px-2 py-0.5 rounded-sm">{activeLitigation.length}</span>
            </div>
            <div className="space-y-2.5">
              {activeLitigation.map(l => (
                <div key={l.id}>
                  <div className="text-xs text-off-white truncate">{l.project_name}</div>
                  <div className="text-gray text-xs mt-0.5">{l.type} · {l.court.split(' ').slice(0, 3).join(' ')}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
