// Seeded Cross-Stage Copilot scenarios — deterministic demo answers that reason
// across the ontology (QPR → SiteVerification → Escrow → Litigation → Encumbrance).
// Live mode (app/api/copilot) injects the same ontology objects into Claude.

export type Tier = 'AT_RISK' | 'WATCH' | 'HEALTHY'

export interface CopilotAnswer {
  chips: string[]                 // reasoning stages that light up
  paras: string[]                 // answer paragraphs (HTML allowed)
  verdict?: { eyebrow: string; title: string; sub: string; score: number; tier: Tier }
  contrast?: string               // HTML
  citations: string[]
  focusIds: string[]              // graph nodes to emphasise (rest ghost)
}

export interface CopilotScenario {
  id: string
  query: string
  keywords: string[]
  answer: CopilotAnswer
}

// span helpers (design palette)
const declared = (t: string) => `<span style="color:#8fb3ff;">${t}</span>`
const delivered = (t: string) => `<span style="color:#45e0c0;">${t}</span>`
const risk = (t: string) => `<span style="color:#ff7a6d;">${t}</span>`
const watch = (t: string) => `<span style="color:#f0a24a;">${t}</span>`
const enc = (t: string) => `<span style="color:#e8b24c;">${t}</span>`
const mono = (t: string) => `<span style="font-family:'JetBrains Mono',monospace; font-size:12px; color:#c8d6de;">${t}</span>`
const b = (t: string) => `<strong style="color:#fff;">${t}</strong>`

const OZONE_FOCUS = ['ozone', 'p1', 'qpr', 'cv', 'par', 'enc', 'lit', 'esc', 'apr', 'unit']
const ALL_CHIPS = ['QPR FILING', 'SITE VERIFICATION', 'ESCROW', 'LITIGATION', 'ENCUMBRANCE']

const OZONE_CITATIONS = ["QPR Q1'26", 'CV SCAN · 12 MAY', 'ESCROW LEDGER', 'eCOURTS', 'KAVERI EC']

export const SCENARIOS: CopilotScenario[] = [
  {
    id: 'at-risk',
    query: 'Which of my projects are at risk, and why?',
    keywords: ['at risk', 'risk', 'which project', 'flagged', 'why'],
    answer: {
      chips: ALL_CHIPS,
      paras: [
        `One project crosses the risk threshold: ${b('Ozone Urbana')}. Its Q1&nbsp;2026 QPR ${declared('declares 78%')} construction, but the latest CV site scan reads ${delivered('54% delivered')} — a ${risk('24-point declared-vs-delivered gap')}, the widest in the portfolio.`,
        `The RERA escrow is funded to ${declared('54%')} against the 70% mandate — cash is tracking real progress, not the filing. The shortfall isn't optics.`,
        `The underlying parcel ${mono('Sy.114/2')} carries an active ${enc('encumbrance')} from Kaveri EC and is named in eCourts matter ${risk('VB/CC/2023/1847')}, admitted this quarter.`,
      ],
      verdict: { eyebrow: 'VERDICT · OZONE URBANA', title: 'Block tranche T5 (₹40 Cr)', sub: 'until QPR gap & escrow shortfall resolve', score: 41, tier: 'AT_RISK' },
      contrast: `For contrast: ${watch('Skylark Arcadia')} shows an 8-point gap (watch); ${delivered('Divya Villas')} and ${delivered('Prestige Lakeside')} sit within tolerance.`,
      citations: OZONE_CITATIONS,
      focusIds: OZONE_FOCUS,
    },
  },
  {
    id: 'ozone-why',
    query: 'Why is Ozone Urbana flagged?',
    keywords: ['ozone urbana', 'ozone', 'why flagged', 'flag'],
    answer: {
      chips: ALL_CHIPS,
      paras: [
        `${b('Ozone Urbana')} scores ${risk('41 / 100')} on execution — the lowest in the book. Four linked signals converge:`,
        `① The QPR ${declared('declares 78%')} but CV verification measures ${delivered('54%')} — a ${risk('−24 pt gap')}. ② Escrow is funded ${declared('54%')} vs the 70% mandate. ③ The parcel ${mono('Sy.114/2')} has an active ${enc('lien (Kaveri EC)')}. ④ Ozone Group is ${risk('named in eCourts VB/CC/2023/1847')}, admitted this quarter.`,
        `Each signal is traced to a verified object, not a self-report — that's why the flag holds up.`,
      ],
      verdict: { eyebrow: 'VERDICT · OZONE URBANA', title: 'At-risk · execution 41', sub: 'declared-vs-delivered + escrow + litigation', score: 41, tier: 'AT_RISK' },
      citations: OZONE_CITATIONS,
      focusIds: OZONE_FOCUS,
    },
  },
  {
    id: 'tranche',
    query: 'Should I release the next tranche to Ozone Group?',
    keywords: ['tranche', 'release', 'disburse', 'fund', 'next tranche', 't5'],
    answer: {
      chips: ['QPR FILING', 'SITE VERIFICATION', 'ESCROW', 'LITIGATION'],
      paras: [
        `${risk('No — hold tranche T5 (₹40 Cr).')} Releasing against the ${declared('declared 78%')} would fund work that isn't there: CV reads ${delivered('54%')}.`,
        `Escrow at ${declared('54%')} of the 70% mandate means the account can't absorb a drawdown without breaching the rule. And the admitted litigation on ${mono('Sy.114/2')} clouds title on the collateral itself.`,
      ],
      verdict: { eyebrow: 'RECOMMENDATION', title: 'Block T5 · ₹40 Cr', sub: 'release on gap ≤ 8 pts AND escrow ≥ 70%', score: 41, tier: 'AT_RISK' },
      contrast: `${delivered('Prestige Lakeside')} T3 auto-released this quarter — gap −1, escrow 81%.`,
      citations: ["QPR Q1'26", 'CV SCAN · 12 MAY', 'ESCROW LEDGER', 'eCOURTS'],
      focusIds: OZONE_FOCUS,
    },
  },
  {
    id: 'compare-gap',
    query: 'Compare declared vs delivered across the portfolio',
    keywords: ['compare', 'declared vs delivered', 'across', 'portfolio', 'gap'],
    answer: {
      chips: ['QPR FILING', 'SITE VERIFICATION'],
      paras: [
        `Declared-vs-delivered gap, worst to best:`,
        `${risk('Ozone Urbana')} — declared ${declared('78%')} / delivered ${delivered('54%')} · ${risk('−24 pts')} (at risk)<br>${watch('Skylark Arcadia')} — declared ${declared('60%')} / delivered ${delivered('52%')} · ${watch('−8 pts')} (watch)<br>${delivered('Divya Villas')} — declared ${declared('90%')} / delivered ${delivered('88%')} · −2 pts (healthy)<br>${delivered('Prestige Lakeside')} — declared ${declared('82%')} / delivered ${delivered('81%')} · −1 pt (healthy)`,
        `Only Ozone breaches the 8-point tolerance band — and it does so by 3×.`,
      ],
      citations: ["QPR Q1'26", 'CV SCANS · MAY'],
      focusIds: ['p1', 'p2', 'p3', 'p4', 'qpr', 'cv', 'q2', 'c2', 'c3'],
    },
  },
  {
    id: 'escrow',
    query: "What's the escrow position on Ozone Urbana?",
    keywords: ['escrow', 'position', 'funded', 'account'],
    answer: {
      chips: ['ESCROW', 'SITE VERIFICATION'],
      paras: [
        `Ozone Urbana's RERA escrow is funded to ${declared('54%')} against the ${b('70% mandate')} — a 16-point shortfall.`,
        `Tellingly, escrow (${declared('54%')}) matches CV-delivered (${delivered('54%')}), not the QPR-declared ${declared('78%')}. The money followed the concrete, not the filing — independent corroboration that delivery, not the declaration, is the truth.`,
      ],
      verdict: { eyebrow: 'ESCROW · OZONE URBANA', title: '54% funded · 16 pts short', sub: '70% RERA mandate not met', score: 41, tier: 'AT_RISK' },
      citations: ['ESCROW LEDGER', 'CV SCAN · 12 MAY'],
      focusIds: ['p1', 'esc', 'cv', 'qpr'],
    },
  },
  {
    id: 'litigation',
    query: 'Any litigation or encumbrances I should know about?',
    keywords: ['litigation', 'encumbrance', 'lien', 'court', 'ecourts', 'title'],
    answer: {
      chips: ['LITIGATION', 'ENCUMBRANCE'],
      paras: [
        `Yes — both on Ozone Urbana's parcel ${mono('Sy.114/2')}:`,
        `${enc('Encumbrance')}: an active lien surfaced by Kaveri EC — not disclosed in the RERA filing. ${risk('Litigation')}: eCourts matter ${mono('VB/CC/2023/1847')}, admitted this quarter, with Ozone Group named as a party.`,
        `The other three projects' parcels are clean — no liens, no admitted matters.`,
      ],
      verdict: { eyebrow: 'TITLE · Sy.114/2', sub: 'lien undisclosed + admitted matter', title: 'Collateral compromised', score: 41, tier: 'AT_RISK' },
      citations: ['KAVERI EC', 'eCOURTS'],
      focusIds: ['p1', 'par', 'enc', 'lit', 'ozone'],
    },
  },
  {
    id: 'safest',
    query: 'Which developer is safest to lend to?',
    keywords: ['safest', 'best developer', 'lend to', 'which developer', 'reputation'],
    answer: {
      chips: ['QPR FILING', 'SITE VERIFICATION', 'ESCROW'],
      paras: [
        `On execution, ${delivered('Prestige Group')} (Lakeside, ${delivered('91')}) and ${delivered('JDA Projects')} (Divya Villas, ${delivered('88')}) are safest — sub-2-point gaps, escrow at or above mandate, clean title.`,
        `${watch('Skylark Mansions')} (Arcadia, ${watch('63')}) is lendable with covenants — 8-point gap and a lapsed NOC. ${risk('Ozone Group')} (${risk('41')}) is not, until the gap and litigation clear.`,
      ],
      contrast: `Reputation confirms it: Prestige 91 · JDA 78 · Skylark 54 · Ozone 9.`,
      citations: ["QPR Q1'26", 'CV SCANS', 'ESCROW LEDGER'],
      focusIds: ['p1', 'p2', 'p3', 'p4', 'ozone', 'skylark', 'jda', 'prestige'],
    },
  },
  {
    id: 'clear-flag',
    query: "What would clear Ozone Urbana's flag?",
    keywords: ['clear', 'resolve', 'fix', 'unflag', 'what would'],
    answer: {
      chips: ALL_CHIPS,
      paras: [
        `Three conditions, each tied to an object:`,
        `① Close the ${risk('24-point gap')} — deliver to the declared 78% (or restate the QPR to match CV). ② Fund escrow from ${declared('54%')} to the ${b('70% mandate')}. ③ Discharge the ${enc('Kaveri EC lien')} and dispose of eCourts ${mono('VB/CC/2023/1847')}.`,
        `At that point execution recomputes above the 55 threshold and tranche release auto-unblocks — the same rule that released Prestige's T3.`,
      ],
      verdict: { eyebrow: 'PATH TO CLEAR', title: 'Gap → 0 · escrow → 70% · title clean', sub: 'execution recomputes > 55', score: 41, tier: 'AT_RISK' },
      citations: OZONE_CITATIONS,
      focusIds: OZONE_FOCUS,
    },
  },
  {
    id: 'escrow-shortfall',
    query: 'Which projects have an escrow shortfall?',
    keywords: ['escrow shortfall', 'escrow short', 'shortfall', '70%', 'escrow', 'funded'],
    answer: {
      chips: ['ESCROW', 'SITE VERIFICATION'],
      paras: [
        `Two projects breach the ${b('70% RERA escrow mandate')}: ${risk('Ozone Urbana')} funded ${declared('54%')} and ${watch('Skylark Arcadia')} funded ${declared('60%')}. ${delivered('Divya')} sits just under at 68%; ${delivered('Prestige')} is compliant at 81%.`,
        `Ozone's escrow (${declared('54%')}) matches its CV-delivered ${delivered('54%')}, not the QPR-declared 78% — the cash tracks the concrete. A drawdown now would deepen the breach.`,
      ],
      verdict: { eyebrow: 'ESCROW · PORTFOLIO', title: '2 in breach · Ozone −16 pts', sub: 'below the 70% mandate', score: 41, tier: 'AT_RISK' },
      citations: ['ESCROW LEDGER', 'CV SCAN · 12 MAY'],
      focusIds: ['p1', 'p2', 'p3', 'p4', 'esc', 'e2', 'e3', 'e4', 'pay', 'cv'],
    },
  },
  {
    id: 'collections-gap',
    query: 'Compare declared collections vs Kaveri registrations',
    keywords: ['collections', 'declared collections', 'financial gap', 'registered vs', 'money', 'farvision'],
    answer: {
      chips: ['ESCROW', 'SITE VERIFICATION'],
      paras: [
        `${b('Ozone Urbana')} declares ${declared('62% collected')} in its RERA statement, but Kaveri registrations total only ${delivered('28%')} — a ${risk('34-point financial gap')} the ERP ledger can't see.`,
        `Skylark shows a 13-point collections gap; Divya (−2) and Prestige (−2) reconcile. Escrow at ${declared('54%')} corroborates Ozone's real position.`,
      ],
      verdict: { eyebrow: 'ERP · OZONE URBANA', title: 'Collections overstated 34 pts', sub: 'declared 62% vs Kaveri 28%', score: 41, tier: 'AT_RISK' },
      citations: ['ERP STATEMENT', 'KAVERI REGISTRATIONS', 'ESCROW LEDGER'],
      focusIds: ['p1', 'pay', 'esc', 'ozone', 'p2', 'pay2'],
    },
  },
  {
    id: 'sales-gap',
    query: 'Where is claimed sales velocity above actual registrations?',
    keywords: ['sales gap', 'claimed vs actual', 'booking', 'sales velocity', 'registration', 'booked', 'sell.do'],
    answer: {
      chips: ['SITE VERIFICATION', 'ESCROW'],
      paras: [
        `${b('Ozone Urbana')} shows ${declared('80% booked')} in the CRM but only ${delivered('34% registered')} in Kaveri — a ${risk('46-point sales gap')}, the widest divergence in the portfolio.`,
        `Skylark: claimed ${declared('65%')} / registered ${delivered('48%')} (−17). Two Ozone unit sales — ${mono('B-0907')} and ${mono('C-1611')} — were never registered; bookings without registrations inflate the headline velocity.`,
        `${delivered('Divya')} and ${delivered('Prestige')} reconcile within 3 points.`,
      ],
      verdict: { eyebrow: 'CRM · OZONE URBANA', title: 'Booking velocity overstated 46 pts', sub: 'claimed 80% vs registered 34%', score: 41, tier: 'AT_RISK' },
      citations: ['CRM LEDGER', 'KAVERI REGISTRATIONS'],
      focusIds: ['p1', 'bkg', 'unit', 'buy2', 'buy3', 'ozone', 'p2', 'bkg2'],
    },
  },
]

export function matchScenario(query: string): CopilotScenario {
  const q = query.toLowerCase().trim()
  // exact-ish match first
  const exact = SCENARIOS.find(s => s.query.toLowerCase() === q)
  if (exact) return exact
  // keyword scoring
  let best = SCENARIOS[0], bestScore = 0
  for (const s of SCENARIOS) {
    const score = s.keywords.reduce((a, k) => a + (q.includes(k) ? k.length : 0), 0)
    if (score > bestScore) { bestScore = score; best = s }
  }
  return best
}
