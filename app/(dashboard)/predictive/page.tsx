'use client'

import { useState } from 'react'
import { TrendingUp, ArrowUpDown } from 'lucide-react'
import { useApp } from '@/lib/store'
import { ForecastCard } from '@/components/ui/ForecastCard'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { KPITile } from '@/components/ui/KPITile'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { forecasts, recommendations } from '@/lib/mock-data/predictions'

type SortBy = 'impact' | 'confidence' | 'priority'

export default function PredictivePage() {
  const { role, selectedProjects } = useApp()
  const [sortBy, setSortBy] = useState<SortBy>('priority')

  const isSiteManager = role === 'site-manager'

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Predictive & Prescriptive Hub</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  const visibleForecasts = isSiteManager
    ? forecasts.filter(f => f.projectId === 'KDSP-B1')
    : forecasts.filter(f => selectedProjects.includes(f.projectId))

  const visibleRecs = isSiteManager
    ? recommendations.filter(r => r.projectId === 'KDSP-B1')
    : recommendations.filter(r => selectedProjects.includes(r.projectId))

  const sortedRecs = [...visibleRecs].sort((a, b) => {
    if (sortBy === 'impact') return b.expectedImpactValue - a.expectedImpactValue
    if (sortBy === 'confidence') return b.confidence - a.confidence
    return a.priority - b.priority
  })

  const criticalForecasts = visibleForecasts.filter(f => f.severity === 'critical').length
  const highForecasts = visibleForecasts.filter(f => f.severity === 'high').length
  const avgConfidence = visibleForecasts.length
    ? Math.round(visibleForecasts.reduce((s, f) => s + f.confidence, 0) / visibleForecasts.length)
    : 0
  const totalImpact = visibleRecs.reduce((s, r) => s + r.expectedImpactValue, 0)

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Predictive & Prescriptive Hub</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Critical Forecasts"
          value={String(criticalForecasts)}
          subtitle="Require immediate attention"
          status="red"
          sparklineData={[1, 1, 2, 2, 2, 3, criticalForecasts]}
          sparklineColor="#EF4444"
        />
        <KPITile
          label="High Risk Forecasts"
          value={String(highForecasts)}
          subtitle="Monitor closely"
          status="amber"
          sparklineData={[2, 2, 3, 3, 3, 3, highForecasts]}
        />
        <KPITile
          label="Model Confidence"
          value={`${avgConfidence}%`}
          subtitle="Average across all models"
          status="blue"
          sparklineData={[82, 84, 85, 86, 86, 85, avgConfidence]}
        />
        <KPITile
          label="Actionable Value"
          value={`₹${Math.round(totalImpact / 100000).toLocaleString('en-IN')}L`}
          subtitle="If all recommendations actioned"
          status="green"
          sparklineData={[100, 120, 140, 160, 180, 200, Math.round(totalImpact / 100000)]}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Forecasts */}
        <div>
          <h2 className="text-sm font-bold text-necl-text mb-4">
            AI Forecasts
            <span className="ml-2 text-[11px] text-necl-muted font-normal">— what the models predict</span>
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {visibleForecasts.map(f => (
              <ForecastCard key={f.id} forecast={f} />
            ))}
            {visibleForecasts.length === 0 && (
              <div className="rounded-xl border border-necl-border bg-necl-surface p-6 text-center">
                <p className="text-sm text-necl-muted">No forecasts for selected projects</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-necl-text">
              Prescriptive Recommendations
              <span className="ml-2 text-[11px] text-necl-muted font-normal">— what to do about it</span>
            </h2>
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-necl-muted" />
              <span className="text-[11px] text-necl-muted">Sort:</span>
              {(['priority', 'impact', 'confidence'] as SortBy[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold capitalize transition-colors ${
                    sortBy === s ? 'bg-necl-accent text-white' : 'text-necl-muted hover:text-necl-text'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {sortedRecs.map(r => (
              <PrescriptiveCard key={r.id} recommendation={r} />
            ))}
            {sortedRecs.length === 0 && (
              <div className="rounded-xl border border-necl-border bg-necl-surface p-6 text-center">
                <p className="text-sm text-necl-muted">No recommendations for selected projects</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
