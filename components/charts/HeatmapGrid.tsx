'use client'

import { cn } from '@/lib/utils'

interface HeatmapCell {
  label: string
  value: number
  maxValue?: number
}

interface HeatmapGridProps {
  cells: HeatmapCell[]
  columns?: number
  title?: string
  colorScheme?: 'risk' | 'performance'
}

function getCellColor(value: number, max: number, scheme: 'risk' | 'performance'): string {
  const ratio = value / max
  if (scheme === 'risk') {
    if (ratio >= 0.8) return 'bg-necl-critical/80 text-white'
    if (ratio >= 0.6) return 'bg-orange-500/70 text-white'
    if (ratio >= 0.4) return 'bg-necl-warning/60 text-necl-text'
    if (ratio >= 0.2) return 'bg-necl-warning/25 text-necl-text'
    return 'bg-necl-success/20 text-necl-success'
  } else {
    if (ratio >= 0.95) return 'bg-necl-success/80 text-white'
    if (ratio >= 0.8) return 'bg-necl-success/50 text-necl-text'
    if (ratio >= 0.6) return 'bg-necl-warning/40 text-necl-text'
    if (ratio >= 0.4) return 'bg-orange-500/40 text-necl-text'
    return 'bg-necl-critical/60 text-white'
  }
}

export function HeatmapGrid({ cells, columns = 6, title, colorScheme = 'risk' }: HeatmapGridProps) {
  const maxValue = Math.max(...cells.map(c => c.maxValue ?? c.value))

  return (
    <div className="w-full">
      {title && <p className="text-xs font-semibold text-necl-muted mb-3 uppercase tracking-widest">{title}</p>}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {cells.map((cell, i) => {
          const colorClass = getCellColor(cell.value, maxValue, colorScheme)
          return (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center justify-center rounded p-1.5 min-h-[52px] transition-all hover:opacity-90',
                colorClass,
              )}
              title={`${cell.label}: ${cell.value}`}
            >
              <span className="text-[9px] font-medium text-center leading-tight opacity-90">{cell.label}</span>
              <span className="text-sm font-bold mt-0.5">{cell.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
