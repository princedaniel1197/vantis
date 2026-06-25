'use client'

import { createContext, useContext, useState } from 'react'

export type Lang = 'en' | 'kn'

interface VerifyContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const VerifyContext = createContext<VerifyContextValue>({
  lang: 'en',
  setLang: () => {},
})

export function VerifyProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return (
    <VerifyContext.Provider value={{ lang, setLang }}>
      {children}
    </VerifyContext.Provider>
  )
}

export function useVerify() {
  return useContext(VerifyContext)
}

export const T = {
  en: {
    tagline: 'Know before you buy.',
    sub: 'Get the government truth about any Karnataka property — free, in 60 seconds.',
    placeholder: 'Enter a project name, developer, or RERA number…',
    btn_search: 'Check This Property',
    try_label: 'Try:',

    loading_1: 'Checking K-RERA registration…',
    loading_2: 'Looking up Kaveri title records…',
    loading_3: 'Scanning eCourts for litigation…',
    loading_4: 'Verifying BBMP plan approval…',
    loading_done: "Done. Here's what we found.",

    grade_label: 'Trust Grade',
    grade_A_verdict: 'Safe to proceed',
    grade_B_verdict: 'Mostly clear — review our notes',
    grade_C_verdict: 'Be careful — we found issues',
    grade_A_sub: 'All 5 government checks passed. This property is verified clean.',
    grade_B_sub: 'Minor notes to review. Get the full check before committing.',
    grade_C_sub: 'We found serious issues. Get legal advice before paying anything.',

    check_pass: 'Verified',
    check_fail: 'Issue Found',
    verified_by: 'Source',

    get_full_check: 'Get the complete report',
    full_check_price: '₹499',
    full_check_sub: 'Full title chain · Complete litigation history · Developer track record',
    check_another: 'Check another property',
    no_result: "We couldn't find that property in our database.",
    no_result_sub: 'Try searching by project name, developer name, or RERA number.',

    nav_trust: 'Trust Report',
    nav_full: 'Full Check',
    nav_projects: 'All Projects',
    lang_toggle: 'ಕನ್ನಡ',
    for_buyers: 'For Karnataka Homebuyers',
    tagline_short: 'Know before you buy',

    caution_title: 'What this means for you',
    caution_legal: 'Consult a property lawyer before proceeding with this property.',

    how_title: 'How it works',
    how_1_title: 'You search',
    how_1_sub: 'Type any project name, RERA number, or survey number',
    how_2_title: 'We check',
    how_2_sub: '5 government databases — K-RERA, Kaveri 2.0, eCourts, BBMP, Bhoomi',
    how_3_title: 'You know',
    how_3_sub: 'Plain-English results. Green or red. No jargon.',

    full_title: 'Pre-Purchase Full Check',
    full_sub: 'The complete report before you commit.',
    full_premium_badge: 'Premium Report · ₹499',
    full_select: 'Select a property',
    section_summary: 'Trust Summary',
    section_title_chain: 'Title Chain (Kaveri 2.0)',
    section_litigation: 'Litigation History (eCourts)',
    section_developer: 'Developer Track Record',
    section_plan: 'Plan Sanction & RERA Details',
    title_chain_clean: 'Title chain is clean.',
    no_litigation: 'No litigation history found.',
    transfer_type: 'Document Type',
    parties: 'Parties',
    value: 'Value',
    date: 'Date',
    doc_no: 'Document No.',

    projects_title: 'Project Directory',
    projects_sub: 'Browse and compare verified Karnataka properties. Grades updated weekly.',
    search_projects: 'Search projects or developers…',
    filter_all: 'All Grades',
    filter_A: 'Grade A — Safe',
    filter_B: 'Grade B — Review',
    filter_C: 'Grade C — Caution',
    market_all: 'All Areas',
    results_count: (n: number) => `${n} project${n !== 1 ? 's' : ''} found`,
    view_report: 'View Trust Report',
    units_sold: 'units sold',
  },
  kn: {
    tagline: 'ಖರೀದಿಸುವ ಮೊದಲು ತಿಳಿಯಿರಿ.',
    sub: 'ಯಾವುದೇ ಕರ್ನಾಟಕ ಆಸ್ತಿಯ ಸರ್ಕಾರಿ ಸತ್ಯ — ಉಚಿತ, 60 ಸೆಕೆಂಡ್‌ನಲ್ಲಿ.',
    placeholder: 'ಪ್ರಾಜೆಕ್ಟ್ ಹೆಸರು, ಡೆವಲಪರ್, ಅಥವಾ RERA ನಂಬರ್ ನಮೂದಿಸಿ…',
    btn_search: 'ಈ ಆಸ್ತಿ ಪರಿಶೀಲಿಸಿ',
    try_label: 'ಪ್ರಯತ್ನಿಸಿ:',

    loading_1: 'K-RERA ನೋಂದಣಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
    loading_2: 'ಕಾವೇರಿ ಪಟ್ಟ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ…',
    loading_3: 'eCourts ನಲ್ಲಿ ವ್ಯಾಜ್ಯ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ…',
    loading_4: 'BBMP ಯೋಜನಾ ಅನುಮೋದನೆ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
    loading_done: 'ಮುಗಿದಿದೆ. ನಾವು ಕಂಡ ವಿಷಯ ಇಲ್ಲಿದೆ.',

    grade_label: 'ನಂಬಿಕೆ ದರ್ಜೆ',
    grade_A_verdict: 'ಮುಂದುವರೆಯಲು ಸುರಕ್ಷಿತ',
    grade_B_verdict: 'ಬಹುಪಾಲು ಸರಿ — ಟಿಪ್ಪಣಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    grade_C_verdict: 'ಎಚ್ಚರಿಕೆ — ಸಮಸ್ಯೆಗಳು ಕಂಡಿವೆ',
    grade_A_sub: '5 ಸರ್ಕಾರಿ ಪರಿಶೀಲನೆಗಳು ಉತ್ತೀರ್ಣ. ಈ ಆಸ್ತಿ ಪರಿಶೀಲಿಸಿ ಸ್ವಚ್ಛ.',
    grade_B_sub: 'ಸಣ್ಣ ಟಿಪ್ಪಣಿಗಳಿವೆ. ಬದ್ಧತೆ ಮಾಡುವ ಮೊದಲು ಪೂರ್ಣ ತಪಾಸಣೆ ಪಡೆಯಿರಿ.',
    grade_C_sub: 'ಗಂಭೀರ ಸಮಸ್ಯೆಗಳು ಕಂಡಿವೆ. ಏನಾದರೂ ಪಾವತಿಸುವ ಮೊದಲು ಕಾನೂನು ಸಲಹೆ ಪಡೆಯಿರಿ.',

    check_pass: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    check_fail: 'ಸಮಸ್ಯೆ ಕಂಡಿದೆ',
    verified_by: 'ಮೂಲ',

    get_full_check: 'ಸಂಪೂರ್ಣ ವರದಿ ಪಡೆಯಿರಿ',
    full_check_price: '₹499',
    full_check_sub: 'ಪೂರ್ಣ ಪಟ್ಟ ಸರಪಳಿ · ಸಂಪೂರ್ಣ ವ್ಯಾಜ್ಯ ಇತಿಹಾಸ · ಡೆವಲಪರ್ ರೆಕಾರ್ಡ್',
    check_another: 'ಇನ್ನೊಂದು ಆಸ್ತಿ ಪರಿಶೀಲಿಸಿ',
    no_result: 'ಈ ಆಸ್ತಿ ನಮ್ಮ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ.',
    no_result_sub: 'ಪ್ರಾಜೆಕ್ಟ್ ಹೆಸರು, ಡೆವಲಪರ್ ಹೆಸರು, ಅಥವಾ RERA ನಂಬರ್ ಮೂಲಕ ಹುಡುಕಿ.',

    nav_trust: 'ನಂಬಿಕೆ ವರದಿ',
    nav_full: 'ಪೂರ್ಣ ತಪಾಸಣೆ',
    nav_projects: 'ಎಲ್ಲ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು',
    lang_toggle: 'EN',
    for_buyers: 'ಕರ್ನಾಟಕ ಮನೆ ಖರೀದಿದಾರರಿಗಾಗಿ',
    tagline_short: 'ಖರೀದಿಸುವ ಮೊದಲು ತಿಳಿಯಿರಿ',

    caution_title: 'ನಿಮಗೆ ಇದರ ಅರ್ಥ',
    caution_legal: 'ಈ ಆಸ್ತಿಯಲ್ಲಿ ಮುಂದುವರೆಯುವ ಮೊದಲು ಆಸ್ತಿ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.',

    how_title: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    how_1_title: 'ನೀವು ಹುಡುಕುತ್ತೀರಿ',
    how_1_sub: 'ಯಾವುದೇ ಪ್ರಾಜೆಕ್ಟ್ ಹೆಸರು, RERA ನಂಬರ್, ಅಥವಾ ಸರ್ವೆ ನಂಬರ್ ಟೈಪ್ ಮಾಡಿ',
    how_2_title: 'ನಾವು ಪರಿಶೀಲಿಸುತ್ತೇವೆ',
    how_2_sub: '5 ಸರ್ಕಾರಿ ಡೇಟಾಬೇಸ್‌ಗಳು — K-RERA, ಕಾವೇರಿ 2.0, eCourts, BBMP, ಭೂಮಿ',
    how_3_title: 'ನೀವು ತಿಳಿಯುತ್ತೀರಿ',
    how_3_sub: 'ಸ್ಪಷ್ಟ ಫಲಿತಾಂಶಗಳು. ಹಸಿರು ಅಥವಾ ಕೆಂಪು. ಯಾವ ಜಾರ್ಗನ್ ಇಲ್ಲ.',

    full_title: 'ಮೊದಲ ಖರೀದಿ ಪೂರ್ಣ ತಪಾಸಣೆ',
    full_sub: 'ಬದ್ಧತೆ ಮಾಡುವ ಮೊದಲು ಸಂಪೂರ್ಣ ವರದಿ.',
    full_premium_badge: 'ಪ್ರೀಮಿಯಂ ವರದಿ · ₹499',
    full_select: 'ಆಸ್ತಿ ಆಯ್ಕೆ ಮಾಡಿ',
    section_summary: 'ನಂಬಿಕೆ ಸಾರಾಂಶ',
    section_title_chain: 'ಪಟ್ಟ ಸರಪಳಿ (ಕಾವೇರಿ 2.0)',
    section_litigation: 'ವ್ಯಾಜ್ಯ ಇತಿಹಾಸ (eCourts)',
    section_developer: 'ಡೆವಲಪರ್ ಟ್ರ್ಯಾಕ್ ರೆಕಾರ್ಡ್',
    section_plan: 'ಯೋಜನಾ ಅನುಮೋದನೆ ಮತ್ತು RERA ವಿವರಗಳು',
    title_chain_clean: 'ಪಟ್ಟ ಸರಪಳಿ ಸ್ವಚ್ಛವಾಗಿದೆ.',
    no_litigation: 'ಯಾವ ವ್ಯಾಜ್ಯ ಇತಿಹಾಸ ಕಂಡುಬಂದಿಲ್ಲ.',
    transfer_type: 'ದಾಖಲೆ ಪ್ರಕಾರ',
    parties: 'ಪಕ್ಷಗಳು',
    value: 'ಮೌಲ್ಯ',
    date: 'ದಿನಾಂಕ',
    doc_no: 'ದಾಖಲೆ ಸಂಖ್ಯೆ',

    projects_title: 'ಪ್ರಾಜೆಕ್ಟ್ ನಿರ್ದೇಶಿಕೆ',
    projects_sub: 'ಪರಿಶೀಲಿತ ಕರ್ನಾಟಕ ಆಸ್ತಿಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ. ಗ್ರೇಡ್‌ಗಳು ಪ್ರತಿ ವಾರ ನವೀಕರಿಸಲಾಗುತ್ತದೆ.',
    search_projects: 'ಪ್ರಾಜೆಕ್ಟ್ ಅಥವಾ ಡೆವಲಪರ್ ಹುಡುಕಿ…',
    filter_all: 'ಎಲ್ಲ ದರ್ಜೆಗಳು',
    filter_A: 'ದರ್ಜೆ A — ಸುರಕ್ಷಿತ',
    filter_B: 'ದರ್ಜೆ B — ಪರಿಶೀಲಿಸಿ',
    filter_C: 'ದರ್ಜೆ C — ಎಚ್ಚರಿಕೆ',
    market_all: 'ಎಲ್ಲ ಪ್ರದೇಶಗಳು',
    results_count: (n: number) => `${n} ಪ್ರಾಜೆಕ್ಟ್${n !== 1 ? 'ಗಳು' : ''} ಕಂಡುಬಂದಿದೆ`,
    view_report: 'ನಂಬಿಕೆ ವರದಿ ನೋಡಿ',
    units_sold: 'ಯೂನಿಟ್‌ಗಳು ಮಾರಾಟ',
  },
}
