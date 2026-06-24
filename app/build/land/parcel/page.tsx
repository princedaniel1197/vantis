'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react'
import { resolveGovTruth } from '@/lib/gov-truth'

export default function ParcelPage() {
  const truth = resolveGovTruth('divya-villas')

  return (
    <div className="min-h-screen bg-background p-5 max-w-[900px] mx-auto">
      <Link
        href="/build"
        className="inline-flex items-center gap-1.5 text-gray hover:text-gold text-xs font-mono uppercase tracking-[0.08em] transition-colors mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Build Hub
      </Link>

      <div className="mb-6">
        <h1 className="font-syne text-2xl text-off-white">Parcel Intelligence</h1>
        <p className="text-gray text-sm mt-1">
          Survey boundary cross-checked against Bhoomi land records and Kaveri registration history.
        </p>
        <p className="text-xs text-gray-light mt-0.5">
          Project: Divya Villas (JDA Projects) · Sy. No. 83/2 and 84/2 · Mysuru
        </p>
      </div>

      {/* Schematic parcel map */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">
            Site Footprint Schematic
          </div>
          <div className="text-[9px] font-mono text-gray/50 uppercase">
            REPRESENTATIVE SCHEMATIC — NOT SATELLITE IMAGERY
          </div>
        </div>
        <svg
          viewBox="0 0 600 380"
          className="w-full max-w-2xl mx-auto rounded-sm"
          style={{ background: '#0A0A15' }}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1A1A28" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="600" height="380" fill="url(#grid)" />

          {/* Survey 83/2 */}
          <polygon
            points="80,80 280,60 300,240 90,260"
            fill="rgba(46,204,113,0.08)"
            stroke="#2ECC71"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          <text x="175" y="165" textAnchor="middle" fill="#2ECC71" fontSize="11" fontFamily="monospace">
            Sy. No. 83/2
          </text>
          <text x="175" y="179" textAnchor="middle" fill="#6B6B88" fontSize="9" fontFamily="monospace">
            1.2 acres · EC clean
          </text>

          {/* Survey 84/2 */}
          <polygon
            points="300,240 90,260 100,340 310,320"
            fill="rgba(201,168,76,0.06)"
            stroke="#C9A84C"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          <text x="195" y="300" textAnchor="middle" fill="#C9A84C" fontSize="11" fontFamily="monospace">
            Sy. No. 84/2
          </text>
          <text x="195" y="314" textAnchor="middle" fill="#6B6B88" fontSize="9" fontFamily="monospace">
            0.8 acres · mortgage cleared
          </text>

          {/* Project boundary */}
          <polygon
            points="80,80 300,60 310,320 100,340 80,80"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="2"
          />
          <text x="450" y="190" textAnchor="middle" fill="#C9A84C" fontSize="10" fontFamily="monospace">
            Project
          </text>
          <text x="450" y="204" textAnchor="middle" fill="#C9A84C" fontSize="10" fontFamily="monospace">
            Boundary
          </text>

          {/* Road */}
          <rect
            x="320" y="60" width="240" height="30"
            fill="rgba(107,107,136,0.15)"
            stroke="#3A3A5A"
            strokeWidth="1"
          />
          <text x="440" y="80" textAnchor="middle" fill="#6B6B88" fontSize="9" fontFamily="monospace">
            ACCESS ROAD
          </text>

          {/* North indicator */}
          <text x="560" y="30" textAnchor="middle" fill="#C9A84C" fontSize="14" fontWeight="bold">N</text>
          <line x1="560" y1="35" x2="560" y2="55" stroke="#C9A84C" strokeWidth="1.5" />
          <polygon points="556,55 560,65 564,55" fill="#C9A84C" />
        </svg>
      </div>

      {/* Government truth panel */}
      <div className="bg-surface border border-border rounded-sm p-5 mb-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">
          Government Truth — Divya Villas
        </div>
        <div className="space-y-3">
          {[
            {
              label:   'Title (Kaveri Registry)',
              verdict: truth.title.verdict === 'clean',
              detail:  truth.title.detail,
            },
            {
              label:   'RERA Registration (K-RERA)',
              verdict: truth.rera.verdict === 'registered',
              detail:  truth.rera.detail,
            },
            {
              label:   'Litigation (eCourts)',
              verdict: truth.litigation.verdict === 'none',
              detail:  truth.litigation.detail,
            },
          ].map(item => (
            <div
              key={item.label}
              className={`flex gap-3 p-3 rounded-sm border ${
                item.verdict ? 'bg-green/[0.06] border-green/25' : 'bg-red/[0.06] border-red/25'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {item.verdict
                  ? <CheckCircle2 className="w-4 h-4 text-green" />
                  : <AlertTriangle className="w-4 h-4 text-red" />
                }
              </div>
              <div>
                <div className="text-xs text-off-white font-medium mb-0.5">{item.label}</div>
                <div className="text-[10px] text-gray leading-relaxed">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gold mt-4 italic leading-relaxed">
          &quot;Before you buy, see the truth from space, cross-checked against the land record.&quot;
        </p>
      </div>

      {/* Findings */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Land Area (Bhoomi)', value: '2.0 acres',  ok: true, note: 'Matches EC records' },
          { label: 'Water Body',         value: 'None',       ok: true, note: 'No CRS/Waterbody overlap' },
          { label: 'Road Access',        value: 'Confirmed',  ok: true, note: '12m road frontage' },
          { label: 'Encroachment',       value: 'None',       ok: true, note: 'Survey boundary clear' },
        ].map(f => (
          <div key={f.label} className="bg-surface border border-border rounded-sm px-4 py-3">
            <div className="text-[9px] font-mono uppercase text-gray mb-1">{f.label}</div>
            <div className={`text-sm font-bold ${f.ok ? 'text-green' : 'text-red'}`}>{f.value}</div>
            <div className="text-[9px] text-gray mt-0.5">{f.note}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
