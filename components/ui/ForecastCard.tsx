'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Forecast } from '@/lib/mock-data/predictions'

const severityColors = {
  critical: { bar: 'bg-necl-critical', text: 'text-necl-critical', border: 'border-l-necl-critical' },
  high: { bar: 'bg-orange-400', text: 'text-orange-400', border: 'border-l-orange-400' },
  medium: { bar: 'bg-necl-warning', text: 'text-necl-warning', border: 'border-l-necl-warning' },
  low: { bar: 'bg-necl-success', text: 'text-necl-success', border: 'border-l-necl-success' },
}

const trendIcons = {
  worsening: TrendingDown,
  improving: TrendingUp,
  stable: Minus,
}

interface ForecastCardProps {
  forecast: Forecast
  compact?: boolean
}

export function ForecastCard({ forecast, compact = false }: ForecastCardProps) {
  const colors = severityColors[forecast.severity]
  const TrendIcon = trendIcons[forecast.trend]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-necl-border bg-necl-surface p-4',
        `border-l-2 ${colors.border}`,
        'hover:border-necl-accent/40 transition-colors',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-necl-muted mb-1">{forecast.modelName}</p>
          <p className={cn('text-sm font-bold', colors.text)}>{forecast.predictedValue}</p>
          <p className="text-[11px] text-necl-muted mt-0.5 truncate">{forecast.entity}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className={cn(
            'flex items-center gap-1 text-[10px] font-semibold',
            forecast.trend === 'worsening' ? 'text-necl-critical' : forecast.trend === 'improving' ? 'text-necl-success' : 'text-necl-muted',
          )}>
            <TrendIcon className="w-3 h-3" />
            {forecast.trend}
          </div>
          <span className="text-[10px] text-necl-muted">{forecast.timeHorizon}</span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-necl-muted">Confidence</span>
          <span className={cn('text-[11px] font-bold', colors.text)}>{forecast.confidence}%</span>
        </div>
        <div className="w-full h-1 bg-necl-border rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full rounded-full', colors.bar)}
            initial={{ width: 0 }}
            animate={{ width: `${forecast.confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      </div>

      {/* Drivers */}
      {!compact && (
        <div className="space-y-1">
          {forecast.drivers.slice(0, 2).map((d, i) => (
            <p key={i} className="text-[11px] text-necl-muted leading-relaxed">
              <span className="text-necl-muted mr-1">·</span>
              {d}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  )
}
