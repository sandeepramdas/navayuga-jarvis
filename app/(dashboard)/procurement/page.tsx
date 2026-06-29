'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, AlertTriangle, AlertCircle, TrendingDown, TrendingUp,
  ArrowRight, Clock, CheckCircle2, FileText, Package, Truck,
  IndianRupee, Zap, RefreshCw, Calendar, BarChart2, Shield,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { StatusPill } from '@/components/ui/StatusPill'
import { NECLBarChart } from '@/components/charts/BarChart'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { purchaseOrders } from '@/lib/mock-data/procurement'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { projects } from '@/lib/mock-data/projects'
import { formatINR, cn } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'
import {
  rateContracts,
  escalationClaims,
  vendorPerformance,
  consolidationOpportunities,
  reallocationOpportunities,
  paymentSchedule,
  vendorEmpanelments,
} from '@/lib/mock-data/procurement-extended'

// ── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-06-29')

const PROJECT_COLOR: Record<string, string> = {
  'HYD-M3': '#EF4444',
  'BMRC-E2': '#2563EB',
  'NH-44X': '#10B981',
  'KDSP-B1': '#F59E0B',
  'CHN-FLY': '#8B5CF6',
  'MUM-CST': '#06B6D4',
  'RLWY-G4': '#F97316',
  'VIZG-P2': '#EC4899',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysFromToday(dateStr: string): number {
  return Math.round((new Date(dateStr).getTime() - TODAY.getTime()) / 86400000)
}

function shortLabel(v: number): string {
  if (v >= 10_000_000) return `₹${(v / 10_000_000).toFixed(1)}Cr`
  if (v >= 100_000) return `₹${(v / 100_000).toFixed(1)}L`
  return `₹${(v / 1_000).toFixed(0)}K`
}

// ── Page Component ─────────────────────────────────────────────────────────────

export default function ProcurementPage() {
  const { role, selectedProjects } = useApp()
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'delayed' | 'received'>('all')
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const isSiteManager = role === 'site-manager'

  // ── Derived: effective scope ────────────────────────────────────────────────
  const effectiveProjects = useMemo(
    () => (isSiteManager ? ['KDSP-B1'] : selectedProjects),
    [isSiteManager, selectedProjects],
  )

  // ── Visible POs ─────────────────────────────────────────────────────────────
  const visiblePOs = useMemo(
    () => purchaseOrders.filter(po => effectiveProjects.includes(po.projectId)),
    [effectiveProjects],
  )

  const visibleProjects = useMemo(
    () => projects.filter(p => effectiveProjects.includes(p.id)),
    [effectiveProjects],
  )

  // ── Category spend (bar chart) ───────────────────────────────────────────────
  const categorySpend = useMemo(() => {
    const map = new Map<string, number>()
    visiblePOs
      .filter(po => po.status !== 'received')
      .forEach(po => map.set(po.category, (map.get(po.category) ?? 0) + po.totalValue))
    return Array.from(map.entries())
      .map(([category, value]) => ({ category: category.charAt(0).toUpperCase() + category.slice(1), value }))
      .sort((a, b) => b.value - a.value)
  }, [visiblePOs])

  // ── Stockout items ───────────────────────────────────────────────────────────
  const stockoutItems = useMemo(
    () =>
      visiblePOs
        .filter(po => po.stockoutRisk > 0)
        .sort((a, b) => a.stockoutRisk - b.stockoutRisk)
        .slice(0, 6),
    [visiblePOs],
  )

  // ── Pending approval with age ────────────────────────────────────────────────
  const pendingApproval = useMemo(() => {
    return visiblePOs
      .filter(po => po.status === 'pending')
      .map(po => {
        const raised = new Date(po.raisedDate)
        const ageDays = Math.floor((TODAY.getTime() - raised.getTime()) / (1000 * 60 * 60 * 24))
        return { ...po, ageDays }
      })
      .sort((a, b) => b.ageDays - a.ageDays)
  }, [visiblePOs])

  // ── GST total ────────────────────────────────────────────────────────────────
  const totalGST = useMemo(
    () => visiblePOs.reduce((s, po) => s + po.gstAmount, 0),
    [visiblePOs],
  )

  // ── Working capital locked in excess stock ───────────────────────────────────
  const workingCapitalItems = useMemo(() => {
    return visiblePOs
      .filter(po => po.reorderPoint > 0 && po.stockLevel > po.reorderPoint * 1.5)
      .map(po => {
        const excess = po.stockLevel - po.reorderPoint * 1.5
        const unitPrice = po.quantity > 0 ? po.totalValue / po.quantity : 0
        const excessValue = excess * unitPrice
        return { ...po, excess, unitPrice, excessValue }
      })
  }, [visiblePOs])

  const totalWorkingCapitalLocked = useMemo(
    () => workingCapitalItems.reduce((s, it) => s + it.excessValue, 0),
    [workingCapitalItems],
  )

  // ── Budget vs committed by project ───────────────────────────────────────────
  const committedByProject = useMemo(() => {
    return effectiveProjects.map(projectId => {
      const project = projects.find(p => p.id === projectId)
      const projectPOs = purchaseOrders.filter(po => po.projectId === projectId)
      const materialsBudget = (project?.budget ?? 0) * 0.42
      const committed = projectPOs.reduce((s, po) => s + po.totalValue, 0)
      const received = projectPOs
        .filter(po => po.status === 'received')
        .reduce((s, po) => s + po.totalValue, 0)
      return {
        projectId,
        projectName: project?.name ?? projectId,
        materialsBudget,
        committed,
        received,
        variance: committed - materialsBudget,
      }
    })
  }, [effectiveProjects])

  // ── Payments due ─────────────────────────────────────────────────────────────
  const visiblePayments = useMemo(
    () =>
      paymentSchedule
        .filter(p => effectiveProjects.includes(p.projectId))
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [effectiveProjects],
  )

  // ── Vendor performance ───────────────────────────────────────────────────────
  const visibleVendors = useMemo(
    () =>
      vendorPerformance
        .filter(v => v.activeProjects.some(p => effectiveProjects.includes(p)))
        .sort((a, b) => a.onTimeRate - b.onTimeRate),
    [effectiveProjects],
  )

  // ── Consolidation opportunities ──────────────────────────────────────────────
  const visibleConsolidation = useMemo(
    () =>
      consolidationOpportunities.filter(co =>
        co.projects.some(p => effectiveProjects.includes(p.projectId)),
      ),
    [effectiveProjects],
  )

  const totalConsolidationSavings = useMemo(
    () => visibleConsolidation.reduce((s, co) => s + co.savings, 0),
    [visibleConsolidation],
  )

  // ── Reallocation opportunities ───────────────────────────────────────────────
  const visibleReallocation = useMemo(
    () =>
      reallocationOpportunities.filter(
        ra =>
          effectiveProjects.includes(ra.surplusProjectId) ||
          effectiveProjects.includes(ra.deficitProjectId),
      ),
    [effectiveProjects],
  )

  // ── Escalation claims ────────────────────────────────────────────────────────
  const visibleEscalation = useMemo(
    () => escalationClaims.filter(ec => ec.projectIds.some(p => effectiveProjects.includes(p))),
    [effectiveProjects],
  )

  const unfiledEscalationValue = useMemo(
    () =>
      visibleEscalation
        .filter(ec => ec.status === 'unfiled')
        .reduce((s, ec) => s + ec.claimAmount, 0),
    [visibleEscalation],
  )

  // ── Rate contracts ───────────────────────────────────────────────────────────
  const visibleRateContracts = useMemo(
    () => rateContracts.filter(rc => rc.projects.some(p => effectiveProjects.includes(p))),
    [effectiveProjects],
  )

  // ── Empanelments (show all) ──────────────────────────────────────────────────
  const visibleEmpanelments = useMemo(() => vendorEmpanelments, [])

  // ── KPI derivations ──────────────────────────────────────────────────────────
  const totalOpenCommitments = useMemo(
    () => visiblePOs.filter(p => p.status !== 'received').reduce((s, p) => s + p.totalValue, 0),
    [visiblePOs],
  )
  const activePOCount = useMemo(
    () => visiblePOs.filter(p => p.status !== 'received').length,
    [visiblePOs],
  )
  const delayedCount = useMemo(
    () => visiblePOs.filter(p => p.status === 'delayed').length,
    [visiblePOs],
  )
  const stockoutCriticalCount = useMemo(
    () => visiblePOs.filter(p => p.stockoutRisk > 0 && p.stockoutRisk <= 5).length,
    [visiblePOs],
  )
  const receivedCount = useMemo(
    () => visiblePOs.filter(p => p.status === 'received').length,
    [visiblePOs],
  )

  // ── Filtered POs (for table) ─────────────────────────────────────────────────
  const filteredPOs = useMemo(
    () => (filterStatus === 'all' ? visiblePOs : visiblePOs.filter(po => po.status === filterStatus)),
    [visiblePOs, filterStatus],
  )

  // ── Procurement alerts & recommendations ─────────────────────────────────────
  const procAlerts = useMemo(
    () =>
      alerts.filter(
        a =>
          a.department === 'procurement' &&
          (isSiteManager
            ? a.projectId === 'KDSP-B1'
            : selectedProjects.includes(a.projectId ?? '')),
      ),
    [isSiteManager, selectedProjects],
  )

  const procRecs = useMemo(
    () =>
      recommendations.filter(
        r =>
          r.department === 'Procurement' &&
          (isSiteManager
            ? r.projectId === 'KDSP-B1'
            : selectedProjects.includes(r.projectId ?? '')),
      ),
    [isSiteManager, selectedProjects],
  )

  // ── Vendor concentration (from visiblePOs) ────────────────────────────────────
  const vendorConcentration = useMemo(() => {
    const catMap = new Map<string, Map<string, number>>()
    visiblePOs.forEach(po => {
      if (!catMap.has(po.category)) catMap.set(po.category, new Map())
      const vMap = catMap.get(po.category)!
      vMap.set(po.vendor, (vMap.get(po.vendor) ?? 0) + po.totalValue)
    })
    return Array.from(catMap.entries()).map(([category, vMap]) => {
      const total = Array.from(vMap.values()).reduce((s, v) => s + v, 0)
      const sorted = Array.from(vMap.entries()).sort((a, b) => b[1] - a[1])
      const dominant = sorted[0]
      const share = total > 0 ? Math.round((dominant[1] / total) * 100) : 0
      return { category, dominantVendor: dominant[0], share, isSingleSource: share === 100 }
    }).sort((a, b) => b.share - a.share)
  }, [visiblePOs])

  // ── Critical flags ────────────────────────────────────────────────────────────
  const criticalFlags = useMemo(() => {
    const flags: string[] = []
    const minStockout = stockoutItems.length > 0 ? stockoutItems[0].stockoutRisk : 99
    if (minStockout <= 3) flags.push(`Stockout in ${minStockout}d — ${stockoutItems[0].item} @ ${stockoutItems[0].projectId}`)
    const expired = visibleEmpanelments.filter(e => e.overallStatus === 'expired')
    expired.forEach(e => flags.push(`${e.vendor}: ${e.criticalFlag}`))
    if (unfiledEscalationValue > 0) flags.push(`${formatINR(unfiledEscalationValue)} escalation claims un-filed`)
    return flags
  }, [stockoutItems, visibleEmpanelments, unfiledEscalationValue])

  // ── Stock gauge items (reorderPoint > 0 only) ────────────────────────────────
  const stockGaugeItems = useMemo(
    () => visiblePOs.filter(po => po.reorderPoint > 0),
    [visiblePOs],
  )

  // ── Payment buckets for calendar ──────────────────────────────────────────────
  const paymentBuckets = useMemo(() => {
    const buckets: { label: string; start: string; end: string }[] = [
      { label: 'Jul 1–7', start: '2026-07-01', end: '2026-07-07' },
      { label: 'Jul 8–14', start: '2026-07-08', end: '2026-07-14' },
      { label: 'Jul 15–21', start: '2026-07-15', end: '2026-07-21' },
      { label: 'Jul 22–31', start: '2026-07-22', end: '2026-07-31' },
      { label: 'Aug 1–31', start: '2026-08-01', end: '2026-08-31' },
    ]
    return buckets.map(b => ({
      ...b,
      payments: visiblePayments.filter(p => p.dueDate >= b.start && p.dueDate <= b.end),
      total: visiblePayments
        .filter(p => p.dueDate >= b.start && p.dueDate <= b.end)
        .reduce((s, p) => s + p.amount, 0),
    }))
  }, [visiblePayments])

  // ── EARLY RETURN ─────────────────────────────────────────────────────────────
  if (!isSiteManager && effectiveProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Procurement</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-[1600px]">

      {/* ── Section 1: Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-necl-accent/15 border border-necl-accent/30 flex items-center justify-center">
            <ShoppingCart className="w-4.5 h-4.5 text-necl-accent" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-necl-text">Procurement</h1>
            <p className="text-xs text-necl-muted mt-0.5">
              {activePOCount} active POs &middot; {formatINR(totalOpenCommitments)} committed &middot; {stockoutCriticalCount} critical stockouts
              {unfiledEscalationValue > 0 && ` · ${formatINR(unfiledEscalationValue)} escalation un-filed`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 2: Critical Banner ────────────────────────────────────────── */}
      <AnimatePresence>
        {criticalFlags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-necl-critical/40 bg-necl-critical/8 px-5 py-3 flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.07)' }}
          >
            <Zap className="w-4 h-4 text-necl-critical flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {criticalFlags.map((flag, i) => (
                <span key={i} className="text-xs font-semibold text-necl-critical">{flag}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Section 3: KPI Tiles ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPITile
          label="Open Commitments"
          value={formatINR(totalOpenCommitments)}
          subtitle={`${activePOCount} active POs`}
          status="blue"
          sparklineData={[16, 17, 18, 17, 18, 19, activePOCount]}
        />
        <KPITile
          label="Delayed POs"
          value={String(delayedCount)}
          subtitle="Requiring escalation"
          status={delayedCount > 0 ? 'red' : 'green'}
          sparklineData={[1, 2, 2, 3, 3, 3, delayedCount]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="Stockout Critical"
          value={`${stockoutCriticalCount}`}
          subtitle="≤5 days cover remaining"
          status={stockoutCriticalCount > 0 ? 'red' : 'green'}
          sparklineData={[0, 1, 2, 2, 3, 3, stockoutCriticalCount]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="GST Committed"
          value={formatINR(totalGST)}
          subtitle="Across open POs"
          status="amber"
        />
        <KPITile
          label="Pending Approval"
          value={`${pendingApproval.length}`}
          subtitle={pendingApproval.length > 0 ? formatINR(pendingApproval.reduce((s, p) => s + p.totalValue, 0)) : 'All clear'}
          status={pendingApproval.length > 0 ? 'amber' : 'green'}
        />
        <KPITile
          label="POs Received"
          value={`${receivedCount}`}
          subtitle="This period"
          status="green"
          sparklineData={[3, 4, 5, 6, 7, 8, receivedCount]}
        />
      </div>

      {/* ── Section 4: Stockout Countdown + Cross-Project Reallocation ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Materials Going Critical */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-necl-critical" />
            <h2 className="text-sm font-bold text-necl-text">Materials Going Critical</h2>
            <span className="ml-auto text-[11px] text-necl-muted">Days until stockout</span>
          </div>
          <div className="p-4 space-y-4">
            {stockoutItems.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No imminent stockout risk</p>
            )}
            {stockoutItems.map(po => {
              const pct = Math.min((po.stockoutRisk / 20) * 100, 100)
              const isRed = po.stockoutRisk <= 5
              const isAmber = po.stockoutRisk > 5 && po.stockoutRisk <= 10
              const barColor = isRed ? '#EF4444' : isAmber ? '#F59E0B' : '#2563EB'
              const reorderPct = Math.min((po.reorderPoint / (po.stockLevel + 0.1)) * 100, 100)
              return (
                <div key={po.id}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-xs font-semibold text-necl-text truncate max-w-[220px]">{po.item}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          'text-[11px] font-bold',
                          isRed && 'text-necl-critical animate-pulse',
                          isAmber && 'text-necl-warning',
                          !isRed && !isAmber && 'text-necl-accent',
                        )}
                      >
                        {po.stockoutRisk}d
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: `${PROJECT_COLOR[po.projectId] ?? '#888'}20`, color: PROJECT_COLOR[po.projectId] ?? '#888' }}>
                        {po.projectId}
                      </span>
                    </div>
                  </div>
                  <div className="relative w-full h-2 rounded-full bg-necl-border overflow-visible">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor, width: `${pct}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                    {/* Reorder point marker */}
                    {po.reorderPoint > 0 && po.stockLevel > 0 && (
                      <div
                        className="absolute top-[-2px] w-0.5 h-3 bg-necl-warning rounded-full"
                        style={{ left: `${Math.min(reorderPct, 100)}%` }}
                        title={`Reorder at ${po.reorderPoint} ${po.stockUnit}`}
                      />
                    )}
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-necl-muted">{po.vendor}</span>
                    <span className="text-[10px] text-necl-muted">{po.stockLevel} {po.stockUnit} remaining</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Cross-Project Reallocation */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Cross-Project Reallocation</h2>
          </div>
          <div className="p-4 space-y-4">
            {visibleReallocation.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No reallocation opportunities</p>
            )}
            {visibleReallocation.map(ra => (
              <div
                key={ra.id}
                className={cn(
                  'rounded-lg border p-3',
                  ra.urgency === 'critical' ? 'border-necl-critical/30 bg-necl-critical/5' : ra.urgency === 'high' ? 'border-orange-500/30 bg-orange-500/5' : 'border-necl-warning/30 bg-necl-warning/5',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-necl-text">{ra.material}</span>
                  <span className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                    ra.urgency === 'critical' ? 'bg-necl-critical/15 text-necl-critical border-necl-critical/30' : ra.urgency === 'high' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30' : 'bg-necl-warning/15 text-necl-warning border-necl-warning/30',
                  )}>
                    {ra.urgency.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-[11px]">
                  <span className="font-medium text-necl-success">{ra.surplusProjectId}</span>
                  <span className="text-necl-muted">+{ra.surplusQty} {ra.unit} surplus</span>
                  <ArrowRight className="w-3 h-3 text-necl-muted" />
                  <span className="font-medium text-necl-critical">{ra.deficitProjectId}</span>
                  <span className="text-necl-muted">{ra.deficitDaysRemaining}d left</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-necl-muted">vs emergency purchase</span>
                  <span className="font-bold text-necl-success">Save {formatINR(ra.savings)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 5: Savings Consolidation Engine ───────────────────────────── */}
      {visibleConsolidation.length > 0 && (
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-necl-success" />
              <h2 className="text-sm font-bold text-necl-text">Savings Consolidation Engine</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-necl-success/10 border border-necl-success/30">
              <IndianRupee className="w-3.5 h-3.5 text-necl-success" />
              <span className="text-sm font-bold text-necl-success">{shortLabel(totalConsolidationSavings)} recoverable if consolidated today</span>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleConsolidation.map(co => (
              <div key={co.id} className="rounded-lg border border-[var(--color-necl-border)] bg-necl-bg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-necl-text">{co.material}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-necl-accent/15 text-necl-accent border border-necl-accent/30">
                    {co.category}
                  </span>
                </div>
                <p className="text-[11px] text-necl-muted mb-3">via <span className="text-necl-text font-medium">{co.preferredVendor}</span></p>
                <div className="space-y-1.5 mb-3">
                  {co.projects.map(p => (
                    <div key={p.projectId} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PROJECT_COLOR[p.projectId] ?? '#888' }} />
                        <span className="text-necl-muted">{p.projectId}</span>
                        <span className="text-necl-muted">{p.quantity} {p.unit}</span>
                      </div>
                      <span className="text-necl-text font-medium">{shortLabel(p.individualCost)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--color-necl-border)] pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-necl-muted">Individual total</p>
                    <p className="text-sm font-semibold text-necl-text">{shortLabel(co.individualTotal)}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-necl-muted" />
                  <div className="text-right">
                    <p className="text-[10px] text-necl-muted">Consolidated</p>
                    <p className="text-sm font-semibold text-necl-success">{shortLabel(co.consolidatedTotal)}</p>
                  </div>
                  <div className="rounded-lg bg-necl-success/15 border border-necl-success/30 px-2 py-1 text-right">
                    <p className="text-[10px] text-necl-muted">Save</p>
                    <p className="text-sm font-bold text-necl-success">{co.savingsPct}%</p>
                  </div>
                </div>
                <p className="text-[10px] text-necl-muted mt-2 leading-relaxed">{co.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 6: Escalation Claims + Approval Pipeline ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Escalation Claims */}
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">Price Escalation Claims</h2>
          </div>
          {unfiledEscalationValue > 0 && (
            <div className="mx-5 mt-4 rounded-lg border border-necl-critical/30 bg-necl-critical/8 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(239,68,68,0.07)' }}>
              <AlertCircle className="w-4 h-4 text-necl-critical flex-shrink-0" />
              <p className="text-sm font-semibold text-necl-critical">
                {formatINR(unfiledEscalationValue)} in un-filed claims — file before deadlines
              </p>
            </div>
          )}
          <div className="p-4 space-y-3">
            {visibleEscalation.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No escalation claims</p>
            )}
            {visibleEscalation.map(ec => {
              const isUrgent = ec.status === 'unfiled' && (ec.urgencyDays ?? 99) <= 45
              return (
                <div
                  key={ec.id}
                  className={cn(
                    'rounded-lg border p-3',
                    ec.status === 'unfiled' && isUrgent ? 'border-necl-critical/30 bg-necl-critical/5' :
                    ec.status === 'unfiled' ? 'border-necl-warning/30 bg-necl-warning/5' :
                    'border-[var(--color-necl-border)] bg-necl-bg',
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-necl-text">{ec.indexName} · {ec.periodLabel}</span>
                    <span className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0',
                      ec.status === 'unfiled' ? 'bg-necl-critical/15 text-necl-critical border-necl-critical/30' :
                      ec.status === 'filed' ? 'bg-necl-warning/15 text-necl-warning border-necl-warning/30' :
                      ec.status === 'under-review' ? 'bg-necl-accent/15 text-necl-accent border-necl-accent/30' :
                      'bg-necl-success/15 text-necl-success border-necl-success/30',
                    )}>
                      {ec.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                  <p className="text-[11px] text-necl-muted mb-1.5">{ec.material} · {ec.projectIds.join(', ')}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-necl-text">{formatINR(ec.claimAmount)}</span>
                    {ec.status === 'unfiled' && ec.deadline && (
                      <span className={cn(
                        'text-[11px] font-semibold',
                        isUrgent ? 'text-necl-critical' : 'text-necl-warning',
                      )}>
                        Deadline: {new Date(ec.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ({ec.urgencyDays}d)
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Awaiting Approval */}
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">Awaiting Approval</h2>
            {pendingApproval.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-necl-warning/15 text-necl-warning border border-necl-warning/30">
                {pendingApproval.length} PO{pendingApproval.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="p-4 space-y-3">
            {pendingApproval.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No pending approvals</p>
            )}
            {pendingApproval.map(po => (
              <div key={po.id} className="rounded-lg border border-[var(--color-necl-border)] bg-necl-bg p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[11px] text-necl-accent">{po.id}</span>
                  <span className={cn(
                    'text-[11px] font-bold',
                    po.ageDays > 14 ? 'text-necl-critical' : po.ageDays > 7 ? 'text-necl-warning' : 'text-necl-muted',
                  )}>
                    {po.ageDays}d old
                  </span>
                </div>
                <p className="text-xs font-semibold text-necl-text mb-0.5 truncate">{po.item}</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-necl-muted">{po.projectId} · {po.vendor}</span>
                  <span className="font-semibold text-necl-text">{formatINR(po.totalValue)}</span>
                </div>
                {!po.approvedBy && (
                  <p className="text-[10px] text-necl-muted mt-1">Not yet approved — no approver assigned</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 7: Committed vs Budget + Payment Schedule ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Budget table */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Materials Budget vs Committed</h2>
            <span className="ml-1 text-[11px] text-necl-muted">(42% of project budget)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-necl-border)]">
                  {['Project', 'Mat. Budget', 'Committed', 'Received', 'Variance'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {committedByProject.map(row => {
                  const pct = row.materialsBudget > 0 ? Math.min((row.committed / row.materialsBudget) * 100, 150) : 0
                  const isOverrun = row.variance > 0
                  return (
                    <tr key={row.projectId} className="border-b border-[var(--color-necl-border)]/50 hover:bg-necl-bg transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-necl-text">{row.projectId}</p>
                          <p className="text-[10px] text-necl-muted truncate max-w-[120px]">{row.projectName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-necl-muted">{formatINR(row.materialsBudget)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-necl-text">{formatINR(row.committed)}</p>
                          <div className="w-full h-1 bg-necl-border rounded-full mt-1 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', pct > 100 ? 'bg-necl-critical' : pct > 80 ? 'bg-necl-warning' : 'bg-necl-success')}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-necl-muted">{formatINR(row.received)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('font-bold', isOverrun ? 'text-necl-critical' : 'text-necl-success')}>
                          {isOverrun ? '+' : ''}{formatINR(row.variance)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {/* Total row */}
                {committedByProject.length > 1 && (
                  <tr className="border-t-2 border-[var(--color-necl-border)] bg-necl-bg">
                    <td className="px-4 py-3 font-bold text-necl-text">Total</td>
                    <td className="px-4 py-3 font-bold text-necl-text">{formatINR(committedByProject.reduce((s, r) => s + r.materialsBudget, 0))}</td>
                    <td className="px-4 py-3 font-bold text-necl-text">{formatINR(committedByProject.reduce((s, r) => s + r.committed, 0))}</td>
                    <td className="px-4 py-3 font-bold text-necl-text">{formatINR(committedByProject.reduce((s, r) => s + r.received, 0))}</td>
                    <td className="px-4 py-3 font-bold">
                      <span className={cn(committedByProject.reduce((s, r) => s + r.variance, 0) > 0 ? 'text-necl-critical' : 'text-necl-success')}>
                        {formatINR(committedByProject.reduce((s, r) => s + r.variance, 0))}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Payment due schedule */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Payment Due — Next 45 Days</h2>
          </div>
          <div className="p-4 space-y-2 max-h-[360px] overflow-y-auto">
            {visiblePayments.slice(0, 10).map(p => {
              const daysUntil = daysFromToday(p.dueDate)
              const isDueSoon = daysUntil <= 7
              const isUpcoming = daysUntil > 7 && daysUntil <= 14
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-lg px-3 py-2 border border-[var(--color-necl-border)] bg-necl-bg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: `${PROJECT_COLOR[p.projectId] ?? '#888'}20`, color: PROJECT_COLOR[p.projectId] ?? '#888' }}
                      >
                        {p.projectId}
                      </span>
                      <span className="text-[11px] text-necl-muted truncate">{p.vendor}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-necl-text truncate">{p.item}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn('text-xs font-bold', isDueSoon ? 'text-necl-critical' : isUpcoming ? 'text-necl-warning' : 'text-necl-muted')}>
                      {new Date(p.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                    <p className="text-[11px] font-semibold text-necl-text">{formatINR(p.amount)}</p>
                  </div>
                </div>
              )
            })}
            {visiblePayments.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No payments due</p>
            )}
          </div>
          <div className="px-5 py-3 border-t border-[var(--color-necl-border)] flex items-center justify-between">
            <span className="text-[11px] text-necl-muted">Total due (30 days)</span>
            <span className="text-sm font-bold text-necl-text">
              {formatINR(visiblePayments.filter(p => daysFromToday(p.dueDate) <= 30).reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 8: Rate Contract Utilisation ────────────────────────────── */}
      {visibleRateContracts.length > 0 && (
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-necl-success" />
            <h2 className="text-sm font-bold text-necl-text">Rate Contracts — Locked-in Savings</h2>
            <span className="ml-auto text-[11px] text-necl-muted">
              {formatINR(visibleRateContracts.reduce((s, rc) => s + rc.remainingBenefit, 0))} remaining benefit
            </span>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {visibleRateContracts.map(rc => {
              const pct = rc.utilizationPct
              const isNearExhaust = pct >= 95
              const isHighUse = pct >= 80 && pct < 95
              const barColor = isNearExhaust ? '#EF4444' : isHighUse ? '#F59E0B' : '#10B981'
              const daysToExpiry = daysFromToday(rc.validUntil)
              const expiringWarning = daysToExpiry <= 60
              return (
                <div key={rc.id} className={cn(
                  'rounded-lg border p-3',
                  isNearExhaust ? 'border-necl-critical/30 bg-necl-critical/5' : 'border-[var(--color-necl-border)] bg-necl-bg',
                )}>
                  <p className="text-[11px] font-bold text-necl-text truncate mb-0.5">{rc.material}</p>
                  <p className="text-[10px] text-necl-muted truncate mb-2">{rc.vendor}</p>
                  <div className="w-full h-1.5 bg-necl-border rounded-full overflow-hidden mb-1">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: barColor, width: `${Math.min(pct, 100)}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(pct, 100)}%` }}
                      transition={{ duration: 0.7 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] mb-2">
                    <span className="text-necl-muted">{pct}% used</span>
                    <span className={cn('font-semibold', isNearExhaust ? 'text-necl-critical' : 'text-necl-muted')}>
                      {rc.contractedVolume - rc.usedVolume} {rc.unit} left
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-necl-success">{formatINR(rc.remainingBenefit)} saving</p>
                  <p className={cn('text-[10px] mt-1', expiringWarning ? 'text-necl-warning font-semibold' : 'text-necl-muted')}>
                    {expiringWarning ? '⚠ ' : ''}Valid till {new Date(rc.validUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section 9: Vendor Performance Scorecard ───────────────────────────── */}
      {visibleVendors.length > 0 && (
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Vendor Performance Scorecard</h2>
            <span className="ml-1 text-[11px] text-necl-muted">Sorted worst first</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--color-necl-border)]">
                  {['Vendor', 'Category', 'Total POs', 'On-Time Rate', 'Avg Delay', 'Rejection %', 'Total Value', 'Projects'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleVendors.map(v => {
                  const onTimeGood = v.onTimeRate >= 90
                  const onTimeBad = v.onTimeRate < 70
                  const rejBad = v.qualityRejectionRate > 5
                  const rejWarn = v.qualityRejectionRate > 1 && !rejBad
                  return (
                    <tr key={v.vendor} className={cn(
                      'border-b border-[var(--color-necl-border)]/50 hover:bg-necl-bg transition-colors',
                      (onTimeBad || rejBad) && 'bg-necl-critical/3',
                    )}>
                      <td className="px-4 py-3 font-semibold text-necl-text whitespace-nowrap">
                        {v.vendor}
                        {(onTimeBad || rejBad) && <span className="ml-1.5 text-[9px] text-necl-critical font-bold">RED FLAG</span>}
                      </td>
                      <td className="px-4 py-3 text-necl-muted capitalize">{v.category}</td>
                      <td className="px-4 py-3 text-necl-muted">{v.totalPOs}</td>
                      <td className="px-4 py-3">
                        <span className={cn('font-bold', onTimeGood ? 'text-necl-success' : onTimeBad ? 'text-necl-critical' : 'text-necl-warning')}>
                          {v.onTimeRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-necl-muted">
                        {v.avgDelayDays > 0 ? `+${v.avgDelayDays}d` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('font-semibold', rejBad ? 'text-necl-critical' : rejWarn ? 'text-necl-warning' : 'text-necl-success')}>
                          {v.qualityRejectionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-necl-text">{formatINR(v.totalPOValue)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {v.activeProjects.map(p => (
                            <span key={p} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: `${PROJECT_COLOR[p] ?? '#888'}20`, color: PROJECT_COLOR[p] ?? '#888' }}>
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-[var(--color-necl-border)] flex items-center gap-6 text-[10px] text-necl-muted">
            <span><span className="text-necl-success font-bold">Green</span> ≥ 90% on-time, ≤ 1% rejection</span>
            <span><span className="text-necl-warning font-bold">Amber</span> 70–90% on-time, 1–5% rejection</span>
            <span><span className="text-necl-critical font-bold">Red</span> &lt; 70% on-time or &gt; 5% rejection</span>
          </div>
        </div>
      )}

      {/* ── Section 10: Concentration + Working Capital + Empanelment ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Vendor Concentration */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <Shield className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">Vendor Concentration by Category</h2>
          </div>
          {vendorConcentration.length === 0 ? (
            <p className="text-sm text-necl-muted text-center py-8">No data for selected projects</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--color-necl-border)]">
                    {['Category', 'Dominant Vendor', 'Share', 'Risk Level', 'Note'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vendorConcentration.map(row => (
                    <tr key={row.category} className={cn(
                      'border-b border-[var(--color-necl-border)]/50 hover:bg-necl-bg transition-colors',
                      row.isSingleSource && 'bg-necl-critical/3',
                    )}>
                      <td className="px-4 py-3 font-semibold text-necl-text capitalize">{row.category}</td>
                      <td className="px-4 py-3 text-necl-muted truncate max-w-[140px]">{row.dominantVendor}</td>
                      <td className="px-4 py-3">
                        <span className={cn('font-bold', row.share === 100 ? 'text-necl-critical' : row.share >= 80 ? 'text-necl-warning' : 'text-necl-success')}>
                          {row.share}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                          row.share === 100 ? 'bg-necl-critical/15 text-necl-critical border-necl-critical/30' :
                          row.share >= 80 ? 'bg-necl-warning/15 text-necl-warning border-necl-warning/30' :
                          'bg-necl-success/15 text-necl-success border-necl-success/30',
                        )}>
                          {row.share === 100 ? 'Single Source' : row.share >= 80 ? 'High' : 'Diversified'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-necl-muted text-[10px]">
                        {row.isSingleSource ? 'Add alternate vendor' : row.share >= 80 ? 'Explore 2nd source' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Working Capital + Empanelment (stacked) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Working Capital */}
          <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] flex-1">
            <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
              <Package className="w-4 h-4 text-necl-warning" />
              <h2 className="text-sm font-bold text-necl-text">Working Capital Locked</h2>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-necl-warning mb-1">{formatINR(totalWorkingCapitalLocked)}</p>
              <p className="text-[11px] text-necl-muted mb-3">Excess stock above 1.5× reorder point</p>
              <div className="space-y-2">
                {workingCapitalItems.slice(0, 4).map(item => (
                  <div key={item.id} className="flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-necl-text font-medium truncate">{item.item.split('(')[0].trim()}</span>
                      <span className="ml-1 text-necl-muted">· {item.projectId}</span>
                    </div>
                    <span className="text-necl-warning font-semibold">{formatINR(item.excessValue)}</span>
                  </div>
                ))}
                {workingCapitalItems.length === 0 && (
                  <p className="text-sm text-necl-muted text-center py-2">No excess stock</p>
                )}
              </div>
            </div>
          </div>

          {/* Vendor Empanelment */}
          <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
            <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-necl-accent" />
              <h2 className="text-sm font-bold text-necl-text">Vendor Empanelment</h2>
            </div>
            <div className="p-4 space-y-2">
              {visibleEmpanelments
                .filter(e => e.overallStatus !== 'valid')
                .map(e => (
                  <div key={e.vendor} className={cn(
                    'flex items-start justify-between gap-2 rounded-lg border px-3 py-2',
                    e.overallStatus === 'expired' ? 'border-necl-critical/30 bg-necl-critical/5' : 'border-necl-warning/30 bg-necl-warning/5',
                  )}>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-necl-text truncate">{e.vendor}</p>
                      {e.criticalFlag && <p className="text-[10px] text-necl-muted">{e.criticalFlag}</p>}
                    </div>
                    <span className={cn(
                      'text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0',
                      e.overallStatus === 'expired' ? 'bg-necl-critical/15 text-necl-critical border-necl-critical/30' : 'bg-necl-warning/15 text-necl-warning border-necl-warning/30',
                    )}>
                      {e.overallStatus === 'expired' ? 'EXPIRED' : `${e.daysToExpiry}d`}
                    </span>
                  </div>
                ))}
              {visibleEmpanelments.filter(e => e.overallStatus === 'valid').slice(0, 2).map(e => (
                <div key={e.vendor} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-necl-border)] bg-necl-bg px-3 py-2">
                  <p className="text-[11px] text-necl-muted truncate">{e.vendor}</p>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border bg-necl-success/15 text-necl-success border-necl-success/30 flex-shrink-0">VALID</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 11: Stock Level Gauges ───────────────────────────────────── */}
      {stockGaugeItems.length > 0 && (
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <Truck className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Inventory Health — Stock vs Reorder Point</h2>
          </div>
          <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {stockGaugeItems.map(po => {
              const isBelow = po.stockLevel < po.reorderPoint
              const isExcess = po.stockLevel >= po.reorderPoint * 2
              const maxVal = Math.max(po.stockLevel, po.reorderPoint * 2)
              const stockPct = maxVal > 0 ? (po.stockLevel / maxVal) * 100 : 0
              const reorderPct = maxVal > 0 ? (po.reorderPoint / maxVal) * 100 : 0
              const barColor = isBelow ? '#EF4444' : isExcess ? '#10B981' : '#F59E0B'
              return (
                <div key={po.id} className={cn(
                  'rounded-lg border p-3',
                  isBelow ? 'border-necl-critical/30 bg-necl-critical/5' : isExcess ? 'border-necl-success/30 bg-necl-success/5' : 'border-[var(--color-necl-border)] bg-necl-bg',
                )}>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <p className="text-[11px] font-semibold text-necl-text truncate">{po.item.split('(')[0].trim()}</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium"
                      style={{ background: `${PROJECT_COLOR[po.projectId] ?? '#888'}20`, color: PROJECT_COLOR[po.projectId] ?? '#888' }}>
                      {po.projectId}
                    </span>
                  </div>
                  <p className="text-[10px] text-necl-muted mb-2 truncate">{po.vendor}</p>
                  <div className="relative w-full h-2 bg-necl-border rounded-full overflow-visible mb-1">
                    <div className="h-full rounded-full" style={{ width: `${stockPct}%`, backgroundColor: barColor }} />
                    {/* Reorder point line */}
                    <div
                      className="absolute top-[-2px] w-0.5 h-3 bg-necl-warning rounded-full"
                      style={{ left: `${reorderPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={cn('font-semibold', isBelow ? 'text-necl-critical' : isExcess ? 'text-necl-success' : 'text-necl-muted')}>
                      {isBelow ? 'BELOW REORDER' : isExcess ? 'EXCESS STOCK' : 'OK'}
                    </span>
                  </div>
                  <p className="text-[10px] text-necl-muted mt-0.5">
                    {po.stockLevel} / {po.reorderPoint} {po.stockUnit}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section 12: Category Spend + Delivery Calendar ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Category spend bar chart */}
        <div className="lg:col-span-3 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-5">
          <h2 className="text-sm font-bold text-necl-text mb-1">Category Spend — Open Commitments</h2>
          <p className="text-[11px] text-necl-muted mb-4">Excludes received POs</p>
          {categorySpend.length > 0 ? (
            <NECLBarChart
              data={categorySpend}
              xKey="category"
              series={[{ key: 'value', label: 'Value (₹)', color: '#2563EB' }]}
              height={220}
              showLegend={false}
              formatValue={v => shortLabel(v)}
            />
          ) : (
            <div className="flex items-center justify-center h-[220px] text-necl-muted text-sm">
              All POs received — no open commitments
            </div>
          )}
        </div>

        {/* Right: Payment calendar buckets */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Delivery Calendar — Jul/Aug 2026</h2>
          </div>
          <div className="p-4 space-y-3">
            {paymentBuckets.map(bucket => (
              <div key={bucket.label} className="rounded-lg border border-[var(--color-necl-border)] bg-necl-bg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-necl-text">{bucket.label}</span>
                  <span className="text-[11px] font-bold text-necl-text">{bucket.total > 0 ? shortLabel(bucket.total) : '—'}</span>
                </div>
                {bucket.payments.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bucket.payments.map(p => (
                      <span key={p.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: `${PROJECT_COLOR[p.projectId] ?? '#888'}20`, color: PROJECT_COLOR[p.projectId] ?? '#888' }}
                        title={`${p.vendor} — ${formatINR(p.amount)}`}
                      >
                        {p.projectId}
                      </span>
                    ))}
                  </div>
                )}
                {bucket.payments.length === 0 && (
                  <span className="text-[10px] text-necl-muted">No payments due</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 13: Enhanced PO Table ────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-necl-text">Purchase Orders</h2>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'delayed', 'received'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors',
                  filterStatus === s
                    ? 'bg-necl-accent text-white'
                    : 'border border-[var(--color-necl-border)] text-necl-muted hover:border-necl-accent/50',
                )}
              >
                {s === 'all' ? `All (${visiblePOs.length})` : s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[var(--color-necl-border)]">
                {['PO No.', 'Item', 'Vendor', 'Category', 'Project', 'Qty', 'Value (incl. GST)', 'Stock / Reorder', 'Stockout', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map(po => {
                const belowReorder = po.reorderPoint > 0 && po.stockLevel < po.reorderPoint
                return (
                  <tr key={po.id} className="border-b border-[var(--color-necl-border)]/50 hover:bg-necl-bg transition-colors">
                    <td className="px-4 py-3 font-mono text-necl-accent text-[11px]">{po.id}</td>
                    <td className="px-4 py-3 text-necl-text font-medium max-w-[160px] truncate">{po.item}</td>
                    <td className="px-4 py-3 text-necl-muted truncate max-w-[120px]">{po.vendor}</td>
                    <td className="px-4 py-3 text-necl-muted capitalize">{po.category}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: `${PROJECT_COLOR[po.projectId] ?? '#888'}20`, color: PROJECT_COLOR[po.projectId] ?? '#888' }}>
                        {po.projectId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-necl-muted">{po.quantity} {po.quantityUnit}</td>
                    <td className="px-4 py-3 font-semibold text-necl-text">{formatINR(po.totalValue)}</td>
                    <td className="px-4 py-3">
                      {po.reorderPoint > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <span className={cn('text-[11px] font-semibold', belowReorder ? 'text-necl-critical' : 'text-necl-muted')}>
                            {po.stockLevel}
                          </span>
                          <span className="text-necl-muted text-[10px]">/ {po.reorderPoint} {po.stockUnit}</span>
                          {belowReorder && <AlertTriangle className="w-3 h-3 text-necl-critical flex-shrink-0" />}
                        </div>
                      ) : (
                        <span className="text-necl-muted text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {po.stockoutRisk > 0 ? (
                        <span className={cn(
                          'font-semibold',
                          po.stockoutRisk <= 5 ? 'text-necl-critical' : po.stockoutRisk <= 10 ? 'text-necl-warning' : 'text-necl-success',
                        )}>
                          {po.stockoutRisk}d
                        </span>
                      ) : <span className="text-necl-muted">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill
                        status={po.status === 'delayed' ? 'delayed' : po.status === 'received' ? 'received' : po.status === 'approved' ? 'approved' : 'pending'}
                        size="sm"
                      />
                    </td>
                  </tr>
                )
              })}
              {filteredPOs.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-necl-muted text-sm">
                    No purchase orders match the selected filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 14: Alerts + Recommendations ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
          <div className="px-5 py-4 border-b border-[var(--color-necl-border)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">Supply Chain Alerts</h2>
            {procAlerts.length > 0 && (
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-necl-critical/15 text-necl-critical border border-necl-critical/30">
                {procAlerts.length}
              </span>
            )}
          </div>
          <div className="p-3 space-y-2">
            {procAlerts.slice(0, 5).map(a => (
              <AlertItem key={a.id} alert={a} onView={setSelectedAlert} compact />
            ))}
            {procAlerts.length === 0 && (
              <p className="text-sm text-necl-muted text-center p-6">No supply chain alerts for selected projects</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          {procRecs.length > 0 ? (
            <>
              <h2 className="text-sm font-bold text-necl-text mb-3">Procurement Recommendations</h2>
              <div className="space-y-4">
                {procRecs.slice(0, 2).map(r => (
                  <PrescriptiveCard key={r.id} recommendation={r} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] flex items-center justify-center py-16">
              <p className="text-sm text-necl-muted">No active recommendations</p>
            </div>
          )}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
