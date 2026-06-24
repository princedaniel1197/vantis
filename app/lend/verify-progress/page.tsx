'use client'

import { useState } from 'react'
import { Camera, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react'

const DIVERGENCE_DATA = [
  { q: 'Q1 2021', claimed: 20, observed: 20, flag: null },
  { q: 'Q2 2021', claimed: 32, observed: 31, flag: null },
  { q: 'Q3 2021', claimed: 43, observed: 28, flag: 'DIVERGENCE' },
  { q: 'Q4 2021', claimed: 52, observed: 31, flag: 'DIVERGENCE' },
  { q: 'Q1 2022', claimed: 58, observed: 30, flag: 'DIVERGENCE' },
  { q: 'Q2 2022', claimed: 63, observed: 30, flag: 'DIVERGENCE' },
  { q: 'Q3 2022', claimed: 68, observed: 29, flag: 'DIVERGENCE' },
  { q: 'Q4 2022', claimed: 72, observed: 28, flag: 'DIVERGENCE' },
]

const OZONE_PHOTOS = [
  { label: 'Block A – Ground Floor',  annotation: '⚠ IMAGE REUSED FROM Q2', hash: '97.4%', flagged: true },
  { label: 'Block B – 3rd Floor Slab', annotation: '⚠ IMAGE REUSED FROM Q2', hash: '94.1%', flagged: true },
  { label: 'Block C – Exterior',       annotation: '⚠ TIMESTAMP MISMATCH',    hash: '88.7%', flagged: true },
  { label: 'Site Entry Gate',          annotation: null,                       hash: null,    flagged: false },
  { label: 'Foundation Zone',          annotation: null,                       hash: null,    flagged: false },
  { label: 'Material Storage',         annotation: null,                       hash: null,    flagged: false },
]

export default function VerifyProgressPage() {
  const [tab, setTab] = useState<'ozone-urbana' | 'divya-villas'>('ozone-urbana')

  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">CV Progress Verification</h1>
        <p className="text-gray text-sm mt-0.5">Computer-vision scan of developer-submitted QPR photos vs K-RERA declared progress.</p>
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
          {/* Hero divergence callout */}
          <div className="bg-surface border border-red/30 rounded-sm p-5 mb-6">
            <div className="text-[9px] font-mono text-red uppercase tracking-[0.15em] mb-1">CRITICAL DIVERGENCE DETECTED</div>
            <div className="flex flex-wrap gap-6 mt-2">
              <div>
                <div className="text-[10px] font-mono text-gray mb-0.5">Developer claimed (QPR)</div>
                <div className="font-syne text-4xl text-red font-bold">43%</div>
              </div>
              <div className="flex items-center text-gray text-2xl font-light">vs</div>
              <div>
                <div className="text-[10px] font-mono text-gray mb-0.5">CV-observed (Vantis)</div>
                <div className="font-syne text-4xl text-amber font-bold">28%</div>
              </div>
              <div className="flex items-center">
                <div className="px-3 py-1.5 bg-red/10 border border-red/20 rounded-sm">
                  <div className="text-[9px] font-mono text-red uppercase tracking-[0.1em]">15-point gap</div>
                  <div className="text-xs text-gray-light mt-0.5">K-RERA Q3 2021 · Latest scan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Site schematic SVG */}
          <div className="bg-surface border border-border rounded-sm p-5 mb-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-4">Site Construction Schematic — Ozone Urbana</div>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 440 320" width="100%" style={{ maxWidth: 440, display: 'block', margin: '0 auto' }}>
                {/* Grid background */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E1E2E" strokeWidth="0.5"/>
                  </pattern>
                  <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#E74C3C" strokeWidth="1.5" opacity="0.4"/>
                  </pattern>
                </defs>
                <rect width="440" height="320" fill="url(#grid)" />

                {/* Foundation zone — green */}
                <rect x="40" y="260" width="360" height="40" fill="#2ECC71" fillOpacity="0.18" stroke="#2ECC71" strokeWidth="1" strokeOpacity="0.5" rx="1"/>
                <text x="220" y="284" textAnchor="middle" fill="#2ECC71" fontSize="9" fontFamily="monospace" opacity="0.8">Foundation (COMPLETE)</text>

                {/* Plinth zone — green */}
                <rect x="40" y="222" width="360" height="36" fill="#2ECC71" fillOpacity="0.14" stroke="#2ECC71" strokeWidth="1" strokeOpacity="0.4" rx="1"/>
                <text x="220" y="244" textAnchor="middle" fill="#2ECC71" fontSize="9" fontFamily="monospace" opacity="0.8">Plinth Level (COMPLETE)</text>

                {/* Lower floors — green */}
                <rect x="40" y="158" width="360" height="62" fill="#2ECC71" fillOpacity="0.10" stroke="#2ECC71" strokeWidth="1" strokeOpacity="0.35" rx="1"/>
                <text x="220" y="192" textAnchor="middle" fill="#2ECC71" fontSize="9" fontFamily="monospace" opacity="0.7">Floors 1–4 (COMPLETE)</text>

                {/* Upper structure — amber, partial */}
                <rect x="40" y="100" width="360" height="56" fill="#F39C12" fillOpacity="0.12" stroke="#F39C12" strokeWidth="1" strokeOpacity="0.5" rx="1"/>
                <rect x="40" y="100" width="180" height="56" fill="#F39C12" fillOpacity="0.14" rx="1"/>
                <text x="220" y="131" textAnchor="middle" fill="#F39C12" fontSize="9" fontFamily="monospace" opacity="0.8">Floors 5–8 (PARTIAL — 50%)</text>

                {/* Upper structure incomplete — red hatch */}
                <rect x="40" y="62" width="360" height="36" fill="url(#hatch)" stroke="#E74C3C" strokeWidth="1" strokeOpacity="0.5" rx="1"/>
                <text x="220" y="83" textAnchor="middle" fill="#E74C3C" fontSize="9" fontFamily="monospace" opacity="0.8">Floors 9–12 (NOT STARTED)</text>

                {/* Roof outline only */}
                <rect x="60" y="30" width="320" height="30" fill="none" stroke="#E74C3C" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.5" rx="1"/>
                <text x="220" y="48" textAnchor="middle" fill="#E74C3C" fontSize="9" fontFamily="monospace" opacity="0.6">Roof (NOT STARTED)</text>

                {/* Disclaimer */}
                <text x="220" y="312" textAnchor="middle" fill="#6B6B88" fontSize="7.5" fontFamily="monospace">REPRESENTATIVE SCHEMATIC — NOT SATELLITE IMAGERY</text>
              </svg>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {[
                { color: '#2ECC71', label: 'Complete' },
                { color: '#F39C12', label: 'Partial' },
                { color: '#E74C3C', label: 'Not started / incomplete' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: l.color, opacity: 0.5 }} />
                  <span className="text-[10px] text-gray font-mono">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 8-quarter divergence table */}
          <div className="bg-surface border border-border rounded-sm overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-border bg-surface2">
              <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray">8-Quarter Progress Divergence</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-surface2">
                  <tr>
                    {['Quarter', 'Claimed %', 'CV-Observed %', 'Gap', 'Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-[0.1em] text-gray">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DIVERGENCE_DATA.map((row, i) => {
                    const gap = row.claimed - row.observed
                    const flagged = row.flag === 'DIVERGENCE'
                    return (
                      <tr key={i} className={`border-b border-border/50 last:border-0 ${flagged ? 'bg-red/4' : ''}`}>
                        <td className="px-4 py-2.5 text-xs font-mono text-gray-light">{row.q}</td>
                        <td className="px-4 py-2.5 text-xs font-mono text-off-white">{row.claimed}%</td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: flagged ? '#F39C12' : '#2ECC71' }}>{row.observed}%</td>
                        <td className="px-4 py-2.5 text-xs font-mono font-bold" style={{ color: gap > 5 ? '#E74C3C' : '#2ECC71' }}>
                          {gap > 0 ? `+${gap}` : gap} pts
                        </td>
                        <td className="px-4 py-2.5">
                          {flagged
                            ? <span className="flex items-center gap-1 text-[9px] font-mono text-red"><AlertTriangle className="w-3 h-3" /> DIVERGENCE</span>
                            : <span className="flex items-center gap-1 text-[9px] font-mono text-green"><CheckCircle2 className="w-3 h-3" /> WITHIN TOLERANCE</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Photo cards */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">QPR Photo Analysis — Q3 2023 Submission</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {OZONE_PHOTOS.map((photo, i) => (
                <div key={i} className="aspect-video bg-surface2 border border-border rounded-sm relative overflow-hidden">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <Camera className="w-8 h-8 text-border" />
                    <span className="text-[9px] font-mono text-gray/40 text-center px-2">developer-submitted QPR photo</span>
                    <span className="text-[10px] font-mono text-gray-light">{photo.label}</span>
                  </div>
                  {photo.annotation && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-red/80 text-white">{photo.annotation}</span>
                    </div>
                  )}
                  {photo.hash && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-black/60 text-gray-light">Perceptual hash: {photo.hash}</span>
                    </div>
                  )}
                  {!photo.flagged && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-green" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 px-4 py-3 bg-red/6 border border-red/20 rounded-sm">
              <p className="text-red text-xs font-medium">Photo Fraud Signal</p>
              <p className="text-gray-light text-xs mt-1 leading-relaxed">3 of 6 QPR photos for Q3 2023 appear identical to Q2 2023 submissions (perceptual hash similarity &gt;88%). Developer re-submitting old photos to claim new milestone progress.</p>
            </div>
          </div>
        </>
      ) : (
        /* Divya Villas — passing */
        <div className="space-y-5">
          <div className="bg-surface border border-green/30 rounded-sm p-5">
            <div className="text-[9px] font-mono text-green uppercase tracking-[0.15em] mb-1">WITHIN TOLERANCE — NO ACTION REQUIRED</div>
            <div className="flex flex-wrap gap-6 mt-2">
              <div>
                <div className="text-[10px] font-mono text-gray mb-0.5">Developer claimed (QPR)</div>
                <div className="font-syne text-4xl text-off-white font-bold">78%</div>
              </div>
              <div className="flex items-center text-gray text-2xl font-light">vs</div>
              <div>
                <div className="text-[10px] font-mono text-gray mb-0.5">CV-observed (Vantis)</div>
                <div className="font-syne text-4xl text-green font-bold">76%</div>
              </div>
              <div className="flex items-center">
                <div className="px-3 py-1.5 bg-green/10 border border-green/20 rounded-sm">
                  <div className="text-[9px] font-mono text-green uppercase tracking-[0.1em]">2-point gap (within 5pt tolerance)</div>
                  <div className="text-xs text-gray-light mt-0.5">K-RERA Q4 2023 · Latest scan</div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-border rounded-sm p-5">
            <div className="text-[10px] font-mono uppercase tracking-[0.15em] text-gray mb-3">Photo Analysis — Q4 2023</div>
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(n => (
                <div key={n} className="aspect-video bg-surface2 border border-green/20 rounded-sm relative overflow-hidden flex items-center justify-center">
                  <Camera className="w-6 h-6 text-border" />
                  <div className="absolute top-1.5 right-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green" /></div>
                </div>
              ))}
            </div>
            <p className="text-green text-xs mt-3 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> All 6 photos verified unique. No hash similarity flags. Timestamps consistent with claimed submission date.</p>
          </div>
        </div>
      )}
    </div>
  )
}
