'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch, ChevronDown, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, Circle, XCircle, Zap, Users,
  CalendarDays, TrendingDown, Flag, Activity,
} from 'lucide-react'
import { useApp } from '@/lib/store'
import { projects } from '@/lib/mock-data/projects'
import {
  projectOrchestrations, getMilestoneStats,
  type Milestone, type ProjectOrchestration, type MilestoneStatus,
} from '@/lib/mock-data/orchestration'
import { cn } from '@/lib/utils'

// ── Status config ──────────────────────────────────────────────────────────────
const MILESTONE_STATUS: Record<MilestoneStatus, { icon: React.ElementType; color: string; bg: string; label: string; bar: string }> = {
  'complete':    { icon: CheckCircle2, color: 'text-necl-success',  bg: 'bg-necl-success/15 border-necl-success/30',  label: 'Complete',    bar: 'bg-necl-success' },
  'in-progress': { icon: Activity,     color: 'text-necl-accent',   bg: 'bg-necl-accent/10 border-necl-accent/25',    label: 'In Progress', bar: 'bg-necl-accent' },
  'at-risk':     { icon: AlertTriangle,color: 'text-necl-warning',  bg: 'bg-necl-warning/10 border-necl-warning/30',  label: 'At Risk',     bar: 'bg-necl-warning' },
  'delayed':     { icon: XCircle,      color: 'text-necl-critical', bg: 'bg-necl-critical/10 border-necl-critical/30',label: 'Delayed',     bar: 'bg-necl-critical' },
  'not-started': { icon: Circle,       color: 'text-necl-muted',    bg: 'bg-[var(--color-necl-border)]/30 border-transparent', label: 'Not Started', bar: 'bg-[var(--color-necl-border)]' },
}

const SUBTASK_STATUS = {
  'complete':    { dot: 'bg-necl-success',  label: 'Done',        text: 'text-necl-success'  },
  'in-progress': { dot: 'bg-necl-accent',   label: 'In Progress', text: 'text-necl-accent'   },
  'at-risk':     { dot: 'bg-necl-warning',  label: 'At Risk',     text: 'text-necl-warning'  },
  'blocked':     { dot: 'bg-necl-critical', label: 'Blocked',     text: 'text-necl-critical' },
  'not-started': { dot: 'bg-necl-muted',    label: 'Pending',     text: 'text-necl-muted'    },
}

const PROJECT_STATUS_COLOR: Record<string, string> = {
  'on-track': 'text-necl-success border-necl-success/40 bg-necl-success/10',
  'at-risk':  'text-necl-warning border-necl-warning/40 bg-necl-warning/10',
  'delayed':  'text-necl-critical border-necl-critical/40 bg-necl-critical/10',
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
}

// ── Milestone row ─────────────────────────────────────────────────────────────

function MilestoneRow({ m, defaultOpen = false }: { m: Milestone; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const cfg = MILESTONE_STATUS[m.status]
  const Icon = cfg.icon
  const hasSubTasks = m.subTasks.length > 0

  return (
    <div className="border border-[var(--color-necl-border)] rounded-xl overflow-hidden">
      {/* Milestone header */}
      <button
        onClick={() => hasSubTasks && setOpen(!open)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          hasSubTasks ? 'hover:bg-necl-accent/5 cursor-pointer' : 'cursor-default',
          m.status === 'delayed' && 'bg-necl-critical/5',
          m.status === 'at-risk' && 'bg-necl-warning/5',
        )}
      >
        {/* Seq badge */}
        <span className="w-6 h-6 rounded-full bg-[var(--color-necl-border)] text-[10px] font-bold text-necl-muted flex items-center justify-center flex-shrink-0">
          {m.seq}
        </span>

        {/* Status icon */}
        <Icon className={cn('w-4 h-4 flex-shrink-0', cfg.color)} />

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-xs font-semibold', m.status === 'complete' ? 'text-necl-muted line-through' : 'text-necl-text')}>
              {m.name}
            </span>
            {m.isCriticalPath && (
              <span className="text-[9px] font-bold text-necl-critical bg-necl-critical/10 border border-necl-critical/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                CRITICAL PATH
              </span>
            )}
            {m.daysVariance > 0 && m.status !== 'complete' && (
              <span className="text-[10px] text-necl-critical font-medium flex-shrink-0">
                +{m.daysVariance}d late
              </span>
            )}
            {m.daysVariance < 0 && m.status !== 'complete' && (
              <span className="text-[10px] text-necl-success font-medium flex-shrink-0">
                {Math.abs(m.daysVariance)}d ahead
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-necl-border)] overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full', cfg.bar)}
                initial={{ width: 0 }}
                animate={{ width: `${m.progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] font-bold text-necl-muted w-7 flex-shrink-0">{m.progress}%</span>
          </div>
        </div>

        {/* Dates */}
        <div className="hidden md:flex flex-col items-end gap-0.5 flex-shrink-0">
          {m.status === 'complete' ? (
            <span className="text-[10px] text-necl-success">Done {fmt(m.completedDate!)}</span>
          ) : (
            <>
              <span className="text-[10px] text-necl-muted">Target: {fmt(m.revisedDate ?? m.targetDate)}</span>
              {m.revisedDate && (
                <span className="text-[10px] text-necl-critical line-through">Was: {fmt(m.targetDate)}</span>
              )}
            </>
          )}
        </div>

        {/* Owner */}
        <div className="hidden lg:flex items-center gap-1.5 flex-shrink-0">
          <Users className="w-3 h-3 text-necl-muted" />
          <span className="text-[10px] text-necl-muted">{m.owner}</span>
        </div>

        {/* Status pill */}
        <span className={cn('text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0', cfg.bg, cfg.color)}>
          {cfg.label}
        </span>

        {/* Expand chevron */}
        {hasSubTasks && (
          <ChevronDown className={cn('w-3.5 h-3.5 text-necl-muted transition-transform flex-shrink-0', open && 'rotate-180')} />
        )}
      </button>

      {/* Sub-tasks */}
      <AnimatePresence>
        {open && m.subTasks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-[var(--color-necl-border)]"
          >
            <div className="bg-[var(--color-necl-bg)]/50">
              {m.subTasks.map((t, i) => {
                const sc = SUBTASK_STATUS[t.status]
                return (
                  <div
                    key={t.id}
                    className={cn(
                      'flex items-center gap-3 px-6 py-2.5 text-xs border-b border-[var(--color-necl-border)]/50 last:border-0',
                      t.status === 'blocked' && 'bg-necl-critical/5',
                    )}
                  >
                    {/* Tree line */}
                    <span className="text-[var(--color-necl-border)] text-sm flex-shrink-0">
                      {i === m.subTasks.length - 1 ? '└─' : '├─'}
                    </span>

                    {/* Status dot */}
                    <span className={cn('w-2 h-2 rounded-full flex-shrink-0', sc.dot)} />

                    {/* Task name */}
                    <span className={cn('flex-1 text-necl-muted', t.status === 'complete' && 'line-through text-necl-muted/60')}>
                      {t.name}
                    </span>

                    {/* Blocker */}
                    {t.blocker && (
                      <div className="hidden xl:flex items-start gap-1 max-w-[280px]">
                        <AlertTriangle className="w-3 h-3 text-necl-critical flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-necl-critical leading-tight">{t.blocker}</span>
                      </div>
                    )}

                    {/* Progress */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16 h-1 rounded-full bg-[var(--color-necl-border)] overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', sc.dot)}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-necl-muted w-6 text-right">{t.progress}%</span>
                    </div>

                    {/* Owner */}
                    <span className="hidden lg:block text-[10px] text-necl-muted w-28 text-right truncate flex-shrink-0">{t.owner}</span>

                    {/* Status badge */}
                    <span className={cn('text-[9px] font-semibold flex-shrink-0', sc.text)}>
                      {sc.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Project card ──────────────────────────────────────────────────────────────

function ProjectCard({ orch }: { orch: ProjectOrchestration }) {
  const [collapsed, setCollapsed] = useState(false)
  const proj = projects.find(p => p.id === orch.projectId)
  if (!proj) return null

  const sc = PROJECT_STATUS_COLOR[proj.status]
  const completedMs = orch.milestones.filter(m => m.status === 'complete').length
  const delayedMs   = orch.milestones.filter(m => m.status === 'delayed').length
  const blockedTasks = orch.milestones.flatMap(m => m.subTasks).filter(t => t.status === 'blocked').length

  // Active milestone = first non-complete
  const activeMilestone = orch.milestones.find(m => m.status !== 'complete' && m.status !== 'not-started')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] overflow-hidden"
    >
      {/* Project header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-necl-accent/5 transition-colors border-b border-[var(--color-necl-border)]"
      >
        {/* Project ID + type */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-necl-accent/15 flex items-center justify-center">
            <span className="text-necl-accent text-sm font-black">{orch.projectId.split('-')[0][0]}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-necl-text">{orch.projectId}</p>
            <p className="text-[10px] text-necl-muted">{proj.type}</p>
          </div>
        </div>

        {/* Project name + location */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-necl-text truncate">{proj.name}</p>
          <p className="text-[11px] text-necl-muted">{proj.location} · PM: {proj.pm}</p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-lg font-black text-necl-text">{orch.overallProgress}%</p>
            <p className="text-[9px] text-necl-muted uppercase tracking-widest">Overall</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-necl-success">{completedMs}/{orch.milestones.length}</p>
            <p className="text-[9px] text-necl-muted uppercase tracking-widest">Done</p>
          </div>
          {delayedMs > 0 && (
            <div className="text-center">
              <p className="text-sm font-bold text-necl-critical">{delayedMs}</p>
              <p className="text-[9px] text-necl-muted uppercase tracking-widest">Delayed</p>
            </div>
          )}
          {blockedTasks > 0 && (
            <div className="text-center">
              <p className="text-sm font-bold text-necl-critical">{blockedTasks}</p>
              <p className="text-[9px] text-necl-muted uppercase tracking-widest">Blocked</p>
            </div>
          )}
        </div>

        {/* Schedule variance */}
        <div className="hidden lg:flex flex-col items-end gap-1 flex-shrink-0">
          {proj.scheduleVarianceDays !== 0 && (
            <span className={cn(
              'text-xs font-bold px-2.5 py-1 rounded-full border',
              proj.scheduleVarianceDays > 0
                ? 'text-necl-critical border-necl-critical/30 bg-necl-critical/10'
                : 'text-necl-success border-necl-success/30 bg-necl-success/10',
            )}>
              {proj.scheduleVarianceDays > 0 ? `+${proj.scheduleVarianceDays}d late` : `${Math.abs(proj.scheduleVarianceDays)}d ahead`}
            </span>
          )}
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', sc)}>
            {orch.phase}
          </span>
        </div>

        {/* Overall progress bar */}
        <div className="hidden xl:block w-20 flex-shrink-0">
          <div className="h-2 rounded-full bg-[var(--color-necl-border)] overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', proj.status === 'on-track' ? 'bg-necl-success' : proj.status === 'at-risk' ? 'bg-necl-warning' : 'bg-necl-critical')}
              initial={{ width: 0 }}
              animate={{ width: `${orch.overallProgress}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>

        <ChevronDown className={cn('w-4 h-4 text-necl-muted transition-transform flex-shrink-0', collapsed && 'rotate-180')} />
      </button>

      {/* Active milestone banner */}
      {!collapsed && activeMilestone && (
        <div className={cn(
          'flex items-center gap-2 px-5 py-2 border-b border-[var(--color-necl-border)] text-xs',
          activeMilestone.status === 'delayed' ? 'bg-necl-critical/8' : 'bg-necl-accent/5',
        )}>
          <Flag className={cn('w-3.5 h-3.5 flex-shrink-0', activeMilestone.status === 'delayed' ? 'text-necl-critical' : 'text-necl-accent')} />
          <span className="text-necl-muted">Active milestone:</span>
          <span className={cn('font-semibold', activeMilestone.status === 'delayed' ? 'text-necl-critical' : 'text-necl-text')}>
            M{activeMilestone.seq}: {activeMilestone.name}
          </span>
          <span className="text-necl-muted">·</span>
          <span className="text-necl-muted">{activeMilestone.progress}% done</span>
          <span className="text-necl-muted">·</span>
          <span className={cn('font-medium', activeMilestone.status === 'delayed' ? 'text-necl-critical' : 'text-necl-muted')}>
            {activeMilestone.revisedDate
              ? `Revised: ${fmt(activeMilestone.revisedDate)}`
              : `Target: ${fmt(activeMilestone.targetDate)}`
            }
          </span>
        </div>
      )}

      {/* Milestones */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            {/* Mini timeline bar */}
            <div className="px-5 py-3 border-b border-[var(--color-necl-border)]">
              <div className="flex gap-1 items-center">
                {orch.milestones.map(m => {
                  const cfg = MILESTONE_STATUS[m.status]
                  return (
                    <div
                      key={m.id}
                      className={cn('flex-1 h-2 rounded-sm relative group cursor-default')}
                      title={`M${m.seq}: ${m.name} — ${m.progress}%`}
                    >
                      <div className="h-full rounded-sm bg-[var(--color-necl-border)] overflow-hidden">
                        <div
                          className={cn('h-full', cfg.bar)}
                          style={{ width: `${m.progress}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-1 mt-1">
                {orch.milestones.map(m => (
                  <div key={m.id} className="flex-1 text-center">
                    <span className="text-[8px] text-necl-muted/60">{m.shortName.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual milestone rows */}
            <div className="p-4 space-y-2">
              {orch.milestones.map(m => (
                <MilestoneRow
                  key={m.id}
                  m={m}
                  defaultOpen={m.status === 'delayed' || m.status === 'at-risk'}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrchestrationPage() {
  const { selectedProjects } = useApp()

  const filteredOrch = useMemo(
    () => projectOrchestrations.filter(p => selectedProjects.includes(p.projectId)),
    [selectedProjects],
  )

  const stats = useMemo(() => getMilestoneStats(filteredOrch), [filteredOrch])

  const totalBudget = useMemo(() => {
    const filtered = projects.filter(p => selectedProjects.includes(p.id))
    return filtered.reduce((sum, p) => sum + p.budget, 0)
  }, [selectedProjects])

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-necl-accent/15 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-necl-accent" />
            </div>
            <h1 className="text-2xl font-bold text-necl-text">Process Orchestration</h1>
          </div>
          <p className="text-sm text-necl-muted">
            {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} · {stats.total} milestones tracked · ₹{(totalBudget / 10000000).toFixed(1)}Cr portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-necl-success">
            <span className="w-2 h-2 rounded-full bg-necl-success animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Milestones', value: stats.total,    color: 'text-necl-text',     icon: CalendarDays  },
          { label: 'Complete',         value: stats.complete,  color: 'text-necl-success',  icon: CheckCircle2  },
          { label: 'In Progress',      value: stats.onTrack,   color: 'text-necl-accent',   icon: Activity      },
          { label: 'At Risk',          value: stats.atRisk,    color: 'text-necl-warning',  icon: AlertTriangle },
          { label: 'Delayed',          value: stats.delayed,   color: 'text-necl-critical', icon: TrendingDown  },
          { label: 'Blocked Tasks',    value: stats.blocked,   color: 'text-necl-critical', icon: XCircle       },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] px-4 py-3 flex items-center gap-3">
            <Icon className={cn('w-4 h-4 flex-shrink-0', color)} />
            <div>
              <p className={cn('text-xl font-black', color)}>{value}</p>
              <p className="text-[10px] text-necl-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[11px] text-necl-muted font-medium">Legend:</span>
        {Object.entries(MILESTONE_STATUS).map(([status, cfg]) => {
          const Icon = cfg.icon
          return (
            <div key={status} className="flex items-center gap-1.5">
              <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
              <span className="text-[11px] text-necl-muted">{cfg.label}</span>
            </div>
          )
        })}
        <span className="flex items-center gap-1.5 text-[11px] text-necl-critical">
          <span className="text-[9px] font-bold border border-necl-critical/30 bg-necl-critical/10 px-1.5 py-0.5 rounded-full">CRITICAL PATH</span>
          Critical path milestone
        </span>
      </div>

      {/* No projects selected */}
      {filteredOrch.length === 0 && (
        <div className="rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] p-16 text-center">
          <GitBranch className="w-8 h-8 text-necl-muted mx-auto mb-3" />
          <p className="text-sm text-necl-muted">No projects selected. Use the project selector above to choose projects.</p>
        </div>
      )}

      {/* Project cards */}
      <div className="space-y-4">
        {filteredOrch.map(orch => (
          <ProjectCard key={orch.projectId} orch={orch} />
        ))}
      </div>
    </div>
  )
}
