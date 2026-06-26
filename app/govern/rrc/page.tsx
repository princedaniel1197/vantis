'use client'

import { AlertTriangle, Shield } from 'lucide-react'
import Link from 'next/link'

type RRCStatus = 'ISSUED' | 'ACKNOWLEDGED' | 'IN_RECOVERY' | 'RECOVERED'

interface RRCCard {
  id: string
  project_id: string
  project_name: string
  developer: string
  amount_lakh: number
  issued_date: string
  status: RRCStatus
  progress_pct: number
  recovered_lakh: number
  alert?: string
  linked_notice: string
}

const RRCS: RRCCard[] = [
  {
    id: 'RRC-2026-001',
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    developer: 'Ozone Group',
    amount_lakh: 45.75,
    issued_date: '2026-04-11',
    status: 'ISSUED',
    progress_pct: 0,
    recovered_lakh: 0,
    alert: 'Unacknowledged — 32 days',
    linked_notice: 'KRERA/SCN/2026/0047',
  },
  {
    id: 'RRC-2026-002',
    project_id: 'skylark-arcadia',
    project_name: 'Skylark Arcadia',
    developer: 'Skylark Constructions',
    amount_lakh: 2.25,
    issued_date: '2026-04-22',
    status: 'ACKNOWLEDGED',
    progress_pct: 0,
    recovered_lakh: 0,
    linked_notice: 'KRERA/SCN/2026/0051',
  },
  {
    id: 'RRC-2024-003',
    project_id: 'ozone-urbana',
    project_name: 'Ozone Urbana',
    developer: 'Ozone Group',
    amount_lakh: 0.20,
    issued_date: '2024-11-08',
    status: 'RECOVERED',
    progress_pct: 100,
    recovered_lakh: 0.20,
    linked_notice: 'KRERA/SCN/2024/0198',
  },
]

const STATUS_CONFIG: Record<RRCStatus, { label: string; textColor: string; dotBg: string; bar: string }> = {
  ISSUED:       { label: 'Issued',       textColor: 'text-gray-light', dotBg: 'bg-gray',  bar: 'bg-gray'  },
  ACKNOWLEDGED: { label: 'Acknowledged', textColor: 'text-blue',       dotBg: 'bg-blue',  bar: 'bg-blue'  },
  IN_RECOVERY:  { label: 'In Recovery',  textColor: 'text-amber',      dotBg: 'bg-amber', bar: 'bg-amber' },
  RECOVERED:    { label: 'Recovered',    textColor: 'text-green',      dotBg: 'bg-green', bar: 'bg-green' },
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function RRCTracker() {
  const totalOutstanding = RRCS.filter(r => r.status !== 'RECOVERED').reduce((s, r) => s + r.amount_lakh, 0)
  const recoveredThisQtr = 0

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-1">GOVERN · ENFORCEMENT</div>
          <h1 className="font-syne text-2xl sm:text-3xl text-off-white font-bold">RRC Tracker</h1>
          <p className="text-gray text-xs mt-1">Revenue Recovery Certificate proceedings</p>
        </div>
        <Shield className="w-6 h-6 text-gray hidden sm:block" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface border border-border rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-off-white">{RRCS.length}</div>
          <div className="text-gray text-xs mt-1">Active RRCs</div>
        </div>
        <div className="bg-surface border border-red/20 rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-red">₹{totalOutstanding.toFixed(2)} L</div>
          <div className="text-gray text-xs mt-1">Outstanding</div>
        </div>
        <div className="bg-surface border border-green/20 rounded-sm p-4 text-center">
          <div className="font-syne text-3xl font-bold text-green">₹{recoveredThisQtr}</div>
          <div className="text-gray text-xs mt-1">Recovered This Quarter</div>
        </div>
      </div>

      {/* RRC Cards */}
      <div className="space-y-4 mb-6">
        {RRCS.map(rrc => {
          const cfg = STATUS_CONFIG[rrc.status]
          return (
            <div
              key={rrc.id}
              className={`bg-surface border rounded-sm p-5 ${
                rrc.status === 'ISSUED' && rrc.alert ? 'border-red/30' :
                rrc.status === 'RECOVERED' ? 'border-green/20' :
                'border-border'
              }`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] text-gold tracking-[0.1em]">{rrc.id}</span>
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-mono ${cfg.textColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotBg}`} />
                      {cfg.label}
                    </span>
                    {rrc.alert && (
                      <span className="flex items-center gap-1 text-[10px] text-red">
                        <AlertTriangle className="w-3 h-3" />
                        {rrc.alert}
                      </span>
                    )}
                  </div>
                  <div className="text-off-white text-sm font-medium">{rrc.project_name}</div>
                  <div className="text-gray text-xs">{rrc.developer}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-syne text-2xl font-bold ${rrc.status === 'RECOVERED' ? 'text-green' : 'text-red'}`}>
                    ₹{rrc.amount_lakh.toFixed(2)} L
                  </div>
                  <div className="text-gray text-[10px]">Total Amount</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Recovery Progress</span>
                  <span className={`font-mono text-xs font-bold ${rrc.status === 'RECOVERED' ? 'text-green' : 'text-gray-light'}`}>
                    {rrc.progress_pct}%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                    style={{ width: `${rrc.progress_pct}%` }}
                  />
                </div>
                {rrc.status === 'RECOVERED' && (
                  <div className="text-green text-[10px] mt-1">
                    ₹{rrc.recovered_lakh.toFixed(2)} Lakh recovered
                  </div>
                )}
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">Issued Date</div>
                  <div className="text-xs text-off-white">{fmtDate(rrc.issued_date)}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray mb-0.5">Linked Notice</div>
                  <div className="font-mono text-xs text-gold-dim">{rrc.linked_notice}</div>
                </div>
                <div className="sm:text-right">
                  <Link
                    href={`/govern/projects/${rrc.project_id}`}
                    className="text-xs text-gray hover:text-gold transition-colors duration-150"
                  >
                    View Project →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom callout */}
      <div className="border-l-2 border-gold pl-4 bg-surface rounded-sm p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold mb-1">Auto-Escalation Policy</div>
            <div className="text-off-white text-sm leading-relaxed">
              RRCs unacknowledged for <strong>30 days</strong> are automatically escalated to the District Collector's
              office for coercive recovery. RRC-2026-001 is currently <strong className="text-red">2 days from auto-escalation</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
