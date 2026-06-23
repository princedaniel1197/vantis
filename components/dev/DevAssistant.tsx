'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Globe } from 'lucide-react'
import chatData from '@/data/dev-chatbot.json'

interface Message {
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

type Lang = 'en' | 'kn'

interface ChatEntry {
  id: string
  keywords: string[]
  en: string
  kn: string
}

function findResponse(query: string, lang: Lang): string {
  const q = query.toLowerCase()
  for (const r of chatData.responses as ChatEntry[]) {
    for (const kw of r.keywords) {
      if (q.includes(kw.toLowerCase())) {
        return r[lang] || r.en
      }
    }
  }
  return (chatData.fallback as Record<string, string>)[lang] || chatData.fallback.en
}

const SUGGESTIONS = {
  en: [
    'Which of my projects will flag this quarter?',
    'What did 3BHKs sell for in Whitefield last quarter?',
    'Trace Ozone Urbana\'s attachable assets',
    'Draft my QPR for Divya Villas',
    'Is this JDA partner clean?',
  ],
  kn: [
    'ಈ ತ್ರೈಮಾಸಿಕ ಯಾವ ಯೋಜನೆಗಳು ಫ್ಲ್ಯಾಗ್ ಆಗುತ್ತವೆ?',
    'ವೈಟ್‌ಫೀಲ್ಡ್‌ನಲ್ಲಿ 3BHK ಬೆಲೆ ಎಷ್ಟು?',
    'ಓಝೋನ್ ಅರ್ಬನಾ ಆಸ್ತಿ ಪತ್ತೆ ಮಾಡಿ',
  ],
}

export default function DevAssistant() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<Lang>('en')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150)
  }, [open])

  const streamText = useCallback(async (text: string) => {
    const words = text.split('')
    let streamed = ''
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])
    for (let i = 0; i < words.length; i++) {
      streamed += words[i]
      const snapshot = streamed
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: snapshot, streaming: true }
        return updated
      })
      // Vary speed: fast for spaces, slower for content
      const delay = words[i] === '\n' ? 12 : words[i] === ' ' ? 6 : 14
      await new Promise(r => setTimeout(r, delay))
    }
    setMessages(prev => {
      const updated = [...prev]
      updated[updated.length - 1] = { role: 'assistant', content: text, streaming: false }
      return updated
    })
  }, [])

  async function handleSend(text?: string) {
    const query = (text ?? input).trim()
    if (!query || isStreaming) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: query }])
    setIsStreaming(true)

    // Realistic pre-stream delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    const response = findResponse(query, lang)
    await streamText(response)
    setIsStreaming(false)
  }

  // Don't render on assistant full page (it renders its own)
  if (pathname === '/assistant') return null

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] rounded-sm flex flex-col overflow-hidden"
            style={{ background: 'var(--surf)', border: '1px solid var(--bord)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: 'var(--surf2)', borderBottom: '1px solid var(--bord)' }}>
              <div>
                <div className="font-display italic text-base" style={{ color: 'var(--gold)' }}>Vantis Intelligence</div>
                <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>Developer Assistant · Karnataka RERA</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLang(l => l === 'en' ? 'kn' : 'en')}
                  className="text-[10px] font-mono px-2 py-1 rounded-sm flex items-center gap-1"
                  style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}
                >
                  <Globe className="w-3 h-3" />
                  {lang === 'en' ? 'ಕನ್ನಡ' : 'EN'}
                </button>
                <button onClick={() => setOpen(false)} style={{ color: 'var(--muted)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div>
                  <div className="text-xs text-center mb-4" style={{ color: 'var(--muted)' }}>
                    {lang === 'en' ? 'Ask me about your portfolio, market prices, or due diligence.' : 'ನಿಮ್ಮ ಪೋರ್ಟ್‌ಫೋಲಿಯೊ ಬಗ್ಗೆ ಕೇಳಿ.'}
                  </div>
                  {SUGGESTIONS[lang].map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="w-full text-left text-xs mb-2 px-3 py-2.5 rounded-sm transition-colors duration-100"
                      style={{ color: 'var(--muted)', border: '1px solid var(--bord)' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--ink)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bord)'; e.currentTarget.style.color = 'var(--muted)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[92%] text-xs px-3 py-2.5 rounded-sm leading-relaxed"
                    style={{
                      background: m.role === 'user' ? 'var(--surf2)' : 'transparent',
                      border: m.role === 'user' ? '1px solid var(--bord)' : 'none',
                      color: 'var(--ink)',
                    }}
                  >
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed">{m.content}{m.streaming && <span className="cursor-blink ml-0.5 inline-block w-0.5 h-3 align-middle" style={{ background: 'var(--gold)' }} />}</pre>
                  </div>
                </div>
              ))}

              {/* Typing dots while waiting for stream */}
              {isStreaming && messages.length > 0 && !messages[messages.length - 1].streaming && (
                <div className="flex gap-1.5 px-3 py-3">
                  {[0, 200, 400].map(d => (
                    <span key={d} className="typing-dot w-2 h-2 rounded-full" style={{ background: 'var(--gold)', animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--bord)' }}>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder={lang === 'en' ? 'Ask about your portfolio…' : 'ಕೇಳಿ…'}
                  className="flex-1 px-3 py-2 rounded-sm text-xs outline-none"
                  style={{ background: 'var(--surf2)', color: 'var(--ink)', border: '1px solid var(--bord)', caretColor: 'var(--gold)' }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="p-2 rounded-sm disabled:opacity-40 transition-opacity"
                  style={{ color: 'var(--gold)' }}
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
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'var(--gold)', boxShadow: '0 4px 24px color-mix(in srgb, var(--gold) 40%, transparent)' }}
        aria-label="Open Vantis Intelligence"
      >
        {!open && messages.length === 0 && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: 'var(--gold)' }} />
        )}
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }}>
              <X className="w-5 h-5" style={{ color: 'var(--bg)' }} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }}>
              <MessageSquare className="w-5 h-5" style={{ color: 'var(--bg)' }} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </>
  )
}
