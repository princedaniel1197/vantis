'use client'

import { CheckCircle2, Shield } from 'lucide-react'

export default function AssurancePage() {
  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Vantis Assurance</h1>
        <p className="text-gray text-sm mt-0.5">Platform-backed certificates of due diligence for lender compliance files.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Certificates Issued',    value: '312',   color: '#C9A84C' },
          { label: 'Average Turnaround',     value: '4 hrs',  color: '#2ECC71' },
          { label: 'Regulatory Challenges',  value: '0',      color: '#2ECC71' },
        ].map(k => (
          <div key={k.label} className="bg-surface border border-border rounded-sm px-4 py-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray mb-1">{k.label}</div>
            <div className="font-syne text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Certificate — light background document */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-sm p-8 max-w-xl w-full" style={{ border: '2px solid #C9A84C' }}>
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-6 h-6" style={{ color: '#C9A84C' }} />
              <span className="font-syne text-2xl text-gray-900 font-bold tracking-tight">CERTIFICATE OF ASSURANCE</span>
              <Shield className="w-6 h-6" style={{ color: '#C9A84C' }} />
            </div>
            <div className="text-xs text-gray-500 font-mono">Ref: VAS-2024-DV-00341</div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">Issued by Orianode Technologies Private Limited · Powered by Vantis</div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed mb-6" style={{ borderColor: '#C9A84C' }} />

          {/* Policy details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Project',          value: 'Divya Villas' },
              { label: 'Developer',        value: 'MRD Developers Pvt Ltd' },
              { label: 'RERA Number',      value: 'PRM/KA/RERA/1251/308' },
              { label: 'Assurance Type',   value: 'Full Due Diligence' },
              { label: 'Valid Until',      value: '30 Sep 2024' },
              { label: 'Issued On',        value: '20 Jun 2024' },
            ].map(f => (
              <div key={f.label}>
                <div className="text-[9px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-0.5">{f.label}</div>
                <div className="text-sm font-medium text-gray-800">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Verified items */}
          <div className="mb-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-gray-400 mb-3">Items Verified</div>
            <div className="space-y-2">
              {[
                'RERA Registration & QPR Currency',
                'Kaveri 2.0 Encumbrance Screen (Sy. No. 114)',
                'eCourts Litigation Screen — 0 cases',
                'Escrow Compliance — 82% (mandate 70%)',
                'CV-Observed Progress Match ≤5pt gap',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#2ECC71' }} />
                  <span className="text-xs text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stamps row */}
          <div className="flex justify-around items-center border-t-2 pt-6" style={{ borderColor: '#C9A84C' }}>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center mx-auto mb-2"
                style={{ border: '3px solid #2ECC71' }}
              >
                <CheckCircle2 className="w-7 h-7" style={{ color: '#2ECC71' }} />
                <div className="text-[7px] font-mono font-bold mt-0.5" style={{ color: '#2ECC71' }}>VERIFIED</div>
              </div>
              <div className="text-[9px] text-gray-500 font-mono">Vantis Platform</div>
              <div className="text-[8px] text-gray-400 font-mono">Digital Seal</div>
            </div>
            <div className="text-center">
              <div
                className="w-20 h-20 rounded-full flex flex-col items-center justify-center mx-auto mb-2"
                style={{ border: '3px solid #C9A84C' }}
              >
                <Shield className="w-7 h-7" style={{ color: '#C9A84C' }} />
                <div className="text-[7px] font-mono font-bold mt-0.5" style={{ color: '#C9A84C' }}>ASSURED</div>
              </div>
              <div className="text-[9px] text-gray-500 font-mono">Orianode Technologies</div>
              <div className="text-[8px] text-gray-400 font-mono">Issuing Authority</div>
            </div>
          </div>

          <div className="text-center mt-4 text-[9px] text-gray-400 font-mono">
            This certificate is digitally issued and verifiable at vantis.orianode.com/verify/VAS-2024-DV-00341
          </div>
        </div>
      </div>

      {/* What is assurance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface border border-border rounded-sm p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">What Vantis Assurance covers</div>
          <div className="space-y-2">
            {[
              'RERA registration verification',
              'Kaveri 2.0 encumbrance screen',
              'eCourts litigation cross-check',
              'RERA escrow compliance status',
              'Computer-vision progress match',
              'Developer score & history',
            ].map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0" />
                <span className="text-xs text-gray-light">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-5">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Designed for RBI compliance</div>
          <p className="text-xs text-gray-light leading-relaxed mb-3">
            Vantis Assurance certificates are structured to satisfy RBI PFD 2025 requirements for third-party due diligence documentation in real estate project finance.
          </p>
          <p className="text-xs text-gray-light leading-relaxed">
            Each certificate is time-stamped, digitally signed, and references the specific data sources and verification dates — providing a complete audit trail for RBI inspection.
          </p>
        </div>
      </div>
    </div>
  )
}
