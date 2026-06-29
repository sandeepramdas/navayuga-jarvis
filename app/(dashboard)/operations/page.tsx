'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Layers, AlertTriangle, CheckCircle2, Clock, TrendingUp,
  TrendingDown, Users, Truck, IndianRupee, Zap, CloudRain,
  ChevronRight, Shield, Activity,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { NECLAreaChart } from '@/components/charts/AreaChart'
import { StatusPill } from '@/components/ui/StatusPill'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { projects } from '@/lib/mock-data/projects'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { raBills, clientGates, variationOrders, criticalBlockers, monsoonRisks } from '@/lib/mock-data/operations-extended'
import type { Alert } from '@/lib/mock-data/alerts'
import { cn } from '@/lib/utils'

// ── Static data ───────────────────────────────────────────────────────────────

const PROJECT_KEY: Record<string, string> = {
  'HYD-M3': 'hyd', 'BMRC-E2': 'bmrc', 'NH-44X': 'nh', 'KDSP-B1': 'kdsp',
  'CHN-FLY': 'chn', 'MUM-CST': 'mum', 'RLWY-G4': 'rlwy', 'VIZG-P2': 'vizg',
}
const PROJECT_COLOR: Record<string, string> = {
  'HYD-M3': '#EF4444', 'BMRC-E2': '#2563EB', 'NH-44X': '#10B981', 'KDSP-B1': '#F59E0B',
  'CHN-FLY': '#8B5CF6', 'MUM-CST': '#06B6D4', 'RLWY-G4': '#F97316', 'VIZG-P2': '#EC4899',
}

const progressHistory = [
  { month: 'W-6', hyd: 64, bmrc: 40, nh: 78, kdsp: 51, chn: 89, mum: 26, rlwy: 68, vizg: 35 },
  { month: 'W-5', hyd: 64, bmrc: 41, nh: 79, kdsp: 52, chn: 90, mum: 27, rlwy: 68, vizg: 36 },
  { month: 'W-4', hyd: 65, bmrc: 41, nh: 79, kdsp: 52, chn: 91, mum: 27, rlwy: 69, vizg: 36 },
  { month: 'W-3', hyd: 65, bmrc: 42, nh: 80, kdsp: 53, chn: 91, mum: 28, rlwy: 70, vizg: 37 },
  { month: 'W-2', hyd: 66, bmrc: 42, nh: 80, kdsp: 53, chn: 91, mum: 28, rlwy: 70, vizg: 37 },
  { month: 'W-1', hyd: 66, bmrc: 43, nh: 81, kdsp: 54, chn: 92, mum: 29, rlwy: 71, vizg: 38 },
  { month: 'Now', hyd: 67, bmrc: 43, nh: 81, kdsp: 54, chn: 92, mum: 29, rlwy: 71, vizg: 38 },
]

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-06-29')
const WINDOW_DAYS = 90

// ── Helper functions ──────────────────────────────────────────────────────────

function daysFromToday(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - TODAY.getTime()) / 86400000)
}

function computeHealthScore(
  visiblePs: typeof projects,
  criticalAlertCount: number,
): { total: number; schedule: number; cost: number; safety: number; quality: number } {
  if (!visiblePs.length) return { total: 0, schedule: 0, cost: 0, safety: 0, quality: 0 }
  const schedule = Math.round(visiblePs.reduce((s, p) => s + Math.max(0, 100 - Math.max(0, p.scheduleVarianceDays) * 1.5), 0) / visiblePs.length)
  const cost     = Math.round(visiblePs.reduce((s, p) => s + Math.max(0, 100 - Math.max(0, p.costVariance) * 5), 0) / visiblePs.length)
  const safety   = 92
  const quality  = Math.max(50, 100 - criticalAlertCount * 6)
  const total    = Math.round(schedule * 0.35 + cost * 0.30 + safety * 0.20 + quality * 0.15)
  return { total, schedule, cost, safety, quality }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function HealthGauge({ score, breakdown }: { score: number; breakdown: { schedule: number; cost: number; safety: number; quality: number } }) {
  const color = score >= 80 ? '#10B981' : score >= 65 ? '#F59E0B' : '#EF4444'
  const label = score >= 80 ? 'Healthy' : score >= 65 ? 'Needs Attention' : 'Critical'
  const dimensions = [
    { label: 'Schedule', value: breakdown.schedule, w: 0.35 },
    { label: 'Cost',     value: breakdown.cost,     w: 0.30 },
    { label: 'Safety',   value: breakdown.safety,   w: 0.20 },
    { label: 'Quality',  value: breakdown.quality,  w: 0.15 },
  ]

  return (
    <div className="flex flex-col items-center">
      {/* Semicircle gauge */}
      <svg viewBox="0 0 120 70" className="w-40 mx-auto">
        {/* Track */}
        <path d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none" stroke="var(--color-necl-border)" strokeWidth="9" strokeLinecap="round" />
        {/* Fill */}
        <path d="M 15 65 A 45 45 0 0 1 105 65"
          fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          pathLength="100" strokeDasharray={`${score} 100`} />
        <text x="60" y="58" textAnchor="middle" fill={color} fontSize="22" fontWeight="bold" fontFamily="monospace">{score}</text>
        <text x="60" y="68" textAnchor="middle" fill="#64748B" fontSize="7">{label}</text>
      </svg>
      {/* Dimension breakdown */}
      <div className="w-full mt-3 space-y-1.5">
        {dimensions.map(d => (
          <div key={d.label} className="flex items-center gap-2">
            <span className="text-[10px] text-necl-muted w-14 flex-shrink-0">{d.label}</span>
            <div className="flex-1 h-1.5 bg-[var(--color-necl-border)] rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full', d.value >= 80 ? 'bg-necl-success' : d.value >= 65 ? 'bg-necl-warning' : 'bg-necl-critical')}
                style={{ width: `${d.value}%` }}
              />
            </div>
            <span className={cn('text-[10px] font-bold w-6 text-right', d.value >= 80 ? 'text-necl-success' : d.value >= 65 ? 'text-necl-warning' : 'text-necl-critical')}>{d.value}</span>
            <span className="text-[9px] text-necl-muted w-6">{Math.round(d.w * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BillingPipeline({ bills }: { bills: typeof raBills }) {
  const stages: { key: typeof raBills[0]['status']; label: string; short: string }[] = [
    { key: 'submitted',        label: 'Submitted',        short: 'S' },
    { key: 'under-review',     label: 'Under Review',     short: 'UR' },
    { key: 'certified',        label: 'Certified',        short: 'C' },
    { key: 'payment-received', label: 'Received',         short: 'R' },
  ]
  const stageColors = ['border-necl-muted/40 bg-[var(--color-necl-surface)]', 'border-necl-warning/40 bg-necl-warning/5', 'border-necl-accent/40 bg-necl-accent/5', 'border-necl-success/40 bg-necl-success/5']
  const stageTextColors = ['text-necl-muted', 'text-necl-warning', 'text-necl-accent', 'text-necl-success']

  return (
    <div className="flex items-stretch gap-0">
      {stages.map((s, i) => {
        const stageBills = bills.filter(b => b.status === s.key)
        const total = stageBills.reduce((sum, b) => sum + (s.key === 'payment-received' ? (b.certifiedAmount ?? b.amount) : b.amount), 0)
        const maxStuck = stageBills.reduce((max, b) => Math.max(max, b.daysStuck), 0)
        const hasRedFlag = maxStuck >= 30
        return (
          <div key={s.key} className="flex items-center flex-1 min-w-0">
            <div className={cn('flex-1 rounded-xl border p-3 h-full flex flex-col justify-between', stageColors[i])}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn('text-[10px] font-bold uppercase tracking-wide', stageTextColors[i])}>{s.label}</span>
                {hasRedFlag && s.key !== 'payment-received' && (
                  <span className="text-[8px] text-necl-critical font-bold bg-necl-critical/10 px-1 py-0.5 rounded border border-necl-critical/30">{maxStuck}d</span>
                )}
              </div>
              <div>
                <p className={cn('text-lg font-black tabular-nums', stageTextColors[i])}>
                  ₹{(total / 10000000).toFixed(1)}Cr
                </p>
                <p className="text-[10px] text-necl-muted">{stageBills.length} bill{stageBills.length !== 1 ? 's' : ''}</p>
              </div>
              {stageBills.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {stageBills.map(b => (
                    <div key={b.id} className="flex items-center justify-between text-[9px]">
                      <span className="text-necl-muted">{b.projectId} {b.billNo}</span>
                      <span className={cn('font-semibold', b.daysStuck >= 30 ? 'text-necl-critical' : b.daysStuck >= 14 ? 'text-necl-warning' : 'text-necl-muted')}>
                        {b.daysStuck > 0 ? `${b.daysStuck}d` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {i < stages.length - 1 && (
              <ChevronRight className="w-4 h-4 text-necl-muted flex-shrink-0 mx-0.5" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function MilestoneGantt({ visibleProjects }: { visibleProjects: typeof projects }) {
  const weekLabels = ['Today', '+15d', '+30d', '+45d', '+60d', '+75d', '+90d']

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 600 }}>
        {/* Header ruler */}
        <div className="flex items-center mb-3 pl-28">
          {weekLabels.map(l => (
            <div key={l} className="flex-1 text-center text-[9px] text-necl-muted">{l}</div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-3">
          {visibleProjects.map(p => {
            const color = PROJECT_COLOR[p.id] ?? '#64748B'
            const milestonesInWindow = p.milestones.filter(m => {
              const d = daysFromToday(m.date)
              return d >= -30 && d <= WINDOW_DAYS // include slightly past (overdue)
            })

            return (
              <div key={p.id} className="flex items-center gap-2">
                {/* Project label */}
                <div className="w-24 flex-shrink-0 flex items-center gap-1.5">
                  <StatusPill status={p.status} size="sm" />
                  <span className="text-[10px] font-mono font-bold text-necl-muted">{p.id.replace(/-.*/, '')}</span>
                </div>

                {/* Track */}
                <div className="flex-1 relative h-8">
                  {/* Background grid */}
                  <div className="absolute inset-y-0 left-0 right-0 flex">
                    {weekLabels.map((_, i) => (
                      <div key={i} className="flex-1 border-l border-[var(--color-necl-border)]/40 first:border-0" />
                    ))}
                  </div>

                  {/* Progress fill */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-[var(--color-necl-border)] right-0">
                    <div className="h-full rounded-full opacity-30" style={{ width: `${p.progress}%`, backgroundColor: color }} />
                  </div>

                  {/* Today line */}
                  <div className="absolute top-0 bottom-0 left-0 w-px bg-necl-accent/60" />

                  {/* Milestone markers */}
                  {milestonesInWindow.map((m, mi) => {
                    const days = daysFromToday(m.date)
                    const pct = Math.max(0, Math.min(100, (days / WINDOW_DAYS) * 100))
                    const isOverdue = days < 0 && !m.completed
                    const isDueSoon = days >= 0 && days <= 14
                    const dotColor = m.completed ? '#10B981' : isOverdue ? '#EF4444' : isDueSoon ? '#F59E0B' : color

                    return (
                      <div
                        key={mi}
                        className="absolute top-1/2 -translate-y-1/2 group"
                        style={{ left: `${pct}%`, transform: 'translateX(-50%) translateY(-50%)' }}
                      >
                        <div
                          className={cn(
                            'w-3.5 h-3.5 rounded-full border-2 border-[var(--color-necl-bg)]',
                            isOverdue && 'animate-pulse',
                          )}
                          style={{ backgroundColor: dotColor }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 pointer-events-none">
                          <div className="bg-[var(--color-necl-surface)] border border-[var(--color-necl-border)] rounded-lg px-2 py-1.5 text-[10px] whitespace-nowrap shadow-lg">
                            <p className="font-bold text-necl-text">{m.name}</p>
                            <p className="text-necl-muted">{new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                            {isOverdue && <p className="text-necl-critical font-bold">OVERDUE {Math.abs(days)}d</p>}
                            {isDueSoon && !isOverdue && <p className="text-necl-warning font-bold">Due in {days}d</p>}
                            {m.completed && <p className="text-necl-success font-bold">✓ Complete</p>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Overdue count badge */}
                {(() => {
                  const overdue = p.milestones.filter(m => daysFromToday(m.date) < 0 && !m.completed)
                  return overdue.length > 0 ? (
                    <span className="text-[9px] font-bold text-necl-critical bg-necl-critical/10 border border-necl-critical/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {overdue.length} overdue
                    </span>
                  ) : null
                })()}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pl-28 flex-wrap">
          {[
            { color: '#10B981', label: 'Completed' },
            { color: '#EF4444', label: 'Overdue' },
            { color: '#F59E0B', label: 'Due ≤14d' },
            { color: '#2563EB', label: 'Upcoming' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-[10px] text-necl-muted">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VelocityPanel({ visibleProjects }: { visibleProjects: typeof projects }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
      {visibleProjects.map(p => {
        const deltas = p.weeklyProgress.slice(1).map((v, i) => v - p.weeklyProgress[i])
        const avgVelocity = deltas.reduce((s, d) => s + d, 0) / deltas.length
        const trend = deltas[deltas.length - 1] > avgVelocity ? 'up' : deltas[deltas.length - 1] < avgVelocity ? 'down' : 'flat'
        const color = PROJECT_COLOR[p.id] ?? '#64748B'
        const maxDelta = Math.max(...deltas, 1)

        return (
          <div key={p.id} className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold" style={{ color }}>{p.id}</span>
              <div className="flex items-center gap-1">
                {trend === 'up' ? <TrendingUp className="w-3 h-3 text-necl-success" /> : trend === 'down' ? <TrendingDown className="w-3 h-3 text-necl-critical" /> : null}
                <span className={cn('text-[10px] font-bold', trend === 'up' ? 'text-necl-success' : trend === 'down' ? 'text-necl-critical' : 'text-necl-muted')}>
                  {avgVelocity.toFixed(1)}%/wk
                </span>
              </div>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-0.5 h-8">
              {deltas.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="rounded-t-sm transition-all"
                    style={{
                      height: `${Math.max(4, (d / maxDelta) * 100)}%`,
                      backgroundColor: i === deltas.length - 1 ? color : `${color}60`,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-1 text-[8px] text-necl-muted">
              <span>W-6</span>
              <span>Now</span>
            </div>

            <div className="mt-2 pt-2 border-t border-[var(--color-necl-border)]">
              <p className="text-[10px] text-necl-muted">Progress: <span className="text-necl-text font-semibold">{p.progress}%</span></p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScheduleRecovery({ visibleProjects }: { visibleProjects: typeof projects }) {
  const troubled = visibleProjects.filter(p => p.status !== 'on-track' || p.scheduleVarianceDays > 0)
  if (troubled.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <CheckCircle2 className="w-8 h-8 text-necl-success mb-2" />
        <p className="text-sm font-semibold text-necl-success">All projects on schedule</p>
        <p className="text-xs text-necl-muted mt-1">No recovery plans needed</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {troubled.map(p => {
        const planned = new Date(p.plannedCompletion)
        const projected = new Date(p.projectedCompletion)
        const gapDays = Math.round((projected.getTime() - planned.getTime()) / 86400000)
        const costTrend = p.weeklyCostVariance
        const isWidening = costTrend[costTrend.length - 1] > costTrend[costTrend.length - 2]
        const schedVarHistory = p.weeklyProgress.map((_, i, arr) => {
          if (i === 0) return p.scheduleVarianceDays - (arr.length - 1) * 0.5
          return p.scheduleVarianceDays - (arr.length - 1 - i) * 0.5
        })
        const schedTrendWidening = schedVarHistory[schedVarHistory.length - 1] > schedVarHistory[schedVarHistory.length - 2]

        return (
          <div key={p.id} className={cn(
            'rounded-xl border p-4',
            p.status === 'delayed' ? 'border-necl-critical/40 bg-necl-critical/5' : 'border-necl-warning/40 bg-necl-warning/5',
          )}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-bold text-necl-accent">{p.id}</span>
                  <StatusPill status={p.status} size="sm" />
                </div>
                <p className="text-xs text-necl-muted">{p.pm}</p>
              </div>
              <div className={cn(
                'flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border',
                schedTrendWidening
                  ? 'text-necl-critical border-necl-critical/30 bg-necl-critical/10'
                  : 'text-necl-warning border-necl-warning/30 bg-necl-warning/10',
              )}>
                {schedTrendWidening
                  ? <><TrendingDown className="w-3 h-3" /> Gap widening</>
                  : <><TrendingUp className="w-3 h-3" /> Recovering</>}
              </div>
            </div>

            {/* Planned vs projected */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="rounded-lg bg-[var(--color-necl-bg)] p-2.5">
                <p className="text-[9px] text-necl-muted uppercase tracking-wider mb-1">Planned</p>
                <p className="text-xs font-bold text-necl-text">
                  {planned.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </p>
              </div>
              <div className={cn('rounded-lg p-2.5', gapDays > 60 ? 'bg-necl-critical/10' : 'bg-necl-warning/10')}>
                <p className="text-[9px] text-necl-muted uppercase tracking-wider mb-1">Projected</p>
                <p className={cn('text-xs font-bold', gapDays > 60 ? 'text-necl-critical' : 'text-necl-warning')}>
                  {projected.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Gap bar */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-[var(--color-necl-border)] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-necl-success" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-necl-muted">{p.progress}%</span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className={cn('font-semibold', gapDays > 60 ? 'text-necl-critical' : 'text-necl-warning')}>
                {gapDays > 0 ? `+${gapDays}d slippage` : 'On schedule'}
              </span>
              <Link href={`/project/${p.id}`} className="text-necl-accent hover:underline font-medium">
                View site →
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Status filter type ─────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'on-track' | 'at-risk' | 'delayed'

const STATUS_TAB_STYLES: Record<StatusFilter, { active: string; base: string }> = {
  'all':      { active: 'border-necl-accent bg-necl-accent text-white', base: 'border-[var(--color-necl-border)] text-necl-muted' },
  'on-track': { active: 'border-necl-success bg-necl-success/20 text-necl-success', base: 'border-[var(--color-necl-border)] text-necl-muted' },
  'at-risk':  { active: 'border-necl-warning bg-necl-warning/20 text-necl-warning', base: 'border-[var(--color-necl-border)] text-necl-muted' },
  'delayed':  { active: 'border-necl-critical bg-necl-critical/20 text-necl-critical', base: 'border-[var(--color-necl-border)] text-necl-muted' },
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function OperationsPage() {
  const { role, selectedProjects } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const isSiteManager = role === 'site-manager'

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Operations</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  const effectiveProjects = isSiteManager ? ['KDSP-B1'] : selectedProjects
  const allVisible = useMemo(
    () => projects.filter(p => effectiveProjects.includes(p.id)),
    [effectiveProjects],
  )
  const visibleProjects = useMemo(
    () => statusFilter === 'all' ? allVisible : allVisible.filter(p => p.status === statusFilter),
    [allVisible, statusFilter],
  )

  const opsAlerts = useMemo(() => alerts.filter(a =>
    a.department === 'operations' && effectiveProjects.includes(a.projectId ?? ''),
  ), [effectiveProjects])

  const opsRecs = useMemo(() => recommendations.filter(r =>
    r.department === 'Operations' && effectiveProjects.includes(r.projectId ?? ''),
  ), [effectiveProjects])

  const visibleBills   = useMemo(() => raBills.filter(b => effectiveProjects.includes(b.projectId)), [effectiveProjects])
  const visibleGates   = useMemo(() => clientGates.filter(g => effectiveProjects.includes(g.projectId)), [effectiveProjects])
  const visibleVOs     = useMemo(() => variationOrders.filter(v => effectiveProjects.includes(v.projectId)), [effectiveProjects])
  const visibleBlockers = useMemo(() => criticalBlockers.filter(b => effectiveProjects.includes(b.projectId)), [effectiveProjects])
  const visibleMonsoon = useMemo(() => monsoonRisks.filter(m => effectiveProjects.includes(m.projectId)), [effectiveProjects])

  const criticalAlertCount = useMemo(() => opsAlerts.filter(a => a.severity === 'critical').length, [opsAlerts])
  const health = useMemo(() => computeHealthScore(allVisible, criticalAlertCount), [allVisible, criticalAlertCount])

  const onTrack  = allVisible.filter(p => p.status === 'on-track').length
  const atRisk   = allVisible.filter(p => p.status === 'at-risk').length
  const delayed  = allVisible.filter(p => p.status === 'delayed').length
  const totalCrew = allVisible.reduce((s, p) => s + p.crewCount, 0)
  const totalEquip = allVisible.reduce((s, p) => s + p.equipmentCount, 0)
  const avgProgress = allVisible.length
    ? Math.round(allVisible.reduce((s, p) => s + p.progress, 0) / allVisible.length)
    : 0
  const productivityIndex = totalEquip > 0 ? (totalCrew / totalEquip).toFixed(1) : '–'
  const billsAtRisk = visibleBills.filter(b => b.daysStuck >= 30).reduce((s, b) => s + b.amount, 0)

  // Chart series — only for visible projects
  const chartSeries = allVisible.map(p => ({
    key: PROJECT_KEY[p.id] ?? p.id.toLowerCase().replace(/-.*/, ''),
    label: p.id,
    color: PROJECT_COLOR[p.id] ?? '#64748B',
  }))

  const voStats = {
    total: visibleVOs.reduce((s, v) => s + v.value, 0),
    pending: visibleVOs.filter(v => v.status === 'pending-approval' || v.status === 'submitted').reduce((s, v) => s + v.value, 0),
    approved: visibleVOs.filter(v => v.status === 'approved').reduce((s, v) => s + v.value, 0),
  }

  const BLOCKER_TYPE_ICON: Record<string, React.ElementType> = {
    material: Truck, 'client-approval': Clock, resource: Users, design: Activity, weather: CloudRain,
  }
  const BLOCKER_TYPE_COLOR: Record<string, string> = {
    material: 'text-necl-warning', 'client-approval': 'text-necl-critical', resource: 'text-necl-accent',
    design: 'text-purple-400', weather: 'text-cyan-400',
  }

  const GATE_PRIORITY_STYLES: Record<string, string> = {
    critical: 'text-necl-critical border-necl-critical/30 bg-necl-critical/10',
    high:     'text-necl-warning  border-necl-warning/30  bg-necl-warning/10',
    medium:   'text-necl-accent   border-necl-accent/25   bg-necl-accent/8',
  }

  const MONSOON_COLOR: Record<string, { badge: string; bar: string }> = {
    high:   { badge: 'text-necl-critical border-necl-critical/30 bg-necl-critical/10', bar: 'bg-necl-critical' },
    medium: { badge: 'text-necl-warning  border-necl-warning/30  bg-necl-warning/10',  bar: 'bg-necl-warning'  },
    low:    { badge: 'text-necl-success  border-necl-success/30  bg-necl-success/10',  bar: 'bg-necl-success'  },
  }

  const VO_STATUS_STYLES: Record<string, string> = {
    'submitted':        'text-necl-muted   border-necl-muted/30   bg-[var(--color-necl-border)]/50',
    'pending-approval': 'text-necl-warning border-necl-warning/30 bg-necl-warning/10',
    'approved':         'text-necl-accent  border-necl-accent/30  bg-necl-accent/10',
    'mobilized':        'text-necl-success border-necl-success/30 bg-necl-success/10',
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Layers className="w-5 h-5 text-necl-accent" />
          <div>
            <h1 className="text-2xl font-bold text-necl-text">Operations</h1>
            <p className="text-sm text-necl-muted mt-0.5">
              {allVisible.length} projects · {totalCrew.toLocaleString('en-IN')} crew · ₹{(billsAtRisk / 10000000).toFixed(1)}Cr bills at risk
            </p>
          </div>
        </div>
      </div>

      {/* ── Portfolio Health + Billing Pipeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Health Score */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Portfolio Health</h2>
            <span className="text-[10px] text-necl-muted ml-1">Composite score</span>
          </div>
          <HealthGauge score={health.total} breakdown={{ schedule: health.schedule, cost: health.cost, safety: health.safety, quality: health.quality }} />
        </div>

        {/* Billing Pipeline */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-necl-accent" />
              <h2 className="text-sm font-bold text-necl-text">Billing Pipeline</h2>
              <span className="text-[10px] text-necl-muted">Running Account Bills</span>
            </div>
            {billsAtRisk > 0 && (
              <span className="text-[10px] font-bold text-necl-critical bg-necl-critical/10 border border-necl-critical/30 px-2 py-1 rounded-lg">
                ₹{(billsAtRisk / 10000000).toFixed(1)}Cr stuck &gt;30d
              </span>
            )}
          </div>
          <BillingPipeline bills={visibleBills} />
          <p className="text-[10px] text-necl-muted mt-3 text-right">
            Total receivables pending: ₹{(visibleBills.filter(b => b.status !== 'payment-received').reduce((s, b) => s + b.amount, 0) / 10000000).toFixed(1)}Cr
          </p>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPITile label="Active Projects" value={String(allVisible.length)}
          subtitle={`${onTrack} on track · ${atRisk} at risk · ${delayed} delayed`}
          status={delayed > 0 ? 'red' : atRisk > 0 ? 'amber' : 'green'}
          sparklineData={[6, 7, 7, 8, 8, 8, allVisible.length]}
        />
        <KPITile label="Avg Progress" value={`${avgProgress}%`}
          subtitle="Portfolio weighted"
          status="blue" trend="up" trendText="↑ 1% this week" trendPositive
          sparklineData={[60, 62, 64, 65, 66, 67, avgProgress]}
          sparklineColor="#10B981"
        />
        <KPITile label="Total Crew" value={totalCrew.toLocaleString('en-IN')}
          subtitle={`${totalEquip} machines deployed`}
          status="green"
          sparklineData={[2200, 2300, 2350, 2400, 2420, 2440, totalCrew]}
        />
        <KPITile label="Schedule Health"
          value={`${allVisible.filter(p => p.scheduleVarianceDays <= 0).length}/${allVisible.length}`}
          subtitle={`${allVisible.filter(p => p.scheduleVarianceDays > 0).length} behind schedule`}
          status={allVisible.some(p => p.scheduleVarianceDays > 60) ? 'red' : 'amber'}
          sparklineData={[5, 5, 6, 6, 5, 5, 5]}
        />
        <KPITile label="Productivity Index"
          value={productivityIndex}
          subtitle={`Crew/machine ratio · target ≥9`}
          status={parseFloat(productivityIndex) >= 9 ? 'green' : 'amber'}
          trend="stable" trendText="vs last week"
          sparklineData={[8.8, 9.0, 9.1, 9.2, 9.0, 9.1, parseFloat(productivityIndex)]}
          sparklineColor="#8B5CF6"
        />
        <KPITile label="Safety Index"
          value="0 LTIs"
          subtitle="3 near-misses · 8-month streak"
          status="amber"
          sparklineData={[0, 0, 0, 1, 0, 0, 0]}
          sparklineColor="#F59E0B"
        />
      </div>

      {/* ── Status Filter Tabs ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'on-track', 'at-risk', 'delayed'] as StatusFilter[]).map(f => {
          const count = f === 'all' ? allVisible.length : allVisible.filter(p => p.status === f).length
          const styles = STATUS_TAB_STYLES[f]
          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                statusFilter === f ? styles.active : styles.base,
              )}
            >
              {f === 'all' ? 'All' : f === 'on-track' ? 'On Track' : f === 'at-risk' ? 'At Risk' : 'Delayed'}
              <span className="ml-1.5 opacity-70">({count})</span>
            </button>
          )
        })}
        {statusFilter !== 'all' && (
          <span className="text-[11px] text-necl-muted">
            Showing {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── What's Blocking Us + Client Approval Gates ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Blockers */}
        <div className="rounded-xl border border-necl-critical/30 bg-[var(--color-necl-surface)]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-critical/20">
            <Zap className="w-4 h-4 text-necl-critical" />
            <h2 className="text-sm font-bold text-necl-text">What&apos;s Blocking Us</h2>
            {visibleBlockers.length > 0 && (
              <span className="ml-auto text-[10px] font-bold text-necl-critical bg-necl-critical/10 border border-necl-critical/30 px-2 py-0.5 rounded-full">
                {visibleBlockers.reduce((s, b) => s + b.daysImpact, 0)}d at risk
              </span>
            )}
          </div>
          <div className="divide-y divide-[var(--color-necl-border)]/60">
            {visibleBlockers.length === 0
              ? <p className="text-sm text-necl-muted p-6 text-center">No critical blockers for selected projects</p>
              : visibleBlockers.map(b => {
                  const Icon = BLOCKER_TYPE_ICON[b.type] ?? AlertTriangle
                  const color = BLOCKER_TYPE_COLOR[b.type] ?? 'text-necl-muted'
                  return (
                    <div key={b.id} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-necl-critical/10 border border-necl-critical/30 flex items-center justify-center flex-shrink-0">
                          <Icon className={cn('w-4 h-4', color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-necl-accent">{b.projectId}</span>
                            <span className="text-[9px] font-bold text-necl-critical bg-necl-critical/10 border border-necl-critical/30 px-1.5 py-0.5 rounded">{b.daysImpact}d impact</span>
                            <span className="text-[9px] text-necl-muted capitalize">{b.type.replace('-', ' ')}</span>
                          </div>
                          <p className="text-xs font-semibold text-necl-text mb-1">{b.blockingActivity}</p>
                          <p className="text-[10px] text-necl-muted leading-relaxed mb-2">{b.reason}</p>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-necl-muted">Owner: <span className="text-necl-text font-medium">{b.owner}</span></span>
                            <span className="text-necl-warning">Target: {new Date(b.targetResolution).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
            }
          </div>
        </div>

        {/* Client Approval Gates */}
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-necl-border)]">
            <Clock className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">Client Approval Gates</h2>
            {visibleGates.length > 0 && (
              <span className="ml-auto text-[10px] text-necl-muted">{visibleGates.length} pending</span>
            )}
          </div>
          <div className="divide-y divide-[var(--color-necl-border)]/60">
            {visibleGates.length === 0
              ? <p className="text-sm text-necl-muted p-6 text-center">No pending client approvals</p>
              : visibleGates.sort((a, b) => b.daysWaiting - a.daysWaiting).map(g => (
                  <div key={g.id} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-necl-accent">{g.projectId}</span>
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', GATE_PRIORITY_STYLES[g.priority])}>
                            {g.priority.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-necl-muted">{g.client}</span>
                          <span className={cn('ml-auto text-[10px] font-bold', g.daysWaiting >= 30 ? 'text-necl-critical' : g.daysWaiting >= 14 ? 'text-necl-warning' : 'text-necl-muted')}>
                            {g.daysWaiting}d waiting
                          </span>
                        </div>
                        <p className="text-xs font-medium text-necl-text mb-0.5">{g.title}</p>
                        <p className="text-[10px] text-necl-muted">Blocks: {g.blocksActivity}</p>
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>

      {/* ── Milestone Gantt ── */}
      <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-necl-border)]">
          <Activity className="w-4 h-4 text-necl-accent" />
          <h2 className="text-sm font-bold text-necl-text">Milestone Timeline</h2>
          <span className="text-[10px] text-necl-muted">Next 90 days — hover markers for detail</span>
        </div>
        <div className="p-5">
          <MilestoneGantt visibleProjects={statusFilter === 'all' ? allVisible : visibleProjects} />
        </div>
      </div>

      {/* ── Schedule Recovery + Velocity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-necl-border)]">
            <TrendingDown className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">Schedule Recovery</h2>
            <span className="text-[10px] text-necl-muted">At-risk & delayed only</span>
          </div>
          <div className="p-4">
            <ScheduleRecovery visibleProjects={statusFilter === 'all' ? allVisible : visibleProjects} />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-[var(--color-necl-border)]">
            <TrendingUp className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Weekly Velocity</h2>
            <span className="text-[10px] text-necl-muted">Progress % added per week · 6-week window</span>
          </div>
          <div className="p-4">
            <VelocityPanel visibleProjects={statusFilter === 'all' ? allVisible : visibleProjects} />
          </div>
        </div>
      </div>

      {/* ── Variation Order Tracker ── */}
      <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Variation Order Tracker</h2>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-necl-muted">Total: <span className="font-bold text-necl-text">₹{(voStats.total / 10000000).toFixed(1)}Cr</span></span>
            <span className="text-necl-warning">Pending: <span className="font-bold">₹{(voStats.pending / 10000000).toFixed(1)}Cr</span></span>
            <span className="text-necl-success">Approved: <span className="font-bold">₹{(voStats.approved / 10000000).toFixed(1)}Cr</span></span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--color-necl-border)] bg-[var(--color-necl-bg)]/40">
                {['VO ID', 'Project', 'Description', 'Type', 'Value', 'Status', 'Submitted'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-necl-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleVOs.map(vo => (
                <tr key={vo.id} className="border-b border-[var(--color-necl-border)]/60 last:border-0 hover:bg-necl-accent/5 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-necl-muted text-[10px]">{vo.id.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-necl-accent text-[10px]">{vo.projectId}</span>
                  </td>
                  <td className="px-4 py-3 text-necl-text max-w-[240px]">
                    <p className="truncate" title={vo.title}>{vo.title}</p>
                  </td>
                  <td className="px-4 py-3 text-necl-muted capitalize">{vo.type.replace(/-/g, ' ')}</td>
                  <td className="px-4 py-3 font-bold text-necl-text">₹{(vo.value / 10000000).toFixed(1)}Cr</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', VO_STATUS_STYLES[vo.status])}>
                      {vo.status === 'pending-approval' ? 'Pending Approval' : vo.status.charAt(0).toUpperCase() + vo.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-necl-muted">
                    {new Date(vo.submittedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Monsoon Risk ── */}
      <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-necl-text">Monsoon Risk</h2>
            <span className="text-[10px] text-necl-muted">Jun–Sep 2026 · Season impact by site</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            {(['high', 'medium', 'low'] as const).map(e => {
              const count = visibleMonsoon.filter(m => m.exposureLevel === e).length
              return count > 0 ? (
                <span key={e} className={cn('px-2 py-0.5 rounded-full border font-semibold', MONSOON_COLOR[e].badge)}>
                  {count} {e}
                </span>
              ) : null
            })}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-necl-border)]">
          {visibleMonsoon.sort((a, b) => {
            const order = { high: 0, medium: 1, low: 2 }
            return order[a.exposureLevel] - order[b.exposureLevel]
          }).map(m => {
            const styles = MONSOON_COLOR[m.exposureLevel]
            return (
              <div key={m.projectId} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-necl-accent">{m.projectId}</span>
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border', styles.badge)}>
                    {m.exposureLevel.toUpperCase()}
                  </span>
                </div>
                {/* Days affected bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-[9px] text-necl-muted mb-1">
                    <span>{m.daysAffected} days affected</span>
                    <span className={cn('font-semibold', m.mitigationStatus === 'in-place' ? 'text-necl-success' : m.mitigationStatus === 'partial' ? 'text-necl-warning' : 'text-necl-critical')}>
                      {m.mitigationStatus === 'in-place' ? '✓ Mitigated' : m.mitigationStatus === 'partial' ? '⚡ Partial' : '✗ None'}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-necl-border)] rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', styles.bar)} style={{ width: `${(m.daysAffected / 90) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-0.5">
                  {m.activitiesAtRisk.slice(0, 2).map(a => (
                    <p key={a} className="text-[10px] text-necl-muted truncate">· {a}</p>
                  ))}
                  {m.activitiesAtRisk.length > 2 && (
                    <p className="text-[9px] text-necl-muted">+{m.activitiesAtRisk.length - 2} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Progress Chart (filtered) ── */}
      <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
        <h2 className="text-sm font-bold text-necl-text mb-4">Weekly Progress — Last 6 Weeks</h2>
        <NECLAreaChart
          data={progressHistory}
          xKey="month"
          series={chartSeries}
          height={200}
          formatValue={v => `${v}%`}
        />
      </div>

      {/* ── Project Status Table ── */}
      <AnimatePresence mode="wait">
        {visibleProjects.length > 0 && (
          <motion.div
            key={statusFilter}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
              <h2 className="text-sm font-bold text-necl-text">Project Status</h2>
              <span className="text-[10px] text-necl-muted">{visibleProjects.length} projects</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-necl-border)] bg-[var(--color-necl-bg)]/40">
                    {['Project', 'Type', 'PM', 'Progress', 'Schedule', 'Cost Var.', 'Crew', 'Equipment', 'Ratio', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleProjects.map(p => {
                    const STATUS_BAR = { 'on-track': 'bg-necl-success', 'at-risk': 'bg-necl-warning', 'delayed': 'bg-necl-critical' }
                    return (
                      <tr key={p.id} className="border-b border-[var(--color-necl-border)]/50 last:border-0 hover:bg-necl-accent/5 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/project/${p.id}`} className="font-semibold text-necl-accent hover:underline text-xs">{p.id}</Link>
                          <p className="text-[10px] text-necl-muted truncate max-w-[130px]">{p.location}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-necl-muted">{p.type}</td>
                        <td className="px-4 py-3 text-xs text-necl-text">{p.pm}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-[var(--color-necl-border)] rounded-full overflow-hidden flex-shrink-0">
                              <div className={cn('h-full rounded-full', STATUS_BAR[p.status])} style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-necl-text">{p.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-semibold', p.scheduleVarianceDays > 30 ? 'text-necl-critical' : p.scheduleVarianceDays > 0 ? 'text-necl-warning' : 'text-necl-success')}>
                            {p.scheduleVarianceDays > 0 ? `+${p.scheduleVarianceDays}d` : `${p.scheduleVarianceDays}d`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-semibold', p.costVariance > 5 ? 'text-necl-critical' : p.costVariance > 0 ? 'text-necl-warning' : 'text-necl-success')}>
                            {p.costVariance > 0 ? `+${p.costVariance}%` : `${p.costVariance}%`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-necl-text">{p.crewCount}</td>
                        <td className="px-4 py-3 text-xs text-necl-text">{p.equipmentCount}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-bold', (p.crewCount / p.equipmentCount) >= 9 ? 'text-necl-success' : 'text-necl-warning')}>
                            {(p.crewCount / p.equipmentCount).toFixed(1)}x
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusPill status={p.status} size="sm" /></td>
                        <td className="px-4 py-3">
                          <Link href={`/project/${p.id}`} className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">View →</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        {visibleProjects.length === 0 && statusFilter !== 'all' && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-dashed border-[var(--color-necl-border)] p-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-necl-success mx-auto mb-2" />
            <p className="text-sm font-semibold text-necl-success">No {statusFilter.replace('-', ' ')} projects</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Alerts + Recommendations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
            <h2 className="text-sm font-bold text-necl-text">Operations Alerts</h2>
            <Link href="/alerts" className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">All alerts →</Link>
          </div>
          <div className="p-3 space-y-2">
            {opsAlerts.slice(0, 5).map(a => (
              <AlertItem key={a.id} alert={a} onView={setSelectedAlert} compact />
            ))}
            {opsAlerts.length === 0 && <p className="text-sm text-necl-muted p-4 text-center">No active operations alerts</p>}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-necl-text">Recommendations</h2>
          {opsRecs.slice(0, 2).map(r => <PrescriptiveCard key={r.id} recommendation={r} />)}
          {opsRecs.length === 0 && (
            <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-6 text-center">
              <p className="text-sm text-necl-muted">No recommendations for Operations this period</p>
            </div>
          )}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
