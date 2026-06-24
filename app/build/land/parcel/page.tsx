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
          <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">Satellite Parcel View · Divya Villas, Mysuru</div>
          <div className="text-[9px] font-mono text-gray/50 uppercase">CARTOSAT-3A · 0.28m GSD · Jun 2024</div>
        </div>
        <svg viewBox="0 0 600 380" className="w-full max-w-2xl mx-auto rounded-sm" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="parcelScan" width="1" height="3" patternUnits="userSpaceOnUse">
              <rect width="1" height="1" fill="rgba(255,255,255,0.015)"/>
            </pattern>
            <pattern id="parcelMesh" width="15" height="15" patternUnits="userSpaceOnUse">
              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="0.4"/>
            </pattern>
          </defs>

          {/* Base earth / soil */}
          <rect width="600" height="380" fill="#2A1A0A"/>
          {/* Measurement mesh */}
          <rect width="600" height="380" fill="url(#parcelMesh)"/>

          {/* Surrounding vegetation — irregular blobs */}
          <ellipse cx="30" cy="50" rx="45" ry="55" fill="#1C2E12"/>
          <ellipse cx="20" cy="110" rx="28" ry="40" fill="#213818"/>
          <ellipse cx="35" cy="200" rx="32" ry="45" fill="#1C2E12"/>
          <ellipse cx="25" cy="310" rx="38" ry="50" fill="#213818"/>
          <ellipse cx="580" cy="40" rx="30" ry="40" fill="#1C2E12"/>
          <ellipse cx="590" cy="150" rx="22" ry="50" fill="#213818"/>
          <ellipse cx="580" cy="300" rx="28" ry="45" fill="#1C2E12"/>
          <ellipse cx="200" cy="12" rx="50" ry="18" fill="#1C2E12"/>
          <ellipse cx="400" cy="368" rx="60" ry="18" fill="#213818"/>
          <ellipse cx="500" cy="360" rx="40" ry="22" fill="#1C2E12"/>

          {/* Access road */}
          <rect x="318" y="55" width="250" height="28" fill="#3A3020" rx="1"/>
          <line x1="318" y1="69" x2="568" y2="69" stroke="#4A4030" strokeWidth="0.8" strokeDasharray="12 6" opacity="0.6"/>
          <text x="440" y="74" textAnchor="middle" fill="#5A5848" fontSize="8" fontFamily="monospace">MYSURU–HUNSUR ROAD</text>

          {/* Survey 83/2 — cleared + construction (1.2 acres) */}
          <polygon points="80,78 282,58 302,240 88,262" fill="#7A5530"/>
          {/* Soil texture variation in 83/2 */}
          <ellipse cx="175" cy="150" rx="60" ry="40" fill="#6A4828" opacity="0.5"/>
          <ellipse cx="220" cy="100" rx="40" ry="22" fill="#845A38" opacity="0.35"/>
          {/* Building footprint in 83/2 — Divya Villas under construction */}
          <rect x="100" y="90" width="165" height="130" fill="#9A9488" rx="1"/>
          {/* Roof grid */}
          {[133, 166, 199, 232].map((x, i) => (
            <line key={`b${i}`} x1={x} y1="90" x2={x} y2="220" stroke="#7A7870" strokeWidth="0.7" opacity="0.55"/>
          ))}
          {[120, 150, 180, 210].map((y, i) => (
            <line key={`bh${i}`} x1="100" y1={y} x2="265" y2={y} stroke="#7A7870" strokeWidth="0.7" opacity="0.55"/>
          ))}
          {/* Building shadow */}
          <rect x="265" y="92" width="5" height="130" fill="#1A1008" opacity="0.55"/>
          <rect x="102" y="220" width="165" height="4" fill="#1A1008" opacity="0.45"/>
          {/* Remaining cleared land 83/2 */}
          <ellipse cx="150" cy="205" rx="30" ry="18" fill="#5C4A2E" opacity="0.7"/>

          {/* Survey 84/2 — lighter cleared / lower section (0.8 acres) */}
          <polygon points="302,240 88,262 98,342 312,322" fill="#7E5A36"/>
          {/* Soil texture 84/2 */}
          <ellipse cx="195" cy="292" rx="55" ry="28" fill="#6E5030" opacity="0.45"/>
          {/* Site prep works */}
          <ellipse cx="145" cy="310" rx="32" ry="16" fill="#5C4A2E" opacity="0.75"/>
          <ellipse cx="255" cy="285" rx="24" ry="14" fill="#604E32" opacity="0.65"/>
          {/* Cleared strip (ongoing levelling) */}
          <rect x="110" y="268" width="185" height="12" fill="#8A7060" opacity="0.5" rx="1"/>

          {/* Project boundary overlay */}
          <polygon points="80,78 302,58 312,322 98,342 80,78" fill="none" stroke="#C9A84C" strokeWidth="2" strokeDasharray="10 4" opacity="0.9"/>

          {/* Survey 83/2 overlay */}
          <polygon points="80,78 282,58 302,240 88,262" fill="none" stroke="#2ECC71" strokeWidth="1.2" strokeDasharray="6 3" opacity="0.75"/>
          <text x="175" y="248" textAnchor="middle" fill="#2ECC71" fontSize="10" fontFamily="monospace">Sy. No. 83/2</text>
          <text x="175" y="260" textAnchor="middle" fill="#5A8A5A" fontSize="8" fontFamily="monospace">1.2 acres · EC clean</text>

          {/* Survey 84/2 overlay */}
          <polygon points="302,240 88,262 98,342 312,322" fill="none" stroke="#C9A84C" strokeWidth="1.2" strokeDasharray="6 3" opacity="0.75"/>
          <text x="195" y="308" textAnchor="middle" fill="#C9A84C" fontSize="10" fontFamily="monospace">Sy. No. 84/2</text>
          <text x="195" y="320" textAnchor="middle" fill="#8A7A50" fontSize="8" fontFamily="monospace">0.8 acres · mortgage cleared</text>

          {/* Project boundary label */}
          <text x="460" y="188" textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="monospace">Project</text>
          <text x="460" y="200" textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="monospace">Boundary</text>

          {/* Scan lines */}
          <rect width="600" height="380" fill="url(#parcelScan)"/>

          {/* CLEAN badge */}
          <rect x="7" y="7" width="100" height="18" rx="2" fill="rgba(46,204,113,0.18)" stroke="#2ECC71" strokeWidth="0.8"/>
          <text x="11" y="20" fontFamily="monospace" fontSize="9" fill="#2ECC71">✓ TITLE CLEAN</text>

          {/* North indicator */}
          <text x="566" y="26" fontFamily="monospace" fontSize="11" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
          <polygon points="566,30 563,42 566,38 569,42" fill="#C9A84C"/>
          <line x1="566" y1="42" x2="566" y2="47" stroke="#C9A84C" strokeWidth="1.2"/>

          {/* Scale bar */}
          <line x1="460" y1="368" x2="560" y2="368" stroke="#9090AA" strokeWidth="1"/>
          <line x1="460" y1="364" x2="460" y2="372" stroke="#9090AA" strokeWidth="1"/>
          <line x1="560" y1="364" x2="560" y2="372" stroke="#9090AA" strokeWidth="1"/>
          <text x="510" y="378" fontFamily="monospace" fontSize="7" fill="#9090AA" textAnchor="middle">50m</text>

          {/* Metadata */}
          <text x="7" y="374" fontFamily="monospace" fontSize="7" fill="#4A4A5A">13°22′14″N 76°38′42″E · CARTOSAT-3A · Bhoomi Sy. verified · Jun 2024</text>
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
