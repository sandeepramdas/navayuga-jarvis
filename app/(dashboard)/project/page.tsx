'use client'

import Link from 'next/link'
import { MapPin, Users, Truck, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/store'
import { StatusPill } from '@/components/ui/StatusPill'
import { projects } from '@/lib/mock-data/projects'
import { formatINR } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  'Metro Rail':      'bg-necl-accent/15 text-necl-accent',
  'Highway':         'bg-yellow-500/15 text-yellow-400',
  'Irrigation':      'bg-cyan-500/15 text-cyan-400',
  'Urban Infra':     'bg-purple-500/15 text-purple-400',
  'Coastal Highway': 'bg-teal-500/15 text-teal-400',
  'Railway':         'bg-orange-500/15 text-orange-400',
  'Port':            'bg-blue-400/15 text-blue-300',
}

const STATUS_BAR: Record<string, string> = {
  'on-track': 'bg-necl-success',
  'at-risk':  'bg-necl-warning',
  'delayed':  'bg-necl-critical',
}

export default function ProjectIndexPage() {
  const { role } = useApp()

  const visibleProjects = role === 'site-manager'
    ? projects.filter(p => p.id === 'KDSP-B1')
    : projects

  const totalBudget = visibleProjects.reduce((s, p) => s + p.budget, 0)
  const onTrack = visibleProjects.filter(p => p.status === 'on-track').length
  const atRisk  = visibleProjects.filter(p => p.status === 'at-risk').length
  const delayed = visibleProjects.filter(p => p.status === 'delayed').length

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-necl-accent" />
          <div>
            <h1 className="text-2xl font-bold text-necl-text">Project Sites</h1>
            <p className="text-sm text-necl-muted mt-0.5">{visibleProjects.length} active projects · ₹{(totalBudget / 10000000).toFixed(0)}Cr portfolio</p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-necl-success/10 border border-necl-success/30 text-necl-success text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-necl-success" />{onTrack} On Track
          </span>
          {atRisk > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-necl-warning/10 border border-necl-warning/30 text-necl-warning text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-necl-warning" />{atRisk} At Risk
            </span>
          )}
          {delayed > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-necl-critical/10 border border-necl-critical/30 text-necl-critical text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-necl-critical" />{delayed} Delayed
            </span>
          )}
        </div>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {visibleProjects.map((p, i) => {
          const isOverBudget = p.costVariance > 0
          const isDelayed = p.scheduleVarianceDays > 0
          const completedMs = p.milestones.filter(m => m.completed).length

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/project/${p.id}`} className="block group">
                <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] hover:border-necl-accent/50 hover:shadow-lg hover:shadow-necl-accent/5 transition-all duration-200 overflow-hidden">
                  {/* Progress bar strip at top */}
                  <div className="h-1.5 bg-[var(--color-necl-border)]">
                    <div
                      className={`h-full transition-all ${STATUS_BAR[p.status]}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>

                  <div className="p-5">
                    {/* ID + type + status */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-necl-accent bg-necl-accent/10 px-2 py-0.5 rounded">
                          {p.id}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${TYPE_COLORS[p.type] ?? 'bg-necl-border text-necl-muted'}`}>
                          {p.type}
                        </span>
                      </div>
                      <StatusPill status={p.status} size="sm" />
                    </div>

                    {/* Name */}
                    <h2 className="text-sm font-bold text-necl-text leading-snug mb-1 group-hover:text-necl-accent transition-colors">
                      {p.name}
                    </h2>

                    {/* Location + PM */}
                    <div className="flex items-center gap-1.5 text-[11px] text-necl-muted mb-4">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{p.location}</span>
                      <span className="text-necl-border flex-shrink-0">·</span>
                      <Users className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{p.pm}</span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-necl-muted uppercase tracking-wider">Progress</span>
                        <span className="text-sm font-bold text-necl-text">{p.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--color-necl-border)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${STATUS_BAR[p.status]}`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--color-necl-border)]">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-necl-muted mb-0.5">Budget</p>
                        <p className="text-xs font-bold text-necl-text">₹{(p.budget / 10000000).toFixed(1)}Cr</p>
                        <p className={`text-[10px] font-semibold ${isOverBudget ? 'text-necl-critical' : 'text-necl-success'}`}>
                          {isOverBudget ? '+' : ''}{p.costVariance}% var
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-necl-muted mb-0.5">Schedule</p>
                        <div className={`flex items-center gap-0.5 text-xs font-bold ${isDelayed ? 'text-necl-critical' : 'text-necl-success'}`}>
                          {isDelayed
                            ? <><TrendingDown className="w-3 h-3" />+{p.scheduleVarianceDays}d</>
                            : <><TrendingUp className="w-3 h-3" />{Math.abs(p.scheduleVarianceDays)}d</>
                          }
                        </div>
                        <p className="text-[10px] text-necl-muted">{isDelayed ? 'behind' : 'ahead'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-necl-muted mb-0.5">Team</p>
                        <p className="text-xs font-bold text-necl-text">{p.crewCount}</p>
                        <p className="text-[10px] text-necl-muted">{p.equipmentCount} machines</p>
                      </div>
                    </div>

                    {/* Milestones mini-row */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[var(--color-necl-border)]">
                      <span className="text-[10px] text-necl-muted mr-1">{completedMs}/{p.milestones.length} milestones</span>
                      {p.milestones.map((m, mi) => (
                        <div
                          key={mi}
                          className={`flex-1 h-1 rounded-full ${m.completed ? 'bg-necl-success' : 'bg-[var(--color-necl-border)]'}`}
                          title={m.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="px-5 py-3 border-t border-[var(--color-necl-border)] bg-[var(--color-necl-bg)] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-necl-muted">
                      <span className="flex items-center gap-1"><Truck className="w-3 h-3" />{p.equipmentCount} machines</span>
                      <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{formatINR(p.actual)} spent</span>
                    </div>
                    <span className="text-[11px] text-necl-accent font-semibold group-hover:underline">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
