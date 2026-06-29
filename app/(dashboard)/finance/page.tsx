'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IndianRupee, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, ArrowRight, Shield, Receipt, BarChart3, FileText, Zap, Building2, ChevronRight } from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { StatusPill } from '@/components/ui/StatusPill'
import { NECLBarChart } from '@/components/charts/BarChart'
import { NECLAreaChart } from '@/components/charts/AreaChart'
import { NECLDonutChart } from '@/components/charts/DonutChart'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { projects } from '@/lib/mock-data/projects'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { raBills, variationOrders } from '@/lib/mock-data/operations-extended'
import { paymentSchedule, escalationClaims } from '@/lib/mock-data/procurement-extended'
import { cashFlow, evmMetrics, costCategoryBreakdown, bankGuarantees, taxPositions, clientDSO, retentionSummary } from '@/lib/mock-data/finance-extended'
import { formatINR, cn } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'

function MiniSparkline({ data, color }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 0.01
  const w = 64, h = 22
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 2) - 1
    return `${x},${y}`
  }).join(' ')
  const last = data[data.length - 1]
  const first = data[0]
  const c = color ?? (last >= first ? '#10B981' : '#EF4444')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={c} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={w} cy={h - ((last - min) / range) * (h - 2) - 1} r={2} fill={c} />
    </svg>
  )
}

export default function FinancePage() {
  const { role, selectedProjects } = useApp()
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'evm' | 'obligations'>('overview')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const isSiteManager = role === 'site-manager'
  const effectiveProjects = isSiteManager ? ['KDSP-B1'] : selectedProjects

  const visibleProjects = useMemo(() => projects.filter(p => effectiveProjects.includes(p.id)), [effectiveProjects])
  const totalBudget = useMemo(() => visibleProjects.reduce((s, p) => s + p.budget, 0), [visibleProjects])
  const totalActual = useMemo(() => visibleProjects.reduce((s, p) => s + p.actual, 0), [visibleProjects])

  const visibleBills = useMemo(() => raBills.filter(b => effectiveProjects.includes(b.projectId)), [effectiveProjects])
  const totalReceivable = useMemo(() => visibleBills.filter(b => b.status !== 'payment-received').reduce((s, b) => s + b.amount, 0), [visibleBills])
  const totalCertifiedPending = useMemo(() => visibleBills.filter(b => b.status === 'certified').reduce((s, b) => s + (b.certifiedAmount ?? b.amount), 0), [visibleBills])

  const visibleVOs = useMemo(() => variationOrders.filter(v => effectiveProjects.includes(v.projectId)), [effectiveProjects])
  const voPipelineValue = useMemo(() => visibleVOs.filter(v => ['submitted', 'pending-approval'].includes(v.status)).reduce((s, v) => s + v.value, 0), [visibleVOs])

  const visibleEVM = useMemo(() => evmMetrics.filter(e => effectiveProjects.includes(e.projectId)), [effectiveProjects])
  const avgCPI = useMemo(() => visibleEVM.length ? visibleEVM.reduce((s, e) => s + e.cpi, 0) / visibleEVM.length : 0, [visibleEVM])
  const totalEAC = useMemo(() => visibleEVM.reduce((s, e) => s + e.eac, 0), [visibleEVM])
  const totalVAC = useMemo(() => visibleEVM.reduce((s, e) => s + e.vac, 0), [visibleEVM])
  const sortedEVM = useMemo(() => [...visibleEVM].sort((a, b) => a.cpi - b.cpi), [visibleEVM])

  const visibleCategories = useMemo(() => costCategoryBreakdown.filter(c => effectiveProjects.includes(c.projectId)), [effectiveProjects])

  const visibleBGs = useMemo(() => bankGuarantees.filter(b => effectiveProjects.includes(b.projectId)), [effectiveProjects])
  const totalBGExposure = useMemo(() => visibleBGs.reduce((s, b) => s + b.amount, 0), [visibleBGs])
  const expiringBGs = useMemo(() => visibleBGs.filter(b => b.daysToExpiry <= 60 && b.status !== 'returned' && b.status !== 'expired'), [visibleBGs])
  const sortedBGs = useMemo(() => [...visibleBGs].sort((a, b) => a.daysToExpiry - b.daysToExpiry), [visibleBGs])

  const visibleTax = useMemo(() => taxPositions.filter(t => effectiveProjects.includes(t.projectId)), [effectiveProjects])
  const totalTDSLocked = useMemo(() => visibleTax.reduce((s, t) => s + t.tdsDeductedByClient, 0), [visibleTax])
  const totalGSTCredit = useMemo(() => visibleTax.reduce((s, t) => s + t.netGSTPosition, 0), [visibleTax])
  const totalTaxLockedAll = useMemo(() => visibleTax.reduce((s, t) => s + t.totalTaxLocked, 0), [visibleTax])

  const visiblePayments = useMemo(() => paymentSchedule.filter(p => effectiveProjects.includes(p.projectId)), [effectiveProjects])
  const urgentPayments = useMemo(() => visiblePayments.filter(p => p.status === 'due-soon' || p.status === 'overdue'), [visiblePayments])
  const totalPaymentsNextMonth = useMemo(() => visiblePayments.reduce((s, p) => s + p.amount, 0), [visiblePayments])
  const sortedPayments = useMemo(() => [...visiblePayments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), [visiblePayments])

  const visibleEscalation = useMemo(() => escalationClaims.filter(ec => ec.projectIds.some(pid => effectiveProjects.includes(pid))), [effectiveProjects])
  const unfiledEscalationValue = useMemo(() => visibleEscalation.filter(ec => ec.status === 'unfiled').reduce((s, ec) => s + ec.claimAmount, 0), [visibleEscalation])

  const visibleDSO = useMemo(() => clientDSO.filter(d => d.projects.some(pid => effectiveProjects.includes(pid))), [effectiveProjects])

  const visibleRetention = useMemo(() => retentionSummary.filter(r => effectiveProjects.includes(r.projectId)), [effectiveProjects])
  const totalRetentionHeld = useMemo(() => visibleRetention.reduce((s, r) => s + r.retentionAmount, 0), [visibleRetention])

  const finAlerts = useMemo(() => alerts.filter(a => a.department === 'finance' && effectiveProjects.includes(a.projectId)), [effectiveProjects])
  const finRecs = useMemo(() => recommendations.filter(r => r.department === 'Finance' && effectiveProjects.includes(r.projectId)), [effectiveProjects])

  const budgetVsActual = useMemo(() => visibleProjects.map(p => ({
    project: p.id,
    budget: Math.round(p.budget / 100000),
    actual: Math.round(p.actual / 100000),
  })), [visibleProjects])

  const categoryChartData = useMemo(() => {
    const totals = visibleCategories.reduce((acc, c) => ({
      Materials: (acc.Materials ?? 0) + c.materials,
      Labor: (acc.Labor ?? 0) + c.labor,
      Plant: (acc.Plant ?? 0) + c.plant,
      Subcontractor: (acc.Subcontractor ?? 0) + c.subcontractor,
      Overheads: (acc.Overheads ?? 0) + c.overheads,
    }), {} as Record<string, number>)
    return [
      { label: 'Materials', value: totals.Materials ?? 0, color: '#2563EB' },
      { label: 'Labor', value: totals.Labor ?? 0, color: '#10B981' },
      { label: 'Plant', value: totals.Plant ?? 0, color: '#F59E0B' },
      { label: 'Subcontractor', value: totals.Subcontractor ?? 0, color: '#8B5CF6' },
      { label: 'Overheads', value: totals.Overheads ?? 0, color: '#6B7280' },
    ]
  }, [visibleCategories])

  const voStatusData = useMemo(() => {
    const counts: Record<string, number> = { submitted: 0, 'pending-approval': 0, approved: 0, mobilized: 0 }
    visibleVOs.forEach(v => { counts[v.status] = (counts[v.status] ?? 0) + 1 })
    return [
      { label: 'Mobilized', value: counts.mobilized, color: '#10B981' },
      { label: 'Approved', value: counts.approved, color: '#2563EB' },
      { label: 'Pending Approval', value: counts['pending-approval'], color: '#F59E0B' },
      { label: 'Submitted', value: counts.submitted, color: '#6B7280' },
    ]
  }, [visibleVOs])

  const weeklyChartData = useMemo(() => {
    const weeks = ['W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'W-1', 'W0']
    return weeks.map((week, i) => {
      const row: Record<string, string | number> = { week }
      visibleEVM.forEach(e => { row[e.projectId] = e.weeklyCPI[i] ?? 0 })
      return row
    })
  }, [visibleEVM])

  const cashFlowChartData = useMemo(() => cashFlow.map(m => ({
    month: m.month,
    inflows: m.inflows,
    outflows: m.outflows,
    netFlow: m.netFlow,
    cumulativeNet: m.cumulativeNet,
  })), [])

  const evmBacEac = useMemo(() => sortedEVM.map(e => ({
    project: e.projectId,
    bac: Math.round(e.bac / 100000),
    eac: Math.round(e.eac / 100000),
  })), [sortedEVM])

  const totalCapitalLocked = totalReceivable + totalTaxLockedAll + totalRetentionHeld + totalBGExposure

  const stuckBills = useMemo(() => [...visibleBills]
    .filter(b => b.status !== 'payment-received')
    .sort((a, b) => b.daysStuck - a.daysStuck), [visibleBills])

  const sortedVOs = useMemo(() => [...visibleVOs].sort((a, b) => b.value - a.value), [visibleVOs])

  const PROJECT_COLORS: Record<string, string> = {
    'HYD-M3': '#EF4444', 'BMRC-E2': '#10B981', 'NH-44X': '#3B82F6', 'KDSP-B1': '#F59E0B',
    'CHN-FLY': '#8B5CF6', 'MUM-CST': '#EC4899', 'RLWY-G4': '#06B6D4', 'VIZG-P2': '#F97316',
  }

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <IndianRupee className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Finance 360°</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IndianRupee className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Finance 360°</h1>
          <span className="text-sm text-necl-muted">
            {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''} · as of 29 Jun 2026
          </span>
        </div>
        {urgentPayments.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-necl-warning/10 border border-necl-warning/30 text-necl-warning text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {urgentPayments.length} payment{urgentPayments.length !== 1 ? 's' : ''} overdue/due soon
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--color-necl-bg)] border border-[var(--color-necl-border)] w-fit">
        {(
          [
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'revenue', label: 'Revenue & Billing', icon: Receipt },
            { id: 'evm', label: 'Cost & EVM', icon: TrendingUp },
            { id: 'obligations', label: 'Obligations', icon: Shield },
          ] as const
        ).map(tab => {
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

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPITile
                  label="Total Receivables"
                  value={formatINR(totalReceivable)}
                  subtitle="In-flight RA bills"
                  status={totalReceivable > 50000000 ? 'red' : 'amber'}
                />
                <KPITile
                  label="Certified & Due"
                  value={formatINR(totalCertifiedPending)}
                  subtitle="Ready to collect — awaiting payment"
                  status="amber"
                />
                <KPITile
                  label="VO Pipeline"
                  value={formatINR(voPipelineValue)}
                  subtitle="Pending approval variation orders"
                  status="blue"
                />
                <KPITile
                  label="Avg Portfolio CPI"
                  value={avgCPI.toFixed(3)}
                  subtitle="Earned value efficiency"
                  status={avgCPI >= 1 ? 'green' : avgCPI >= 0.9 ? 'amber' : 'red'}
                />
                <KPITile
                  label="EAC Overrun"
                  value={formatINR(Math.max(0, totalEAC - totalBudget))}
                  subtitle="Projected cost at completion overrun"
                  status="red"
                />
                <KPITile
                  label="TDS Locked"
                  value={formatINR(totalTDSLocked)}
                  subtitle="Held by clients · locked with IT dept"
                  status="amber"
                />
                <KPITile
                  label="BG Exposure"
                  value={formatINR(totalBGExposure)}
                  subtitle={`${expiringBGs.length} expiring <60d`}
                  status={expiringBGs.length > 0 ? 'amber' : 'blue'}
                />
                <KPITile
                  label="Retention Held"
                  value={formatINR(totalRetentionHeld)}
                  subtitle="Client retention, releases on DLP"
                  status="blue"
                />
              </div>

              {/* Cash Flow Chart */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-necl-text">Cash Flow — Jan 2026 to Sep 2026</h2>
                    <p className="text-xs text-necl-muted mt-0.5">(Forecast: Jul–Sep shown with dashed indicator)</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md bg-necl-bg border border-necl-border text-necl-muted">9 months</span>
                </div>
                <NECLAreaChart
                  data={cashFlowChartData}
                  xKey="month"
                  height={260}
                  series={[
                    { key: 'inflows', label: 'Inflows', color: '#10B981' },
                    { key: 'outflows', label: 'Outflows', color: '#EF4444' },
                    { key: 'cumulativeNet', label: 'Cumulative Net', color: '#2563EB' },
                  ]}
                  formatValue={(v: number) => `₹${(v / 10000000).toFixed(1)}Cr`}
                  showLegend
                />
                {/* Forecast insight chips */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    'Jul forecast: ₹18.5Cr inflows — 3 certified bills ready for collection',
                    'Aug gap: -₹2.2Cr outflows exceed inflows — plan drawdown',
                    'Sep recovery: +₹2.7Cr — KSPH expected to clear pending bills',
                  ].map((chip, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-necl-warning/10 border border-necl-warning/30 text-necl-warning font-medium">
                      <Zap className="w-3 h-3 shrink-0" />
                      {chip}
                    </span>
                  ))}
                </div>
              </div>

              {/* Working Capital Breakdown */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-necl-text">Working Capital Locked</h2>
                  <span className="text-lg font-bold text-necl-critical">{formatINR(totalCapitalLocked)}</span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Receivables',
                      amount: totalReceivable,
                      color: '#2563EB',
                      borderClass: 'border-l-blue-500',
                      action: 'Chase: KSPH RA-7 67d stuck',
                    },
                    {
                      label: 'Tax Locked',
                      amount: totalTaxLockedAll,
                      color: '#F59E0B',
                      borderClass: 'border-l-amber-500',
                      action: 'File TDS refund claims',
                    },
                    {
                      label: 'Retention',
                      amount: totalRetentionHeld,
                      color: '#8B5CF6',
                      borderClass: 'border-l-purple-500',
                      action: 'Releases on DLP — long-term',
                    },
                    {
                      label: 'BG Exposure',
                      amount: totalBGExposure,
                      color: '#6B7280',
                      borderClass: 'border-l-gray-500',
                      action: `${expiringBGs.length} BGs expiring <60d`,
                    },
                  ].map(row => {
                    const pct = totalCapitalLocked > 0 ? (row.amount / totalCapitalLocked) * 100 : 0
                    return (
                      <div key={row.label} className={cn('pl-4 border-l-2 py-2', row.borderClass)}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-necl-text">{row.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-necl-muted">{pct.toFixed(1)}%</span>
                            <span className="text-sm font-semibold text-necl-text">{formatINR(row.amount)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-necl-bg overflow-hidden mb-1">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: row.color }}
                          />
                        </div>
                        <span className="text-xs text-necl-muted">{row.action}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Client DSO Strip */}
              {visibleDSO.length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="text-base font-semibold text-necl-text mb-4">Client Payment Reliability (DSO)</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {visibleDSO.map(d => {
                      const ratingColors: Record<string, string> = {
                        excellent: 'text-necl-success bg-necl-success/10 border-necl-success/30',
                        good: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
                        poor: 'text-necl-warning bg-necl-warning/10 border-necl-warning/30',
                        critical: 'text-necl-critical bg-necl-critical/10 border-necl-critical/30',
                      }
                      return (
                        <div key={d.client} className="rounded-lg border border-necl-border bg-necl-bg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-necl-text truncate">{d.client}</span>
                            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border capitalize', ratingColors[d.reliabilityRating])}>
                              {d.reliabilityRating}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-necl-muted">Avg DSO</span>
                              <p className="font-semibold text-necl-text">{d.avgDSODays}d</p>
                            </div>
                            <div>
                              <span className="text-necl-muted">Longest O/S</span>
                              <p className="font-semibold text-necl-warning">{d.longestOutstanding}d</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Finance Alerts */}
              {finAlerts.length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="text-base font-semibold text-necl-text mb-4">Finance Alerts</h2>
                  <div className="space-y-2">
                    {finAlerts.map(a => (
                      <AlertItem key={a.id} alert={a} onView={setSelectedAlert} />
                    ))}
                  </div>
                </div>
              )}

              {/* Finance Recommendations */}
              {finRecs.length > 0 && (
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="text-base font-semibold text-necl-text mb-4">Finance Recommendations</h2>
                  <div className="space-y-3">
                    {finRecs.map(r => (
                      <PrescriptiveCard key={r.id} recommendation={r} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REVENUE & BILLING TAB ─────────────────────────────────────────── */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              {/* RA Billing Pipeline Funnel */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-4">RA Billing Pipeline</h2>
                {(() => {
                  const submitted = visibleBills.filter(b => b.status === 'submitted')
                  const underReview = visibleBills.filter(b => b.status === 'under-review')
                  const certified = visibleBills.filter(b => b.status === 'certified')
                  const received = visibleBills.filter(b => b.status === 'payment-received')
                  const stages = [
                    { label: 'Submitted', bills: submitted, color: '#6B7280', bg: 'bg-gray-500/10 border-gray-500/30' },
                    { label: 'Under Review', bills: underReview, color: '#F59E0B', bg: 'bg-amber-500/10 border-amber-500/30' },
                    { label: 'Certified', bills: certified, color: '#2563EB', bg: 'bg-blue-500/10 border-blue-500/30' },
                    { label: 'Collected', bills: received, color: '#10B981', bg: 'bg-green-500/10 border-green-500/30' },
                  ]
                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      {stages.map((s, i) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <div className={cn('rounded-lg border px-4 py-3 min-w-[130px] text-center', s.bg)}>
                            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.bills.length}</p>
                            <p className="text-xs font-semibold text-necl-text mt-0.5">{s.label}</p>
                            <p className="text-xs text-necl-muted mt-1">{formatINR(s.bills.reduce((sum, b) => sum + b.amount, 0))}</p>
                          </div>
                          {i < stages.length - 1 && (
                            <ChevronRight className="w-5 h-5 text-necl-muted shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              {/* Stuck Bills Aging Table */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-4">RA Bill Aging — In-flight Bills</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Bill No', 'Project', 'Client', 'Amount', 'Submitted', 'Days Stuck', 'Status', 'Risk'].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-necl-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stuckBills.map(b => {
                        const risk = b.daysStuck > 60 ? 'Critical' : b.daysStuck >= 30 ? 'High' : 'Normal'
                        const riskClass = b.daysStuck > 60
                          ? 'text-necl-critical bg-necl-critical/10'
                          : b.daysStuck >= 30
                          ? 'text-orange-400 bg-orange-400/10'
                          : 'text-necl-success bg-necl-success/10'
                        const isDisputed = b.projectId === 'KDSP-B1' && b.daysStuck === 67
                        return (
                          <tr key={b.id} className={cn('border-b border-necl-border/50 hover:bg-necl-bg/50', b.daysStuck > 60 && 'bg-necl-critical/5')}>
                            <td className="py-2.5 px-3 font-mono text-xs text-necl-text">{b.billNo}</td>
                            <td className="py-2.5 px-3 text-xs font-medium text-necl-text">{b.projectId}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted">{b.client}</td>
                            <td className="py-2.5 px-3 text-xs font-semibold text-necl-text">{formatINR(b.amount)}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted">{b.submittedDate}</td>
                            <td className="py-2.5 px-3">
                              <span className={cn('text-xs font-bold', b.daysStuck > 45 ? 'text-necl-critical' : 'text-necl-text')}>
                                {b.daysStuck}d
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="text-xs capitalize text-necl-muted">{b.status.replace('-', ' ')}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div>
                                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', riskClass)}>{risk}</span>
                                {isDisputed && (
                                  <p className="text-xs text-necl-critical mt-1">Canal lining dispute blocks billing</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {stuckBills.length === 0 && (
                    <p className="text-center text-necl-muted text-sm py-8">No in-flight bills for selected projects</p>
                  )}
                </div>
              </div>

              {/* VO Revenue Tracker */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-base font-semibold text-necl-text">Variation Order Revenue Pipeline</h2>
                </div>
                <p className="text-xs text-necl-muted mb-4">
                  Total VO pipeline: {formatINR(visibleVOs.reduce((s, v) => s + v.value, 0))} · {formatINR(voPipelineValue)} pending approval
                </p>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['VO Title', 'Project', 'Value', 'Type', 'Status', 'Submitted'].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-necl-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedVOs.map(v => {
                        const statusColors: Record<string, string> = {
                          mobilized: 'text-necl-success bg-necl-success/10',
                          approved: 'text-blue-400 bg-blue-400/10',
                          'pending-approval': 'text-necl-warning bg-necl-warning/10',
                          submitted: 'text-necl-muted bg-necl-bg',
                        }
                        return (
                          <tr key={v.id} className="border-b border-necl-border/50 hover:bg-necl-bg/50">
                            <td className="py-2.5 px-3 text-xs text-necl-text max-w-[200px] truncate">{v.title}</td>
                            <td className="py-2.5 px-3 text-xs font-medium text-necl-text">{v.projectId}</td>
                            <td className="py-2.5 px-3 text-xs font-semibold text-necl-text">{formatINR(v.value)}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted capitalize">{v.type}</td>
                            <td className="py-2.5 px-3">
                              <span className={cn('flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit', statusColors[v.status])}>
                                {v.status === 'pending-approval' && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-necl-warning animate-pulse" />
                                )}
                                {v.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted">{v.submittedDate}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* VO Status Donut + VO by Project */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-necl-text mb-2">VO Status Distribution</h3>
                    <NECLDonutChart
                      data={voStatusData}
                      centerValue={String(visibleVOs.length)}
                      centerLabel="VOs"
                      height={220}
                      showLegend
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-necl-text mb-3">VO Value by Project</h3>
                    <div className="space-y-2">
                      {visibleProjects.map(p => {
                        const pVOs = visibleVOs.filter(v => v.projectId === p.id)
                        const total = pVOs.reduce((s, v) => s + v.value, 0)
                        const maxVal = Math.max(...visibleProjects.map(pp => visibleVOs.filter(v => v.projectId === pp.id).reduce((s, v) => s + v.value, 0)), 1)
                        if (total === 0) return null
                        return (
                          <div key={p.id} className="flex items-center gap-3">
                            <span className="text-xs font-medium text-necl-text w-20 shrink-0">{p.id}</span>
                            <div className="flex-1 h-5 rounded bg-necl-bg overflow-hidden">
                              <div
                                className="h-full rounded transition-all"
                                style={{ width: `${(total / maxVal) * 100}%`, backgroundColor: PROJECT_COLORS[p.id] ?? '#6B7280' }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-necl-text w-16 text-right shrink-0">{formatINR(total)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collection Forecast */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    period: '0–30 Days',
                    amount: '₹18.75Cr',
                    bills: ['BMRC-E2 RA-9 ₹12.1Cr', 'NH-44X RA-20 ₹3.9Cr', 'RLWY-G4 RA-12 ₹2.85Cr', 'CHN-FLY RA-6 ₹1.8Cr'],
                    confidence: 'HIGH',
                    confColor: 'text-necl-success bg-necl-success/10 border-necl-success/30',
                    borderColor: 'border-l-necl-success',
                  },
                  {
                    period: '30–60 Days',
                    amount: '₹8.4Cr',
                    bills: ['HYD-M3 RA-14 ₹8.4Cr (if HMRL resolves review)'],
                    confidence: 'MEDIUM',
                    confColor: 'text-necl-warning bg-necl-warning/10 border-necl-warning/30',
                    borderColor: 'border-l-necl-warning',
                  },
                  {
                    period: '60–90 Days',
                    amount: '₹7.8Cr',
                    bills: ['MUM-CST RA-3 ₹6.8Cr', 'VIZG-P2 RA-4 ₹1.0Cr partial'],
                    confidence: 'LOW',
                    confColor: 'text-necl-critical bg-necl-critical/10 border-necl-critical/30',
                    borderColor: 'border-l-necl-critical',
                  },
                ].map(fc => (
                  <div key={fc.period} className={cn('rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-4 border-l-4', fc.borderColor)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-necl-muted">{fc.period}</span>
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full border', fc.confColor)}>
                        {fc.confidence}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-necl-text mb-3">{fc.amount}</p>
                    <ul className="space-y-1">
                      {fc.bills.map(b => (
                        <li key={b} className="text-xs text-necl-muted flex items-start gap-1">
                          <ArrowRight className="w-3 h-3 text-necl-accent mt-0.5 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Escalation Claims */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-3">Escalation Claims Tracker</h2>
                {unfiledEscalationValue > 0 && (
                  <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-necl-warning/10 border border-necl-warning/30 text-necl-warning text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {formatINR(unfiledEscalationValue)} in escalation claims unfiled — risk of deadline lapse
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Period', 'Material', 'Amount', 'Status', 'Deadline', 'Projects', 'Action'].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-necl-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleEscalation.map(ec => {
                        const rowClass = ec.status === 'unfiled'
                          ? 'bg-necl-critical/5 border-b border-necl-critical/20'
                          : ec.status === 'under-review'
                          ? 'bg-necl-warning/5 border-b border-necl-border/50'
                          : 'border-b border-necl-border/50'
                        const statusColors: Record<string, string> = {
                          unfiled: 'text-necl-critical bg-necl-critical/10',
                          filed: 'text-necl-muted bg-necl-bg',
                          'under-review': 'text-necl-warning bg-necl-warning/10',
                          approved: 'text-necl-success bg-necl-success/10',
                        }
                        return (
                          <tr key={ec.id} className={rowClass}>
                            <td className="py-2.5 px-3 text-xs text-necl-muted">{ec.periodLabel}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-text">{ec.material}</td>
                            <td className="py-2.5 px-3 text-xs font-semibold text-necl-text">{formatINR(ec.claimAmount)}</td>
                            <td className="py-2.5 px-3">
                              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', statusColors[ec.status])}>
                                {ec.status.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted">
                              {ec.deadline ?? '—'}
                              {ec.urgencyDays !== undefined && ec.urgencyDays <= 14 && (
                                <span className="ml-1 text-necl-critical font-bold">({ec.urgencyDays}d)</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted">{ec.projectIds.join(', ')}</td>
                            <td className="py-2.5 px-3">
                              {ec.status === 'unfiled' && (
                                <span className="text-xs font-semibold text-necl-critical">File immediately</span>
                              )}
                              {ec.status === 'filed' && (
                                <span className="text-xs text-necl-muted">Follow up</span>
                              )}
                              {ec.status === 'under-review' && (
                                <span className="text-xs text-necl-warning">Pending review</span>
                              )}
                              {ec.status === 'approved' && (
                                <CheckCircle className="w-4 h-4 text-necl-success" />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {visibleEscalation.length === 0 && (
                    <p className="text-center text-necl-muted text-sm py-8">No escalation claims for selected projects</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── COST & EVM TAB ───────────────────────────────────────────────── */}
          {activeTab === 'evm' && (
            <div className="space-y-6">
              {/* EVM Table */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-4">Earned Value Analysis — Portfolio</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Project', 'BAC', 'PV', 'EV', 'AC', 'CPI', 'SPI', 'EAC', 'VAC', 'TCPI', 'Trend'].map(h => (
                          <th key={h} className="text-right py-2 px-2 text-xs font-semibold text-necl-muted first:text-left last:text-center">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEVM.map(e => {
                        const cpiClass = e.cpi >= 1.0 ? 'text-necl-success' : e.cpi >= 0.9 ? 'text-necl-warning' : 'text-necl-critical'
                        const spiClass = e.spi >= 1.0 ? 'text-necl-success' : 'text-necl-warning'
                        const eacClass = e.eac > e.bac ? 'text-necl-critical' : 'text-necl-text'
                        const vacClass = e.vac < 0 ? 'text-necl-critical' : 'text-necl-success'
                        const tcpiClass = e.tcpi > 1.1 ? 'text-necl-critical' : e.tcpi >= 1.0 ? 'text-necl-warning' : 'text-necl-success'
                        return (
                          <tr key={e.projectId} className="border-b border-necl-border/50 hover:bg-necl-bg/50">
                            <td className="py-2.5 px-2 text-xs font-semibold text-necl-text">{e.projectId}</td>
                            <td className="py-2.5 px-2 text-xs text-right text-necl-muted">{formatINR(e.bac)}</td>
                            <td className="py-2.5 px-2 text-xs text-right text-necl-muted">{formatINR(e.pv)}</td>
                            <td className="py-2.5 px-2 text-xs text-right text-necl-muted">{formatINR(e.ev)}</td>
                            <td className="py-2.5 px-2 text-xs text-right text-necl-muted">{formatINR(e.ac)}</td>
                            <td className={cn('py-2.5 px-2 text-xs text-right font-bold', cpiClass)}>{e.cpi.toFixed(3)}</td>
                            <td className={cn('py-2.5 px-2 text-xs text-right font-bold', spiClass)}>{e.spi.toFixed(3)}</td>
                            <td className={cn('py-2.5 px-2 text-xs text-right font-semibold', eacClass)}>{formatINR(e.eac)}</td>
                            <td className={cn('py-2.5 px-2 text-xs text-right font-semibold', vacClass)}>{formatINR(e.vac)}</td>
                            <td className={cn('py-2.5 px-2 text-xs text-right font-bold', tcpiClass)}>{e.tcpi.toFixed(3)}</td>
                            <td className="py-2.5 px-2 flex justify-center">
                              <MiniSparkline data={e.weeklyCPI} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    {sortedEVM.length > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-necl-border bg-necl-bg/50">
                          <td className="py-2.5 px-2 text-xs font-bold text-necl-text">TOTAL</td>
                          <td className="py-2.5 px-2 text-xs text-right font-bold text-necl-text">{formatINR(totalBudget)}</td>
                          <td className="py-2.5 px-2 text-xs text-right font-bold text-necl-text">{formatINR(sortedEVM.reduce((s, e) => s + e.pv, 0))}</td>
                          <td className="py-2.5 px-2 text-xs text-right font-bold text-necl-text">{formatINR(sortedEVM.reduce((s, e) => s + e.ev, 0))}</td>
                          <td className="py-2.5 px-2 text-xs text-right font-bold text-necl-text">{formatINR(totalActual)}</td>
                          <td className={cn('py-2.5 px-2 text-xs text-right font-bold', avgCPI >= 1 ? 'text-necl-success' : 'text-necl-critical')}>{avgCPI.toFixed(3)}</td>
                          <td className="py-2.5 px-2" />
                          <td className={cn('py-2.5 px-2 text-xs text-right font-bold', totalEAC > totalBudget ? 'text-necl-critical' : 'text-necl-success')}>{formatINR(totalEAC)}</td>
                          <td className={cn('py-2.5 px-2 text-xs text-right font-bold', totalVAC < 0 ? 'text-necl-critical' : 'text-necl-success')}>{formatINR(totalVAC)}</td>
                          <td className="py-2.5 px-2" />
                          <td className="py-2.5 px-2" />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                  {sortedEVM.length === 0 && (
                    <p className="text-center text-necl-muted text-sm py-8">No EVM data for selected projects</p>
                  )}
                </div>
              </div>

              {/* BAC vs EAC Chart + Risk Panel */}
              <div className="grid lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="text-base font-semibold text-necl-text mb-4">BAC vs EAC by Project</h2>
                  <NECLBarChart
                    data={evmBacEac}
                    xKey="project"
                    series={[
                      { key: 'bac', label: 'Budget (BAC)', color: '#2563EB' },
                      { key: 'eac', label: 'EAC (Forecast)', color: '#EF4444' },
                    ]}
                    formatValue={(v: number) => `₹${v}L`}
                    height={240}
                    showLegend
                  />
                </div>
                <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="text-base font-semibold text-necl-text mb-1">EAC Risk Panel</h2>
                  <p className="text-xs text-necl-muted mb-4">Projects at EAC Overrun Risk</p>
                  <div className="space-y-3">
                    {sortedEVM.filter(e => e.eac > e.bac).map(e => {
                      const overrunPct = ((e.eac - e.bac) / e.bac) * 100
                      return (
                        <div key={e.projectId} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-necl-critical/5 border border-necl-critical/20">
                          <div>
                            <span className="text-xs font-bold text-necl-text">{e.projectId}</span>
                            <p className="text-xs text-necl-critical font-semibold mt-0.5 flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              VAC: {formatINR(e.vac)} · +{overrunPct.toFixed(1)}%
                            </p>
                          </div>
                          <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', e.cpi < 0.9 ? 'text-necl-critical bg-necl-critical/10' : 'text-necl-warning bg-necl-warning/10')}>
                            CPI {e.cpi.toFixed(2)}
                          </span>
                        </div>
                      )
                    })}
                    {sortedEVM.filter(e => e.eac > e.bac).length === 0 && (
                      <div className="flex items-center gap-2 text-necl-success text-xs">
                        <CheckCircle className="w-4 h-4" />
                        All projects within budget
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-necl-border">
                    <span className="text-xs text-necl-muted">Total portfolio EAC overrun</span>
                    <p className="text-base font-bold text-necl-critical mt-0.5">{formatINR(Math.max(0, totalEAC - totalBudget))}</p>
                  </div>
                </div>
              </div>

              {/* Cost Category Breakdown */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="text-base font-semibold text-necl-text mb-4">Cost Category Breakdown</h2>
                  <NECLDonutChart
                    data={categoryChartData}
                    centerValue={formatINR(visibleCategories.reduce((s, c) => s + c.total, 0))}
                    centerLabel="spent"
                    height={240}
                    showLegend
                  />
                </div>
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                  <h2 className="text-base font-semibold text-necl-text mb-4">Per-Project Cost Breakdown</h2>
                  <div className="space-y-4">
                    {visibleCategories.map(c => {
                      const proj = visibleProjects.find(p => p.id === c.projectId)
                      const costVariance = proj ? proj.actual - proj.budget : 0
                      const segments = [
                        { pct: c.materialsPct, color: '#2563EB' },
                        { pct: c.laborPct, color: '#10B981' },
                        { pct: c.plantPct, color: '#F59E0B' },
                        { pct: c.subcontractorPct, color: '#8B5CF6' },
                        { pct: c.overheadsPct, color: '#6B7280' },
                      ]
                      return (
                        <div key={c.projectId}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-necl-text">{c.projectId}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-necl-muted">{formatINR(c.total)}</span>
                              <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', costVariance > 0 ? 'text-necl-critical bg-necl-critical/10' : 'text-necl-success bg-necl-success/10')}>
                                {costVariance > 0 ? '+' : ''}{formatINR(costVariance)}
                              </span>
                            </div>
                          </div>
                          <div className="flex h-3 rounded-full overflow-hidden gap-px">
                            {segments.map((seg, i) => (
                              <div key={i} style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} className="h-full" />
                            ))}
                          </div>
                          <div className="flex gap-3 mt-1">
                            {[
                              { label: 'Mat', pct: c.materialsPct, color: '#2563EB' },
                              { label: 'Lab', pct: c.laborPct, color: '#10B981' },
                              { label: 'Plt', pct: c.plantPct, color: '#F59E0B' },
                              { label: 'Sub', pct: c.subcontractorPct, color: '#8B5CF6' },
                              { label: 'OH', pct: c.overheadsPct, color: '#6B7280' },
                            ].map(s => (
                              <span key={s.label} className="text-[10px] text-necl-muted flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                                {s.pct.toFixed(0)}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    {visibleCategories.length === 0 && (
                      <p className="text-center text-necl-muted text-sm py-8">No cost data for selected projects</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly CPI Trend */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-4">Weekly CPI Trend (Last 7 Weeks)</h2>
                <NECLAreaChart
                  data={weeklyChartData}
                  xKey="week"
                  height={200}
                  series={visibleEVM.map(e => ({ key: e.projectId, label: e.projectId, color: PROJECT_COLORS[e.projectId] ?? '#6B7280' }))}
                  formatValue={(v: number) => v.toFixed(2)}
                  showLegend
                />
              </div>

              {/* Cost vs Schedule Quadrant */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-4">Cost vs Schedule Quadrant</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Project', 'CPI', 'SPI', 'Sched Variance', 'Quadrant', 'Risk'].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-necl-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEVM.map(e => {
                        const schedVariance = formatINR(e.ev - e.pv)
                        let quadrant: string
                        let quadrantClass: string
                        let risk: 'low' | 'medium' | 'high' | 'critical'
                        if (e.cpi >= 1 && e.spi >= 1) {
                          quadrant = 'Ahead on cost and schedule'
                          quadrantClass = 'text-necl-success'
                          risk = 'low'
                        } else if (e.cpi >= 1 && e.spi < 1) {
                          quadrant = 'Under cost but behind schedule'
                          quadrantClass = 'text-necl-warning'
                          risk = 'medium'
                        } else if (e.cpi < 1 && e.spi >= 1) {
                          quadrant = 'Over cost but ahead on schedule'
                          quadrantClass = 'text-necl-warning'
                          risk = 'medium'
                        } else {
                          quadrant = 'Double jeopardy — immediate intervention needed'
                          quadrantClass = 'text-necl-critical'
                          risk = 'critical'
                        }
                        return (
                          <tr key={e.projectId} className="border-b border-necl-border/50 hover:bg-necl-bg/50">
                            <td className="py-2.5 px-3 text-xs font-semibold text-necl-text">{e.projectId}</td>
                            <td className={cn('py-2.5 px-3 text-xs font-bold', e.cpi >= 1 ? 'text-necl-success' : 'text-necl-critical')}>{e.cpi.toFixed(3)}</td>
                            <td className={cn('py-2.5 px-3 text-xs font-bold', e.spi >= 1 ? 'text-necl-success' : 'text-necl-warning')}>{e.spi.toFixed(3)}</td>
                            <td className={cn('py-2.5 px-3 text-xs font-semibold', e.ev >= e.pv ? 'text-necl-success' : 'text-necl-critical')}>{schedVariance}</td>
                            <td className={cn('py-2.5 px-3 text-xs font-medium', quadrantClass)}>{quadrant}</td>
                            <td className="py-2.5 px-3">
                              <StatusPill status={risk} />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Material Cost Intelligence */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-base font-semibold text-necl-text">Material Cost Intelligence</h2>
                  {unfiledEscalationValue > 0 && (
                    <span className="text-xs font-semibold text-necl-warning flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {formatINR(unfiledEscalationValue)} unfiled escalation recovery available
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {visibleCategories.map(c => {
                    const benchmark = 42
                    const isHigh = c.materialsPct > 44
                    return (
                      <div key={c.projectId} className={cn('p-3 rounded-lg border', isHigh ? 'bg-necl-warning/5 border-necl-warning/30' : 'bg-necl-bg border-necl-border')}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-necl-text">{c.projectId}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-necl-muted">
                              {c.materialsPct.toFixed(1)}% vs {benchmark}% benchmark
                            </span>
                            {isHigh ? (
                              <span className="text-xs font-semibold text-necl-warning flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Materials-heavy
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-necl-success flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Within benchmark
                              </span>
                            )}
                          </div>
                        </div>
                        {isHigh && (
                          <p className="text-xs text-necl-warning mt-1">Materials-heavy — check procurement variance</p>
                        )}
                        <div className="mt-2 h-1.5 rounded-full bg-necl-bg overflow-hidden">
                          <div
                            className={cn('h-full rounded-full', isHigh ? 'bg-necl-warning' : 'bg-necl-success')}
                            style={{ width: `${Math.min(c.materialsPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── OBLIGATIONS TAB ──────────────────────────────────────────────── */}
          {activeTab === 'obligations' && (
            <div className="space-y-6">
              {/* Upcoming Payments */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-base font-semibold text-necl-text">Upcoming Payments</h2>
                </div>
                <div className={cn('flex items-center gap-2 px-3 py-2 mb-4 rounded-lg text-xs font-semibold border',
                  185000000 > totalPaymentsNextMonth
                    ? 'bg-necl-success/10 border-necl-success/30 text-necl-success'
                    : 'bg-necl-critical/10 border-necl-critical/30 text-necl-critical'
                )}>
                  <Building2 className="w-4 h-4 shrink-0" />
                  {formatINR(totalPaymentsNextMonth)} due this month — cash position:{' '}
                  {185000000 > totalPaymentsNextMonth ? 'Adequate (Jul forecast covers)' : 'Tight'}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Due Date', 'PO Ref', 'Project', 'Vendor', 'Item', 'Amount', 'Terms', 'Status'].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-necl-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPayments.map(p => {
                        const rowClass = p.status === 'overdue'
                          ? 'bg-necl-critical/5 border-l-2 border-l-necl-critical'
                          : p.status === 'due-soon'
                          ? 'bg-necl-warning/5 border-l-2 border-l-necl-warning'
                          : ''
                        return (
                          <tr key={p.id} className={cn('border-b border-necl-border/50', rowClass)}>
                            <td className="py-2.5 px-3 text-xs font-medium text-necl-text">{p.dueDate}</td>
                            <td className="py-2.5 px-3 text-xs font-mono text-necl-muted">{p.poRef}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-text">{p.projectId}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted max-w-[140px] truncate">{p.vendor}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted max-w-[160px] truncate">{p.item}</td>
                            <td className="py-2.5 px-3 text-xs font-semibold text-necl-text">{formatINR(p.amount)}</td>
                            <td className="py-2.5 px-3 text-xs text-necl-muted">{p.termsDays}d</td>
                            <td className="py-2.5 px-3">
                              {p.status === 'overdue' && <StatusPill status="delayed" />}
                              {p.status === 'due-soon' && <StatusPill status="at-risk" />}
                              {p.status === 'upcoming' && <StatusPill status="on-track" />}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {sortedPayments.length === 0 && (
                    <p className="text-center text-necl-muted text-sm py-8">No payment schedules for selected projects</p>
                  )}
                </div>
              </div>

              {/* Bank Guarantee Tracker */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-base font-semibold text-necl-text">Bank Guarantee Register</h2>
                  <Shield className="w-4 h-4 text-necl-muted" />
                </div>
                <p className="text-xs text-necl-muted mb-4">
                  Total exposure: {formatINR(totalBGExposure)} · {expiringBGs.length} expiring within 60 days
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['ID', 'Project', 'Type', 'Bank', 'Client', 'Amount', 'Expiry', 'Days Left', 'Status', 'Action'].map(h => (
                          <th key={h} className="text-left py-2 px-2 text-xs font-semibold text-necl-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBGs.map(bg => {
                        const rowClass = bg.daysToExpiry <= 30 && bg.status === 'expiring-soon'
                          ? 'bg-necl-critical/5'
                          : bg.daysToExpiry <= 60 && bg.status === 'expiring-soon'
                          ? 'bg-necl-warning/5'
                          : ''
                        let actionEl: React.ReactNode
                        if (bg.daysToExpiry <= 16) {
                          actionEl = <span className="text-xs font-bold text-necl-critical animate-pulse">RENEW URGENT</span>
                        } else if (bg.daysToExpiry <= 32) {
                          actionEl = <span className="text-xs font-bold text-necl-critical">Renew within 30d</span>
                        } else if (bg.daysToExpiry <= 60) {
                          actionEl = <span className="text-xs font-semibold text-necl-warning">Plan renewal</span>
                        } else {
                          actionEl = <span className="text-xs text-necl-success">Active</span>
                        }
                        return (
                          <tr key={bg.id} className={cn('border-b border-necl-border/50 hover:bg-necl-bg/50', rowClass)}>
                            <td className="py-2.5 px-2 text-xs font-mono text-necl-muted">{bg.id}</td>
                            <td className="py-2.5 px-2 text-xs font-medium text-necl-text">{bg.projectId}</td>
                            <td className="py-2.5 px-2 text-xs text-necl-muted capitalize">{bg.type}</td>
                            <td className="py-2.5 px-2 text-xs text-necl-muted">{bg.bank}</td>
                            <td className="py-2.5 px-2 text-xs text-necl-muted">{bg.client}</td>
                            <td className="py-2.5 px-2 text-xs font-semibold text-necl-text">{formatINR(bg.amount)}</td>
                            <td className="py-2.5 px-2 text-xs text-necl-muted">{bg.expiryDate}</td>
                            <td className={cn('py-2.5 px-2 text-xs font-bold', bg.daysToExpiry <= 30 ? 'text-necl-critical' : bg.daysToExpiry <= 60 ? 'text-necl-warning' : 'text-necl-success')}>
                              {bg.daysToExpiry}d
                            </td>
                            <td className="py-2.5 px-2">
                              {bg.status === 'active' && <StatusPill status="active" />}
                              {bg.status === 'expiring-soon' && <StatusPill status="at-risk" />}
                              {bg.status === 'expired' && <StatusPill status="critical" />}
                              {bg.status === 'returned' && <StatusPill status="on-track" />}
                            </td>
                            <td className="py-2.5 px-2">{actionEl}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {sortedBGs.length === 0 && (
                    <p className="text-center text-necl-muted text-sm py-8">No bank guarantees for selected projects</p>
                  )}
                </div>
              </div>

              {/* GST & TDS Position */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-4">GST &amp; TDS Position</h2>
                {/* Portfolio totals strip */}
                <div className="flex flex-wrap gap-4 mb-5 p-3 rounded-lg bg-necl-bg border border-necl-border">
                  <div>
                    <span className="text-xs text-necl-muted">Total GST Credit</span>
                    <p className="text-sm font-bold text-necl-success">{formatINR(totalGSTCredit)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-necl-muted">Total TDS Locked</span>
                    <p className="text-sm font-bold text-necl-warning">{formatINR(totalTDSLocked)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-necl-muted">Total Tax Locked</span>
                    <p className="text-sm font-bold text-necl-critical">{formatINR(totalTaxLockedAll)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {visibleTax.map(t => (
                    <div key={t.projectId} className="rounded-lg border border-necl-border bg-necl-bg p-3">
                      <h3 className="text-xs font-bold text-necl-text border-b border-necl-border pb-2 mb-2">{t.projectId}</h3>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-necl-muted">GST Input</span>
                          <span className="text-xs font-semibold text-necl-success">{formatINR(t.gstInputCredit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-necl-muted">GST Output</span>
                          <span className="text-xs font-semibold text-necl-critical">{formatINR(t.gstOutputLiability)}</span>
                        </div>
                        <div className="flex justify-between border-t border-necl-border pt-1.5">
                          <span className="text-xs text-necl-muted">Net GST</span>
                          <span className={cn('text-xs font-bold', t.netGSTPosition >= 0 ? 'text-necl-success' : 'text-necl-critical')}>
                            {t.netGSTPosition >= 0 ? 'Credit ' : 'Liability '}
                            {formatINR(Math.abs(t.netGSTPosition))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-necl-muted">TDS Deducted</span>
                          <span className="text-xs font-semibold text-necl-warning">{formatINR(t.tdsDeductedByClient)}</span>
                        </div>
                        <div className="flex justify-between border-t border-necl-border pt-1.5">
                          <span className="text-xs font-semibold text-necl-text">Total Locked</span>
                          <span className="text-xs font-bold text-necl-critical">{formatINR(t.totalTaxLocked)}</span>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-necl-border flex gap-2 flex-wrap">
                        {t.netGSTPosition >= 0 && (
                          <span className="text-xs text-necl-accent font-medium cursor-pointer hover:underline">File GSTR-3B</span>
                        )}
                        {t.tdsDeductedByClient > 0 && (
                          <span className="text-xs text-necl-accent font-medium cursor-pointer hover:underline">Claim TDS refund</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {visibleTax.length === 0 && (
                    <div className="col-span-4 text-center text-necl-muted text-sm py-8">No tax position data for selected projects</div>
                  )}
                </div>
              </div>

              {/* Retention Schedule */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-base font-semibold text-necl-text">Client Retention Register</h2>
                </div>
                <p className="text-xs text-necl-muted mb-4">
                  {formatINR(totalRetentionHeld)} held across {visibleRetention.length} project{visibleRetention.length !== 1 ? 's' : ''}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-necl-border">
                        {['Project', 'Client', 'Contract Value', 'Retention %', 'Amount Held', 'Release Milestone', 'Release Date'].map(h => (
                          <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-necl-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...visibleRetention].sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()).map(r => (
                        <tr key={r.projectId} className="border-b border-necl-border/50 hover:bg-necl-bg/50">
                          <td className="py-2.5 px-3 text-xs font-semibold text-necl-text">{r.projectId}</td>
                          <td className="py-2.5 px-3 text-xs text-necl-muted">{r.client}</td>
                          <td className="py-2.5 px-3 text-xs text-necl-text">{formatINR(r.totalContractValue)}</td>
                          <td className="py-2.5 px-3 text-xs text-necl-text">{r.retentionHeldPct}%</td>
                          <td className="py-2.5 px-3 text-xs font-semibold text-necl-warning">{formatINR(r.retentionAmount)}</td>
                          <td className="py-2.5 px-3 text-xs text-necl-muted">{r.releaseMilestone}</td>
                          <td className="py-2.5 px-3 text-xs text-necl-muted">{r.releaseDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {visibleRetention.length === 0 && (
                    <p className="text-center text-necl-muted text-sm py-8">No retention data for selected projects</p>
                  )}
                </div>
              </div>

              {/* Statutory Compliance Checklist */}
              <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
                <h2 className="text-base font-semibold text-necl-text mb-4">Statutory Compliance Checklist</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* BGs expiring < 30d */}
                  <div className={cn('p-3 rounded-lg border', expiringBGs.filter(b => b.daysToExpiry <= 30).length > 0 ? 'bg-necl-critical/5 border-necl-critical/30' : 'bg-necl-bg border-necl-border')}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={cn('w-4 h-4', expiringBGs.filter(b => b.daysToExpiry <= 30).length > 0 ? 'text-necl-critical' : 'text-necl-success')} />
                      <span className="text-xs font-semibold text-necl-text">BG Renewals</span>
                      {expiringBGs.filter(b => b.daysToExpiry <= 30).length > 0 && (
                        <span className="text-xs font-bold text-necl-critical ml-auto">URGENT</span>
                      )}
                    </div>
                    {expiringBGs.filter(b => b.daysToExpiry <= 30).length > 0 ? (
                      <ul className="space-y-1">
                        {expiringBGs.filter(b => b.daysToExpiry <= 30).map(bg => (
                          <li key={bg.id} className="text-xs text-necl-critical">
                            {bg.id} ({bg.projectId}) — {bg.daysToExpiry}d left
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-necl-success">No BGs expiring within 30 days</p>
                    )}
                  </div>

                  {/* Unfiled escalation */}
                  <div className={cn('p-3 rounded-lg border', unfiledEscalationValue > 0 ? 'bg-necl-critical/5 border-necl-critical/30' : 'bg-necl-bg border-necl-border')}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className={cn('w-4 h-4', unfiledEscalationValue > 0 ? 'text-necl-critical' : 'text-necl-success')} />
                      <span className="text-xs font-semibold text-necl-text">Escalation Claims</span>
                      {unfiledEscalationValue > 0 && (
                        <span className="text-xs font-bold text-necl-critical ml-auto">ACTION</span>
                      )}
                    </div>
                    {unfiledEscalationValue > 0 ? (
                      <div>
                        <p className="text-xs text-necl-critical font-semibold">{formatINR(unfiledEscalationValue)} unfiled</p>
                        {visibleEscalation.filter(ec => ec.status === 'unfiled' && ec.deadline).map(ec => (
                          <p key={ec.id} className="text-xs text-necl-muted mt-1">{ec.material}: deadline {ec.deadline}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-necl-success">All escalation claims filed</p>
                    )}
                  </div>

                  {/* GSTR-3B */}
                  <div className="p-3 rounded-lg border bg-necl-warning/5 border-necl-warning/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Receipt className="w-4 h-4 text-necl-warning" />
                      <span className="text-xs font-semibold text-necl-text">GSTR-3B</span>
                      <span className="text-xs font-bold text-necl-warning ml-auto">DUE SOON</span>
                    </div>
                    <p className="text-xs text-necl-muted">GSTR-3B due July 20 for June 2026 period</p>
                  </div>

                  {/* Form 16A */}
                  <div className="p-3 rounded-lg border bg-necl-warning/5 border-necl-warning/30">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-necl-warning" />
                      <span className="text-xs font-semibold text-necl-text">Form 16A</span>
                      <span className="text-xs font-bold text-necl-warning ml-auto">Q1</span>
                    </div>
                    <p className="text-xs text-necl-muted">TDS certificates Q1 issuance due by June 30 2026</p>
                  </div>

                  {/* Advance Tax */}
                  <div className="p-3 rounded-lg border bg-blue-500/5 border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-semibold text-necl-text">Advance Tax</span>
                      <span className="text-xs font-bold text-blue-400 ml-auto">UPCOMING</span>
                    </div>
                    <p className="text-xs text-necl-muted">Q1 FY27 advance tax due September 15, 2026</p>
                  </div>

                  {/* Budget tracking summary */}
                  <div className={cn('p-3 rounded-lg border', totalActual > totalBudget ? 'bg-necl-critical/5 border-necl-critical/30' : 'bg-necl-success/5 border-necl-success/30')}>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className={cn('w-4 h-4', totalActual > totalBudget ? 'text-necl-critical' : 'text-necl-success')} />
                      <span className="text-xs font-semibold text-necl-text">Portfolio Budget</span>
                    </div>
                    <p className={cn('text-xs font-semibold', totalActual > totalBudget ? 'text-necl-critical' : 'text-necl-success')}>
                      {totalActual > totalBudget ? `Overrun: ${formatINR(totalActual - totalBudget)}` : `Surplus: ${formatINR(totalBudget - totalActual)}`}
                    </p>
                    <p className="text-xs text-necl-muted mt-0.5">
                      {((totalActual / totalBudget) * 100).toFixed(1)}% of budget consumed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
