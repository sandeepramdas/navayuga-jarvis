'use client'

import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface SparklineChartProps {
  data: number[]
  color?: string
  className?: string
  height?: number
}

export function SparklineChart({ data, color = '#2563EB', className, height = 48 }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
