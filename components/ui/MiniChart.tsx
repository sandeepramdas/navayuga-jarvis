'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { useChartColors } from '@/lib/useChartColors'
import type { ChartDataPoint } from '@/lib/mock-data/jarvis-answers'

interface MiniChartProps {
  data: ChartDataPoint[]
  type: 'bar' | 'line'
  title: string
  height?: number
}

export function MiniChart({ data, type, title, height = 140 }: MiniChartProps) {
  const c = useChartColors()

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{ value: number }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="rounded-lg px-3 py-2 text-xs shadow-xl border"
          style={{ background: c.tooltipBg, borderColor: c.tooltipBorder, color: c.tooltipText }}
        >
          <p className="font-medium">{label}</p>
          <p style={{ color: '#2563EB' }}>{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="rounded-lg border border-necl-border bg-necl-bg p-3">
      <p className="text-[11px] text-necl-muted mb-2 font-medium">{title}</p>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: c.tickFill }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: c.tickFill }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {data[0]?.target !== undefined && (
                <ReferenceLine y={data[0].target} stroke="#2563EB" strokeDasharray="3 3" strokeWidth={1} />
              )}
              <Bar dataKey="value" fill="#2563EB" radius={[2, 2, 0, 0]} maxBarSize={24} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: c.tickFill }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: c.tickFill }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#EF4444"
                strokeWidth={1.5}
                dot={{ r: 2, fill: '#EF4444' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
