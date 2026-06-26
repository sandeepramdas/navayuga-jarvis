'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useChartColors } from '@/lib/useChartColors'

interface DataSeries {
  key: string
  label: string
  color: string
}

interface NECLBarChartProps {
  data: Record<string, string | number>[]
  series: DataSeries[]
  xKey: string
  height?: number
  className?: string
  showLegend?: boolean
  formatValue?: (v: number) => string
  colorByValue?: boolean
  stacked?: boolean
}

export function NECLBarChart({
  data,
  series,
  xKey,
  height = 240,
  className,
  showLegend = true,
  formatValue,
  colorByValue = false,
  stacked = false,
}: NECLBarChartProps) {
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
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke={c.gridStroke} vertical={false} />
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
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
              stackId={stacked ? 'stack' : undefined}
            >
              {colorByValue &&
                data.map((entry, index) => {
                  const val = entry[s.key] as number
                  const color = val > 100 ? '#EF4444' : val > 95 ? '#F59E0B' : '#10B981'
                  return <Cell key={`cell-${index}`} fill={color} />
                })}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
