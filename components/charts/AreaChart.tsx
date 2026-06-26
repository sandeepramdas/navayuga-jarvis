'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useChartColors } from '@/lib/useChartColors'

interface DataSeries {
  key: string
  label: string
  color: string
}

interface NECLAreaChartProps {
  data: Record<string, string | number>[]
  series: DataSeries[]
  xKey: string
  height?: number
  className?: string
  showLegend?: boolean
  formatValue?: (v: number) => string
}

export function NECLAreaChart({
  data,
  series,
  xKey,
  height = 240,
  className,
  showLegend = true,
  formatValue,
}: NECLAreaChartProps) {
  const c = useChartColors()

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; color: string }>
    label?: string
  }) => {
    if (!active || !payload?.length) return null
    return (
      <div
        className="rounded-xl px-4 py-3 shadow-2xl border text-xs"
        style={{ background: c.tooltipBg, borderColor: c.tooltipBorder }}
      >
        <p className="font-semibold mb-2" style={{ color: c.tooltipText }}>{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span style={{ color: c.tooltipMuted, fontSize: 11 }}>{p.name}:</span>
            <span style={{ color: c.tooltipText, fontSize: 11, fontWeight: 700 }}>
              {formatValue ? formatValue(p.value) : p.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 10, fill: c.tickFill }}
            axisLine={{ stroke: c.axisStroke }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: c.tickFill }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: '11px', color: c.legendColor, paddingTop: '8px' }} />
          )}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
