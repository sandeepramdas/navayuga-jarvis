'use client'

import { AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AlertSeverity } from '@/lib/mock-data/alerts'

const severityConfig: Record<AlertSeverity, {
  label: string
  className: string
  icon: React.ElementType
}> = {
  critical: {
    label: 'Critical',
    className: 'bg-necl-critical/20 text-necl-critical border-necl-critical/40',
    icon: Zap,
  },
  high: {
    label: 'High',
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Medium',
    className: 'bg-necl-warning/20 text-necl-warning border-necl-warning/40',
    icon: AlertCircle,
  },
  info: {
    label: 'Info',
    className: 'bg-necl-accent/15 text-necl-accent border-necl-accent/30',
    icon: Info,
  },
}

interface SeverityChipProps {
  severity: AlertSeverity
  showIcon?: boolean
  className?: string
}

export function SeverityChip({ severity, showIcon = true, className }: SeverityChipProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide',
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  )
}
