'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Globe } from 'lucide-react'
import chatbotData from '@/data/dev-chatbot.json'

interface Message { role: 'user' | 'assistant'; content: string }

type ChatbotResponse = { id: string; keywords: string[]; en: string; kn?: string }
type ChatbotData = { responses: ChatbotResponse[]; fallback: string | { en: string; kn?: string } }

function findResponse(query: string, lang: 'en' | 'kn'): string {
  const q = query.toLowerCase()
  const data = chatbotData as unknown as ChatbotData
  for (const r of data.responses) {
    for (const kw of r.keywords) {
      if (q.includes(kw.toLowerCase())) {
        return lang === 'kn' && r.kn ? r.kn : r.en
      }
    }
  }
  const fb = data.fallback
  if (typeof fb === 'string') return fb
  return lang === 'kn' && fb?.kn ? fb.kn : (fb?.en ?? "I'm not sure about that. Try asking about land, compliance, market prices, or feasibility.")
}

const SUGGESTIONS = [
  'What is the Kaveri price in Whitefield?',
  'Show Ozone Urbana risk flags',
  'How does RERA escrow work?',
  'What is the penalty for late QPR?',
  'Feasibility for 20,000 sqft plot at ₹8 Cr',
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [lang, setLang] = useState<'en' | 'kn'>('en')
  const [streaming, setStreaming] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streaming])

  const send = async (text: string) => {
    if (!text.trim() || isTyping) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setIsTyping(true)
    setStreaming('')

    const response = findResponse(text, lang)
    let i = 0
    const interval = setInterval(() => {
      if (i < response.length) {
        setStreaming(response.slice(0, i + 1))
        i += Math.floor(Math.random() * 3) + 1
      } else {
        clearInterval(interval)
        setMessages(prev => [...prev, { role: 'assistant', content: response }])
        setStreaming('')
        setIsTyping(false)
      }
    }, 18)
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--bord)', background: 'var(--surf)' }}>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--muted)' }}>Vantis Intelligence</div>
          <h1 className="font-display text-xl italic" style={{ color: 'var(--ink)' }}>AI Assistant</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'en' ? 'kn' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs"
            style={{ background: 'var(--surf2)', border: '1px solid var(--bord)', color: 'var(--muted)' }}>
            <Globe className="w-3.5 h-3.5" />
            {lang === 'en' ? 'English' : 'ಕನ್ನಡ'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-3xl mx-auto w-full space-y-4">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-12">
            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--surf)', border: '1px solid var(--gold)' }}>
              <div className="w-6 h-6 rounded-full" style={{ background: 'var(--gold)' }} />
            </div>
            <h2 className="font-display text-2xl italic mb-2" style={{ color: 'var(--ink)' }}>How can I help you today?</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>
              Ask about land acquisition, market prices, compliance, feasibility, or any project in your portfolio.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="px-3 py-1.5 text-xs font-mono rounded-sm text-left"
                  style={{ background: 'var(--surf)', border: '1px solid var(--bord)', color: 'var(--muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--bord)')}>
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-sm text-sm leading-relaxed`}
              style={{
                background: m.role === 'user' ? 'var(--gold)' : 'var(--surf)',
                color: m.role === 'user' ? 'var(--bg)' : 'var(--ink)',
                border: m.role === 'assistant' ? '1px solid var(--bord)' : 'none',
              }}>
              {m.content}
            </div>
          </motion.div>
        ))}

        {isTyping && streaming && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="max-w-[80%] px-4 py-3 rounded-sm text-sm leading-relaxed" style={{ background: 'var(--surf)', color: 'var(--ink)', border: '1px solid var(--bord)' }}>
              {streaming}
              <span className="inline-block w-0.5 h-4 ml-0.5 align-middle" style={{ background: 'var(--gold)', animation: 'pulse 1s infinite' }} />
            </div>
          </motion.div>
        )}

        {isTyping && !streaming && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-sm" style={{ background: 'var(--surf)', border: '1px solid var(--bord)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map(d => (
                  <div key={d} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)', animation: `bounce 1.2s ease-in-out ${d * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-8 py-4" style={{ borderTop: '1px solid var(--bord)', background: 'var(--surf)' }}>
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder={lang === 'en' ? 'Ask about land, compliance, market prices…' : 'ಭೂಮಿ, ಅನುಸರಣೆ, ಮಾರ್ಕೆಟ್ ಬೆಲೆ ಬಗ್ಗೆ ಕೇಳಿ…'}
            className="flex-1 px-4 py-3 rounded-sm text-sm outline-none"
            style={{ background: 'var(--surf2)', border: '1px solid var(--bord)', color: 'var(--ink)' }}
            disabled={isTyping}
          />
          <button onClick={() => send(input)} disabled={isTyping || !input.trim()}
            className="px-4 py-3 rounded-sm flex items-center gap-2 font-mono text-xs transition-opacity"
            style={{ background: 'var(--gold)', color: 'var(--bg)', opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
