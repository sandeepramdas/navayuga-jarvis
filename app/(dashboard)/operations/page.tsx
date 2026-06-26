'use client'

import { useState } from 'react'
import { Layers } from 'lucide-react'
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
import { formatINR } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'
import Link from 'next/link'

const progressData = [
  { month: 'Jan', hyd: 48, bmrc: 28, nh: 62, kdsp: 38, chn: 71, mum: 16, rlwy: 55, vizg: 24 },
  { month: 'Feb', hyd: 52, bmrc: 31, nh: 65, kdsp: 41, chn: 75, mum: 18, rlwy: 58, vizg: 27 },
  { month: 'Mar', hyd: 55, bmrc: 34, nh: 68, kdsp: 44, chn: 80, mum: 21, rlwy: 61, vizg: 29 },
  { month: 'Apr', hyd: 58, bmrc: 37, nh: 72, kdsp: 47, chn: 84, mum: 23, rlwy: 64, vizg: 32 },
  { month: 'May', hyd: 62, bmrc: 40, nh: 76, kdsp: 51, chn: 88, mum: 26, rlwy: 68, vizg: 35 },
  { month: 'Jun', hyd: 67, bmrc: 43, nh: 81, kdsp: 54, chn: 92, mum: 29, rlwy: 71, vizg: 38 },
]

export default function OperationsPage() {
  const { role, selectedProjects } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

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

  const visibleProjects = isSiteManager
    ? projects.filter(p => p.id === 'KDSP-B1')
    : projects.filter(p => selectedProjects.includes(p.id))

  const opsAlerts = alerts.filter(a =>
    a.department === 'operations' &&
    (isSiteManager ? a.projectId === 'KDSP-B1' : selectedProjects.includes(a.projectId ?? '')),
  )
  const opsRecs = recommendations.filter(r =>
    r.department === 'Operations' &&
    (isSiteManager ? r.projectId === 'KDSP-B1' : selectedProjects.includes(r.projectId ?? '')),
  )

  const onTrack = visibleProjects.filter(p => p.status === 'on-track').length
  const atRisk = visibleProjects.filter(p => p.status === 'at-risk').length
  const totalCrew = visibleProjects.reduce((s, p) => s + p.crewCount, 0)
  const avgProgress = visibleProjects.length
    ? Math.round(visibleProjects.reduce((s, p) => s + p.progress, 0) / visibleProjects.length)
    : 0

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <Layers className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Operations</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Active Projects"
          value={String(visibleProjects.length)}
          subtitle={`${onTrack} on track · ${atRisk} at risk`}
          status={atRisk > 0 ? 'amber' : 'green'}
          sparklineData={[6, 7, 7, 8, 8, 8, 8]}
        />
        <KPITile
          label="Avg Progress"
          value={`${avgProgress}%`}
          subtitle="Weighted portfolio progress"
          status="blue"
          sparklineData={[56, 58, 59, 61, 62, 63, avgProgress]}
        />
        <KPITile
          label="Total Crew"
          value={totalCrew.toLocaleString('en-IN')}
          subtitle="Across selected sites"
          status="green"
          sparklineData={[2200, 2300, 2350, 2400, 2420, 2440, totalCrew]}
        />
        <KPITile
          label="Schedule Health"
          value={`${visibleProjects.filter(p => p.scheduleVarianceDays <= 0).length} on time`}
          subtitle={`${visibleProjects.filter(p => p.scheduleVarianceDays > 0).length} behind schedule`}
          status="amber"
          sparklineData={[5, 5, 6, 6, 5, 5, 5]}
        />
      </div>

      {/* Progress Chart */}
      <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
        <h2 className="text-sm font-bold text-necl-text mb-4">Portfolio Progress — Monthly (Jan–Jun 2025)</h2>
        <NECLAreaChart
          data={progressData}
          xKey="month"
          series={[
            { key: 'hyd', label: 'HYD-M3', color: '#EF4444' },
            { key: 'bmrc', label: 'BMRC-E2', color: '#2563EB' },
            { key: 'nh', label: 'NH-44X', color: '#10B981' },
            { key: 'kdsp', label: 'KDSP-B1', color: '#F59E0B' },
            { key: 'chn', label: 'CHN-FLY', color: '#8B5CF6' },
          ]}
          height={220}
          formatValue={v => `${v}%`}
        />
      </div>

      {/* Project status table */}
      <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-necl-border">
          <h2 className="text-sm font-bold text-necl-text">Project Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-necl-border">
                {['Project', 'Type', 'PM', 'Progress', 'Schedule', 'Cost Var.', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-necl-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleProjects.map(p => (
                <tr key={p.id} className="border-b border-necl-border/50 hover:bg-necl-bg transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-necl-text text-xs">{p.name}</p>
                      <p className="text-[10px] text-necl-muted">{p.location}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-necl-muted">{p.type}</td>
                  <td className="px-4 py-3 text-xs text-necl-text">{p.pm}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-necl-border rounded-full overflow-hidden flex-shrink-0">
                        <div
                          className="h-full rounded-full bg-necl-accent"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-necl-text">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${p.scheduleVarianceDays > 30 ? 'text-necl-critical' : p.scheduleVarianceDays > 0 ? 'text-necl-warning' : 'text-necl-success'}`}>
                      {p.scheduleVarianceDays > 0 ? `+${p.scheduleVarianceDays}d` : `${p.scheduleVarianceDays}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${p.costVariance > 5 ? 'text-necl-critical' : p.costVariance > 0 ? 'text-necl-warning' : 'text-necl-success'}`}>
                      {p.costVariance > 0 ? `+${p.costVariance}%` : `${p.costVariance}%`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={p.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/project/${p.id}`} className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ops alerts */}
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="px-5 py-4 border-b border-necl-border">
            <h2 className="text-sm font-bold text-necl-text">Operations Alerts</h2>
          </div>
          <div className="p-3 space-y-2">
            {opsAlerts.slice(0, 4).map(a => (
              <AlertItem key={a.id} alert={a} onView={setSelectedAlert} compact />
            ))}
            {opsAlerts.length === 0 && (
              <p className="text-sm text-necl-muted p-4 text-center">No active operations alerts</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-necl-text">Recommendations</h2>
          {opsRecs.slice(0, 2).map(r => (
            <PrescriptiveCard key={r.id} recommendation={r} />
          ))}
          {opsRecs.length === 0 && (
            <div className="rounded-xl border border-necl-border bg-necl-surface p-6 text-center">
              <p className="text-sm text-necl-muted">No recommendations for Operations this period</p>
            </div>
          )}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
