'use client'

import { useApp } from './store'

export function useChartColors() {
  const { theme } = useApp()
  const isDark = theme === 'dark'

  return {
    gridStroke:   isDark ? '#1E2028' : '#E2E8F0',
    axisStroke:   isDark ? '#1E2028' : '#E2E8F0',
    tickFill:     isDark ? '#8B8FA8' : '#64748B',
    legendColor:  isDark ? '#8B8FA8' : '#64748B',
    donutStroke:  isDark ? '#111318' : '#FFFFFF',
    tooltipBg:    isDark ? '#111318' : '#FFFFFF',
    tooltipBorder:isDark ? '#1E2028' : '#E2E8F0',
    tooltipText:  isDark ? '#F1F3F8' : '#0F172A',
    tooltipMuted: isDark ? '#8B8FA8' : '#64748B',
  }
}
