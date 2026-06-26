'use client'

import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { SparklineChart } from './SparklineChart'

interface KPITileProps {
  label: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  trendText?: string
  trendPositive?: boolean
  status?: 'green' | 'amber' | 'red' | 'blue'
  sparklineData?: number[]
  sparklineColor?: string
  className?: string
  onClick?: () => void
}

const statusColors = {
  green: 'text-necl-success',
  amber: 'text-necl-warning',
  red: 'text-necl-critical',
  blue: 'text-necl-accent',
}

const trendBadgeColors = {
  green: 'bg-necl-success/15 text-necl-success border-necl-success/30',
  amber: 'bg-necl-warning/15 text-necl-warning border-necl-warning/30',
  red: 'bg-necl-critical/15 text-necl-critical border-necl-critical/30',
  blue: 'bg-necl-accent/15 text-necl-accent border-necl-accent/30',
}

export function KPITile({
  label,
  value,
  subtitle,
  trend = 'stable',
  trendText,
  trendPositive = true,
  status = 'blue',
  sparklineData,
  sparklineColor,
  className,
  onClick,
}: KPITileProps) {
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus
  const isPositiveTrend = trendPositive ? trend !== 'down' : trend === 'down'
  const badgeStatus = isPositiveTrend ? 'green' : 'red'
  const defaultSparklineColor = status === 'red' ? '#EF4444' : status === 'amber' ? '#F59E0B' : status === 'green' ? '#10B981' : '#2563EB'

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={cn(
        'relative rounded-xl border border-necl-border bg-necl-surface p-5 cursor-default transition-colors hover:border-necl-accent/40',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {/* Trend badge — top right */}
      {trendText && (
        <div className={cn(
          'absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold',
          trendBadgeColors[badgeStatus],
        )}>
          <TrendIcon className="w-2.5 h-2.5" />
          {trendText}
        </div>
      )}

      {/* Label */}
      <p className="text-[11px] font-semibold uppercase tracking-widest text-necl-muted mb-3">{label}</p>

      {/* Value */}
      <p className={cn(
        'text-3xl font-bold tracking-tight leading-none mb-1',
        statusColors[status] === 'text-necl-text' ? 'text-necl-text' : 'text-necl-text',
      )}>
        {value}
      </p>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-necl-muted mt-1.5 leading-relaxed">{subtitle}</p>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3">
          <SparklineChart
            data={sparklineData}
            color={sparklineColor ?? defaultSparklineColor}
            height={40}
          />
        </div>
      )}

      {/* Status indicator dot */}
      <div className={cn(
        'absolute bottom-4 right-4 w-2 h-2 rounded-full',
        status === 'green' && 'bg-necl-success',
        status === 'amber' && 'bg-necl-warning',
        status === 'red' && 'bg-necl-critical animate-pulse-glow',
        status === 'blue' && 'bg-necl-accent',
      )} />
    </motion.div>
  )
}
