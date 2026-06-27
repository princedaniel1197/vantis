'use client'

import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { MessageSquare, X, Send, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { lookupKnowledge, lookupProjectInSpine, lookupProjectsByFilter, formatProjectAnswer, formatProjectList, SEEDED_QUESTIONS, CAGED_SYSTEM_PROMPT, ProductScope } from '@/lib/chatbot-knowledge'

function renderMarkdown(text: string): ReactNode {
  return text.split('\n').map((line, li, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const nodes = parts.map((part, pi) =>
      pi % 2 === 1
        ? <strong key={pi} className="text-off-white font-semibold">{part}</strong>
        : part
    )
    return <span key={li}>{nodes}{li < arr.length - 1 ? '\n' : null}</span>
  })
}

export interface ProductChatbotProps {
  product: 'lend' | 'build' | 'connect' | 'verify'
  title: string
  subtitle: string
  accentColor?: string
  position?: 'bottom-right' | 'bottom-left'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  source?: string
}

function TypingDots({ color }: { color: string }) {
  return (
    <div className="flex gap-1.5 items-center py-1 px-1">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="typing-dot inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: color, animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  )
}

export default function ProductChatbot({
  product,
  title,
  subtitle,
  accentColor = '#C9A84C',
  position = 'bottom-right',
}: ProductChatbotProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const seeds = SEEDED_QUESTIONS[product as ProductScope] ?? SEEDED_QUESTIONS['all']

  // Horizontal position styles
  const hPos = position === 'bottom-left'
    ? { left: '1rem', right: 'auto' }
    : { right: '1rem', left: 'auto' }
  const hPosSm = position === 'bottom-left'
    ? { left: '1.5rem', right: 'auto' }
    : { right: '1.5rem', left: 'auto' }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  async function handleSend(text?: string) {
    const query = (text ?? input).trim()
    if (!query || isTyping) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: query }])
    setIsTyping(true)

    if (mode === 'live') {
      // Live mode: call Claude API client-side (same pattern as VantisIntelligence)
      try {
        const systemPrompt = CAGED_SYSTEM_PROMPT.replace(
          'You are Vantis Intelligence,',
          `You are ${title},`,
        ) + `\n\nYou are specifically focused on the Vantis ${product.charAt(0).toUpperCase() + product.slice(1)} product.`

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            system: systemPrompt,
            messages: [{ role: 'user', content: query }],
          }),
        })
        const data = await res.json()
        const reply = data?.text ?? 'No response from AI.'
        setIsTyping(false)
        setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      } catch {
        setIsTyping(false)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Live AI is unavailable right now. Switching to demo data.',
        }])
      }
      return
    }

    // Demo mode: filter list → single project → KB → fallback
    await new Promise(r => setTimeout(r, 1200))
    const filterHit  = lookupProjectsByFilter(query)
    const projectHit = filterHit ? null : lookupProjectInSpine(query)
    setIsTyping(false)

    if (filterHit) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formatProjectList(filterHit),
        source: `K-RERA Registry · ${filterHit.total} projects`,
      }])
    } else if (projectHit) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formatProjectAnswer(projectHit),
        source: `K-RERA Registry · ${projectHit.rera}`,
      }])
    } else {
      const entry = lookupKnowledge(query, product as ProductScope)
      if (entry) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: entry.answer,
          source: entry.source,
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I don't have specific data for that query in the current Vantis dataset. Try one of the suggested questions, or ask about key metrics, risk status, or specific projects.`,
        }])
      }
    }
  }

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-[4.5rem] z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] bg-surface border border-border rounded-sm flex flex-col overflow-hidden"
            style={{
              maxWidth: '380px',
              ...hPos,
              // Override with sm breakpoint values via inline style isn't possible —
              // the sm:right-6 class handles it for the bubble; panel mirrors it
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-surface2">
              <div>
                <div className="font-syne text-sm" style={{ color: accentColor }}>{title}</div>
                <div className="text-gray text-xs mt-0.5 font-mono">{subtitle}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode(m => (m === 'demo' ? 'live' : 'demo'))}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors duration-150 font-mono tracking-wider ${
                    mode === 'demo'
                      ? 'border-border text-gray-light hover:border-gold-dim hover:text-gold'
                      : 'border-blue/50 text-blue'
                  }`}
                >
                  {mode === 'demo' ? 'DEMO' : 'LIVE'}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray hover:text-gold transition-colors duration-150 ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live mode notice */}
            {mode === 'live' && (
              <div className="px-4 py-2 bg-blue/10 border-b border-blue/20 shrink-0">
                <div className="text-blue text-xs">Live AI mode — responses from Claude API.</div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <div className="text-gray text-[10px] text-center font-mono uppercase tracking-wider mb-3">
                    Suggested questions
                  </div>
                  {seeds.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      disabled={isTyping}
                      className="w-full text-left text-xs text-gray-light border border-border rounded-sm px-3 py-2.5 hover:border-gold hover:text-off-white transition-colors duration-150 disabled:opacity-50 flex items-center gap-2 group"
                    >
                      <ChevronRight className="w-3 h-3 shrink-0 text-gold/50 group-hover:text-gold transition-colors" />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[90%] text-xs rounded-sm px-3 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-surface2 text-off-white border border-border'
                        : 'bg-background border border-border text-off-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">{renderMarkdown(m.content)}</div>
                  </div>
                  {m.role === 'assistant' && m.source && (
                    <p className="text-[10px] text-gray font-mono mt-1 px-1 max-w-[90%] truncate" title={m.source}>
                      Source: {m.source}
                    </p>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-sm px-4 py-3">
                    <TypingDots color={accentColor} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border shrink-0 bg-surface2">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={`Ask ${title}…`}
                  className="flex-1 bg-background border border-border rounded-sm px-3 py-2 text-off-white placeholder-gray text-xs focus:outline-none focus:border-gold transition-colors duration-150"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-2 text-gold hover:text-gold-light disabled:text-gray disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={`Open ${title}`}
        className="fixed bottom-4 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-150"
        style={{
          ...hPos,
          backgroundColor: accentColor,
        }}
      >
        {/* Pulsing ring — only when closed and no messages sent yet */}
        {!open && messages.length === 0 && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30 pointer-events-none"
            style={{ backgroundColor: accentColor }}
          />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5 text-background" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare className="w-5 h-5 text-background" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </>
  )
}
