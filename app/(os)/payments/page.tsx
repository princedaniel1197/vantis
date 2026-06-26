'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import financeData from '@/data/os-finance.json'
import cmdData from '@/data/os-command.json'
import customersData from '@/data/os-customers.json'

const customers = customersData.customers
const cash = cmdData.cash

const TABS = ['All', 'Overdue', 'Due Soon', 'Paid'] as const
type Tab = typeof TABS[number]

export default function PaymentsPage() {
  const [tab, setTab] = useState<Tab>('All')
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.unit.toLowerCase().includes(q) || c.project.toLowerCase().includes(q)
    const matchTab = tab === 'All' ? true : tab === 'Overdue' ? c.stage === 'payment_overdue' : tab === 'Due Soon' ? c.stage === 'construction_milestone' : c.paid_pct >= 90
    return matchSearch && matchTab
  })

  const overdueAmount = customers.filter(c => c.stage === 'payment_overdue').reduce((s, c) => s + (c.total_value_lakh - c.paid_lakh), 0)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Finance · Collections</span>
        <h1 className="font-display text-3xl italic" style={{ color: 'var(--ink)' }}>Payments &amp; Collections</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="p-4 rounded-sm sm:col-span-2" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <div className="flex items-center gap-4 mb-3">
            <div>
              <div className="font-syne text-3xl font-bold" style={{ color: 'var(--gold)' }}>₹{cash.collections_mtd_cr} Cr</div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Collections this month</span>
            </div>
            <div className="text-right ml-auto">
              <div className="font-syne text-xl font-bold" style={{ color: 'var(--rc)' }}>₹{overdueAmount.toFixed(0)}L</div>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--muted)' }}>Overdue</span>
            </div>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cash.monthly_trend}>
                <defs>
                  <linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surf2)', border: '1px solid var(--bord)', borderRadius: 2, color: 'var(--ink)', fontSize: 10 }} formatter={(v) => [`₹${v} Cr`, '']} />
                <Area type="monotone" dataKey="collected" stroke="var(--gold)" strokeWidth={2} fill="url(#cgrad)" />
                <Area type="monotone" dataKey="target" stroke="var(--muted)" strokeWidth={1} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-sm space-y-3" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] mb-2 block" style={{ color: 'var(--muted)' }}>Escrow Status</span>
          {financeData.escrow_accounts.map(acc => (
            <div key={acc.project} className="flex items-center justify-between text-xs gap-2">
              <span className="truncate" style={{ color: 'var(--muted)' }}>{acc.project.split(' ')[1]}</span>
              <span className="font-mono shrink-0" style={{ color: acc.status === 'healthy' ? 'var(--ra)' : 'var(--rb)' }}>₹{acc.balance_cr} Cr · {acc.actual_pct}%</span>
            </div>
          ))}
          <div className="pt-2" style={{ borderTop: '1px solid var(--bord)' }}>
            <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
              Total escrow: <span style={{ color: 'var(--gold)' }}>₹{financeData.summary.escrow_balance_cr} Cr</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search + tabs */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-sm flex-1 min-w-[180px]" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers, units…"
            className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--ink)' }} />
        </div>
      </div>

      <div className="flex gap-1 mb-4" style={{ borderBottom: '1px solid var(--bord)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 font-mono text-[11px] -mb-px"
            style={{ color: tab === t ? 'var(--gold)' : 'var(--muted)', borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Payment rows */}
      <div className="space-y-2">
        {filtered.map((c, i) => {
          const remaining = c.total_value_lakh - c.paid_lakh
          const isOverdue = c.stage === 'payment_overdue'
          const isDue = c.stage === 'construction_milestone'
          const icon = isOverdue ? AlertTriangle : isDue ? Clock : CheckCircle2
          const ic = isOverdue ? 'var(--rc)' : isDue ? 'var(--rb)' : 'var(--ra)'
          const Icon = icon
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }}
              className="p-4 rounded-sm"
              style={{ background: 'var(--surf)', border: `1px solid ${isOverdue ? 'color-mix(in srgb, var(--rc) 30%, var(--bord))' : 'var(--bord)'}` }}>
              <div className="flex items-start gap-4">
                <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ic }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{c.name}</span>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{c.unit} · {c.project}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--surf2)' }}>
                      <div className="h-full rounded-full" style={{ width: `${c.paid_pct}%`, background: isOverdue ? 'var(--rc)' : 'var(--ra)' }} />
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>{c.paid_pct}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-sm" style={{ color: ic }}>₹{remaining.toFixed(0)}L</div>
                  <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>remaining</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                    ₹{c.paid_lakh}L / ₹{c.total_value_lakh}L
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center font-mono text-xs" style={{ color: 'var(--muted)' }}>No records found.</div>
        )}
      </div>
    </div>
  )
}
