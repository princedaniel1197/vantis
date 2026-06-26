'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { resolveGovTruth } from '@/lib/gov-truth'

export default function ParcelPage() {
  const truth = resolveGovTruth('divya-villas')

  const findings = [
    { label: 'Land Area (Bhoomi)', value: '2.0 acres',  ok: true, note: 'Matches EC records' },
    { label: 'Water Body',         value: 'None',       ok: true, note: 'No CRS/Waterbody overlap' },
    { label: 'Road Access',        value: 'Confirmed',  ok: true, note: '12m road frontage' },
    { label: 'Encroachment',       value: 'None',       ok: true, note: 'Survey boundary clear' },
  ]

  const govItems = [
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
  ]

  return (
    <div className="min-h-screen bg-background max-w-[900px] mx-auto">
      {/* Page header */}
      <div className="px-6 sm:px-8 py-5 border-b border-border shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.28em] text-gray mb-2">
          Vantis Build · Developer Intelligence · Divya Villas · JDA Projects
        </div>
        <h1 className="font-syne text-2xl sm:text-3xl font-bold text-off-white leading-none">
          Parcel Intelligence
        </h1>
      </div>

      <div className="px-6 sm:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/build" className="text-gray hover:text-gold transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-[10px] font-mono text-gray uppercase tracking-[0.12em]">Build Hub</span>
          <span className="text-border text-xs">/</span>
          <span className="text-[10px] font-mono text-gray uppercase tracking-[0.12em]">Parcel Intelligence</span>
        </div>

        <p className="text-gray text-sm mb-1">
          Survey boundary cross-checked against Bhoomi land records and Kaveri registration history.
        </p>
        <p className="text-xs text-gray mt-0.5 mb-6">
          Project: Divya Villas (JDA Projects) · Sy. No. 83/2 and 84/2 · Mysuru
        </p>

        {/* Satellite parcel map */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          className="bg-surface border border-border rounded-sm p-4 sm:p-5 hover:border-gold/30 transition-all mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Satellite Parcel View · Divya Villas, Mysuru</span>
            <div className="text-[9px] font-mono text-gray/50 uppercase">CARTOSAT-3A · 0.28m GSD · Jun 2024</div>
          </div>

          <svg viewBox="0 0 600 380" className="w-full max-w-2xl mx-auto rounded-sm" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="parcelMesh" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.4"/>
              </pattern>
              <pattern id="parcelScan" width="1" height="3" patternUnits="userSpaceOnUse">
                <rect width="1" height="1" fill="rgba(255,255,255,0.013)"/>
              </pattern>
              <radialGradient id="bldgHighlight" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,240,0.09)"/>
                <stop offset="100%" stopColor="transparent"/>
              </radialGradient>
            </defs>

            {/* Base earth — Karnataka laterite soil */}
            <rect width="600" height="380" fill="#231608"/>

            {/* Cleared site (survey boundary region) */}
            <polygon points="76,74 310,52 318,326 94,348" fill="#7C5432"/>

            {/* Soil texture — multiple variation ellipses */}
            <ellipse cx="178" cy="158" rx="72" ry="52" fill="#6A4828" opacity="0.5"/>
            <ellipse cx="222" cy="104" rx="46" ry="26" fill="#845A38" opacity="0.38"/>
            <ellipse cx="132" cy="222" rx="38" ry="24" fill="#604030" opacity="0.48"/>
            <ellipse cx="250" cy="196" rx="30" ry="20" fill="#7A5230" opacity="0.35"/>
            <ellipse cx="148" cy="302" rx="44" ry="22" fill="#5E4228" opacity="0.52"/>
            <ellipse cx="248" cy="288" rx="28" ry="16" fill="#684E32" opacity="0.4"/>

            {/* Dense vegetation — left edge (3 depth layers) */}
            <ellipse cx="20" cy="40"  rx="36" ry="48" fill="#14240E"/>
            <ellipse cx="16" cy="125" rx="30" ry="55" fill="#192E12"/>
            <ellipse cx="22" cy="224" rx="34" ry="50" fill="#14240E"/>
            <ellipse cx="18" cy="335" rx="30" ry="54" fill="#192E12"/>
            {/* mid-layer */}
            <ellipse cx="26" cy="40"  rx="22" ry="34" fill="#1C3614" opacity="0.72"/>
            <ellipse cx="22" cy="125" rx="20" ry="40" fill="#203C16" opacity="0.65"/>
            <ellipse cx="28" cy="224" rx="21" ry="36" fill="#1C3614" opacity="0.72"/>
            <ellipse cx="24" cy="335" rx="18" ry="42" fill="#203C16" opacity="0.65"/>
            {/* highlight layer */}
            <ellipse cx="30" cy="38"  rx="14" ry="22" fill="#264A18" opacity="0.55"/>
            <ellipse cx="26" cy="122" rx="12" ry="28" fill="#2A5018" opacity="0.5"/>
            <ellipse cx="32" cy="222" rx="13" ry="24" fill="#264A18" opacity="0.55"/>

            {/* Vegetation right edge */}
            <ellipse cx="588" cy="48"  rx="28" ry="44" fill="#14240E"/>
            <ellipse cx="592" cy="165" rx="22" ry="58" fill="#192E12"/>
            <ellipse cx="588" cy="316" rx="26" ry="50" fill="#14240E"/>
            <ellipse cx="594" cy="165" rx="14" ry="40" fill="#1E3816" opacity="0.65"/>
            {/* Top/bottom fringe */}
            <ellipse cx="192" cy="7"   rx="58" ry="16" fill="#14240E"/>
            <ellipse cx="405" cy="374" rx="68" ry="16" fill="#192E12"/>
            <ellipse cx="516" cy="370" rx="46" ry="20" fill="#14240E"/>

            {/* Access road — wider, with markings and vehicles */}
            <rect x="318" y="52" width="260" height="32" fill="#302A1E" rx="1"/>
            <line x1="320" y1="68" x2="578" y2="68" stroke="#44402E" strokeWidth="1" strokeDasharray="15 9" opacity="0.7"/>
            <line x1="320" y1="54" x2="578" y2="54" stroke="#3C3628" strokeWidth="0.6" opacity="0.45"/>
            <line x1="320" y1="82" x2="578" y2="82" stroke="#3C3628" strokeWidth="0.6" opacity="0.45"/>
            {/* Vehicles on road */}
            <rect x="378" y="57" width="17" height="10" rx="2" fill="#262018" opacity="0.9"/>
            <rect x="454" y="61" width="15" height="10" rx="2" fill="#2A2418" opacity="0.78"/>
            <text x="448" y="74" textAnchor="middle" fill="#484234" fontSize="7" fontFamily="monospace">MYSURU–HUNSUR ROAD</text>

            {/* Survey 83/2 polygon */}
            <polygon points="80,78 284,58 304,242 90,264" fill="#7A5530"/>

            {/* Building footprint — Tower A from aerial perspective */}
            {/* Foundation/slab (outermost) */}
            <rect x="96" y="86" width="178" height="140" fill="#B0ACA4" rx="1"/>
            {/* Main slab */}
            <rect x="100" y="90" width="170" height="134" fill="#A09C94" rx="0.5"/>
            {/* Parapet lines (floor structure visible from above) */}
            {[133, 166, 199, 230].map((x, i) => (
              <line key={`bv${i}`} x1={x} y1="90" x2={x} y2="224" stroke="#8A8880" strokeWidth="0.9" opacity="0.5"/>
            ))}
            {[120, 148, 176, 204].map((y, i) => (
              <line key={`bh${i}`} x1="100" y1={y} x2="270" y2={y} stroke="#8A8880" strokeWidth="0.9" opacity="0.5"/>
            ))}
            {/* Lift core — darker central mass */}
            <rect x="172" y="126" width="32" height="40" fill="#787470" rx="0.5"/>
            {/* Stair cores (corners) */}
            <rect x="104" y="93"  width="15" height="15" fill="#787470"/>
            <rect x="251" y="93"  width="15" height="15" fill="#787470"/>
            <rect x="104" y="209" width="15" height="12" fill="#787470"/>
            <rect x="251" y="212" width="15" height="12" fill="#787470"/>
            {/* Water tank on roof */}
            <circle cx="248" cy="210" r="8" fill="#6E6C68" stroke="#8A8880" strokeWidth="0.6"/>
            <circle cx="248" cy="210" r="4" fill="#7A7874" opacity="0.7"/>
            {/* Highlight sheen (sun angle) */}
            <rect x="100" y="90" width="170" height="134" fill="url(#bldgHighlight)"/>
            {/* Building shadow — east-southeast (afternoon Karnataka sun) */}
            <rect x="270" y="92" width="10" height="134" fill="#120E06" opacity="0.7"/>
            <polygon points="270,226 280,226 286,234 102,238 100,230" fill="#120E06" opacity="0.5"/>

            {/* Construction crane — aerial view (mast + boom shadow on ground) */}
            <g opacity="0.68">
              {/* Mast base (small dark square) */}
              <rect x="260" y="84" width="7" height="7" fill="#585450" rx="0.5"/>
              {/* Boom arm shadow on ground (long thin line) */}
              <line x1="264" y1="88" x2="322" y2="76" stroke="#120E06" strokeWidth="3.5" opacity="0.4"/>
              <line x1="264" y1="88" x2="214" y2="88" stroke="#120E06" strokeWidth="2.5" opacity="0.35"/>
              {/* Load shadow */}
              <ellipse cx="316" cy="78" rx="5" ry="3" fill="#120E06" opacity="0.45"/>
            </g>

            {/* Remaining cleared land — 83/2 south portion */}
            <ellipse cx="148" cy="208" rx="32" ry="20" fill="#5C4A2E" opacity="0.72"/>
            <ellipse cx="220" cy="218" rx="22" ry="14" fill="#60502E" opacity="0.55"/>

            {/* Survey 84/2 — lower section under site prep */}
            <polygon points="304,242 90,264 100,344 314,324" fill="#7E5A36"/>
            {/* Levelling/excavation strips */}
            <rect x="112" y="270" width="190" height="15" fill="#8A7060" opacity="0.52" rx="1"/>
            <rect x="120" y="300" width="140" height="10" fill="#806858" opacity="0.45" rx="1"/>
            {/* Material/rubble piles */}
            <ellipse cx="145" cy="310" rx="36" ry="20" fill="#5E4C30" opacity="0.8"/>
            <ellipse cx="157" cy="308" rx="24" ry="13" fill="#6A5838" opacity="0.75"/>
            <ellipse cx="258" cy="288" rx="28" ry="17" fill="#5A4828" opacity="0.72"/>
            <ellipse cx="200" cy="298" rx="20" ry="13" fill="#5A4A2E" opacity="0.6"/>
            {/* Excavator (simplified aerial, ~3m × 6m footprint) */}
            <rect x="130" y="272" width="22" height="12" rx="2" fill="#383028" opacity="0.88"/>
            <rect x="148" y="270" width="8"  height="5"  rx="1" fill="#2C2620" opacity="0.85"/>
            {/* Soil texture 84/2 */}
            <ellipse cx="196" cy="294" rx="60" ry="32" fill="#6E5030" opacity="0.38"/>

            {/* Project boundary — gold dashed outer perimeter */}
            <polygon points="80,78 304,58 314,324 100,344 80,78" fill="none" stroke="#C9A84C" strokeWidth="2.2" strokeDasharray="10 4" opacity="0.94"/>

            {/* Survey 83/2 green boundary + label */}
            <polygon points="80,78 284,58 304,242 90,264" fill="none" stroke="#2ECC71" strokeWidth="1.3" strokeDasharray="6 3" opacity="0.82"/>
            <text x="176" y="250" textAnchor="middle" fill="#2ECC71"  fontSize="10" fontFamily="monospace">Sy. No. 83/2</text>
            <text x="176" y="262" textAnchor="middle" fill="#5A8A5A"  fontSize="8"  fontFamily="monospace">1.2 acres · EC clean</text>

            {/* Survey 84/2 gold boundary + label */}
            <polygon points="304,242 90,264 100,344 314,324" fill="none" stroke="#C9A84C" strokeWidth="1.3" strokeDasharray="6 3" opacity="0.8"/>
            <text x="197" y="308" textAnchor="middle" fill="#C9A84C"  fontSize="10" fontFamily="monospace">Sy. No. 84/2</text>
            <text x="197" y="320" textAnchor="middle" fill="#8A7A50"  fontSize="8"  fontFamily="monospace">0.8 acres · mortgage cleared</text>

            {/* Measurement mesh overlay */}
            <rect width="600" height="380" fill="url(#parcelMesh)"/>

            {/* Right-side annotation */}
            <text x="462" y="186" textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="monospace">Project</text>
            <text x="462" y="198" textAnchor="middle" fill="#C9A84C" fontSize="9" fontFamily="monospace">Boundary</text>

            {/* Scan lines (satellite texture) */}
            <rect width="600" height="380" fill="url(#parcelScan)"/>

            {/* TITLE CLEAN badge */}
            <rect x="7" y="7" width="102" height="18" rx="2" fill="rgba(46,204,113,0.18)" stroke="#2ECC71" strokeWidth="0.8"/>
            <text x="11" y="20" fontFamily="monospace" fontSize="9" fill="#2ECC71">✓ TITLE CLEAN</text>

            {/* North indicator */}
            <text x="567" y="26" fontFamily="monospace" fontSize="11" fill="#C9A84C" fontWeight="bold" textAnchor="middle">N</text>
            <polygon points="567,30 564,42 567,38 570,42" fill="#C9A84C"/>
            <line x1="567" y1="42" x2="567" y2="47" stroke="#C9A84C" strokeWidth="1.2"/>

            {/* Scale bar */}
            <line x1="460" y1="368" x2="560" y2="368" stroke="#9090AA" strokeWidth="1"/>
            <line x1="460" y1="364" x2="460" y2="372" stroke="#9090AA" strokeWidth="1"/>
            <line x1="560" y1="364" x2="560" y2="372" stroke="#9090AA" strokeWidth="1"/>
            <text x="510" y="378" fontFamily="monospace" fontSize="7" fill="#9090AA" textAnchor="middle">50m</text>

            {/* Metadata */}
            <text x="7" y="374" fontFamily="monospace" fontSize="7" fill="#4A4A5A">13°22′14″N 76°38′42″E · CARTOSAT-3A · Bhoomi Sy. verified · Jun 2024</text>
          </svg>
        </motion.div>

        {/* Government truth panel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
          className="bg-surface border border-border rounded-sm p-4 sm:p-5 hover:border-gold/30 transition-all mb-5"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">Government Truth — Divya Villas</span>
          <div className="space-y-3 mt-4">
            {govItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
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
              </motion.div>
            ))}
          </div>
          <p className="text-[10px] text-gold mt-4 italic leading-relaxed">
            &quot;Before you buy, see the truth from space, cross-checked against the land record.&quot;
          </p>
        </motion.div>

        {/* Findings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {findings.map((f, index) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05, duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
              className="bg-surface border border-border rounded-sm px-4 py-3 hover:border-gold/30 transition-all"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gray">{f.label}</span>
              <div className="flex items-center gap-1.5 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${f.ok ? 'bg-green' : 'bg-red'}`} />
                <div className={`font-syne text-2xl sm:text-3xl font-bold ${f.ok ? 'text-green' : 'text-red'}`}>{f.value}</div>
              </div>
              <div className="text-[9px] text-gray mt-1">{f.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
