'use client'

import { Zap, AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, timeAgo } from '@/lib/utils'
import { SeverityChip } from './SeverityChip'
import type { Alert } from '@/lib/mock-data/alerts'

const severityIcons = {
  critical: Zap,
  high: AlertTriangle,
  medium: AlertCircle,
  info: Info,
}

interface AlertItemProps {
  alert: Alert
  onView?: (alert: Alert) => void
  compact?: boolean
}

export function AlertItem({ alert, onView, compact = false }: AlertItemProps) {
  const Icon = severityIcons[alert.severity]

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-lg border transition-all',
        'border-necl-border bg-necl-surface hover:border-necl-accent/40 cursor-pointer',
        alert.severity === 'critical' && 'border-l-2 border-l-necl-critical glow-red',
        alert.severity === 'high' && 'border-l-2 border-l-orange-500',
      )}
      onClick={() => onView?.(alert)}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
        alert.severity === 'critical' && 'bg-necl-critical/20',
        alert.severity === 'high' && 'bg-orange-500/20',
        alert.severity === 'medium' && 'bg-necl-warning/20',
        alert.severity === 'info' && 'bg-necl-accent/15',
      )}>
        <Icon className={cn(
          'w-4 h-4',
          alert.severity === 'critical' && 'text-necl-critical',
          alert.severity === 'high' && 'text-orange-400',
          alert.severity === 'medium' && 'text-necl-warning',
          alert.severity === 'info' && 'text-necl-accent',
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <SeverityChip severity={alert.severity} showIcon={false} />
              <span className={cn(
                'text-sm font-semibold text-necl-text',
                compact && 'truncate',
              )}>
                {alert.title}
              </span>
            </div>
            <p className="text-xs text-necl-muted truncate">{alert.affectedEntity}</p>
            {!compact && (
              <p className="text-xs text-necl-muted mt-1 line-clamp-1">{alert.description}</p>
            )}
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[10px] text-necl-muted whitespace-nowrap">{timeAgo(alert.timestamp)}</span>
            {onView && (
              <button
                className="flex items-center gap-0.5 text-[11px] text-necl-accent hover:text-necl-text transition-colors font-medium"
                onClick={(e) => { e.stopPropagation(); onView(alert) }}
              >
                View <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
