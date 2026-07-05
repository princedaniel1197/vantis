'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import financeData from '@/data/os-finance.json'
import VerificationPanel from '@/components/os/VerificationPanel'

// Stage 3 ⊕ — declared RERA collections vs actual Kaveri registrations (consume the ERP's RERA statement, verify it)
const RERA_STATEMENT = [
  { project: 'Meridian Skyline', declared: 78, verified: 76 },
  { project: 'Divya Villas · JDA', declared: 94, verified: 92 },
  { project: 'Meridian Edge P2', declared: 54, verified: 41 },
  { project: 'Ozone Urbana', declared: 62, verified: 28 },
]

const RECEIVABLES = [
  { buyer: 'Vikram Mehta', unit: 'B-1204', demand: 18.4, received: 12.0, overdue: 12 },
  { buyer: 'Suchitra Das', unit: 'Villa 14', demand: 24.0, received: 22.5, overdue: 5 },
  { buyer: 'Rahul Iyer', unit: 'A-0905', demand: 15.2, received: 8.4, overdue: 41 },
  { buyer: 'Neha Kulkarni', unit: 'C-1710', demand: 21.6, received: 21.6, overdue: 0 },
]

const { summary, pl, escrow_accounts, journal_entries } = financeData

const quarterData = pl.quarters.map((q, i) => ({
  q,
  revenue: pl.revenue[i],
  ebitda: pl.ebitda[i],
  opex: pl.opex[i],
}))

const ESCROW_COLOR = (status: string) => status === 'healthy' ? 'var(--ra)' : status === 'caution' ? 'var(--rb)' : 'var(--rc)'
const TYPE_COLOR: Record<string, string> = { receipt: 'var(--ra)', payment: 'var(--rc)' }

export default function FinancePage() {
  const cashPct = Math.round(summary.collections_mtd_cr / summary.collections_target_cr * 100)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Finance · ERP</span>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>ERP / Finance</h1>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Collections MTD', value: `₹${summary.collections_mtd_cr} Cr`, sub: `${cashPct}% of target`, color: cashPct >= 80 ? 'var(--ra)' : 'var(--rb)' },
          { label: 'Escrow Balance', value: `₹${summary.escrow_balance_cr} Cr`, sub: 'across 4 RERA accounts', color: 'var(--gold)' },
          { label: 'Outstanding', value: `₹${summary.outstanding_overdue_cr} Cr`, sub: 'overdue receivables', color: 'var(--rc)' },
          { label: 'Net Cash', value: `₹${summary.net_cash_cr} Cr`, sub: 'operating surplus', color: 'var(--ra)' },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
            <div className="font-syne text-2xl font-bold mb-0.5" style={{ color: k.color }}>{k.value}</div>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{k.label}</span>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Revenue + EBITDA chart */}
        <div className="lg:col-span-2 p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Revenue &amp; EBITDA — 4 Quarters</span>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="flex items-center gap-1" style={{ color: 'var(--gold)' }}><span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'var(--gold)' }} /> Revenue</span>
              <span className="flex items-center gap-1" style={{ color: 'var(--ra)' }}><span className="w-2 h-2 rounded-sm inline-block" style={{ background: 'var(--ra)' }} /> EBITDA</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterData} barGap={4}>
                <XAxis dataKey="q" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 2, color: 'var(--ink)', fontSize: 10 }} formatter={(v) => [`₹${v} Cr`, '']} />
                <Bar dataKey="revenue" fill="var(--gold)" fillOpacity={0.7} radius={[2, 2, 0, 0]} />
                <Bar dataKey="ebitda" fill="var(--ra)" fillOpacity={0.8} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RERA Escrow */}
        <div className="p-5 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-4 block" style={{ color: 'var(--muted)' }}>RERA Escrow Accounts</span>
          <div className="space-y-3">
            {escrow_accounts.map(acc => {
              const ec = ESCROW_COLOR(acc.status)
              return (
                <div key={acc.project} className="p-3 rounded-sm" style={{ background: 'var(--surf2)', border: `1px solid ${acc.status === 'healthy' ? 'var(--bord)' : `color-mix(in srgb, ${ec} 30%, var(--bord))`}` }}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="text-xs font-medium leading-snug pr-2" style={{ color: 'var(--ink)' }}>{acc.project}</div>
                    <span className="font-syne text-lg font-bold leading-none shrink-0" style={{ color: ec }}>{acc.actual_pct}%</span>
                  </div>
                  <div className="h-1 rounded-full mb-1" style={{ background: 'var(--bord)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(acc.actual_pct, 100)}%`, background: ec }} />
                  </div>
                  <div className="flex justify-between font-mono text-[9px]" style={{ color: 'var(--muted)' }}>
                    <span>₹{acc.balance_cr} Cr</span><span>Req: {acc.required_pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Journal entries */}
      <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bord)' }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Recent Journal Entries</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--bord)' }}>
              {['ID', 'Date', 'Type', 'Description', 'Amount', 'Project', 'Account'].map(h => (
                <th key={h} className="text-left px-4 py-2 font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {journal_entries.map((je, i) => (
              <motion.tr key={je.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04, duration: 0.3 }}
                className="transition-colors"
                style={{ borderBottom: '1px solid var(--bord)' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surf2)'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}>
                <td className="px-4 py-2 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{je.id}</td>
                <td className="px-4 py-2 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{je.date}</td>
                <td className="px-4 py-2">
                  <span className="font-mono text-[10px] capitalize" style={{ color: TYPE_COLOR[je.type] ?? 'var(--muted)' }}>{je.type}</span>
                </td>
                <td className="px-4 py-2" style={{ color: 'var(--ink)' }}>{je.description}</td>
                <td className="px-4 py-2 font-mono text-right" style={{ color: je.type === 'receipt' ? 'var(--ra)' : 'var(--rc)' }}>
                  {je.type === 'receipt' ? '+' : '−'}₹{je.amount_cr} Cr
                </td>
                <td className="px-4 py-2 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{je.project}</td>
                <td className="px-4 py-2 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{je.account}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stage 3 — RERA financial statement verification (Vantis column) + receivables aging (MIS floor) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <VerificationPanel
          title="RERA Financial Statement — Verified"
          caption="Declared collections (Form 3) vs actual buyer registrations in Kaveri 2.0. Farvision ledgers what the developer says; Vantis checks it against the public record."
          declaredLabel="declared"
          verifiedLabel="Kaveri"
          rows={RERA_STATEMENT}
          threshold={10}
          moat="Ozone Urbana declares 62% collected; Kaveri shows 28% registered — a 34-point gap the ERP cannot see. Escrow 70%-rule breach flagged in parallel."
          link={{ href: '/compliance', label: 'Open filed QPR verification' }}
        />

        <div className="rounded-sm overflow-hidden" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--bord)' }}>
            <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Collections MIS — Receivables Aging</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bord)' }}>
                {['Buyer', 'Unit', 'Demand', 'Received', 'Overdue'].map(h => (
                  <th key={h} className="text-left px-4 py-2 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECEIVABLES.map(r => {
                const oc = r.overdue >= 30 ? 'var(--rc)' : r.overdue > 0 ? 'var(--rb)' : 'var(--ra)'
                return (
                  <tr key={r.buyer} style={{ borderBottom: '1px solid var(--bord)' }}>
                    <td className="px-4 py-2" style={{ color: 'var(--ink)' }}>{r.buyer}</td>
                    <td className="px-4 py-2 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{r.unit}</td>
                    <td className="px-4 py-2 font-mono" style={{ color: 'var(--muted)' }}>₹{r.demand}L</td>
                    <td className="px-4 py-2 font-mono" style={{ color: 'var(--ink)' }}>₹{r.received}L</td>
                    <td className="px-4 py-2 font-mono" style={{ color: oc }}>{r.overdue > 0 ? `${r.overdue}d` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
