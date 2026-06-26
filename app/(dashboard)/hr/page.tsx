'use client'

import { useState } from 'react'
import { Users, AlertTriangle } from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { StatusPill } from '@/components/ui/StatusPill'
import { HeatmapGrid } from '@/components/charts/HeatmapGrid'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { employees } from '@/lib/mock-data/hr'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import type { Alert } from '@/lib/mock-data/alerts'

export default function HRPage() {
  const { role, selectedProjects } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const isSiteManager = role === 'site-manager'

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">HR & People Analytics</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  const visibleEmployees = isSiteManager
    ? employees.filter(e => e.projectId === 'KDSP-B1')
    : employees.filter(e => selectedProjects.includes(e.projectId))

  const hrAlerts = alerts.filter(a =>
    a.department === 'hr' &&
    (isSiteManager ? a.projectId === 'KDSP-B1' : selectedProjects.includes(a.projectId ?? '')),
  )
  const hrRecs = recommendations.filter(r =>
    r.department === 'HR' &&
    (isSiteManager ? r.projectId === 'KDSP-B1' : selectedProjects.includes(r.projectId ?? '')),
  )

  const attritionHeatmap = visibleEmployees.map(e => ({
    label: e.name.split(' ')[0],
    value: e.attritionRisk === 'high' ? 3 : e.attritionRisk === 'medium' ? 2 : 1,
    maxValue: 3,
  }))

  const highAttrition = visibleEmployees.filter(e => e.attritionRisk === 'high').length
  const mediumAttrition = visibleEmployees.filter(e => e.attritionRisk === 'medium').length
  const avgAttendance = visibleEmployees.length
    ? Math.round(visibleEmployees.reduce((s, e) => s + e.attendance, 0) / visibleEmployees.length)
    : 0
  const avgProductivity = visibleEmployees.length
    ? Math.round(visibleEmployees.reduce((s, e) => s + e.productivity, 0) / visibleEmployees.length)
    : 0
  const total = visibleEmployees.length
  const attritionIndex = total > 0
    ? parseFloat(((highAttrition * 3 + mediumAttrition * 1.5) / total * 2).toFixed(1))
    : 0

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">HR & People Analytics</h1>
      </div>

      <div className="p-3 rounded-xl border border-necl-border bg-necl-accent/5 text-necl-muted text-xs">
        Insights are advisory, transparent to the individual, and require manager judgment. No ranking or punitive framing is used.
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Workforce"
          value={total.toLocaleString('en-IN')}
          subtitle="Across selected sites"
          status="green"
          sparklineData={[2200, 2300, 2350, 2400, 2420, 2440, total]}
        />
        <KPITile
          label="Attendance"
          value={`${avgAttendance}%`}
          subtitle="7-day rolling average"
          status={avgAttendance >= 94 ? 'green' : 'amber'}
          sparklineData={[91, 92, 93, 94, 94, 93, avgAttendance]}
        />
        <KPITile
          label="Attrition Risk"
          value={`${attritionIndex}/10`}
          subtitle={`${highAttrition} high · ${mediumAttrition} medium`}
          status={attritionIndex > 7 ? 'red' : attritionIndex > 4 ? 'amber' : 'green'}
          sparklineData={[5, 5.5, 6, 6.2, 6.5, 6.7, attritionIndex]}
          sparklineColor="#F59E0B"
        />
        <KPITile
          label="Avg Productivity"
          value={`${avgProductivity}%`}
          subtitle="vs plan across active staff"
          status={avgProductivity >= 85 ? 'green' : 'amber'}
          sparklineData={[82, 83, 84, 85, 85, 84, avgProductivity]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attrition heatmap */}
        <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
          <h2 className="text-sm font-bold text-necl-text mb-1">Attrition Risk Heatmap</h2>
          <p className="text-[10px] text-necl-muted mb-4">Red = high risk · Yellow = medium · Green = low</p>
          <HeatmapGrid
            cells={attritionHeatmap}
            columns={5}
            colorScheme="risk"
          />
        </div>

        {/* HR Alerts */}
        <div className="lg:col-span-2 rounded-xl border border-necl-border bg-necl-surface">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-border">
            <AlertTriangle className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">People Alerts</h2>
          </div>
          <div className="p-3 space-y-2">
            {hrAlerts.map(a => (
              <AlertItem key={a.id} alert={a} onView={setSelectedAlert} />
            ))}
            {hrAlerts.length === 0 && (
              <p className="text-sm text-necl-muted p-4 text-center">No HR alerts for selected projects</p>
            )}
          </div>
        </div>
      </div>

      {/* Employee table */}
      <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-necl-border">
          <h2 className="text-sm font-bold text-necl-text">People Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-necl-border">
                {['Name', 'Role', 'Project', 'Attendance', 'Productivity vs Plan', 'Trend', 'Attrition Risk', 'Coaching Insight'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleEmployees.map(emp => (
                <tr key={emp.id} className="border-b border-necl-border/50 hover:bg-necl-bg">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-necl-text">{emp.name}</p>
                    <p className="text-[10px] text-necl-muted">{emp.department}</p>
                  </td>
                  <td className="px-4 py-3 text-necl-muted">{emp.role}</td>
                  <td className="px-4 py-3 font-mono text-necl-accent text-[11px]">{emp.projectId}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${emp.attendance >= 95 ? 'text-necl-success' : emp.attendance >= 88 ? 'text-necl-warning' : 'text-necl-critical'}`}>
                      {emp.attendance}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${emp.productivityVsPlan >= 0 ? 'text-necl-success' : emp.productivityVsPlan >= -10 ? 'text-necl-warning' : 'text-necl-critical'}`}>
                      {emp.productivityVsPlan >= 0 ? `+${emp.productivityVsPlan}%` : `${emp.productivityVsPlan}%`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm ${emp.trend === 'up' ? 'text-necl-success' : emp.trend === 'down' ? 'text-necl-critical' : 'text-necl-muted'}`}>
                      {emp.trend === 'up' ? '↑' : emp.trend === 'down' ? '↓' : '→'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={emp.attritionRisk === 'high' ? 'critical' : emp.attritionRisk === 'medium' ? 'medium' : 'low'}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-necl-muted max-w-xs">
                    <p className="line-clamp-2 text-[10px]">{emp.coachingSuggestion}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* HR Recommendations */}
      {hrRecs.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-necl-text mb-4">People Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hrRecs.slice(0, 2).map(r => (
              <PrescriptiveCard key={r.id} recommendation={r} />
            ))}
          </div>
        </div>
      )}

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
