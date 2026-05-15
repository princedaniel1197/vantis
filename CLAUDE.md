# CLAUDE.md — Vantis by Orianode
# Read this file completely before writing any code.
# Update the Build Status section at the end of every session.

---

## 1. WHAT WE ARE BUILDING

**Company:** Orianode Technologies Private Limited
**Product:** Vantis by Orianode
**Tagline:** Palantir for Indian real estate

Vantis is an AI-powered regulatory intelligence platform for the Karnataka
real estate market. We are building a demo for a meeting with DK Shivakumar
— Karnataka Deputy CM and K-RERA Chairman appointee — to win K-RERA
empanelment as their official AI intelligence partner.

The demo has two products:

**Product 1 — Vantis Public Portal**
Free, public-facing portal for Karnataka homebuyers. Any citizen searches
any K-RERA registered project and sees its compliance status in plain
English or Kannada. No login required for basic search.

**Product 2 — Vantis Govern**
Officer-facing regulatory intelligence dashboard for K-RERA officers.
15 screens. Role-based access. The system that catches the Ozone Urbana
collapse 8 quarters early.

Both products live on the same Next.js codebase.
Public portal: /
Vantis Govern: /govern

Everything runs on localhost. No domain. No deployment needed for demo.

---

## 2. CRITICAL RULES — READ BEFORE WRITING ANY CODE

1. ALL DATA IS HARDCODED. No databases. No external APIs except
   Claude API for live chatbot mode. No Prisma. No Supabase.
   No MongoDB. No exceptions.

2. NO UNNECESSARY DEPENDENCIES. Only install what is listed in
   the tech stack. Do not add libraries without being asked.

3. DO NOT REFACTOR WORKING CODE. If something works, do not
   touch it unless explicitly told to.

4. BUILD ONE THING AT A TIME. Complete the current task fully
   before moving to the next.

5. MOBILE FIRST. Build every component mobile first, then desktop.

6. NEVER BREAK THE BUILD. Run npm run build after every major
   addition. Fix all errors before continuing.

7. UPDATE BUILD STATUS at end of every session.

8. THE CHATBOT IS CRITICAL. It must look and feel completely
   real. Typing animation. Realistic responses. Smooth UI.
   Two modes: DEMO MODE (hardcoded, default) and LIVE MODE
   (real Claude API). Demo mode is default for DK meeting
   so it never fails due to network issues.

---

## 3. TECH STACK

- Framework:   Next.js 14 (App Router)
- Styling:     Tailwind CSS
- Animations:  Framer Motion
- Charts:      Recharts (risk timeline graph only)
- QR Code:     qrcode.react
- Icons:       Lucide React
- AI:          Anthropic SDK (claude-sonnet-4-20250514)
- Fonts:       Syne (headings) + DM Sans (body) — Google Fonts
- Deployment:  Localhost only for demo

---

## 4. FOLDER STRUCTURE

```
vantis/
├── CLAUDE.md
├── .env.local
├── app/
│   ├── layout.tsx
│   ├── page.tsx                     ← public portal home
│   ├── project/[id]/page.tsx        ← project profile
│   ├── developer/[id]/page.tsx      ← developer profile
│   ├── complaint/file/page.tsx      ← file complaint
│   ├── complaint/track/page.tsx     ← track complaint
│   ├── alerts/page.tsx              ← my project alerts
│   ├── certificate/[id]/page.tsx    ← certificate verification
│   └── govern/
│       ├── layout.tsx               ← sidebar layout
│       ├── page.tsx                 ← command centre
│       ├── projects/page.tsx        ← project registry
│       ├── projects/[id]/page.tsx   ← project profile (6 tabs)
│       ├── qpr/page.tsx             ← QPR tracker
│       ├── litigation/page.tsx      ← litigation watchlist
│       ├── scanner/page.tsx         ← submission scanner
│       ├── risk/page.tsx            ← developer risk
│       ├── predictive/page.tsx      ← predictive default
│       ├── homebuyer/page.tsx       ← homebuyer early warning
│       ├── complaints/page.tsx      ← complaint management
│       ├── rrc/page.tsx             ← RRC tracker
│       ├── notices/page.tsx         ← AI notice generator
│       ├── intelligence/page.tsx    ← Vantis Intelligence
│       └── settings/page.tsx        ← settings
├── components/
│   ├── public/
│   │   ├── SearchBar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── QPRTimeline.tsx
│   │   ├── ComplaintSummary.tsx
│   │   ├── CertificateCard.tsx
│   │   └── LanguageToggle.tsx
│   ├── govern/
│   │   ├── Sidebar.tsx
│   │   ├── CommandCentre.tsx
│   │   ├── RiskTimeline.tsx
│   │   ├── AssessmentCard.tsx
│   │   ├── QPRTracker.tsx
│   │   └── AlertCard.tsx
│   ├── shared/
│   │   ├── VantisIntelligence.tsx   ← CRITICAL — chatbot bubble
│   │   ├── KarnatakaMap.tsx
│   │   ├── RiskBadge.tsx
│   │   └── DataFreshness.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Table.tsx
│       └── Modal.tsx
├── data/
│   ├── projects.json
│   ├── developers.json
│   ├── complaints.json
│   ├── qpr.json
│   ├── litigation.json
│   ├── certificates.json
│   ├── ozone-urbana.json            ← DK demo risk timeline
│   └── chatbot-responses.json       ← hardcoded demo responses
├── lib/
│   ├── claude.ts
│   ├── scoring.ts
│   └── utils.ts
└── styles/globals.css
```

---

## 5. DESIGN SYSTEM

### Tailwind Config Colors

```js
colors: {
  background: '#080810',
  surface:    '#0E0E1A',
  surface2:   '#1A1A28',
  gold:       '#C9A84C',
  'gold-light':'#E8D5A3',
  'gold-dim': '#8B7035',
  'off-white':'#F0EEE8',
  gray:       '#6B6B88',
  'gray-light':'#9090AA',
  border:     '#2A2A3E',
  'border-gold':'#3A3020',
  green:      '#2ECC71',
  amber:      '#F39C12',
  red:        '#E74C3C',
  blue:       '#3498DB',
}
```

### Typography
```
font-syne — headings, brand elements, section numbers
font-sans  — body text (DM Sans)
font-mono  — numbers, codes, RERA numbers (DM Mono)
```

### Status Badges
```
COMPLIANT: bg-green/15 text-green border border-green/30
CAUTION:   bg-amber/15 text-amber border border-amber/30
HIGH RISK: bg-red/15 text-red border border-red/30
```

### Design Rules
- Background always #080810 — never white in govern or public portal
- Certificate page exception — white/light background (official document feel)
- Gold on all interactive elements, active states, key numbers
- Cards: bg-surface border border-border rounded-sm p-4
- Key callouts: border-l-2 border-gold pl-4 bg-surface
- No shadows — depth through borders only
- Hover transitions: duration-150 ease-in-out
- Borders shift toward gold on hover/active

---

## 6. HARDCODED DATA — FULL SPECIFICATIONS

(See data/*.json files for complete data)

K-RERA Officer Logins (hardcoded):
```
chairman@krera.gov.in  / demo → Chairman view
technical@krera.gov.in / demo → Member Technical view
legal@krera.gov.in     / demo → Member Legal view
secretary@krera.gov.in / demo → Secretary view
```

---

## 7. VANTIS INTELLIGENCE CHATBOT — CRITICAL FEATURE

Floating bubble — bottom right corner of every page.
Two modes: DEMO MODE (default, hardcoded) and LIVE MODE (Claude API).
See data/chatbot-responses.json for all demo responses.
See CLAUDE.md Section 7 in the original document for full UI specifications.

---

## 8. CERTIFICATE VERIFICATION PAGE

Route: /certificate/[id]
Light background only. Official document aesthetic.
See data/certificates.json for certificate data.

---

## 10. BUILD STATUS

### Current Phase: FEY VISUAL REDESIGN COMPLETE
### Current Session: SESSION 7 COMPLETE — FEY REDESIGN DONE

### Session 1 — Completed (2026-05-12):
1. ✅ Created Next.js 14 project with App Router and Tailwind
2. ✅ Added Tailwind config with complete color system from spec
3. ✅ Imported Syne + DM Sans + DM Mono from Google Fonts via next/font/google
4. ✅ Created complete folder structure — all folders and empty/placeholder files
5. ✅ Created all JSON data files with complete hardcoded data:
   - projects.json (4 projects: Divya Villas, Ozone Urbana, Prestige Lakeside, Skylark Arcadia)
   - developers.json (4 developers)
   - complaints.json (7 complaints with full detail)
   - qpr.json (8 quarters × 4 projects — extended from 5 to 8 in Session 2)
   - litigation.json (4 active cases)
   - certificates.json (3 certificates with 5-point verification each)
   - ozone-urbana.json (8-quarter risk timeline — DK demo centrepiece)
   - chatbot-responses.json (6 demo responses with keyword matching)
6. ✅ Created root layout.tsx with fonts and global metadata
7. ✅ Created placeholder page.tsx for every single route
8. ✅ npm run build — passes with zero errors

### Session 2 — Completed (2026-05-13):
1. ✅ Public Portal home page (app/page.tsx)
   - Centered search bar with live dropdown (filters from projects.json)
   - Three pill filters: Project / Developer / RERA Number
   - Three stat cards: 8,357 / 891 / 234
   - Language toggle: English ↔ Kannada (full UI translation)
   - Clicking result navigates to /project/[id]
   - Dark background, gold accents per design system

2. ✅ Project profile page (app/project/[id]/page.tsx)
   - Status badge with plain-language compliance sentence
   - Vantis Risk Score bar (color coded green/amber/red)
   - Project facts grid (8 fields)
   - QPR timeline with 8 colored dots (ON_TIME/LATE/MISSED/NA)
   - Complaint summary (3 numbers: pending, resolved, total)
   - Certificate card with QR code (components/public/CertificateCard.tsx)
   - Court cases list with severity badges
   - Two gold CTA buttons at bottom

3. ✅ VantisIntelligence chatbot (components/shared/VantisIntelligence.tsx)
   - Floating gold bubble fixed bottom-right on every page
   - 380px panel, 520px tall, animated open/close via framer-motion
   - Demo mode: keyword matching against chatbot-responses.json
   - 1.5s typing animation (3 animated gold dots via CSS keyframes)
   - Suggested query chips shown on open (different for govern vs public)
   - Demo/Live toggle in header (Live shows "coming soon")
   - Mounted in app/layout.tsx — appears on every page

4. ✅ Vantis Govern sidebar layout (app/govern/layout.tsx)
   - Login screen at /govern with 4 hardcoded K-RERA officer credentials
   - localStorage auth with role persistence
   - Sidebar: 13 navigation links with active route gold highlight
   - Officer name + role badge in top bar (color coded by role)
   - Collapsible on mobile with hamburger toggle + overlay

5. ✅ Govern Command Centre (app/govern/page.tsx)
   - 5 headline KPI cards with icons
   - Karnataka SVG district map (17 districts, color coded by risk)
   - Click district → shows projects in that district
   - Bengaluru Urban = RED (Ozone Urbana, Prestige Lakeside, Skylark Arcadia)
   - Mysuru = GREEN (Divya Villas)
   - 3 live feed cards: Critical Alerts / QPR Defaults / Active Litigation

6. ✅ npm run build — 21/21 routes, zero errors

### Session 3 — Completed (2026-05-13):
1. ✅ Certificate verification page (app/certificate/[id]/page.tsx)
   - Light #FAF8F3 background — official document aesthetic
   - Status banner: FULL (green) / PROVISIONAL (amber) / FLAGGED (red)
   - 5-point regulatory verification blocks with CheckCircle/AlertTriangle/XCircle icons
   - Certificate metadata grid: ID (mono gold), Valid Until, Issued On, Last Verified
   - QR code (qrcode.react) — links back to the certificate URL
   - "Issued by Orianode Technologies" footer
   - 404 state renders on light background

2. ✅ Govern Project Registry (app/govern/projects/page.tsx)
   - Search bar filtering across name, developer, location, RERA number
   - Status filter pills: All / COMPLIANT / CAUTION / HIGH RISK with counts
   - Developer dropdown filter
   - Desktop table: name+RERA, developer, location, type, status badge, risk score with bar, QPR Q1 2026, certificate status, chevron
   - Mobile card list: same data in stacked card format
   - Project count indicator
   - Click row → navigates to /govern/projects/[id]

3. ✅ Govern Project Profile (app/govern/projects/[id]/page.tsx)
   - 6 tabs: Overview | QPR History | Financial | Litigation | Risk Timeline | Actions
   - Tab 1 (Overview): project facts grid, units sold progress bar, construction completion bar, developer card with trust score, complaints summary
   - Tab 2 (QPR History): 8-quarter table with due dates, filed dates, status, days late, penalties (Rs.25,000/day for MISSED); total penalty callout for HIGH RISK projects
   - Tab 3 (Financial): escrow balance, collected, escrow % (hardcoded: ozone=8% CRITICAL, prestige=23% HEALTHY, divya=41% HEALTHY, skylark=14% CAUTION), last withdrawal, note
   - Tab 4 (Litigation): cases from litigation.json; empty state with CheckCircle for no-litigation projects
   - Tab 5 (Risk Timeline): dynamic(RiskTimeline, {ssr:false}) for Ozone Urbana; "insufficient data" state with link for others
   - Tab 6 (Actions): Generate Show Cause Notice (link to /govern/notices), Flag for Inspection (modal), Initiate RRC (modal), Watchlist toggle with confirmation
   - RiskTimeline component: AreaChart (score + default_probability), amber→red gradient, clickable dots, detail panel, 4 stat cards, reference lines at y=40 and x="Q1 2022"

4. ✅ npm run build — 21/21 routes, zero errors

### Session 4 — Completed (2026-05-13):
1. ✅ QPR Compliance Tracker (/govern/qpr)
   - 3 stat cards: Projects Due (4), On Time (2), Defaulting (2) for Q1 2026
   - Total penalty callout across all MISSED entries
   - Filter tabs: All / On Time / Late / Missed with counts
   - Desktop table: checkbox, project, developer, quarter, due date, filed date, status badge, days overdue, penalty with animated pulse dot
   - Mobile cards: same data in stacked layout
   - Bulk action: sticky bar when MISSED rows selected → "Generate Batch Notices" → confirmation modal listing selected projects
   - Penalty formula: Rs.25,000/day per missed quarter

2. ✅ Litigation Watchlist (/govern/litigation)
   - Total alert count badge in header
   - Filter tabs: All / High Court / District Court / Criminal
   - Cards sorted by severity (CRITICAL first): left border red for High Court/Criminal, amber for District Civil
   - Each card: case type badge, severity badge, case number, court, project, developer, survey numbers, plaintiff, filing date (days ago), next hearing date (urgency amber when ≤14 days)
   - Empty state for no-result filters
   - "View Project" button links to /govern/projects/[id]

3. ✅ Submission Scanner (/govern/scanner)
   - Queue of 3 hardcoded applications (GREEN/AMBER/RED risk)
   - Selected app loads assessment card on right (default: RED)
   - 5-point verification: Title (Kaveri 2.0), Land Area (Bhoomi), Litigation (eCourts), FAR/Zoning (BBMP/BDA), Financial (Internal/RERA)
   - RED app: undisclosed mortgage ₹4.2 Cr + 18% land area discrepancy (realistic failing findings)
   - Risk score bar + fail/warning counts in card header
   - 4 action buttons: Approve / Approve with Conditions / Reject / Request Documents
   - Approve and Reject have confirmation modals with finding details

4. ✅ Predictive Default Analytics (/govern/predictive)
   - Gold-bordered callout: Ozone Urbana flagged 8 quarters before FIR at 34% probability
   - 4 projects ranked by default probability: 97% / 34% / 3% / 2%
   - Desktop table: rank (large font), project, developer, risk score, default % with colored progress bar, 3-signal bullet list, action badge
   - Mobile cards: same data
   - Ozone row: red background tint
   - Click row → /govern/projects/[id]?tab=timeline

5. ✅ Homebuyer Early Warning (/govern/homebuyer)
   - 3 metric cards: 1,847 homebuyers in distressed projects, ₹927 Cr capital at risk, 1 project critical
   - Table: project, developer, status badge, homebuyers count, capital at risk, possession status, alert tier (CRITICAL/WATCH/CLEAR)
   - Ozone: CRITICAL tier, red tint, 1847 homebuyers, ₹927 Cr, "Overdue 4+ years"
   - Skylark: WATCH tier, amber tint, 98 homebuyers, ₹18.4 Cr
   - Prestige/Divya: CLEAR, green
   - Bottom callout: gold border, "Vantis flags before complaints arrive"

6. ✅ npm run build — 21/21 routes, zero errors

### Session 5 — Completed (2026-05-13):
1. ✅ AI Notice Generator (/govern/notices)
   - Two-column layout: form (left) + notice preview (right)
   - 5 violation types: QPR Default (S.63), Registration (S.59), False Info (S.60), Unregistered (S.59), Other (S.64)
   - Project selector, auto-populated RERA section + developer details
   - English/Kannada toggle; Ozone+QPR Kannada notice included
   - 1.5s loading with typing-dot animation, then government letterhead document
   - Ozone Urbana QPR penalty: Rs.45,75,000 (1830 days × Rs.25,000)
   - Copy to Clipboard + Download as PDF (window.print())

2. ✅ Complaint Management (/govern/complaints)
   - Stats: 17 total / 14 pending / 3 resolved (hardcoded)
   - Filter tabs: All / Filed / Hearing Scheduled / Order Passed / Resolved
   - 7 records from inline data (matches complaints.json)
   - Complainants anonymised as Homebuyer 001–007
   - Days pending calculated from filed_date; red warning icon if PENDING >60 days
   - Row click expands inline: description, resolution summary, amount at risk
   - Schedule Hearing modal (date picker), Record Order modal (textarea)

3. ✅ RRC Tracker (/govern/rrc)
   - Stats: 3 RRCs, ₹48.0 L outstanding, ₹0 recovered this quarter
   - 3 hardcoded cards: RRC-2026-001 Ozone ₹45.75L Issued 0% (red alert, 32 days unacknowledged), RRC-2026-002 Skylark ₹2.25L Acknowledged 0%, RRC-2024-003 ₹0.20L Recovered 100%
   - Status: Issued (gray) / Acknowledged (blue) / In Recovery (amber) / Recovered (green)
   - Progress bar per card, linked notice number, View Project link
   - Bottom callout: auto-escalation after 30 days; RRC-2026-001 is 2 days from escalation

4. ✅ Developer Risk Intelligence (/govern/risk)
   - Search bar filters developer list
   - 2×2 grid desktop / stacked mobile
   - Each card: large trust score (color-coded), 6 component mini bars, project badges
   - Scores: Prestige 91 (green), Zion 78 (green), Skylark 54 (amber), Ozone 9 (red)
   - Ozone card: red border + enforcement warning banner
   - Click expand → project links with status badges

5. ✅ Settings and Admin (/govern/settings)
   - Section 1: Current User — reads localStorage.vantis_officer, shows name/email/role
   - Section 2: Notification Preferences — 4 toggles, Priority 1 locked always-on
   - Section 3: Data Freshness table — K-RERA 6h, eCourts 4h, others weekly, QPR live
   - Section 4: Demo Mode toggle — writes to localStorage.vantis_demo_mode, shows gold DEMO badge

6. ✅ npm run build — 21/21 routes, zero errors

### Session 6 — Completed (2026-05-13): DEMO POLISH
1. ✅ AI Notice Generator (/govern/notices) — CONFIRMED FULLY BUILT in Session 5 (two-column form + letterhead preview)

2. ✅ Demo Mode global indicator (govern/layout.tsx)
   - Gold DEMO badge in desktop and mobile top bars, reads vantis_demo_mode from localStorage
   - Ctrl+Shift+D keyboard shortcut toggles demo mode anywhere in Govern

3. ✅ Complaint Filing Wizard (/complaint/file)
   - 3-step wizard: Step 1 (name/phone/email with validation), Step 2 (project search + 6 nature tiles), Step 3 (textarea 50-2000 chars, photo upload placeholder)
   - Success screen: VG-2026-XXXXXX ref, WhatsApp preview, track button
   - Full Kannada translation

4. ✅ Complaint Tracker (/complaint/track)
   - Search by ref number or CMP-XXXX-XXX from complaints.json
   - Visual 6-step progress bar (Filed → Acknowledged → Notice → Hearing → Order → Resolved)
   - Gold progress line, next-step callout, detail grid, timeline of events
   - Full Kannada translation; not-found state shows K-RERA helpline
   - Suspense-wrapped for useSearchParams compatibility

5. ✅ Developer Profile (/developer/[id])
   - Trust score (large, color-coded), status badge, years active
   - 4 stat cards (total/active/completed/units)
   - 3 component score bars: QPR compliance, complaint density, completion rate
   - Project cards with units sold bar, risk score, completion date
   - Gold CTA: "Get Full Intelligence Report — ₹499"
   - Full Kannada translation

6. ✅ Polish pass
   a. Chatbot confirmed in app/layout.tsx — visible on all routes including Govern ✅
   b. Kannada stats/placeholder already in TRANSLATIONS — confirmed working ✅
   c. Recharts Area animationDuration=1500 already set in RiskTimeline component ✅
   d. Gold animate-ping ring on chatbot bubble when closed + no messages sent ✅
   e. Karnataka map district click → side panel confirmed working from Session 2 ✅

7. ✅ npm run build — 21/21 routes, zero errors

### Session 7 — Completed (2026-05-13): FEY VISUAL REDESIGN
1. ✅ Global Tailwind color update: background #0A0A0F, surface #0F0F1A, surface2 #161622, border #1E1E2E; added silver + border-soft
2. ✅ globals.css: --background + body background updated to #0A0A0F
3. ✅ Batch 1 — app/page.tsx, app/project/[id]/page.tsx, app/govern/layout.tsx (w-[220px] sidebar), app/govern/page.tsx
4. ✅ Batch 2 — app/govern/projects/page.tsx, app/govern/projects/[id]/page.tsx, app/govern/qpr/page.tsx, app/govern/litigation/page.tsx
5. ✅ Batch 3 — app/govern/scanner/page.tsx, app/govern/predictive/page.tsx, app/govern/homebuyer/page.tsx, app/govern/complaints/page.tsx
6. ✅ Batch 4 — app/govern/rrc/page.tsx, app/govern/risk/page.tsx, app/govern/notices/page.tsx (no changes needed), components/shared/VantisIntelligence.tsx
7. ✅ All status badges: NO fill — colored dot (w-1.5 h-1.5 rounded-full) + colored text via statusColor/statusDot helper pairs
8. ✅ rounded/rounded-full → rounded-sm everywhere; section labels → font-mono text-[10px] uppercase tracking-[0.15em]
9. ✅ npm run build — 21/21 routes, zero errors

### Session 8 — Completed (2026-05-13): STATIC EXPORT + POST-APPROVAL FLOW
1. ✅ Static export configured: next.config.mjs output: 'export', trailingSlash: true, images: { unoptimized: true }
2. ✅ All dynamic routes now export generateStaticParams:
   - /certificate/[id] — server wrapper + CertificateContent.tsx client component (3→4 IDs)
   - /developer/[id] — server wrapper + DeveloperContent.tsx client component (4 IDs)
   - /project/[id] — useRouter removed, replaced with Link, generateStaticParams inline (4 IDs)
   - /govern/projects/[id] — server wrapper + ProjectDetailContent.tsx client component (4 IDs)
3. ✅ build.bat + serve.bat created in d:\Vantis Govern Demo\ for offline demo
4. ✅ Post-approval flow added to Submission Scanner (/govern/scanner):
   - Approve modal: rich summary (project, developer, application no., pre-assessment result) + green callout box
   - Confirm Approval → full-page success state: status banner, Vantis certificate card (VG-2026-007934-0004), next steps
   - "View Certificate" navigates to /certificate/VG-2026-007934-0004
   - "Return to Scanner Queue" resets to original scanner state
5. ✅ New certificate VG-2026-007934-0004 added to data/certificates.json:
   - Prestige Whitefield Phase 2 · Prestige Group · FULL · all 5 checks PASS
6. ✅ npm run build — 37/37 routes, zero errors

### Session 9 — Completed (2026-05-16): REAL DOCUMENTS — DIVYA VILLAS
1. ✅ Documents tab added as 7th tab to Govern Project Profile
2. ✅ Divya Villas: green banner + 6 document categories:
   - Registration Documents (8 PDFs)
   - QPR Supporting Documents — Q4 2025 (4 PDFs)
   - Extension Documents (4 PDFs)
   - NOCs and Approvals (2 PDFs + 1 JPEG)
   - Site Progress Photos (13 JPEG thumbnails in 4-column responsive grid, click opens full image)
   - Certificates (RERA cert opens PDF; Vantis cert links to /certificate/VG-2026-007034-0001)
3. ✅ All other projects: empty state with FileX icon "No documents uploaded yet."
4. ✅ All document files served from public/documents/divya-villas/ (filenames with spaces, URL-encoded)
5. ✅ npm run build — 37/37 routes, zero errors

### DEMO STATUS: READY FOR DK SHIVAKUMAR MEETING
