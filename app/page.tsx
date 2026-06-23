'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { LayoutGrid, Shield, ChevronRight, Globe } from 'lucide-react'

const PRODUCTS = [
  {
    id: 'govern',
    tag: 'For Regulators',
    name: 'Vantis Govern',
    desc: 'AI-powered intelligence for K-RERA officers. Monitor compliance, predict defaults, issue notices — before crises happen.',
    href: '/govern',
    icon: Shield,
    features: [
      'QPR Compliance Tracking',
      'Predictive Default Analytics',
      'Litigation X-ray',
      'AI Notice Generator',
    ],
    accent: '#C9A84C',
    borderIdle: 'rgba(201,168,76,0.18)',
    borderHover: 'rgba(201,168,76,0.55)',
    bgIdle: 'rgba(201,168,76,0.04)',
    bgHover: 'rgba(201,168,76,0.08)',
    cta: 'Enter Govern',
  },
  {
    id: 'build',
    tag: 'For Developers',
    name: 'Vantis OS',
    desc: 'The operating system for real estate developers. Sales, operations, finance, and intelligence — unified in one platform.',
    href: '/command',
    icon: LayoutGrid,
    features: [
      'Command Centre',
      'CRM & Sales Pipeline',
      'Land Intelligence',
      'Feasibility Engine',
    ],
    accent: '#B8C8D8',
    borderIdle: 'rgba(184,200,216,0.15)',
    borderHover: 'rgba(184,200,216,0.45)',
    bgIdle: 'rgba(184,200,216,0.03)',
    bgHover: 'rgba(184,200,216,0.07)',
    cta: 'Enter OS',
  },
]

const COMING_SOON = ['Vantis Public Portal', 'Vantis Data Room']

export default function HubPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: '#0A0A0F' }}
    >
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center mb-14"
      >
        <Image
          src="/vantislockuponnight.png"
          alt="Vantis"
          width={140}
          height={44}
          className="h-9 w-auto mb-5"
          priority
        />
        <div
          className="font-mono text-[11px] uppercase tracking-[0.28em]"
          style={{ color: '#3A3A55' }}
        >
          Choose your workspace
        </div>
      </motion.div>

      {/* Product cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[760px] mb-8">
        {PRODUCTS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
          >
            <Link
              href={p.href}
              className="group flex flex-col rounded-sm p-7 h-full transition-all duration-200"
              style={{
                background: p.bgIdle,
                border: `1px solid ${p.borderIdle}`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = p.bgHover
                e.currentTarget.style.borderColor = p.borderHover
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = p.bgIdle
                e.currentTarget.style.borderColor = p.borderIdle
              }}
            >
              {/* Tag */}
              <div className="flex items-center gap-2 mb-5">
                <p.icon className="w-3.5 h-3.5" style={{ color: p.accent }} />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: p.accent }}
                >
                  {p.tag}
                </span>
              </div>

              {/* Title */}
              <div
                className="font-display italic text-[26px] leading-tight mb-3"
                style={{ color: '#F0EEE8', fontFamily: 'var(--font-syne), serif' }}
              >
                {p.name}
              </div>

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-6 flex-1"
                style={{ color: '#5A5A72', fontFamily: 'var(--font-sans)' }}
              >
                {p.desc}
              </p>

              {/* Feature list */}
              <ul className="space-y-2 mb-7">
                {p.features.map(f => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-[11px] font-mono"
                    style={{ color: '#6B6B88' }}
                  >
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ background: p.accent, opacity: 0.7 }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div
                className="flex items-center gap-1.5 text-[13px] font-mono transition-all duration-150 group-hover:gap-2.5"
                style={{ color: p.accent }}
              >
                {p.cta}
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Coming soon */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex items-center gap-3 flex-wrap justify-center"
      >
        {COMING_SOON.map(name => (
          <div
            key={name}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-sm"
            style={{ border: '1px solid #1C1C28' }}
          >
            <Globe className="w-3 h-3" style={{ color: '#2A2A3E' }} />
            <span className="text-[11px] font-mono" style={{ color: '#2E2E45' }}>
              {name}
            </span>
            <span
              className="font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-sm"
              style={{ background: '#14141E', color: '#2E2E45' }}
            >
              Soon
            </span>
          </div>
        ))}
      </motion.div>

      {/* Footer */}
      <div
        className="mt-14 font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: '#22222F' }}
      >
        Orianode Technologies Pvt. Ltd.
      </div>
    </div>
  )
}
