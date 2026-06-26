'use client'

import { useState } from 'react'
import { BarChart2, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useApp } from '@/lib/store'
import { KPITile } from '@/components/ui/KPITile'
import { StatusPill } from '@/components/ui/StatusPill'
import { NECLBarChart } from '@/components/charts/BarChart'
import { NoProjectsSelected } from '@/components/ui/NoProjectsSelected'
import { employees } from '@/lib/mock-data/hr'
import { cn } from '@/lib/utils'

const deptData = [
  { dept: 'Engineering', count: 12, avgAttendance: 94, avgProductivity: 84 },
  { dept: 'Fleet', count: 6, avgAttendance: 91, avgProductivity: 85 },
  { dept: 'Procurement', count: 3, avgAttendance: 93, avgProductivity: 82 },
  { dept: 'Finance', count: 3, avgAttendance: 97, avgProductivity: 89 },
  { dept: 'HR', count: 2, avgAttendance: 96, avgProductivity: 89 },
  { dept: 'Operations', count: 3, avgAttendance: 92, avgProductivity: 87 },
  { dept: 'Safety', count: 2, avgAttendance: 99, avgProductivity: 91 },
]

export default function TeamPage() {
  const { role, selectedProjects } = useApp()
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const isSiteManager = role === 'site-manager'

  if (!isSiteManager && selectedProjects.length === 0) {
    return (
      <div className="space-y-6 max-w-[1600px]">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-necl-accent" />
          <h1 className="text-2xl font-bold text-necl-text">Team KPI & People Analytics</h1>
        </div>
        <NoProjectsSelected />
      </div>
    )
  }

  const visibleEmployees = isSiteManager
    ? employees.filter(e => e.projectId === 'KDSP-B1')
    : employees.filter(e => selectedProjects.includes(e.projectId))

  const highAttrition = visibleEmployees.filter(e => e.attritionRisk === 'high').length
  const upTrend = visibleEmployees.filter(e => e.trend === 'up').length
  const avgAttendance = visibleEmployees.length
    ? Math.round(visibleEmployees.reduce((s, e) => s + e.attendance, 0) / visibleEmployees.length)
    : 0

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-5 h-5 text-necl-accent" />
        <h1 className="text-2xl font-bold text-necl-text">Team KPI & People Analytics</h1>
      </div>

      {/* Ethical framing note */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-necl-accent/30 bg-necl-accent/5">
        <Info className="w-4 h-4 text-necl-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-necl-muted leading-relaxed">
          <strong className="text-necl-text">People-first framing:</strong> These insights are advisory and require manager judgment.
          Data is transparent to the individual. No ranking is shown — focus is on identifying support needs and coaching opportunities.
          People analytics models are audited quarterly for demographic bias.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPITile
          label="Team Members"
          value={String(visibleEmployees.length)}
          subtitle="Tracked in this view"
          status="blue"
          sparklineData={[25, 27, 28, 29, 30, 30, visibleEmployees.length]}
        />
        <KPITile
          label="Attendance"
          value={`${avgAttendance}%`}
          subtitle="7-day rolling"
          status={avgAttendance >= 94 ? 'green' : 'amber'}
          sparklineData={[91, 92, 93, 94, 94, 93, avgAttendance]}
        />
        <KPITile
          label="Improving Trend"
          value={String(upTrend)}
          subtitle={`${upTrend} members trending up`}
          status="green"
          sparklineData={[5, 6, 7, 8, 9, 10, upTrend]}
        />
        <KPITile
          label="Need Support"
          value={String(highAttrition)}
          subtitle="High risk — flag for 1:1"
          status={highAttrition > 2 ? 'red' : 'amber'}
          sparklineData={[2, 3, 3, 4, 4, 4, highAttrition]}
          sparklineColor="#EF4444"
        />
      </div>

      {/* Dept chart */}
      <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
        <h2 className="text-sm font-bold text-necl-text mb-4">Attendance & Productivity by Department</h2>
        <NECLBarChart
          data={deptData}
          xKey="dept"
          series={[
            { key: 'avgAttendance', label: 'Attendance %', color: '#2563EB' },
            { key: 'avgProductivity', label: 'Productivity %', color: '#10B981' },
          ]}
          height={200}
          formatValue={v => `${v}%`}
        />
      </div>

      {/* Team roster */}
      <div className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden">
        <div className="px-5 py-4 border-b border-necl-border">
          <h2 className="text-sm font-bold text-necl-text">Team Roster</h2>
        </div>
        <div className="divide-y divide-necl-border/50">
          {visibleEmployees.map(emp => {
            const isExpanded = expandedRow === emp.id
            return (
              <div key={emp.id} className="hover:bg-necl-bg transition-colors">
                <div
                  className="flex items-center gap-4 px-5 py-3 cursor-pointer"
                  onClick={() => setExpandedRow(isExpanded ? null : emp.id)}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                    emp.attritionRisk === 'high' ? 'bg-necl-critical' : emp.attritionRisk === 'medium' ? 'bg-necl-warning' : 'bg-necl-success',
                  )}>
                    {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>

                  {/* Name & role */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-necl-text">{emp.name}</p>
                    <p className="text-[11px] text-necl-muted">{emp.role} · {emp.projectId}</p>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <p className={`text-sm font-bold ${emp.attendance >= 95 ? 'text-necl-success' : emp.attendance >= 88 ? 'text-necl-warning' : 'text-necl-critical'}`}>{emp.attendance}%</p>
                      <p className="text-[9px] text-necl-muted uppercase tracking-wider">Attendance</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${emp.productivityVsPlan >= 0 ? 'text-necl-success' : emp.productivityVsPlan >= -10 ? 'text-necl-warning' : 'text-necl-critical'}`}>
                        {emp.productivityVsPlan >= 0 ? '+' : ''}{emp.productivityVsPlan}%
                      </p>
                      <p className="text-[9px] text-necl-muted uppercase tracking-wider">vs Plan</p>
                    </div>
                    <div className="text-center">
                      <span className={`text-lg ${emp.trend === 'up' ? 'text-necl-success' : emp.trend === 'down' ? 'text-necl-critical' : 'text-necl-muted'}`}>
                        {emp.trend === 'up' ? '↑' : emp.trend === 'down' ? '↓' : '→'}
                      </span>
                      <p className="text-[9px] text-necl-muted uppercase tracking-wider">Trend</p>
                    </div>
                    <StatusPill
                      status={emp.attritionRisk === 'high' ? 'critical' : emp.attritionRisk === 'medium' ? 'medium' : 'low'}
                      size="sm"
                    />
                  </div>

                  {/* Expand toggle */}
                  <div className="flex-shrink-0 ml-2 text-necl-muted">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded row */}
                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 bg-necl-bg border-t border-necl-border/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-2">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {emp.skills.map(s => (
                            <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-necl-surface border border-necl-border text-necl-text">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-2">Coaching Suggestion</p>
                        <p className="text-xs text-necl-text leading-relaxed">{emp.coachingSuggestion}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[11px] text-necl-muted">
                      <span>Experience: <strong className="text-necl-text">{emp.yearsExperience}yrs</strong></span>
                      <span>Last review: <strong className="text-necl-text">{new Date(emp.lastReview).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
