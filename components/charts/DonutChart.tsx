'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useChartColors } from '@/lib/useChartColors'

interface DonutSlice {
  label: string
  value: number
  color: string
}

interface NECLDonutChartProps {
  data: DonutSlice[]
  height?: number
  className?: string
  showLegend?: boolean
  centerLabel?: string
  centerValue?: string
  innerRadius?: number
  outerRadius?: number
}

export function NECLDonutChart({
  data,
  height = 220,
  className,
  showLegend = true,
  centerLabel,
  centerValue,
  innerRadius = 60,
  outerRadius = 90,
}: NECLDonutChartProps) {
  const c = useChartColors()

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ name: string; value: number; payload: { color: string } }>
  }) => {
    if (!active || !payload?.length) return null
    return (
      <div
        className="rounded-xl px-4 py-3 shadow-2xl border text-xs"
        style={{ background: c.tooltipBg, borderColor: c.tooltipBorder }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].payload.color }} />
          <span style={{ color: c.tooltipMuted, fontSize: 11 }}>{payload[0].name}:</span>
          <span style={{ color: c.tooltipText, fontSize: 11, fontWeight: 700 }}>{payload[0].value}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy={showLegend ? '45%' : '50%'}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            strokeWidth={2}
            stroke={c.donutStroke}
            paddingAngle={2}
          >
            {data.map((slice, index) => (
              <Cell key={`cell-${index}`} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '11px', color: c.legendColor }}
              iconType="circle"
              iconSize={8}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {(centerLabel || centerValue) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ top: showLegend ? '-10%' : '0' }}
        >
          {centerValue && (
            <span className="text-2xl font-bold text-necl-text leading-none">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-[10px] text-necl-muted mt-1">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
