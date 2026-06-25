'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, AlertTriangle, XCircle, ChevronDown, ArrowRight,
  Shield, Code2, Building2, Landmark, Share2, Clock,
} from 'lucide-react'

// ── types ─────────────────────────────────────────────────────────────────────

type CheckStatus = 'pass' | 'warn' | 'fail'
type Grade       = 'A' | 'B' | 'C' | 'D'
type Verdict     = 'PROCEED' | 'DO_NOT_FINANCE'

interface CheckItem {
  id: string
  label: string
  source: string
  status: CheckStatus
  value: string
  detail: string
  ts: string
}

interface DataRoomProfile {
  id: string
  name: string
  developer: string
  rera: string
  grade: Grade
  score: number
  verdict: Verdict
  ms: number
  verificationId: string
  checks: CheckItem[]
}

// ── data ──────────────────────────────────────────────────────────────────────

const CLEAN: DataRoomProfile = {
  id: 'divya-villas',
  name: 'Divya Villas',
  developer: 'JDA Projects Pvt. Ltd.',
  rera: 'PRM/KA/RERA/1251/309/PR/2021/001',
  grade: 'A',
  score: 847,
  verdict: 'PROCEED',
  ms: 3847,
  verificationId: 'VG-2026-DR-007034',
  checks: [
    { id: 'rera',         label: 'RERA Registration',  source: 'K-RERA Portal',       status: 'pass', value: 'Active · expires Mar 2027',              detail: 'PRM/KA/RERA/1251/309/PR/2021/001 registered and valid. No show-cause notices pending. 1 extension approved (COVID order). Q4 2025 QPR filed on time.', ts: '08:32:14' },
    { id: 'title',        label: 'Title Chain',         source: 'Kaveri 2.0',          status: 'pass', value: 'EC clean · Sy. 83/2 & 84/2',             detail: 'Encumbrance Certificate verified for Sy. No. 83/2 (1.2 acres) and 84/2 (0.8 acres). No charges, mortgages or attachments. Period 2010–2024 fully clear.', ts: '08:32:15' },
    { id: 'encumbrance',  label: 'Encumbrance Check',   source: 'Kaveri 2.0',          status: 'pass', value: 'No mortgage · No charge',                detail: 'Full EC search — no undisclosed mortgage or lien across all survey numbers. Bhoomi records cross-confirmed. Land records consistent with RERA filing.', ts: '08:32:15' },
    { id: 'litigation',   label: 'Litigation Scan',     source: 'eCourts / NCLT',      status: 'pass', value: 'No active cases',                        detail: 'Karnataka HC, City Civil Court, Consumer Forum, NCLT, NCLAT, and ED — all clear. No cases by homebuyers or creditors filed against developer or project.', ts: '08:32:16' },
    { id: 'plan',         label: 'Plan Sanction',       source: 'MCC / DC Mysuru',     status: 'pass', value: 'Sanctioned · MCC/2021/0421',             detail: 'Mysuru City Corporation building plan sanctioned Feb 2021, valid through 2027. No deviation notices. Ground coverage within approved limits.', ts: '08:32:16' },
    { id: 'qpr',          label: 'QPR / Construction',  source: 'K-RERA + Drone',      status: 'pass', value: '94% physical · on-time filings',         detail: 'Drone reconciliation: physical 94%, QPR filed 92%, Finance assumed 94% — within ±5% tolerance. No gap detected. 8 consecutive on-time filings.', ts: '08:32:17' },
    { id: 'escrow',       label: 'Financial / Escrow',  source: 'RERA Escrow Registry',status: 'pass', value: '41% escrow · compliant',                 detail: 'Escrow at 41% — above regulatory minimum (25%). CA certificate Ex3/Ex4 verified for Q4 2025. No unauthorized withdrawals in 8 quarters.', ts: '08:32:17' },
  ],
}

const FLAGGED: DataRoomProfile = {
  id: 'ozone-urbana',
  name: 'Ozone Urbana',
  developer: 'Ozone Group',
  rera: 'PRM/KA/RERA/1251/398/PR/2020/003',
  grade: 'D',
  score: 124,
  verdict: 'DO_NOT_FINANCE',
  ms: 3912,
  verificationId: 'VG-2026-DR-003981',
  checks: [
    { id: 'rera',         label: 'RERA Registration',  source: 'K-RERA Portal',       status: 'warn', value: '8 QPR defaults · RRC issued',            detail: 'Registration active but 8 QPR defaults since Q3 2022. RRC-2026-001 issued — ₹45.75L penalty outstanding. Show-cause notice sent Feb 2026, response pending.', ts: '08:32:14' },
    { id: 'title',        label: 'Title Chain',         source: 'Kaveri 2.0',          status: 'fail', value: '⚑ LITIGATION LIEN · HC injunction',      detail: 'Karnataka High Court Case HC/BLR/2023/1847 — injunction on Sy. No. 42 blocks title transfer. Encumbrance Certificate shows charge dated Oct 2023. Cannot issue NOC.', ts: '08:32:15' },
    { id: 'encumbrance',  label: 'Encumbrance Check',   source: 'Kaveri 2.0',          status: 'fail', value: '⚑ UNDISCLOSED MORTGAGE · ₹18.5 Cr',      detail: 'Kaveri 2.0 reveals undisclosed mortgage of ₹18.5 Cr on Sy. No. 42 — not declared in RERA application. Charge holder: Canara Bank. Registered Apr 2019.', ts: '08:32:15' },
    { id: 'litigation',   label: 'Litigation Scan',     source: 'eCourts / NCLT',      status: 'fail', value: '⚑ 2 active cases · ED interest',         detail: '(1) HC/BLR/2023/1847 — title injunction active; (2) NCLT/BLR/2024/0089 — insolvency petition by homebuyers (₹48 Cr). ED look-out notice per court records.', ts: '08:32:16' },
    { id: 'plan',         label: 'Plan Sanction',       source: 'BBMP',                status: 'warn', value: '⚠ Plan expired · overdue 14 months',     detail: 'Original building plan expired Mar 2025. Renewal application filed May 2025 but pending BBMP approval. Construction above sanctioned floors technically unauthorized.', ts: '08:32:16' },
    { id: 'qpr',          label: 'QPR / Construction',  source: 'K-RERA + Drone',      status: 'fail', value: '⚑ 32pt GAP · Physical 30%, QPR 62%',    detail: 'Drone reconciliation: physical 30%, QPR claimed 62%, Finance assumed 72% — 32-point divergence. First flagged Q3 2021. Gap widened 6 consecutive quarters.', ts: '08:32:17' },
    { id: 'escrow',       label: 'Financial / Escrow',  source: 'RERA Escrow Registry',status: 'fail', value: '⚑ 8% escrow · unauthorized withdrawals', detail: 'Escrow critically below 25% mandatory floor. 4 unauthorized withdrawals Q2 2022–Q1 2024 totaling ₹12.4 Cr. Homebuyer funds at immediate risk.', ts: '08:32:17' },
  ],
}

// ── helpers ───────────────────────────────────────────────────────────────────

const TIMESTAMP = '25 Jun 2026, 08:32 IST'

function statusIcon(s: CheckStatus, cls = 'w-3.5 h-3.5') {
  if (s === 'pass') return <CheckCircle2 className={`${cls} text-green shrink-0`} />
  if (s === 'warn') return <AlertTriangle className={`${cls} text-amber shrink-0`} />
  return <XCircle className={`${cls} text-red shrink-0`} />
}
function statusText(s: CheckStatus) {
  return s === 'pass' ? 'text-green' : s === 'warn' ? 'text-amber' : 'text-red'
}
function verdictStyle(v: Verdict) {
  return v === 'PROCEED'
    ? { text: '✓ Proceed to Sanction', color: 'text-green', bg: 'bg-green/10 border-green/30' }
    : { text: '✗ Do Not Finance', color: 'text-red', bg: 'bg-red/10 border-red/30' }
}

// ── CheckRow ─────────────────────────────────────────────────────────────────

function CheckRow({ item, open, onToggle, compact }: { item: CheckItem; open: boolean; onToggle: () => void; compact?: boolean }) {
  return (
    <div className={`border border-border/50 rounded-sm overflow-hidden ${
      item.status === 'fail' ? 'bg-red/[0.04]' : item.status === 'warn' ? 'bg-amber/[0.03]' : 'bg-surface2/40'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.02] transition-colors"
      >
        {statusIcon(item.status)}
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-medium text-off-white">{item.label}</div>
          {!compact && <div className={`text-[10px] font-mono mt-0.5 truncate ${statusText(item.status)}`}>{item.value}</div>}
        </div>
        {!compact && (
          <div className="text-right shrink-0 mr-1">
            <div className="text-[8px] font-mono text-gray/50 uppercase">{item.source}</div>
            <div className="text-[8px] font-mono text-gray/30 mt-0.5">{item.ts}</div>
          </div>
        )}
        <ChevronDown className="w-3 h-3 text-gray/40 shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-border/30">
              <div className={`text-[10px] font-mono mb-1 ${statusText(item.status)}`}>{item.value}</div>
              <p className="text-[10px] text-gray leading-relaxed">{item.detail}</p>
              <div className="text-[9px] font-mono text-gray/40 mt-2">Source: {item.source} · Verified {item.ts} IST</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── JSON panel ────────────────────────────────────────────────────────────────

function JSONPanel({ profile }: { profile: DataRoomProfile }) {
  const isFail = profile.verdict === 'DO_NOT_FINANCE'
  const sc = (s: string, cls: string) => <span className={cls}>{s}</span>
  const key = (s: string) => sc(`"${s}"`, 'text-gray-light')
  const str = (s: string, ok = true) => sc(`"${s}"`, ok ? 'text-green' : 'text-red')
  const num = (n: number) => sc(String(n), 'text-amber')
  const muted = (s: string) => sc(s, 'text-gray/50')
  const li = (indent: number, node: React.ReactNode) => (
    <div style={{ paddingLeft: `${indent * 14}px` }} className="leading-[1.6]">{node}</div>
  )

  return (
    <div className="bg-[#06060E] border border-border rounded-sm p-4 font-mono text-[10px] overflow-x-auto">
      <div className="text-[9px] uppercase tracking-[0.15em] text-gray/30 mb-3 flex items-center gap-2">
        <Code2 className="w-3 h-3" /> Vantis Verification API · application/json
      </div>
      <div className="text-off-white/80 space-y-px">
        {li(0, muted('{'))}
        {li(1, <>{key('vantis_verified')}{muted(': ')}<span className="text-green">true</span>{muted(',')}</>)}
        {li(1, <>{key('verification_id')}{muted(': ')}{str(profile.verificationId)}{muted(',')}</>)}
        {li(1, <>{key('latency_ms')}{muted(': ')}{num(profile.ms)}{muted(',')}</>)}
        {li(1, <>{key('project')}{muted(': {')}</>)}
        {li(2, <>{key('id')}{muted(': ')}{str(profile.id)}{muted(',')}</>)}
        {li(2, <>{key('name')}{muted(': ')}{str(profile.name)}{muted(',')}</>)}
        {li(2, <>{key('grade')}{muted(': ')}{str(profile.grade, !isFail)}{muted(',')}</>)}
        {li(2, <>{key('risk_score')}{muted(': ')}{num(profile.score)}{muted(',')}</>)}
        {li(2, <>{key('financing_verdict')}{muted(': ')}{str(profile.verdict, !isFail)}</>)}
        {li(1, muted('},'))}
        {li(1, <>{key('checks')}{muted(': {')}</>)}
        {profile.checks.map((c, i) => li(2,
          <>{key(c.id)}{muted(': { ')}{key('status')}{muted(': ')}<span className={c.status === 'pass' ? 'text-green' : c.status === 'warn' ? 'text-amber' : 'text-red'}>{`"${c.status}"`}</span>{muted(` }${i < profile.checks.length - 1 ? ',' : ''}`)}</>
        ))}
        {li(1, muted('},'))}
        {li(1, <>{key('confidence')}{muted(': ')}{num(isFail ? 0.97 : 0.98)}</>)}
        {li(0, muted('}'))}
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function DataRoomPage() {
  const [profileKey, setProfileKey]   = useState<'clean' | 'flagged'>('clean')
  const [shared, setShared]           = useState(false)
  const [showJSON, setShowJSON]       = useState(false)
  const [leftOpen,  setLeftOpen]      = useState<string | null>(null)
  const [rightOpen, setRightOpen]     = useState<string | null>(null)

  const profile = profileKey === 'clean' ? CLEAN : FLAGGED
  const vStyle  = verdictStyle(profile.verdict)
  const failCount = profile.checks.filter(c => c.status === 'fail').length
  const warnCount = profile.checks.filter(c => c.status === 'warn').length

  function switchProfile(key: 'clean' | 'flagged') {
    setProfileKey(key)
    setShared(false)
    setLeftOpen(null)
    setRightOpen(null)
  }

  return (
    <div className="min-h-screen bg-background text-off-white flex flex-col">

      {/* ── page title ───────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-0 flex items-center gap-3">
        <Shield className="w-4 h-4 text-gold" />
        <span className="font-syne text-lg text-off-white">Vantis Data Room</span>
        <span className="text-[8px] font-mono uppercase text-gold border border-gold/30 bg-gold/10 px-1.5 py-0.5 rounded-sm tracking-[0.1em]">
          Verified
        </span>
        <span className="ml-auto flex gap-3 text-[10px] font-mono">
          <Link href="/build" className="text-gray hover:text-gold transition-colors flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Build
          </Link>
          <Link href="/lend" className="text-gray hover:text-gold transition-colors flex items-center gap-1">
            <Landmark className="w-3 h-3" /> Lend
          </Link>
        </span>
      </div>

      {/* ── project toggle ───────────────────────────────────────────────── */}
      <div className="border-b border-border bg-surface/50 shrink-0 flex items-center justify-center gap-2 px-4 py-2">
        <span className="text-[9px] font-mono text-gray uppercase tracking-[0.1em] mr-1">Developer</span>
        {([
          { key: 'clean',   label: 'Divya Villas · JDA Projects', sub: 'A-Grade · All clear',             icon: CheckCircle2,  color: 'text-green',  active: 'border-green/40 bg-green/10' },
          { key: 'flagged', label: 'Ozone Urbana · Ozone Group',  sub: 'D-Grade · 5 critical flags',      icon: XCircle,       color: 'text-red',    active: 'border-red/40 bg-red/10' },
        ] as const).map(opt => (
          <button
            key={opt.key}
            onClick={() => switchProfile(opt.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-left transition-colors ${
              profileKey === opt.key ? opt.active : 'border-border/50 hover:border-border bg-transparent'
            }`}
          >
            <opt.icon className={`w-3 h-3 shrink-0 ${profileKey === opt.key ? opt.color : 'text-gray/40'}`} />
            <div>
              <div className={`text-[10px] font-medium ${profileKey === opt.key ? 'text-off-white' : 'text-gray'}`}>{opt.label}</div>
              <div className={`text-[9px] ${profileKey === opt.key ? opt.color : 'text-gray/50'}`}>{opt.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── split screen ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT — developer ─────────────────────────────────────────── */}
        <div className="w-[42%] border-r border-border flex flex-col overflow-hidden">

          {/* panel header */}
          <div className="shrink-0 px-5 py-4 border-b border-border bg-surface/30">
            <div className="flex items-center gap-1.5 mb-3">
              <Building2 className="w-3.5 h-3.5 text-gold" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gold">Vantis Build · Developer View</span>
            </div>
            <div className="font-syne text-xl text-off-white leading-tight">Your verified data room.</div>
            <p className="text-[11px] text-gray mt-1 leading-relaxed">
              Vantis pulls this from government records in one click — you never assemble it manually.
            </p>
          </div>

          {/* project facts */}
          <div className="shrink-0 px-5 py-3 border-b border-border bg-surface2/30 flex items-center gap-4">
            <div>
              <div className="text-[9px] font-mono uppercase text-gray mb-0.5">Project</div>
              <div className="text-sm font-syne text-off-white">{profile.name}</div>
              <div className="text-[10px] text-gray">{profile.developer}</div>
            </div>
            <div className="ml-auto text-right">
              <div className={`text-2xl font-syne font-bold ${
                profile.grade === 'A' ? 'text-green' : profile.grade === 'D' ? 'text-red' : 'text-amber'
              }`}>{profile.grade}</div>
              <div className="text-[9px] font-mono text-gray uppercase">Vantis Grade</div>
            </div>
          </div>

          {/* checklist */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5">
            <div className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray mb-3">
              Government-Verified Checks · {profile.checks.filter(c => c.status === 'pass').length}/7 passed
            </div>
            {profile.checks.map(item => (
              <CheckRow
                key={item.id}
                item={item}
                open={leftOpen === item.id}
                onToggle={() => setLeftOpen(leftOpen === item.id ? null : item.id)}
              />
            ))}
          </div>

          {/* footer — timestamp + share */}
          <div className="shrink-0 px-5 py-4 border-t border-border bg-surface/50">
            <div className="flex items-center gap-2 text-[10px] font-mono text-gray mb-3">
              <Clock className="w-3 h-3 text-gold/60" />
              Generated in {profile.ms.toLocaleString()}ms · last verified {TIMESTAMP}
            </div>
            <button
              onClick={() => setShared(true)}
              disabled={shared}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-sm border text-sm font-mono transition-all ${
                shared
                  ? 'border-green/40 bg-green/10 text-green cursor-default'
                  : 'border-gold/40 bg-gold/10 text-gold hover:bg-gold/20 active:scale-[0.99]'
              }`}
            >
              {shared
                ? <><CheckCircle2 className="w-4 h-4" /> Verified Package Shared</>
                : <><Share2 className="w-4 h-4" /> Share with Lender</>
              }
            </button>
            {!shared && (
              <p className="text-[9px] text-gray/50 text-center mt-2">
                Bank receives the same verified government data — no manual uploads.
              </p>
            )}
          </div>
        </div>

        {/* CENTER — handoff animation ───────────────────────────────── */}
        <div className="w-16 shrink-0 relative flex flex-col items-center justify-center overflow-hidden bg-background">
          {/* vertical guide line */}
          <div className="absolute top-0 bottom-0 w-px bg-border/30" />

          {/* data packets */}
          {shared && [0, 1, 2, 3].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-sm"
              style={{ width: 8, height: 8, background: '#C9A84C', top: '44%' }}
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 28, opacity: [0, 1, 1, 0] }}
              transition={{ delay: i * 0.28, duration: 0.85, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
            />
          ))}

          {/* arrow */}
          <div className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-500 ${
            shared ? 'border-gold/60 bg-gold/15' : 'border-border/50 bg-surface'
          }`}>
            <ArrowRight className={`w-4 h-4 transition-colors duration-500 ${shared ? 'text-gold' : 'text-gray/20'}`} />
          </div>

          <AnimatePresence>
            {shared && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="relative z-10 mt-3 text-[7px] font-mono text-gold uppercase text-center leading-relaxed tracking-[0.08em]"
              >
                Verified<br />Package<br />Sent
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — bank ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* panel header */}
          <div className="shrink-0 px-5 py-4 border-b border-border bg-surface/30">
            <div className="flex items-center gap-1.5 mb-3">
              <Landmark className="w-3.5 h-3.5 text-gray-light" />
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-gray-light">Vantis Lend · Bank View</span>
            </div>
            <div className="font-syne text-xl text-off-white leading-tight">Verified diligence — instant.</div>
            <p className="text-[11px] text-gray mt-1 leading-relaxed">
              Weeks of manual title search, QPR audit, and litigation scan — resolved in 4 seconds.
            </p>
          </div>

          {/* risk score + verdict */}
          <div className="shrink-0 px-5 py-3 border-b border-border bg-surface2/30">
            <div className="flex items-center gap-5">
              <div>
                <div className="text-[9px] font-mono uppercase text-gray mb-0.5">Vantis Risk Score</div>
                <div className={`font-syne text-3xl font-bold ${profile.score >= 700 ? 'text-green' : profile.score >= 450 ? 'text-amber' : 'text-red'}`}>
                  {profile.score}
                </div>
                <div className="text-[9px] font-mono text-gray">/ 900</div>
              </div>
              {/* score bar */}
              <div className="flex-1">
                <div className="h-2 bg-surface2 rounded-full overflow-hidden border border-border/50">
                  <motion.div
                    key={profile.id}
                    className="h-full rounded-full"
                    style={{ background: profile.score >= 700 ? '#2ECC71' : profile.score >= 450 ? '#F39C12' : '#E74C3C' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(profile.score / 900) * 100}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] font-mono text-gray/40">300</span>
                  <span className="text-[8px] font-mono text-gray/40">900</span>
                </div>
              </div>
              <div className={`px-3 py-2 rounded-sm border text-center ${vStyle.bg}`}>
                <div className={`text-xs font-mono font-bold ${vStyle.color}`}>{vStyle.text}</div>
                <div className="text-[9px] text-gray mt-0.5">
                  {failCount > 0 ? `${failCount} critical flag${failCount > 1 ? 's' : ''}${warnCount > 0 ? ` · ${warnCount} warning${warnCount > 1 ? 's' : ''}` : ''}` : 'All checks passed'}
                </div>
              </div>
            </div>
          </div>

          {/* received check items */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5">
            <AnimatePresence mode="wait">
              {!shared ? (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-48 gap-3"
                >
                  <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gray/20" />
                  </div>
                  <p className="text-[11px] text-gray/50 text-center">
                    Awaiting verified package from developer&hellip;
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="received"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-[9px] font-mono text-green uppercase tracking-[0.1em] mb-3 px-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified package received · {TIMESTAMP}
                  </div>
                  {profile.checks.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CheckRow
                        item={item}
                        open={rightOpen === item.id}
                        onToggle={() => setRightOpen(rightOpen === item.id ? null : item.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* footer */}
          <div className="shrink-0 px-5 py-4 border-t border-border bg-surface/50 space-y-3">
            {/* weeks → seconds callout */}
            <div className="bg-gold/[0.07] border border-gold/20 rounded-sm px-4 py-3 flex items-center gap-4">
              <Clock className="w-5 h-5 text-gold shrink-0" />
              <div>
                <div className="text-xs text-gold font-medium">
                  Weeks of manual diligence → {(profile.ms / 1000).toFixed(2)} seconds.
                </div>
                <div className="text-[10px] text-gray/70 mt-0.5">
                  Title search · QPR audit · eCourts scan · Escrow check — all automated, all government-source.
                </div>
              </div>
            </div>

            {/* JSON panel toggle */}
            <button
              onClick={() => setShowJSON(v => !v)}
              className="w-full flex items-center gap-2 px-3 py-2 border border-border/50 rounded-sm text-[10px] font-mono text-gray hover:text-off-white hover:border-gold/30 transition-colors"
            >
              <Code2 className="w-3 h-3" />
              {showJSON ? 'Hide' : 'View'} API Response — bank systems ingest this directly
              <ChevronDown className="w-3 h-3 ml-auto transition-transform" style={{ transform: showJSON ? 'rotate(180deg)' : 'none' }} />
            </button>
            <AnimatePresence>
              {showJSON && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <JSONPanel profile={profile} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
