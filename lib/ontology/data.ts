import type {
  Developer, Project, Parcel, QPR, SiteVerification, Litigation,
  Encumbrance, EscrowAccount, Unit, Approval, Payment, Booking, Buyer, Link, OntObject,
} from './types'

// ── Developers (shared cast — consistent with the unified platform) ──
export const developers: Developer[] = [
  { id: 'ozone',    type: 'Developer', label: 'Ozone Group',      reputation: 9,  city: 'Bengaluru', exposure_cr: 2400 },
  { id: 'skylark',  type: 'Developer', label: 'Skylark Mansions', reputation: 54, city: 'Bengaluru', exposure_cr: 640 },
  { id: 'jda',      type: 'Developer', label: 'JDA Projects',     reputation: 78, city: 'Mysuru',    exposure_cr: 120 },
  { id: 'prestige', type: 'Developer', label: 'Prestige Group',   reputation: 91, city: 'Bengaluru', exposure_cr: 3100 },
]

// ── Projects ──
export const projects: Project[] = [
  { id: 'p1', type: 'Project', label: 'Ozone Urbana',      developerId: 'ozone',    loan_cr: 180, status: 'AT_RISK', tranche_note: 'Tranche T5 queued' },
  { id: 'p2', type: 'Project', label: 'Skylark Arcadia',   developerId: 'skylark',  loan_cr: 165, status: 'WATCH',   tranche_note: 'NOC renewal pending' },
  { id: 'p3', type: 'Project', label: 'Divya Villas',      developerId: 'jda',      loan_cr: 120, status: 'HEALTHY', tranche_note: 'Within tolerance' },
  { id: 'p4', type: 'Project', label: 'Prestige Lakeside', developerId: 'prestige', loan_cr: 210, status: 'HEALTHY', tranche_note: 'T3 auto-released' },
]

// ── Parcel (Ozone's flagged land) ──
export const parcels: Parcel[] = [
  { id: 'par', type: 'Parcel', label: 'Parcel Sy.114/2', survey: 'Sy. No. 114/2', locality: 'Devanahalli, Bengaluru Rural' },
]

// ── QPR (declared) — carries late-filing history as a compliance signal ──
export const qprs: (QPR & { late_filings: number })[] = [
  { id: 'qpr', type: 'QPR', label: "QPR Q1'26",     quarter: 'Q1 2026', declared_pct: 78, late_filings: 0 },
  { id: 'q2',  type: 'QPR', label: 'QPR · Skylark',  quarter: 'Q1 2026', declared_pct: 60, late_filings: 1 },
  { id: 'q3',  type: 'QPR', label: 'QPR · Divya',    quarter: 'Q1 2026', declared_pct: 90, late_filings: 2 },
  { id: 'q4',  type: 'QPR', label: 'QPR · Prestige', quarter: 'Q1 2026', declared_pct: 82, late_filings: 2 },
]

// ── SiteVerification (delivered) — ROADMAP capability (CV/satellite), mock values ──
export const siteVerifs: SiteVerification[] = [
  { id: 'cv', type: 'SiteVerification', label: 'CV Scan',      method: 'CV site scan', captured: '12 May 2026', delivered_pct: 54 },
  { id: 'c2', type: 'SiteVerification', label: 'CV · Skylark',  method: 'CV site scan', captured: '09 May 2026', delivered_pct: 52 },
  { id: 'c3', type: 'SiteVerification', label: 'CV · Divya',    method: 'CV site scan', captured: '14 May 2026', delivered_pct: 88 },
  { id: 'c4', type: 'SiteVerification', label: 'CV · Prestige', method: 'CV site scan', captured: '11 May 2026', delivered_pct: 81 },
]

// ── EscrowAccount (funded vs 70% mandate) ──
export const escrows: EscrowAccount[] = [
  { id: 'esc', type: 'EscrowAccount', label: 'Escrow A/C',       funded_pct: 54, mandate_pct: 70 },
  { id: 'e2',  type: 'EscrowAccount', label: 'Escrow · Skylark',  funded_pct: 60, mandate_pct: 70 },
  { id: 'e3',  type: 'EscrowAccount', label: 'Escrow · Divya',    funded_pct: 68, mandate_pct: 70 },
  { id: 'e4',  type: 'EscrowAccount', label: 'Escrow · Prestige', funded_pct: 81, mandate_pct: 70 },
]

// ── Litigation & Encumbrance (Ozone parcel only) ──
export const litigations: Litigation[] = [
  { id: 'lit', type: 'Litigation', label: 'VB/CC/2023/1847', case_no: 'VB/CC/2023/1847', court: 'eCourts · Vigilance Bench', active: true },
]
export const encumbrances: Encumbrance[] = [
  { id: 'enc', type: 'Encumbrance', label: 'Lien · Kaveri EC', kind: 'lien', source: 'Kaveri EC', active: true },
]

// ── Approvals ──
export const approvals: Approval[] = [
  { id: 'apr',  type: 'Approval', label: 'BBMP Sanction',  authority: 'BBMP', status: 'valid' },
  { id: 'apr2', type: 'Approval', label: 'NOC · Skylark',  authority: 'BBMP', status: 'expired' },
]

// ── Units ──
export const units: Unit[] = [
  { id: 'unit', type: 'Unit', label: 'Units · 240', total: 240, sold: 168 },
]

// ── ERP · Payment / collections (declared vs Kaveri-registered) ──
export const payments: Payment[] = [
  { id: 'pay',  type: 'Payment', label: 'Collections', declared_collected_pct: 62, registered_pct: 28, collected_cr: 149 },
  { id: 'pay2', type: 'Payment', label: 'Collections · Skylark',  declared_collected_pct: 54, registered_pct: 41, collected_cr: 89 },
  { id: 'pay3', type: 'Payment', label: 'Collections · Divya',    declared_collected_pct: 94, registered_pct: 92, collected_cr: 113 },
  { id: 'pay4', type: 'Payment', label: 'Collections · Prestige', declared_collected_pct: 78, registered_pct: 76, collected_cr: 164 },
]

// ── CRM · Booking / sales velocity (claimed vs Kaveri-registered) ──
export const bookings: Booking[] = [
  { id: 'bkg',  type: 'Booking', label: 'Bookings', claimed_booked_pct: 80, registered_pct: 34, total_units: 240, booked_units: 192 },
  { id: 'bkg2', type: 'Booking', label: 'Bookings · Skylark',  claimed_booked_pct: 65, registered_pct: 48, total_units: 210, booked_units: 137 },
  { id: 'bkg3', type: 'Booking', label: 'Bookings · Divya',    claimed_booked_pct: 88, registered_pct: 85, total_units: 34,  booked_units: 30 },
  { id: 'bkg4', type: 'Booking', label: 'Bookings · Prestige', claimed_booked_pct: 45, registered_pct: 42, total_units: 320, booked_units: 144 },
]

// ── CRM · Buyers (Ozone — some sales not registered) ──
export const buyers: Buyer[] = [
  { id: 'buy1', type: 'Buyer', label: 'Buyer · A-1204', unit: 'A-1204', amount_lakh: 92, registered: true },
  { id: 'buy2', type: 'Buyer', label: 'Buyer · B-0907', unit: 'B-0907', amount_lakh: 88, registered: false },
  { id: 'buy3', type: 'Buyer', label: 'Buyer · C-1611', unit: 'C-1611', amount_lakh: 104, registered: false },
]

// ── Typed links ──
export const links: Link[] = [
  // promotes
  { from: 'ozone', to: 'p1', rel: 'promotes' },
  { from: 'skylark', to: 'p2', rel: 'promotes' },
  { from: 'jda', to: 'p3', rel: 'promotes' },
  { from: 'prestige', to: 'p4', rel: 'promotes' },
  // Ozone Urbana rich subgraph
  { from: 'p1', to: 'par', rel: 'sits-on' },
  { from: 'par', to: 'enc', rel: 'has' },
  { from: 'par', to: 'lit', rel: 'subject-of' },
  { from: 'ozone', to: 'lit', rel: 'named-in' },
  { from: 'p1', to: 'qpr', rel: 'filed' },
  { from: 'p1', to: 'cv', rel: 'verified-by' },
  { from: 'p1', to: 'esc', rel: 'funded-through' },
  { from: 'p1', to: 'apr', rel: 'sanctioned-by' },
  { from: 'p1', to: 'unit', rel: 'sold-as' },
  { from: 'p1', to: 'pay', rel: 'collected-through' },   // ERP
  { from: 'p1', to: 'bkg', rel: 'booked-as' },           // CRM
  { from: 'unit', to: 'buy1', rel: 'sold-to' },
  { from: 'unit', to: 'buy2', rel: 'sold-to' },
  { from: 'unit', to: 'buy3', rel: 'sold-to' },
  { from: 'qpr', to: 'cv', rel: 'declared⟷delivered' }, // hero edge
  // peers
  { from: 'p2', to: 'q2', rel: 'filed' },
  { from: 'p2', to: 'c2', rel: 'verified-by' },
  { from: 'p2', to: 'e2', rel: 'funded-through' },
  { from: 'p2', to: 'apr2', rel: 'sanctioned-by' },
  { from: 'p2', to: 'pay2', rel: 'collected-through' },
  { from: 'p2', to: 'bkg2', rel: 'booked-as' },
  { from: 'q2', to: 'c2', rel: 'declared⟷delivered' },
  { from: 'p3', to: 'q3', rel: 'filed' },
  { from: 'p3', to: 'c3', rel: 'verified-by' },
  { from: 'p3', to: 'e3', rel: 'funded-through' },
  { from: 'p3', to: 'pay3', rel: 'collected-through' },
  { from: 'p3', to: 'bkg3', rel: 'booked-as' },
  { from: 'p4', to: 'q4', rel: 'filed' },
  { from: 'p4', to: 'c4', rel: 'verified-by' },
  { from: 'p4', to: 'e4', rel: 'funded-through' },
  { from: 'p4', to: 'pay4', rel: 'collected-through' },
  { from: 'p4', to: 'bkg4', rel: 'booked-as' },
]

// ── Object index ──
export const allObjects: OntObject[] = [
  ...developers, ...projects, ...parcels, ...qprs, ...siteVerifs,
  ...escrows, ...litigations, ...encumbrances, ...approvals, ...units,
  ...payments, ...bookings, ...buyers,
]
export const byId: Record<string, OntObject> = Object.fromEntries(allObjects.map(o => [o.id, o]))
