'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Map, Users, Calendar, Building2, HardHat, Wrench,
  BookOpen, CreditCard, ShieldCheck, Award, ArrowRight
} from 'lucide-react'

const LIFECYCLE = [
  { step: 1, label: 'Land Acquisition', module: 'Land Intelligence', path: '/land', icon: Map, govData: ['Kaveri 2.0', 'Bhoomi', 'eCourts'] },
  { step: 2, label: 'Legal & Approvals', module: 'Litigation X-ray', path: '/litigation', icon: ShieldCheck, govData: ['eCourts', 'BBMP', 'BDA'] },
  { step: 3, label: 'Design & Feasibility', module: 'Feasibility Engine', path: '/feasibility', icon: Building2, govData: ['BBMP', 'BDA'] },
  { step: 4, label: 'Finance & Launch', module: 'ERP / Finance', path: '/finance', icon: BookOpen, govData: ['K-RERA', 'Banks'] },
  { step: 5, label: 'Construction', module: 'Projects + Construction', path: '/projects', icon: Wrench, govData: ['K-RERA', 'BBMP'] },
  { step: 6, label: 'Sales', module: 'CRM + Inventory', path: '/leads', icon: Users, govData: ['Kaveri 2.0', 'K-RERA'] },
  { step: 7, label: 'Collections', module: 'Payments + ERP', path: '/payments', icon: CreditCard, govData: ['Bank', 'RERA Escrow'] },
  { step: 8, label: 'RERA Compliance', module: 'Compliance Autopilot', path: '/compliance', icon: ShieldCheck, govData: ['K-RERA'] },
  { step: 9, label: 'Handover', module: 'Buyer-Trust Cert.', path: '/certificate', icon: Award, govData: ['K-RERA', 'Kaveri 2.0'] },
]

const GOV_DATA = [
  { label: 'Kaveri 2.0', color: 'var(--gold)', desc: 'Property registrations · Title chain · Market prices' },
  { label: 'Bhoomi', color: 'var(--rb)', desc: 'Land records · Survey numbers · Mutations' },
  { label: 'eCourts', color: 'var(--rc)', desc: 'Active litigation · Partition suits · Criminal proceedings' },
  { label: 'BBMP / BDA', color: '#60a5fa', desc: 'Plan sanction · Khata · Occupancy certificate' },
  { label: 'K-RERA', color: 'var(--ra)', desc: 'Registration · QPR · Complaints · Compliance orders' },
]

const OS_MODULES = [
  { group: 'SALES', color: 'var(--gold)', modules: ['Command Centre', 'Leads & Pipeline', 'Site Visits', 'Inventory', 'Channel Partners'] },
  { group: 'OPERATIONS', color: 'var(--rb)', modules: ['Projects', 'Construction & Site', 'Customer Portal'] },
  { group: 'FINANCE', color: 'var(--ra)', modules: ['ERP / Finance', 'Payments & Collections'] },
  { group: 'INTELLIGENCE', color: '#60a5fa', modules: ['Land Intelligence', 'Feasibility Engine', 'Market Truth', 'Litigation X-ray'] },
  { group: 'COMPLIANCE', color: 'var(--muted)', modules: ['Compliance Autopilot', 'Buyer-Trust Certificate'] },
]

export default function VisionPage() {
  return (
    <div className="min-h-screen px-4 sm:px-8 py-10 max-w-[1400px] mx-auto">
      {/* Hero */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-[10px] uppercase tracking-[0.25em] mb-4"
          style={{ color: 'var(--muted)' }}
        >
          Vantis · Platform Vision
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="font-display text-5xl sm:text-6xl italic mb-4 leading-tight"
          style={{ color: 'var(--ink)' }}
        >
          The complete operating system<br/>
          <span style={{ color: 'var(--gold)' }}>developers run their business on.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-base max-w-2xl mx-auto leading-relaxed"
          style={{ color: 'var(--muted)' }}
        >
          Every stage of the lifecycle — land to handover — on one platform.
          CIBIL-grade government intelligence under every lead, parcel, and project.
          Karnataka-first. Built for the room.
        </motion.p>
      </div>

      {/* Lifecycle diagram */}
      <div className="mb-12">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-center mb-6" style={{ color: 'var(--muted)' }}>
          Developer Lifecycle — Every Stage Powered by Vantis
        </div>
        <div className="overflow-x-auto pb-4">
          <div className="flex items-stretch gap-0 min-w-[900px] relative">
            {LIFECYCLE.map((stage, i) => (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex-1 relative"
              >
                <Link href={stage.path}>
                  <div
                    className="mx-0.5 rounded-sm p-3 h-full flex flex-col transition-all duration-150 cursor-pointer"
                    style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--gold) 4%, var(--surf))' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bord)'; e.currentTarget.style.background = 'var(--surf)' }}
                  >
                    <div className="font-mono text-[9px] uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--gold)' }}>
                      {stage.step.toString().padStart(2, '0')}
                    </div>
                    <stage.icon className="w-4 h-4 mb-2" style={{ color: 'var(--gold)' }} />
                    <div className="text-xs font-medium leading-snug mb-1" style={{ color: 'var(--ink)' }}>{stage.label}</div>
                    <div className="text-[10px] leading-snug mt-auto" style={{ color: 'var(--gold)' }}>{stage.module}</div>
                    <div className="mt-2 space-y-0.5">
                      {stage.govData.map(d => (
                        <div key={d} className="font-mono text-[9px] px-1 py-0.5 rounded" style={{ background: 'color-mix(in srgb, var(--gold) 8%, var(--surf2))', color: 'var(--muted)' }}>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
                {i < LIFECYCLE.length - 1 && (
                  <div className="absolute top-1/2 -right-px -translate-y-1/2 z-10 w-px h-4" style={{ background: 'var(--bord)' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Government data backbone */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-sm p-6 mb-12"
        style={{ background: 'var(--surf)', border: '2px solid color-mix(in srgb, var(--gold) 30%, var(--bord))' }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--gold)' }}>
          The Government-Data Backbone
        </div>
        <div className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
          Live data flowing from 5 Karnataka government systems — the nervous system under the entire OS.
          No other platform is wired into this. This is the moat.
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {GOV_DATA.map((db, i) => (
            <motion.div
              key={db.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              className="rounded-sm p-3"
              style={{ background: 'var(--surf2)', border: `1px solid ${db.color}40` }}
            >
              <div className="text-sm font-medium mb-1.5" style={{ color: db.color }}>{db.label}</div>
              <div className="text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>{db.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Module groups */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-12"
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-center mb-6" style={{ color: 'var(--muted)' }}>
          16 Modules · 5 Product Groups · One Platform
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {OS_MODULES.map((g, gi) => (
            <div
              key={g.group}
              className="rounded-sm p-4"
              style={{ background: 'var(--surf)', border: `1px solid ${g.color}30` }}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] mb-3" style={{ color: g.color }}>
                {g.group}
              </div>
              <div className="space-y-1.5">
                {g.modules.map(m => (
                  <div key={m} className="text-xs" style={{ color: 'var(--ink)' }}>{m}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Positioning statement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-12"
        style={{ borderTop: '1px solid var(--bord)' }}
      >
        <blockquote
          className="font-display text-3xl sm:text-4xl italic max-w-3xl mx-auto leading-tight mb-6"
          style={{ color: 'var(--ink)' }}
        >
          "The operating system developers run their entire business on —
          and the only one wired into the government truth."
        </blockquote>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: 'var(--muted)' }}>
          Orianode Technologies Private Limited · Karnataka-first · Bengaluru
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-mono uppercase tracking-[0.08em]"
          style={{ background: 'var(--gold)', color: 'var(--bg)' }}
        >
          Enter Command Centre <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  )
}
