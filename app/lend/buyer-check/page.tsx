'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Shield, TrendingDown } from 'lucide-react'

const OZONE_FLAGS = [
  { title: 'Execution Lag',     detail: 'Developer has built 28% but claimed 43% in QPR filings. 15-point gap. Construction running ~18 months behind pace.' },
  { title: 'Escrow Breach',     detail: 'Only 54% of homebuyer collections deposited in RERA escrow vs 70% mandate. ₹8.4 Cr potentially unprotected.' },
  { title: 'Active Litigation', detail: '2 active court cases, including 1 consumer forum complaint by 12 homebuyers. Not disclosed in QPR.' },
  { title: 'QPR Non-Filing',    detail: 'Q3 2023 QPR not submitted to K-RERA. Developer cited "administrative delay" — 47 days overdue.' },
]

const DIVYA_CHECKS = [
  { label: 'RERA Registration',       status: 'PASS', detail: 'PRM/KA/RERA/1251/308 — active, no violations' },
  { label: 'QPR Filings Current',     status: 'PASS', detail: 'All 10 quarters filed on time. No overdue.' },
  { label: 'Escrow Compliance',       status: 'PASS', detail: '82% escrow maintained — above 70% mandate' },
  { label: 'Litigation Screen',       status: 'PASS', detail: 'No active court cases found in eCourts' },
  { label: 'Construction Progress',   status: 'PASS', detail: 'CV-observed 76% vs claimed 78% — within tolerance' },
  { label: 'Developer Score',         status: 'PASS', detail: 'Parent developer score 760/900 — Investment Grade' },
]

export default function BuyerCheckPage() {
  const [tab, setTab] = useState<'ozone-urbana' | 'divya-villas'>('ozone-urbana')

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Buyer Protection Check</h1>
        <p className="text-gray text-sm mt-0.5">Independent intelligence for homebuyers and their financiers. Not from the developer.</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 mb-6 bg-surface border border-border rounded-sm p-1 w-fit">
        {(['ozone-urbana', 'divya-villas'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-sm text-xs font-mono uppercase tracking-[0.08em] transition-colors"
            style={{
              background: tab === t ? 'rgba(201,168,76,0.12)' : 'transparent',
              color: tab === t ? '#C9A84C' : '#6B6B88',
            }}
          >
            {t === 'ozone-urbana' ? 'Ozone Urbana' : 'Divya Villas'}
          </button>
        ))}
      </div>

      {tab === 'ozone-urbana' ? (
        <>
          {/* Red banner */}
          <div className="bg-surface border border-red/30 rounded-sm p-5 mb-6">
            <div className="flex items-start gap-3">
              <TrendingDown className="w-10 h-10 text-red shrink-0" />
              <div>
                <div className="text-[9px] font-mono text-red uppercase tracking-[0.15em] mb-1">BUYER RISK ALERT — DO NOT PROCEED WITHOUT FULL DUE DILIGENCE</div>
                <h2 className="font-syne text-2xl text-red font-bold">Ozone Urbana</h2>
                <p className="text-gray-light text-sm mt-1 leading-relaxed">
                  Vantis has detected 4 significant risk factors for homebuyers in this project.
                  Lender disbursements to this project are currently on hold pending covenant resolution.
                </p>
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {OZONE_FLAGS.map((f, i) => (
              <div key={i} className="bg-surface border border-red/20 rounded-sm p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red shrink-0 mt-0.5" />
                  <span className="text-sm text-off-white font-medium">{f.title}</span>
                </div>
                <p className="text-xs text-gray leading-relaxed">{f.detail}</p>
              </div>
            ))}
          </div>

          {/* Homebuyer score */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Buyer Protection Score</div>
            <div className="flex items-center gap-4">
              <div className="font-syne text-6xl text-red font-bold">14</div>
              <div>
                <div className="text-gray text-xs">out of 100</div>
                <div className="text-red text-xs font-medium mt-0.5">Extremely High Risk</div>
                <div className="text-gray text-[10px] mt-0.5">Flagged Q3 2021 — 6 quarters before lender NPA</div>
              </div>
            </div>
            <div className="mt-4 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-red rounded-full" style={{ width: '14%' }} />
            </div>
          </div>

          <div className="px-4 py-3 bg-red/6 border border-red/20 rounded-sm">
            <p className="text-red text-xs font-medium mb-1">What Vantis recommends for homebuyers</p>
            <p className="text-gray-light text-xs leading-relaxed">
              (1) Do not make further payments until escrow compliance is confirmed with K-RERA.
              (2) Join the existing consumer complaint group (VB/CC/2023/1847) if possession is delayed.
              (3) Consult a RERA-registered legal professional before cancelling — cancellation penalties may apply.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Green banner */}
          <div className="bg-surface border border-green/30 rounded-sm p-5 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-10 h-10 text-green shrink-0" />
              <div>
                <div className="text-[9px] font-mono text-green uppercase tracking-[0.15em] mb-1">BUYER PROTECTION VERIFIED — SAFE TO PROCEED</div>
                <h2 className="font-syne text-2xl text-green font-bold">Divya Villas</h2>
                <p className="text-gray-light text-sm mt-1 leading-relaxed">
                  All Vantis checks passed. Developer compliant, progress verified, escrow maintained above mandate.
                </p>
              </div>
            </div>
          </div>

          {/* Green checklist */}
          <div className="bg-surface border border-border rounded-sm overflow-hidden mb-5">
            <div className="divide-y divide-border/50">
              {DIVYA_CHECKS.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs text-off-white font-medium">{c.label}</span>
                    <span className="text-[10px] text-gray ml-3">{c.detail}</span>
                  </div>
                  <span className="text-[9px] font-mono text-green px-1.5 py-0.5 rounded-sm bg-green/10">{c.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Buyer Protection Score</div>
            <div className="flex items-center gap-4">
              <div className="font-syne text-6xl text-green font-bold">91</div>
              <div>
                <div className="text-gray text-xs">out of 100</div>
                <div className="text-green text-xs font-medium mt-0.5">Low Risk — Recommended</div>
                <div className="text-gray text-[10px] mt-0.5">Stable score for 8 consecutive quarters</div>
              </div>
            </div>
            <div className="mt-4 h-2 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-green rounded-full" style={{ width: '91%' }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
