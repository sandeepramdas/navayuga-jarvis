'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Activity, TrendingUp } from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { ForecastCard } from '@/components/ui/ForecastCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { alerts } from '@/lib/mock-data/alerts'
import { forecasts, recommendations } from '@/lib/mock-data/predictions'
import type { Alert } from '@/lib/mock-data/alerts'

const portfolioWeekly = [68, 70, 71, 72, 71, 73, 74]
const fleetWeekly = [72, 74, 73, 75, 74, 75, 74]
const budgetWeekly = [101, 103, 104, 105, 106, 107, 108]

export default function CommandCenterPage() {
  const { role } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const isSiteManager = role === 'site-manager'
  const visibleAlerts = isSiteManager
    ? alerts.filter(a => a.projectId === 'KDSP-B1').slice(0, 8)
    : alerts.slice(0, 8)

  const visibleForecasts = isSiteManager
    ? forecasts.filter(f => f.projectId === 'KDSP-B1').slice(0, 6)
    : forecasts.slice(0, 7)

  const visibleRecs = isSiteManager
    ? recommendations.filter(r => r.projectId === 'KDSP-B1').slice(0, 3)
    : recommendations.slice(0, 3)

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Site manager scope banner */}
      {isSiteManager && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-necl-warning/40 bg-necl-warning/8 text-necl-warning text-xs font-medium"
        >
          <span className="w-2 h-2 rounded-full bg-necl-warning animate-pulse" />
          Viewing data scoped to: Kaleshwaram Dam Support Pkg-B · Switch role above for full portfolio view
        </motion.div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-necl-text">Command Center</h1>
          <p className="text-sm text-necl-muted mt-0.5">
            {isSiteManager ? 'Kaleshwaram Dam Support Pkg-B · Live' : 'Portfolio-wide decision intelligence · Live as of 26 Jun 2025, 10:00 IST'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-necl-success">
          <span className="w-2 h-2 rounded-full bg-necl-success animate-pulse" />
          Live
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPITile
          label="Active Projects"
          value="8"
          subtitle="6 on track · 2 at risk"
          trend="up"
          trendText="↑ 1 slipping"
          trendPositive={false}
          status="amber"
          sparklineData={[6, 7, 7, 8, 8, 8, 8]}
        />
        <KPITile
          label="Portfolio Value"
          value="₹72.4Cr"
          subtitle="₹48.7Cr spent · 11.7% CPI variance"
          trend="down"
          trendText="↑ overrun trend"
          trendPositive={false}
          status="amber"
          sparklineData={budgetWeekly}
          sparklineColor="#F59E0B"
        />
        <KPITile
          label="Fleet Utilization"
          value="74%"
          subtitle="₹72.3K idle today · 4 machines"
          trend="up"
          trendText="↑ improving"
          trendPositive
          status="amber"
          sparklineData={fleetWeekly}
          sparklineColor="#2563EB"
        />
        <KPITile
          label="Procurement"
          value="₹18.4Cr"
          subtitle="3 POs delayed · 20 open"
          trend="down"
          trendText="3 critical"
          trendPositive={false}
          status="red"
          sparklineData={[16, 17, 17, 18, 18, 19, 18]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="Workforce"
          value="2,444"
          subtitle="94.2% attendance · 6.8/10 attrition index"
          trend="stable"
          trendText="stable"
          trendPositive
          status="green"
          sparklineData={[94, 93, 94, 95, 94, 94, 94]}
          sparklineColor="#10B981"
        />
        <KPITile
          label="Safety Index"
          value="0 LTIs"
          subtitle="3 near-misses · 8-month streak"
          trend="stable"
          trendText="3 near-miss"
          trendPositive={false}
          status="amber"
          sparklineData={[0, 0, 0, 1, 0, 0, 0]}
          sparklineColor="#F59E0B"
        />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live Alerts Feed */}
        <div className="lg:col-span-3 rounded-xl border border-necl-border bg-necl-surface">
          <div className="flex items-center justify-between px-5 py-4 border-b border-necl-border">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-necl-critical" />
              <h2 className="text-sm font-bold text-necl-text">Live Alerts & Exceptions</h2>
              <div className="flex items-center gap-1 ml-1">
                <span className="w-2 h-2 rounded-full bg-necl-critical" style={{ animation: 'live-ping 1.5s ease-in-out infinite' }} />
                <span className="text-[10px] font-bold text-necl-critical">LIVE</span>
              </div>
            </div>
            <Link
              href="/alerts"
              className="text-[11px] text-necl-accent hover:text-blue-400 font-medium transition-colors"
            >
              View all {alerts.length} →
            </Link>
          </div>
          <div className="p-3 space-y-2 max-h-[460px] overflow-y-auto">
            {visibleAlerts.map(alert => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onView={setSelectedAlert}
                compact
              />
            ))}
          </div>
        </div>

        {/* Predictive Panel */}
        <div className="lg:col-span-2 rounded-xl border border-necl-border bg-necl-surface">
          <div className="flex items-center justify-between px-5 py-4 border-b border-necl-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-necl-accent" />
              <h2 className="text-sm font-bold text-necl-text">What&apos;s Coming</h2>
              <span className="text-[10px] text-necl-muted">Next 7 days</span>
            </div>
            <Link
              href="/predictive"
              className="text-[11px] text-necl-accent hover:text-blue-400 font-medium"
            >
              Full hub →
            </Link>
          </div>
          <div className="p-3 space-y-3 max-h-[460px] overflow-y-auto">
            {visibleForecasts.map(f => (
              <ForecastCard key={f.id} forecast={f} compact />
            ))}
          </div>
        </div>
      </div>

      {/* Prescriptive Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-necl-text">
            Prescriptive Recommendations
            <span className="ml-2 text-[11px] text-necl-muted font-normal">— ranked by expected impact</span>
          </h2>
          <Link href="/predictive" className="text-[11px] text-necl-accent hover:text-blue-400 font-medium">
            View all {recommendations.length} →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleRecs.map(rec => (
            <PrescriptiveCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
