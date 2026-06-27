'use client'

import { useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Globe, RotateCcw } from 'lucide-react'
import chatData from '@/data/dev-chatbot.json'

interface Message { role: 'user' | 'assistant'; content: string; streaming?: boolean }
type Lang = 'en' | 'kn'
interface ChatEntry { id: string; keywords: string[]; en: string; kn: string }

const OS_SYSTEM_PROMPT = `You are Vantis Intelligence — the AI assistant for Vantis Build OS, a developer intelligence platform for Karnataka real estate developers. You help with CRM, construction monitoring, land due diligence, feasibility analysis, market intelligence, and K-RERA compliance. Demo context: Divya Villas project by JDA Projects, Mysore. Be concise and actionable.`

async function callAPI(query: string): Promise<string | null> {
  try {
    const res = await fetch('/api/chat/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ system: OS_SYSTEM_PROMPT, messages: [{ role: 'user', content: query }] }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.text ?? null
  } catch {
    return null
  }
}

function findResponse(query: string, lang: Lang): string {
  const q = query.toLowerCase()
  for (const r of chatData.responses as ChatEntry[]) {
    for (const kw of r.keywords) {
      if (q.includes(kw.toLowerCase())) return r[lang] || r.en
    }
  }
  const fb = chatData.fallback
  return typeof fb === 'string' ? fb : (fb as Record<string, string>)[lang] ?? (fb as Record<string, string>).en ?? "I'm not sure about that. Try asking about land, compliance, market prices, or feasibility."
}

const CHIPS = [
  'Which projects will flag this quarter?',
  'Show overdue payments',
  'Is this JDA partner clean?',
  "Draft QPR for Meridian Greens",
  "What did 3BHKs sell for in Whitefield?",
  'Run Ozone Urbana risk scan',
]

export default function OSAssistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const streamText = useCallback(async (text: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])
    const chars = text.split('')
    let built = ''
    for (let i = 0; i < chars.length; i++) {
      built += chars[i]
      const snap = built
      setMessages(prev => {
        const u = [...prev]
        u[u.length - 1] = { role: 'assistant', content: snap, streaming: true }
        return u
      })
      await new Promise(r => setTimeout(r, chars[i] === '\n' ? 10 : chars[i] === ' ' ? 4 : 11))
    }
    setMessages(prev => {
      const u = [...prev]
      u[u.length - 1] = { role: 'assistant', content: text, streaming: false }
      return u
    })
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  // Hide on full-page assistant route (hooks must all be called before this return)
  if (pathname === '/assistant') return null

  async function send(text?: string) {
    const q = (text ?? input).trim()
    if (!q || streaming) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setStreaming(true)
    const reply = await callAPI(q) ?? findResponse(q, lang)
    await streamText(reply)
    setStreaming(false)
  }

  return (
    <>
      {/* Floating bubble */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-sm flex items-center justify-center"
        style={{ background: 'var(--gold)', color: 'var(--bg)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ scale: 0.8, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.8 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="msg" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <MessageSquare className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && messages.length === 0 && (
          <span className="absolute inset-0 rounded-sm animate-ping opacity-30" style={{ background: 'var(--gold)' }} />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] flex flex-col rounded-sm overflow-hidden"
            style={{
              background: 'var(--surf)',
              border: '1px solid var(--bord)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              maxHeight: '520px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--bord)', background: 'var(--surf2)' }}>
              <div>
                <div className="font-display italic text-sm" style={{ color: 'var(--gold)' }}>Vantis Intelligence</div>
                <div className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>Offline · Karnataka gov data</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setLang(l => l === 'en' ? 'kn' : 'en')} className="text-[10px] font-mono px-2 py-1 rounded-sm" style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}>
                  <Globe className="w-3 h-3 inline mr-1" />
                  {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
                </button>
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])} className="text-[10px] font-mono px-2 py-1 rounded-sm" style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: 0 }}>
              {messages.length === 0 ? (
                <div>
                  <div className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Ask about your portfolio, market, compliance, or due diligence.</div>
                  <div className="flex flex-wrap gap-1.5">
                    {CHIPS.map(c => (
                      <button key={c} onClick={() => send(c)} className="text-[10px] px-2.5 py-1.5 rounded-sm transition-colors" style={{ border: '1px solid var(--bord)', color: 'var(--muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--ink)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bord)'; e.currentTarget.style.color = 'var(--muted)' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.role === 'assistant' && (
                        <div className="w-5 h-5 rounded-sm shrink-0 flex items-center justify-center mr-2 mt-0.5 font-display italic text-xs" style={{ background: 'color-mix(in srgb, var(--gold) 15%, var(--surf))', color: 'var(--gold)', border: '1px solid color-mix(in srgb, var(--gold) 30%, transparent)' }}>V</div>
                      )}
                      <div
                        className="max-w-[82%] text-xs px-3 py-2 rounded-sm leading-relaxed"
                        style={{
                          background: m.role === 'user' ? 'var(--surf2)' : 'transparent',
                          border: m.role === 'user' ? '1px solid var(--bord)' : 'none',
                          color: 'var(--ink)',
                        }}
                      >
                        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{m.content}
                          {m.streaming && <span className="inline-block w-0.5 h-3 align-middle ml-0.5 cursor-blink" style={{ background: 'var(--gold)' }} />}
                        </pre>
                      </div>
                    </div>
                  ))}
                  {streaming && !messages[messages.length - 1]?.streaming && (
                    <div className="flex gap-1 px-7">
                      {[0, 180, 360].map(d => <span key={d} className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)', animationDelay: `${d}ms` }} />)}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--bord)' }}>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder={lang === 'en' ? 'Ask anything…' : 'ಕೇಳಿ…'}
                  className="flex-1 px-3 py-2 rounded-sm text-xs outline-none"
                  style={{ background: 'var(--surf2)', color: 'var(--ink)', border: '1px solid var(--bord)', caretColor: 'var(--gold)' }}
                />
                <button onClick={() => send()} disabled={!input.trim() || streaming} className="w-8 h-8 rounded-sm flex items-center justify-center disabled:opacity-40" style={{ background: 'var(--gold)', color: 'var(--bg)' }}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
