'use client'

import { useState, useRef, useEffect } from 'react'
import { TrendingDown, X, Send, ChevronRight } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

const SEEDED_QUESTIONS = [
  'Which projects have stalled QPRs but no missed EMI?',
  'How much total exposure to the Ozone developer group?',
  'Should we release the Ozone Urbana T5 tranche?',
]

function getResponse(input: string): string {
  const q = input.toLowerCase()

  if (q.includes('stall') || q.includes('qpr') || (q.includes('miss') && q.includes('emi')) || q.includes('leading')) {
    return `3 projects show QPR non-filing or late filing with no EMI arrears yet:\n\n` +
      `• **Skylark Arcadia** (WATCH · score 540) — 2 late QPR filings in last 8 quarters. Construction 11% behind schedule. 2–3 quarter lead time before SMA-0.\n\n` +
      `• **Confident Crystal** (WATCH · score 555) — 1 missed QPR filing Q3 2023. Developer cited monsoon delay; K-RERA notice received. Monitor.\n\n` +
      `• **Hubli Grand Central** (WATCH · score 495) — First QPR non-filing Q2 2023. Show-cause issued. Lowest-score amber project in book.\n\n` +
      `Collectively these carry ₹167 Cr outstanding. Vantis Lend would recommend enhanced monitoring and site inspections on all three before the next disbursement cycle.`
  }

  if (q.includes('ozone') || q.includes('developer') || q.includes('cascade') || q.includes('exposure') || q.includes('group')) {
    return `Total Ozone Group exposure: **₹520 Cr** across 3 Kaveri HFC projects.\n\n` +
      `• **Ozone Urbana** — ₹180 Cr outstanding · HIGH RISK (score 312) · Flagged Q3 2021 · Tranche T5 held\n` +
      `• **Ozone Westgate** — ₹180 Cr outstanding · WATCH (score 498) · Escrow 14% · Anomalous Q4 withdrawal\n` +
      `• **Ozone Park Avenue** — ₹160 Cr outstanding · WATCH (score 512) · Escrow 16% · 3 quarters below RERA minimum\n\n` +
      `The escrow cross-contamination pattern — Westgate and Park Avenue accounts show withdrawals correlating with Urbana's QPR deadlines — is consistent with group-level liquidity stress and possible fund diversion.\n\n` +
      `This is a **portfolio event**, not a single-project risk. Any Urbana restructure should include cross-collateral from all 3 projects.`
  }

  if (q.includes('tranche') || q.includes('release') || q.includes('hold') || q.includes('t5') || q.includes('disburse')) {
    return `**Recommendation: HOLD, then RESTRUCTURE.**\n\n` +
      `Key numbers:\n` +
      `• ₹180 Cr outstanding (72% of ₹250 Cr sanctioned)\n` +
      `• Construction verified at only 43% by K-RERA — 29-point gap\n` +
      `• T5 milestone (6th floor slab) unverified\n` +
      `• Escrow at 8% — 62 pp below RERA minimum of 70%\n\n` +
      `If Kaveri HFC releases T5 now and the project defaults:\n` +
      `₹220 Cr outstanding × 14% Karnataka RE recovery rate = ₹30.8 Cr recovered.\n` +
      `Loss: ₹189 Cr. Marginal destruction from this tranche alone: **₹34 Cr**.\n\n` +
      `Hold preserves ₹70 Cr undisbursed. Use the window to verify the milestone physically, then negotiate a 4-tranche restructure (₹10 Cr increments on K-RERA QPR sign-off) with cross-collateral from Ozone Westgate and Park Avenue.`
  }

  if (q.includes('rbi') || q.includes('compliance') || q.includes('pfd') || q.includes('direction')) {
    return `Kaveri HFC is fully compliant with RBI (Project Finance) Directions, 2025 (effective Oct 1, 2025).\n\n` +
      `All 6 key clauses are met:\n` +
      `• Electronic project database — auto-updated from K-RERA, not manual entry\n` +
      `• Drawn-vs-built monitoring — divergence chart computed every quarter\n` +
      `• Escrow surveillance — real-time alerts for all 40 projects\n` +
      `• NPA early warning system — composite score provides 4–6 quarter advance warning\n` +
      `• Developer cross-exposure monitoring — cascade view aggregates group risk\n` +
      `• Tranche disbursement controls — digital audit trail with milestone verification\n\n` +
      `Peers building this database manually: 14–18 weeks per audit cycle. Kaveri HFC: zero manual entries.`
  }

  if (q.includes('stress') || q.includes('downturn') || q.includes('scenario') || q.includes('downturn')) {
    return `In a moderate stress scenario (-25% RE prices, +15% cost inflation, +200 bps):\n\n` +
      `• 4 additional green projects migrate to Watch\n` +
      `• 2 additional amber projects migrate to High Risk\n` +
      `• Capital at risk grows from ₹420 Cr to ~₹576 Cr\n\n` +
      `In a severe scenario (-40% RE, +30% cost, +350 bps):\n` +
      `• 7 additional projects flip from Healthy → Watch\n` +
      `• 4 additional projects flip to High Risk\n` +
      `• Capital at risk: ~₹732 Cr\n\n` +
      `The Stress Test module allows you to model these scenarios in real time. The early-warning advantage means Kaveri HFC can engage developers proactively in the mild-stress scenario before the book deteriorates further.`
  }

  if (q.includes('stress test') || q.includes('scenario') || q.includes('price correction') || q.includes('15%')) {
    return `Under a 15% price correction scenario:\n\n` +
      `• **RED portfolio (₹420 Cr)** drops to 8% collateral coverage from current 18%\n` +
      `• Expected loss increases from ₹361 Cr to ₹394 Cr\n` +
      `• AMBER projects: 3 would likely migrate to RED, adding ₹167 Cr to the at-risk pool\n\n` +
      `In a severe scenario (–40% RE, +30% cost, +350 bps):\n` +
      `• 7 additional projects flip from Healthy → Watch\n` +
      `• 4 additional projects flip to High Risk\n` +
      `• Total capital at risk: ~₹732 Cr\n\n` +
      `The Stress Test module lets you model these in real time. Early-warning advantage means Kaveri HFC can engage developers proactively in the mild-stress scenario before the book deteriorates.`
  }

  if (q.includes('market') || q.includes('bengaluru') || q.includes('price') || q.includes('sqft') || q.includes('whitefield') || q.includes('sarjapur')) {
    return `Bengaluru residential market Q1 2026:\n\n` +
      `• **Whitefield** — ₹7,240/sqft (+8.4% YoY)\n` +
      `• **Sarjapur Road** — ₹6,820/sqft (+11.2% YoY)\n` +
      `• **Electronic City** — ₹5,980/sqft (+6.1% YoY)\n` +
      `• **Devanahalli** — ₹4,980/sqft (absorption 71%, supply pressure)\n\n` +
      `Demand remains strong in tech corridors. Whitefield and Sarjapur lead absorption at 94% and 88% respectively. Devanahalli shows supply build-up — caution for collateral in that micro-market.\n\n` +
      `Source: Kaveri 2.0 registered transaction data (not listing price). Guidance prices from K-RERA declarations.`
  }

  if (q.includes('portfolio health') || q.includes('npa') || q.includes('provision') || q.includes('shortfall')) {
    return `Kaveri HFC portfolio health Q2 2026:\n\n` +
      `• **Gross NPA risk:** ₹420 Cr (3 RED projects)\n` +
      `• **Expected loss** given historical Karnataka RE recovery rate (14%): ₹361 Cr\n` +
      `• **Provision coverage required** under RBI IRAC: ₹252 Cr (60%)\n` +
      `• **Current provision:** ₹180 Cr — **₹72 Cr shortfall**\n\n` +
      `Recommend stepping up provisions before Q3 close to avoid a regulatory classification event. Proactive provisioning also gives leverage in restructuring negotiations with Ozone Group.\n\n` +
      `See the Portfolio tab for project-level provision coverage.`
  }

  if (q.includes('health') || q.includes('book') || q.includes('portfolio') || q.includes('total')) {
    return `Kaveri HFC portfolio summary (40 projects · ₹2,400 Cr):\n\n` +
      `• **3 HIGH RISK** — ₹420 Cr at risk (Ozone Urbana, Concord Meridian, Regent Heights)\n` +
      `• **9 WATCH** — Monitoring enhanced; no active flags but leading indicators present\n` +
      `• **28 HEALTHY** — Clean signals across QPR, registration, escrow, and litigation\n\n` +
      `Hero catch: Ozone Urbana flagged Q3 2021 — 6 quarters before the bank's SMA-0 system would have triggered. Karnataka RE recovery rate post-NPA: 14%. Recovery on restructured: 68%. The difference is the product.`
  }

  return `I can help you analyse the Kaveri HFC portfolio, specific projects, or the Ozone Urbana tranche decision.\n\nTry asking:\n• "Which projects have stalled QPRs?"\n• "Ozone Group total exposure"\n• "Should we release the tranche?"\n• "RBI compliance status"\n• "Stress test moderate scenario"`
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center py-1">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gold/60 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-sm px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gold/12 border border-gold/25 text-off-white'
            : 'bg-surface2 border border-border text-gray-light'
        }`}
      >
        {msg.text}
      </div>
    </div>
  )
}

export default function LendChatbot() {
  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping]     = useState(false)
  const scrollRef               = useRef<HTMLDivElement>(null)
  const inputRef                = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, typing])

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        text: 'Hello. I\'m Vantis Intelligence for Kaveri HFC.\n\nAsk me about the portfolio, Ozone Urbana\'s tranche decision, developer cascade risk, RBI compliance, or stress scenarios.',
      }])
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  function send(text: string) {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', text: getResponse(text) }])
    }, 900 + Math.random() * 600)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <>
      {/* Bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-gold flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="Vantis Intelligence"
        >
          <TrendingDown className="w-5 h-5 text-background" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] bg-surface border border-border rounded-sm shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                <TrendingDown className="w-3.5 h-3.5 text-gold" />
              </div>
              <div>
                <div className="text-off-white text-xs font-medium">Vantis Intelligence</div>
                <div className="text-gray text-[9px] font-mono">Kaveri HFC · Lend Module</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray hover:text-off-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Seeded questions */}
          {messages.length <= 1 && (
            <div className="px-3 pt-3 pb-2 flex flex-col gap-1.5 shrink-0">
              {SEEDED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="flex items-center gap-2 px-3 py-2 rounded-sm bg-surface2 border border-border hover:border-gold/40 text-left transition-colors text-xs text-gray-light hover:text-off-white group"
                >
                  <ChevronRight className="w-3 h-3 text-gold/60 group-hover:text-gold shrink-0 transition-colors" />
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
            {typing && (
              <div className="flex justify-start mb-3">
                <div className="bg-surface2 border border-border rounded-sm px-3 py-2">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-border bg-surface2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about the portfolio…"
              className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-xs text-off-white placeholder-gray focus:outline-none focus:border-gold/50 transition-colors"
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || typing}
              className="w-8 h-8 rounded-sm bg-gold/15 border border-gold/30 hover:bg-gold/25 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-gold" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
