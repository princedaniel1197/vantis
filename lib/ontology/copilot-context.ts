// Ontology-augmented context for the Cross-Stage Copilot.
// Builds the COMPLETE structured dataset (every object + derived score/signal) so
// Claude answers grounded in the real data, and handles greetings/meta locally.
import {
  developers, parcels, litigations, encumbrances, escrows, units, payments, bookings, buyers, links, allObjects,
} from './data'
import { scoredProjects, financeRows, salesRows } from './scoring'
import { cases, daysPending, isBreached } from './cases'
import { computeSection18 } from './section18'
import type { CopilotAnswer } from './copilot-scenarios'

// Every valid object id — used to validate/clean LLM-returned focusIds.
export const VALID_IDS = new Set(allObjects.map(o => o.id))
export const WATCHLIST = ['Ozone Urbana', 'Skylark Arcadia', 'Divya Villas', 'Prestige Lakeside']

// The full, structured, ground-truth context. Numbers here are the SAME derived
// values the screens render — the LLM must quote them, never recompute.
export function buildOntologyContext(question: string) {
  const projects = scoredProjects().map(p => ({
    id: p.id, name: p.label, developer: p.developerLabel, loan_cr: p.loan_cr, status: p.status,
    execution_score: p.score,
    declared_construction_pct: p.signals.declared_pct, delivered_construction_pct: p.signals.delivered_pct,
    construction_gap_pts: p.signals.gap,
    escrow_funded_pct: p.signals.escrow_funded, escrow_mandate_pct: p.signals.escrow_mandate, escrow_shortfall_pts: p.signals.escrow_shortfall,
    active_litigations: p.signals.active_litigations, active_encumbrances: p.signals.active_encumbrances,
    expired_approvals: p.signals.expired_approvals, late_qpr_filings: p.signals.late_filings,
  }))
  const finance_erp = financeRows().map(r => ({
    project: r.project, developer: r.developer, declared_collections_pct: r.declared_pct,
    kaveri_registered_pct: r.registered_pct, financial_gap_pts: r.fin_gap, collected_cr: r.collected_cr,
    escrow_funded_pct: r.escrow_funded, escrow_mandate_pct: r.escrow_mandate, tier: r.tier,
  }))
  const sales_crm = salesRows().map(r => ({
    project: r.project, developer: r.developer, claimed_booked_pct: r.claimed_pct,
    kaveri_registered_pct: r.registered_pct, sales_gap_pts: r.sales_gap,
    total_units: r.total_units, booked_units: r.booked_units, tier: r.tier,
  }))
  return {
    question,
    developers: developers.map(d => ({ id: d.id, name: d.label, reputation_score: d.reputation, city: d.city, exposure_cr: d.exposure_cr })),
    projects,
    finance_erp,
    sales_crm,
    parcels, litigation: litigations, encumbrances, escrow_accounts: escrows, units, payments, bookings, buyers,
    cases: cases.map(c => ({
      complaint_no: c.complaint_no, form_type: c.form_type, buyer: c.buyer, developer: c.developer,
      project: c.project, complaint_type: c.complaint_type, current_stage: c.current_stage,
      filed_date: c.filed_date, days_pending: daysPending(c), statutory_target_days: c.statutory_target_days,
      statutory_breach: isBreached(c), promised_possession: c.promised_possession, possession_status: c.possession_status,
      amount_paid_inr: c.amount_paid_inr, past_orders: c.past_orders,
      section18: (() => { const r = computeSection18(c.tranches, c.compute_date); return { rate_pct: r.rate_pct, principal_inr: r.principal_inr, interest_inr: r.interest_inr, payable_inr: r.payable_inr } })(),
    })),
    links,
    dataset_note:
      'This intelligence watchlist tracks exactly these 4 projects in depth (Ozone Urbana, Skylark Arcadia, Divya Villas, Prestige Lakeside) and their linked objects. ' +
      'The full K-RERA registry has 8,771 projects, but ONLY these 4 have detailed intelligence objects. ' +
      'If asked about any other project, developer, number, or fact not present above, you MUST say it is not in the current dataset — never invent it.',
  }
}

// Deterministic conversational / greeting handling — always works, no LLM needed.
const OVERVIEW = ['ozone', 'p1', 'p2', 'p3', 'p4', 'skylark', 'jda', 'prestige']

export function conversationalAnswer(query: string): CopilotAnswer | null {
  const q = query.toLowerCase().trim().replace(/[!.?,]+$/, '')
  const greet = /^(hi|hey+|hello|yo|hiya|hola|namaste|sup|greetings|good (morning|afternoon|evening|day))\b/.test(q) || q === 'hi' || q === 'hello'
  const help = /(what can you (do|answer|tell)|^help$|who are you|what are you|how (do|does) (you|this) work|your capabilities|what do you know|what can i ask)/.test(q)
  const thanks = q.length <= 22 && /^(thanks?|thank you|thx|ty|great|nice|cool|perfect|awesome|got it)\b/.test(q)

  if (greet || help) {
    return {
      chips: [],
      paras: [
        `I'm the <strong style="color:#fff;">Vantis Cross-Stage Copilot</strong>. I reason over your live ontology — a 4-project watchlist (<strong style="color:#fff;">Ozone Urbana, Skylark Arcadia, Divya Villas, Prestige Lakeside</strong>) and every linked object: QPR filings, site verification, escrow, ERP collections, CRM bookings, litigation, encumbrances and title.`,
        `Ask me anything grounded in that data — construction gaps, <span style="color:#8fb3ff;">escrow shortfalls</span>, ERP <span style="color:#8fb3ff;">collections vs Kaveri</span>, CRM <span style="color:#8fb3ff;">booking velocity</span>, litigation, developer risk, or what to do about a tranche. I answer <strong style="color:#fff;">only</strong> from the data — and I'll tell you plainly if something isn't in it.`,
      ],
      citations: [],
      focusIds: OVERVIEW,
    }
  }
  if (thanks) {
    return { chips: [], paras: [`Anytime. Ask another question, or try a cross-lifecycle prompt below.`], citations: [], focusIds: OVERVIEW }
  }
  return null
}

// Graceful "not in data" answer — used when the LLM path is unavailable or fails.
export const UNKNOWN_ANSWER: CopilotAnswer = {
  chips: [],
  paras: [
    `I don't have that in my current dataset. I track the 4 watchlist projects — <strong style="color:#fff;">Ozone Urbana, Skylark Arcadia, Divya Villas, Prestige Lakeside</strong> — and their execution scores, escrow, collections, bookings, litigation and title.`,
    `Try asking about one of those, or pick a suggested prompt below.`,
  ],
  citations: [],
  focusIds: OVERVIEW,
}
