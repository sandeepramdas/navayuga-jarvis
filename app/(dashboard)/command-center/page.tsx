'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Activity, TrendingUp, GitBranch, Radio, RefreshCw,
  AlertTriangle, CheckCircle2, Clock, IndianRupee, Package,
  Zap, Eye, EyeOff, ChevronRight, Flame, Users, Truck,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { ForecastCard } from '@/components/ui/ForecastCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { alerts } from '@/lib/mock-data/alerts'
import { forecasts, recommendations } from '@/lib/mock-data/predictions'
import { projects } from '@/lib/mock-data/projects'
import { purchaseOrders } from '@/lib/mock-data/procurement'
import { getEventsForProjects, formatMinutesAgo, type ActivityEvent } from '@/lib/mock-data/activity-feed'
import type { Alert } from '@/lib/mock-data/alerts'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

type DecisionUrgency = 'critical' | 'high' | 'medium'
interface Decision {
  id: string
  urgency: DecisionUrgency
  category: 'alert' | 'cost' | 'schedule' | 'approval' | 'supply'
  title: string
  detail: string
  action: string
  projectId?: string
  href: string
}

interface ResourceConflict {
  id: string
  resource: string
  projects: string[]
  type: 'Equipment' | 'Crew'
  window: string
  severity: 'high' | 'medium'
  detail: string
}

// ── Static mocked resource conflicts ─────────────────────────────────────────

const ALL_CONFLICTS: ResourceConflict[] = [
  {
    id: 'rc-1', resource: 'Hydraulic Excavator 30T (×2)', projects: ['HYD-M3', 'BMRC-E2'],
    type: 'Equipment', window: 'Jul 4–6', severity: 'high',
    detail: 'Both sites have pile cap work scheduled. Only 2 units available in fleet.',
  },
  {
    id: 'rc-2', resource: 'Structural Engineering Team (12 pax)', projects: ['KDSP-B1', 'CHN-FLY'],
    type: 'Crew', window: 'Jul 12', severity: 'medium',
    detail: 'Concurrent inspection deadlines. Team cannot split between sites same day.',
  },
  {
    id: 'rc-3', resource: 'Concrete Pump Units (×3)', projects: ['NH-44X', 'RLWY-G4'],
    type: 'Equipment', window: 'Jul 18–20', severity: 'high',
    detail: 'Both projects scheduled major pours. Fleet has 3 units; both need minimum 2.',
  },
  {
    id: 'rc-4', resource: 'QC Lab Team', projects: ['MUM-CST', 'VIZG-P2'],
    type: 'Crew', window: 'Jul 25–27', severity: 'medium',
    detail: 'Concrete mix certification required at both sites before batch approval.',
  },
]

// ── Severity styles ───────────────────────────────────────────────────────────

const SEV_STYLES: Record<ActivityEvent['severity'], { dot: string; badge: string; text: string }> = {
  critical: { dot: 'bg-necl-critical', badge: 'bg-necl-critical/10 border-necl-critical/30 text-necl-critical', text: 'text-necl-critical' },
  high:     { dot: 'bg-necl-warning',  badge: 'bg-necl-warning/10 border-necl-warning/30 text-necl-warning',   text: 'text-necl-warning'  },
  medium:   { dot: 'bg-necl-accent',   badge: 'bg-necl-accent/10 border-necl-accent/30 text-necl-accent',      text: 'text-necl-accent'   },
  info:     { dot: 'bg-necl-muted',    badge: 'bg-[var(--color-necl-border)]/50 border-transparent text-necl-muted', text: 'text-necl-muted' },
  success:  { dot: 'bg-necl-success',  badge: 'bg-necl-success/10 border-necl-success/30 text-necl-success',   text: 'text-necl-success'  },
}
const TYPE_LABELS: Record<ActivityEvent['type'], string> = {
  alert: 'Alert', update: 'Update', procurement: 'Procurement',
  milestone: 'Milestone', system: 'System', crew: 'Crew', finance: 'Finance',
}

const URGENCY_CONFIG: Record<DecisionUrgency, { border: string; bg: string; badge: string; text: string; icon: React.ElementType }> = {
  critical: { border: 'border-necl-critical/40', bg: 'bg-necl-critical/5',   badge: 'bg-necl-critical/15 text-necl-critical border-necl-critical/30',  text: 'text-necl-critical',  icon: Flame },
  high:     { border: 'border-necl-warning/40',  bg: 'bg-necl-warning/5',    badge: 'bg-necl-warning/15  text-necl-warning  border-necl-warning/30',    text: 'text-necl-warning',   icon: AlertTriangle },
  medium:   { border: 'border-necl-accent/30',   bg: 'bg-necl-accent/5',     badge: 'bg-necl-accent/10   text-necl-accent   border-necl-accent/25',     text: 'text-necl-accent',    icon: Clock },
}

const CATEGORY_ICON: Record<Decision['category'], React.ElementType> = {
  alert: AlertTriangle, cost: IndianRupee, schedule: GitBranch,
  approval: CheckCircle2, supply: Package,
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LiveActivityFeed({ events, tick }: { events: ActivityEvent[]; tick: number }) {
  return (
    <div className="space-y-0">
      <AnimatePresence initial={false}>
        {events.map(ev => {
          const sev = SEV_STYLES[ev.severity]
          return (
            <motion.div key={ev.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 px-4 py-3 border-b border-[var(--color-necl-border)]/60 last:border-0 hover:bg-necl-accent/3 transition-colors"
            >
              <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', sev.dot, ev.severity === 'critical' && 'animate-pulse')} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn('text-xs font-semibold', sev.text)}>{ev.title}</span>
                    {ev.projectId !== 'PORTFOLIO' && (
                      <span className="text-[9px] font-bold text-necl-muted bg-[var(--color-necl-border)] px-1.5 py-0.5 rounded">{ev.projectId}</span>
                    )}
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded border', sev.badge)}>{TYPE_LABELS[ev.type]}</span>
                  </div>
                  <span className="text-[10px] text-necl-muted flex-shrink-0 tabular-nums">{formatMinutesAgo(ev.minutesAgo, tick * 20)}</span>
                </div>
                <p className="text-[11px] text-necl-muted mt-0.5 leading-relaxed">{ev.detail}</p>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function PortfolioRiskMatrix({ visibleProjects }: { visibleProjects: typeof projects }) {
  const STATUS_HEX: Record<string, string> = { 'on-track': '#10B981', 'at-risk': '#F59E0B', 'delayed': '#EF4444' }

  const W = 300, H = 200
  const ML = 20, MT = 12, MR = 6, MB = 18
  const PW = W - ML - MR, PH = H - MT - MB

  // Dynamic axis range: expand to data extents + 20% padding so dots spread across the plot
  const xs = visibleProjects.map(p => p.scheduleVarianceDays)
  const ys = visibleProjects.map(p => p.costVariance)
  const xSpan = Math.max(...xs) - Math.min(...xs)
  const ySpan = Math.max(...ys) - Math.min(...ys)
  const xPad  = Math.max(12, xSpan * 0.22)
  const yPad  = Math.max(2,  ySpan * 0.22)
  const xMin  = Math.min(-8, Math.min(...xs) - xPad)
  const xMax  = Math.max(8,  Math.max(...xs) + xPad)
  const yMin  = Math.min(-1, Math.min(...ys) - yPad)
  const yMax  = Math.max(2,  Math.max(...ys) + yPad)

  const toX = (v: number) => ML + ((v - xMin) / (xMax - xMin)) * PW
  const toY = (v: number) => MT + PH - ((v - yMin) / (yMax - yMin)) * PH
  const zX = toX(0), zY = toY(0)

  // Pre-compute dot positions
  const dots = visibleProjects.map(p => ({
    id: p.id,
    cx: toX(p.scheduleVarianceDays),
    cy: toY(p.costVariance),
    color: STATUS_HEX[p.status] ?? '#64748B',
  }))

  // Collision-aware label placement: try 6 candidate offsets, pick first with no clash
  const placed: { x: number; y: number }[] = []
  const CANDS = [
    { dx: 0,   dy: -10, ta: 'middle' as const },
    { dx: 10,  dy: -6,  ta: 'start'  as const },
    { dx: -10, dy: -6,  ta: 'end'    as const },
    { dx: 0,   dy: 12,  ta: 'middle' as const },
    { dx: 10,  dy: 6,   ta: 'start'  as const },
    { dx: -10, dy: 6,   ta: 'end'    as const },
  ]
  const dotLabels = dots.map(d => {
    for (const c of CANDS) {
      const lx = d.cx + c.dx, ly = d.cy + c.dy
      if (!placed.some(p => Math.abs(p.x - lx) < 20 && Math.abs(p.y - ly) < 9)) {
        placed.push({ x: lx, y: ly })
        return { x: lx, y: ly, ta: c.ta }
      }
    }
    const fb = { x: d.cx, y: d.cy - 10 }
    placed.push(fb)
    return { ...fb, ta: 'middle' as const }
  })

  return (
    <div className="relative w-full" style={{ paddingBottom: '68%' }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full">
        {/* Quadrant fills */}
        <rect x={ML}  y={MT}  width={zX - ML}       height={zY - MT}      fill="#F59E0B" fillOpacity="0.06" />
        <rect x={zX}  y={MT}  width={ML + PW - zX}  height={zY - MT}      fill="#EF4444" fillOpacity="0.09" />
        <rect x={ML}  y={zY}  width={zX - ML}       height={MT + PH - zY} fill="#10B981" fillOpacity="0.09" />
        <rect x={zX}  y={zY}  width={ML + PW - zX}  height={MT + PH - zY} fill="#2563EB" fillOpacity="0.04" />

        {/* Quadrant labels */}
        <text x={ML + 3} y={MT + 9}     fill="#F59E0B" fontSize="6"   fontWeight="700" opacity="0.7">OVER BUDGET</text>
        <text x={zX + 3} y={MT + 9}     fill="#EF4444" fontSize="6"   fontWeight="700" opacity="0.7">DANGER ZONE</text>
        <text x={ML + 3} y={H - MB - 3} fill="#10B981" fontSize="6"   fontWeight="700" opacity="0.7">SAFE</text>
        <text x={zX + 3} y={H - MB - 3} fill="#2563EB" fontSize="6"   fontWeight="600" opacity="0.6">AHEAD, UNDER</text>

        {/* Zero-axis grid lines */}
        <line x1={ML} y1={zY} x2={ML + PW} y2={zY}     stroke="#475569" strokeWidth="0.6" strokeDasharray="4,3" />
        <line x1={zX} y1={MT} x2={zX}      y2={MT + PH} stroke="#475569" strokeWidth="0.6" strokeDasharray="4,3" />

        {/* Axis labels */}
        <text x={ML + PW / 2} y={H - 2} textAnchor="middle" fill="#64748B" fontSize="5.5">
          ← ahead · Schedule variance · behind →
        </text>
        <text x={7} y={MT + PH / 2} textAnchor="middle" fill="#64748B" fontSize="5.5"
          transform={`rotate(-90 7 ${MT + PH / 2})`}>
          ↑ over · Cost % · under ↓
        </text>

        {/* Project dots + collision-aware labels */}
        {dots.map((d, i) => {
          const lbl = dotLabels[i]
          const idW = d.id.length * 3.5 + 4
          const rx  = lbl.ta === 'middle' ? lbl.x - idW / 2
                    : lbl.ta === 'start'  ? lbl.x - 1
                    : lbl.x - idW - 1
          return (
            <g key={d.id}>
              <circle cx={d.cx} cy={d.cy} r="10" fill={d.color} fillOpacity="0.15" />
              <circle cx={d.cx} cy={d.cy} r="5.5" fill={d.color} fillOpacity="0.92" />
              <rect x={rx} y={lbl.y - 6.5} width={idW} height={8} rx="2" fill="#0F172A" fillOpacity="0.68" />
              <text x={lbl.x} y={lbl.y} textAnchor={lbl.ta} fill="#E2E8F0" fontSize="5" fontWeight="700">
                {d.id}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function BurnRateCard({ p, exceptionOnly }: { p: typeof projects[0]; exceptionOnly: boolean }) {
  // Burn rate: assume ~48-month project; elapsed months ≈ progress * 0.48
  const monthsElapsed = Math.max(1, (p.progress / 100) * 48)
  const monthlyBurn = p.actual / monthsElapsed
  const contingency = p.budget * 0.10
  const overrun = Math.max(0, p.actual - p.budget)
  const contingencyRemaining = contingency - overrun
  const weeksLeft = contingencyRemaining > 0 ? Math.round((contingencyRemaining / monthlyBurn) * 4.33) : 0
  const breached = contingencyRemaining <= 0
  const spendPct = Math.min(115, (p.actual / (p.budget * 1.1)) * 100)
  const isOk = p.costVariance <= 0

  if (exceptionOnly && isOk) return null

  return (
    <div className={cn(
      'rounded-xl border p-4 transition-all',
      breached ? 'border-necl-critical/50 bg-necl-critical/5' :
      p.costVariance > 5 ? 'border-necl-warning/40 bg-necl-warning/5' :
      isOk ? 'border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]' :
      'border-necl-warning/40 bg-[var(--color-necl-surface)]',
    )}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-necl-accent">{p.id}</span>
            {breached && (
              <span className="text-[9px] font-bold text-necl-critical bg-necl-critical/15 border border-necl-critical/30 px-1.5 py-0.5 rounded-full">CONTINGENCY BREACHED</span>
            )}
            {!breached && weeksLeft <= 8 && p.costVariance > 0 && (
              <span className="text-[9px] font-bold text-necl-warning bg-necl-warning/15 border border-necl-warning/30 px-1.5 py-0.5 rounded-full">{weeksLeft}w left</span>
            )}
          </div>
          <p className="text-[10px] text-necl-muted mt-0.5 truncate max-w-[180px]">{p.name}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={cn('text-sm font-bold', isOk ? 'text-necl-success' : breached ? 'text-necl-critical' : 'text-necl-warning')}>
            {p.costVariance > 0 ? '+' : ''}{p.costVariance}%
          </p>
          <p className="text-[9px] text-necl-muted">variance</p>
        </div>
      </div>

      {/* Fuel gauge bar */}
      <div className="relative mb-2">
        <div className="w-full h-4 rounded-full bg-[var(--color-necl-border)] overflow-hidden relative">
          {/* Contingency zone (yellow 90%–110%) */}
          <div className="absolute top-0 right-0 h-full w-[9%] bg-necl-warning/30" style={{ left: '91%' }} />
          {/* Actual spend fill */}
          <div
            className={cn('h-full rounded-full transition-all duration-700',
              breached ? 'bg-necl-critical' : spendPct > 95 ? 'bg-necl-warning' : 'bg-necl-accent',
            )}
            style={{ width: `${spendPct}%` }}
          />
          {/* Budget line at 100% */}
          <div className="absolute top-0 h-full w-px bg-white/60" style={{ left: '90.9%' }} />
        </div>
        {/* Labels */}
        <div className="flex justify-between mt-1 text-[9px] text-necl-muted">
          <span>₹0</span>
          <span className="text-necl-muted">Budget</span>
          <span className={cn(breached ? 'text-necl-critical' : 'text-necl-warning')}>+10% contingency</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--color-necl-border)]/60">
        <div>
          <p className="text-[9px] text-necl-muted">Spent</p>
          <p className="text-[10px] font-bold text-necl-text">₹{(p.actual / 10000000).toFixed(1)}Cr</p>
        </div>
        <div>
          <p className="text-[9px] text-necl-muted">Budget</p>
          <p className="text-[10px] font-bold text-necl-text">₹{(p.budget / 10000000).toFixed(1)}Cr</p>
        </div>
        <div>
          <p className="text-[9px] text-necl-muted">{breached ? 'Overrun' : isOk ? 'Saved' : 'Runway'}</p>
          <p className={cn('text-[10px] font-bold', breached ? 'text-necl-critical' : isOk ? 'text-necl-success' : weeksLeft <= 8 ? 'text-necl-warning' : 'text-necl-text')}>
            {breached ? `₹${((Math.abs(contingencyRemaining)) / 100000).toFixed(0)}L breach` : isOk ? `₹${(Math.abs(p.actual - p.budget) / 100000).toFixed(0)}L` : `${weeksLeft}w`}
          </p>
        </div>
      </div>
    </div>
  )
}

// Deterministic tick-based fluctuation
function tickValue(base: number, tick: number, amplitude: number, seed: number): number {
  return base + Math.round(Math.sin(tick * 0.8 + seed) * amplitude * 10) / 10
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const { role, selectedProjects, liveTick, recommendationStates, alertStates } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [exceptionOnly, setExceptionOnly] = useState(false)

  const isSiteManager = role === 'site-manager'
  const effectiveProjects = isSiteManager ? ['KDSP-B1'] : selectedProjects

  const filteredProjects = useMemo(() => projects.filter(p => effectiveProjects.includes(p.id)), [effectiveProjects])
  const totalBudget  = useMemo(() => filteredProjects.reduce((s, p) => s + p.budget, 0), [filteredProjects])
  const totalActual  = useMemo(() => filteredProjects.reduce((s, p) => s + p.actual, 0), [filteredProjects])
  const totalCrew    = useMemo(() => filteredProjects.reduce((s, p) => s + p.crewCount, 0), [filteredProjects])
  const atRiskCount  = useMemo(() => filteredProjects.filter(p => p.status !== 'on-track').length, [filteredProjects])
  const avgProgress  = useMemo(() => filteredProjects.length ? Math.round(filteredProjects.reduce((s, p) => s + p.progress, 0) / filteredProjects.length) : 0, [filteredProjects])
  const costVariance = useMemo(() => totalBudget > 0 ? ((totalActual - totalBudget) / totalBudget) * 100 : 0, [totalBudget, totalActual])

  const liveFleetUtil  = tickValue(74, liveTick, 2, 1.2)
  const liveCrew       = Math.round(tickValue(totalCrew, liveTick, totalCrew * 0.005, 2.4))
  const liveAttendance = tickValue(94.2, liveTick, 1.5, 3.6)

  const liveEvents = useMemo(() => getEventsForProjects(effectiveProjects, liveTick), [effectiveProjects, liveTick])

  const projectAlerts = useMemo(
    () => isSiteManager
      ? alerts.filter(a => a.projectId === 'KDSP-B1')
      : alerts.filter(a => effectiveProjects.includes(a.projectId ?? '')),
    [isSiteManager, effectiveProjects],
  )

  const visibleAlerts = useMemo(
    () => exceptionOnly
      ? projectAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').slice(0, 10)
      : projectAlerts.slice(0, 12),
    [projectAlerts, exceptionOnly],
  )

  const visibleForecasts = useMemo(
    () => {
      const pool = isSiteManager
        ? forecasts.filter(f => f.projectId === 'KDSP-B1')
        : forecasts.filter(f => !f.projectId || effectiveProjects.includes(f.projectId))
      return exceptionOnly
        ? pool.filter(f => f.severity === 'critical' || f.severity === 'high').slice(0, 6)
        : pool.slice(0, 7)
    },
    [isSiteManager, effectiveProjects, exceptionOnly],
  )

  const visibleRecs = useMemo(
    () => isSiteManager
      ? recommendations.filter(r => r.projectId === 'KDSP-B1').slice(0, 3)
      : recommendations.filter(r => effectiveProjects.includes(r.projectId)).slice(0, 3),
    [isSiteManager, effectiveProjects],
  )

  // ── Pending approvals ──────────────────────────────────────────────────────
  const pendingApprovals = useMemo(() => {
    const pendingPOs = purchaseOrders.filter(po =>
      po.status === 'pending' &&
      po.totalValue >= 5000000 &&
      effectiveProjects.includes(po.projectId),
    )
    const unactionedRecs = recommendations.filter(r =>
      effectiveProjects.includes(r.projectId) &&
      !recommendationStates[r.id],
    )
    const criticalUnacked = projectAlerts.filter(a =>
      a.severity === 'critical' &&
      ((alertStates[a.id] as string | undefined) ?? a.status) === 'new',
    )
    return { pendingPOs, unactionedRecs, criticalUnacked }
  }, [effectiveProjects, projectAlerts, recommendationStates, alertStates])

  // ── Today's decisions ──────────────────────────────────────────────────────
  const decisionQueue = useMemo((): Decision[] => {
    const decisions: Decision[] = []

    // Critical unacknowledged alerts
    pendingApprovals.criticalUnacked.slice(0, 2).forEach(a => {
      decisions.push({
        id: `d-alert-${a.id}`, urgency: 'critical', category: 'alert',
        title: a.title, detail: a.description ?? a.affectedEntity,
        action: 'Escalate now', projectId: a.projectId ?? undefined,
        href: '/alerts',
      })
    })

    // POs pending sign-off
    pendingApprovals.pendingPOs.slice(0, 2).forEach(po => {
      decisions.push({
        id: `d-po-${po.id}`, urgency: 'high', category: 'approval',
        title: `Approve PO ${po.id} — ${po.item}`,
        detail: `₹${(po.totalValue / 100000).toFixed(1)}L from ${po.vendor}. ${po.stockoutRisk <= 5 ? `⚠ ${po.stockoutRisk}d stockout risk.` : ''}`,
        action: 'Review & approve', projectId: po.projectId,
        href: '/procurement',
      })
    })

    // Projects with critical cost overrun
    filteredProjects.filter(p => p.costVariance > 8).forEach(p => {
      const monthsElapsed = Math.max(1, (p.progress / 100) * 48)
      const monthlyBurn = p.actual / monthsElapsed
      const contingency = p.budget * 0.10
      const overrun = Math.max(0, p.actual - p.budget)
      const contingencyRemaining = contingency - overrun
      const weeksLeft = contingencyRemaining > 0 ? Math.round((contingencyRemaining / monthlyBurn) * 4.33) : 0
      decisions.push({
        id: `d-cost-${p.id}`, urgency: contingencyRemaining <= 0 ? 'critical' : 'high', category: 'cost',
        title: `${p.id} cost overrun at ${p.costVariance}%`,
        detail: contingencyRemaining <= 0
          ? `Contingency breached by ₹${(Math.abs(contingencyRemaining) / 100000).toFixed(0)}L. Requires board-level review.`
          : `At current burn rate, contingency exhausted in ${weeksLeft} weeks. Corrective action needed.`,
        action: 'Review financials', projectId: p.id,
        href: '/finance',
      })
    })

    // Projects severely behind schedule
    filteredProjects.filter(p => p.scheduleVarianceDays > 45).forEach(p => {
      decisions.push({
        id: `d-sch-${p.id}`, urgency: p.scheduleVarianceDays > 90 ? 'critical' : 'high', category: 'schedule',
        title: `${p.id} is ${p.scheduleVarianceDays}d behind schedule`,
        detail: `PM ${p.pm} — at current pace, completion shifts to ${new Date(p.projectedCompletion).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}. Milestone recovery plan required.`,
        action: 'Review schedule', projectId: p.id,
        href: `/project/${p.id}`,
      })
    })

    // High unactioned recommendations
    pendingApprovals.unactionedRecs.filter(r => r.priority <= 2).slice(0, 2).forEach(r => {
      decisions.push({
        id: `d-rec-${r.id}`, urgency: 'medium', category: 'approval',
        title: r.title,
        detail: `₹${(r.expectedImpactValue / 100000).toFixed(0)}L impact if actioned. Confidence: ${r.confidence}%`,
        action: 'Review recommendation', projectId: r.projectId,
        href: '/predictive',
      })
    })

    // Sort: critical → high → medium, cap at 6
    return decisions
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2 }
        return order[a.urgency] - order[b.urgency]
      })
      .slice(0, 6)
  }, [filteredProjects, pendingApprovals])

  // ── Resource conflicts ─────────────────────────────────────────────────────
  const visibleConflicts = useMemo(
    () => ALL_CONFLICTS.filter(c => c.projects.some(pid => effectiveProjects.includes(pid))),
    [effectiveProjects],
  )

  const allSelected = effectiveProjects.length === 8

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div><h1 className="text-2xl font-bold text-necl-text">Command Center</h1></div>
        <NoProjectsSelected />
      </div>
    )
  }

  const projectsLabel = isSiteManager
    ? 'Kaleshwaram Dam Support Pkg-B'
    : allSelected
    ? `Portfolio-wide — all ${filteredProjects.length} projects`
    : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''} selected`

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* Scope banner */}
      <motion.div
        key={effectiveProjects.join(',')}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium',
          isSiteManager ? 'border-necl-warning/40 bg-necl-warning/8 text-necl-warning' : 'border-necl-accent/30 bg-necl-accent/5 text-necl-muted',
        )}
      >
        <span className={cn('w-2 h-2 rounded-full animate-pulse', isSiteManager ? 'bg-necl-warning' : 'bg-necl-success')} />
        {projectsLabel}
        {!isSiteManager && (
          <span className="ml-auto flex items-center gap-1 text-necl-muted">
            <RefreshCw className="w-3 h-3" />
            Live tick #{liveTick} · refreshing every 20s
          </span>
        )}
      </motion.div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-necl-text">Command Center</h1>
          <p className="text-sm text-necl-muted mt-0.5">Decision intelligence · Live as of 29 Jun 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExceptionOnly(!exceptionOnly)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all',
              exceptionOnly
                ? 'border-necl-critical/50 bg-necl-critical/10 text-necl-critical'
                : 'border-[var(--color-necl-border)] text-necl-muted hover:border-necl-accent/40 hover:text-necl-text',
            )}
          >
            {exceptionOnly ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {exceptionOnly ? 'Exception Mode ON' : 'Exception Mode'}
          </button>
          <div className="flex items-center gap-1.5 text-xs text-necl-success font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Exception mode banner */}
      <AnimatePresence>
        {exceptionOnly && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-necl-critical/40 bg-necl-critical/5 text-necl-critical text-xs font-semibold"
          >
            <EyeOff className="w-4 h-4 flex-shrink-0" />
            Exception Mode — showing only items that need attention. Green items are hidden.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pending Approvals Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Critical Alerts',
            count: pendingApprovals.criticalUnacked.length,
            sub: 'Unacknowledged · immediate',
            color: 'border-necl-critical/40 bg-necl-critical/5 text-necl-critical',
            icon: Flame,
            href: '/alerts',
            urgent: true,
          },
          {
            label: 'POs Awaiting Sign-off',
            count: pendingApprovals.pendingPOs.length,
            sub: `≥₹50L threshold · ${pendingApprovals.pendingPOs.length} pending`,
            color: 'border-necl-warning/40 bg-necl-warning/5 text-necl-warning',
            icon: Package,
            href: '/procurement',
            urgent: pendingApprovals.pendingPOs.length > 0,
          },
          {
            label: 'Recommendations',
            count: pendingApprovals.unactionedRecs.length,
            sub: 'Unactioned — review needed',
            color: 'border-necl-accent/40 bg-necl-accent/5 text-necl-accent',
            icon: Zap,
            href: '/predictive',
            urgent: false,
          },
          {
            label: 'Projects At Risk',
            count: atRiskCount,
            sub: `${filteredProjects.length - atRiskCount} on track · ${atRiskCount} flagged`,
            color: atRiskCount > 0 ? 'border-necl-warning/40 bg-necl-warning/5 text-necl-warning' : 'border-necl-success/30 bg-necl-success/5 text-necl-success',
            icon: GitBranch,
            href: '/operations',
            urgent: atRiskCount > 1,
          },
        ].map(item => {
          const Icon = item.icon
          if (exceptionOnly && item.count === 0) return null
          return (
            <Link key={item.label} href={item.href}>
              <div className={cn(
                'rounded-xl border p-4 flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer',
                item.color,
              )}>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', item.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black tabular-nums">{item.count}</span>
                    {item.urgent && item.count > 0 && (
                      <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                    )}
                  </div>
                  <p className="text-[10px] font-semibold opacity-80 truncate">{item.label}</p>
                  <p className="text-[9px] opacity-60 truncate">{item.sub}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Today's Decisions ── */}
      {decisionQueue.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-necl-accent" />
              <h2 className="text-sm font-bold text-necl-text">Today&apos;s Decisions</h2>
              <span className="text-[10px] text-necl-muted">— ranked by urgency · {decisionQueue.length} items need your attention</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {decisionQueue.map((d, i) => {
              const cfg = URGENCY_CONFIG[d.urgency]
              const CatIcon = CATEGORY_ICON[d.category]
              const UrgIcon = cfg.icon
              return (
                <Link key={d.id} href={d.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'rounded-xl border p-4 hover:opacity-90 transition-all cursor-pointer h-full',
                      cfg.border, cfg.bg,
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0', cfg.badge)}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider', cfg.badge)}>
                            <UrgIcon className="w-2.5 h-2.5 inline mr-0.5" />{d.urgency}
                          </span>
                          {d.projectId && (
                            <span className="text-[9px] font-mono font-bold text-necl-muted bg-[var(--color-necl-border)] px-1.5 py-0.5 rounded">{d.projectId}</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-necl-text leading-snug mb-1">{d.title}</p>
                        <p className="text-[10px] text-necl-muted leading-relaxed">{d.detail}</p>
                      </div>
                    </div>
                    <div className={cn('flex items-center gap-1 mt-3 text-[10px] font-semibold', cfg.text)}>
                      {d.action}
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {(!exceptionOnly || atRiskCount > 0) && (
          <KPITile
            label="Selected Projects"
            value={String(filteredProjects.length)}
            subtitle={`${filteredProjects.length - atRiskCount} on track · ${atRiskCount} at risk`}
            trend={atRiskCount > 0 ? 'down' : 'up'}
            trendText={atRiskCount > 0 ? `${atRiskCount} flagged` : 'All on track'}
            trendPositive={atRiskCount === 0}
            status={atRiskCount > 1 ? 'red' : atRiskCount > 0 ? 'amber' : 'green'}
            sparklineData={[6, 7, 7, 8, 8, 8, filteredProjects.length]}
          />
        )}
        {(!exceptionOnly || costVariance > 0) && (
          <KPITile
            label="Portfolio Value"
            value={`₹${(totalBudget / 10000000).toFixed(1)}Cr`}
            subtitle={`₹${(totalActual / 10000000).toFixed(1)}Cr spent · ${costVariance > 0 ? '+' : ''}${costVariance.toFixed(1)}%`}
            trend={costVariance > 0 ? 'down' : 'up'}
            trendText={costVariance > 0 ? '↑ overrun trend' : '↓ under budget'}
            trendPositive={costVariance <= 0}
            status={costVariance > 10 ? 'red' : costVariance > 5 ? 'amber' : 'green'}
            sparklineData={[101, 103, 104, 105, 106, 107, 108]}
            sparklineColor="#F59E0B"
          />
        )}
        {!exceptionOnly && (
          <KPITile
            label="Avg Progress"
            value={`${avgProgress}%`}
            subtitle={`Across ${filteredProjects.length} projects`}
            trend="up"
            trendText="↑ improving"
            trendPositive
            status="green"
            sparklineData={[60, 62, 64, 65, 66, 67, avgProgress]}
            sparklineColor="#10B981"
          />
        )}
        {(!exceptionOnly || liveFleetUtil < 75) && (
          <KPITile
            label="Fleet Utilization"
            value={`${liveFleetUtil.toFixed(0)}%`}
            subtitle="₹72.3K idle today · 4 machines down"
            trend="up"
            trendText="↑ improving"
            trendPositive
            status="amber"
            sparklineData={[72, 74, 73, 75, 74, 75, liveFleetUtil]}
            sparklineColor="#2563EB"
          />
        )}
        {!exceptionOnly && (
          <KPITile
            label="Workforce"
            value={liveCrew.toLocaleString('en-IN')}
            subtitle={`${liveAttendance.toFixed(1)}% attendance`}
            trend="stable"
            trendText="stable"
            trendPositive
            status="green"
            sparklineData={[94, 93, 94, 95, 94, 94, liveAttendance]}
            sparklineColor="#10B981"
          />
        )}
        <KPITile
          label="Safety Index"
          value="0 LTIs"
          subtitle="3 near-misses · 8-month streak"
          trend="stable"
          trendText="3 near-miss"
          trendPositive={false}
          status="amber"
          sparklineData={[0, 0, 0, 1, 0, 0, 0]}
          sparklineColor="#F59E0B"
        />
      </div>

      {/* ── Burn Rate Runway + Risk Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Burn Rate Runway */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-necl-warning" />
              <h2 className="text-sm font-bold text-necl-text">Burn Rate Runway</h2>
              <span className="text-[10px] text-necl-muted">10% contingency · weeks until exhausted</span>
            </div>
            <Link href="/finance" className="text-[11px] text-necl-accent font-medium hover:text-blue-400">Finance →</Link>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProjects
              .sort((a, b) => b.costVariance - a.costVariance)
              .map(p => (
                <BurnRateCard key={p.id} p={p} exceptionOnly={exceptionOnly} />
              ))}
          </div>
        </div>

        {/* Portfolio Risk Matrix */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-necl-accent" />
              <h2 className="text-sm font-bold text-necl-text">Portfolio Risk Matrix</h2>
            </div>
            <p className="text-[10px] text-necl-muted mt-0.5">Schedule variance (x) vs cost variance (y)</p>
          </div>
          <div className="p-4">
            <PortfolioRiskMatrix visibleProjects={filteredProjects} />
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 justify-center">
              {[
                { color: 'bg-necl-success', label: 'On Track' },
                { color: 'bg-necl-warning', label: 'At Risk' },
                { color: 'bg-necl-critical', label: 'Delayed' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span className="text-[10px] text-necl-muted">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Resource Conflicts ── */}
      {visibleConflicts.length > 0 && (
        <div className="rounded-xl border border-necl-warning/30 bg-[var(--color-necl-surface)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-necl-warning/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-necl-warning" />
              <h2 className="text-sm font-bold text-necl-text">Cross-Project Resource Conflicts</h2>
              <span className="text-[10px] text-necl-warning bg-necl-warning/10 border border-necl-warning/30 px-2 py-0.5 rounded-full font-semibold">
                {visibleConflicts.length} conflicts detected
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-necl-border)]">
            {visibleConflicts.map(c => (
              <div key={c.id} className={cn('p-4', c.severity === 'high' ? 'bg-necl-critical/3' : '')}>
                <div className="flex items-center gap-2 mb-2">
                  {c.type === 'Equipment' ? <Truck className="w-3.5 h-3.5 text-necl-muted flex-shrink-0" /> : <Users className="w-3.5 h-3.5 text-necl-muted flex-shrink-0" />}
                  <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border',
                    c.severity === 'high'
                      ? 'text-necl-critical border-necl-critical/30 bg-necl-critical/10'
                      : 'text-necl-warning border-necl-warning/30 bg-necl-warning/10',
                  )}>
                    {c.severity.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-necl-muted ml-auto">{c.window}</span>
                </div>
                <p className="text-xs font-semibold text-necl-text mb-1">{c.resource}</p>
                <div className="flex items-center gap-1 mb-2">
                  {c.projects.map(pid => (
                    <span key={pid} className="text-[9px] font-mono font-bold text-necl-accent bg-necl-accent/10 px-1.5 py-0.5 rounded">{pid}</span>
                  ))}
                </div>
                <p className="text-[10px] text-necl-muted leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Project Performance Table ── */}
      {filteredProjects.length > 1 && (
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-necl-border)]">
            <GitBranch className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Project Performance</h2>
            <span className="text-[10px] text-necl-muted ml-1">{filteredProjects.length} projects</span>
            <Link href="/orchestration" className="ml-auto text-[11px] text-necl-accent hover:text-blue-400 font-medium">Orchestration →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-necl-border)] bg-[var(--color-necl-bg)]/40">
                  {['Project', 'Type', 'Progress', 'Schedule', 'Cost Var.', 'PM', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-necl-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProjects
                  .filter(p => !exceptionOnly || p.status !== 'on-track')
                  .map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-[var(--color-necl-border)]/60 last:border-0 hover:bg-necl-accent/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/project/${p.id}`} className="font-bold text-necl-accent hover:underline">{p.id}</Link>
                        <p className="text-[10px] text-necl-muted mt-0.5 truncate max-w-[130px]">{p.name}</p>
                      </td>
                      <td className="px-4 py-3 text-necl-muted">{p.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[var(--color-necl-border)] overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', p.status === 'on-track' ? 'bg-necl-success' : p.status === 'at-risk' ? 'bg-necl-warning' : 'bg-necl-critical')}
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                          <span className="text-necl-text font-semibold">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('font-semibold', p.scheduleVarianceDays > 0 ? 'text-necl-critical' : p.scheduleVarianceDays < 0 ? 'text-necl-success' : 'text-necl-muted')}>
                          {p.scheduleVarianceDays > 0 ? `+${p.scheduleVarianceDays}d` : p.scheduleVarianceDays < 0 ? `${p.scheduleVarianceDays}d` : 'On time'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('font-semibold', p.costVariance > 5 ? 'text-necl-critical' : p.costVariance > 0 ? 'text-necl-warning' : 'text-necl-success')}>
                          {p.costVariance > 0 ? '+' : ''}{p.costVariance.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-necl-muted">{p.pm}</td>
                      <td className="px-4 py-3">
                        <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border',
                          p.status === 'on-track' ? 'text-necl-success border-necl-success/30 bg-necl-success/10' :
                          p.status === 'at-risk'  ? 'text-necl-warning border-necl-warning/30 bg-necl-warning/10' :
                                                     'text-necl-critical border-necl-critical/30 bg-necl-critical/10',
                        )}>
                          {p.status === 'on-track' ? 'On Track' : p.status === 'at-risk' ? 'At Risk' : 'Delayed'}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Live Activity + What's Coming ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-necl-critical" />
              <h2 className="text-sm font-bold text-necl-text">Live Activity Feed</h2>
              <div className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-necl-critical animate-ping" />
                <span className="text-[10px] font-bold text-necl-critical">LIVE</span>
              </div>
            </div>
            <Link href="/alerts" className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">All alerts →</Link>
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {visibleAlerts.length > 0
              ? <LiveActivityFeed events={liveEvents.filter(e => !exceptionOnly || e.severity === 'critical' || e.severity === 'high').slice(0, 12)} tick={liveTick} />
              : <div className="p-8 text-center"><Radio className="w-6 h-6 text-necl-muted mx-auto mb-2" /><p className="text-sm text-necl-muted">No activity for selected projects</p></div>
            }
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-necl-accent" />
              <h2 className="text-sm font-bold text-necl-text">What&apos;s Coming</h2>
              <span className="text-[10px] text-necl-muted">Next 7 days</span>
            </div>
            <Link href="/predictive" className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">Full hub →</Link>
          </div>
          <div className="p-3 space-y-3 max-h-[420px] overflow-y-auto">
            {visibleForecasts.map(f => <ForecastCard key={f.id} forecast={f} compact />)}
          </div>
        </div>
      </div>

      {/* ── Recommendations ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-necl-text">
            Prescriptive Recommendations
            <span className="ml-2 text-[11px] text-necl-muted font-normal">— ranked by expected impact</span>
          </h2>
          <Link href="/predictive" className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">
            View all {recommendations.length} →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleRecs.map(rec => <PrescriptiveCard key={rec.id} recommendation={rec} />)}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
