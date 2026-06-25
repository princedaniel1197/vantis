'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Star, UserCheck, Clock, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, TrendingUp, Phone, Calendar,
} from 'lucide-react'
import { useConnect, T } from '../ConnectContext'
import leadsData from '@/data/connect-leads.json'

interface Lead {
  id: string
  name: string
  phone: string
  requirement: string
  requirement_kn: string
  config: string
  micro_market: string
  max_budget_cr: number
  possession_pref: string
  stage: string
  quality_score: number
  quality_label: string
  source: string
  assigned_properties: string[]
  last_contact: string
  next_followup: string | null
  notes: string
  days_in_stage: number
  created: string
}

const LEADS = leadsData as Lead[]

const STAGES = ['new', 'contacted', 'visit', 'negotiating', 'closed']

const STAGE_COLORS: Record<string, string> = {
  new: '#3498DB',
  contacted: '#9B59B6',
  visit: '#F39C12',
  negotiating: '#C9A84C',
  closed: '#2ECC71',
}

const QUALITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Hot Lead': { bg: 'rgba(231,76,60,0.1)', text: '#E74C3C', border: 'rgba(231,76,60,0.25)' },
  'Warm Lead': { bg: 'rgba(243,156,18,0.1)', text: '#F39C12', border: 'rgba(243,156,18,0.25)' },
  'Junk Lead': { bg: 'rgba(107,107,136,0.1)', text: '#6B6B88', border: 'rgba(107,107,136,0.2)' },
  'Converted': { bg: 'rgba(46,204,113,0.1)', text: '#2ECC71', border: 'rgba(46,204,113,0.25)' },
}

const SOURCE_ICON: Record<string, React.ReactNode> = {
  whatsapp: <MessageSquare style={{ width: '11px', height: '11px', color: '#25D366' }} />,
  referral: <UserCheck style={{ width: '11px', height: '11px', color: '#3498DB' }} />,
  site_visit: <Star style={{ width: '11px', height: '11px', color: '#F39C12' }} />,
  portal: <TrendingUp style={{ width: '11px', height: '11px', color: '#6B6B88' }} />,
}

function ScoreDots({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: i < score
              ? score >= 8 ? '#E74C3C' : score >= 5 ? '#F39C12' : '#4A4A62'
              : '#1A1A2A',
          }}
        />
      ))}
    </div>
  )
}

function LeadCard({ lead, t }: { lead: Lead; t: typeof T['en'] }) {
  const [expanded, setExpanded] = useState(false)
  const qc = QUALITY_COLORS[lead.quality_label] ?? QUALITY_COLORS['Warm Lead']
  const isJunk = lead.quality_score <= 3
  const isClosed = lead.stage === 'closed'

  const formatBudget = (cr: number) =>
    cr >= 1 ? `₹${cr.toFixed(2)} Cr` : `₹${Math.round(cr * 100)}L`

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  return (
    <motion.div
      layout
      style={{
        background: isJunk ? 'rgba(107,107,136,0.04)' : isClosed ? 'rgba(46,204,113,0.03)' : '#0F0F1A',
        border: `1px solid ${isJunk ? '#1A1A22' : isClosed ? 'rgba(46,204,113,0.15)' : '#1E1E2E'}`,
        borderRadius: '2px',
        overflow: 'hidden',
        opacity: isJunk ? 0.7 : 1,
      }}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.875rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Score */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '2px',
          background: `${qc.bg}`,
          border: `1px solid ${qc.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-dm-mono, monospace)',
          fontSize: '16px',
          fontWeight: 700,
          color: qc.text,
          flexShrink: 0,
        }}>
          {lead.quality_score}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '14px', color: '#E8E4DC', fontWeight: 500 }}>
              {lead.name}
            </span>
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', padding: '2px 6px', borderRadius: '2px', background: qc.bg, color: qc.text, border: `1px solid ${qc.border}`, letterSpacing: '0.08em' }}>
              {lead.quality_label}
            </span>
            {SOURCE_ICON[lead.source]}
          </div>

          {/* Requirement */}
          <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#5A5A72', lineHeight: 1.4, marginBottom: '5px' }}>
            {lead.requirement}
          </div>

          {/* Budget + days */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#C9A84C' }}>
              {formatBudget(lead.max_budget_cr)}
            </span>
            {lead.days_in_stage > 0 && (
              <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: lead.days_in_stage > 14 ? '#E74C3C' : '#4A4A62' }}>
                {lead.days_in_stage}d in stage
              </span>
            )}
            {lead.next_followup && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', color: '#3498DB' }}>
                <Calendar style={{ width: '9px', height: '9px' }} />
                {formatDate(lead.next_followup)}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <div style={{ color: '#3A3A52', flexShrink: 0 }}>
          {expanded
            ? <ChevronUp style={{ width: '14px', height: '14px' }} />
            : <ChevronDown style={{ width: '14px', height: '14px' }} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 0.875rem 0.875rem', borderTop: '1px solid #141420' }}>
              <div style={{ height: '0.75rem' }} />

              {/* Score dots */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A3A52', marginBottom: '6px' }}>
                  AI Quality Score
                </div>
                <ScoreDots score={lead.quality_score} />
              </div>

              {/* Notes */}
              <div style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#4A4A62', lineHeight: 1.55, marginBottom: '0.75rem', padding: '0.5rem 0.75rem', background: '#0A0A0F', borderRadius: '2px', borderLeft: '2px solid #1E1E2E' }}>
                {lead.notes}
              </div>

              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#3A3A52' }}>
                  <span style={{ color: '#2A2A3E', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Last contact</span>
                  {formatDate(lead.last_contact)}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', color: '#3A3A52' }}>
                  <span style={{ color: '#2A2A3E', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Source</span>
                  {lead.source}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function StageColumn({ stage, leads, t }: { stage: string; leads: Lead[]; t: typeof T['en'] }) {
  const color = STAGE_COLORS[stage] ?? '#4A4A62'
  const stageLabel: Record<string, string> = {
    new: t.stage_new,
    contacted: t.stage_contacted,
    visit: t.stage_visit,
    negotiating: t.stage_negotiating,
    closed: t.stage_closed,
  }

  return (
    <div style={{ minWidth: '260px', flex: '1 1 260px', maxWidth: '340px' }}>
      {/* Column header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        padding: '0.5rem 0.75rem',
        background: `${color}10`,
        border: `1px solid ${color}20`,
        borderRadius: '2px',
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color, flex: 1 }}>
          {stageLabel[stage]}
        </span>
        <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: `${color}90` }}>
          {leads.length}
        </span>
      </div>

      {/* Lead cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {leads.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#2A2A3E' }}>
            No leads
          </div>
        ) : (
          leads.map(lead => <LeadCard key={lead.id} lead={lead} t={t} />)
        )}
      </div>
    </div>
  )
}

export default function ConnectLeadsPage() {
  const { lang } = useConnect()
  const t = T[lang]
  const [filter, setFilter] = useState<'all' | 'hot' | 'junk'>('all')

  const filteredLeads = LEADS.filter(l => {
    if (filter === 'hot') return l.quality_score >= 7
    if (filter === 'junk') return l.quality_score <= 3
    return true
  })

  const byStage = STAGES.reduce<Record<string, Lead[]>>((acc, s) => {
    acc[s] = filteredLeads.filter(l => l.stage === s)
    return acc
  }, {})

  const totalHot = LEADS.filter(l => l.quality_score >= 7).length
  const totalJunk = LEADS.filter(l => l.quality_score <= 3).length
  const totalConverted = LEADS.filter(l => l.stage === 'closed').length
  const hotPct = Math.round((totalHot / LEADS.length) * 100)

  const formatBudget = (cr: number) =>
    cr >= 1 ? `₹${cr.toFixed(2)} Cr` : `₹${Math.round(cr * 100)}L`

  return (
    <div style={{ minHeight: 'calc(100vh - 100px)', background: '#0A0A0F', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '0.5rem' }}>
              WhatsApp-Native CRM · AI Junk Filter
            </div>
            <h1 style={{ fontFamily: 'var(--font-cg, serif)', fontStyle: 'italic', fontSize: '28px', color: '#F0EEE8', lineHeight: 1.2, marginBottom: '0.375rem' }}>
              {t.leads_title}
            </h1>
            <p style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '13px', color: '#5A5A72' }}>
              {t.leads_sub}
            </p>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: LEADS.length, color: '#C9A84C' },
              { label: 'Hot', value: totalHot, color: '#E74C3C' },
              { label: 'Junk', value: totalJunk, color: '#6B6B88' },
              { label: 'Closed', value: totalConverted, color: '#2ECC71' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '0.5rem 0.875rem',
                background: '#0F0F1A',
                border: '1px solid #1E1E2E',
                borderRadius: '2px',
              }}>
                <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '18px', color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3A3A52', marginTop: '2px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp ingestion callout */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(37,211,102,0.05)',
          border: '1px solid rgba(37,211,102,0.12)',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          maxWidth: '700px',
        }}>
          <MessageSquare style={{ width: '14px', height: '14px', color: '#25D366', flexShrink: 0 }} />
          <div>
            <span style={{ fontFamily: 'var(--font-dm-mono, monospace)', fontSize: '11px', color: '#25D366' }}>WhatsApp Lead Ingestion</span>
            <span style={{ fontFamily: 'var(--font-dm-sans, sans-serif)', fontSize: '12px', color: '#3A5A3A', marginLeft: '0.75rem' }}>
              Leads from WhatsApp are auto-parsed into buyer requirements and scored by Vantis AI before reaching your pipeline.
            </span>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem' }}>
          {[
            { key: 'all', label: `All (${LEADS.length})` },
            { key: 'hot', label: `Hot Leads (${totalHot})` },
            { key: 'junk', label: `Junk (${totalJunk})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '2px',
                border: filter === f.key ? '1px solid rgba(201,168,76,0.4)' : '1px solid #1E1E2E',
                background: filter === f.key ? 'rgba(201,168,76,0.08)' : 'transparent',
                fontFamily: 'var(--font-dm-mono, monospace)',
                fontSize: '11px',
                letterSpacing: '0.06em',
                color: filter === f.key ? '#C9A84C' : '#4A4A62',
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Kanban board */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
          {STAGES.map(stage => (
            <StageColumn key={stage} stage={stage} leads={byStage[stage] ?? []} t={t} />
          ))}
        </div>
      </div>
    </div>
  )
}
