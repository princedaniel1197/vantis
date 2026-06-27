'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  lookupKnowledge,
  lookupProjectInSpine,
  lookupProjectsByFilter,
  formatProjectAnswer,
  formatProjectList,
  SEEDED_QUESTIONS,
  CAGED_SYSTEM_PROMPT,
  OPEN_SYSTEM_PROMPT,
  type ProductScope,
} from '@/lib/chatbot-knowledge'
import type { ReactNode } from 'react'

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

interface Message {
  role: 'user' | 'assistant'
  content: string
  citation?: string
}

type ChatMode = 'demo' | 'live'
type DevMode = 'caged' | 'open'

const DEV_ROUTES = [
  '/', '/command', '/land', '/market', '/feasibility', '/compliance',
  '/litigation', '/channel', '/dataroom', '/assistant', '/certificate',
  '/leads', '/visits', '/inventory', '/partners', '/projects', '/construction',
  '/customers', '/finance', '/payments', '/vision', '/lend', '/verify',
]

const FALLBACK: Record<string, string> = {
  govern: 'I can help with K-RERA compliance, project risk, QPR analysis, litigation, and drafting notices. Try one of the suggested questions above.',
  verify: 'I can help you check a project\'s safety, understand your homebuyer rights, or track a complaint. Try one of the suggested questions above.',
  all: 'I cover Karnataka real estate intelligence across all Vantis products. Ask me about any project, risk, or compliance question.',
}

function getProductContext(pathname: string): ProductScope {
  if (pathname.startsWith('/govern')) return 'govern'
  if (pathname.startsWith('/lend')) return 'lend'
  return 'all'
}

function getFallback(product: ProductScope): string {
  return FALLBACK[product] ?? FALLBACK.all
}

async function callAnthropicAPI(
  messages: { role: string; content: string }[],
  systemPrompt: string,
): Promise<string> {
  const res = await fetch('/api/chat/', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ system: systemPrompt, messages }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.text as string
}

export default function VantisIntelligence() {
  const pathname = usePathname()
  const product = getProductContext(pathname)
  const isHidden = DEV_ROUTES.some(r => pathname === r || pathname?.startsWith(r + '/'))

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [chatMode, setChatMode] = useState<ChatMode>('live')
  const [devMode, setDevMode] = useState<DevMode>('caged')
  const [badgeClickCount, setBadgeClickCount] = useState(0)
  const [badgeClickTimer, setBadgeClickTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const conversationRef = useRef<{ role: string; content: string }[]>([])

  useEffect(() => {
    if (isHidden) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, isHidden])

  useEffect(() => {
    if (isHidden || !open) return
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [open, isHidden])

  // Auto-open when navigated to the Intelligence page
  useEffect(() => {
    if (pathname === '/govern/intelligence') setOpen(true)
  }, [pathname])

  // Must be before the early return to satisfy Rules of Hooks
  const handleBadgeClick = useCallback(() => {
    const next = badgeClickCount + 1
    setBadgeClickCount(next)
    if (badgeClickTimer) clearTimeout(badgeClickTimer)
    if (next >= 3) {
      setBadgeClickCount(0)
      setDevMode(d => (d === 'caged' ? 'open' : 'caged'))
      return
    }
    const t = setTimeout(() => setBadgeClickCount(0), 800)
    setBadgeClickTimer(t)
  }, [badgeClickCount, badgeClickTimer])

  if (isHidden) return null

  const seeds = SEEDED_QUESTIONS[product] ?? SEEDED_QUESTIONS.all
  const isOpen = devMode === 'open'

  async function handleSend(text?: string) {
    const query = (text ?? input).trim()
    if (!query || isTyping) return
    setInput('')

    const userMsg: Message = { role: 'user', content: query }
    setMessages(prev => [...prev, userMsg])
    conversationRef.current = [...conversationRef.current, { role: 'user', content: query }]
    setIsTyping(true)

    let assistantText = ''
    let citation: string | undefined

    // Lookup chain: region/filter list → single project → KB → fallback
    const filterHit  = lookupProjectsByFilter(query)
    const projectHit = filterHit ? null : lookupProjectInSpine(query)

    if (chatMode === 'demo' && !isOpen) {
      await new Promise(r => setTimeout(r, 1400))
      if (filterHit) {
        assistantText = formatProjectList(filterHit)
        citation = `K-RERA Registry · ${filterHit.total} projects`
      } else if (projectHit) {
        assistantText = formatProjectAnswer(projectHit)
        citation = `K-RERA Registry · ${projectHit.rera}`
      } else {
        const entry = lookupKnowledge(query, product)
        if (entry) {
          assistantText = entry.answer
          citation = entry.source
        } else {
          assistantText = getFallback(product)
        }
      }
    } else {
      const dynamicCtx = filterHit
        ? `\n\nFILTER RESULTS FOR THIS QUERY:\n${formatProjectList(filterHit)}\nSource: K-RERA Registry`
        : projectHit
        ? `\n\nPROJECT DATA FOR THIS QUERY:\n${formatProjectAnswer(projectHit)}\nSource: K-RERA Registry`
        : ''
      const systemPrompt = (isOpen ? OPEN_SYSTEM_PROMPT : CAGED_SYSTEM_PROMPT) + dynamicCtx
      try {
        assistantText = await callAnthropicAPI(conversationRef.current, systemPrompt)
      } catch {
        if (filterHit) {
          assistantText = formatProjectList(filterHit)
          citation = `K-RERA Registry · ${filterHit.total} projects`
        } else if (projectHit) {
          assistantText = formatProjectAnswer(projectHit)
          citation = `K-RERA Registry · ${projectHit.rera}`
        } else {
          const entry = lookupKnowledge(query, product)
          if (entry) {
            assistantText = entry.answer
            citation = entry.source
          } else {
            assistantText = getFallback(product)
          }
        }
      }
    }

    conversationRef.current = [
      ...conversationRef.current,
      { role: 'assistant', content: assistantText },
    ]
    setIsTyping(false)
    setMessages(prev => [...prev, { role: 'assistant', content: assistantText, citation }])
  }

  const panelTitle = product === 'govern' ? 'Vantis Intelligence' : 'Vantis Assistant'
  const panelSub = product === 'govern' ? 'K-RERA Officer Assistant' : 'Karnataka Real Estate Intelligence'

  const badgeLabel = isOpen ? '⚠ OPEN' : chatMode === 'demo' ? 'DEMO' : 'LIVE'
  const badgeClass = isOpen
    ? 'border-amber/50 text-amber'
    : chatMode === 'demo'
    ? 'border-border text-gray-light hover:border-gold-dim hover:text-gold'
    : 'border-blue/50 text-blue'

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-[4.5rem] right-4 sm:bottom-[5rem] sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[540px] bg-surface border border-border rounded-sm flex flex-col overflow-hidden"
            style={{ maxWidth: '380px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-surface2">
              <div>
                <div className="font-syne text-sm text-gold">{panelTitle}</div>
                <div className="text-gray text-xs mt-0.5">{panelSub}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!isOpen) setChatMode(m => (m === 'demo' ? 'live' : 'demo'))
                    handleBadgeClick()
                  }}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors duration-150 font-mono tracking-wider select-none ${badgeClass}`}
                >
                  {badgeLabel}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray hover:text-gold transition-colors duration-150 ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode notice */}
            {chatMode === 'live' && !isOpen && (
              <div className="px-4 py-2 bg-blue/10 border-b border-blue/20 shrink-0">
                <div className="text-blue text-[11px]">Live mode · Powered by Claude · Falls back to demo if unavailable.</div>
              </div>
            )}
            {isOpen && (
              <div className="px-4 py-2 bg-amber/10 border-b border-amber/20 shrink-0">
                <div className="text-amber text-[11px]">Developer mode · System prompt constraints removed.</div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="text-gray text-[11px] text-center mb-4 font-mono tracking-wider uppercase">Try asking</div>
                  {seeds.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      disabled={isTyping}
                      className="w-full text-left text-xs text-gray-light border border-border rounded-sm px-3 py-2.5 hover:border-gold hover:text-gold transition-colors duration-150 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] text-xs rounded-sm px-3 py-2.5 leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-surface2 text-off-white'
                        : 'bg-background border border-border text-off-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">{renderMarkdown(m.content)}</div>
                    {m.role === 'assistant' && m.citation && (
                      <div className="mt-2 pt-2 border-t border-border text-[10px] text-gold-dim font-mono tracking-wide">
                        [Source: {m.citation}]
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background border border-border rounded-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="typing-dot inline-block w-2 h-2 rounded-full bg-gold" style={{ animationDelay: '0ms' }} />
                    <span className="typing-dot inline-block w-2 h-2 rounded-full bg-gold" style={{ animationDelay: '200ms' }} />
                    <span className="typing-dot inline-block w-2 h-2 rounded-full bg-gold" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={product === 'govern' ? 'Ask anything about K-RERA…' : 'Ask about any Karnataka project…'}
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
        aria-label="Open Vantis Intelligence"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-gold hover:bg-gold-light transition-colors duration-150 flex items-center justify-center"
      >
        {!open && messages.length === 0 && (
          <span className="absolute inset-0 rounded-full animate-ping bg-gold opacity-30 pointer-events-none" />
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
