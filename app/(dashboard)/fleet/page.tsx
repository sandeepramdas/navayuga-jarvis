'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Flame, Wrench, Fuel, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Users, Zap, Activity, ChevronRight, Radio, Shield, Star,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { StatusPill } from '@/components/ui/StatusPill'
import { NECLDonutChart } from '@/components/charts/DonutChart'
import { NECLBarChart } from '@/components/charts/BarChart'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { fleet } from '@/lib/mock-data/fleet'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { projects } from '@/lib/mock-data/projects'
import {
  operatorProfiles,
  fleetManagers,
  deploymentRecommendations,
  maintenanceForecast,
} from '@/lib/mock-data/fleet-extended'
import { formatINR } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TODAY_DATE = new Date('2026-06-29')
function daysUntil(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - TODAY_DATE.getTime()) / 86400000)
}

const NOW_MS = new Date('2026-06-29T09:00:00').getTime()

// ─── Sparkline for idle cost trend ────────────────────────────────────────────

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 80
  const h = 28
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={up ? '#EF4444' : '#10B981'} strokeWidth={1.5} />
    </svg>
  )
}

// ─── Mini progress bar ─────────────────────────────────────────────────────────

function MiniBar({ value, max = 100, color = '#2563EB' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-1.5 bg-necl-border rounded-full overflow-hidden w-full">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const { role, selectedProjects, liveTick } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle' | 'maintenance'>('all')
  const [activeTab, setActiveTab] = useState<'fleet' | 'operators' | 'managers'>('fleet')

  const isSiteManager = role === 'site-manager'
  const effectiveProjects = isSiteManager ? ['KDSP-B1'] : selectedProjects

  // ── Fleet tab computations ──────────────────────────────────────────────────
  const visibleFleet = useMemo(
    () => fleet.filter(m => effectiveProjects.includes(m.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects],
  )
  const active = useMemo(() => visibleFleet.filter(m => m.status === 'active').length, [visibleFleet])
  const idle = useMemo(() => visibleFleet.filter(m => m.status === 'idle').length, [visibleFleet])
  const maintenance = useMemo(() => visibleFleet.filter(m => m.status === 'maintenance').length, [visibleFleet])
  const avgUtilization = useMemo(
    () =>
      visibleFleet.length
        ? Math.round(visibleFleet.reduce((s, m) => s + m.utilization, 0) / visibleFleet.length)
        : 0,
    [visibleFleet],
  )
  const totalIdleCost = useMemo(
    () => visibleFleet.filter(m => m.status === 'idle').reduce((s, m) => s + m.dailyIdleCost, 0),
    [visibleFleet],
  )
  const criticalMaintenance = useMemo(
    () => visibleFleet.filter(m => m.predictiveMaintenance.riskLevel === 'critical').length,
    [visibleFleet],
  )

  const idleMachines = useMemo(
    () =>
      visibleFleet
        .filter(m => m.status === 'idle')
        .map(m => {
          const op = operatorProfiles.find(o => o.machineId === m.id)
          const idleDays = op?.idleDaysAssigned ?? 1
          return { ...m, idleDays, totalBurn: m.dailyIdleCost * idleDays }
        }),
    [visibleFleet],
  )

  const pmCountdown = useMemo(() => {
    const riskOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
    return [...visibleFleet]
      .filter(
        m =>
          m.predictiveMaintenance.riskLevel !== 'low' ||
          daysUntil(m.predictiveMaintenance.dueDate) <= 30,
      )
      .sort(
        (a, b) =>
          (riskOrder[a.predictiveMaintenance.riskLevel] ?? 4) -
          (riskOrder[b.predictiveMaintenance.riskLevel] ?? 4),
      )
      .slice(0, 8)
  }, [visibleFleet])

  const fuelMachines = useMemo(
    () =>
      visibleFleet
        .filter(m => m.fuelEfficiencyUnit === 'L/hr')
        .map(m => {
          const dailyFuelL = m.fuelEfficiency * (m.utilization / 100) * 8
          const dailyFuelCost = dailyFuelL * 96.5
          const idleFuelL = m.fuelEfficiency * 0.25 * 8
          return {
            ...m,
            dailyFuelL: Math.round(dailyFuelL * 10) / 10,
            dailyFuelCost: Math.round(dailyFuelCost),
            idleFuelL: Math.round(idleFuelL * 10) / 10,
          }
        })
        .sort((a, b) => b.dailyFuelCost - a.dailyFuelCost),
    [visibleFleet],
  )

  const engineHoursHealth = useMemo(
    () =>
      visibleFleet
        .map(m => {
          const intervals = [500, 1000, 2000, 5000, 10000]
          const nextInterval = intervals.find(i => i > m.engineHours) ?? 10000
          const prevInterval = [...intervals].reverse().find(i => i <= m.engineHours) ?? 0
          const pctToNext =
            ((m.engineHours - prevInterval) / (nextInterval - prevInterval)) * 100
          const hoursToNext = nextInterval - m.engineHours
          const isNearOverhaul = m.engineHours > 8000
          const needsReplacement = m.engineHours > 10000
          return {
            ...m,
            nextInterval,
            hoursToNext,
            pctToNext: Math.round(pctToNext),
            isNearOverhaul,
            needsReplacement,
          }
        })
        .sort((a, b) => b.engineHours - a.engineHours),
    [visibleFleet],
  )

  const telemetryHealth = useMemo(
    () =>
      visibleFleet
        .map(m => {
          const lastMs = new Date(m.lastTelemetry).getTime()
          const hoursAgo = Math.round(((NOW_MS - lastMs) / 3600000) * 10) / 10
          const isDark = hoursAgo > 4
          return { ...m, hoursAgo, isDark }
        })
        .sort((a, b) => b.hoursAgo - a.hoursAgo),
    [visibleFleet],
  )

  const darkCount = useMemo(() => telemetryHealth.filter(m => m.isDark).length, [telemetryHealth])

  const utilizationByProject = useMemo(
    () =>
      effectiveProjects.map(pid => {
        const pFleet = visibleFleet.filter(m => m.projectId === pid)
        const avgUtil = pFleet.length
          ? Math.round(pFleet.reduce((s, m) => s + m.utilization, 0) / pFleet.length)
          : 0
        const totalIdleCostP = pFleet
          .filter(m => m.status === 'idle')
          .reduce((s, m) => s + m.dailyIdleCost, 0)
        const proj = projects.find(p => p.id === pid)
        return {
          projectId: pid,
          count: pFleet.length,
          avgUtil,
          totalIdleCostP,
          status: proj?.status ?? 'on-track',
          scheduleVarianceDays: proj?.scheduleVarianceDays ?? 0,
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects, visibleFleet],
  )

  const typeBreakdown = useMemo(() => {
    const BENCHMARKS: Record<string, number> = {
      Excavator: 75,
      Bulldozer: 80,
      Crane: 70,
      'Crawler Crane': 70,
      Grader: 80,
      Paver: 85,
      'Wheel Loader': 70,
      Tipper: 75,
      Truck: 75,
      'Mini Truck': 65,
      'Dump Truck': 75,
      'Transit Mixer': 70,
      'Concrete Mixer': 70,
      'Reach Stacker': 65,
    }
    const map: Record<string, { count: number; totalUtil: number; benchmark: number }> = {}
    visibleFleet.forEach(m => {
      if (!map[m.type]) map[m.type] = { count: 0, totalUtil: 0, benchmark: BENCHMARKS[m.type] ?? 70 }
      map[m.type].count++
      map[m.type].totalUtil += m.utilization
    })
    return Object.entries(map)
      .map(([type, d]) => ({
        type,
        count: d.count,
        avgUtil: Math.round(d.totalUtil / d.count),
        benchmark: d.benchmark,
        belowBenchmark: Math.round(d.totalUtil / d.count) < d.benchmark,
      }))
      .sort((a, b) => b.count - a.count)
  }, [visibleFleet])

  const visibleDeployRecs = useMemo(
    () =>
      deploymentRecommendations.filter(
        r =>
          effectiveProjects.includes(r.fromProjectId) ||
          effectiveProjects.includes(r.toProjectId),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects],
  )

  const visibleMaintForecast = useMemo(
    () =>
      maintenanceForecast.map(f => ({
        ...f,
        machines: f.machines.filter(m => effectiveProjects.includes(m.projectId)),
        totalEstimatedCost: f.machines
          .filter(m => effectiveProjects.includes(m.projectId))
          .reduce((s, m) => s + m.estimatedCost, 0),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects],
  )

  const totalForecastCost = useMemo(
    () => visibleMaintForecast.reduce((s, f) => s + f.totalEstimatedCost, 0),
    [visibleMaintForecast],
  )

  // ── Operators tab computations ──────────────────────────────────────────────
  const visibleOperators = useMemo(
    () => operatorProfiles.filter(o => effectiveProjects.includes(o.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects],
  )

  const operatorToMachineRatio = useMemo(
    () =>
      effectiveProjects.map(pid => {
        const machines = visibleFleet.filter(m => m.projectId === pid).length
        const ops = visibleOperators.filter(o => o.projectId === pid).length
        return { projectId: pid, machines, operators: ops, gap: machines - ops }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects, visibleFleet, visibleOperators],
  )

  const sortedOperators = useMemo(
    () => [...visibleOperators].sort((a, b) => b.harshOperationIndex - a.harshOperationIndex),
    [visibleOperators],
  )

  const problematicCerts = useMemo(
    () => visibleOperators.filter(o => o.certStatus !== 'valid'),
    [visibleOperators],
  )

  const versatileOperators = useMemo(
    () => visibleOperators.filter(o => o.machineTypes.length > 1),
    [visibleOperators],
  )

  const topOperators = useMemo(
    () =>
      [...visibleOperators]
        .sort(
          (a, b) =>
            a.harshOperationIndex +
            (100 - a.attendanceRate) / 10 -
            (b.harshOperationIndex + (100 - b.attendanceRate) / 10),
        )
        .slice(0, 3),
    [visibleOperators],
  )

  const bottomOperators = useMemo(
    () =>
      [...visibleOperators]
        .sort(
          (a, b) =>
            b.harshOperationIndex +
            (100 - b.attendanceRate) / 10 -
            (a.harshOperationIndex + (100 - a.attendanceRate) / 10),
        )
        .slice(0, 3),
    [visibleOperators],
  )

  // ── Fleet managers tab computations ────────────────────────────────────────
  const visibleManagers = useMemo(
    () => fleetManagers.filter(fm => effectiveProjects.includes(fm.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects],
  )

  const fleetProductivity = useMemo(
    () =>
      utilizationByProject
        .map(up => {
          const proj = projects.find(p => p.id === up.projectId)
          const wp = proj?.weeklyProgress ?? []
          const delta = wp.length >= 2 ? wp[wp.length - 1] - wp[wp.length - 2] : 1
          const pi = up.avgUtil > 0 ? delta / (up.avgUtil / 100) : 0
          return {
            projectId: up.projectId,
            avgUtil: up.avgUtil,
            weeklyDelta: delta,
            productivityIndex: Math.round(pi * 100) / 100,
          }
        })
        .sort((a, b) => b.productivityIndex - a.productivityIndex),
    [utilizationByProject],
  )

  // ── Alerts + Recs ───────────────────────────────────────────────────────────
  const fleetAlerts = useMemo(
    () =>
      alerts.filter(
        a => a.department === 'fleet' && effectiveProjects.includes(a.projectId ?? ''),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects],
  )

  const fleetRecs = useMemo(
    () =>
      recommendations.filter(
        r => r.department === 'Fleet' && effectiveProjects.includes(r.projectId ?? ''),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects],
  )

  // ── Filtered table ──────────────────────────────────────────────────────────
  const filteredFleet = useMemo(
    () =>
      filterStatus === 'all' ? visibleFleet : visibleFleet.filter(m => m.status === filterStatus),
    [visibleFleet, filterStatus],
  )

  // ── Donut data ──────────────────────────────────────────────────────────────
  const donutData = useMemo(
    () => [
      { label: 'Active', value: active, color: '#10B981' },
      { label: 'Idle', value: idle, color: '#F59E0B' },
      { label: 'Maintenance', value: maintenance, color: '#EF4444' },
    ],
    [active, idle, maintenance],
  )

  // ── Early return ────────────────────────────────────────────────────────────
  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Fleet Management</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Fleet Management</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-necl-muted">
          <span className="w-2 h-2 rounded-full bg-necl-success animate-pulse inline-block" />
          Live · {Math.floor(liveTick / 60)}:{String(liveTick % 60).padStart(2, '0')} elapsed
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-necl-bg)] border border-[var(--color-necl-border)] w-fit">
        {(['fleet', 'operators', 'managers'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              activeTab === tab
                ? 'bg-necl-accent text-white shadow-sm'
                : 'text-necl-muted hover:text-necl-text',
            )}
          >
            {tab === 'managers'
              ? 'Fleet Managers'
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* ════════════════════════════════════════════════════════════════
              TAB 1: FLEET
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'fleet' && (
            <>
              {/* ── 6 KPI Tiles ── */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <KPITile
                  label="Fleet Utilization"
                  value={`${avgUtilization}%`}
                  subtitle={`${active} active · ${idle} idle`}
                  status={
                    avgUtilization >= 80 ? 'green' : avgUtilization >= 65 ? 'amber' : 'red'
                  }
                  sparklineData={[68, 70, 72, 73, 74, 74, avgUtilization]}
                />
                <KPITile
                  label="Idle Cost Today"
                  value={formatINR(totalIdleCost)}
                  subtitle={`${idle} machines idle`}
                  status="red"
                  sparklineData={[60000, 65000, 72000, 68000, 70000, 72000, totalIdleCost]}
                  sparklineColor="#EF4444"
                />
                <KPITile
                  label="In Maintenance"
                  value={String(maintenance)}
                  subtitle="Down for repairs"
                  status={maintenance > 2 ? 'red' : maintenance > 0 ? 'amber' : 'green'}
                />
                <KPITile
                  label="Critical PM Due"
                  value={String(criticalMaintenance)}
                  subtitle="Immediate attention needed"
                  status={criticalMaintenance > 0 ? 'red' : 'green'}
                />
                <KPITile
                  label="Gone Dark"
                  value={String(darkCount)}
                  subtitle="No signal >4h"
                  status={darkCount > 1 ? 'red' : darkCount === 1 ? 'amber' : 'green'}
                />
                <KPITile
                  label="Maint. Forecast (90d)"
                  value={`₹${(totalForecastCost / 100000).toFixed(1)}L`}
                  subtitle="Next 90 days"
                  status={totalForecastCost > 2000000 ? 'red' : 'amber'}
                />
              </div>

              {/* ── Idle Burn Tracker + Deploy Recs ── */}
              <div className="grid lg:grid-cols-5 gap-6">
                {/* Idle Burn Tracker */}
                <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-necl-critical" />
                    <h2 className="font-semibold text-necl-text">Idle Cost Burn Tracker</h2>
                    <span className="text-xs text-necl-muted ml-auto">Live accumulating</span>
                  </div>
                  {idleMachines.length === 0 ? (
                    <p className="text-necl-muted text-sm">No idle machines in selected projects.</p>
                  ) : (
                    <div className="space-y-4">
                      {idleMachines.map(m => {
                        const op = operatorProfiles.find(o => o.machineId === m.id)
                        const weeklyBudget = m.dailyIdleCost * 7
                        const burnPct = Math.min(100, (m.totalBurn / weeklyBudget) * 100)
                        const idleFuelL =
                          m.fuelEfficiencyUnit === 'L/hr'
                            ? Math.round(m.fuelEfficiency * 0.25 * 8 * 10) / 10
                            : null
                        return (
                          <div
                            key={m.id}
                            className="rounded-lg border border-necl-border bg-necl-bg p-4 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono text-sm font-semibold text-necl-text">
                                    {m.id}
                                  </span>
                                  <span className="text-xs text-necl-muted">{m.type}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                                    {m.projectId}
                                  </span>
                                  {m.idleDays >= 3 ? (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-necl-critical/15 text-necl-critical border border-necl-critical/30 animate-pulse font-semibold">
                                      {m.idleDays}d idle
                                    </span>
                                  ) : (
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-necl-warning/15 text-necl-warning border border-necl-warning/30">
                                      {m.idleDays}d idle
                                    </span>
                                  )}
                                </div>
                                {op && (
                                  <div className="text-xs text-necl-muted mt-1">
                                    Operator: {op.name}
                                  </div>
                                )}
                              </div>
                              <button className="flex items-center gap-1 text-xs text-necl-accent font-medium hover:underline shrink-0">
                                Redeploy <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-necl-critical font-semibold">
                                {formatINR(m.dailyIdleCost)}/day
                                <span className="text-necl-muted font-normal ml-1">
                                  · {formatINR(m.totalBurn)} burned ({m.idleDays}d)
                                </span>
                              </span>
                              {idleFuelL && (
                                <span className="text-necl-warning text-xs">
                                  ~{idleFuelL}L diesel/day even idle
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-necl-muted">
                                <span>Burn vs weekly budget</span>
                                <span>{Math.round(burnPct)}%</span>
                              </div>
                              <MiniBar
                                value={burnPct}
                                max={100}
                                color={burnPct > 60 ? '#EF4444' : '#F59E0B'}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Deployment Recs */}
                <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Deploy Available Assets</h2>
                  </div>
                  {visibleDeployRecs.length === 0 ? (
                    <p className="text-necl-muted text-sm">
                      No deployment recommendations for selected projects.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {visibleDeployRecs.map(dr => (
                        <div
                          key={dr.id}
                          className="rounded-lg border border-necl-border bg-necl-bg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-semibold text-necl-text">
                              {dr.machineId}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded border font-semibold uppercase',
                                dr.urgency === 'critical'
                                  ? 'bg-necl-critical/15 text-necl-critical border-necl-critical/30'
                                  : dr.urgency === 'high'
                                    ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                    : 'bg-necl-warning/15 text-necl-warning border-necl-warning/30',
                              )}
                            >
                              {dr.urgency}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-necl-muted">
                            <span className="px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                              {dr.fromProjectId}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="px-1.5 py-0.5 rounded bg-necl-success/10 text-necl-success">
                              {dr.toProjectId}
                            </span>
                          </div>
                          <p className="text-xs text-necl-muted leading-relaxed line-clamp-2">
                            {dr.reason}
                          </p>
                          <div className="text-xs text-necl-text">
                            {dr.totalIdleBurnSoFar > 0 && (
                              <span className="text-necl-critical">
                                {formatINR(dr.totalIdleBurnSoFar)} idle cost
                              </span>
                            )}
                            {dr.totalIdleBurnSoFar > 0 && (
                              <span className="text-necl-muted"> + </span>
                            )}
                            <span className="text-necl-success">
                              {dr.scheduleRecoveryDays}d schedule recovery
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Predictive Maintenance Countdown ── */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-necl-warning" />
                  <h2 className="font-semibold text-necl-text">
                    Predictive Maintenance Countdown
                  </h2>
                  <span className="text-xs text-necl-muted ml-auto">Sorted by urgency</span>
                </div>
                {pmCountdown.length === 0 ? (
                  <p className="text-necl-muted text-sm">No urgent maintenance items.</p>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {pmCountdown.map(m => {
                      const days = daysUntil(m.predictiveMaintenance.dueDate)
                      const op = operatorProfiles.find(o => o.machineId === m.id)
                      const fcast = visibleMaintForecast
                        .flatMap(f => f.machines)
                        .find(fm => fm.machineId === m.id)
                      const dayColor =
                        days < 0 || m.predictiveMaintenance.riskLevel === 'critical'
                          ? 'text-necl-critical'
                          : days <= 14
                            ? 'text-necl-warning'
                            : 'text-necl-accent'
                      return (
                        <div
                          key={m.id}
                          className="rounded-lg border border-necl-border bg-necl-bg p-3 space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-mono text-xs font-semibold text-necl-text">
                                {m.id}
                              </div>
                              <div className="text-xs text-necl-muted">{m.type}</div>
                            </div>
                            <StatusPill
                              status={
                                m.predictiveMaintenance.riskLevel as
                                  | 'critical'
                                  | 'high'
                                  | 'medium'
                                  | 'low'
                              }
                              size="sm"
                            />
                          </div>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                            {m.projectId}
                          </span>
                          <div className="text-xs text-necl-muted">
                            {m.predictiveMaintenance.component}
                          </div>
                          <div className={cn('text-sm font-bold', dayColor)}>
                            {days < 0
                              ? `${Math.abs(days)}d overdue`
                              : days === 0
                                ? 'Due today'
                                : `${days}d remaining`}
                          </div>
                          {fcast && (
                            <div className="text-xs text-necl-muted">
                              Est. cost:{' '}
                              <span className="text-necl-text font-medium">
                                {formatINR(fcast.estimatedCost)}
                              </span>
                            </div>
                          )}
                          {op && (
                            <div className="text-xs text-necl-muted">Op: {op.name}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ── Fuel Consumption Intelligence ── */}
              <div className="grid lg:grid-cols-5 gap-6">
                {/* Fuel Table */}
                <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Fuel Consumption Intelligence</h2>
                    <span className="text-xs text-necl-muted ml-auto">
                      L/hr machines · ₹96.5/L diesel
                    </span>
                  </div>
                  {fuelMachines.length === 0 ? (
                    <p className="text-necl-muted text-sm">
                      No L/hr machines in selected projects.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-necl-muted border-b border-necl-border">
                            <th className="text-left py-2 pr-3">Machine</th>
                            <th className="text-left py-2 pr-3">Type</th>
                            <th className="text-left py-2 pr-3">Project</th>
                            <th className="text-right py-2 pr-3">Eff (L/hr)</th>
                            <th className="text-right py-2 pr-3">Daily (L)</th>
                            <th className="text-right py-2 pr-3">Daily (₹)</th>
                            <th className="text-right py-2">Idle (L/d)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-necl-border">
                          {fuelMachines.map(m => (
                            <tr key={m.id} className="hover:bg-necl-bg/50">
                              <td className="py-2 pr-3 font-mono text-necl-text">
                                {m.id.split('-').slice(-1)[0]}
                              </td>
                              <td className="py-2 pr-3 text-necl-muted">{m.type}</td>
                              <td className="py-2 pr-3">
                                <span className="px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                                  {m.projectId}
                                </span>
                              </td>
                              <td className="py-2 pr-3 text-right text-necl-text">
                                {m.fuelEfficiency}
                              </td>
                              <td className="py-2 pr-3 text-right text-necl-text">
                                {m.dailyFuelL}
                              </td>
                              <td
                                className={cn(
                                  'py-2 pr-3 text-right font-semibold',
                                  m.dailyFuelCost > 10000
                                    ? 'text-necl-critical'
                                    : m.dailyFuelCost > 5000
                                      ? 'text-necl-warning'
                                      : 'text-necl-text',
                                )}
                              >
                                {formatINR(m.dailyFuelCost)}
                              </td>
                              <td className="py-2 text-right text-necl-muted">{m.idleFuelL}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-necl-border font-semibold text-necl-text">
                            <td colSpan={5} className="py-2 pr-3">
                              Total daily fuel cost
                            </td>
                            <td className="py-2 pr-3 text-right text-necl-critical">
                              {formatINR(fuelMachines.reduce((s, m) => s + m.dailyFuelCost, 0))}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* Fuel Insight Summary */}
                <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Fuel Insight</h2>
                  </div>
                  {fuelMachines.length > 0 ? (
                    (() => {
                      const totalDailyL = fuelMachines.reduce((s, m) => s + m.dailyFuelL, 0)
                      const totalDailyCost = fuelMachines.reduce(
                        (s, m) => s + m.dailyFuelCost,
                        0,
                      )
                      const topMachine = fuelMachines[0]
                      const idleBurningCount = fuelMachines.filter(
                        m => m.status === 'idle',
                      ).length
                      const idlePct = Math.round(
                        (idleBurningCount / fuelMachines.length) * 100,
                      )
                      return (
                        <div className="space-y-3">
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">Total daily fleet fuel</div>
                            <div className="text-lg font-bold text-necl-text">
                              {Math.round(totalDailyL * 10) / 10} L
                            </div>
                            <div className="text-sm text-necl-critical font-semibold">
                              {formatINR(totalDailyCost)}/day
                            </div>
                          </div>
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">Highest consumer</div>
                            <div className="font-semibold text-necl-text text-sm">
                              {topMachine.id}
                            </div>
                            <div className="text-xs text-necl-muted">
                              {topMachine.dailyFuelL}L/day · {formatINR(topMachine.dailyFuelCost)}
                              /day
                            </div>
                          </div>
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">Est. monthly fuel bill</div>
                            <div className="text-lg font-bold text-necl-warning">
                              {formatINR(totalDailyCost * 26)}
                            </div>
                            <div className="text-xs text-necl-muted">26 working days</div>
                          </div>
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">
                              Burning diesel while idle
                            </div>
                            <div className="text-lg font-bold text-necl-critical">{idlePct}%</div>
                            <div className="text-xs text-necl-muted">
                              {idleBurningCount} of {fuelMachines.length} L/hr machines
                            </div>
                          </div>
                        </div>
                      )
                    })()
                  ) : (
                    <p className="text-necl-muted text-sm">No fuel data available.</p>
                  )}
                </div>
              </div>

              {/* ── Engine Hours Health ── */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-necl-accent" />
                  <h2 className="font-semibold text-necl-text">Engine Hours Health</h2>
                  <span className="text-xs text-necl-muted ml-auto">
                    Service intervals: 500 · 1000 · 2000 · 5000 · 10000 hrs
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {engineHoursHealth.map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        'rounded-lg border bg-necl-bg p-3 space-y-2',
                        m.needsReplacement
                          ? 'border-necl-critical/50'
                          : m.isNearOverhaul
                            ? 'border-necl-warning/50'
                            : 'border-necl-border',
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-xs font-semibold text-necl-text">
                            {m.id}
                          </div>
                          <div className="text-xs text-necl-muted">
                            {m.type} · {m.projectId}
                          </div>
                        </div>
                        {m.needsReplacement ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-necl-critical/15 text-necl-critical border border-necl-critical/30 font-semibold">
                            REPLACE
                          </span>
                        ) : m.isNearOverhaul ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-necl-warning/15 text-necl-warning border border-necl-warning/30 font-semibold">
                            OVERHAUL
                          </span>
                        ) : null}
                      </div>
                      <div
                        className={cn(
                          'text-2xl font-bold',
                          m.needsReplacement
                            ? 'text-necl-critical'
                            : m.isNearOverhaul
                              ? 'text-necl-warning'
                              : 'text-necl-text',
                        )}
                      >
                        {m.engineHours.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-necl-muted ml-1">hrs</span>
                      </div>
                      <MiniBar
                        value={m.pctToNext}
                        max={100}
                        color={
                          m.needsReplacement
                            ? '#EF4444'
                            : m.isNearOverhaul
                              ? '#F59E0B'
                              : '#2563EB'
                        }
                      />
                      <div className="text-xs text-necl-muted">
                        Next service at {m.nextInterval.toLocaleString('en-IN')} hrs
                        <span className="text-necl-text font-medium ml-1">
                          (+{m.hoursToNext > 0 ? m.hoursToNext.toLocaleString('en-IN') : 0} to
                          go)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Telemetry Freshness ── */}
              {telemetryHealth.filter(m => m.hoursAgo > 2).length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-necl-warning" />
                    <h2 className="font-semibold text-necl-text">Telemetry Freshness</h2>
                    <span className="text-xs text-necl-muted ml-auto">
                      Machines with signal {'>'} 2h old
                    </span>
                  </div>
                  <div className="divide-y divide-necl-border">
                    {telemetryHealth
                      .filter(m => m.hoursAgo > 2)
                      .map(m => {
                        const op = operatorProfiles.find(o => o.machineId === m.id)
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between py-3 gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'w-2 h-2 rounded-full shrink-0',
                                  m.isDark ? 'bg-necl-critical' : 'bg-necl-warning',
                                )}
                              />
                              <div>
                                <div className="font-mono text-sm font-semibold text-necl-text">
                                  {m.id}
                                </div>
                                <div className="text-xs text-necl-muted">
                                  {m.type} · {m.projectId}
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div
                                className={cn(
                                  'text-sm font-bold',
                                  m.isDark ? 'text-necl-critical' : 'text-necl-warning',
                                )}
                              >
                                {m.hoursAgo}h ago
                              </div>
                              <div className="text-xs text-necl-muted">last signal</div>
                            </div>
                            <StatusPill
                              status={m.status as 'active' | 'idle' | 'maintenance'}
                              size="sm"
                            />
                            <div className="text-xs text-necl-muted text-right">
                              {op?.name ?? m.operator}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* ── Utilization by Project + Machine Type Breakdown ── */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Utilization by Project</h2>
                    <span className="text-xs text-necl-muted ml-auto">Benchmark: 75%</span>
                  </div>
                  <NECLBarChart
                    data={utilizationByProject.map(up => ({
                      project: up.projectId,
                      utilization: up.avgUtil,
                    }))}
                    series={[
                      { key: 'utilization', label: 'Avg Utilization %', color: '#2563EB' },
                    ]}
                    xKey="project"
                    height={200}
                    showLegend={false}
                  />
                </div>

                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Machine Type Breakdown</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-necl-muted border-b border-necl-border">
                          <th className="text-left py-2 pr-3">Type</th>
                          <th className="text-right py-2 pr-3">Count</th>
                          <th className="text-right py-2 pr-3">Avg Util</th>
                          <th className="text-right py-2 pr-3">Benchmark</th>
                          <th className="text-center py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-necl-border">
                        {typeBreakdown.map(row => (
                          <tr key={row.type} className="hover:bg-necl-bg/50">
                            <td className="py-2 pr-3 text-necl-text">{row.type}</td>
                            <td className="py-2 pr-3 text-right text-necl-muted">{row.count}</td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-right font-semibold',
                                row.belowBenchmark ? 'text-necl-critical' : 'text-necl-success',
                              )}
                            >
                              {row.avgUtil}%
                            </td>
                            <td className="py-2 pr-3 text-right text-necl-muted">
                              {row.benchmark}%
                            </td>
                            <td className="py-2 text-center">
                              {row.belowBenchmark ? (
                                <span className="text-necl-critical font-bold">✗</span>
                              ) : (
                                <span className="text-necl-success font-bold">✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ── Maintenance Cost Forecast ── */}
              <div className="grid md:grid-cols-3 gap-4">
                {visibleMaintForecast.map(f => {
                  const isHot = f.window === '0-30d' && f.totalEstimatedCost > 2000000
                  return (
                    <div
                      key={f.window}
                      className={cn(
                        'rounded-xl border p-5 space-y-4',
                        isHot
                          ? 'border-necl-critical/50 bg-necl-critical/5'
                          : 'border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className={cn(
                              'text-xs font-semibold uppercase tracking-wider',
                              isHot ? 'text-necl-critical' : 'text-necl-muted',
                            )}
                          >
                            {f.window === '0-30d'
                              ? 'Next 30 days'
                              : f.window === '30-60d'
                                ? '30–60 days'
                                : '60–90 days'}
                          </div>
                          <div
                            className={cn(
                              'text-2xl font-bold mt-1',
                              isHot ? 'text-necl-critical' : 'text-necl-text',
                            )}
                          >
                            {formatINR(f.totalEstimatedCost)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-necl-text">
                            {f.machines.length}
                          </div>
                          <div className="text-xs text-necl-muted">machines</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {f.machines.map(m => (
                          <div
                            key={m.machineId}
                            className="flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono text-necl-text">
                                {m.machineId.split('-').slice(-1)[0]}
                              </span>
                              <span className="text-necl-muted ml-1">· {m.component}</span>
                            </div>
                            <span className="text-necl-muted shrink-0">
                              {formatINR(m.estimatedCost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── Fleet Status Donut + Utilization Bar ── */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="font-semibold text-necl-text mb-4">Fleet Status Overview</h2>
                  <NECLDonutChart
                    data={donutData}
                    centerLabel="Total"
                    centerValue={String(visibleFleet.length)}
                    height={220}
                  />
                </div>
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="font-semibold text-necl-text mb-4">Utilization Distribution</h2>
                  <NECLBarChart
                    data={visibleFleet.slice(0, 10).map(m => ({
                      machine: m.id.split('-').slice(-1)[0],
                      utilization: m.utilization,
                    }))}
                    series={[{ key: 'utilization', label: 'Utilization %', color: '#2563EB' }]}
                    xKey="machine"
                    height={200}
                    showLegend={false}
                  />
                </div>
              </div>

              {/* ── Machine Table ── */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Machine Registry</h2>
                    <span className="text-xs text-necl-muted">({filteredFleet.length} shown)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['all', 'active', 'idle', 'maintenance'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={cn(
                          'px-3 py-1 rounded-lg text-xs font-medium transition-all capitalize',
                          filterStatus === s
                            ? 'bg-necl-accent text-white'
                            : 'text-necl-muted hover:text-necl-text border border-necl-border',
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-necl-muted border-b border-necl-border">
                        <th className="text-left py-2 pr-3">Machine ID</th>
                        <th className="text-left py-2 pr-3">Brand/Model</th>
                        <th className="text-left py-2 pr-3">Type</th>
                        <th className="text-left py-2 pr-3">Project</th>
                        <th className="text-left py-2 pr-3">Status</th>
                        <th className="text-right py-2 pr-3">Util%</th>
                        <th className="text-right py-2 pr-3">Eng. Hrs</th>
                        <th className="text-right py-2 pr-3">Last Signal</th>
                        <th className="text-right py-2 pr-3">Fuel</th>
                        <th className="text-left py-2 pr-3">PM Due</th>
                        <th className="text-left py-2 pr-3">PM Risk</th>
                        <th className="text-right py-2 pr-3">Idle Cost</th>
                        <th className="text-left py-2">Operator</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-necl-border">
                      {filteredFleet.map(m => {
                        const tEntry = telemetryHealth.find(t => t.id === m.id)
                        const days = daysUntil(m.predictiveMaintenance.dueDate)
                        return (
                          <tr key={m.id} className="hover:bg-necl-bg/50">
                            <td className="py-2 pr-3 font-mono text-necl-text whitespace-nowrap">
                              {m.id}
                            </td>
                            <td className="py-2 pr-3 text-necl-muted whitespace-nowrap">
                              {m.brand} {m.model}
                            </td>
                            <td className="py-2 pr-3 text-necl-muted whitespace-nowrap">
                              {m.type}
                            </td>
                            <td className="py-2 pr-3">
                              <span className="px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                                {m.projectId}
                              </span>
                            </td>
                            <td className="py-2 pr-3">
                              <StatusPill
                                status={m.status as 'active' | 'idle' | 'maintenance'}
                                size="sm"
                              />
                            </td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-right font-semibold',
                                m.utilization >= 80
                                  ? 'text-necl-success'
                                  : m.utilization >= 60
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {m.utilization}%
                            </td>
                            <td className="py-2 pr-3 text-right text-necl-text">
                              {m.engineHours.toLocaleString('en-IN')}
                            </td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-right',
                                tEntry && tEntry.isDark
                                  ? 'text-necl-critical font-semibold'
                                  : tEntry && tEntry.hoursAgo > 2
                                    ? 'text-necl-warning'
                                    : 'text-necl-muted',
                              )}
                            >
                              {tEntry ? `${tEntry.hoursAgo}h` : '-'}
                            </td>
                            <td className="py-2 pr-3 text-right text-necl-muted whitespace-nowrap">
                              {m.fuelEfficiency} {m.fuelEfficiencyUnit}
                            </td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-necl-muted whitespace-nowrap',
                                days < 0
                                  ? 'text-necl-critical font-semibold'
                                  : days <= 14
                                    ? 'text-necl-warning'
                                    : '',
                              )}
                            >
                              {m.predictiveMaintenance.dueDate}
                            </td>
                            <td className="py-2 pr-3">
                              <StatusPill
                                status={
                                  m.predictiveMaintenance.riskLevel as
                                    | 'critical'
                                    | 'high'
                                    | 'medium'
                                    | 'low'
                                }
                                size="sm"
                              />
                            </td>
                            <td className="py-2 pr-3 text-right text-necl-text whitespace-nowrap">
                              {formatINR(m.dailyIdleCost)}
                            </td>
                            <td className="py-2 text-necl-muted whitespace-nowrap">
                              {m.operator}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Fleet Alerts + Recommendations ── */}
              {(fleetAlerts.length > 0 || fleetRecs.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {fleetAlerts.length > 0 && (
                    <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-necl-critical" />
                        <h2 className="font-semibold text-necl-text">Fleet Alerts</h2>
                      </div>
                      <div className="space-y-2">
                        {fleetAlerts.map(a => (
                          <AlertItem key={a.id} alert={a} onView={() => setSelectedAlert(a)} />
                        ))}
                      </div>
                    </div>
                  )}
                  {fleetRecs.length > 0 && (
                    <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-necl-accent" />
                        <h2 className="font-semibold text-necl-text">AI Recommendations</h2>
                      </div>
                      <div className="space-y-2">
                        {fleetRecs.map(r => (
                          <PrescriptiveCard key={r.id} recommendation={r} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: OPERATORS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'operators' && (
            <>
              {/* ── Operator-to-Machine Ratio Strip ── */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-necl-accent" />
                  <h2 className="font-semibold text-necl-text">Operator-to-Machine Ratio</h2>
                </div>
                <div className="flex flex-wrap gap-4">
                  {operatorToMachineRatio.map(r => (
                    <div
                      key={r.projectId}
                      className={cn(
                        'flex-1 min-w-[160px] rounded-lg border p-4 text-center',
                        r.gap > 0
                          ? 'border-necl-critical/50 bg-necl-critical/5'
                          : 'border-necl-border bg-necl-bg',
                      )}
                    >
                      <div className="text-xs text-necl-muted mb-2">{r.projectId}</div>
                      <div className="flex items-center justify-center gap-3">
                        <div>
                          <div className="text-2xl font-bold text-necl-text">{r.machines}</div>
                          <div className="text-xs text-necl-muted">Machines</div>
                        </div>
                        <div className="text-necl-muted">:</div>
                        <div>
                          <div className="text-2xl font-bold text-necl-text">{r.operators}</div>
                          <div className="text-xs text-necl-muted">Operators</div>
                        </div>
                      </div>
                      {r.gap > 0 && (
                        <div className="mt-2 text-xs text-necl-critical font-semibold">
                          {r.gap} machine{r.gap > 1 ? 's' : ''} unattended
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Operator Performance Scorecard ── */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-necl-accent" />
                  <h2 className="font-semibold text-necl-text">Operator Performance Scorecard</h2>
                  <span className="text-xs text-necl-muted ml-auto">
                    Sorted by harsh operation (worst first)
                  </span>
                </div>
                {sortedOperators.length === 0 ? (
                  <p className="text-necl-muted text-sm">
                    No operator data for selected projects.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-necl-muted border-b border-necl-border">
                          <th className="text-left py-2 pr-3">Operator</th>
                          <th className="text-left py-2 pr-3">Machine</th>
                          <th className="text-left py-2 pr-3">Type</th>
                          <th className="text-left py-2 pr-3">Project</th>
                          <th className="text-right py-2 pr-3">Attend%</th>
                          <th className="text-right py-2 pr-3">Shift%</th>
                          <th className="text-right py-2 pr-3">Fuel Var%</th>
                          <th className="text-left py-2 pr-3">Harsh Op</th>
                          <th className="text-left py-2 pr-3">Cert</th>
                          <th className="text-right py-2">Types</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-necl-border">
                        {sortedOperators.map(op => (
                          <tr key={op.machineId} className="hover:bg-necl-bg/50">
                            <td className="py-2 pr-3 font-semibold text-necl-text whitespace-nowrap">
                              {op.name}
                            </td>
                            <td className="py-2 pr-3 font-mono text-necl-muted whitespace-nowrap">
                              {op.machineId}
                            </td>
                            <td className="py-2 pr-3 text-necl-muted whitespace-nowrap">
                              {op.machineType}
                            </td>
                            <td className="py-2 pr-3">
                              <span className="px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                                {op.projectId}
                              </span>
                            </td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-right font-semibold',
                                op.attendanceRate >= 95
                                  ? 'text-necl-success'
                                  : op.attendanceRate >= 85
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {op.attendanceRate}%
                            </td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-right font-semibold',
                                op.shiftAdherenceRate >= 90
                                  ? 'text-necl-success'
                                  : op.shiftAdherenceRate >= 80
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {op.shiftAdherenceRate}%
                            </td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-right font-semibold',
                                op.fuelVariancePct <= 0
                                  ? 'text-necl-success'
                                  : op.fuelVariancePct <= 5
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {op.fuelVariancePct > 0 ? '+' : ''}
                              {op.fuelVariancePct}%
                            </td>
                            <td className="py-2 pr-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'font-semibold',
                                    op.harshOperationIndex <= 2
                                      ? 'text-necl-success'
                                      : op.harshOperationIndex <= 5
                                        ? 'text-necl-warning'
                                        : 'text-necl-critical',
                                  )}
                                >
                                  {op.harshOperationIndex}/10
                                </span>
                                <div className="w-16">
                                  <MiniBar
                                    value={op.harshOperationIndex}
                                    max={10}
                                    color={
                                      op.harshOperationIndex <= 2
                                        ? '#10B981'
                                        : op.harshOperationIndex <= 5
                                          ? '#F59E0B'
                                          : '#EF4444'
                                    }
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2 pr-3">
                              <span
                                className={cn(
                                  'text-[10px] px-1.5 py-0.5 rounded border font-semibold',
                                  op.certStatus === 'valid'
                                    ? 'bg-necl-success/15 text-necl-success border-necl-success/30'
                                    : op.certStatus === 'expiring-soon'
                                      ? 'bg-necl-warning/15 text-necl-warning border-necl-warning/30'
                                      : 'bg-necl-critical/15 text-necl-critical border-necl-critical/30',
                                )}
                              >
                                {op.certStatus === 'valid'
                                  ? 'VALID'
                                  : op.certStatus === 'expiring-soon'
                                    ? 'EXP SOON'
                                    : 'EXPIRED'}
                              </span>
                            </td>
                            <td className="py-2 text-right text-necl-muted">
                              {op.machineTypes.length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── Certification Expiry Tracker ── */}
              {problematicCerts.length > 0 && (
                <div className="rounded-xl border border-necl-warning/30 bg-necl-warning/5 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-necl-warning" />
                    <h2 className="font-semibold text-necl-text">Certification Expiry Tracker</h2>
                    <span className="text-xs text-necl-muted ml-auto">
                      {problematicCerts.length} operators need action
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {problematicCerts.map(op => {
                      const daysToExpiry = daysUntil(op.certExpiryDate)
                      return (
                        <div
                          key={op.machineId}
                          className={cn(
                            'rounded-lg border p-3 space-y-2',
                            op.certStatus === 'expired'
                              ? 'border-necl-critical/40 bg-necl-critical/5'
                              : 'border-necl-warning/40 bg-necl-warning/5',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm text-necl-text">{op.name}</span>
                            <span
                              className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded border font-semibold',
                                op.certStatus === 'expired'
                                  ? 'bg-necl-critical/15 text-necl-critical border-necl-critical/30'
                                  : 'bg-necl-warning/15 text-necl-warning border-necl-warning/30',
                              )}
                            >
                              {op.certStatus === 'expired' ? 'EXPIRED' : 'EXP SOON'}
                            </span>
                          </div>
                          <div className="text-xs text-necl-muted">
                            {op.projectId} · {op.machineId}
                          </div>
                          <div className="text-xs">
                            <span className="text-necl-muted">Cert: </span>
                            <span className="text-necl-text">{op.certifications.join(', ')}</span>
                          </div>
                          <div className="text-xs">
                            <span className="text-necl-muted">Expiry: </span>
                            <span
                              className={cn(
                                'font-semibold',
                                op.certStatus === 'expired'
                                  ? 'text-necl-critical'
                                  : 'text-necl-warning',
                              )}
                            >
                              {op.certExpiryDate}
                            </span>
                            <span className="text-necl-muted ml-2">
                              {daysToExpiry < 0
                                ? `${Math.abs(daysToExpiry)}d overdue`
                                : `${daysToExpiry}d remaining`}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Top vs Bottom Performers ── */}
              {visibleOperators.length >= 3 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-necl-success/30 bg-necl-success/5 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-necl-success" />
                      <h2 className="font-semibold text-necl-text">Top 3 Performers</h2>
                    </div>
                    <div className="space-y-3">
                      {topOperators.map((op, i) => (
                        <div key={op.machineId} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-necl-success/20 text-necl-success text-xs font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-necl-text">{op.name}</div>
                            <div className="text-xs text-necl-muted">
                              {op.projectId} · {op.machineType}
                            </div>
                          </div>
                          <div className="text-right text-xs space-y-0.5">
                            <div>
                              <span className="text-necl-success font-semibold">
                                {op.harshOperationIndex}/10
                              </span>{' '}
                              harsh
                            </div>
                            <div>
                              <span className="text-necl-success font-semibold">
                                {op.attendanceRate}%
                              </span>{' '}
                              attend
                            </div>
                            <div
                              className={
                                op.fuelVariancePct <= 0
                                  ? 'text-necl-success font-semibold'
                                  : 'text-necl-warning font-semibold'
                              }
                            >
                              {op.fuelVariancePct > 0 ? '+' : ''}
                              {op.fuelVariancePct}% fuel
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-necl-critical/30 bg-necl-critical/5 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-necl-critical" />
                      <h2 className="font-semibold text-necl-text">Needs Coaching — Bottom 3</h2>
                    </div>
                    <div className="space-y-3">
                      {bottomOperators.map((op, i) => (
                        <div key={op.machineId} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-necl-critical/20 text-necl-critical text-xs font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-necl-text">{op.name}</div>
                            <div className="text-xs text-necl-muted">
                              {op.projectId} · {op.machineType}
                            </div>
                          </div>
                          <div className="text-right text-xs space-y-0.5">
                            <div>
                              <span className="text-necl-critical font-semibold">
                                {op.harshOperationIndex}/10
                              </span>{' '}
                              harsh
                            </div>
                            <div>
                              <span
                                className={
                                  op.attendanceRate < 85
                                    ? 'text-necl-critical font-semibold'
                                    : 'text-necl-warning font-semibold'
                                }
                              >
                                {op.attendanceRate}%
                              </span>{' '}
                              attend
                            </div>
                            <div
                              className={
                                op.fuelVariancePct > 5
                                  ? 'text-necl-critical font-semibold'
                                  : 'text-necl-warning font-semibold'
                              }
                            >
                              +{op.fuelVariancePct}% fuel
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Multi-Machine Versatility ── */}
              {versatileOperators.length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Multi-Machine Versatility</h2>
                    <span className="text-xs text-necl-muted ml-auto">
                      {versatileOperators.length} certified for multiple types
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {versatileOperators.map(op => (
                      <div
                        key={op.machineId}
                        className="rounded-lg border border-necl-border bg-necl-bg p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-necl-text">{op.name}</span>
                          <span className="px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent text-xs">
                            {op.projectId}
                          </span>
                        </div>
                        <div className="text-xs text-necl-muted">
                          Current: {op.machineType} ({op.machineId})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {op.machineTypes.map(t => (
                            <span
                              key={t}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent border border-necl-accent/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 3: FLEET MANAGERS
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'managers' && (
            <>
              {/* ── Manager Accountability Scorecards ── */}
              <div className="grid md:grid-cols-1 xl:grid-cols-2 gap-4">
                {visibleManagers.length === 0 ? (
                  <p className="text-necl-muted text-sm col-span-2">
                    No fleet manager data for selected projects.
                  </p>
                ) : (
                  visibleManagers.map(fm => {
                    const lastTrend = fm.idleCostWeeklyTrend
                    const trendUp =
                      lastTrend[lastTrend.length - 1] > lastTrend[lastTrend.length - 2]
                    return (
                      <div
                        key={fm.projectId}
                        className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-base font-bold text-necl-text">{fm.name}</div>
                            <span className="text-xs px-2 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                              {fm.projectId}
                            </span>
                          </div>
                          <div className="text-right text-xs text-necl-muted">
                            {fm.machineIds.length} machines
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* PM Compliance */}
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">PM Compliance</div>
                            <div
                              className={cn(
                                'text-2xl font-bold',
                                fm.pmComplianceRate >= 85
                                  ? 'text-necl-success'
                                  : fm.pmComplianceRate >= 70
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {fm.pmComplianceRate}%
                            </div>
                            <MiniBar
                              value={fm.pmComplianceRate}
                              max={100}
                              color={
                                fm.pmComplianceRate >= 85
                                  ? '#10B981'
                                  : fm.pmComplianceRate >= 70
                                    ? '#F59E0B'
                                    : '#EF4444'
                              }
                            />
                          </div>

                          {/* MTBF */}
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">MTBF</div>
                            <div
                              className={cn(
                                'text-2xl font-bold',
                                fm.mtbfHours > 500
                                  ? 'text-necl-success'
                                  : fm.mtbfHours >= 350
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {fm.mtbfHours}h
                            </div>
                            <div className="text-xs text-necl-muted">Benchmark: 400–600h</div>
                          </div>

                          {/* Avg Repair TAT */}
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">Avg Repair TAT</div>
                            <div
                              className={cn(
                                'text-2xl font-bold',
                                fm.avgRepairTATHours < 12
                                  ? 'text-necl-success'
                                  : fm.avgRepairTATHours <= 24
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {fm.avgRepairTATHours}h
                            </div>
                            <div className="text-xs text-necl-muted">
                              {fm.avgRepairTATHours < 12
                                ? 'Excellent'
                                : fm.avgRepairTATHours <= 24
                                  ? 'Acceptable'
                                  : 'Needs improvement'}
                            </div>
                          </div>

                          {/* Fuel Variance */}
                          <div className="rounded-lg bg-necl-bg border border-necl-border p-3 space-y-1">
                            <div className="text-xs text-necl-muted">Fuel Variance</div>
                            <div
                              className={cn(
                                'text-2xl font-bold',
                                fm.fuelVariancePct <= 0
                                  ? 'text-necl-success'
                                  : fm.fuelVariancePct <= 5
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {fm.fuelVariancePct > 0 ? '+' : ''}
                              {fm.fuelVariancePct}%
                            </div>
                          </div>
                        </div>

                        {/* Breakdowns + Work Orders */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Wrench className="w-3 h-3 text-necl-muted" />
                            <span className="text-necl-muted">Breakdowns (90d):</span>
                            <span
                              className={cn(
                                'font-semibold',
                                fm.breakdownsLast90Days > 4
                                  ? 'text-necl-critical'
                                  : fm.breakdownsLast90Days > 2
                                    ? 'text-necl-warning'
                                    : 'text-necl-success',
                              )}
                            >
                              {fm.breakdownsLast90Days}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-necl-muted" />
                            <span className="text-necl-muted">Open WOs:</span>
                            <span
                              className={cn(
                                'font-semibold',
                                fm.openWorkOrders > 3
                                  ? 'text-necl-critical'
                                  : fm.openWorkOrders > 1
                                    ? 'text-necl-warning'
                                    : 'text-necl-success',
                              )}
                            >
                              {fm.openWorkOrders}
                            </span>
                          </div>
                        </div>

                        {/* Idle Cost Trend Sparkline */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-necl-muted">6-Week Idle Cost Trend</div>
                            <div className="text-sm font-semibold text-necl-text mt-0.5">
                              {formatINR(lastTrend[lastTrend.length - 1])}/wk
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Sparkline data={lastTrend} up={trendUp} />
                            {trendUp ? (
                              <TrendingUp className="w-4 h-4 text-necl-critical" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-necl-success" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* ── MTBF Comparison ── */}
              {visibleManagers.length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">MTBF Comparison</h2>
                    <span className="text-xs text-necl-muted ml-auto">
                      Industry benchmark: 400–600 hrs
                    </span>
                  </div>
                  <NECLBarChart
                    data={visibleManagers.map(fm => ({
                      manager: fm.name.split(' ')[0],
                      mtbf: fm.mtbfHours,
                    }))}
                    series={[{ key: 'mtbf', label: 'MTBF (hrs)', color: '#2563EB' }]}
                    xKey="manager"
                    height={200}
                    showLegend={false}
                  />
                </div>
              )}

              {/* ── PM Compliance + Repair TAT ── */}
              {visibleManagers.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-necl-success" />
                      <h2 className="font-semibold text-necl-text">
                        PM Compliance % by Manager
                      </h2>
                    </div>
                    <NECLBarChart
                      data={visibleManagers.map(fm => ({
                        manager: fm.name.split(' ')[0],
                        pmCompliance: fm.pmComplianceRate,
                      }))}
                      series={[
                        { key: 'pmCompliance', label: 'PM Compliance %', color: '#10B981' },
                      ]}
                      xKey="manager"
                      height={180}
                      showLegend={false}
                    />
                  </div>
                  <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-necl-warning" />
                      <h2 className="font-semibold text-necl-text">
                        Avg Repair TAT (hrs) by Manager
                      </h2>
                    </div>
                    <NECLBarChart
                      data={visibleManagers.map(fm => ({
                        manager: fm.name.split(' ')[0],
                        tat: fm.avgRepairTATHours,
                      }))}
                      series={[{ key: 'tat', label: 'Avg Repair TAT (hrs)', color: '#F59E0B' }]}
                      xKey="manager"
                      height={180}
                      showLegend={false}
                    />
                  </div>
                </div>
              )}

              {/* ── Idle Cost Trend by Manager ── */}
              {visibleManagers.length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-necl-warning" />
                    <h2 className="font-semibold text-necl-text">
                      Idle Cost Trend — 6-Week View
                    </h2>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                    {visibleManagers.map(fm => {
                      const trend = fm.idleCostWeeklyTrend
                      const latest = trend[trend.length - 1]
                      const prev = trend[trend.length - 2]
                      const trendUp = latest > prev
                      const total6wk = trend.reduce((s, v) => s + v, 0)
                      return (
                        <div
                          key={fm.projectId}
                          className="rounded-lg border border-necl-border bg-necl-bg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-necl-text">
                                {fm.name.split(' ')[0]}
                              </div>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent">
                                {fm.projectId}
                              </span>
                            </div>
                            {trendUp ? (
                              <TrendingUp className="w-4 h-4 text-necl-critical" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-necl-success" />
                            )}
                          </div>
                          <div>
                            <div className="text-lg font-bold text-necl-text">
                              {formatINR(latest)}
                            </div>
                            <div className="text-xs text-necl-muted">this week</div>
                          </div>
                          <Sparkline data={trend} up={trendUp} />
                          <div className="text-xs text-necl-muted">
                            6-wk total:{' '}
                            <span className="text-necl-text font-medium">
                              {formatINR(total6wk)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Fleet Productivity Index ── */}
              {fleetProductivity.length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-necl-accent" />
                    <h2 className="font-semibold text-necl-text">Fleet Productivity Index</h2>
                    <span className="text-xs text-necl-muted ml-auto">
                      Weekly progress delta ÷ fleet utilization
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-necl-muted text-xs border-b border-necl-border">
                          <th className="text-left py-2 pr-3">Rank</th>
                          <th className="text-left py-2 pr-3">Project</th>
                          <th className="text-right py-2 pr-3">Fleet Util %</th>
                          <th className="text-right py-2 pr-3">Weekly Progress Δ</th>
                          <th className="text-right py-2">Productivity Index</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-necl-border">
                        {fleetProductivity.map((row, i) => (
                          <tr key={row.projectId} className="hover:bg-necl-bg/50">
                            <td className="py-2 pr-3 text-necl-muted text-sm">#{i + 1}</td>
                            <td className="py-2 pr-3">
                              <span className="px-1.5 py-0.5 rounded bg-necl-accent/10 text-necl-accent text-xs">
                                {row.projectId}
                              </span>
                            </td>
                            <td
                              className={cn(
                                'py-2 pr-3 text-right font-semibold text-sm',
                                row.avgUtil >= 80
                                  ? 'text-necl-success'
                                  : row.avgUtil >= 65
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {row.avgUtil}%
                            </td>
                            <td className="py-2 pr-3 text-right text-necl-text text-sm">
                              +{row.weeklyDelta}%
                            </td>
                            <td
                              className={cn(
                                'py-2 text-right font-bold text-sm',
                                row.productivityIndex > 3
                                  ? 'text-necl-success'
                                  : row.productivityIndex > 1.5
                                    ? 'text-necl-warning'
                                    : 'text-necl-critical',
                              )}
                            >
                              {row.productivityIndex.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Alert Drawer ── */}
      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
