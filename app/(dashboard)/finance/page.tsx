'use client'

import { useState } from 'react'
import { IndianRupee, TrendingUp, TrendingDown } from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { NECLBarChart } from '@/components/charts/BarChart'
import { NECLAreaChart } from '@/components/charts/AreaChart'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { projects } from '@/lib/mock-data/projects'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { formatINR } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'

const monthlySpend = [
  { month: 'Jan', spend: 642, budget: 600 },
  { month: 'Feb', spend: 710, budget: 680 },
  { month: 'Mar', spend: 780, budget: 720 },
  { month: 'Apr', spend: 820, budget: 780 },
  { month: 'May', spend: 890, budget: 840 },
  { month: 'Jun', spend: 924, budget: 860 },
]

export default function FinancePage() {
  const { role, selectedProjects } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const isSiteManager = role === 'site-manager'

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <IndianRupee className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Finance</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  const visibleProjects = isSiteManager
    ? projects.filter(p => p.id === 'KDSP-B1')
    : projects.filter(p => selectedProjects.includes(p.id))

  const finAlerts = alerts.filter(a =>
    a.department === 'finance' &&
    (isSiteManager ? a.projectId === 'KDSP-B1' : selectedProjects.includes(a.projectId ?? '')),
  )
  const finRecs = recommendations.filter(r =>
    r.department === 'Finance' &&
    (isSiteManager ? r.projectId === 'KDSP-B1' : selectedProjects.includes(r.projectId ?? '')),
  )

  const budgetVsActual = visibleProjects.map(p => ({
    project: p.id,
    budget: Math.round(p.budget / 100000),
    actual: Math.round(p.actual / 100000),
  }))

  const totalBudget = visibleProjects.reduce((s, p) => s + p.budget, 0)
  const totalActual = visibleProjects.reduce((s, p) => s + p.actual, 0)
  const overrunProjects = visibleProjects.filter(p => p.costVariance > 0).length
  const savingsProjects = visibleProjects.filter(p => p.costVariance < 0)
  const totalSavings = savingsProjects.reduce((s, p) => s + (p.budget - p.actual), 0)

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <IndianRupee className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Finance</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Portfolio Budget"
          value={formatINR(totalBudget)}
          subtitle={`Across ${visibleProjects.length} projects`}
          status="blue"
          sparklineData={[70, 71, 72, 72, 72, 72, 72]}
        />
        <KPITile
          label="Actual Spend"
          value={formatINR(totalActual)}
          subtitle={totalBudget > 0 ? `${((totalActual / totalBudget - 1) * 100).toFixed(1)}% vs budget` : '—'}
          status={totalActual > totalBudget ? 'red' : 'green'}
          sparklineData={[38, 40, 43, 45, 47, 48, Math.round(totalActual / 1000000)]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="Overrun Projects"
          value={String(overrunProjects)}
          subtitle={`${visibleProjects.length - overrunProjects} under/on budget`}
          status={overrunProjects > 2 ? 'red' : 'amber'}
          sparklineData={[1, 2, 3, 3, 3, 4, overrunProjects]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="Identified Savings"
          value={formatINR(totalSavings)}
          subtitle={`${savingsProjects.length} projects under budget`}
          status="green"
          sparklineData={[50000, 80000, 100000, 120000, 140000, 160000, totalSavings]}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
          <h2 className="text-sm font-bold text-necl-text mb-4">Budget vs Actual by Project (₹L)</h2>
          <NECLBarChart
            data={budgetVsActual}
            xKey="project"
            series={[
              { key: 'budget', label: 'Budget', color: '#2563EB' },
              { key: 'actual', label: 'Actual', color: '#EF4444' },
            ]}
            height={220}
            formatValue={v => `₹${v}L`}
          />
        </div>
        <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
          <h2 className="text-sm font-bold text-necl-text mb-4">Monthly Spend vs Budget (₹L)</h2>
          <NECLAreaChart
            data={monthlySpend}
            xKey="month"
            series={[
              { key: 'budget', label: 'Budget', color: '#10B981' },
              { key: 'spend', label: 'Actual Spend', color: '#EF4444' },
            ]}
            height={220}
            formatValue={v => `₹${v}L`}
          />
        </div>
      </div>

      {/* Cost variance table */}
      <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-necl-border">
          <h2 className="text-sm font-bold text-necl-text">Project Cost Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-necl-border">
                {['Project', 'PM', 'Budget', 'Actual', 'Variance', 'Variance %', 'CPI', 'Trend'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...visibleProjects].sort((a, b) => b.costVariance - a.costVariance).map(p => {
                const variance = p.actual - p.budget
                const cpi = (p.budget / p.actual).toFixed(2)
                return (
                  <tr key={p.id} className="border-b border-necl-border/50 hover:bg-necl-bg">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-necl-text">{p.name}</p>
                      <p className="text-[10px] text-necl-muted">{p.id}</p>
                    </td>
                    <td className="px-4 py-3 text-necl-muted">{p.pm}</td>
                    <td className="px-4 py-3 font-semibold text-necl-text">{formatINR(p.budget)}</td>
                    <td className="px-4 py-3 font-semibold text-necl-text">{formatINR(p.actual)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${variance > 0 ? 'text-necl-critical' : 'text-necl-success'}`}>
                        {variance > 0 ? '+' : ''}{formatINR(variance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${p.costVariance > 5 ? 'text-necl-critical' : p.costVariance > 0 ? 'text-necl-warning' : 'text-necl-success'}`}>
                        {p.costVariance > 0 ? `+${p.costVariance}%` : `${p.costVariance}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${parseFloat(cpi) < 0.95 ? 'text-necl-critical' : parseFloat(cpi) < 1 ? 'text-necl-warning' : 'text-necl-success'}`}>
                        {cpi}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.costVariance > 0
                        ? <TrendingDown className="w-4 h-4 text-necl-critical" />
                        : <TrendingUp className="w-4 h-4 text-necl-success" />
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="px-5 py-4 border-b border-necl-border">
            <h2 className="text-sm font-bold text-necl-text">Finance Alerts</h2>
          </div>
          <div className="p-3 space-y-2">
            {finAlerts.map(a => (
              <AlertItem key={a.id} alert={a} onView={setSelectedAlert} compact />
            ))}
            {finAlerts.length === 0 && (
              <p className="text-sm text-necl-muted p-4 text-center">No finance alerts for selected projects</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-necl-text">Finance Recommendations</h2>
          {finRecs.slice(0, 2).map(r => (
            <PrescriptiveCard key={r.id} recommendation={r} />
          ))}
          {finRecs.length === 0 && (
            <div className="rounded-xl border border-necl-border bg-necl-surface p-6 text-center">
              <p className="text-sm text-necl-muted">No finance recommendations for selected projects</p>
            </div>
          )}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
