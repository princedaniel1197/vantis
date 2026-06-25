'use client'

import { createContext, useContext, useState } from 'react'

export type Lang = 'en' | 'kn'

interface ConnectContextValue {
  lang: Lang
  setLang: (l: Lang) => void
}

const ConnectContext = createContext<ConnectContextValue>({
  lang: 'en',
  setLang: () => {},
})

export function ConnectProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  return (
    <ConnectContext.Provider value={{ lang, setLang }}>
      {children}
    </ConnectContext.Provider>
  )
}

export function useConnect() {
  return useContext(ConnectContext)
}

export const T = {
  en: {
    module: 'Vantis Connect',
    for_brokers: 'For Karnataka Brokers',
    tab_match: 'Match',
    tab_leads: 'Leads',
    tab_market: 'Market',
    toggle_lang: 'ಕನ್ನಡ',

    hero_title: "Find your buyer's match.",
    hero_sub:
      'Describe what your client wants — in plain English or Kannada. Vantis returns government-verified properties no other broker tool can show.',
    placeholder: '"3BHK near Whitefield, under ₹1.2 Cr, ready to move, clean title"',
    btn_match: 'Find Matches',
    btn_clear: 'Clear',
    example_label: 'Try an example',
    ex1: '3BHK near Whitefield, under ₹1.2 Cr, ready to move',
    ex2: '2BHK Sarjapur Road, below ₹80L, RERA registered',
    ex3: '3BHK Hebbal, under ₹1.8 Cr, clean title',
    ex4: '4BHK Devanahalli, below ₹2 Cr',

    match_score: 'Match',
    verified: 'Govt. Verified',
    kaveri_price: 'Kaveri Price',
    asking: 'Asking',
    ready: 'Ready to Move',
    uc: 'Under Construction',
    results_header: (n: number) => `${n} verified propert${n === 1 ? 'y' : 'ies'} matched`,
    no_results: 'No properties matched your query.',
    no_results_sub: 'Try adjusting the location, configuration, or price range.',

    rera_valid: 'RERA Registered',
    rera_invalid: 'Not RERA Registered',
    title_clean: 'Clean Title',
    title_enc: 'Encumbrance',
    title_litig: 'Title Disputed',
    no_litigation: 'No Litigation',
    litigation: 'LITIGATION',
    encumbrance: 'ENCUMBRANCE',
    caution_banner: 'CAUTION — Vantis has flagged a legal risk on this property',
    caution_sub: 'Advise your client to proceed with legal counsel. Do not commit.',

    // Leads
    leads_title: 'Lead Pipeline',
    leads_sub: 'Buyer leads, scored by Vantis AI. Junk-lead filtered.',
    stage_new: 'New',
    stage_contacted: 'Contacted',
    stage_visit: 'Site Visit',
    stage_negotiating: 'Negotiating',
    stage_closed: 'Closed',
    quality_hot: 'Hot Lead',
    quality_warm: 'Warm Lead',
    quality_junk: 'Junk Lead',
    quality_converted: 'Converted',
    source_whatsapp: 'WhatsApp',
    source_referral: 'Referral',
    source_site: 'Site Visit',
    source_portal: 'Portal',
    followup: 'Follow-up',
    days_in_stage: 'days in stage',
    budget: 'Budget',
    view_matches: 'View Matches',

    // Market
    market_title: 'Market Intelligence',
    market_sub: 'Real Kaveri registered prices — not asking prices.',
    price_trend: 'Price Trend (₹/sqft)',
    kaveri_vs_asking: 'Kaveri vs Asking: The Gap',
    config_demand: 'Config Demand (units registered, 2025)',
    absorption: 'Quarterly Absorption',
    avg_psf: 'Avg ₹/sqft',
    yoy: 'YoY Growth',
    inventory: 'Active Inventory',
    select_market: 'Select micro-market',
    source_label: 'Source: Kaveri 2.0 Registration Data, Karnataka Govt.',
  },
  kn: {
    module: 'ವ್ಯಾಂಟಿಸ್ ಕನೆಕ್ಟ್',
    for_brokers: 'ಕರ್ನಾಟಕ ಬ್ರೋಕರ್‌ಗಳಿಗಾಗಿ',
    tab_match: 'ಹೊಂದಿಸಿ',
    tab_leads: 'ಖರೀದಿದಾರರು',
    tab_market: 'ಮಾರುಕಟ್ಟೆ',
    toggle_lang: 'EN',

    hero_title: 'ನಿಮ್ಮ ಖರೀದಿದಾರರ ಆಯ್ಕೆ ಹುಡುಕಿ.',
    hero_sub:
      'ನಿಮ್ಮ ಗ್ರಾಹಕರು ಏನು ಬಯಸುತ್ತಾರೆ ಎಂದು ಹೇಳಿ — ಕನ್ನಡ ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ. ಯಾವ ಬ್ರೋಕರ್ ಟೂಲ್‌ನಲ್ಲೂ ಇಲ್ಲದ ಸರ್ಕಾರ-ಪರಿಶೀಲಿತ ಆಸ್ತಿಗಳನ್ನು Vantis ತೋರಿಸುತ್ತದೆ.',
    placeholder: '"ವೈಟ್‌ಫೀಲ್ಡ್ ಬಳಿ 3BHK, ₹1.2 ಕೋಟಿ ಒಳಗೆ, ತಕ್ಷಣ ವಾಸ, ಶುದ್ಧ ಪಟ್ಟ"',
    btn_match: 'ಹೊಂದಿಕೆ ಹುಡುಕಿ',
    btn_clear: 'ತೆರೆಯಿರಿ',
    example_label: 'ಉದಾಹರಣೆ ಪ್ರಯತ್ನಿಸಿ',
    ex1: 'ವೈಟ್‌ಫೀಲ್ಡ್ ಬಳಿ 3BHK, ₹1.2 ಕೋಟಿ ಒಳಗೆ, ತಕ್ಷಣ ವಾಸ',
    ex2: 'ಸರ್ಜಾಪುರ 2BHK, ₹80 ಲಕ್ಷ ಒಳಗೆ, RERA ನೋಂದಣಿ',
    ex3: 'ಹೆಬ್ಬಾಳ 3BHK, ₹1.8 ಕೋಟಿ ಒಳಗೆ, ಶುದ್ಧ ಪಟ್ಟ',
    ex4: 'ದೇವನಹಳ್ಳಿ 4BHK, ₹2 ಕೋಟಿ ಒಳಗೆ',

    match_score: 'ಹೊಂದಿಕೆ',
    verified: 'ಸರ್ಕಾರ ಪರಿಶೀಲಿತ',
    kaveri_price: 'ಕಾವೇರಿ ಬೆಲೆ',
    asking: 'ಕೇಳುವ ಬೆಲೆ',
    ready: 'ತಕ್ಷಣ ವಾಸ',
    uc: 'ನಿರ್ಮಾಣ ಹಂತ',
    results_header: (n: number) => `${n} ಪರಿಶೀಲಿತ ಆಸ್ತಿಗಳು ಹೊಂದಿದವು`,
    no_results: 'ಈ ಕ್ವೆರಿಗೆ ಯಾವ ಆಸ್ತಿಯೂ ಹೊಂದಲಿಲ್ಲ.',
    no_results_sub: 'ಸ್ಥಳ, ಕಾನ್ಫಿಗ್ ಅಥವಾ ಬೆಲೆ ಬದಲಾಯಿಸಿ.',

    rera_valid: 'RERA ನೋಂದಣಿ',
    rera_invalid: 'RERA ಇಲ್ಲ',
    title_clean: 'ಶುದ್ಧ ಪಟ್ಟ',
    title_enc: 'ಒತ್ತಡ ಇದೆ',
    title_litig: 'ವ್ಯಾಜ್ಯ ಪಟ್ಟ',
    no_litigation: 'ವ್ಯಾಜ್ಯ ಇಲ್ಲ',
    litigation: 'ವ್ಯಾಜ್ಯ',
    encumbrance: 'ಒತ್ತಡ',
    caution_banner: 'ಎಚ್ಚರಿಕೆ — ಈ ಆಸ್ತಿಯಲ್ಲಿ ಕಾನೂನು ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ',
    caution_sub: 'ನ್ಯಾಯ ಸಲಹೆ ಪಡೆಯದೇ ಮುಂದುವರೆಯಬೇಡಿ.',

    leads_title: 'ಲೀಡ್ ಪೈಪ್‌ಲೈನ್',
    leads_sub: 'ಖರೀದಿದಾರ ಲೀಡ್‌ಗಳು, Vantis AI ಅಂಕ. ಜಂಕ್ ಫಿಲ್ಟರ್ ಮಾಡಲಾಗಿದೆ.',
    stage_new: 'ಹೊಸ',
    stage_contacted: 'ಸಂಪರ್ಕಿಸಲಾಗಿದೆ',
    stage_visit: 'ಸ್ಥಳ ಭೇಟಿ',
    stage_negotiating: 'ಚರ್ಚೆ',
    stage_closed: 'ಮುಕ್ತಾಯ',
    quality_hot: 'ಪ್ರಮುಖ ಲೀಡ್',
    quality_warm: 'ಬೆಚ್ಚಗಿನ ಲೀಡ್',
    quality_junk: 'ಜಂಕ್ ಲೀಡ್',
    quality_converted: 'ಪರಿವರ್ತಿಸಲಾಗಿದೆ',
    source_whatsapp: 'ವಾಟ್ಸ್ಆ್ಯಪ್',
    source_referral: 'ರೆಫರಲ್',
    source_site: 'ಸ್ಥಳ ಭೇಟಿ',
    source_portal: 'ಪೋರ್ಟಲ್',
    followup: 'ಮುಂದಿನ ಸಂಪರ್ಕ',
    days_in_stage: 'ದಿನ ಈ ಹಂತದಲ್ಲಿ',
    budget: 'ಬಜೆಟ್',
    view_matches: 'ಹೊಂದಿಕೆ ನೋಡಿ',

    market_title: 'ಮಾರುಕಟ್ಟೆ ಮಾಹಿತಿ',
    market_sub: 'ನಿಜ ಕಾವೇರಿ ನೋಂದಣಿ ಬೆಲೆಗಳು — ಕೇಳುವ ಬೆಲೆ ಅಲ್ಲ.',
    price_trend: 'ಬೆಲೆ ಪ್ರವೃತ್ತಿ (₹/ಚದರ ಅಡಿ)',
    kaveri_vs_asking: 'ಕಾವೇರಿ ಮತ್ತು ಕೇಳುವ ಬೆಲೆ: ಅಂತರ',
    config_demand: 'ಕಾನ್ಫಿಗ್ ಬೇಡಿಕೆ (2025 ನೋಂದಣಿ ಘಟಕಗಳು)',
    absorption: 'ತ್ರೈಮಾಸಿಕ ಹೀರಿಕೊಳ್ಳುವಿಕೆ',
    avg_psf: 'ಸರಾಸರಿ ₹/ಚದರ ಅಡಿ',
    yoy: 'ವಾರ್ಷಿಕ ಬೆಳವಣಿಗೆ',
    inventory: 'ಸಕ್ರಿಯ ಸ್ಟಾಕ್',
    select_market: 'ಮೈಕ್ರೋ-ಮಾರ್ಕೆಟ್ ಆಯ್ಕೆ ಮಾಡಿ',
    source_label: 'ಮೂಲ: ಕಾವೇರಿ 2.0 ನೋಂದಣಿ ಡೇಟಾ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ.',
  },
}
