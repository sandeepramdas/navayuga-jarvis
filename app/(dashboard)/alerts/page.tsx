'use client'

import { useState } from 'react'
import { Bell, Filter } from 'lucide-react'
import { useApp } from '@/lib/store'
import { SeverityChip } from '@/components/ui/SeverityChip'
import { StatusPill } from '@/components/ui/StatusPill'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { KPITile } from '@/components/ui/KPITile'
import { alerts, getAlertsSummary } from '@/lib/mock-data/alerts'
import { timeAgo } from '@/lib/utils'
import type { Alert, AlertSeverity, AlertDepartment } from '@/lib/mock-data/alerts'

const summary = getAlertsSummary()

type DeptFilter = 'all' | AlertDepartment
type SeverityFilter = 'all' | AlertSeverity
type StatusFilter = 'all' | 'new' | 'acknowledged' | 'resolved'

export default function AlertsPage() {
  const { role, alertStates } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [deptFilter, setDeptFilter] = useState<DeptFilter>('all')
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const visibleAlerts = role === 'site-manager'
    ? alerts.filter(a => a.projectId === 'KDSP-B1')
    : alerts

  const filteredAlerts = visibleAlerts.filter(a => {
    if (deptFilter !== 'all' && a.department !== deptFilter) return false
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false
    const effectiveStatus = alertStates[a.id] ?? a.status
    if (statusFilter !== 'all' && effectiveStatus !== statusFilter) return false
    return true
  })

  const departments: DeptFilter[] = ['all', 'operations', 'procurement', 'fleet', 'finance', 'hr', 'safety']
  const severities: SeverityFilter[] = ['all', 'critical', 'high', 'medium', 'info']
  const statuses: StatusFilter[] = ['all', 'new', 'acknowledged', 'resolved']

  const severityRowBorder: Record<AlertSeverity, string> = {
    critical: 'border-l-2 border-l-necl-critical',
    high: 'border-l-2 border-l-orange-500',
    medium: '',
    info: '',
  }

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Alerts & Exceptions Center</h1>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Critical"
          value={String(summary.critical)}
          subtitle="Require immediate action"
          status="red"
          sparklineData={[1, 2, 2, 3, 3, 3, summary.critical]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="High"
          value={String(summary.high)}
          subtitle="Require attention today"
          status="amber"
          sparklineData={[4, 5, 6, 7, 7, 8, summary.high]}
          sparklineColor="#F59E0B"
        />
        <KPITile
          label="Medium"
          value={String(summary.medium)}
          subtitle="Monitor and plan"
          status="blue"
          sparklineData={[3, 4, 4, 5, 5, 6, summary.medium]}
        />
        <KPITile
          label="New / Unactioned"
          value={String(summary.new)}
          subtitle="Awaiting acknowledgement"
          status={summary.new > 5 ? 'red' : 'amber'}
          sparklineData={[8, 9, 10, 11, 12, 12, summary.new]}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-necl-muted" />
          <div className="flex gap-1 flex-wrap">
            {departments.map(d => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                  deptFilter === d ? 'bg-necl-accent text-white' : 'border border-necl-border text-necl-muted hover:border-necl-accent/50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap">
          {severities.map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                severityFilter === s ? 'bg-necl-accent text-white' : 'border border-necl-border text-necl-muted hover:border-necl-accent/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                statusFilter === s ? 'bg-necl-accent text-white' : 'border border-necl-border text-necl-muted hover:border-necl-accent/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts table */}
      <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-necl-border">
          <p className="text-xs text-necl-muted">{filteredAlerts.length} alerts matching filters</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-necl-border">
                {['Severity', 'Title', 'Department', 'Affected Entity', 'Time', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map(alert => {
                const effectiveStatus: string = (alertStates[alert.id] as string | undefined) ?? alert.status
                return (
                  <tr
                    key={alert.id}
                    className={`border-b border-necl-border/50 hover:bg-necl-bg transition-colors cursor-pointer ${severityRowBorder[alert.severity]}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <td className="px-4 py-3">
                      <SeverityChip severity={alert.severity} />
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-semibold text-necl-text line-clamp-1">{alert.title}</p>
                    </td>
                    <td className="px-4 py-3 capitalize text-necl-muted">{alert.department}</td>
                    <td className="px-4 py-3 text-necl-muted max-w-[160px]">
                      <p className="truncate">{alert.affectedEntity}</p>
                    </td>
                    <td className="px-4 py-3 text-necl-muted whitespace-nowrap">{timeAgo(alert.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                        effectiveStatus === 'new' ? 'bg-necl-critical/15 text-necl-critical' :
                        effectiveStatus === 'acknowledged' ? 'bg-necl-warning/15 text-necl-warning' :
                        'bg-necl-success/15 text-necl-success'
                      }`}>
                        {effectiveStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedAlert(alert) }}
                        className="text-[11px] text-necl-accent hover:text-blue-400 font-medium"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-necl-muted">
                    No alerts match the selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
