import type { Project, RiskTier } from './types'
import {
  links, projects, qprs, siteVerifs, escrows, litigations, encumbrances, approvals, developers,
} from './data'

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

// Objects linked out of a given object by relation
function linkedTo(fromId: string, rel: string): string[] {
  return links.filter(l => l.from === fromId && l.rel === rel).map(l => l.to)
}
function linkedFrom(toId: string, rel: string): string[] {
  return links.filter(l => l.to === toId && l.rel === rel).map(l => l.from)
}

export interface ProjectSignals {
  declared_pct: number
  delivered_pct: number
  gap: number                 // declared − delivered (positive = overstatement)
  escrow_funded: number
  escrow_mandate: number
  escrow_shortfall: number
  active_litigations: number
  active_encumbrances: number
  expired_approvals: number
  pending_approvals: number
  late_filings: number
}

// Gather every signal for a project by walking its typed links.
export function signalsFor(projectId: string): ProjectSignals {
  const qprId = linkedTo(projectId, 'filed')[0]
  const cvId = linkedTo(projectId, 'verified-by')[0]
  const escId = linkedTo(projectId, 'funded-through')[0]
  const aprIds = linkedTo(projectId, 'sanctioned-by')
  const parcelIds = linkedTo(projectId, 'sits-on')

  const qpr = qprs.find(q => q.id === qprId)
  const cv = siteVerifs.find(s => s.id === cvId)
  const esc = escrows.find(e => e.id === escId)
  const aprs = approvals.filter(a => aprIds.includes(a.id))

  // litigation/encumbrance reachable via the parcel
  let activeLit = 0, activeEnc = 0
  for (const parId of parcelIds) {
    activeLit += litigations.filter(l => linkedTo(parId, 'subject-of').includes(l.id) && l.active).length
    activeEnc += encumbrances.filter(e => linkedTo(parId, 'has').includes(e.id) && e.active).length
  }

  const declared = qpr?.declared_pct ?? 0
  const delivered = cv?.delivered_pct ?? declared
  const funded = esc?.funded_pct ?? esc?.mandate_pct ?? 70
  const mandate = esc?.mandate_pct ?? 70

  return {
    declared_pct: declared,
    delivered_pct: delivered,
    gap: declared - delivered,
    escrow_funded: funded,
    escrow_mandate: mandate,
    escrow_shortfall: Math.max(0, mandate - funded),
    active_litigations: activeLit,
    active_encumbrances: activeEnc,
    expired_approvals: aprs.filter(a => a.status === 'expired').length,
    pending_approvals: aprs.filter(a => a.status === 'pending').length,
    late_filings: qpr?.late_filings ?? 0,
  }
}

// Derived execution score — 100 minus penalties read off the linked objects.
// The declared-vs-delivered gap is the dominant term (the hero signal).
export function executionScore(projectId: string): number {
  const s = signalsFor(projectId)
  const score =
    100
    - s.gap * 1.3                       // declared vs delivered (integrity)
    - s.escrow_shortfall * 0.5          // escrow vs 70% mandate
    - s.active_litigations * 12         // active eCourts matters
    - s.active_encumbrances * 8         // active liens/attachments
    - s.expired_approvals * 18          // lapsed sanctions/NOCs
    - s.pending_approvals * 10
    - s.late_filings * 4                // QPR filing discipline
  return clamp(Math.round(score))
}

export function tierOf(score: number): RiskTier {
  if (score < 55) return 'AT_RISK'
  if (score < 75) return 'WATCH'
  return 'HEALTHY'
}

export interface ScoredProject extends Project {
  score: number
  signals: ProjectSignals
  developerLabel: string
}

export function scoredProjects(): ScoredProject[] {
  return projects.map(p => {
    const score = executionScore(p.id)
    return {
      ...p,
      score,
      signals: signalsFor(p.id),
      developerLabel: developers.find(d => d.id === p.developerId)?.label ?? '—',
    }
  })
}

// Portfolio execution index — loan-weighted average across the watchlist.
export function portfolioIndex(): number {
  const sp = scoredProjects()
  const totalLoan = sp.reduce((a, p) => a + p.loan_cr, 0)
  const weighted = sp.reduce((a, p) => a + p.score * p.loan_cr, 0)
  return Math.round(weighted / totalLoan)
}

export function portfolioCounts() {
  const sp = scoredProjects()
  return {
    atRisk: sp.filter(p => tierOf(p.score) === 'AT_RISK').length,
    watch: sp.filter(p => tierOf(p.score) === 'WATCH').length,
    healthy: sp.filter(p => tierOf(p.score) === 'HEALTHY').length,
  }
}

export { linkedTo, linkedFrom }
