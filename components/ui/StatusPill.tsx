'use client'

import { cn } from '@/lib/utils'

type Status = 'on-track' | 'at-risk' | 'delayed' | 'active' | 'idle' | 'maintenance' | 'pending' | 'approved' | 'received' | 'low' | 'medium' | 'high' | 'critical'

const statusConfig: Record<Status, { label: string; className: string }> = {
  'on-track': { label: 'On Track', className: 'bg-necl-success/15 text-necl-success border-necl-success/30' },
  'at-risk': { label: 'At Risk', className: 'bg-necl-warning/15 text-necl-warning border-necl-warning/30' },
  'delayed': { label: 'Delayed', className: 'bg-necl-critical/15 text-necl-critical border-necl-critical/30' },
  'active': { label: 'Active', className: 'bg-necl-success/15 text-necl-success border-necl-success/30' },
  'idle': { label: 'Idle', className: 'bg-necl-muted/15 text-necl-muted border-necl-muted/30' },
  'maintenance': { label: 'Maintenance', className: 'bg-necl-warning/15 text-necl-warning border-necl-warning/30' },
  'pending': { label: 'Pending', className: 'bg-necl-warning/15 text-necl-warning border-necl-warning/30' },
  'approved': { label: 'Approved', className: 'bg-necl-accent/15 text-necl-accent border-necl-accent/30' },
  'received': { label: 'Received', className: 'bg-necl-success/15 text-necl-success border-necl-success/30' },
  'low': { label: 'Low Risk', className: 'bg-necl-success/15 text-necl-success border-necl-success/30' },
  'medium': { label: 'Medium', className: 'bg-necl-warning/15 text-necl-warning border-necl-warning/30' },
  'high': { label: 'High Risk', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  'critical': { label: 'Critical', className: 'bg-necl-critical/15 text-necl-critical border-necl-critical/30' },
}

interface StatusPillProps {
  status: Status
  className?: string
  size?: 'sm' | 'md'
}

export function StatusPill({ status, className, size = 'md' }: StatusPillProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-necl-muted/15 text-necl-muted border-necl-muted/30' }
  return (
    <span
      className={cn(
        'inline-flex items-center border rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
