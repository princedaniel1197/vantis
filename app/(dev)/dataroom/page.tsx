'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Code2, Package, Lock } from 'lucide-react'
import projectsData from '@/data/dev-projects.json'

type Project = typeof projectsData[0]
const PROJECTS = projectsData as Project[]

const API_RESPONSE = (p: Project) => JSON.stringify({
  "vantis_data_room": {
    "version": "2.1",
    "generated_at": new Date().toISOString(),
    "project_id": p.id,
    "project_name": p.name,
    "developer": p.developer_name,
    "rera_id": p.rera_id,
    "risk_grade": p.risk_grade,
    "risk_score": p.risk_score,
    "title_verification": {
      "source": "Kaveri 2.0",
      "status": p.risk_grade === 'A' ? "CLEAR" : p.risk_grade === 'B' ? "ENCUMBRANCE_MINOR" : "ENCUMBRANCE_MAJOR",
      "last_checked": "2025-12-15T08:30:00Z",
      "ka_area_acres": p.ka_area_acres
    },
    "rera_compliance": {
      "source": "K-RERA",
      "registration_valid": p.rera_expiry > "2026-01-01",
      "rera_expiry": p.rera_expiry,
      "qpr_status": p.qpr_status,
      "qpr_penalty_lakh": p.qpr_penalty_lakh
    },
    "litigation": {
      "source": "eCourts + NCLT",
      "active_cases": p.litigation_count,
      "risk_level": p.litigation_count === 0 ? "CLEAN" : p.litigation_count <= 2 ? "MEDIUM" : "HIGH"
    },
    "financial": {
      "units_total": p.units_total,
      "units_sold": p.units_sold,
      "sold_pct": Math.round(p.units_sold / p.units_total * 100),
      "guidance_sqft": p.guidance_sqft,
      "market_sqft": p.market_sqft
    },
    "flags": p.flags
  }
}, null, 2)

const DOCS_MATRIX = [
  { label: 'RERA Registration',   source: 'K-RERA',   key: 'rera' },
  { label: 'Title Deed (Kaveri)', source: 'Kaveri 2.0', key: 'title' },
  { label: 'eCourts Clearance',   source: 'eCourts',  key: 'courts' },
  { label: 'BBMP Approval',       source: 'BBMP',     key: 'bbmp' },
  { label: 'Bhoomi Land Records', source: 'Bhoomi',   key: 'bhoomi' },
  { label: 'EC Certificate',      source: 'MoEFCC',   key: 'ec' },
]

export default function DataRoomPage() {
  const [selected, setSelected] = useState<Project | null>(null)
  const [view, setView] = useState<'ui' | 'api'>('ui')
  const [building, setBuilding] = useState(false)
  const [built, setBuilt] = useState(false)

  async function buildRoom(p: Project) {
    setSelected(p)
    setBuilt(false)
    setBuilding(true)
    await new Promise(r => setTimeout(r, 2000))
    setBuilding(false)
    setBuilt(true)
  }

  const docStatus = (p: Project, key: string) => {
    if (p.risk_grade === 'A') return true
    if (p.risk_grade === 'B') return key !== 'courts' && key !== 'title'
    return key === 'rera' || key === 'bhoomi'
  }

  return (
    <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: 'var(--muted)' }}>Lender Data Room · One-Click Government-Verified Package</div>
        <h1 className="font-display text-4xl italic mb-1" style={{ color: 'var(--ink)' }}>Everything a lender needs. In 30 seconds.</h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Auto-assemble verified data rooms from K-RERA, Kaveri, eCourts, BBMP, and Bhoomi. Deliver via UI or JSON API to your lender's system.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project list */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--muted)' }}>Select Project</div>
          <div className="space-y-2">
            {PROJECTS.filter(p => p.is_own).map(p => (
              <button
                key={p.id}
                onClick={() => buildRoom(p)}
                className="w-full text-left px-3 py-3 rounded-sm transition-colors"
                style={{
                  background: selected?.id === p.id ? 'color-mix(in srgb, var(--gold) 10%, var(--surf))' : 'var(--surf)',
                  border: `1px solid ${selected?.id === p.id ? 'var(--gold)' : 'var(--bord)'}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm" style={{ color: 'var(--ink)' }}>{p.name}</div>
                  <span className="font-display italic text-sm font-bold" style={{ color: p.risk_grade === 'A' ? 'var(--ra)' : p.risk_grade === 'B' ? 'var(--rb)' : 'var(--rc)' }}>
                    {p.risk_grade}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>{p.micro_market}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Room */}
        <div className="lg:col-span-2">
          {!selected && !building && (
            <div className="flex flex-col items-center justify-center h-64 rounded-sm" style={{ border: '1px dashed var(--bord)', color: 'var(--muted)' }}>
              <Package className="w-8 h-8 mb-3" />
              <span className="text-sm">Select a project to build data room</span>
            </div>
          )}

          {building && (
            <div className="p-6 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--muted)' }}>
                Assembling data room…
              </div>
              <div className="space-y-3">
                {DOCS_MATRIX.map((d, i) => (
                  <motion.div
                    key={d.key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.28 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.28 + 0.1 }}
                      className="w-3 h-3 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                    <div className="text-sm" style={{ color: 'var(--ink)' }}>{d.label}</div>
                    <div className="text-xs font-mono ml-auto" style={{ color: 'var(--muted)' }}>{d.source}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {built && selected && !building && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Tab bar */}
                <div className="flex gap-3 mb-4" style={{ borderBottom: '1px solid var(--bord)' }}>
                  {(['ui', 'api'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className="pb-2.5 text-xs font-mono uppercase tracking-[0.1em]"
                      style={{
                        color: view === v ? 'var(--gold)' : 'var(--muted)',
                        borderBottom: view === v ? '2px solid var(--gold)' : '2px solid transparent',
                      }}
                    >
                      {v === 'ui' ? 'Lender View' : 'JSON API'}
                    </button>
                  ))}
                </div>

                {/* UI view */}
                {view === 'ui' && (
                  <div className="rounded-sm overflow-hidden" style={{ border: '1px solid var(--gold)' }}>
                    <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--gold) 8%, var(--surf))', borderBottom: '1px solid var(--bord)' }}>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--gold)' }}>Vantis Verified Data Room</div>
                        <div className="text-sm mt-0.5" style={{ color: 'var(--ink)' }}>{selected.name}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--ra)' }}>
                        <Lock className="w-3.5 h-3.5" />
                        Govt-verified
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div>
                          <div className="font-mono text-[10px] uppercase" style={{ color: 'var(--muted)' }}>Risk Grade</div>
                          <div className="font-display italic text-3xl" style={{ color: selected.risk_grade === 'A' ? 'var(--ra)' : selected.risk_grade === 'B' ? 'var(--rb)' : 'var(--rc)' }}>{selected.risk_grade}</div>
                        </div>
                        <div>
                          <div className="font-mono text-[10px] uppercase" style={{ color: 'var(--muted)' }}>RERA Expiry</div>
                          <div className="font-mono text-sm mt-1" style={{ color: 'var(--ink)' }}>{selected.rera_expiry}</div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        {DOCS_MATRIX.map(d => {
                          const ok = docStatus(selected, d.key)
                          return (
                            <div key={d.key} className="flex items-center gap-3">
                              {ok ? (
                                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--ra)' }} />
                              ) : (
                                <XCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--rc)' }} />
                              )}
                              <div className="flex-1 text-sm" style={{ color: 'var(--ink)' }}>{d.label}</div>
                              <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{d.source}</div>
                              <div className="text-xs font-mono" style={{ color: ok ? 'var(--ra)' : 'var(--rc)' }}>{ok ? 'Verified' : 'Flag'}</div>
                            </div>
                          )
                        })}
                      </div>
                      {selected.flags.length > 0 && (
                        <div className="px-3 py-2.5 rounded-sm text-xs" style={{ background: 'color-mix(in srgb, var(--rc) 8%, var(--surf2))', border: '1px solid color-mix(in srgb, var(--rc) 25%, transparent)', color: 'var(--rc)' }}>
                          {selected.flags.map((f, i) => <div key={i}>⚠ {f}</div>)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* API view */}
                {view === 'api' && (
                  <div className="rounded-sm overflow-hidden" style={{ border: '1px solid var(--bord)' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'var(--surf2)', borderBottom: '1px solid var(--bord)' }}>
                      <Code2 className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                      <span className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted)' }}>GET /api/v2/dataroom/{selected.id}</span>
                    </div>
                    <pre className="px-4 py-4 text-xs leading-relaxed overflow-auto max-h-[420px] whitespace-pre-wrap" style={{ color: 'var(--muted)', fontFamily: 'var(--font-dm-mono)' }}>
                      {API_RESPONSE(selected)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
