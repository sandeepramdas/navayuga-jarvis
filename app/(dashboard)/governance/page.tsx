'use client'

import { useState } from 'react'
import { Shield, Database, Users, Lock, CheckCircle, RefreshCw, Globe, Brain, FileText, Eye, Wifi } from 'lucide-react'
import { RBAC_MATRIX } from '@/lib/rbac'
import { cn } from '@/lib/utils'

type Tab = 'data-sources' | 'rbac' | 'guardrails'

const dataSources = [
  {
    name: 'Xpedeon ERP',
    icon: Database,
    status: 'live' as const,
    lastSync: '< 1 min ago',
    lag: '< 1 min',
    volume: '2.4M records',
    sla: 98,
  },
  {
    name: 'Volvo Connect',
    icon: Wifi,
    status: 'live' as const,
    lastSync: '2 min ago',
    lag: '2 min',
    volume: '8 machines live',
    sla: 99,
  },
  {
    name: 'Sany Remote',
    icon: Wifi,
    status: 'live' as const,
    lastSync: '2 min ago',
    lag: '2 min',
    volume: '4 machines live',
    sla: 98,
  },
  {
    name: 'KOMTRAX (Komatsu)',
    icon: Wifi,
    status: 'live' as const,
    lastSync: '5 min ago',
    lag: '5 min',
    volume: '4 machines live',
    sla: 97,
  },
  {
    name: 'Tata Fleet Edge',
    icon: Wifi,
    status: 'degraded' as const,
    lastSync: '32 min ago',
    lag: '32 min',
    volume: '3 machines partial',
    sla: 72,
  },
  {
    name: 'Eicher Telematics',
    icon: Wifi,
    status: 'live' as const,
    lastSync: '8 min ago',
    lag: '8 min',
    volume: '3 machines live',
    sla: 96,
  },
  {
    name: 'HRMS System',
    icon: Users,
    status: 'live' as const,
    lastSync: '15 min ago',
    lag: '15 min',
    volume: '2,444 employees',
    sla: 99,
  },
]

const guardrails = [
  {
    icon: Lock,
    title: 'Role-scoped Data Access',
    description: 'Jarvis answers are bounded to the requestor\'s role scope. Cross-scope data is blocked at the MCP layer. Site Managers can only see their assigned project; Fleet Heads see fleet data across all sites.',
    detail: 'Enforced at: MCP data access layer + SQL row-level security',
  },
  {
    icon: FileText,
    title: 'Grounded & Cited Answers',
    description: 'Every AI response includes source citations with system name, record ID, and timestamp. Answers that cannot be grounded are flagged with a hallucination-risk indicator.',
    detail: 'Citation coverage: 100% of production responses. Hallucination rate: < 1.2% (last 30 days)',
  },
  {
    icon: Shield,
    title: 'Prompt-Injection Defense',
    description: 'Input sanitization and intent classification is applied on every Jarvis query before it reaches the model. Jailbreak patterns are blocked and logged.',
    detail: 'Blocked in last 30 days: 0 injection attempts. Input validation: regex + ML classifier',
  },
  {
    icon: CheckCircle,
    title: 'Human Approval on Actions',
    description: 'No ERP write, no PO action, no crew assignment, no budget adjustment is executed without a human reviewing and approving the AI recommendation in the Jarvis UI.',
    detail: 'Approval gate: all action verbs require click-confirm. No autonomous writes to any system.',
  },
  {
    icon: Eye,
    title: 'Full Audit Log',
    description: 'Every Jarvis query, recommendation approval, data access event, and role switch is logged with user identity, timestamp, data accessed, and model version.',
    detail: 'Retention: 2 years. Log integrity: SHA-256 hash chain. Exportable to SIEM.',
  },
  {
    icon: Brain,
    title: 'Bias Monitoring',
    description: 'People-analytics models are monitored for demographic bias across gender, age, and location. Quarterly audits by an independent reviewer. Individual scores are never shown ranked.',
    detail: 'Last audit: June 1, 2025 — no bias detected. Next audit: September 1, 2025.',
  },
]

const cellStyles: Record<string, string> = {
  '✅ Full': 'text-necl-success bg-necl-success/10',
  '👁 Read': 'text-necl-accent bg-necl-accent/10',
  '⚠️ Restricted': 'text-necl-warning bg-necl-warning/10',
  '⚠️ Masked': 'text-necl-warning bg-necl-warning/10',
  '❌ No': 'text-necl-muted bg-necl-border/50',
  '❌ No Access': 'text-necl-muted bg-necl-border/50',
}

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('data-sources')

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Governance & AI Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-necl-border">
        {(['data-sources', 'rbac', 'guardrails'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold capitalize border-b-2 transition-colors -mb-px',
              activeTab === tab
                ? 'border-necl-accent text-necl-accent'
                : 'border-transparent text-necl-muted hover:text-necl-text',
            )}
          >
            {tab === 'data-sources' ? 'Data Sources' : tab === 'rbac' ? 'RBAC Matrix' : 'AI Guardrails'}
          </button>
        ))}
      </div>

      {/* Data Sources */}
      {activeTab === 'data-sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dataSources.map(ds => {
            const Icon = ds.icon
            return (
              <div key={ds.name} className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-necl-bg border border-necl-border flex items-center justify-center">
                      <Icon className="w-5 h-5 text-necl-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-necl-text">{ds.name}</p>
                      <p className="text-[10px] text-necl-muted">{ds.volume}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold',
                    ds.status === 'live' ? 'bg-necl-success/15 text-necl-success' : 'bg-necl-warning/15 text-necl-warning',
                  )}>
                    <div className={cn('w-1.5 h-1.5 rounded-full', ds.status === 'live' ? 'bg-necl-success animate-pulse' : 'bg-necl-warning')} />
                    {ds.status === 'live' ? 'Live' : 'Degraded'}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 text-xs text-necl-muted">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Last synced: {ds.lastSync}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-necl-muted">Freshness SLA</span>
                    <span className={cn('text-[11px] font-bold', ds.sla >= 95 ? 'text-necl-success' : 'text-necl-warning')}>{ds.sla}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-necl-border rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', ds.sla >= 95 ? 'bg-necl-success' : 'bg-necl-warning')}
                      style={{ width: `${ds.sla}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
          <div className="px-5 py-4 border-b border-necl-border">
            <h2 className="text-sm font-bold text-necl-text">Role-Based Access Control Matrix</h2>
            <p className="text-[11px] text-necl-muted mt-1">Defines what each role can see and do within NECL Jarvis</p>
          </div>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-necl-muted border-b border-necl-border">Role</th>
                  {RBAC_MATRIX.columns.map(col => (
                    <th key={col} className="px-2 py-2.5 text-[10px] font-semibold text-necl-muted text-center border-b border-necl-border whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RBAC_MATRIX.rows.map((row, rowIdx) => (
                  <tr key={row} className="border-b border-necl-border/40 hover:bg-necl-bg">
                    <td className="px-3 py-3 font-semibold text-necl-text whitespace-nowrap">{row}</td>
                    {RBAC_MATRIX.cells[rowIdx].map((cell, colIdx) => (
                      <td key={colIdx} className="px-2 py-3 text-center">
                        <span className={cn(
                          'inline-block px-2 py-0.5 rounded text-[10px] font-semibold',
                          Object.entries(cellStyles).find(([k]) => cell.includes(k.replace('✅ ', '').replace('👁 ', '').replace('⚠️ ', '').replace('❌ ', '')))?.[1] ?? cellStyles[cell] ?? 'text-necl-muted',
                        )}>
                          {cell}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Guardrails */}
      {activeTab === 'guardrails' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {guardrails.map(g => {
            const Icon = g.icon
            return (
              <div key={g.title} className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-necl-success/10 border border-necl-success/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-necl-success" />
                  </div>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-necl-success/15 text-necl-success">
                    <CheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </div>
                <h3 className="text-sm font-bold text-necl-text mb-2">{g.title}</h3>
                <p className="text-xs text-necl-muted leading-relaxed mb-3">{g.description}</p>
                <div className="p-2.5 rounded-lg bg-necl-bg border border-necl-border">
                  <p className="text-[10px] text-necl-muted">{g.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
