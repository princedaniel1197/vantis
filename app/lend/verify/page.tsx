'use client'

import { useState } from 'react'
import {
  CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronRight,
  FileText, Database, Scale, Lock,
} from 'lucide-react'

type Status = 'PASS' | 'FAIL' | 'WARN'

interface TitleEvent {
  year: string; event: string; parties: string; notes?: string; concern?: boolean
}

interface CourtCase {
  caseNo: string; type: string; filed: string; status: string; amount?: string
}

interface Project {
  id: string; name: string; developer: string; city: string; rera_id: string
  doc_status: Status; kaveri_status: Status
  kaveri_detail?: string
  title_chain?: TitleEvent[]
  court_cases?: CourtCase[]
  court_summary: string; court_status: Status
}

const PROJECTS: Project[] = [
  {
    id: 'divya-villas',
    name: 'Divya Villas',
    developer: 'Zion Builders',
    city: 'Mysuru',
    rera_id: 'PRM/KA/RERA/1251/309/PR/170412/000034',
    doc_status:    'PASS',
    kaveri_status: 'FAIL',
    kaveri_detail: 'Sy. No. 84/2 shows an unresolved mortgage encumbrance for period 2019-03-14 to 2022-08-30 (document no. KR-MYS-2019-0847231). Lender: unnamed NBFC. Transaction value: ₹4.20 Cr. The encumbrance was discharged but discharge certificate not produced at RERA registration. A document-authentication API passes this. A Kaveri registration-portal scraper catches it.',
    title_chain: [
      { year: '1988', event: 'Agricultural land parcel', parties: 'Karnataka Land Records (Survey 84/1, 84/2, 84/3)', notes: 'Original owner: H. Ramaiah, hereditary farmland' },
      { year: '2004', event: 'Survey partition order', parties: 'Revenue Dept., Mysuru Taluk', notes: 'Sy. No. 84/2 demarcated as separate plot, 3.6 acres' },
      { year: '2012', event: 'Land use conversion (NA)', parties: 'DC Order No. RRT(NA)86/2012-13', notes: 'Converted to Non-Agricultural (residential use permitted)' },
      { year: '2016', event: 'Sale deed to Zion Builders', parties: 'H. Ramaiah → Zion Builders Pvt. Ltd.', notes: 'Registered, stamp duty paid. Clean at this point.' },
      { year: '2019', event: '⚠ Mortgage encumbrance registered', parties: 'Zion Builders → unnamed NBFC', notes: 'KR-MYS-2019-0847231, ₹4.20 Cr, term 3 years', concern: true },
      { year: '2022', event: 'RERA project registration', parties: 'Zion Builders → K-RERA', notes: 'Accepted without encumbrance discharge certificate — gap in K-RERA process' },
      { year: '2022', event: 'Mortgage discharge (claimed)', parties: 'Zion Builders · NBFC', notes: 'Developer claims discharge Aug 2022, but certificate not produced', concern: true },
    ],
    court_cases: [],
    court_summary: 'No active litigation. Clean eCourts record.',
    court_status: 'PASS',
  },
  {
    id: 'prestige-lakeside',
    name: 'Prestige Lakeside',
    developer: 'Prestige Group',
    city: 'Bengaluru',
    rera_id: 'PRM/KA/RERA/1251/309/PR/180614/000143',
    doc_status:    'PASS',
    kaveri_status: 'PASS',
    title_chain: [
      { year: '2002', event: 'Land acquisition', parties: 'Prestige Estates Projects Ltd.', notes: 'Purchased from industrial land holder, clean conversion' },
      { year: '2015', event: 'BDA layout approval', parties: 'BDA + Prestige Group', notes: 'Layout sanction No. BDA/PL/28/2015, 11.2 acres' },
      { year: '2018', event: 'RERA registration', parties: 'Prestige Group → K-RERA', notes: 'All encumbrance certificates produced. Clean.' },
      { year: '2019', event: 'Construction commencement', parties: 'Prestige Group', notes: 'BBMP commencement order, no encumbrances' },
    ],
    court_cases: [],
    court_summary: 'Zero active litigation. 34-year track record with no homebuyer cases on this project.',
    court_status: 'PASS',
  },
  {
    id: 'ozone-urbana',
    name: 'Ozone Urbana',
    developer: 'Ozone Group',
    city: 'Bengaluru',
    rera_id: 'PRM/KA/RERA/1251/309/PR/171016/000112',
    doc_status:    'PASS',
    kaveri_status: 'WARN',
    kaveri_detail: 'RERA registration certificate valid. Title clear at time of loan sanction. Subsequent developments: 2 homebuyer civil suits (Q1 2022), 1 NCLT admission (Q1 2022). Original documentation passed all checks; the real risk emerged from operational failures post-sanction.',
    title_chain: [
      { year: '2010', event: 'Land purchase', parties: 'Ozone Group → KHB allotment', notes: 'Karnataka Housing Board layout, clean title' },
      { year: '2017', event: 'RERA registration', parties: 'Ozone Group → K-RERA', notes: 'Registered under MahaRERA initially, migrated to K-RERA' },
      { year: '2017', event: 'Kaveri HFC loan sanction', parties: 'Kaveri HFC → Ozone Group', notes: 'Title clear at sanction. No encumbrances.' },
    ],
    court_cases: [
      { caseNo: 'Cy/1122/2022', type: 'Civil — possession delay', filed: 'Jan 2022', status: 'Pending', amount: '₹32 L claimed' },
      { caseNo: 'Cy/1189/2022', type: 'Civil — possession delay', filed: 'Feb 2022', status: 'Pending', amount: '₹28 L claimed' },
      { caseNo: 'IBA/441/2022', type: 'NCLT admission',           filed: 'Mar 2022', status: 'Admitted, hearing ongoing', amount: '₹4.8 Cr' },
    ],
    court_summary: '2 civil suits + NCLT admission. Total financial exposure ₹5.08 Cr claimed. NCLT hearing ongoing — Kaveri HFC has filed as secured creditor.',
    court_status: 'WARN',
  },
]

const STATUS_STYLES: Record<Status, { color: string; bg: string; border: string; label: string }> = {
  PASS: { color: '#2ECC71', bg: 'rgba(46,204,113,0.10)',  border: 'rgba(46,204,113,0.30)',  label: 'PASS' },
  FAIL: { color: '#E74C3C', bg: 'rgba(231,76,60,0.10)',   border: 'rgba(231,76,60,0.30)',   label: 'FAIL' },
  WARN: { color: '#F39C12', bg: 'rgba(243,156,18,0.10)',  border: 'rgba(243,156,18,0.30)',  label: 'WARN' },
}

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status]
  const Icon = status === 'PASS' ? CheckCircle : status === 'FAIL' ? XCircle : AlertTriangle
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded-sm"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  )
}

function TitleChain({ events }: { events: TitleEvent[] }) {
  return (
    <div className="relative pl-5 space-y-4">
      {/* Vertical line */}
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
      {events.map((e, i) => (
        <div key={i} className="relative">
          <div
            className="absolute -left-3.5 top-1 w-3 h-3 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: e.concern ? '#F39C12' : '#1E1E2E',
              background:  e.concern ? 'rgba(243,156,18,0.15)' : '#0F0F1A',
            }}
          >
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: e.concern ? '#F39C12' : '#6B6B88' }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-mono text-gold">{e.year}</span>
              <span className="text-xs text-off-white font-medium">{e.event}</span>
              {e.concern && <AlertTriangle className="w-3 h-3 text-amber shrink-0" />}
            </div>
            <div className="text-[10px] text-gray">{e.parties}</div>
            {e.notes && <div className="text-[10px] text-gray-light mt-0.5 italic">{e.notes}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const [titleOpen,  setTitleOpen]  = useState(false)
  const [courtOpen,  setCourtOpen]  = useState(false)

  const overallStatus: Status =
    project.kaveri_status === 'FAIL' ? 'FAIL'
    : project.kaveri_status === 'WARN' || project.court_status === 'WARN' ? 'WARN'
    : 'PASS'

  const os = STATUS_STYLES[overallStatus]

  return (
    <div className="bg-surface border border-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 border-b border-border">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={overallStatus} />
          </div>
          <h3 className="font-syne text-lg text-off-white">{project.name}</h3>
          <div className="text-gray text-xs mt-0.5">{project.developer} · {project.city}</div>
          <div className="text-gray text-[10px] font-mono mt-0.5">{project.rera_id}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 shrink-0">
          {([
            { label: 'RERA Doc Check', status: project.doc_status,    icon: FileText },
            { label: 'Kaveri Scrape',  status: project.kaveri_status, icon: Database },
            { label: 'eCourts Check',  status: project.court_status,  icon: Scale    },
          ] as Array<{ label: string; status: Status; icon: typeof FileText }>).map(({ label, status, icon: Icon }) => {
            const s = STATUS_STYLES[status]
            return (
              <div key={label} className="text-center">
                <div
                  className="w-10 h-10 rounded-sm border flex items-center justify-center mx-auto mb-1"
                  style={{ background: s.bg, borderColor: s.border }}
                >
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <div className="text-[8px] font-mono uppercase tracking-[0.1em] text-gray leading-tight">{label}</div>
                <div className="text-[9px] font-mono font-bold mt-0.5" style={{ color: s.color }}>{s.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Kaveri detail */}
      {project.kaveri_detail && (
        <div
          className="px-5 py-3 border-b border-border"
          style={{
            background: project.kaveri_status === 'FAIL'
              ? 'rgba(231,76,60,0.06)' : 'rgba(243,156,18,0.06)',
          }}
        >
          <div className="flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{
              color: project.kaveri_status === 'FAIL' ? '#E74C3C' : '#F39C12',
            }} />
            <p className="text-xs text-gray-light leading-relaxed">{project.kaveri_detail}</p>
          </div>
        </div>
      )}

      {/* Title chain toggle */}
      {project.title_chain && project.title_chain.length > 0 && (
        <div>
          <button
            onClick={() => setTitleOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface2 transition-colors border-b border-border text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gray" />
              <span className="text-xs font-mono uppercase tracking-[0.1em] text-gray">Title Chain History</span>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 text-gray transition-transform duration-150"
              style={{ transform: titleOpen ? 'rotate(180deg)' : 'none' }}
            />
          </button>
          {titleOpen && (
            <div className="px-5 py-4 border-b border-border bg-surface2/30">
              <TitleChain events={project.title_chain} />
            </div>
          )}
        </div>
      )}

      {/* eCourts toggle */}
      <div>
        <button
          onClick={() => setCourtOpen(o => !o)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-surface2 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-3.5 h-3.5 text-gray" />
            <span className="text-xs font-mono uppercase tracking-[0.1em] text-gray">eCourts Litigation Status</span>
            <StatusBadge status={project.court_status} />
          </div>
          <ChevronDown
            className="w-3.5 h-3.5 text-gray transition-transform duration-150"
            style={{ transform: courtOpen ? 'rotate(180deg)' : 'none' }}
          />
        </button>
        {courtOpen && (
          <div className="px-5 py-4 bg-surface2/30">
            <p className="text-xs text-gray-light mb-3">{project.court_summary}</p>
            {project.court_cases && project.court_cases.length > 0 && (
              <div className="space-y-2">
                {project.court_cases.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-surface border border-border rounded-sm">
                    <Scale className="w-3.5 h-3.5 text-amber shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono text-off-white">{c.caseNo}</span>
                        <span className="text-[9px] font-mono text-gray uppercase tracking-[0.08em]">{c.type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray">
                        <span>Filed: {c.filed}</span>
                        <span>Status: <span className="text-amber">{c.status}</span></span>
                        {c.amount && <span className="text-red font-mono">{c.amount}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="p-5 max-w-[1000px] mx-auto">
      <div className="mb-6">
        <h1 className="font-syne text-xl text-off-white">Title Verification & Litigation</h1>
        <p className="text-gray text-sm mt-0.5">
          Three-layer check: RERA document scan · Kaveri registration-portal scrape · eCourts Karnataka API.
        </p>
      </div>

      {/* Moat callout */}
      <div className="mb-6 px-4 py-3 bg-gold/8 border border-gold/25 rounded-sm">
        <p className="text-gold text-xs font-medium mb-1">Why three layers?</p>
        <p className="text-gray-light text-xs leading-relaxed">
          A document-authentication API checks what the developer submitted to RERA.
          A Kaveri registration-portal scraper checks what was actually registered in the sub-registrar&rsquo;s database.
          The eCourts scrape checks active litigation against the project and developer.
          Divya Villas&rsquo; encumbrance — a ₹4.2 Cr mortgage from a shadow NBFC — passed the RERA doc check and failed only at the Kaveri scrape.
          That delta is the moat.
        </p>
      </div>

      <div className="space-y-4">
        {PROJECTS.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  )
}
