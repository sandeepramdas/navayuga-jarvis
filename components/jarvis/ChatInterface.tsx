'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Brain, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { jarvisAnswers } from '@/lib/mock-data/jarvis-answers'
import { GroundedAnswer } from './GroundedAnswer'
import { SuggestedPrompts } from './SuggestedPrompts'
import type { JarvisQA } from '@/lib/mock-data/jarvis-answers'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  qa?: JarvisQA
  timestamp: Date
}

interface ChatInterfaceProps {
  initialQuestion?: string
  compact?: boolean
}

let msgCounter = 0

function createUserMsg(content: string): Message {
  msgCounter += 1
  return { id: `u-${msgCounter}`, role: 'user', content, timestamp: new Date() }
}

function createAssistantMsg(qa: JarvisQA): Message {
  msgCounter += 1
  return { id: `a-${msgCounter}`, role: 'assistant', content: qa.answer, qa, timestamp: new Date() }
}

function findAnswer(question: string): JarvisQA | null {
  const lower = question.toLowerCase()
  for (const qa of jarvisAnswers) {
    const qLower = qa.question.toLowerCase()
    const words = qLower.split(' ').filter(w => w.length > 4)
    const matches = words.filter(w => lower.includes(w)).length
    if (matches >= 2) return qa
  }
  return jarvisAnswers[0] // fallback
}

const DEFAULT_MESSAGES: Message[] = [
  createUserMsg('Why is Hyderabad Metro Pkg-3 slipping?'),
  createAssistantMsg(jarvisAnswers[0]),
]

export function ChatInterface({ initialQuestion, compact = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (question?: string) => {
    const q = question ?? input.trim()
    if (!q || isLoading) return

    setInput('')
    setMessages(prev => [...prev, createUserMsg(q)])
    setIsLoading(true)

    await new Promise(r => setTimeout(r, 1200))

    const answer = findAnswer(q)
    if (answer) {
      setMessages(prev => [...prev, createAssistantMsg(answer)])
    }
    setIsLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('flex flex-col h-full', compact ? 'gap-2' : 'gap-3')}>
      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-1"
        style={{ minHeight: 0 }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {msg.role === 'user' ? (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-necl-accent/20 border border-necl-accent/30 rounded-xl rounded-tr-sm px-4 py-3 max-w-xs">
                    <p className="text-sm text-necl-text">{msg.content}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-necl-border flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-necl-muted" />
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-necl-accent flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {msg.qa ? (
                      <GroundedAnswer qa={msg.qa} />
                    ) : (
                      <div className="rounded-xl border border-necl-border bg-necl-surface px-4 py-3">
                        <p className="text-sm text-necl-muted">{msg.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-necl-accent flex items-center justify-center flex-shrink-0">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="rounded-xl border border-necl-border bg-necl-surface px-4 py-3 flex items-center gap-2">
              <Loader className="w-4 h-4 text-necl-accent animate-spin" />
              <span className="text-sm text-necl-muted">Jarvis is analysing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Suggested prompts (compact) */}
      {compact && (
        <div className="flex-shrink-0">
          <SuggestedPrompts onSelect={handleSend} limit={3} />
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-2 bg-necl-bg border border-necl-border rounded-xl px-4 py-3 focus-within:border-necl-accent/60 transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Jarvis anything about your projects..."
            className="flex-1 bg-transparent text-sm text-necl-text placeholder-necl-muted outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0',
              input.trim() && !isLoading
                ? 'bg-necl-accent hover:bg-blue-500 text-white'
                : 'bg-necl-border text-necl-muted cursor-not-allowed',
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-necl-muted text-center mt-1.5">
          AI-generated · grounded in live project data · verify before acting
        </p>
      </div>
    </div>
  )
}
