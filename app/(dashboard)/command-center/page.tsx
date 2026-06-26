'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Activity, TrendingUp, GitBranch, Radio, IndianRupee,
  Truck, Users, Package, Shield, RefreshCw,
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
import { activityEvents, getEventsForProjects, formatMinutesAgo, type ActivityEvent } from '@/lib/mock-data/activity-feed'
import type { Alert } from '@/lib/mock-data/alerts'
import { cn } from '@/lib/utils'

// Severity styles for activity events
const SEV_STYLES: Record<ActivityEvent['severity'], { dot: string; badge: string; text: string }> = {
  critical: { dot: 'bg-necl-critical', badge: 'bg-necl-critical/10 border-necl-critical/30 text-necl-critical', text: 'text-necl-critical' },
  high:     { dot: 'bg-necl-warning',  badge: 'bg-necl-warning/10 border-necl-warning/30 text-necl-warning',   text: 'text-necl-warning'  },
  medium:   { dot: 'bg-necl-accent',   badge: 'bg-necl-accent/10 border-necl-accent/30 text-necl-accent',      text: 'text-necl-accent'   },
  info:     { dot: 'bg-necl-muted',    badge: 'bg-[var(--color-necl-border)]/50 border-transparent text-necl-muted', text: 'text-necl-muted' },
  success:  { dot: 'bg-necl-success',  badge: 'bg-necl-success/10 border-necl-success/30 text-necl-success',   text: 'text-necl-success'  },
}

const TYPE_LABELS: Record<ActivityEvent['type'], string> = {
  alert:       'Alert',
  update:      'Update',
  procurement: 'Procurement',
  milestone:   'Milestone',
  system:      'System',
  crew:        'Crew',
  finance:     'Finance',
}

function LiveActivityFeed({ events, tick }: { events: ActivityEvent[]; tick: number }) {
  return (
    <div className="space-y-0">
      <AnimatePresence initial={false}>
        {events.map(ev => {
          const sev = SEV_STYLES[ev.severity]
          return (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -10, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-3 px-4 py-3 border-b border-[var(--color-necl-border)]/60 last:border-0 hover:bg-necl-accent/3 transition-colors group"
            >
              {/* Live dot */}
              <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', sev.dot, ev.severity === 'critical' && 'animate-pulse')} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn('text-xs font-semibold', sev.text)}>{ev.title}</span>
                    {ev.projectId !== 'PORTFOLIO' && (
                      <span className="text-[9px] font-bold text-necl-muted bg-[var(--color-necl-border)] px-1.5 py-0.5 rounded">
                        {ev.projectId}
                      </span>
                    )}
                    <span className={cn('text-[9px] font-medium px-1.5 py-0.5 rounded border', sev.badge)}>
                      {TYPE_LABELS[ev.type]}
                    </span>
                  </div>
                  <span className="text-[10px] text-necl-muted flex-shrink-0 tabular-nums">
                    {formatMinutesAgo(ev.minutesAgo, tick * 20)}
                  </span>
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

// Deterministic tick-based fluctuation
function tickValue(base: number, tick: number, amplitude: number, seed: number): number {
  return base + Math.round(Math.sin(tick * 0.8 + seed) * amplitude * 10) / 10
}

export default function CommandCenterPage() {
  const { role, selectedProjects, liveTick } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const isSiteManager = role === 'site-manager'
  const effectiveProjects = isSiteManager ? ['KDSP-B1'] : selectedProjects

  // Filtered data based on selected projects
  const filteredProjects = useMemo(
    () => projects.filter(p => effectiveProjects.includes(p.id)),
    [effectiveProjects],
  )

  const totalBudget  = useMemo(() => filteredProjects.reduce((s, p) => s + p.budget, 0), [filteredProjects])
  const totalActual  = useMemo(() => filteredProjects.reduce((s, p) => s + p.actual, 0), [filteredProjects])
  const totalCrew    = useMemo(() => filteredProjects.reduce((s, p) => s + p.crewCount, 0), [filteredProjects])
  const atRiskCount  = useMemo(() => filteredProjects.filter(p => p.status !== 'on-track').length, [filteredProjects])
  const avgProgress  = useMemo(() => filteredProjects.length ? Math.round(filteredProjects.reduce((s, p) => s + p.progress, 0) / filteredProjects.length) : 0, [filteredProjects])
  const costVariance = useMemo(() => totalBudget > 0 ? ((totalActual - totalBudget) / totalBudget) * 100 : 0, [totalBudget, totalActual])

  // Live KPI adjustments
  const liveFleetUtil  = tickValue(74, liveTick, 2, 1.2)
  const liveCrew       = Math.round(tickValue(totalCrew, liveTick, totalCrew * 0.005, 2.4))
  const liveAttendance = tickValue(94.2, liveTick, 1.5, 3.6)

  // Filtered activity events
  const liveEvents = useMemo(
    () => getEventsForProjects(effectiveProjects, liveTick),
    [effectiveProjects, liveTick],
  )

  const visibleAlerts = useMemo(
    () => isSiteManager
      ? alerts.filter(a => a.projectId === 'KDSP-B1').slice(0, 8)
      : alerts.filter(a => effectiveProjects.includes(a.projectId ?? '')).slice(0, 12),
    [isSiteManager, effectiveProjects],
  )

  const visibleForecasts = useMemo(
    () => isSiteManager
      ? forecasts.filter(f => f.projectId === 'KDSP-B1').slice(0, 6)
      : forecasts.filter(f => !f.projectId || effectiveProjects.includes(f.projectId)).slice(0, 7),
    [isSiteManager, effectiveProjects],
  )

  const visibleRecs = useMemo(
    () => isSiteManager
      ? recommendations.filter(r => r.projectId === 'KDSP-B1').slice(0, 3)
      : recommendations.filter(r => effectiveProjects.includes(r.projectId)).slice(0, 3),
    [isSiteManager, effectiveProjects],
  )

  const allSelected = effectiveProjects.length === 8

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div>
          <h1 className="text-2xl font-bold text-necl-text">Command Center</h1>
          <p className="text-sm text-necl-muted mt-0.5">Decision intelligence · Live data</p>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }
  const projectsLabel = isSiteManager
    ? 'Kaleshwaram Dam Support Pkg-B'
    : allSelected
    ? `Portfolio-wide — all ${filteredProjects.length} projects`
    : `${filteredProjects.length} project${filteredProjects.length !== 1 ? 's' : ''} selected: ${effectiveProjects.slice(0, 3).join(', ')}${effectiveProjects.length > 3 ? ` +${effectiveProjects.length - 3} more` : ''}`

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Scope banner */}
      <motion.div
        key={effectiveProjects.join(',')}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium',
          isSiteManager
            ? 'border-necl-warning/40 bg-necl-warning/8 text-necl-warning'
            : 'border-necl-accent/30 bg-necl-accent/5 text-necl-muted',
        )}
      >
        <span className={cn('w-2 h-2 rounded-full animate-pulse', isSiteManager ? 'bg-necl-warning' : 'bg-necl-success')} />
        {projectsLabel}
        {!isSiteManager && (
          <span className="ml-auto flex items-center gap-1 text-necl-muted">
            <RefreshCw className="w-3 h-3" />
            Live tick #{liveTick} · data refreshing every 20s
          </span>
        )}
      </motion.div>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-necl-text">Command Center</h1>
          <p className="text-sm text-necl-muted mt-0.5">
            Decision intelligence · Live as of 26 Jun 2025, 10:00 IST
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-necl-success">
          <Radio className="w-3.5 h-3.5" />
          Live
        </div>
      </div>

      {/* Project mini-cards when filtered */}
      {!allSelected && !isSiteManager && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2">
          {filteredProjects.map(p => (
            <Link key={p.id} href={`/project/${p.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-lg border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-3 hover:border-necl-accent/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', p.status === 'on-track' ? 'bg-necl-success' : p.status === 'at-risk' ? 'bg-necl-warning' : 'bg-necl-critical')} />
                  <span className="text-[10px] font-bold text-necl-text">{p.id}</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--color-necl-border)] overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', p.status === 'on-track' ? 'bg-necl-success' : p.status === 'at-risk' ? 'bg-necl-warning' : 'bg-necl-critical')}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <p className="text-[9px] text-necl-muted mt-1">{p.progress}% · {p.scheduleVarianceDays > 0 ? `+${p.scheduleVarianceDays}d` : p.scheduleVarianceDays < 0 ? `${p.scheduleVarianceDays}d` : 'on time'}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
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
        <KPITile
          label="Portfolio Value"
          value={`₹${(totalBudget / 10000000).toFixed(1)}Cr`}
          subtitle={`₹${(totalActual / 10000000).toFixed(1)}Cr spent · ${costVariance > 0 ? '+' : ''}${costVariance.toFixed(1)}% variance`}
          trend={costVariance > 0 ? 'down' : 'up'}
          trendText={costVariance > 0 ? '↑ overrun trend' : '↓ under budget'}
          trendPositive={costVariance <= 0}
          status={costVariance > 10 ? 'red' : costVariance > 5 ? 'amber' : 'green'}
          sparklineData={[101, 103, 104, 105, 106, 107, 108]}
          sparklineColor="#F59E0B"
        />
        <KPITile
          label="Avg Progress"
          value={`${avgProgress}%`}
          subtitle={`Across ${filteredProjects.length} selected projects`}
          trend="up"
          trendText="↑ improving"
          trendPositive
          status="green"
          sparklineData={[60, 62, 64, 65, 66, 67, avgProgress]}
          sparklineColor="#10B981"
        />
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
        <KPITile
          label="Workforce"
          value={liveCrew.toLocaleString('en-IN')}
          subtitle={`${liveAttendance.toFixed(1)}% attendance · 6.8/10 attrition`}
          trend="stable"
          trendText="stable"
          trendPositive
          status="green"
          sparklineData={[94, 93, 94, 95, 94, 94, liveAttendance]}
          sparklineColor="#10B981"
        />
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

      {/* Project performance table — visible when multiple projects */}
      {filteredProjects.length > 1 && (
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-necl-border)]">
            <GitBranch className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Project Performance</h2>
            <span className="text-[10px] text-necl-muted ml-1">{filteredProjects.length} projects</span>
            <Link href="/orchestration" className="ml-auto text-[11px] text-necl-accent hover:text-blue-400 font-medium">
              Orchestration →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-necl-border)] bg-[var(--color-necl-bg)]/40">
                  {['Project', 'Type', 'Progress', 'Schedule', 'Cost Variance', 'PM', 'Status'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-necl-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-[var(--color-necl-border)]/60 last:border-0 hover:bg-necl-accent/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/project/${p.id}`} className="font-bold text-necl-accent hover:underline">{p.id}</Link>
                      <p className="text-[10px] text-necl-muted mt-0.5 truncate max-w-[140px]">{p.name}</p>
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

      {/* Middle row: live activity + predictive */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live activity feed */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-necl-critical" />
              <h2 className="text-sm font-bold text-necl-text">Live Activity Feed</h2>
              <div className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-necl-critical animate-ping" />
                <span className="text-[10px] font-bold text-necl-critical">LIVE</span>
              </div>
              <span className="text-[10px] text-necl-muted">· {liveEvents.length} events</span>
            </div>
            <Link href="/alerts" className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">
              All alerts →
            </Link>
          </div>
          <div className="max-h-[460px] overflow-y-auto">
            {liveEvents.length > 0 ? (
              <LiveActivityFeed events={liveEvents} tick={liveTick} />
            ) : (
              <div className="p-8 text-center">
                <Radio className="w-6 h-6 text-necl-muted mx-auto mb-2" />
                <p className="text-sm text-necl-muted">No activity events for selected projects</p>
              </div>
            )}
          </div>
        </div>

        {/* Predictive panel */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-necl-border)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-necl-accent" />
              <h2 className="text-sm font-bold text-necl-text">What&apos;s Coming</h2>
              <span className="text-[10px] text-necl-muted">Next 7 days</span>
            </div>
            <Link href="/predictive" className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">
              Full hub →
            </Link>
          </div>
          <div className="p-3 space-y-3 max-h-[460px] overflow-y-auto">
            {visibleForecasts.map(f => (
              <ForecastCard key={f.id} forecast={f} compact />
            ))}
          </div>
        </div>
      </div>

      {/* Prescriptive recommendations */}
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
          {visibleRecs.map(rec => (
            <PrescriptiveCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
