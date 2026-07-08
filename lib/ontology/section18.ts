// ── RERA Section 18 interest calculator ──
// DETERMINISTIC, rule-based. No LLM, no randomness, no Date.now — same inputs
// always produce the same output. This is a real calculator, so there is zero
// hallucination surface: the officer sees the formula, inputs and per-tranche math.

export interface Tranche {
  id: string
  date: string            // ISO date the buyer paid this tranche
  amount_inr: number
  milestone: string
}

export interface TrancheInterest extends Tranche {
  days: number
  interest_inr: number
}

export interface Section18Result {
  mclr_pct: number
  spread_pct: number
  rate_pct: number
  compute_date: string
  basis: string
  tranches: TrancheInterest[]
  principal_inr: number
  interest_inr: number
  payable_inr: number
}

// SBI 1-year MCLR — a fixed demo constant (as-of 01 Apr 2026). RERA Rules: MCLR + 2%.
export const SBI_MCLR_PCT = 8.85
export const SECTION18_SPREAD_PCT = 2

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + 'T00:00:00Z').getTime()
  const b = new Date(toISO + 'T00:00:00Z').getTime()
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.max(0, Math.round((b - a) / 86400000))
}

// interest_i = principal_i × (MCLR + spread)% × days_i ÷ 365  (simple, per tranche)
export function computeSection18(
  tranches: Tranche[],
  computeDate: string,
  mclr: number = SBI_MCLR_PCT,
  spread: number = SECTION18_SPREAD_PCT,
): Section18Result {
  const rate = mclr + spread
  const rows: TrancheInterest[] = tranches.map(t => {
    const days = daysBetween(t.date, computeDate)
    const interest = t.amount_inr * (rate / 100) * (days / 365)
    return { ...t, days, interest_inr: Math.round(interest) }
  })
  const principal = tranches.reduce((s, t) => s + t.amount_inr, 0)
  const interest = rows.reduce((s, r) => s + r.interest_inr, 0)
  return {
    mclr_pct: mclr, spread_pct: spread, rate_pct: rate, compute_date: computeDate,
    basis: 'RERA s.18 — SBI 1-year MCLR + 2%, simple interest per tranche from date of payment to computation date.',
    tranches: rows, principal_inr: principal, interest_inr: interest, payable_inr: principal + interest,
  }
}

// ₹ formatter — Indian grouping, whole rupees.
export function inr(n: number): string {
  return '₹' + Math.round(n).toLocaleString('en-IN')
}
