'use client'

import { useState } from 'react'
import { Brain, Info, Shield, Lock, FileText, Hand } from 'lucide-react'
import { useApp } from '@/lib/store'
import { ROLES } from '@/lib/rbac'
import { ChatInterface } from '@/components/jarvis/ChatInterface'
import { SuggestedPrompts } from '@/components/jarvis/SuggestedPrompts'

const DATA_SOURCES = [
  { name: 'Xpedeon ERP',    status: 'live' as const,     lag: '< 1min' },
  { name: 'Volvo Connect',  status: 'live' as const,     lag: '2min'   },
  { name: 'KOMTRAX',        status: 'live' as const,     lag: '5min'   },
  { name: 'Sany Remote',    status: 'live' as const,     lag: '2min'   },
  { name: 'HRMS System',    status: 'live' as const,     lag: '15min'  },
  { name: 'Tata Fleet Edge',status: 'degraded' as const, lag: '32min'  },
]

const GUARDRAILS = [
  { Icon: Lock,     text: 'Role-scoped data access' },
  { Icon: FileText, text: 'All answers cited & grounded' },
  { Icon: Hand,     text: 'Human approval required for actions' },
  { Icon: Shield,   text: 'Full audit log maintained' },
]

export default function JarvisPage() {
  const { role } = useApp()
  const currentRole = ROLES[role]
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null)

  return (
    <div className="max-w-[1200px] mx-auto h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-necl-accent flex items-center justify-center shadow-lg shadow-necl-accent/30">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-necl-text">Jarvis AI</h1>
            <p className="text-xs text-necl-muted">Decision intelligence grounded in live project data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-necl-border)] text-xs text-necl-muted">
          <div className="w-2 h-2 rounded-full bg-necl-success animate-pulse" />
          Connected to: Xpedeon ERP · Volvo Connect · KOMTRAX · HRMS · 4 more systems
        </div>
      </div>

      {/* Site-manager scope note */}
      {role === 'site-manager' && (
        <div className="flex-shrink-0 flex items-start gap-2 p-3.5 rounded-xl border border-necl-accent/30 bg-necl-accent/8 text-xs text-necl-text">
          <Info className="w-4 h-4 text-necl-accent mt-0.5 flex-shrink-0" />
          <span>
            You are viewing as <strong>{currentRole.name}</strong> ({currentRole.label}).
            Jarvis responses are scoped to <strong>Kaleshwaram Dam Support Pkg-B (KDSP-B1)</strong>.
            Cross-project data is restricted at the data layer.
          </span>
        </div>
      )}

      {/* Main layout: chat (3 cols) + sidebar (1 col) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Chat area */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="flex-1 bg-[var(--color-necl-surface)] rounded-xl border border-[var(--color-necl-border)] p-4 flex flex-col min-h-0">
            <ChatInterface
              pendingQuestion={pendingQuestion}
              onQuestionHandled={() => setPendingQuestion(null)}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4 overflow-y-auto">
          {/* Suggested questions */}
          <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-4">
            <SuggestedPrompts onSelect={q => setPendingQuestion(q)} limit={6} />
          </div>

          {/* Live data sources */}
          <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-4">
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-3">Live Data Sources</p>
            <div className="space-y-2.5">
              {DATA_SOURCES.map(src => (
                <div key={src.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      src.status === 'live' ? 'bg-necl-success animate-pulse' : 'bg-necl-warning'
                    }`} />
                    <span className="text-xs text-necl-text">{src.name}</span>
                  </div>
                  <span className={`text-[10px] ${
                    src.status === 'degraded' ? 'text-necl-warning' : 'text-necl-muted'
                  }`}>{src.lag} lag</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI guardrails */}
          <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-4">
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-3">AI Guardrails</p>
            <div className="space-y-2.5">
              {GUARDRAILS.map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-necl-muted flex-shrink-0" />
                  <span className="text-[11px] text-necl-muted">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
