'use client'

import { Brain, Info } from 'lucide-react'
import { useApp } from '@/lib/store'
import { ROLES } from '@/lib/rbac'
import { ChatInterface } from '@/components/jarvis/ChatInterface'
import { SuggestedPrompts } from '@/components/jarvis/SuggestedPrompts'

export default function JarvisPage() {
  const { role } = useApp()
  const currentRole = ROLES[role]

  return (
    <div className="max-w-[1200px] mx-auto h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-necl-accent flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-necl-text">Jarvis AI</h1>
            <p className="text-xs text-necl-muted">Decision intelligence grounded in live project data</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-necl-border text-xs text-necl-muted">
          <div className="w-2 h-2 rounded-full bg-necl-success animate-pulse" />
          Connected to: Xpedeon ERP · Volvo Connect · KOMTRAX · HRMS · 4 more systems
        </div>
      </div>

      {/* Role scope note */}
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

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Chat — takes 3 cols */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="flex-1 bg-necl-surface rounded-xl border border-necl-border p-4 flex flex-col min-h-0">
            <ChatInterface />
          </div>
        </div>

        {/* Sidebar context — 1 col */}
        <div className="flex flex-col gap-4">
          {/* Suggested prompts */}
          <div className="rounded-xl border border-necl-border bg-necl-surface p-4">
            <SuggestedPrompts
              onSelect={() => {}}
              limit={6}
            />
          </div>

          {/* Data sources */}
          <div className="rounded-xl border border-necl-border bg-necl-surface p-4">
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-3">Live Data Sources</p>
            <div className="space-y-2">
              {[
                { name: 'Xpedeon ERP', status: 'live', lag: '< 1min' },
                { name: 'Volvo Connect', status: 'live', lag: '2min' },
                { name: 'KOMTRAX', status: 'live', lag: '5min' },
                { name: 'Sany Remote', status: 'live', lag: '2min' },
                { name: 'HRMS System', status: 'live', lag: '15min' },
                { name: 'Tata Fleet Edge', status: 'degraded', lag: '32min' },
              ].map(src => (
                <div key={src.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${src.status === 'live' ? 'bg-necl-success' : 'bg-necl-warning'}`} />
                    <span className="text-xs text-necl-text">{src.name}</span>
                  </div>
                  <span className="text-[10px] text-necl-muted">{src.lag} lag</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guardrails */}
          <div className="rounded-xl border border-necl-border bg-necl-surface p-4">
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-3">AI Guardrails</p>
            <div className="space-y-2 text-[11px] text-necl-muted">
              <p>🔒 Role-scoped data access</p>
              <p>📎 All answers cited & grounded</p>
              <p>✋ Human approval required for actions</p>
              <p>📋 Full audit log maintained</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
