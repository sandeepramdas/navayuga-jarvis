'use client'

import { useState } from 'react'
import { Truck, Wrench, Fuel, Gauge } from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { StatusPill } from '@/components/ui/StatusPill'
import { NECLDonutChart } from '@/components/charts/DonutChart'
import { NECLBarChart } from '@/components/charts/BarChart'
import { fleet, getFleetSummary } from '@/lib/mock-data/fleet'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { formatINR } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'

const summary = getFleetSummary()
const fleetAlerts = alerts.filter(a => a.department === 'fleet')
const fleetRecs = recommendations.filter(r => r.department === 'Fleet')

const utilizationData = fleet.slice(0, 10).map(m => ({
  machine: `${m.brand} ${m.model.split(' ')[0]}`,
  utilization: m.utilization,
}))

const donutData = [
  { label: 'Active', value: summary.active, color: '#10B981' },
  { label: 'Idle', value: summary.idle, color: '#F59E0B' },
  { label: 'Maintenance', value: summary.maintenance, color: '#EF4444' },
]

export default function FleetPage() {
  const { role } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'idle' | 'maintenance'>('all')

  const visibleFleet = role === 'site-manager'
    ? fleet.filter(m => m.projectId === 'KDSP-B1')
    : fleet

  const filteredFleet = filterStatus === 'all' ? visibleFleet : visibleFleet.filter(m => m.status === filterStatus)

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <Truck className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Fleet Management</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Fleet Utilization"
          value={`${summary.avgUtilization}%`}
          subtitle={`${summary.active} active · ${summary.idle} idle`}
          status="amber"
          sparklineData={[70, 72, 73, 74, 73, 74, summary.avgUtilization]}
        />
        <KPITile
          label="Idle Cost Today"
          value={formatINR(summary.totalIdleCost)}
          subtitle={`${summary.idle} idle machines`}
          status="red"
          sparklineData={[60000, 65000, 72000, 68000, 70000, 72000, summary.totalIdleCost]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="In Maintenance"
          value={String(summary.maintenance)}
          subtitle="Down for repairs"
          status={summary.maintenance > 0 ? 'amber' : 'green'}
          sparklineData={[0, 1, 1, 2, 2, 2, summary.maintenance]}
        />
        <KPITile
          label="Critical Alerts"
          value={String(summary.criticalMaintenance)}
          subtitle="Predictive maintenance due"
          status={summary.criticalMaintenance > 0 ? 'red' : 'green'}
          sparklineData={[0, 0, 1, 1, 2, 2, summary.criticalMaintenance]}
          sparklineColor="#EF4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut */}
        <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
          <h2 className="text-sm font-bold text-necl-text mb-2">Fleet Status</h2>
          <NECLDonutChart
            data={donutData}
            height={200}
            centerValue={`${summary.total}`}
            centerLabel="machines"
          />
        </div>

        {/* Utilization chart */}
        <div className="lg:col-span-2 rounded-xl border border-necl-border bg-necl-surface p-5">
          <h2 className="text-sm font-bold text-necl-text mb-4">Utilization by Machine (Top 10)</h2>
          <NECLBarChart
            data={utilizationData}
            xKey="machine"
            series={[{ key: 'utilization', label: 'Utilization %', color: '#2563EB' }]}
            height={180}
            showLegend={false}
            formatValue={v => `${v}%`}
          />
        </div>
      </div>

      {/* Fleet table */}
      <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-necl-border flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-necl-text">Machine Registry</h2>
          <div className="flex gap-2">
            {(['all', 'active', 'idle', 'maintenance'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                  filterStatus === s ? 'bg-necl-accent text-white' : 'border border-necl-border text-necl-muted hover:border-necl-accent/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-necl-border">
                {['ID', 'Brand / Model', 'Type', 'Project', 'Status', 'Utilization', 'Idle Cost/day', 'Next PM', 'PM Risk', 'Operator'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFleet.map(m => (
                <tr key={m.id} className={`border-b border-necl-border/50 hover:bg-necl-bg transition-colors ${m.status === 'maintenance' ? 'opacity-70' : ''}`}>
                  <td className="px-4 py-3 font-mono text-necl-accent text-[10px]">{m.id.split('-').slice(-1)[0]}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-necl-text">{m.brand}</p>
                    <p className="text-necl-muted text-[10px]">{m.model}</p>
                  </td>
                  <td className="px-4 py-3 text-necl-muted">{m.type}</td>
                  <td className="px-4 py-3 text-necl-muted font-mono text-[11px]">{m.projectId}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={m.status} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1 bg-necl-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.utilization >= 80 ? 'bg-necl-success' : m.utilization >= 50 ? 'bg-necl-warning' : 'bg-necl-critical'}`}
                          style={{ width: `${m.utilization}%` }}
                        />
                      </div>
                      <span className="font-semibold text-necl-text">{m.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-necl-muted">{formatINR(m.dailyIdleCost)}</td>
                  <td className="px-4 py-3 text-necl-muted whitespace-nowrap">
                    {new Date(m.predictiveMaintenance.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={m.predictiveMaintenance.riskLevel} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-necl-muted">{m.operator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet alerts and recs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="px-5 py-4 border-b border-necl-border">
            <h2 className="text-sm font-bold text-necl-text">Fleet Alerts</h2>
          </div>
          <div className="p-3 space-y-2">
            {fleetAlerts.map(a => (
              <AlertItem key={a.id} alert={a} onView={setSelectedAlert} compact />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-necl-text">Fleet Recommendations</h2>
          {fleetRecs.slice(0, 2).map(r => (
            <PrescriptiveCard key={r.id} recommendation={r} />
          ))}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
