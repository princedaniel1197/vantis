---
name: Vantis by Orianode — Project Context
description: AI regulatory intelligence demo for K-RERA empanelment with DK Shivakumar. All modules complete as of June 2026.
type: project
originSessionId: d22cbd4e-2a0a-47db-8cc8-46466889f10a
---
Vantis is a Next.js 14 demo built for a meeting with DK Shivakumar (Karnataka Deputy CM, K-RERA Chairman appointee) to win K-RERA empanelment as official AI intelligence partner.

**Why:** High-stakes political demo. Must be bulletproof — no live APIs, no databases, everything hardcoded except optional Claude API chatbot live mode.

**Project location:** `d:\Vantis Govern Demo\vantis\`
**GitHub:** princedaniel1197/vantis (main branch)

## Build Status (June 2026): FULLY AUDITED + DEMO-READY

Build: passing (8,937 static pages). All routes static. Chatbots wired to live Claude API with demo fallback. Data: 8,771 K-RERA scraped projects in `data/projects.json` powering all search and chatbot lookups.

**Final Playwright audit completed 28 June 2026** — 80/80 passed (zero failures). Full audit report in `d:\Vantis Govern Demo\final-audit\AUDIT_REPORT.md`. All critical DK Shivakumar demo paths verified.

**Bugs fixed in final session (28 June 2026):**
- Certificate ID mismatch: `projects.json` had wrong IDs for Prestige Lakeside (`007821-0002`) and Skylark Arcadia (`009134-0003`) — now match `certificates.json` and `generateStaticParams`
- Inventory float display: `₹8.200000000000001/sqft` → `₹820/sqft` (added `.toFixed(0)`)
- Graph loading overlay: added `{!fgReady && <overlay>}` in canvas area, visible until `fg.onEngineStop()` fires
- Added `public/robots.txt` and `public/manifest.json` to stop console 404s
- Audit script: `final-audit/audit2.js` rewritten as clean named-function pattern (was broken IIFE/named-function mix)

**Known timing quirks (not bugs):**
- Link Analysis graph needs ≥8s render time (force-directed layout computation)
- Notice Generator requires BOTH selects filled (violation type + project) before Generate enables

## Products

**Vantis Govern** (`/govern/*`) — K-RERA officer dashboard. `data-theme="void"` (dark gold).
- Sidebar grouped: OVERVIEW / REGISTRY / ENFORCEMENT / INTELLIGENCE / ADMIN
- 14 screens including Command Centre, Project Registry, QPR Tracker, Scanner, Risk, Predictive Default, Homebuyer Warning, Complaints, RRC, Notices, Vantis Intelligence chatbot
- Karnataka SVG map: district paths fixed (mysuru/chamarajanagara were swapped, now correct)

**Vantis Lend** (`/lend/*`) — Housing finance credit intelligence. `data-theme="forest"` (dark green).
- Sidebar grouped: MONITOR / VERIFY / SCORE / PLATFORM / ANALYTICS
- Persona switcher (Kaveri HFC + others), portfolio grid, project drill-down, tranche control, developer risk scores

**Vantis Verify** (`/verify/*`) — Homebuyer trust check. `data-theme="forest"` (dark green, not sage light anymore).
- Sidebar grouped: SEARCH / DATA SOURCES (LIVE badges) / ALERTS
- Trust Check, Full Report, All Projects pages

**Vantis Build OS** (`app/(os)/`, URLs at root level) — Developer intelligence OS. `data-theme="void"` or `daylight` (theme toggle).
- 16 modules: Command, CRM, Visits, Inventory, Partners, Projects, Construction, Customers, Finance, Payments, Land, Feasibility, Market, Litigation, Compliance, Certificate, Vision, Assistant
- OSNav mega-menu (dropdown groups). OSAssistant floating bubble.

**Public Portal** (`/`) — Hub page linking all 4 products + public K-RERA search.

## Chatbots (all 5 wired to live Claude API)

- `VantisIntelligence` — Govern/public pages. Live mode → `/api/chat/` (Anthropic Claude). Falls back to KB lookup.
- `ProductChatbot` — Verify (Verify AI) and OS routes (Build AI / Connect AI). Same API pattern.
- `LendChatbot` — Lend module. Dedicated credit analyst system prompt.
- `OSAssistant` — OS routes floating bubble.
- `DevAssistant` — Developer routes.

All use `/api/chat/` (trailing slash required — Next.js trailingSlash: true).
API key: `ANTHROPIC_API_KEY` in `.env.local` and Vercel env vars.

## Chatbot Knowledge (`lib/chatbot-knowledge.ts`)

`CAGED_SYSTEM_PROMPT` contains full K-RERA stats:
- 8,771 projects: 6,727 HIGH RISK (77%) / 1,459 CAUTION / 581 COMPLIANT
- Top districts: Bengaluru Urban 4,044, Mysore 688, Bengaluru Rural 637, Dakshina Kannada 606
- 5,742 complaints across 2,080 projects
- Top developers, project type breakdown

Developer name lookup: stopword-filtered partial match (e.g. "sankalp" → "SANKALP CONSTRUCTIONS"). Works across all 8,771 scraped projects.

`formatProjectAnswer`: handles scraped data anomalies — total_units=0, corrupted registration_date (contains project type string), units_sold=null. Uses `proposed_completion` fallback for dates.

## Key Schema Facts

- dev-projects.json: `rera_id`, `qpr_status` UPPERCASE (`ON_TIME`/`DUE_SOON`/`OVERDUE`)
- dev-channel.json: `brokers` array, `tier` lowercase (platinum/gold/silver)
- dev-market.json: `quarterly` dict keyed by market id
- dev-land.json: top-level keys `ozone` and `mrd010`
- dev-chatbot.json: `responses[].en`/`.kn`, `fallback` is string
- os-command.json: has `cash.monthly_trend`
- os-finance.json: `summary`, `pl`, `escrow_accounts`, `journal_entries` (no `cash` key)
- data/projects.json: 8,771 scraped K-RERA projects. Fields: `rera`, `name`, `developer_name`, `location`, `status`, `risk_score`, `approved_on`, `proposed_completion`. NOTE: `total_units`=0, `registration_date` = project type string (corrupted), `units_sold`=null for scraped projects.

**How to apply:** Read CLAUDE.md inside the project before every session. Never break the build. No databases. No new dependencies without asking. Always check actual JSON schema before writing pages.
