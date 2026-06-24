export type GovTruthResult = {
  title: { verdict: 'clean' | 'flag'; detail: string }
  rera: { verdict: 'registered' | 'pending'; detail: string }
  litigation: { verdict: 'none' | 'active'; detail: string }
  overall: 'clean' | 'watch' | 'flag'
}

const MOCK_TRUTH: Record<string, GovTruthResult> = {
  'divya-villas': {
    title:      { verdict: 'clean',      detail: 'EC clean for Sy. No. 83/2 and 84/2. No encumbrances as of Jun 2024.' },
    rera:       { verdict: 'registered', detail: 'PRM/KA/RERA/1251/309/PR/2021/001 — active, extensions on record.' },
    litigation: { verdict: 'none',       detail: 'No cases found in eCourts or NCLT for JDA Projects.' },
    overall:    'clean',
  },
  'ozone-urbana': {
    title:      { verdict: 'flag',    detail: 'Sy. No. 84/2 had undisclosed mortgage 2019–2022 (₹4.2 Cr). Cleared but mismatch in EC vs Kaveri scrape.' },
    rera:       { verdict: 'pending', detail: 'QPR Q3 2023 not filed. Extension pending. K-RERA show-cause issued.' },
    litigation: { verdict: 'active',  detail: '2 active cases: O.S. 1042/2022 (civil), IBA/441/2022 (NCLT). 1 new consumer forum case Jun 2024.' },
    overall:    'flag',
  },
}

export function resolveGovTruth(projectId: string): GovTruthResult {
  return MOCK_TRUTH[projectId] ?? {
    title:      { verdict: 'clean',      detail: 'No encumbrances on record.' },
    rera:       { verdict: 'registered', detail: 'RERA registration active.' },
    litigation: { verdict: 'none',       detail: 'No active litigation found.' },
    overall:    'clean',
  }
}
