import type { LendProject, RiskBand } from './lend-portfolio'

export type PersonaKey = 'kaveri' | 'sterling' | 'bharat'

export interface PersonaMeta {
  key: PersonaKey
  name: string
  shortName: string
  type: string
  total_cr: number
  projects: number
  red: number
  amber: number
  green: number
  at_risk_cr: number
  hero_project: string
  credential: string
}

export const PERSONAS: Record<PersonaKey, PersonaMeta> = {
  kaveri: {
    key: 'kaveri',
    name: 'Kaveri Housing Finance',
    shortName: 'Kaveri HFC',
    type: 'NBFC · Construction Finance',
    total_cr: 2400,
    projects: 40,
    red: 3,
    amber: 9,
    green: 28,
    at_risk_cr: 420,
    hero_project: 'Ozone Urbana',
    credential: 'credit@kaverihfc.in',
  },
  sterling: {
    key: 'sterling',
    name: 'Sterling Bank',
    shortName: 'Sterling Bank',
    type: 'Private Bank · Retail + Construction',
    total_cr: 6500,
    projects: 70,
    red: 4,
    amber: 14,
    green: 52,
    at_risk_cr: 1180,
    hero_project: 'Amaravati Skyline',
    credential: 'credit@sterlingbank.in',
  },
  bharat: {
    key: 'bharat',
    name: 'Bharat PSU Bank',
    shortName: 'Bharat PSU',
    type: 'Public Sector · NHB Refinance',
    total_cr: 18000,
    projects: 140,
    red: 3,
    amber: 19,
    green: 118,
    at_risk_cr: 2100,
    hero_project: 'Nayara Enclave',
    credential: 'credit@bharatpsubank.in',
  },
}

// ── Synthetic projects for Sterling Bank (showing 40 of 70) ──────────────────
const STERLING_RED: LendProject[] = [
  { id: 'sl-amaravati-skyline', name: 'Amaravati Skyline', developer: 'Vizag Infra', developer_id: 'vizag-infra', city: 'Visakhapatnam', exposure_cr: 320, outstanding_cr: 320, risk_band: 'red', risk_score: 298, flagged_quarter: 'Q2 2022', recovery_window: 'AT RISK', rera_id: 'PRM/AP/RERA/2021/000415', loan_sanctioned: 'Mar 2021', loan_type: 'Construction Finance' },
  { id: 'sl-nexus-towers', name: 'Nexus Towers', developer: 'Deccan Heritage', developer_id: 'deccan-heritage', city: 'Hyderabad', exposure_cr: 285, outstanding_cr: 285, risk_band: 'red', risk_score: 312, flagged_quarter: 'Q4 2022', recovery_window: 'AT RISK', rera_id: 'PRM/TS/RERA/2021/000288', loan_sanctioned: 'Jun 2021', loan_type: 'Term Loan' },
  { id: 'sl-marina-walk', name: 'Marina Walk', developer: 'Southern Realty', developer_id: 'southern-realty', city: 'Chennai', exposure_cr: 260, outstanding_cr: 260, risk_band: 'red', risk_score: 285, flagged_quarter: 'Q1 2023', recovery_window: 'AT RISK', rera_id: 'PRM/TN/RERA/2021/000312', loan_sanctioned: 'Oct 2021', loan_type: 'Construction Finance' },
  { id: 'sl-highland-vista', name: 'Highland Vista', developer: 'Nilgiri Builders', developer_id: 'nilgiri-builders', city: 'Coimbatore', exposure_cr: 315, outstanding_cr: 315, risk_band: 'red', risk_score: 271, flagged_quarter: 'Q3 2022', recovery_window: 'AT RISK', rera_id: 'PRM/TN/RERA/2021/000355', loan_sanctioned: 'Jan 2022', loan_type: 'Construction Finance' },
]

const STERLING_AMBER_NAMES = [
  ['SL-Greenfield Park', 'Greenfield Realty', 'Pune', 195, 540],
  ['SL-Royal Crest', 'Apex Constructions', 'Bengaluru', 165, 522],
  ['SL-Sunrise Villas', 'Eastern Developers', 'Kolkata', 145, 508],
  ['SL-Heritage Heights', 'Legacy Group', 'Mumbai', 210, 548],
  ['SL-Silver Oak', 'Oak Developers', 'Ahmedabad', 135, 518],
  ['SL-Metro Homes', 'Metro Realty', 'Pune', 120, 495],
  ['SL-Lotus Gardens', 'Lotus Infra', 'Bengaluru', 155, 532],
  ['SL-Azure Bay', 'Azure Properties', 'Goa', 98, 504],
  ['SL-Emerald Plaza', 'Emerald Group', 'Hyderabad', 178, 526],
  ['SL-Pacific Heights', 'Pacific Realty', 'Chennai', 142, 510],
  ['SL-Pinnacle Towers', 'Pinnacle Infra', 'Nagpur', 115, 498],
  ['SL-Garden City', 'Garden Developers', 'Mysuru', 88, 515],
  ['SL-Westfield', 'Westfield Estates', 'Surat', 104, 528],
  ['SL-Skyline 360', 'Horizon Builders', 'Pune', 132, 542],
]

const STERLING_AMBER: LendProject[] = STERLING_AMBER_NAMES.map(([name, dev, city, exp, score], i) => ({
  id: `sl-amber-${i}`,
  name: String(name),
  developer: String(dev),
  developer_id: `sl-dev-${i}`,
  city: String(city),
  exposure_cr: Number(exp),
  outstanding_cr: Number(exp),
  risk_band: 'amber' as RiskBand,
  risk_score: Number(score),
  flagged_quarter: null,
  recovery_window: null,
  rera_id: `PRM/XX/RERA/2022/${String(i).padStart(6,'0')}`,
  loan_sanctioned: 'Jan 2023',
  loan_type: 'Construction Finance' as const,
}))

const STERLING_GREEN_NAMES = [
  ['SL-Prestige Empire', 'Prestige Group', 'Bengaluru', 285, 818],
  ['SL-Oberoi Garden', 'Oberoi Realty', 'Mumbai', 420, 832],
  ['SL-DLF City', 'DLF Limited', 'Gurugram', 520, 845],
  ['SL-Sobha Reserve', 'Sobha Ltd', 'Bengaluru', 198, 810],
  ['SL-Godrej Nest', 'Godrej Properties', 'Pune', 165, 798],
  ['SL-Brigade Metro', 'Brigade Group', 'Bengaluru', 212, 821],
  ['SL-Tata Greens', 'Tata Housing', 'Bengaluru', 188, 805],
  ['SL-Mahindra Vista', 'Mahindra Lifespace', 'Chennai', 155, 792],
  ['SL-Lodha Palms', 'Lodha Group', 'Mumbai', 380, 840],
  ['SL-Phoenix Towers', 'Phoenix Mills', 'Mumbai', 298, 828],
  ['SL-Piramal Revanta', 'Piramal Realty', 'Mumbai', 275, 815],
  ['SL-Hiranandani Aura', 'Hiranandani', 'Mumbai', 310, 838],
  ['SL-Kolte Western', 'Kolte Patil', 'Pune', 145, 782],
  ['SL-Amit Floresta', 'Amit Enterprises', 'Pune', 118, 770],
  ['SL-Majestique Marbella', 'Majestique', 'Pune', 132, 775],
  ['SL-VTP Urbana', 'VTP Realty', 'Pune', 142, 788],
  ['SL-Casagrand Origen', 'Casagrand', 'Chennai', 108, 765],
  ['SL-BSCPL Bollineni', 'BSCPL Infra', 'Hyderabad', 125, 771],
  ['SL-Aparna Lake9', 'Aparna Constructions', 'Hyderabad', 158, 780],
  ['SL-Aliens Space', 'Aliens Developers', 'Hyderabad', 138, 758],
  ['SL-Navins Courtyard', 'Navins Realty', 'Chennai', 92, 754],
  ['SL-Puravankara Zenium', 'Puravankara', 'Bengaluru', 178, 789],
]

const STERLING_GREEN: LendProject[] = STERLING_GREEN_NAMES.map(([name, dev, city, exp, score], i) => ({
  id: `sl-green-${i}`,
  name: String(name),
  developer: String(dev),
  developer_id: `sl-dev-g${i}`,
  city: String(city),
  exposure_cr: Number(exp),
  outstanding_cr: Math.round(Number(exp) * 0.82),
  risk_band: 'green' as RiskBand,
  risk_score: Number(score),
  flagged_quarter: null,
  recovery_window: null,
  rera_id: `PRM/XX/RERA/2023/${String(i).padStart(6,'0')}`,
  loan_sanctioned: 'Jan 2023',
  loan_type: 'Construction Finance' as const,
}))

export const STERLING_PROJECTS: LendProject[] = [
  ...STERLING_RED,
  ...STERLING_AMBER,
  ...STERLING_GREEN,
]

// ── Synthetic projects for Bharat PSU Bank (showing 40 of 140) ──────────────
const BHARAT_RED: LendProject[] = [
  { id: 'bp-nayara-enclave', name: 'Nayara Enclave', developer: 'Nayara Infra', developer_id: 'nayara-infra', city: 'Lucknow', exposure_cr: 620, outstanding_cr: 620, risk_band: 'red', risk_score: 290, flagged_quarter: 'Q2 2022', recovery_window: 'AT RISK', rera_id: 'PRM/UP/RERA/2020/000801', loan_sanctioned: 'Jan 2020', loan_type: 'Construction Finance' },
  { id: 'bp-kashi-heights', name: 'Kashi Heights', developer: 'Varanasi Builders', developer_id: 'varanasi-builders', city: 'Varanasi', exposure_cr: 480, outstanding_cr: 480, risk_band: 'red', risk_score: 275, flagged_quarter: 'Q1 2023', recovery_window: 'AT RISK', rera_id: 'PRM/UP/RERA/2020/000842', loan_sanctioned: 'Jun 2020', loan_type: 'Term Loan' },
  { id: 'bp-northern-gardens', name: 'Northern Gardens', developer: 'Delhi NCR Infra', developer_id: 'delhi-ncr-infra', city: 'Noida', exposure_cr: 1000, outstanding_cr: 1000, risk_band: 'red', risk_score: 302, flagged_quarter: 'Q3 2023', recovery_window: 'AT RISK', rera_id: 'PRM/UP/RERA/2021/000915', loan_sanctioned: 'Oct 2021', loan_type: 'Construction Finance' },
]

const BHARAT_AMBER_NAMES = [
  ['BP-Vinayak Residency', 'Vinayak Infra', 'Jaipur', 285, 520],
  ['BP-Ganga View', 'Ganges Builders', 'Patna', 210, 508],
  ['BP-Sunrise Township', 'Sunrise Realty', 'Bhopal', 198, 515],
  ['BP-Bharat Nagari', 'National Builders', 'Indore', 178, 498],
  ['BP-Ashoka Plaza', 'Ashoka Group', 'Nagpur', 225, 524],
  ['BP-Veda Homes', 'Veda Constructions', 'Raipur', 155, 510],
  ['BP-Prakash Heights', 'Prakash Developers', 'Jabalpur', 142, 488],
  ['BP-Siddhi Vinayk', 'Siddhi Realty', 'Vadodara', 198, 530],
  ['BP-Triveni Towers', 'Triveni Infra', 'Allahabad', 162, 518],
  ['BP-Harmony Niwas', 'Harmony Builders', 'Agra', 135, 502],
  ['BP-Central View', 'Central Realty', 'Bhopal', 175, 508],
  ['BP-Saraswati Enclave', 'Saraswati Infra', 'Lucknow', 212, 522],
  ['BP-Yamuna Greens', 'Yamuna Estates', 'Mathura', 145, 495],
  ['BP-Shiv Parvati', 'Shiv Infra', 'Haridwar', 118, 512],
  ['BP-Gangotri Heights', 'Gangotri Developers', 'Dehradun', 165, 525],
  ['BP-Himalayan View', 'Himalayan Builders', 'Dehradun', 182, 532],
  ['BP-Vidarbha Homes', 'Vidarbha Infra', 'Amravati', 128, 498],
  ['BP-Konkan Coast', 'Konkan Realty', 'Ratnagiri', 108, 508],
  ['BP-Deccan Heritage', 'Deccan Infra', 'Aurangabad', 152, 515],
]

const BHARAT_AMBER: LendProject[] = BHARAT_AMBER_NAMES.map(([name, dev, city, exp, score], i) => ({
  id: `bp-amber-${i}`,
  name: String(name),
  developer: String(dev),
  developer_id: `bp-dev-${i}`,
  city: String(city),
  exposure_cr: Number(exp),
  outstanding_cr: Number(exp),
  risk_band: 'amber' as RiskBand,
  risk_score: Number(score),
  flagged_quarter: null,
  recovery_window: null,
  rera_id: `PRM/XX/RERA/2022/B${String(i).padStart(5,'0')}`,
  loan_sanctioned: 'Jan 2023',
  loan_type: 'Construction Finance' as const,
}))

const BHARAT_GREEN_NAMES = [
  ['BP-DDA Flats Sector 22', 'DDA Housing', 'New Delhi', 485, 812],
  ['BP-MHADA Premium', 'MHADA', 'Mumbai', 620, 825],
  ['BP-Tata Myst', 'Tata Housing', 'Lonavala', 145, 798],
  ['BP-Nirala Aspire', 'Nirala Group', 'Greater Noida', 178, 782],
  ['BP-Supertech Capetown', 'Supertech Ltd', 'Noida', 225, 775],
  ['BP-Gaur City', 'Gaursons India', 'Greater Noida', 318, 790],
  ['BP-Ajnara Le Garden', 'Ajnara India', 'Noida', 168, 778],
  ['BP-Amrapali Zodiac', 'Amrapali Group', 'Noida', 258, 768],
  ['BP-Antriksh Golf View', 'Antriksh Group', 'Noida', 142, 758],
  ['BP-Stellar Jeevan', 'Stellar Group', 'Greater Noida', 128, 762],
  ['BP-ATS Picturesque', 'ATS Infrastructure', 'Noida', 215, 788],
  ['BP-Purvanchal Silver City', 'Purvanchal Realty', 'Lucknow', 155, 775],
  ['BP-Shalimar Corp', 'Shalimar Group', 'Lucknow', 138, 768],
  ['BP-Eldeco City', 'Eldeco Group', 'Lucknow', 165, 780],
  ['BP-Omaxe Heights', 'Omaxe Ltd', 'Faridabad', 195, 785],
  ['BP-Unitech Vista', 'Unitech Ltd', 'Gurgaon', 268, 772],
  ['BP-Ansal API', 'Ansal Properties', 'Gurgaon', 198, 768],
  ['BP-DLF Ultima', 'DLF Ltd', 'New Delhi', 512, 848],
]

const BHARAT_GREEN: LendProject[] = BHARAT_GREEN_NAMES.map(([name, dev, city, exp, score], i) => ({
  id: `bp-green-${i}`,
  name: String(name),
  developer: String(dev),
  developer_id: `bp-dev-g${i}`,
  city: String(city),
  exposure_cr: Number(exp),
  outstanding_cr: Math.round(Number(exp) * 0.80),
  risk_band: 'green' as RiskBand,
  risk_score: Number(score),
  flagged_quarter: null,
  recovery_window: null,
  rera_id: `PRM/XX/RERA/2023/B${String(i).padStart(5,'0')}`,
  loan_sanctioned: 'Jan 2023',
  loan_type: 'Construction Finance' as const,
}))

export const BHARAT_PROJECTS: LendProject[] = [
  ...BHARAT_RED,
  ...BHARAT_AMBER,
  ...BHARAT_GREEN,
]
