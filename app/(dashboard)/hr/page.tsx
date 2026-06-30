'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, AlertTriangle, TrendingUp, TrendingDown, Shield, BookOpen,
  MapPin, Star, Clock, Zap, ChevronRight, Award, Target,
  BarChart3, UserCheck, Briefcase, Activity,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { StatusPill } from '@/components/ui/StatusPill'
import { NECLBarChart } from '@/components/charts/BarChart'
import { NECLAreaChart } from '@/components/charts/AreaChart'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { employees } from '@/lib/mock-data/hr'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { projects } from '@/lib/mock-data/projects'
import {
  headcountPlan, weeklyAttendanceTrend, pmScorecards, keyManRisks,
  skillInventory, remoteHardshipRecords, reviewCompliance,
  workforceDemandForecast, trainingDue, salaryBandAnalysis,
} from '@/lib/mock-data/hr-extended'
import { formatINR, cn } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'

const PROJECT_COLORS: Record<string, string> = {
  'HYD-M3': '#2563EB',
  'BMRC-E2': '#10B981',
  'NH-44X': '#8B5CF6',
  'KDSP-B1': '#EF4444',
  'CHN-FLY': '#F59E0B',
  'MUM-CST': '#06B6D4',
  'RLWY-G4': '#F97316',
  'VIZG-P2': '#84CC16',
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="26" fill="none" stroke="#374151" strokeWidth="5" />
      <circle
        cx="32" cy="32" r="26" fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${score} 100`}
        pathLength="100"
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="32" textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize="13" fontWeight="bold" fontFamily="system-ui">
        {score}
      </text>
    </svg>
  )
}

export default function HRPage() {
  const { role, selectedProjects } = useApp()
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'planning' | 'compliance'>('overview')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const isSiteManager = role === 'site-manager'
  const effectiveProjects = isSiteManager ? ['KDSP-B1'] : selectedProjects

  // ── Core filters ──────────────────────────────────────────────────────────
  const visibleEmployees = useMemo(
    () => employees.filter(e => effectiveProjects.includes(e.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const visibleProjects = useMemo(
    () => projects.filter(p => effectiveProjects.includes(p.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalHeadcount = useMemo(
    () => visibleProjects.reduce((s, p) => s + p.crewCount, 0),
    [visibleProjects],
  )
  const highAttrition = useMemo(
    () => visibleEmployees.filter(e => e.attritionRisk === 'high').length,
    [visibleEmployees],
  )
  const mediumAttrition = useMemo(
    () => visibleEmployees.filter(e => e.attritionRisk === 'medium').length,
    [visibleEmployees],
  )
  const avgAttendance = useMemo(
    () => visibleEmployees.length ? Math.round(visibleEmployees.reduce((s, e) => s + e.attendance, 0) / visibleEmployees.length) : 0,
    [visibleEmployees],
  )
  const avgProductivity = useMemo(
    () => visibleEmployees.length ? Math.round(visibleEmployees.reduce((s, e) => s + e.productivity, 0) / visibleEmployees.length) : 0,
    [visibleEmployees],
  )
  const attritionIndex = useMemo(
    () => visibleEmployees.length ? parseFloat(((highAttrition * 3 + mediumAttrition * 1.5) / visibleEmployees.length * 2).toFixed(1)) : 0,
    [highAttrition, mediumAttrition, visibleEmployees],
  )

  // ── Headcount ─────────────────────────────────────────────────────────────
  const visibleHeadcount = useMemo(
    () => headcountPlan.filter(h => effectiveProjects.includes(h.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const totalHeadcountGap = useMemo(
    () => visibleHeadcount.reduce((s, h) => s + h.gap, 0),
    [visibleHeadcount],
  )
  const totalVacancies = useMemo(
    () => visibleHeadcount.reduce((s, h) => s + h.criticalVacancies.length, 0),
    [visibleHeadcount],
  )

  // ── Attendance trends ─────────────────────────────────────────────────────
  const visibleTrends = useMemo(
    () => weeklyAttendanceTrend.filter(t => effectiveProjects.includes(t.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const attendanceChartData = useMemo(
    () => ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'].map((w, i) => {
      const row: Record<string, string | number> = { week: w }
      visibleTrends.forEach(t => { row[t.projectId] = t.attendance[i] })
      return row
    }),
    [visibleTrends],
  )
  const attendanceSeries = useMemo(
    () => visibleTrends.map(t => ({ key: t.projectId, label: t.projectId, color: PROJECT_COLORS[t.projectId] ?? '#666' })),
    [visibleTrends],
  )

  // ── PM Scorecards ─────────────────────────────────────────────────────────
  const visiblePMScores = useMemo(
    () => [...pmScorecards.filter(p => effectiveProjects.includes(p.projectId))].sort((a, b) => a.overallScore - b.overallScore),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )

  // ── Key man risk ──────────────────────────────────────────────────────────
  const visibleKeyManRisks = useMemo(
    () => keyManRisks.filter(k => effectiveProjects.includes(k.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const criticalRisks = useMemo(
    () => visibleKeyManRisks.filter(k => k.riskQuadrant === 'critical'),
    [visibleKeyManRisks],
  )

  // ── Review compliance ─────────────────────────────────────────────────────
  const visibleReviews = useMemo(
    () => [...reviewCompliance.filter(r => effectiveProjects.includes(r.projectId))].sort((a, b) => b.monthsOverdue - a.monthsOverdue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const overdueReviews = useMemo(
    () => visibleReviews.filter(r => r.status === 'overdue' || r.status === 'critical-overdue'),
    [visibleReviews],
  )

  // ── Training ──────────────────────────────────────────────────────────────
  const visibleTraining = useMemo(
    () => [...trainingDue.filter(t => effectiveProjects.includes(t.projectId))].sort((a, b) => b.daysOverdue - a.daysOverdue),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const overdueTraining = useMemo(
    () => visibleTraining.filter(t => t.daysOverdue > 0),
    [visibleTraining],
  )

  // ── Workforce demand ──────────────────────────────────────────────────────
  const visibleDemand = useMemo(
    () => workforceDemandForecast.filter(d => effectiveProjects.includes(d.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const windingDownProjects = useMemo(
    () => visibleDemand.filter(d => d.action === 'wind-down'),
    [visibleDemand],
  )
  const rampingUpProjects = useMemo(
    () => visibleDemand.filter(d => d.action === 'ramp-up'),
    [visibleDemand],
  )
  const demandForecastChartData = useMemo(
    () => (['Now', '30d', '60d', '90d'] as const).map((p, i) => {
      const row: Record<string, string | number> = { period: p }
      visibleDemand.forEach(d => {
        row[d.projectId] = i === 0 ? d.currentHeadcount : i === 1 ? d.forecast30d : i === 2 ? d.forecast60d : d.forecast90d
      })
      return row
    }),
    [visibleDemand],
  )
  const demandForecastSeries = useMemo(
    () => visibleDemand.map(d => ({ key: d.projectId, label: d.projectId, color: PROJECT_COLORS[d.projectId] ?? '#666' })),
    [visibleDemand],
  )

  // ── Salary bands ──────────────────────────────────────────────────────────
  const visibleSalaryBands = useMemo(
    () => salaryBandAnalysis.map(band => ({
      ...band,
      employees: band.employees.filter(e => effectiveProjects.includes(e.projectId)),
    })).filter(band => band.employees.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )

  // ── Remote hardship ───────────────────────────────────────────────────────
  const visibleHardship = useMemo(
    () => remoteHardshipRecords.filter(r => effectiveProjects.includes(r.projectId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )

  // ── Department summaries (dynamic) ────────────────────────────────────────
  const visibleDeptSummaries = useMemo(() => {
    const deptMap: Record<string, { count: number; attTotal: number; prodTotal: number; highAtt: number; medAtt: number; salaryTotal: number; overdueRev: number }> = {}
    visibleEmployees.forEach(e => {
      if (!deptMap[e.department]) deptMap[e.department] = { count: 0, attTotal: 0, prodTotal: 0, highAtt: 0, medAtt: 0, salaryTotal: 0, overdueRev: 0 }
      const d = deptMap[e.department]
      d.count++; d.attTotal += e.attendance; d.prodTotal += e.productivity; d.salaryTotal += e.salary
      if (e.attritionRisk === 'high') d.highAtt++
      if (e.attritionRisk === 'medium') d.medAtt++
      const rev = reviewCompliance.find(r => r.employeeId === e.id)
      if (rev && (rev.status === 'overdue' || rev.status === 'critical-overdue')) d.overdueRev++
    })
    return Object.entries(deptMap).map(([dept, d]) => ({
      department: dept,
      employeeCount: d.count,
      avgAttendance: Math.round(d.attTotal / d.count),
      avgProductivity: Math.round(d.prodTotal / d.count),
      highAttritionCount: d.highAtt,
      mediumAttritionCount: d.medAtt,
      avgSalary: Math.round(d.salaryTotal / d.count),
      overdueReviews: d.overdueRev,
    }))
  }, [visibleEmployees])

  // ── Payroll ───────────────────────────────────────────────────────────────
  const totalMonthlyPayroll = useMemo(
    () => visibleEmployees.reduce((s, e) => s + e.salary / 12, 0),
    [visibleEmployees],
  )

  // ── Alerts & recs ─────────────────────────────────────────────────────────
  const hrAlerts = useMemo(
    () => alerts.filter(a => a.department === 'hr' && effectiveProjects.includes(a.projectId ?? '')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const hrRecs = useMemo(
    () => recommendations.filter(r => r.department === 'HR' && effectiveProjects.includes(r.projectId ?? '')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )

  // ── Skills ────────────────────────────────────────────────────────────────
  const visibleSkills = useMemo(
    () => skillInventory.filter(s => s.projects.some(pid => effectiveProjects.includes(pid))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(',')],
  )
  const singlePointSkills = useMemo(
    () => visibleSkills.filter(s => s.singlePointOfFailure),
    [visibleSkills],
  )

  // ── Attrition by project ──────────────────────────────────────────────────
  const attritionRiskChartData = useMemo(
    () => effectiveProjects.map(pid => ({
      project: pid,
      High: visibleEmployees.filter(e => e.projectId === pid && e.attritionRisk === 'high').length,
      Medium: visibleEmployees.filter(e => e.projectId === pid && e.attritionRisk === 'medium').length,
      Low: visibleEmployees.filter(e => e.projectId === pid && e.attritionRisk === 'low').length,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveProjects.join(','), visibleEmployees],
  )

  // ── Succession ────────────────────────────────────────────────────────────
  const noSuccessorPMs = useMemo(
    () => visiblePMScores.filter(p => !p.successionBackup || p.successionBackup === null),
    [visiblePMScores],
  )
  const successionReplacementCost = useMemo(
    () => noSuccessorPMs.reduce((sum, p) => {
      const risk = keyManRisks.find(k => k.employeeId === p.employeeId)
      return sum + (risk?.replacementCost ?? 0)
    }, 0),
    [noSuccessorPMs],
  )

  // ── Salary scatter data (productivity > 0 employees) ─────────────────────
  const salaryScatterEmployees = useMemo(
    () => visibleEmployees.filter(e => e.productivity > 0),
    [visibleEmployees],
  )

  // ── EARLY RETURN ─────────────────────────────────────────────────────────
  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">HR 360°</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  // ── Tab config ────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Users },
    { id: 'performance' as const, label: 'Performance & Risk', icon: Target },
    { id: 'planning' as const, label: 'Workforce Planning', icon: Briefcase },
    { id: 'compliance' as const, label: 'Compliance & Succession', icon: Shield },
  ]

  const quadrantColor = (q: string) => q === 'critical' ? '#EF4444' : q === 'watch' ? '#F59E0B' : q === 'monitor' ? '#3B82F6' : '#10B981'
  const quadrantLabel = (q: string) => q === 'critical' ? 'CRITICAL' : q === 'watch' ? 'WATCH' : q === 'monitor' ? 'MONITOR' : 'SAFE'

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">HR 360°</h1>
          <span className="text-sm text-necl-muted">
            {effectiveProjects.length} project{effectiveProjects.length !== 1 ? 's' : ''} · {totalHeadcount.toLocaleString('en-IN')} workforce · as of 30 Jun 2026
          </span>
        </div>
        {criticalRisks.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-necl-critical/10 border border-necl-critical/30 text-necl-critical text-xs font-semibold animate-pulse-glow">
            <AlertTriangle className="w-3.5 h-3.5" />
            {criticalRisks.length} critical people risk{criticalRisks.length !== 1 ? 's' : ''} — action required
          </div>
        )}
      </div>

      {/* ── Advisory ────────────────────────────────────────────────────────── */}
      <div className="p-3 rounded-xl border border-necl-border bg-necl-accent/5 text-necl-muted text-xs">
        Insights are advisory, transparent to the individual, and require manager judgment. No ranking or punitive framing is used in individual feedback.
      </div>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-necl-bg)] border border-[var(--color-necl-border)] w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                activeTab === tab.id ? 'bg-necl-accent text-white shadow-sm' : 'text-necl-muted hover:text-necl-text',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >

          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">

              {/* KPI Grid — Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPITile
                  label="Total Workforce"
                  value={totalHeadcount.toLocaleString('en-IN')}
                  subtitle={`Across ${effectiveProjects.length} projects`}
                  status="green"
                  sparklineData={[1950, 2050, 2150, 2200, 2280, 2350, totalHeadcount]}
                />
                <KPITile
                  label="Avg Attendance"
                  value={`${avgAttendance}%`}
                  subtitle="7-week rolling"
                  status={avgAttendance >= 94 ? 'green' : avgAttendance >= 88 ? 'amber' : 'red'}
                  sparklineData={[92, 92, 93, 93, 92, 93, avgAttendance]}
                />
                <KPITile
                  label="Attrition Index"
                  value={`${attritionIndex}/10`}
                  subtitle={`${highAttrition} critical · ${mediumAttrition} watch`}
                  status={attritionIndex > 7 ? 'red' : attritionIndex > 4 ? 'amber' : 'green'}
                  sparklineData={[3.2, 3.8, 4.1, 4.5, 5.0, 5.2, attritionIndex]}
                  sparklineColor="#F59E0B"
                />
                <KPITile
                  label="Avg Productivity"
                  value={`${avgProductivity}%`}
                  subtitle="vs plan, across staff"
                  status={avgProductivity >= 85 ? 'green' : avgProductivity >= 70 ? 'amber' : 'red'}
                  sparklineData={[82, 83, 83, 82, 81, 80, avgProductivity]}
                />
              </div>

              {/* KPI Grid — Row 2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPITile
                  label="Critical Vacancies"
                  value={`${totalVacancies}`}
                  subtitle="Unfilled key roles"
                  status={totalVacancies > 3 ? 'red' : totalVacancies > 0 ? 'amber' : 'green'}
                  sparklineData={[4, 5, 6, 7, 8, 9, totalVacancies]}
                  sparklineColor="#EF4444"
                />
                <KPITile
                  label="Headcount Gap"
                  value={`${Math.abs(totalHeadcountGap)}${totalHeadcountGap < 0 ? ' understaffed' : ' surplus'}`}
                  subtitle="Vs approved plan"
                  status={totalHeadcountGap < -10 ? 'red' : totalHeadcountGap < 0 ? 'amber' : 'green'}
                />
                <KPITile
                  label="Overdue Reviews"
                  value={`${overdueReviews.length}`}
                  subtitle="Performance reviews lapsed"
                  status={overdueReviews.length > 3 ? 'red' : overdueReviews.length > 0 ? 'amber' : 'green'}
                  sparklineData={[5, 8, 12, 16, 20, 24, overdueReviews.length]}
                  sparklineColor="#EF4444"
                />
                <KPITile
                  label="Monthly Payroll"
                  value={formatINR(totalMonthlyPayroll)}
                  subtitle="Direct cost — visible staff"
                  status="blue"
                />
              </div>

              {/* Project-level Workforce Health */}
              <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
                <div className="px-5 py-4 border-b border-necl-border flex items-center gap-2">
                  <Activity className="w-4 h-4 text-necl-accent" />
                  <div>
                    <h2 className="text-sm font-bold text-necl-text">Project-level Workforce Health</h2>
                    <p className="text-[10px] text-necl-muted mt-0.5">Crew · attendance · attrition · vacancy · demand signal</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Project', 'Status', 'Crew (Actual)', 'Planned', 'Gap', 'Avg Att 7w', 'Attrition %', 'Vacancies', 'Demand Trend'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {effectiveProjects.map(pid => {
                        const proj = visibleProjects.find(p => p.id === pid)
                        const hcp = visibleHeadcount.find(h => h.projectId === pid)
                        const trend = visibleTrends.find(t => t.projectId === pid)
                        const demand = visibleDemand.find(d => d.projectId === pid)
                        const projEmps = visibleEmployees.filter(e => e.projectId === pid)
                        const highRiskPct = projEmps.length > 0 ? Math.round((projEmps.filter(e => e.attritionRisk === 'high').length + projEmps.filter(e => e.attritionRisk === 'medium').length) / projEmps.length * 100) : 0
                        const avgAtt7w = trend ? Math.round(trend.attendance.reduce((s, v) => s + v, 0) / 7) : 0
                        const gap = hcp?.gap ?? 0
                        const isWindingDown = hcp?.windingDown ?? false
                        return (
                          <tr key={pid} className="border-b border-necl-border/50 hover:bg-necl-bg">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-necl-accent">{pid}</span>
                                {isWindingDown && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-necl-warning/20 text-necl-warning font-bold">WINDING DOWN</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <StatusPill status={(proj?.status ?? 'on-track') as 'on-track' | 'at-risk' | 'delayed'} size="sm" />
                            </td>
                            <td className="px-4 py-3 font-semibold text-necl-text">{hcp?.actualHeadcount.toLocaleString('en-IN') ?? '—'}</td>
                            <td className="px-4 py-3 text-necl-muted">{hcp?.plannedHeadcount.toLocaleString('en-IN') ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className={cn('font-bold', gap < -10 ? 'text-necl-critical' : gap < 0 ? 'text-necl-warning' : 'text-necl-success')}>
                                {gap > 0 ? `+${gap}` : gap}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn('font-semibold', avgAtt7w >= 94 ? 'text-necl-success' : avgAtt7w >= 88 ? 'text-necl-warning' : 'text-necl-critical')}>
                                {avgAtt7w}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn('font-semibold', highRiskPct > 30 ? 'text-necl-critical' : highRiskPct > 15 ? 'text-necl-warning' : 'text-necl-success')}>
                                {highRiskPct}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {hcp && hcp.criticalVacancies.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {hcp.criticalVacancies.slice(0, 2).map((v, i) => (
                                    <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-necl-critical/15 text-necl-critical">{v}</span>
                                  ))}
                                  {hcp.criticalVacancies.length > 2 && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-necl-critical/15 text-necl-critical">+{hcp.criticalVacancies.length - 2}</span>
                                  )}
                                </div>
                              ) : <span className="text-necl-success text-[10px]">None</span>}
                            </td>
                            <td className="px-4 py-3">
                              {demand?.action === 'ramp-up' && <span className="flex items-center gap-1 text-necl-success font-semibold"><TrendingUp className="w-3 h-3" /> Ramp-up</span>}
                              {demand?.action === 'wind-down' && <span className="flex items-center gap-1 text-necl-critical font-semibold animate-pulse"><TrendingDown className="w-3 h-3" /> Wind-down</span>}
                              {demand?.action === 'stable' && <span className="text-necl-muted font-medium">— Stable</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 7-Week Attendance Trend */}
              <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-necl-accent" />
                  <h2 className="text-sm font-bold text-necl-text">7-Week Attendance Trend</h2>
                </div>
                <p className="text-[10px] text-necl-muted mb-4">KDSP-B1 and RLWY-G4 declining — intervention required</p>
                {visibleTrends.length > 0 ? (
                  <NECLAreaChart
                    data={attendanceChartData}
                    series={attendanceSeries}
                    xKey="week"
                    height={220}
                    formatValue={(v) => `${v}%`}
                  />
                ) : (
                  <p className="text-sm text-necl-muted text-center py-8">No attendance data for selected projects</p>
                )}
              </div>

              {/* Department Summary Cards */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 text-necl-accent" />
                  <h2 className="text-sm font-bold text-necl-text">Department Summary</h2>
                  <span className="text-[10px] text-necl-muted">Filtered to selected projects</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {visibleDeptSummaries.map(dept => (
                    <div key={dept.department} className="rounded-xl border border-necl-border bg-necl-surface p-4">
                      <p className="text-xs font-bold text-necl-text capitalize mb-3">{dept.department}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px] text-necl-muted">Headcount</span>
                          <span className="text-[10px] font-bold text-necl-text">{dept.employeeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-necl-muted">Avg Attendance</span>
                          <span className={cn('text-[10px] font-bold', dept.avgAttendance >= 94 ? 'text-necl-success' : dept.avgAttendance >= 88 ? 'text-necl-warning' : 'text-necl-critical')}>
                            {dept.avgAttendance}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-necl-muted">Avg Productivity</span>
                          <span className={cn('text-[10px] font-bold', dept.avgProductivity >= 85 ? 'text-necl-success' : 'text-necl-warning')}>
                            {dept.avgProductivity}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-necl-muted">Attrition Risk</span>
                          <span className={cn('text-[10px] font-bold', dept.highAttritionCount > 0 ? 'text-necl-critical' : dept.mediumAttritionCount > 0 ? 'text-necl-warning' : 'text-necl-success')}>
                            {dept.highAttritionCount}H · {dept.mediumAttritionCount}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-necl-muted">Overdue Reviews</span>
                          <span className={cn('text-[10px] font-bold', dept.overdueReviews > 0 ? 'text-necl-critical' : 'text-necl-success')}>
                            {dept.overdueReviews}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-necl-muted">Avg Salary</span>
                          <span className="text-[10px] font-bold text-necl-accent">{formatINR(dept.avgSalary)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts + Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-necl-border bg-necl-surface">
                  <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-border">
                    <AlertTriangle className="w-4 h-4 text-necl-warning" />
                    <h2 className="text-sm font-bold text-necl-text">People Alerts</h2>
                  </div>
                  <div className="p-3 space-y-2">
                    {hrAlerts.length > 0 ? hrAlerts.map(a => (
                      <AlertItem key={a.id} alert={a} onView={setSelectedAlert} />
                    )) : (
                      <p className="text-sm text-necl-muted p-4 text-center">No HR alerts for selected projects</p>
                    )}
                  </div>
                </div>
                {hrRecs.length > 0 && (
                  <div className="space-y-3">
                    {hrRecs.slice(0, 2).map(r => (
                      <PrescriptiveCard key={r.id} recommendation={r} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: PERFORMANCE & RISK
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'performance' && (
            <div className="space-y-6">

              {/* PM Scorecards */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-necl-accent" />
                  <div>
                    <h2 className="text-sm font-bold text-necl-text">PM Performance Scorecards</h2>
                    <p className="text-[10px] text-necl-muted">Sorted: lowest overall score first — requires most attention</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {visiblePMScores.map(pm => (
                    <div key={pm.employeeId} className={cn(
                      'rounded-xl border bg-necl-surface p-5',
                      pm.overallScore < 50 ? 'border-necl-critical/50' : pm.overallScore < 70 ? 'border-necl-warning/40' : 'border-necl-border',
                    )}>
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <ScoreRing score={pm.overallScore} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-bold text-necl-text">{pm.name}</p>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-necl-accent/15 text-necl-accent">{pm.projectId}</span>
                            <span className="text-[10px] text-necl-muted">{pm.role}</span>
                          </div>
                          <p className="text-[10px] text-necl-muted">Overall Score: <span className={cn('font-bold', pm.overallScore >= 80 ? 'text-necl-success' : pm.overallScore >= 60 ? 'text-necl-warning' : 'text-necl-critical')}>{pm.overallScore}/100</span></p>
                        </div>
                      </div>

                      {/* 5-metric strip */}
                      <div className="grid grid-cols-5 gap-2 mb-4 p-3 rounded-lg bg-necl-bg border border-necl-border">
                        <div className="text-center">
                          <p className="text-[9px] text-necl-muted mb-1">Schedule</p>
                          <span className={cn('text-[11px] font-bold', pm.scheduleVarianceDays > 30 ? 'text-necl-critical' : pm.scheduleVarianceDays > 0 ? 'text-necl-warning' : 'text-necl-success')}>
                            {pm.scheduleVarianceDays > 0 ? `+${pm.scheduleVarianceDays}d` : `${pm.scheduleVarianceDays}d`}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-necl-muted mb-1">Cost</p>
                          <span className={cn('text-[11px] font-bold', pm.costVariancePct > 5 ? 'text-necl-critical' : pm.costVariancePct > 0 ? 'text-necl-warning' : 'text-necl-success')}>
                            {pm.costVariancePct > 0 ? `+${pm.costVariancePct}%` : `${pm.costVariancePct}%`}
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-necl-muted mb-1">Team Risk</p>
                          <span className={cn('text-[11px] font-bold', pm.teamAttritionRisk > 30 ? 'text-necl-critical' : pm.teamAttritionRisk > 15 ? 'text-necl-warning' : 'text-necl-success')}>
                            {pm.teamAttritionRisk}%
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-necl-muted mb-1">Safety</p>
                          <span className={cn('text-[11px] font-bold', pm.safetyScore >= 90 ? 'text-necl-success' : pm.safetyScore >= 75 ? 'text-necl-warning' : 'text-necl-critical')}>
                            {pm.safetyScore}/100
                          </span>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-necl-muted mb-1">Client Sat</p>
                          <span className={cn('text-[11px] font-bold', pm.clientSatisfactionScore >= 8 ? 'text-necl-success' : pm.clientSatisfactionScore >= 6 ? 'text-necl-warning' : 'text-necl-critical')}>
                            {pm.clientSatisfactionScore}/10
                          </span>
                        </div>
                      </div>

                      {/* Strengths */}
                      <div className="mb-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-necl-muted mb-1.5">Strengths</p>
                        <div className="flex flex-wrap gap-1">
                          {pm.strengths.map((s, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-necl-success/15 text-necl-success border border-necl-success/30">{s}</span>
                          ))}
                        </div>
                      </div>

                      {/* Development */}
                      <div className="mb-3">
                        <p className="text-[9px] font-semibold uppercase tracking-wider text-necl-muted mb-1.5">Development Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {pm.developmentAreas.map((d, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-necl-warning/15 text-necl-warning border border-necl-warning/30">{d}</span>
                          ))}
                        </div>
                      </div>

                      {/* Succession */}
                      <div className="flex items-center justify-between pt-3 border-t border-necl-border">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-necl-muted" />
                          <span className="text-[10px] text-necl-muted">Successor:</span>
                          {pm.successionBackup ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-necl-success/15 text-necl-success">{pm.successionBackup}</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-necl-critical/15 text-necl-critical animate-pulse">No backup identified</span>
                          )}
                        </div>
                        <span className={cn('text-[10px] font-semibold', pm.productivityVsPlan >= 0 ? 'text-necl-success' : 'text-necl-critical')}>
                          Prod: {pm.productivityVsPlan >= 0 ? `+${pm.productivityVsPlan}%` : `${pm.productivityVsPlan}%`}
                        </span>
                      </div>

                      {/* Coaching note */}
                      <div className="mt-3 p-2.5 rounded-lg bg-necl-accent/5 border border-necl-accent/20">
                        <p className="text-[10px] text-necl-muted">
                          <span className="text-necl-accent font-semibold">Coaching: </span>
                          {employees.find(e => e.id === pm.employeeId)?.coachingSuggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Man Risk Matrix */}
              <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-necl-accent" />
                  <h2 className="text-sm font-bold text-necl-text">Key Man Risk Matrix</h2>
                </div>
                <p className="text-[10px] text-necl-muted mb-4">X = attrition probability · Y = impact score · Dot size = replacement cost</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SVG scatter */}
                  <div>
                    {visibleKeyManRisks.length > 0 ? (
                      <svg viewBox="0 0 320 240" className="w-full max-w-md" style={{ minHeight: 200 }}>
                        {/* Quadrant fills */}
                        <rect x="50" y="15" width="115" height="105" fill="#F59E0B" fillOpacity="0.06" />
                        <rect x="165" y="15" width="140" height="105" fill="#EF4444" fillOpacity="0.08" />
                        <rect x="50" y="120" width="115" height="90" fill="#10B981" fillOpacity="0.06" />
                        <rect x="165" y="120" width="140" height="90" fill="#3B82F6" fillOpacity="0.06" />
                        {/* Quadrant labels */}
                        <text x="108" y="28" textAnchor="middle" fill="#F59E0B" fontSize="8" fontWeight="bold" fontFamily="system-ui">WATCH</text>
                        <text x="235" y="28" textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="bold" fontFamily="system-ui">CRITICAL</text>
                        <text x="108" y="205" textAnchor="middle" fill="#10B981" fontSize="8" fontWeight="bold" fontFamily="system-ui">SAFE</text>
                        <text x="235" y="205" textAnchor="middle" fill="#3B82F6" fontSize="8" fontWeight="bold" fontFamily="system-ui">MONITOR</text>
                        {/* Dividers */}
                        <line x1="165" y1="15" x2="165" y2="210" stroke="#374151" strokeWidth="0.5" strokeDasharray="3 3" />
                        <line x1="50" y1="120" x2="305" y2="120" stroke="#374151" strokeWidth="0.5" strokeDasharray="3 3" />
                        {/* Axes */}
                        <line x1="50" y1="210" x2="305" y2="210" stroke="#4B5563" strokeWidth="1" />
                        <line x1="50" y1="15" x2="50" y2="210" stroke="#4B5563" strokeWidth="1" />
                        {/* Axis labels */}
                        <text x="177" y="225" textAnchor="middle" fill="#6B7280" fontSize="8" fontFamily="system-ui">Attrition Probability →</text>
                        <text x="18" y="112" textAnchor="middle" fill="#6B7280" fontSize="8" fontFamily="system-ui" transform="rotate(-90 18 112)">Impact Score →</text>
                        {/* X axis ticks */}
                        {[0, 25, 50, 75, 100].map(v => (
                          <g key={v}>
                            <line x1={50 + (v / 100) * 255} y1="210" x2={50 + (v / 100) * 255} y2="213" stroke="#4B5563" strokeWidth="0.5" />
                            <text x={50 + (v / 100) * 255} y="221" textAnchor="middle" fill="#6B7280" fontSize="7" fontFamily="system-ui">{v}%</text>
                          </g>
                        ))}
                        {/* Y axis ticks */}
                        {[1, 3, 5, 7, 10].map(v => {
                          const y = 210 - ((v - 1) / 9) * 195
                          return (
                            <g key={v}>
                              <line x1="47" y1={y} x2="50" y2={y} stroke="#4B5563" strokeWidth="0.5" />
                              <text x="44" y={y + 3} textAnchor="end" fill="#6B7280" fontSize="7" fontFamily="system-ui">{v}</text>
                            </g>
                          )
                        })}
                        {/* Dots */}
                        {visibleKeyManRisks.map(k => {
                          const x = 50 + (k.attritionProbability / 100) * 255
                          const y = 210 - ((k.impactScore - 1) / 9) * 195
                          const minCost = 120000, maxCost = 6000000
                          const r = 4 + ((k.replacementCost - minCost) / (maxCost - minCost)) * 12
                          const color = quadrantColor(k.riskQuadrant)
                          return (
                            <g key={k.employeeId}>
                              <circle cx={x} cy={y} r={r} fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
                              <text x={x} y={y - r - 2} textAnchor="middle" fill={color} fontSize="7" fontWeight="bold" fontFamily="system-ui">
                                {k.name.split(' ')[0]}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    ) : (
                      <p className="text-sm text-necl-muted text-center py-8">No key man risks for selected projects</p>
                    )}
                  </div>

                  {/* Risk cards */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {visibleKeyManRisks.sort((a, b) => {
                      const order = { critical: 0, watch: 1, monitor: 2, safe: 3 }
                      return (order[a.riskQuadrant] ?? 4) - (order[b.riskQuadrant] ?? 4)
                    }).map(k => (
                      <div key={k.employeeId} className={cn(
                        'p-3 rounded-lg border text-xs',
                        k.riskQuadrant === 'critical' ? 'border-necl-critical/50 bg-necl-critical/5' :
                          k.riskQuadrant === 'watch' ? 'border-necl-warning/40 bg-necl-warning/5' :
                            'border-necl-border bg-necl-bg',
                      )}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-bold text-necl-text">{k.name}</p>
                            <p className="text-[10px] text-necl-muted">{k.role} · {k.projectId}</p>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${quadrantColor(k.riskQuadrant)}20`, color: quadrantColor(k.riskQuadrant) }}>
                            {quadrantLabel(k.riskQuadrant)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <p className="text-[9px] text-necl-muted">Impact</p>
                            <p className="font-bold text-necl-text">{k.impactScore}/10</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-necl-muted">Attrition Prob</p>
                            <p className={cn('font-bold', k.attritionProbability > 60 ? 'text-necl-critical' : k.attritionProbability > 40 ? 'text-necl-warning' : 'text-necl-success')}>{k.attritionProbability}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-necl-muted">Replace Cost</p>
                            <p className="font-bold text-necl-accent">{formatINR(k.replacementCost)}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <ChevronRight className="w-3 h-3 text-necl-accent mt-0.5 flex-shrink-0" />
                          <p className="text-[10px] text-necl-muted leading-relaxed">{k.mitigationAction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Salary vs Productivity + Attrition by Project */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Salary vs Productivity scatter */}
                <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-necl-accent" />
                    <h2 className="text-sm font-bold text-necl-text">Salary vs Productivity</h2>
                  </div>
                  <p className="text-[10px] text-necl-muted mb-4">X = productivity vs plan · Y = salary (₹L/yr)</p>
                  {salaryScatterEmployees.length > 0 ? (
                    <svg viewBox="0 0 300 230" className="w-full" style={{ minHeight: 180 }}>
                      {/* Quadrant fills */}
                      <rect x="50" y="15" width="95" height="100" fill="#EF4444" fillOpacity="0.07" />
                      <rect x="145" y="15" width="140" height="100" fill="#10B981" fillOpacity="0.07" />
                      <rect x="50" y="115" width="95" height="85" fill="#F59E0B" fillOpacity="0.07" />
                      <rect x="145" y="115" width="140" height="85" fill="#3B82F6" fillOpacity="0.07" />
                      {/* Quadrant labels */}
                      <text x="97" y="28" textAnchor="middle" fill="#EF4444" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">HIGH COST</text>
                      <text x="97" y="37" textAnchor="middle" fill="#EF4444" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">LOW OUTPUT</text>
                      <text x="215" y="28" textAnchor="middle" fill="#10B981" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">STAR</text>
                      <text x="215" y="37" textAnchor="middle" fill="#10B981" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">PERFORMER</text>
                      <text x="97" y="196" textAnchor="middle" fill="#F59E0B" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">UNDER-PAID</text>
                      <text x="97" y="205" textAnchor="middle" fill="#F59E0B" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">UNDER-DELIVER</text>
                      <text x="215" y="196" textAnchor="middle" fill="#3B82F6" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">UNDER-PAID</text>
                      <text x="215" y="205" textAnchor="middle" fill="#3B82F6" fontSize="7.5" fontWeight="bold" fontFamily="system-ui">OVER-DELIVER</text>
                      {/* Axes */}
                      <line x1="50" y1="200" x2="285" y2="200" stroke="#4B5563" strokeWidth="1" />
                      <line x1="50" y1="15" x2="50" y2="200" stroke="#4B5563" strokeWidth="1" />
                      {/* Dividers */}
                      <line x1="145" y1="15" x2="145" y2="200" stroke="#374151" strokeWidth="0.5" strokeDasharray="3 3" />
                      <line x1="50" y1="115" x2="285" y2="115" stroke="#374151" strokeWidth="0.5" strokeDasharray="3 3" />
                      {/* Labels */}
                      <text x="167" y="215" textAnchor="middle" fill="#6B7280" fontSize="7.5" fontFamily="system-ui">Productivity vs Plan →</text>
                      {/* Dots */}
                      {salaryScatterEmployees.map(e => {
                        const xRange = [-20, 15]
                        const xNorm = Math.max(0, Math.min(1, (e.productivityVsPlan - xRange[0]) / (xRange[1] - xRange[0])))
                        const xSvg = 50 + xNorm * 235
                        const yNorm = Math.max(0, Math.min(1, e.salary / 5000000))
                        const ySvg = 200 - yNorm * 185
                        const attrColor = e.attritionRisk === 'high' ? '#EF4444' : e.attritionRisk === 'medium' ? '#F59E0B' : '#10B981'
                        return (
                          <g key={e.id}>
                            <circle cx={xSvg} cy={ySvg} r="4" fill={attrColor} fillOpacity="0.5" stroke={attrColor} strokeWidth="1" />
                            <text x={xSvg + 5} y={ySvg + 3} fill="#9CA3AF" fontSize="6.5" fontFamily="system-ui">
                              {e.name.split(' ')[0]}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  ) : (
                    <p className="text-sm text-necl-muted text-center py-8">No data</p>
                  )}
                  <p className="text-[9px] text-necl-muted mt-2">Dot color: red = high attrition risk · amber = medium · green = low</p>
                </div>

                {/* Attrition by Project */}
                <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-necl-accent" />
                    <h2 className="text-sm font-bold text-necl-text">Attrition Risk by Project</h2>
                  </div>
                  <p className="text-[10px] text-necl-muted mb-4">Tracked staff (30 employees) — stacked by risk level</p>
                  <NECLBarChart
                    data={attritionRiskChartData}
                    series={[
                      { key: 'High', label: 'High Risk', color: '#EF4444' },
                      { key: 'Medium', label: 'Medium Risk', color: '#F59E0B' },
                      { key: 'Low', label: 'Low Risk', color: '#10B981' },
                    ]}
                    xKey="project"
                    height={240}
                    stacked
                  />
                </div>
              </div>

              {/* Salary Band Analysis */}
              <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-necl-accent" />
                  <h2 className="text-sm font-bold text-necl-text">Salary Band Analysis</h2>
                </div>
                <p className="text-[10px] text-necl-muted mb-4">Market benchmarked — below-market employees with high attrition risk are urgent compensation cases</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visibleSalaryBands.map(band => {
                    const belowMkt = band.employees.filter(e => e.positionInBand === 'below-market').length
                    const urgentCases = band.employees.filter(e => e.positionInBand === 'below-market' && e.attritionRisk === 'high')
                    const bandRange = band.marketMax - band.marketMin
                    return (
                      <div key={band.role} className="p-4 rounded-xl border border-necl-border bg-necl-bg">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-necl-text">{band.role}</p>
                          {belowMkt > 0 && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-necl-warning/20 text-necl-warning font-semibold">{belowMkt} below market</span>
                          )}
                        </div>
                        {/* Market range bar */}
                        <div className="relative mb-3">
                          <div className="h-2 rounded-full bg-necl-border relative">
                            <div className="absolute left-0 right-0 h-full rounded-full bg-necl-success/20" />
                            {/* Mid marker */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-necl-accent" style={{ left: `${((band.marketMid - band.marketMin) / bandRange) * 100}%` }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[9px] text-necl-muted">{formatINR(band.marketMin)}</span>
                            <span className="text-[9px] text-necl-accent">Mid: {formatINR(band.marketMid)}</span>
                            <span className="text-[9px] text-necl-muted">{formatINR(band.marketMax)}</span>
                          </div>
                        </div>
                        {/* Employee dots on band */}
                        <div className="space-y-1.5">
                          {band.employees.map((emp, i) => {
                            const pct = Math.max(0, Math.min(100, ((emp.salary - band.marketMin) / bandRange) * 100))
                            const dotColor = emp.positionInBand === 'below-market' ? '#F59E0B' : emp.positionInBand === 'above-market' ? '#3B82F6' : '#10B981'
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <div className="relative flex-1 h-1.5 rounded-full bg-necl-border">
                                  <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border border-necl-surface" style={{ left: `${pct}%`, background: dotColor }} />
                                </div>
                                <div className="w-28 text-right">
                                  <span className="text-[10px] text-necl-text">{emp.name.split(' ')[0]}</span>
                                  <span className="text-[9px] text-necl-muted ml-1">{formatINR(emp.salary)}</span>
                                </div>
                                {emp.positionInBand === 'below-market' && emp.attritionRisk === 'high' && (
                                  <AlertTriangle className="w-3 h-3 text-necl-critical flex-shrink-0" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {urgentCases.length > 0 && (
                          <div className="mt-3 p-2 rounded-lg bg-necl-critical/10 border border-necl-critical/30">
                            <p className="text-[10px] text-necl-critical font-semibold">
                              URGENT: {urgentCases.map(e => e.name).join(', ')} — below-market salary + high attrition risk. Salary revision recommended.
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: WORKFORCE PLANNING
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'planning' && (
            <div className="space-y-6">

              {/* Wind-down alert banner */}
              <AnimatePresence>
                {windingDownProjects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="p-4 rounded-xl border-2 border-necl-critical/50 bg-necl-critical/5 flex items-start gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-necl-critical flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="text-sm font-bold text-necl-critical mb-1">Wind-down Alert — Redeployment Required</p>
                      {windingDownProjects.map(d => (
                        <p key={d.projectId} className="text-xs text-necl-text">
                          <span className="font-mono text-necl-critical">{d.projectId}</span> workforce wind-down begins — {d.currentHeadcount} crew need redeployment by Sep 2026 → {d.redeploymentTarget ?? 'TBD'}.
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Headcount Gap Analysis */}
              <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-necl-accent" />
                  <div>
                    <h2 className="text-sm font-bold text-necl-text">Headcount Gap Analysis</h2>
                    <p className="text-[10px] text-necl-muted mt-0.5">Actual vs planned · critical vacancies · next quarter forecast</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {visibleHeadcount.map(hcp => {
                    const proj = visibleProjects.find(p => p.id === hcp.projectId)
                    const maxBar = Math.max(hcp.plannedHeadcount, hcp.actualHeadcount, hcp.plannedForNextQuarter)
                    return (
                      <div key={hcp.projectId} className="p-4 rounded-xl border border-necl-border bg-necl-bg">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="font-mono font-bold text-necl-accent text-sm">{hcp.projectId}</span>
                          <StatusPill status={(proj?.status ?? 'on-track') as 'on-track' | 'at-risk' | 'delayed'} size="sm" />
                          {hcp.windingDown && <span className="text-[9px] px-2 py-0.5 rounded-full bg-necl-warning/20 text-necl-warning font-bold">WINDING DOWN</span>}
                          <span className={cn('text-xs font-bold ml-auto', hcp.gap < -10 ? 'text-necl-critical' : hcp.gap < 0 ? 'text-necl-warning' : 'text-necl-success')}>
                            Gap: {hcp.gap > 0 ? `+${hcp.gap}` : hcp.gap}
                          </span>
                        </div>
                        {/* Bar comparison */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-necl-muted w-24">Planned</span>
                            <div className="flex-1 h-2 rounded-full bg-necl-border">
                              <div className="h-full rounded-full bg-necl-accent/40" style={{ width: `${(hcp.plannedHeadcount / maxBar) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-necl-muted w-10 text-right">{hcp.plannedHeadcount}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-necl-muted w-24">Actual</span>
                            <div className="flex-1 h-2 rounded-full bg-necl-border">
                              <div className={cn('h-full rounded-full', hcp.gap < -10 ? 'bg-necl-critical' : hcp.gap < 0 ? 'bg-necl-warning' : 'bg-necl-success')} style={{ width: `${(hcp.actualHeadcount / maxBar) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-necl-text w-10 text-right">{hcp.actualHeadcount}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-necl-muted w-24">Next Qtr Fcst</span>
                            <div className="flex-1 h-2 rounded-full bg-necl-border">
                              <div className="h-full rounded-full bg-necl-accent/60" style={{ width: `${(hcp.plannedForNextQuarter / maxBar) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-necl-accent w-10 text-right">{hcp.plannedForNextQuarter}</span>
                          </div>
                        </div>
                        {hcp.criticalVacancies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[9px] text-necl-muted mr-1">Critical vacancies:</span>
                            {hcp.criticalVacancies.map((v, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-necl-critical/15 text-necl-critical">{v}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 90-Day Workforce Demand Forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-necl-accent" />
                    <h2 className="text-sm font-bold text-necl-text">90-Day Workforce Forecast</h2>
                  </div>
                  <p className="text-[10px] text-necl-muted mb-4">Headcount trajectory per project — Now to +90 days</p>
                  {visibleDemand.length > 0 ? (
                    <NECLAreaChart
                      data={demandForecastChartData}
                      series={demandForecastSeries}
                      xKey="period"
                      height={220}
                    />
                  ) : (
                    <p className="text-sm text-necl-muted text-center py-8">No forecast data</p>
                  )}
                </div>

                <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-necl-accent" />
                    <h2 className="text-sm font-bold text-necl-text">Demand Action Register</h2>
                  </div>
                  <div className="space-y-3">
                    {visibleDemand.map(d => {
                      const delta = d.forecast90d - d.currentHeadcount
                      const actionColors: Record<string, string> = {
                        'ramp-up': 'bg-necl-success/15 text-necl-success',
                        'wind-down': 'bg-necl-critical/15 text-necl-critical',
                        'stable': 'bg-necl-muted/15 text-necl-muted',
                        'redeploy': 'bg-necl-warning/15 text-necl-warning',
                      }
                      return (
                        <div key={d.projectId} className="p-3 rounded-lg border border-necl-border bg-necl-bg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono font-bold text-necl-accent text-xs">{d.projectId}</span>
                            <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', actionColors[d.action] ?? actionColors['stable'])}>
                              {d.action.toUpperCase().replace('-', ' ')}
                            </span>
                            <span className="ml-auto text-xs font-bold">
                              <span className="text-necl-muted">{d.currentHeadcount}</span>
                              <span className="text-necl-muted mx-1">→</span>
                              <span className={delta > 0 ? 'text-necl-success' : delta < 0 ? 'text-necl-critical' : 'text-necl-muted'}>{d.forecast90d} ({delta >= 0 ? `+${delta}` : delta})</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-necl-muted leading-relaxed">{d.reason}</p>
                          {d.redeploymentTarget && (
                            <p className="text-[10px] text-necl-warning mt-1">Redeploy to: <span className="font-semibold">{d.redeploymentTarget}</span></p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Skill Inventory */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-necl-accent" />
                    <h2 className="text-sm font-bold text-necl-text">Skill Inventory</h2>
                  </div>
                  <p className="text-[10px] text-necl-muted mb-4">{visibleSkills.length} skills · {singlePointSkills.length} single-point-of-failure</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {visibleSkills.map((s, i) => {
                      const catColors: Record<string, string> = { technical: 'bg-necl-accent/15 text-necl-accent', managerial: 'bg-purple-500/15 text-purple-400', safety: 'bg-necl-success/15 text-necl-success', digital: 'bg-necl-warning/15 text-necl-warning' }
                      const demandColors: Record<string, string> = { high: 'text-necl-critical', medium: 'text-necl-warning', low: 'text-necl-muted' }
                      return (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-necl-border bg-necl-bg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <p className="text-[11px] font-semibold text-necl-text">{s.skill}</p>
                              {s.singlePointOfFailure && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-necl-critical/15 text-necl-critical animate-pulse">SINGLE POINT</span>
                              )}
                              {s.isCritical && !s.singlePointOfFailure && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-necl-warning/15 text-necl-warning">CRITICAL</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full', catColors[s.category])}>{s.category}</span>
                              <span className="text-[9px] text-necl-muted">{s.employeeCount} staff</span>
                              <span className={cn('text-[9px] font-semibold', demandColors[s.demandLevel])}>Demand: {s.demandLevel}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 flex-shrink-0">
                            {s.projects.filter(pid => effectiveProjects.includes(pid)).map(pid => (
                              <span key={pid} className="text-[8px] px-1.5 py-0.5 rounded bg-necl-border text-necl-muted">{pid}</span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Single Point of Failure Panel */}
                <div className="rounded-xl border border-necl-critical/30 bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-necl-critical" />
                    <h2 className="text-sm font-bold text-necl-text">Single-Point-of-Failure Skills</h2>
                  </div>
                  <p className="text-[10px] text-necl-muted mb-4">
                    Portfolio has <span className="text-necl-critical font-bold">{singlePointSkills.length}</span> skills where only 1 person exists — if they leave, we lose that capability permanently
                  </p>
                  <div className="space-y-3">
                    {singlePointSkills.map((s, i) => {
                      const holder = employees.find(e => s.projects.some(pid => e.projectId === pid) && e.skills.some(sk => sk.toLowerCase().includes(s.skill.split('/')[0].trim().toLowerCase().slice(0, 8))))
                      const holderRisk = holder?.attritionRisk ?? 'low'
                      return (
                        <div key={i} className="p-3 rounded-lg border border-necl-critical/30 bg-necl-critical/5">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-[11px] font-bold text-necl-text">{s.skill}</p>
                              <p className="text-[9px] text-necl-muted">{s.projects.join(', ')}</p>
                            </div>
                            <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full', holderRisk === 'high' ? 'bg-necl-critical/15 text-necl-critical' : holderRisk === 'medium' ? 'bg-necl-warning/15 text-necl-warning' : 'bg-necl-success/15 text-necl-success')}>
                              {holderRisk.toUpperCase()} RISK
                            </span>
                          </div>
                          <p className="text-[9px] text-necl-critical font-medium">
                            Action: Cross-train at least 1 backup · Demand: <span className={s.demandLevel === 'high' ? 'text-necl-critical' : 'text-necl-warning'}>{s.demandLevel.toUpperCase()}</span>
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Remote Hardship */}
              {visibleHardship.length > 0 && (
                <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-necl-accent" />
                    <div>
                      <h2 className="text-sm font-bold text-necl-text">Remote Hardship Assessment</h2>
                      <p className="text-[10px] text-necl-muted mt-0.5">Site remoteness directly elevates attrition risk — welfare action required</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visibleHardship.map(r => {
                      const lastVisit = new Date(r.lastWelfareVisit)
                      const today = new Date('2026-06-30')
                      const daysSinceVisit = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
                      const visitOverdue = daysSinceVisit > 60
                      return (
                        <div key={r.projectId} className={cn('p-4 rounded-xl border', visitOverdue ? 'border-necl-warning/50 bg-necl-warning/5' : 'border-necl-border bg-necl-bg')}>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="font-mono font-bold text-necl-accent text-sm">{r.projectId}</span>
                            <span className="text-[10px] text-necl-muted">{r.location}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-[9px] text-necl-muted mb-1">Remoteness</p>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 rounded-full bg-necl-border">
                                  <div className="h-full rounded-full bg-necl-critical" style={{ width: `${r.remotenessScore * 10}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-necl-critical">{r.remotenessScore}/10</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] text-necl-muted mb-1">Support Index</p>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 h-1.5 rounded-full bg-necl-border">
                                  <div className={cn('h-full rounded-full', r.supportIndex >= 60 ? 'bg-necl-success' : r.supportIndex >= 40 ? 'bg-necl-warning' : 'bg-necl-critical')} style={{ width: `${r.supportIndex}%` }} />
                                </div>
                                <span className={cn('text-[10px] font-bold', r.supportIndex >= 60 ? 'text-necl-success' : r.supportIndex >= 40 ? 'text-necl-warning' : 'text-necl-critical')}>{r.supportIndex}/100</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5 mb-3 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-necl-muted">Crew at site</span>
                              <span className="font-semibold text-necl-text">{r.employeeCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-necl-muted">Avg tenure</span>
                              <span className="font-semibold text-necl-text">{r.avgTenureMonths}m</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-necl-muted">Attrition elevation</span>
                              <span className="font-bold text-necl-critical">+{r.attritionRiskElevation}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-necl-muted">Last welfare visit</span>
                              <span className={cn('font-semibold', visitOverdue ? 'text-necl-warning' : 'text-necl-text')}>
                                {daysSinceVisit}d ago {visitOverdue ? '⚠' : ''}
                              </span>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-necl-accent/5 border border-necl-accent/20">
                            <p className="text-[9px] text-necl-muted leading-relaxed">{r.recommendedAction}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Redeployment Pipeline */}
              {(windingDownProjects.length > 0 || rampingUpProjects.length > 0) && (
                <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-4 h-4 text-necl-accent" />
                    <div>
                      <h2 className="text-sm font-bold text-necl-text">Redeployment Pipeline</h2>
                      <p className="text-[10px] text-necl-muted">Match wind-down surplus to ramp-up demand</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-necl-critical mb-2">Releasing Projects</p>
                      {windingDownProjects.map(d => (
                        <div key={d.projectId} className="p-3 rounded-lg border border-necl-critical/30 bg-necl-critical/5 mb-2">
                          <div className="flex justify-between mb-1">
                            <span className="font-mono font-bold text-necl-critical text-xs">{d.projectId}</span>
                            <span className="text-xs font-bold text-necl-critical">{d.currentHeadcount} → 0 by Sep 2026</span>
                          </div>
                          <p className="text-[10px] text-necl-muted">{d.reason}</p>
                          <p className="text-[10px] text-necl-warning mt-1">Target: {d.redeploymentTarget}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-necl-success mb-2">Absorbing Projects</p>
                      {rampingUpProjects.map(d => {
                        const delta = d.forecast90d - d.currentHeadcount
                        return (
                          <div key={d.projectId} className="p-3 rounded-lg border border-necl-success/30 bg-necl-success/5 mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="font-mono font-bold text-necl-success text-xs">{d.projectId}</span>
                              <span className="text-xs font-bold text-necl-success">+{delta} crew needed in 90d</span>
                            </div>
                            <p className="text-[10px] text-necl-muted">{d.reason}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: COMPLIANCE & SUCCESSION
          ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">

              {/* Review compliance summary banner */}
              <div className={cn(
                'p-4 rounded-xl border-2',
                overdueReviews.length > 10 ? 'border-necl-critical/60 bg-necl-critical/5' : 'border-necl-warning/50 bg-necl-warning/5',
              )}>
                <div className="flex items-center gap-3">
                  <Clock className={cn('w-5 h-5 flex-shrink-0', overdueReviews.length > 10 ? 'text-necl-critical animate-pulse' : 'text-necl-warning')} />
                  <div>
                    <p className={cn('text-sm font-bold', overdueReviews.length > 10 ? 'text-necl-critical' : 'text-necl-warning')}>
                      {overdueReviews.length} of {visibleReviews.length} employees have overdue performance reviews
                    </p>
                    <p className="text-[10px] text-necl-muted mt-0.5">
                      Review cycle is every 6 months. All tracked staff are 13–17 months since last review — systematic failure requiring immediate scheduling.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Compliance Tracker */}
              <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-border">
                  <Clock className="w-4 h-4 text-necl-accent" />
                  <div>
                    <h2 className="text-sm font-bold text-necl-text">Performance Review Compliance</h2>
                    <p className="text-[10px] text-necl-muted mt-0.5">Sorted: most overdue first</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Employee', 'Role', 'Project', 'Last Review', 'Months Since', 'Status', 'Next Due', 'Action'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleReviews.map(r => {
                        const isCritical = r.status === 'critical-overdue'
                        const isOverdue = r.status === 'overdue'
                        const isDue = r.status === 'due'
                        return (
                          <tr key={r.employeeId} className={cn('border-b border-necl-border/50 hover:bg-necl-bg', isCritical && 'bg-necl-critical/3')}>
                            <td className="px-4 py-3 font-semibold text-necl-text">{r.name}</td>
                            <td className="px-4 py-3 text-necl-muted">{r.role}</td>
                            <td className="px-4 py-3 font-mono text-necl-accent text-[11px]">{r.projectId}</td>
                            <td className="px-4 py-3 text-necl-muted">{r.lastReview}</td>
                            <td className="px-4 py-3">
                              <span className={cn('font-bold', r.monthsOverdue > 12 ? 'text-necl-critical' : r.monthsOverdue > 8 ? 'text-necl-critical/80' : r.monthsOverdue > 6 ? 'text-necl-warning' : 'text-necl-muted')}>
                                {r.monthsOverdue}m
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                'text-[10px] font-bold px-2 py-1 rounded-full',
                                isCritical ? 'bg-necl-critical/15 text-necl-critical animate-pulse' :
                                  isOverdue ? 'bg-necl-critical/10 text-necl-critical' :
                                    isDue ? 'bg-necl-warning/15 text-necl-warning' :
                                      'bg-necl-success/15 text-necl-success',
                              )}>
                                {isCritical ? `CRITICAL — ${r.monthsOverdue}m` :
                                  isOverdue ? `OVERDUE — ${r.monthsOverdue}m` :
                                    isDue ? 'DUE' : 'Current'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-necl-muted">{r.nextReviewDue}</td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                'text-[10px] font-semibold',
                                isCritical || isOverdue ? 'text-necl-critical' : isDue ? 'text-necl-warning' : 'text-necl-success',
                              )}>
                                {isCritical || isOverdue ? 'Schedule immediately' : isDue ? `Schedule by ${r.nextReviewDue}` : 'On track'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Training & Certification Register */}
              <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-necl-accent" />
                  <h2 className="text-sm font-bold text-necl-text">Training & Certification Register</h2>
                </div>
                <p className="text-[10px] text-necl-muted mb-4">
                  {overdueTraining.length} overdue · mandatory safety certifications are a legal compliance requirement
                </p>
                <div className="space-y-4">
                  {/* Overdue */}
                  {overdueTraining.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-necl-critical mb-2">Overdue</p>
                      <div className="space-y-2">
                        {overdueTraining.map((t, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-necl-critical/40 bg-necl-critical/5">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="text-[11px] font-bold text-necl-text">{t.name} — {t.trainingName}</p>
                                <span className="text-[9px] font-mono text-necl-accent">{t.projectId}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full', t.category === 'safety' ? 'bg-necl-success/15 text-necl-success' : t.category === 'leadership' ? 'bg-purple-500/15 text-purple-400' : t.category === 'compliance' ? 'bg-necl-warning/15 text-necl-warning' : 'bg-necl-accent/15 text-necl-accent')}>{t.category}</span>
                                {t.criticality === 'mandatory' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-necl-critical/15 text-necl-critical">MANDATORY</span>}
                                <span className="text-[9px] text-necl-critical font-bold">{t.daysOverdue}d overdue</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-necl-muted">Due</p>
                              <p className="text-[10px] font-bold text-necl-critical">{t.dueDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Due Soon / Upcoming */}
                  {visibleTraining.filter(t => t.daysOverdue <= 0 && t.daysOverdue > -31).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-necl-warning mb-2">Due Within 30 Days</p>
                      <div className="space-y-2">
                        {visibleTraining.filter(t => t.daysOverdue <= 0 && t.daysOverdue > -31).map((t, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-necl-warning/40 bg-necl-warning/5">
                            <div className="flex-1">
                              <p className="text-[11px] font-bold text-necl-text mb-0.5">{t.name} — {t.trainingName}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-mono text-necl-accent">{t.projectId}</span>
                                {t.criticality === 'mandatory' && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-necl-warning/20 text-necl-warning">MANDATORY</span>}
                              </div>
                            </div>
                            <p className="text-[10px] font-bold text-necl-warning whitespace-nowrap">{Math.abs(t.daysOverdue)}d left</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended */}
                  {visibleTraining.filter(t => t.daysOverdue <= -31).length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-necl-accent mb-2">Recommended (Upcoming)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {visibleTraining.filter(t => t.daysOverdue <= -31).map((t, i) => (
                          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-necl-border bg-necl-bg">
                            <div className="flex-1">
                              <p className="text-[10px] font-semibold text-necl-text">{t.name}</p>
                              <p className="text-[9px] text-necl-muted">{t.trainingName} · {t.projectId}</p>
                            </div>
                            <p className="text-[9px] text-necl-muted whitespace-nowrap">{t.dueDate}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Succession Planning Gap */}
              <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-4 h-4 text-necl-accent" />
                  <h2 className="text-sm font-bold text-necl-text">Succession Planning</h2>
                </div>
                {noSuccessorPMs.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl border border-necl-critical/40 bg-necl-critical/5">
                    <p className="text-xs font-bold text-necl-critical">
                      {noSuccessorPMs.length} of {visiblePMScores.length} project leaders have no succession plan.
                      Combined replacement cost if all departed: <span className="underline">{formatINR(successionReplacementCost)}</span>
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  {visiblePMScores.map(pm => {
                    const risk = keyManRisks.find(k => k.employeeId === pm.employeeId)
                    const isCritical = !pm.successionBackup && (risk?.impactScore ?? 0) >= 8 && (risk?.attritionProbability ?? 0) >= 40
                    return (
                      <div key={pm.employeeId} className={cn(
                        'p-4 rounded-xl border',
                        isCritical ? 'border-necl-critical/50 bg-necl-critical/5' :
                          !pm.successionBackup ? 'border-necl-warning/40 bg-necl-warning/5' :
                            'border-necl-border bg-necl-bg',
                      )}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-bold text-necl-text">{pm.name}</p>
                              <span className="text-[10px] font-mono text-necl-accent">{pm.projectId}</span>
                              <span className="text-[10px] text-necl-muted">{pm.role}</span>
                            </div>
                            <p className="text-[10px] text-necl-muted">Overall score: <span className={cn('font-bold', pm.overallScore >= 80 ? 'text-necl-success' : pm.overallScore >= 60 ? 'text-necl-warning' : 'text-necl-critical')}>{pm.overallScore}/100</span></p>
                          </div>
                          {isCritical && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-necl-critical/15 text-necl-critical animate-pulse">CRITICAL RISK</span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3 text-[10px]">
                          <div>
                            <p className="text-necl-muted mb-0.5">Successor</p>
                            {pm.successionBackup ? (
                              <span className="font-semibold text-necl-success">{pm.successionBackup.split('(')[0].trim()}</span>
                            ) : (
                              <span className="font-bold text-necl-critical">None identified</span>
                            )}
                          </div>
                          <div>
                            <p className="text-necl-muted mb-0.5">Impact if lost</p>
                            <p className={cn('font-bold', (risk?.impactScore ?? 0) >= 8 ? 'text-necl-critical' : 'text-necl-warning')}>{risk?.impactScore ?? '—'}/10</p>
                          </div>
                          <div>
                            <p className="text-necl-muted mb-0.5">Replace time</p>
                            <p className="font-bold text-necl-text">{risk?.replacementLeadWeeks ?? '—'}w</p>
                          </div>
                        </div>
                        {!pm.successionBackup && risk && (
                          <div className="p-2 rounded-lg bg-necl-accent/5 border border-necl-accent/20">
                            <p className="text-[9px] text-necl-muted"><span className="text-necl-accent font-semibold">Action: </span>{risk.mitigationAction}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* HR Alerts & Recs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hrAlerts.length > 0 && (
                  <div className="rounded-xl border border-necl-border bg-necl-surface">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-border">
                      <AlertTriangle className="w-4 h-4 text-necl-warning" />
                      <h2 className="text-sm font-bold text-necl-text">People Alerts</h2>
                    </div>
                    <div className="p-3 space-y-2">
                      {hrAlerts.map(a => (
                        <AlertItem key={a.id} alert={a} onView={setSelectedAlert} />
                      ))}
                    </div>
                  </div>
                )}
                {hrRecs.length > 0 && (
                  <div className="space-y-3">
                    {hrRecs.slice(0, 2).map(r => (
                      <PrescriptiveCard key={r.id} recommendation={r} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
