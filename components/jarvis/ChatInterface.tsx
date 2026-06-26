'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, User, Brain, TrendingDown, Wrench, Package,
  MapPin, BarChart2, AlertTriangle, CheckCircle2,
  Circle, Loader2, Cpu, Zap, Network, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { jarvisAnswers } from '@/lib/mock-data/jarvis-answers'
import { GroundedAnswer } from './GroundedAnswer'
import type { JarvisQA } from '@/lib/mock-data/jarvis-answers'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  qa?: JarvisQA
}

type Phase = 'idle' | 'scanning' | 'streaming' | 'done'

let _id = 0
const uid = () => `m-${++_id}`

// ── Suggestion cards ──────────────────────────────────────────────────────────

const SUGGESTIONS = [
  {
    q: 'Why is Hyderabad Metro Pkg-3 slipping?',
    Icon: TrendingDown,
    cat: 'Schedule',
    hint: '77 days behind · HYD-M3',
    color: 'text-necl-critical',
    bg: 'bg-necl-critical/10',
    border: 'border-necl-critical/25',
  },
  {
    q: 'Which machines need maintenance in the next 7 days?',
    Icon: Wrench,
    cat: 'Fleet',
    hint: '4 machines at risk · 25 total',
    color: 'text-necl-warning',
    bg: 'bg-necl-warning/10',
    border: 'border-necl-warning/25',
  },
  {
    q: 'What is the total procurement risk exposure this week?',
    Icon: Package,
    cat: 'Procurement',
    hint: '₹38.2L exposure · 3 critical POs',
    color: 'text-necl-accent',
    bg: 'bg-necl-accent/10',
    border: 'border-necl-accent/25',
  },
  {
    q: 'Which project sites should the MD visit this week?',
    Icon: MapPin,
    cat: 'Site Visit',
    hint: '2 priority sites flagged',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/25',
  },
  {
    q: 'What is the portfolio financial health summary?',
    Icon: BarChart2,
    cat: 'Finance',
    hint: 'CPI 0.91 · ₹72.4Cr portfolio',
    color: 'text-necl-success',
    bg: 'bg-necl-success/10',
    border: 'border-necl-success/25',
  },
  {
    q: 'Show me all critical alerts across the portfolio',
    Icon: AlertTriangle,
    cat: 'Alerts',
    hint: '7 critical · 13 high priority',
    color: 'text-necl-critical',
    bg: 'bg-necl-critical/10',
    border: 'border-necl-critical/25',
  },
]

// ── Match question to mock answer ─────────────────────────────────────────────

function findAnswer(q: string): JarvisQA {
  const lower = q.toLowerCase()
  for (const qa of jarvisAnswers) {
    const words = qa.question.toLowerCase().split(' ').filter(w => w.length > 4)
    if (words.filter(w => lower.includes(w)).length >= 2) return qa
  }
  return jarvisAnswers[0]
}

function getScanSteps(qa: JarvisQA): string[] {
  return [
    ...qa.citations.map(c => `Querying ${c.source}`),
    'Cross-referencing contextual data',
    'Running causal analysis engine',
    'Synthesising grounded response…',
  ]
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-6 gap-6">
      {/* Animated orb */}
      <div className="relative flex items-center justify-center select-none">
        <div
          className="absolute w-32 h-32 rounded-full border border-necl-accent/15 animate-ping"
          style={{ animationDuration: '3.5s' }}
        />
        <div
          className="absolute w-24 h-24 rounded-full border border-necl-accent/25 animate-ping"
          style={{ animationDuration: '2.5s', animationDelay: '0.4s' }}
        />
        <div
          className="absolute w-16 h-16 rounded-full border border-necl-accent/35 animate-ping"
          style={{ animationDuration: '1.8s', animationDelay: '0.8s' }}
        />
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-necl-accent via-blue-600 to-blue-700 flex items-center justify-center shadow-2xl shadow-necl-accent/30">
          <Brain className="w-7 h-7 text-white" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-necl-success rounded-full border-2 border-[var(--color-necl-surface)] animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-necl-text tracking-tight">Jarvis AI</h2>
        <p className="text-sm text-necl-muted">
          What would you like to analyse today?
        </p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Network className="w-3 h-3 text-necl-success" />
          <span className="text-[10px] text-necl-muted">6 live data systems connected</span>
        </div>
      </div>

      {/* Suggestion cards grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {SUGGESTIONS.map(({ q, Icon, cat, hint, color, bg, border }, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.28, ease: 'easeOut' }}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => onSelect(q)}
            className={cn(
              'text-left p-3.5 rounded-xl border transition-all group',
              'bg-[var(--color-necl-surface)] hover:bg-necl-accent/5',
              'border-[var(--color-necl-border)] hover:border-necl-accent/40',
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border', bg, border)}>
                <Icon className={cn('w-4 h-4', color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn('text-[9px] font-bold uppercase tracking-widest', color)}>{cat}</span>
                  <ArrowRight className="w-3 h-3 text-necl-border group-hover:text-necl-accent transition-colors" />
                </div>
                <p className="text-xs text-necl-text leading-snug mb-1">{q}</p>
                <p className="text-[10px] text-necl-muted">{hint}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Scanning panel ────────────────────────────────────────────────────────────

function ScanningPanel({ steps, step }: { steps: string[]; step: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-necl-accent flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-necl-accent/30">
        <Cpu className="w-4 h-4 text-white animate-pulse" />
      </div>
      <div className="flex-1 rounded-xl border border-necl-accent/35 bg-[var(--color-necl-surface)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-necl-accent/10 border-b border-necl-accent/20">
          <Loader2 className="w-3.5 h-3.5 text-necl-accent animate-spin" />
          <span className="text-xs font-semibold text-necl-accent">Jarvis is working</span>
          <span className="text-[10px] text-necl-muted ml-auto tabular-nums">
            {step}/{steps.length} steps
          </span>
        </div>

        {/* Steps list */}
        <div className="px-4 py-3 space-y-2.5">
          {steps.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: i <= step ? 1 : 0.25, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2.5"
              >
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-necl-success flex-shrink-0" />
                ) : active ? (
                  <Loader2 className="w-3.5 h-3.5 text-necl-accent animate-spin flex-shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[var(--color-necl-border)] flex-shrink-0" />
                )}
                <span className={cn(
                  'text-[11px] flex-1',
                  done ? 'text-necl-muted line-through' : active ? 'text-necl-text font-medium' : 'text-[var(--color-necl-border)]',
                )}>
                  {s}
                </span>
                {done && <span className="text-[10px] text-necl-success">✓</span>}
                {active && (
                  <span className="text-[10px] text-necl-accent animate-pulse">scanning…</span>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="h-1 rounded-full bg-[var(--color-necl-border)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-necl-accent to-blue-400"
              animate={{ width: `${(step / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Streaming panel ───────────────────────────────────────────────────────────

function StreamingPanel({ text, total }: { text: string; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((text.length / total) * 100)) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-necl-accent flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-necl-accent/30">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 rounded-xl border border-necl-border bg-[var(--color-necl-surface)] overflow-hidden">
        {/* Header with bounce dots */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-necl-accent/10 border-b border-necl-accent/20">
          <div className="flex items-end gap-0.5 h-3">
            {[0, 1, 2].map(i => (
              <motion.span
                key={i}
                className="block w-1 rounded-full bg-necl-accent"
                animate={{ height: ['4px', '10px', '4px'] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-necl-accent">Jarvis AI</span>
          <span className="text-[10px] text-necl-muted ml-auto tabular-nums">{pct}%</span>
        </div>

        {/* Streaming text — plain text only, bold handled by final card */}
        <div className="px-5 py-4">
          <p className="text-sm text-necl-muted leading-relaxed whitespace-pre-wrap">
            {text}
            <motion.span
              className="inline-block w-0.5 h-3.5 bg-necl-accent ml-0.5 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          </p>
        </div>

        {/* Progress bar */}
        <div className="mx-5 mb-4 h-0.5 rounded-full bg-[var(--color-necl-border)] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-necl-accent to-blue-400"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ── Main ChatInterface ────────────────────────────────────────────────────────

export interface ChatInterfaceProps {
  pendingQuestion?: string | null
  onQuestionHandled?: () => void
}

export function ChatInterface({ pendingQuestion, onQuestionHandled }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [scanSteps, setScanSteps] = useState<string[]>([])
  const [scanStep, setScanStep] = useState(0)
  const [streamText, setStreamText] = useState('')
  const [currentQA, setCurrentQA] = useState<JarvisQA | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (scanRef.current) clearInterval(scanRef.current)
      if (streamRef.current) clearInterval(streamRef.current)
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }, [messages, phase, streamText, scanStep])

  // Handle question triggered from sidebar
  useEffect(() => {
    if (pendingQuestion && phase === 'idle') {
      send(pendingQuestion)
      onQuestionHandled?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion])

  function send(question?: string) {
    const q = (question ?? input).trim()
    if (!q || phase !== 'idle') return

    setInput('')
    setMessages(prev => [...prev, { id: uid(), role: 'user', content: q }])

    const qa = findAnswer(q)
    const steps = getScanSteps(qa)
    setCurrentQA(qa)
    setScanSteps(steps)
    setScanStep(0)
    setStreamText('')
    setPhase('scanning')

    // Scanning: advance one step every 550ms
    let s = 0
    scanRef.current = setInterval(() => {
      s++
      setScanStep(s)
      if (s >= steps.length) {
        clearInterval(scanRef.current!)
        // Brief pause then stream
        setTimeout(() => beginStream(qa), 350)
      }
    }, 550)
  }

  function beginStream(qa: JarvisQA) {
    setPhase('streaming')
    const words = qa.answer.split(' ')
    let wi = 0
    streamRef.current = setInterval(() => {
      wi += 5  // 5 words per tick ≈ comfortable reading pace
      if (wi >= words.length) {
        wi = words.length
        setStreamText(words.join(' '))
        clearInterval(streamRef.current!)
        // Finish: add completed assistant message
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { id: uid(), role: 'assistant', content: qa.answer, qa },
          ])
          setCurrentQA(null)
          setStreamText('')
          setScanSteps([])
          setScanStep(0)
          setPhase('idle')
        }, 200)
      } else {
        setStreamText(words.slice(0, wi).join(' '))
      }
    }, 55)
  }

  const busy = phase !== 'idle'
  const empty = messages.length === 0 && !busy

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Message / empty area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-0.5 scroll-smooth" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait">
          {empty ? (
            <motion.div key="empty" className="h-full">
              <EmptyState onSelect={send} />
            </motion.div>
          ) : (
            <motion.div key="chat" className="space-y-4 py-1">
              {/* Completed messages */}
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    {msg.role === 'user' ? (
                      <div className="flex items-start gap-2.5 justify-end">
                        <div className="bg-necl-accent/20 border border-necl-accent/30 rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-md">
                          <p className="text-sm text-necl-text">{msg.content}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[var(--color-necl-border)] flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-necl-muted" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-necl-accent flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-necl-accent/30">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {msg.qa ? (
                            <GroundedAnswer qa={msg.qa} />
                          ) : (
                            <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] px-4 py-3">
                              <p className="text-sm text-necl-muted">{msg.content}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* In-progress agentic phases */}
              <AnimatePresence>
                {phase === 'scanning' && (
                  <ScanningPanel key="scan" steps={scanSteps} step={scanStep} />
                )}
                {phase === 'streaming' && currentQA && (
                  <StreamingPanel key="stream" text={streamText} total={currentQA.answer.length} />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0">
        <div className={cn(
          'flex items-center gap-2.5 border rounded-xl px-4 py-3 transition-all',
          busy
            ? 'bg-necl-accent/5 border-necl-accent/35'
            : 'bg-[var(--color-necl-bg)] border-[var(--color-necl-border)] focus-within:border-necl-accent/50',
        )}>
          {busy
            ? <Loader2 className="w-4 h-4 text-necl-accent animate-spin flex-shrink-0" />
            : <Zap className="w-4 h-4 text-necl-muted flex-shrink-0" />
          }
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            disabled={busy}
            placeholder={busy ? 'Jarvis is working…' : 'Ask Jarvis anything about your projects…'}
            className="flex-1 bg-transparent text-sm text-necl-text placeholder-necl-muted outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || busy}
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0',
              input.trim() && !busy
                ? 'bg-necl-accent hover:bg-blue-500 text-white shadow-md shadow-necl-accent/30'
                : 'bg-[var(--color-necl-border)] text-necl-muted cursor-not-allowed',
            )}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-necl-muted text-center mt-1.5 select-none">
          AI-generated · grounded in live project data · verify before acting
        </p>
      </div>
    </div>
  )
}
