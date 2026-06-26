# Vantis Design System v2

## Philosophy

**Aesthetic target:** Bloomberg terminal × luxury brand — authoritative, data-dense, institutional.  
**Not:** generic glassy SaaS, frosted glass, gradient blobs, or rounded-everything.

Every decision optimises for two things simultaneously:
1. **Credibility** in a government/investor pitch context  
2. **Legibility** of high-density data under pressure

---

## Color System

### Backgrounds (depth layers — no shadows, depth through surface color)

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0A0A0F` | Page background (void) |
| `surface` | `#0F0F18` | Cards, panels, sidebars |
| `surface2` | `#161622` | Elevated overlays, dropdowns |
| `border` | `#1E1E2E` | Default dividers |
| `border-soft` | `#2A2A3E` | Subtle separators |

### Brand Gold

| Token | Hex | Usage |
|-------|-----|-------|
| `gold` | `#C9A84C` | Interactive elements, active states, CTAs |
| `gold-light` | `#E8D5A3` | Hover highlights |
| `gold-dim` | `#8B7035` | Disabled / secondary gold |
| `gold-ghost` | `rgba(201,168,76,0.08)` | Background tints (inline style) |

### Status Colors (vivid — meant to read through dense data)

| Token | Hex | Usage |
|-------|-----|-------|
| `green` | `#22C55E` | Compliant, clean, healthy |
| `amber` | `#F59E0B` | Caution, warning, overdue |
| `red` | `#EF4444` | Critical, distressed, HIGH RISK |
| `blue` | `#3B82F6` | Informational |

### Text

| Token | Hex | Usage |
|-------|-----|-------|
| `off-white` | `#F0EEE8` | Primary text |
| `gray-light` | `#9090AA` | Secondary text |
| `gray` | `#6B6B88` | Labels, captions, muted |

---

## Typography

### Font stack
- **Display/Brand:** `font-syne` (Syne) — headings, KPI numbers, product names
- **Body:** `font-sans` (DM Sans) — prose, descriptions, UI copy
- **Data/Labels:** `font-mono` (DM Mono) — RERA codes, percentages, tags, timestamps, ALL numeric data labels

### Scale

| Role | Class | Size | Notes |
|------|-------|------|-------|
| KPI Hero | `font-syne text-[2.5rem] font-bold` | 40px | Command Centre KPIs, portfolio totals |
| Page Title | `font-syne text-3xl font-bold` | 30px | Per-page H1 |
| Section Title | `font-syne text-xl font-semibold` | 20px | Card / panel headers |
| Body | `text-sm` | 14px | Default prose |
| Label | `font-mono text-[9px] uppercase tracking-[0.22em]` | 9px | Section headers, data labels |
| Badge | `font-mono text-[9px]` | 9px | Status chips, tags |
| Nano | `font-mono text-[8px]` | 8px | Timestamps inside dense tables |

### Rules
- All numbers: `font-mono tabular-nums`
- All status labels: mono uppercase with dot prefix, never filled backgrounds
- All RERA/reference codes: `font-mono text-gold`
- Section labels always `uppercase tracking-[0.22em]` — this is the Vantis fingerprint

---

## Spacing

8px base grid. Use Tailwind's scale (`p-1`=4px, `p-2`=8px, `p-3`=12px, `p-4`=16px, `p-5`=20px, `p-6`=24px).

**Cards:** `p-5` internal padding, `rounded-sm` (2px radius)  
**Compact rows:** `px-4 py-2.5`  
**Section headers:** `px-5 py-3`  
**Page padding:** `px-6 sm:px-8`

---

## Component Patterns

### Cards
```
bg-surface border border-border rounded-sm p-5
```
Hover: `hover:border-gold/30 hover:bg-surface/80`

### KPI Cells (terminal strip)
```
grid bg-border gap-px → child cells: bg-background px-5 py-5
```
Numbers: `font-syne text-[2.5rem] font-bold` with NumberTicker animation  
Labels: `font-mono text-[9px] uppercase tracking-[0.22em] text-gray`

### Status Indicators
```
<div className="w-1.5 h-1.5 rounded-full bg-{status}" />
<span className="text-[9px] font-mono text-{status}">{STATUS}</span>
```
No filled pill backgrounds. Dot + text only.  
Exception: CRITICAL items get `border border-red/25 bg-red/[0.04]` card tint.

### Navigation (sidebars)
Active: `border-l-2 border-gold bg-gold/[0.07] text-gold`  
Inactive: `border-l-2 border-transparent text-gray hover:text-gold`

### Buttons
- **Primary:** `bg-gold text-background px-4 py-2 font-mono text-xs rounded-sm`
- **Secondary:** `border border-border text-off-white px-4 py-2 text-xs rounded-sm hover:border-gold/40`
- **Ghost:** `text-gray text-xs font-mono hover:text-gold`

---

## Elevation Model

No box-shadows. Depth comes from:
1. **Background stacking:** `#0A0A0F` → `#0F0F18` → `#161622`
2. **Border contrast:** `border-border` on cards lifts them from the void
3. **Status tints:** Red/amber `bg-{color}/[0.03-0.05]` on alert cards creates visual urgency without glow

---

## Motion Language

**Rule:** 1–2 key animated elements per viewport. Never fire everything at once.

| Pattern | Usage | Parameters |
|---------|-------|------------|
| **Number Ticker** | All KPIs, portfolio totals, risk scores | `duration: 1.5s, ease: [0.16, 1, 0.3, 1]` |
| **Staggered fade-up** | Card grid entries | `delay: i * 0.07s, y: 10→0, duration: 0.45s` |
| **Crossfade swap** | Panel state changes (district ↔ alerts) | `duration: 0.18s, x: ±6px` |
| **Cascade reveal** | List items within a panel | `delay: i * 0.04-0.08s, y: 3→0` |
| **Pulse** | Live indicator, critical alert dot | `animate-pulse (Tailwind)` |

**Never:**
- Parallax or scroll-triggered animations
- Bouncy spring on data elements
- Hover scale on table rows
- Simultaneous entry of >8 elements

**Always:**
- Respect `prefers-reduced-motion` (globals.css handles this globally)
- Delay number tickers until `useInView` fires

---

## Accessibility Rules

- Focus ring: `outline: 2px solid var(--gold)` (set in globals.css)
- Contrast: all text against backgrounds must meet WCAG AA (4.5:1 for body, 3:1 for large)
- Interactive touch targets: minimum 44×44px on mobile
- Status meaning never conveyed by color alone: always paired with text/icon

---

## Product Color Accents (hub page only)

| Product | Accent |
|---------|--------|
| Govern | Gold `#C9A84C` |
| Build | Steel `#B8C8D8` |
| Lend | Teal `#4ABFBF` |
| Data Room | Gold `#C9A84C` |
| Connect | Purple `#9B59B6` |
| Verify | Green `#3FA66A` |

---

## Applied Reference: Govern Command Centre

The flagship implementation of this system. Key choices:
- Terminal KPI strip (no card borders, gap-px grid, background void visible through gaps)
- `text-[2.5rem]` animated numbers — the largest type on the screen
- Intel panel (right 38%) split into district drill-down + live feed
- Red alert cards with `bg-red/[0.035]` tint — alarming without being loud
- All section labels 9px mono uppercase — consistent across every panel header
