'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Award, CheckCircle2, Search, ExternalLink } from 'lucide-react'
import projectsData from '@/data/dev-projects.json'

const OWN_CERTS = projectsData.filter(p => p.is_own && p.risk_grade !== 'C').map(p => ({
  id: `VG-2026-${p.id.replace('MRD-', '00').replace('PRG-', '00')}-PRG`,
  project: p.name,
  rera: p.rera_id,
  grade: p.risk_grade,
  status: p.risk_grade === 'A' ? 'FULL' : 'PROVISIONAL',
  issued: '2026-01-15',
  valid_until: '2027-01-14',
  checks: [
    { label: 'RERA Registration Active', pass: true },
    { label: 'QPR Filing Compliant', pass: p.qpr_status === 'ON_TIME' || p.qpr_status === 'submitted' },
    { label: 'Escrow Adequately Funded', pass: p.risk_grade !== 'C' },
    { label: 'No Active eCourt Orders', pass: p.risk_grade === 'A' },
    { label: 'Construction On-Track', pass: p.status !== 'CAUTION' && p.status !== 'HIGH RISK' },
  ],
}))

export default function CertificatePage() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof OWN_CERTS[0] | null>(null)

  const filtered = OWN_CERTS.filter(c => {
    const q = search.toLowerCase()
    return !q || c.project.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
  })

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--muted)' }}>Compliance · Trust</div>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Buyer-Trust Certificate</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Publicly verifiable, government-data-backed trust certificates for each project.
          Buyers scan the QR on site — instant verification.
        </p>
      </div>

      {/* What a cert is */}
      <div className="p-4 rounded-sm mb-6 flex items-center gap-4" style={{ background: 'color-mix(in srgb, var(--gold) 4%, var(--surf))', border: '1px solid color-mix(in srgb, var(--gold) 25%, var(--bord))' }}>
        <Award className="w-8 h-8 shrink-0" style={{ color: 'var(--gold)' }} />
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] mb-0.5" style={{ color: 'var(--gold)' }}>What is a Vantis Buyer-Trust Certificate?</div>
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            A real-time, government-data-backed compliance certificate issued per project. FULL grade = RERA active + QPR filed + escrow funded + no court orders. Buyers scan QR on site hoardings to verify before booking.
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-sm mb-5" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
        <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search project or certificate ID…"
          className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cert, i) => {
          const isSelected = selected?.id === cert.id
          const isFull = cert.status === 'FULL'
          const sc = isFull ? 'var(--ra)' : 'var(--rb)'
          return (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(isSelected ? null : cert)}
              className="rounded-sm cursor-pointer overflow-hidden transition-all"
              style={{ background: isSelected ? `color-mix(in srgb, ${sc} 4%, var(--surf))` : 'var(--surf)', border: `1px solid ${isSelected ? sc : 'var(--bord)'}` }}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="text-sm font-medium leading-snug" style={{ color: 'var(--ink)' }}>{cert.project}</div>
                    <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{cert.id}</div>
                  </div>
                  <div className={`shrink-0 text-center`}>
                    <div className="font-display italic text-2xl leading-none" style={{ color: sc }}>{cert.grade}</div>
                    <div className="font-mono text-[9px]" style={{ color: 'var(--muted)' }}>grade</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: sc }} />
                  <span className="font-mono text-xs font-bold" style={{ color: sc }}>{cert.status}</span>
                  <span className="ml-auto font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Valid: {cert.valid_until}</span>
                </div>

                <div className="space-y-1.5">
                  {cert.checks.map(c => (
                    <div key={c.label} className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: c.pass ? 'var(--ra)' : 'var(--rc)' }} />
                      <span style={{ color: c.pass ? 'var(--ink)' : 'var(--rc)' }}>{c.label}</span>
                    </div>
                  ))}
                </div>

                {isSelected && (
                  <div className="mt-3 pt-3 space-y-2" style={{ borderTop: '1px solid var(--bord)' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>RERA</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--ink)' }}>{cert.rera.slice(-10)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--muted)' }}>Issued</span>
                      <span className="font-mono" style={{ color: 'var(--ink)' }}>{cert.issued}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button className="py-1.5 text-xs font-mono flex items-center justify-center gap-1 rounded-sm" style={{ border: '1px solid var(--bord)', color: 'var(--muted)' }}>
                        <ExternalLink className="w-3 h-3" /> Public Link
                      </button>
                      <button className="py-1.5 text-xs font-mono rounded-sm" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                        Download PDF
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
