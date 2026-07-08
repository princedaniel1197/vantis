// ── Officer Case Cockpit — case ontology (additive) ──
// Demo / mock data on the shared cast. NOT connected to K-RERA's live case system.
import type { Tranche } from './section18'

export type CaseForm = 'Form M' | 'Form N'
export type CaseStage = 'Filed' | 'Scrutiny' | 'Notice Issued' | 'Hearing' | 'Reserved for Order' | 'Disposed'
export type TimelineKind = 'booking' | 'agreement' | 'possession' | 'payment' | 'default' | 'notice' | 'complaint' | 'hearing' | 'order'

export interface TimelineEvent {
  id: string
  date: string
  kind: TimelineKind
  title: string
  detail: string
  source: string          // source document label (click-through)
  sourceId?: string       // ontology object id, if the fact maps to one
}

export interface Hearing {
  id: string
  date: string
  bench: string
  purpose: string
  status: 'scheduled' | 'held' | 'adjourned'
}

export interface PastOrder {
  id: string
  case_no: string
  date: string
  authority: string
  summary: string
  disposition: string
}

export interface Case {
  id: string
  complaint_no: string
  form_type: CaseForm
  buyer: string
  developer: string
  developerId: string
  projectId: string           // links to ontology Project id (p1/p2/p3)
  project: string
  rera_id: string
  complaint_type: string
  filed_date: string
  compute_date: string        // "as-of" reference date for pending days + interest
  current_stage: CaseStage
  statutory_target_days: number
  promised_possession: string
  possession_status: string
  amount_paid_inr: number
  tranches: Tranche[]
  timeline: TimelineEvent[]
  hearings: Hearing[]
  past_orders: PastOrder[]
}

const COMPUTE = '2026-07-01'

// ── HERO CASE — Ozone Urbana (flagged, 60-day statutory target breached) ──
const ozoneTranches: Tranche[] = [
  { id: 't1', date: '2019-06-15', amount_inr: 500000, milestone: 'Booking amount' },
  { id: 't2', date: '2019-09-20', amount_inr: 800000, milestone: 'On agreement' },
  { id: 't3', date: '2020-02-10', amount_inr: 900000, milestone: 'Slab 3 casting' },
  { id: 't4', date: '2020-08-05', amount_inr: 1000000, milestone: 'Slab 7 casting' },
  { id: 't5', date: '2021-01-15', amount_inr: 1000000, milestone: 'Slab 11 casting' },
]

const ozone: Case = {
  id: 'c-ozone',
  complaint_no: 'CMP/190615/0002909',
  form_type: 'Form N',
  buyer: 'Priya Menon',
  developer: 'Ozone Group',
  developerId: 'ozone',
  projectId: 'p1',
  project: 'Ozone Urbana',
  rera_id: 'PRM/KA/RERA/1251/308/PR/191001/002338',
  complaint_type: 'Refund with interest under s.18 — possession delay',
  filed_date: '2024-02-14',
  compute_date: COMPUTE,
  current_stage: 'Hearing',
  statutory_target_days: 60,
  promised_possession: '2021-12-31',
  possession_status: 'Overdue 4+ years — not delivered',
  amount_paid_inr: 4200000,
  tranches: ozoneTranches,
  timeline: [
    { id: 'e1', date: '2019-06-15', kind: 'booking', title: 'Unit booked — A-1204', detail: '3BHK, Tower A · booking ₹5,00,000', source: 'Booking Form BF-2909', sourceId: 'unit' },
    { id: 'e2', date: '2019-07-04', kind: 'agreement', title: 'Sale agreement executed', detail: 'Possession clause §4.2 — promised 31 Dec 2021', source: 'Sale Agreement §4.2 · Kaveri Deed 2281/09', sourceId: 'par' },
    { id: 'e3', date: '2019-09-20', kind: 'payment', title: 'Tranche paid — on agreement', detail: '₹8,00,000', source: 'Bank receipt RCPT-0920', sourceId: 'pay' },
    { id: 'e4', date: '2020-08-05', kind: 'payment', title: 'Tranche paid — Slab 7', detail: '₹10,00,000 · cumulative ₹32,00,000', source: 'Bank receipt RCPT-0805', sourceId: 'pay' },
    { id: 'e5', date: '2021-12-31', kind: 'default', title: 'Promised possession missed', detail: 'No OC, construction ~30% (CV) vs 78% declared', source: 'K-RERA possession record · CV scan', sourceId: 'cv' },
    { id: 'e6', date: '2024-01-22', kind: 'notice', title: 'K-RERA show-cause notice', detail: 'QPR default + escrow shortfall (54% vs 70%)', source: 'SCN/K-RERA/2024/0112', sourceId: 'esc' },
    { id: 'e7', date: '2024-02-14', kind: 'complaint', title: 'Complaint filed (Form N)', detail: 'Refund + interest under s.18', source: 'Complaint CMP/190615/0002909' },
    { id: 'e8', date: '2024-06-18', kind: 'hearing', title: 'First hearing — appearance', detail: 'Respondent sought time; matter adjourned', source: 'Cause list · Order sheet 18-Jun-2024' },
  ],
  hearings: [
    { id: 'h1', date: '2024-06-18', bench: 'Member (Adjudicating Officer)', purpose: 'Appearance & admission', status: 'adjourned' },
    { id: 'h2', date: '2026-07-15', bench: 'Member (Adjudicating Officer)', purpose: 'Arguments on s.18 relief', status: 'scheduled' },
  ],
  past_orders: [
    { id: 'o1', case_no: 'CMP/2023/0417', date: '2023-11-09', authority: 'K-RERA (AO)', summary: 'Ozone Urbana — refund + interest to complainant on possession delay', disposition: 'Allowed · refund with s.18 interest ordered' },
    { id: 'o2', case_no: 'RRC-2024-001', date: '2024-03-02', authority: 'K-RERA', summary: 'Ozone Group — recovery certificate for unpaid penalty', disposition: 'Issued · ₹45.75L outstanding' },
  ],
}

// ── CLEAN CONTRAST — Prestige (within statutory window, no breach) ──
const prestige: Case = {
  id: 'c-prestige',
  complaint_no: 'CMP/260610/0007412',
  form_type: 'Form M',
  buyer: 'Rahul Iyer',
  developer: 'Prestige Group',
  developerId: 'prestige',
  projectId: 'p4',
  project: 'Prestige Lakeside',
  rera_id: 'PRM/KA/RERA/1251/309/PR/200414/001914',
  complaint_type: 'Clarification on milestone billing',
  filed_date: '2026-06-10',
  compute_date: COMPUTE,
  current_stage: 'Scrutiny',
  statutory_target_days: 60,
  promised_possession: '2026-12-31',
  possession_status: 'On schedule',
  amount_paid_inr: 6800000,
  tranches: [
    { id: 'pt1', date: '2024-05-10', amount_inr: 3400000, milestone: 'Booking + agreement' },
    { id: 'pt2', date: '2025-02-14', amount_inr: 3400000, milestone: 'Slab milestone' },
  ],
  timeline: [
    { id: 'pe1', date: '2024-05-10', kind: 'booking', title: 'Unit booked', detail: 'On-track project', source: 'Booking Form BF-7412' },
    { id: 'pe2', date: '2026-06-10', kind: 'complaint', title: 'Complaint filed (Form M)', detail: 'Billing clarification only', source: 'Complaint CMP/260610/0007412' },
  ],
  hearings: [{ id: 'ph1', date: '2026-07-20', bench: 'Secretariat', purpose: 'Conciliation', status: 'scheduled' }],
  past_orders: [],
}

// ── CLEAN CONTRAST — Divya / JDA (minor, within window) ──
const divya: Case = {
  id: 'c-divya',
  complaint_no: 'CMP/260618/0007034',
  form_type: 'Form M',
  buyer: 'Anitha Rao',
  developer: 'JDA Projects',
  developerId: 'jda',
  projectId: 'p3',
  project: 'Divya Villas',
  rera_id: 'PRM/KA/RERA/1252/447/PR/030223/006012',
  complaint_type: 'Snag-list rectification request',
  filed_date: '2026-06-18',
  compute_date: COMPUTE,
  current_stage: 'Filed',
  statutory_target_days: 60,
  promised_possession: '2025-10-30',
  possession_status: 'Delivered · defect-liability period',
  amount_paid_inr: 4900000,
  tranches: [{ id: 'dt1', date: '2023-03-01', amount_inr: 4900000, milestone: 'Full payment (villa)' }],
  timeline: [
    { id: 'de1', date: '2023-02-03', kind: 'booking', title: 'Villa booked', detail: 'Fully documented', source: 'Booking Form BF-7034' },
    { id: 'de2', date: '2026-06-18', kind: 'complaint', title: 'Complaint filed (Form M)', detail: 'Snag rectification', source: 'Complaint CMP/260618/0007034' },
  ],
  hearings: [],
  past_orders: [],
}

export const cases: Case[] = [ozone, prestige, divya]

// Deterministic pending-days vs the 60-day statutory target.
function daysBetween(a: string, b: string): number {
  const x = new Date(a + 'T00:00:00Z').getTime(), y = new Date(b + 'T00:00:00Z').getTime()
  if (Number.isNaN(x) || Number.isNaN(y)) return 0
  return Math.max(0, Math.round((y - x) / 86400000))
}
export function daysPending(c: Case): number { return daysBetween(c.filed_date, c.compute_date) }
export function isBreached(c: Case): boolean { return daysPending(c) > c.statutory_target_days }
export function getCase(id: string): Case | undefined { return cases.find(c => c.id === id) }
