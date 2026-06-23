'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MessageSquare, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import chatbotData from '@/data/chatbot-responses.json'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GOVERN_SUGGESTIONS = [
  'Show QPR defaulters this quarter',
  'Which projects are at risk of default',
  'Draft a show cause notice',
]

const PUBLIC_SUGGESTIONS = [
  'Is Ozone Urbana safe to buy',
  'What are my rights if possession is delayed',
  'How do I file a complaint',
]

function findResponse(query: string, isGovern: boolean): string {
  const q = query.toLowerCase()
  for (const r of chatbotData.responses) {
    for (const kw of r.keywords) {
      if (q.includes(kw.toLowerCase())) {
        return r.response
      }
    }
  }
  return isGovern ? chatbotData.fallback_govern : chatbotData.fallback_public
}

const DEV_ROUTES = ['/', '/command', '/land', '/market', '/feasibility', '/compliance', '/litigation', '/channel', '/dataroom', '/assistant', '/certificate',
  '/leads', '/visits', '/inventory', '/partners', '/projects', '/construction', '/customers', '/finance', '/payments', '/vision']

export default function VantisIntelligence() {
  const pathname = usePathname()
  const isGovern = pathname.startsWith('/govern')
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mode, setMode] = useState<'demo' | 'live'>('demo')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Hide on dev/OS routes — all hooks must be called before this return
  if (DEV_ROUTES.some(r => pathname === r || pathname?.startsWith(r + '/'))) return null

  const suggestions = isGovern ? GOVERN_SUGGESTIONS : PUBLIC_SUGGESTIONS

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  async function handleSend(text?: string) {
    const query = (text ?? input).trim()
    if (!query || isTyping) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: query }])
    setIsTyping(true)

    await new Promise(r => setTimeout(r, 1500))

    const response = findResponse(query, isGovern)
    setIsTyping(false)
    setMessages(prev => [...prev, { role: 'assistant', content: response }])
  }

  const panelTitle = isGovern ? 'Vantis Intelligence' : 'Vantis Assistant'
  const panelSub = isGovern ? 'K-RERA Officer Assistant' : 'Karnataka Homebuyer Assistant'

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
            className="fixed bottom-[4.5rem] right-4 sm:bottom-[5rem] sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] bg-surface border border-border rounded-sm flex flex-col overflow-hidden"
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
                <div className="text-blue text-xs">Live AI mode — coming soon. Responses from demo dataset.</div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="text-gray text-xs text-center mb-4">Try asking:</div>
                  {suggestions.map(s => (
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
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed">{m.content}</pre>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
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
                  placeholder="Ask anything about K-RERA..."
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
        {/* Pulsing ring — only when closed and no messages sent yet */}
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
