'use client'

import { useState } from 'react'
import { ShoppingCart, Package, AlertTriangle } from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { StatusPill } from '@/components/ui/StatusPill'
import { NECLBarChart } from '@/components/charts/BarChart'
import { purchaseOrders, getProcurementSummary } from '@/lib/mock-data/procurement'
import { alerts } from '@/lib/mock-data/alerts'
import { recommendations } from '@/lib/mock-data/predictions'
import { formatINR } from '@/lib/utils'
import type { Alert } from '@/lib/mock-data/alerts'

const summary = getProcurementSummary()
const procAlerts = alerts.filter(a => a.department === 'procurement')
const procRecs = recommendations.filter(r => r.department === 'Procurement')

const categoryData = [
  { category: 'Steel', value: 2382 },
  { category: 'Cement', value: 824 },
  { category: 'Equipment', value: 4926 },
  { category: 'Fuel', value: 482 },
  { category: 'Electrical', value: 264 },
  { category: 'Aggregate', value: 71 },
  { category: 'Formwork', value: 484 },
]

type POStatus = 'pending' | 'approved' | 'delayed' | 'received'

export default function ProcurementPage() {
  const { role } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | POStatus>('all')

  const visiblePOs = role === 'site-manager'
    ? purchaseOrders.filter(po => po.projectId === 'KDSP-B1')
    : purchaseOrders

  const filteredPOs = filterStatus === 'all' ? visiblePOs : visiblePOs.filter(po => po.status === filterStatus)
  const totalOpen = visiblePOs.filter(p => p.status !== 'received').reduce((s, p) => s + p.totalValue, 0)
  const delayed = visiblePOs.filter(p => p.status === 'delayed').length
  const critical = visiblePOs.filter(p => p.stockoutRisk <= 5).length

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Procurement</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Open Commitments"
          value={formatINR(totalOpen)}
          subtitle={`${visiblePOs.filter(p => p.status !== 'received').length} active POs`}
          status="blue"
          sparklineData={[16, 17, 18, 17, 18, 19, 18]}
        />
        <KPITile
          label="Delayed POs"
          value={String(delayed)}
          subtitle="Requiring escalation"
          status={delayed > 0 ? 'red' : 'green'}
          sparklineData={[1, 2, 2, 3, 3, 3, delayed]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="Stockout Risk"
          value={`${critical} critical`}
          subtitle="≤5 days cover remaining"
          status={critical > 0 ? 'red' : 'green'}
          sparklineData={[0, 1, 2, 2, 3, 3, critical]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="POs Received"
          value={`${visiblePOs.filter(p => p.status === 'received').length}`}
          subtitle="This month"
          status="green"
          sparklineData={[3, 4, 5, 6, 7, 8, visiblePOs.filter(p => p.status === 'received').length]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-xl border border-necl-border bg-necl-surface p-5">
          <h2 className="text-sm font-bold text-necl-text mb-4">Open PO Value by Category (₹L)</h2>
          <NECLBarChart
            data={categoryData}
            xKey="category"
            series={[{ key: 'value', label: 'Value (₹L)', color: '#2563EB' }]}
            height={200}
            showLegend={false}
            formatValue={v => `₹${v}L`}
          />
        </div>

        {/* Procurement alerts */}
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="px-5 py-4 border-b border-necl-border flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-necl-warning" />
            <h2 className="text-sm font-bold text-necl-text">Supply Chain Alerts</h2>
          </div>
          <div className="p-3 space-y-2">
            {procAlerts.slice(0, 4).map(a => (
              <AlertItem key={a.id} alert={a} onView={setSelectedAlert} compact />
            ))}
          </div>
        </div>
      </div>

      {/* PO Table */}
      <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-necl-border flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-sm font-bold text-necl-text">Purchase Orders</h2>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'delayed', 'received'] as const).map(s => (
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
                {['PO No.', 'Item', 'Vendor', 'Project', 'Value (incl. GST)', 'Stockout Risk', 'Expected Delivery', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-necl-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map(po => (
                <tr key={po.id} className="border-b border-necl-border/50 hover:bg-necl-bg transition-colors">
                  <td className="px-4 py-3 font-mono text-necl-accent text-[11px]">{po.id}</td>
                  <td className="px-4 py-3 text-necl-text font-medium">{po.item}</td>
                  <td className="px-4 py-3 text-necl-muted">{po.vendor}</td>
                  <td className="px-4 py-3 text-necl-muted">{po.projectId}</td>
                  <td className="px-4 py-3 font-semibold text-necl-text">{formatINR(po.totalValue)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${po.stockoutRisk <= 5 ? 'text-necl-critical' : po.stockoutRisk <= 10 ? 'text-necl-warning' : 'text-necl-success'}`}>
                      {po.stockoutRisk > 0 ? `${po.stockoutRisk}d` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-necl-muted whitespace-nowrap">
                    {new Date(po.expectedDelivery).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={po.status === 'delayed' ? 'delayed' : po.status === 'received' ? 'received' : po.status === 'approved' ? 'approved' : 'pending'}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {procRecs.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-necl-text mb-4">Procurement Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {procRecs.slice(0, 3).map(r => (
              <PrescriptiveCard key={r.id} recommendation={r} />
            ))}
          </div>
        </div>
      )}

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
