'use client'

import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import {
  cases, getCase, daysPending, isBreached, computeSection18, inr,
  scoredProjects, signalsFor, type Case, type TimelineEvent, type Section18Result,
} from '@/lib/ontology'

const C = {
  ink: '#eaf2f6', muted: '#94a6b0', dim: '#7f97a4', faint: '#5e7280',
  cyan: '#3fe0ff', cyanHi: '#b8f4ff', gold: '#e8d5a3', goldDim: '#c9a84c',
  green: '#45e0c0', blue: '#8fb3ff', risk: '#ff7a6d', riskCore: '#ff5a4d', watch: '#f0a24a',
  surf: 'rgba(12,18,26,0.5)', bord: 'rgba(90,150,175,0.12)',
}
const mono = 'var(--font-jet), monospace'
const space = 'var(--font-space), sans-serif'

const card = (extra: CSSProperties = {}): CSSProperties => ({
  background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 13, padding: 18, ...extra,
})
const Label = ({ children }: { children: ReactNode }) => (
  <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.22em', color: C.faint, marginBottom: 12 }}>{children}</div>
)

const KIND_COLOR: Record<string, string> = {
  booking: C.blue, agreement: C.blue, payment: C.green, possession: C.watch,
  default: C.riskCore, notice: C.watch, complaint: C.cyan, hearing: C.gold, order: C.gold,
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 1, background: C.bord }} />
      {events.map(e => {
        const col = KIND_COLOR[e.kind] || C.muted
        const isOpen = open === e.id
        return (
          <div key={e.id} onClick={() => setOpen(isOpen ? null : e.id)} style={{ position: 'relative', paddingLeft: 26, paddingBottom: 15, cursor: 'pointer' }}>
            <span style={{ position: 'absolute', left: 3, top: 3, width: 9, height: 9, borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}99`, border: '2px solid #0a0f18' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontFamily: space, fontWeight: 600, fontSize: 13, color: C.ink }}>{e.title}</div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.dim, whiteSpace: 'nowrap' }}>{e.date}</div>
            </div>
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.06em', color: col, marginTop: 3, textTransform: 'uppercase' }}>{e.kind}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{e.detail}</div>
            <div style={{ fontFamily: mono, fontSize: 9.5, color: C.cyan, marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ opacity: 0.7 }}>↳ source:</span> {e.source} {isOpen ? '▴' : '▾'}
            </div>
            {isOpen && (
              <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 8, background: 'rgba(63,224,255,0.05)', border: '1px solid rgba(63,224,255,0.2)', fontSize: 11, color: C.muted }}>
                Cited document: <span style={{ color: C.cyanHi }}>{e.source}</span>{e.sourceId ? <> · linked object <span style={{ fontFamily: mono, color: C.gold }}>{e.sourceId}</span></> : null}. Officer to verify against the original before relying on it.
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Section18Panel({ r }: { r: Section18Result }) {
  return (
    <div style={card()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <Label>D · SECTION 18 INTEREST · DETERMINISTIC CALCULATOR</Label>
        <span style={{ fontFamily: mono, fontSize: 8, color: C.green, border: `1px solid ${C.green}44`, borderRadius: 5, padding: '2px 6px' }}>RULE-BASED · NOT AI</span>
      </div>
      <div style={{ fontFamily: mono, fontSize: 11, color: C.cyanHi, background: 'rgba(63,224,255,0.05)', border: '1px solid rgba(63,224,255,0.18)', borderRadius: 8, padding: '8px 10px', marginBottom: 12 }}>
        interest = principal × (SBI MCLR <span style={{ color: C.gold }}>{r.mclr_pct}%</span> + <span style={{ color: C.gold }}>{r.spread_pct}%</span> = <span style={{ color: C.gold }}>{r.rate_pct}%</span>) × days ÷ 365
        <div style={{ color: C.dim, fontSize: 9, marginTop: 3 }}>{r.basis} · computed as of {r.compute_date}</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.bord}` }}>
              {['Tranche', 'Paid on', 'Principal', 'Days', 'Interest'].map((h, i) => (
                <th key={h} style={{ textAlign: i > 1 ? 'right' : 'left', padding: '6px 8px', fontFamily: mono, fontSize: 8.5, letterSpacing: '0.14em', color: C.faint, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {r.tranches.map(t => (
              <tr key={t.id} style={{ borderBottom: `1px solid ${C.bord}` }}>
                <td style={{ padding: '6px 8px', color: C.ink }}>{t.milestone}</td>
                <td style={{ padding: '6px 8px', fontFamily: mono, fontSize: 10, color: C.dim }}>{t.date}</td>
                <td style={{ padding: '6px 8px', fontFamily: mono, textAlign: 'right', color: C.ink }}>{inr(t.amount_inr)}</td>
                <td style={{ padding: '6px 8px', fontFamily: mono, textAlign: 'right', color: C.muted }}>{t.days}</td>
                <td style={{ padding: '6px 8px', fontFamily: mono, textAlign: 'right', color: C.blue }}>{inr(t.interest_inr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        {[
          { l: 'PRINCIPAL', v: inr(r.principal_inr), c: C.ink },
          { l: 'INTEREST (s.18)', v: inr(r.interest_inr), c: C.blue },
          { l: 'TOTAL PAYABLE', v: inr(r.payable_inr), c: C.gold },
        ].map(x => (
          <div key={x.l} style={{ flex: 1, padding: '10px 12px', borderRadius: 9, background: 'rgba(11,16,24,0.5)', border: `1px solid ${C.bord}` }}>
            <div style={{ fontFamily: space, fontWeight: 700, fontSize: 17, color: x.c }}>{x.v}</div>
            <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.12em', color: C.faint, marginTop: 2 }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function buildDraft(c: Case, r: Section18Result): string {
  const proj = scoredProjects().find(p => p.id === c.projectId)
  const sig = signalsFor(c.projectId)
  const nextHearing = c.hearings.find(h => h.status === 'scheduled')
  return (
    `BEFORE THE KARNATAKA REAL ESTATE REGULATORY AUTHORITY\n` +
    `Complaint No. ${c.complaint_no}    (${c.form_type})\n\n` +
    `${c.buyer}\t\t\t… Complainant\n` +
    `v.\n` +
    `${c.developer}\t\t\t… Respondent\n\n` +
    `DRAFT ORDER (PROCEDURAL) — OFFICER TO VERIFY, EDIT & SIGN\n` +
    `${'─'.repeat(58)}\n\n` +
    `1. The complaint under ${c.form_type} concerns ${c.complaint_type.toLowerCase()} in ${c.project} (RERA ${c.rera_id}).\n\n` +
    `2. On the record, the complainant has paid ${inr(c.amount_paid_inr)} across ${c.tranches.length} tranches. Possession promised ${c.promised_possession} is recorded as: ${c.possession_status}.\n\n` +
    `3. Project record: execution score ${proj?.score ?? '—'}; QPR declared ${sig.declared_pct}% vs site-verified ${sig.delivered_pct}%; escrow funded ${sig.escrow_funded}% against the 70% mandate; active litigations ${sig.active_litigations}, encumbrances ${sig.active_encumbrances}.\n\n` +
    `4. Interest under Section 18 has been computed (deterministically) at SBI MCLR ${r.mclr_pct}% + 2% = ${r.rate_pct}% per annum, per tranche from date of payment: principal ${inr(r.principal_inr)}, interest ${inr(r.interest_inr)}, aggregate ${inr(r.payable_inr)} (see calculator).\n\n` +
    `5. ${nextHearing ? `The matter is listed for hearing on ${nextHearing.date} before the ${nextHearing.bench}. Parties shall file written submissions in advance.` : `The matter shall be listed for hearing. Parties shall file written submissions.`}\n\n` +
    `${'─'.repeat(58)}\n` +
    `[This is a machine-assembled FIRST DRAFT from case facts. It records the position and lists the matter — it does NOT decide the complaint or recommend an outcome. The Adjudicating Officer must verify every fact against source, edit as required, and sign.]\n`
  )
}

export default function CaseCockpit() {
  const [caseId, setCaseId] = useState('c-ozone')
  const c = getCase(caseId) ?? cases[0]
  const s18 = useMemo(() => computeSection18(c.tranches, c.compute_date), [c])
  const proj = scoredProjects().find(p => p.id === c.projectId)
  const sig = signalsFor(c.projectId)
  const pending = daysPending(c)
  const breached = isBreached(c)
  const [draft, setDraft] = useState('')

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
      {/* case list rail */}
      <div className="vg-scroll" style={{ width: 300, flex: 'none', borderRight: `1px solid ${C.bord}`, background: 'linear-gradient(180deg, rgba(9,14,22,0.5), rgba(6,9,15,0.2))', overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 10px', borderRadius: 8, background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.28)', marginBottom: 16 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.goldDim, boxShadow: `0 0 8px ${C.goldDim}` }} />
          <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: C.gold }}>OFFICER ASSIST · HUMAN DECIDES</span>
        </div>
        <Label>ACTIVE COMPLAINTS</Label>
        {cases.map(k => {
          const on = k.id === caseId
          const br = isBreached(k)
          return (
            <button key={k.id} onClick={() => { setCaseId(k.id); setDraft('') }}
              style={{ width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 9, padding: 12, borderRadius: 11, background: on ? 'rgba(63,224,255,0.06)' : 'rgba(11,16,24,0.42)', border: `1px solid ${on ? 'rgba(63,224,255,0.35)' : C.bord}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: on ? C.cyanHi : C.muted }}>{k.complaint_no}</span>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: br ? C.riskCore : C.green, boxShadow: `0 0 7px ${br ? C.riskCore : C.green}99` }} />
              </div>
              <div style={{ fontFamily: space, fontWeight: 600, fontSize: 13, color: C.ink, marginTop: 5 }}>{k.buyer} <span style={{ color: C.dim, fontWeight: 400 }}>v.</span> {k.developer}</div>
              <div style={{ fontFamily: mono, fontSize: 8.5, color: C.dim, marginTop: 4 }}>{k.form_type} · {k.current_stage} · {daysPending(k)}d</div>
            </button>
          )
        })}
      </div>

      {/* main case file */}
      <div className="vg-scroll" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: 22 }}>
        {/* (a) header */}
        <div style={card({ marginBottom: 16, borderColor: breached ? 'rgba(255,90,77,0.3)' : C.bord })}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: C.faint }}>CASE FILE · {c.form_type.toUpperCase()}</div>
              <div style={{ fontFamily: space, fontWeight: 600, fontSize: 22, color: C.ink, marginTop: 5 }}>{c.buyer} <span style={{ color: C.dim, fontWeight: 400, fontSize: 16 }}>v.</span> {c.developer}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 6 }}>{c.complaint_no} · {c.project} · <span style={{ color: C.gold }}>{c.rera_id.slice(-14)}</span></div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6 }}>{c.complaint_type} · stage: <span style={{ color: C.cyanHi }}>{c.current_stage}</span></div>
            </div>
            <div style={{ textAlign: 'right', flex: 'none', padding: '10px 14px', borderRadius: 10, background: breached ? 'rgba(255,90,77,0.07)' : 'rgba(69,224,192,0.06)', border: `1px solid ${breached ? 'rgba(255,90,77,0.3)' : 'rgba(69,224,192,0.25)'}` }}>
              <div style={{ fontFamily: space, fontWeight: 700, fontSize: 26, color: breached ? C.risk : C.green }}>{pending}d</div>
              <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.1em', color: C.dim, marginTop: 2 }}>PENDING · TARGET {c.statutory_target_days}d</div>
              <div style={{ fontFamily: mono, fontSize: 8.5, color: breached ? C.risk : C.green, marginTop: 4 }}>{breached ? `⚠ BREACHED +${pending - c.statutory_target_days}d` : 'WITHIN WINDOW'}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: 16, marginBottom: 16 }}>
          {/* (b) timeline */}
          <div style={card()}>
            <Label>B · AUTO-ASSEMBLED CASE TIMELINE</Label>
            <Timeline events={c.timeline} />
          </div>

          {/* (c) linked project record */}
          <div style={card()}>
            <Label>C · LINKED PROJECT RECORD</Label>
            {[
              ['Execution score', String(proj?.score ?? '—'), 'ontology · derived'],
              ['QPR declared / delivered', `${sig.declared_pct}% / ${sig.delivered_pct}%`, 'QPR · CV scan'],
              ['Escrow funded', `${sig.escrow_funded}% / ${sig.escrow_mandate}%`, 'escrow ledger'],
              ['Active litigation', sig.active_litigations > 0 ? `${sig.active_litigations} · VB/CC/2023/1847` : 'none', 'eCourts'],
              ['Active encumbrance', sig.active_encumbrances > 0 ? `${sig.active_encumbrances} · lien (Kaveri EC)` : 'none', 'Kaveri EC'],
            ].map(([k, v, src]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, padding: '7px 0', borderBottom: `1px solid ${C.bord}` }}>
                <span style={{ fontSize: 12, color: C.muted }}>{k}</span>
                <span style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: mono, fontSize: 12, color: C.ink }}>{v}</span>
                  <span style={{ display: 'block', fontFamily: mono, fontSize: 8, color: C.cyan }}>↳ {src}</span>
                </span>
              </div>
            ))}
            <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', color: C.faint, margin: '14px 0 8px' }}>PAST ORDERS · SAME DEVELOPER</div>
            {c.past_orders.length === 0
              ? <div style={{ fontSize: 12, color: C.dim }}>No prior orders on record.</div>
              : c.past_orders.map(o => (
                <div key={o.id} style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.18)', marginBottom: 7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontFamily: mono, fontSize: 10, color: C.gold }}>{o.case_no}</span><span style={{ fontFamily: mono, fontSize: 9, color: C.dim }}>{o.date}</span></div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{o.summary}</div>
                  <div style={{ fontFamily: mono, fontSize: 9.5, color: C.watch, marginTop: 3 }}>{o.disposition}</div>
                </div>
              ))}
            <div style={{ fontFamily: mono, fontSize: 8.5, color: C.faint, marginTop: 8, lineHeight: 1.5 }}>Past orders are shown as factual history only — not as precedent or an outcome recommendation.</div>
          </div>
        </div>

        {/* (d) section 18 calculator */}
        <div style={{ marginBottom: 16 }}><Section18Panel r={s18} /></div>

        {/* (e) draft order */}
        <div style={card()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Label>E · PREPARE ORDER DRAFT</Label>
            <button onClick={() => setDraft(buildDraft(c, s18))}
              style={{ cursor: 'pointer', border: 'none', borderRadius: 8, padding: '7px 14px', background: 'linear-gradient(135deg,#3fe0ff,#2ba8c4)', color: '#04121a', fontFamily: space, fontWeight: 600, fontSize: 12 }}>
              Generate first draft
            </button>
          </div>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Click “Generate first draft” to assemble a procedural order from the case facts. You can then edit every line before signing."
            style={{ width: '100%', minHeight: 220, resize: 'vertical', background: 'rgba(8,12,18,0.7)', border: `1px solid ${C.bord}`, borderRadius: 10, color: C.ink, fontFamily: mono, fontSize: 11.5, lineHeight: 1.65, padding: 14, outline: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.faint, maxWidth: 520, lineHeight: 1.5 }}>
              Procedural first draft only — it lists the matter and records the position; it does <span style={{ color: C.risk }}>not</span> decide the complaint, predict an outcome, or cite case-law. The Officer edits and signs; nothing is auto-issued.
            </div>
            <button disabled title="The Adjudicating Officer signs offline. Nothing is auto-issued."
              style={{ cursor: 'not-allowed', border: `1px solid ${C.bord}`, borderRadius: 8, padding: '7px 14px', background: 'transparent', color: C.faint, fontFamily: space, fontWeight: 600, fontSize: 12 }}>
              Officer signs offline
            </button>
          </div>
        </div>

        <div style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: '0.06em', color: C.faint, textAlign: 'center', margin: '18px 0 8px' }}>
          OFFICER ASSIST — HUMAN DECIDES · DEMO ON MOCK ONTOLOGY DATA · NOT CONNECTED TO K-RERA'S LIVE CASE SYSTEM
        </div>
      </div>
    </div>
  )
}
