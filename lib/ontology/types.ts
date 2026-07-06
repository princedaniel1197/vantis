// ── Vantis Intelligence Layer · Ontology types ──
// A canonical, typed object graph. Objects are nodes; links are typed edges.
// This is a NEW, additive module — existing screens do not read from it.

export type ObjectType =
  | 'Developer'
  | 'Project'
  | 'Parcel'
  | 'QPR'
  | 'SiteVerification'
  | 'Litigation'
  | 'Encumbrance'
  | 'EscrowAccount'
  | 'Unit'
  | 'Approval'
  | 'Payment'          // ERP — collections ledger (declared vs Kaveri-registered)
  | 'Booking'          // CRM — sales velocity (claimed booked vs registered)
  | 'Buyer'            // CRM — individual buyer/unit sale

export type LinkType =
  | 'promotes'          // Developer -> Project
  | 'sits-on'           // Project -> Parcel
  | 'has'               // Parcel -> Encumbrance
  | 'subject-of'        // Parcel -> Litigation
  | 'named-in'          // Developer -> Litigation
  | 'filed'             // Project -> QPR
  | 'verified-by'       // Project -> SiteVerification
  | 'funded-through'    // Project -> EscrowAccount
  | 'sanctioned-by'     // Project -> Approval
  | 'sold-as'           // Project -> Unit
  | 'collected-through' // Project -> Payment (ERP)
  | 'booked-as'         // Project -> Booking (CRM)
  | 'sold-to'           // Unit -> Buyer (CRM)
  | 'declared⟷delivered'// QPR -> SiteVerification (hero edge)
  | 'declared⟷registered'// Payment/Booking verification edge

export type RiskTier = 'AT_RISK' | 'WATCH' | 'HEALTHY'

interface BaseObject {
  id: string
  type: ObjectType
  label: string
}

export interface Developer extends BaseObject {
  type: 'Developer'
  reputation: number          // 0-100 records-based reputation
  city: string
  exposure_cr: number
}

export interface Project extends BaseObject {
  type: 'Project'
  developerId: string
  loan_cr: number
  status: RiskTier
  tranche_note: string
}

export interface Parcel extends BaseObject {
  type: 'Parcel'
  survey: string
  locality: string
}

export interface QPR extends BaseObject {
  type: 'QPR'
  quarter: string
  declared_pct: number        // developer-declared construction %
}

export interface SiteVerification extends BaseObject {
  type: 'SiteVerification'
  method: string              // e.g. "CV site scan" — ROADMAP capability
  captured: string
  delivered_pct: number       // measured-actual construction % (mock/roadmap)
}

export interface Litigation extends BaseObject {
  type: 'Litigation'
  case_no: string
  court: string
  active: boolean
}

export interface Encumbrance extends BaseObject {
  type: 'Encumbrance'
  kind: string                // mortgage / lien / attachment
  source: string              // Kaveri EC etc.
  active: boolean
}

export interface EscrowAccount extends BaseObject {
  type: 'EscrowAccount'
  funded_pct: number          // funded vs the 70% RERA mandate
  mandate_pct: number
}

export interface Unit extends BaseObject {
  type: 'Unit'
  total: number
  sold: number
}

export interface Approval extends BaseObject {
  type: 'Approval'
  authority: string           // BBMP / BDA / MUDA
  status: 'valid' | 'pending' | 'expired'
}

export interface Payment extends BaseObject {
  type: 'Payment'
  // ERP — collections ledger. declared = developer's RERA statement,
  // registered = actual buyer registrations in Kaveri (roadmap connector, mock).
  declared_collected_pct: number
  registered_pct: number
  collected_cr: number
}

export interface Booking extends BaseObject {
  type: 'Booking'
  // CRM — sales velocity. claimed = CRM/Sell.Do booked %, registered = Kaveri.
  claimed_booked_pct: number
  registered_pct: number
  total_units: number
  booked_units: number
}

export interface Buyer extends BaseObject {
  type: 'Buyer'
  unit: string
  amount_lakh: number
  registered: boolean
}

export type OntObject =
  | Developer | Project | Parcel | QPR | SiteVerification
  | Litigation | Encumbrance | EscrowAccount | Unit | Approval
  | Payment | Booking | Buyer

export interface Link {
  from: string
  to: string
  rel: LinkType
}
