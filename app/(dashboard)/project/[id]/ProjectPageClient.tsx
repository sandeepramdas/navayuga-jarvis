'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Users, Truck, Package, Bot, Calendar, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusPill } from '@/components/ui/StatusPill'
import { AlertItem } from '@/components/ui/AlertItem'
import { PrescriptiveCard } from '@/components/ui/PrescriptiveCard'
import { DrawerDetail } from '@/components/ui/DrawerDetail'
import { useApp } from '@/lib/store'
import { formatINR, formatDate } from '@/lib/utils'
import { projects } from '@/lib/mock-data/projects'
import type { Project } from '@/lib/mock-data/projects'
import type { Machine } from '@/lib/mock-data/fleet'
import type { PurchaseOrder } from '@/lib/mock-data/procurement'
import type { Employee } from '@/lib/mock-data/hr'
import type { Alert } from '@/lib/mock-data/alerts'
import type { Recommendation } from '@/lib/mock-data/predictions'

interface Props {
  project: Project
  machines: Machine[]
  pos: PurchaseOrder[]
  employees: Employee[]
  projectAlerts: Alert[]
  recommendations: Recommendation[]
}

const machineStatusDot = {
  active: 'bg-necl-success',
  idle: 'bg-necl-warning',
  maintenance: 'bg-necl-critical',
}

const STATUS_DOT: Record<string, string> = {
  'on-track': 'bg-necl-success',
  'at-risk':  'bg-necl-warning',
  'delayed':  'bg-necl-critical',
}

export function ProjectPageClient({ project, machines, pos, employees, projectAlerts, recommendations }: Props) {
  const { setJarvisPanelOpen, role } = useApp()
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  const visibleProjects = role === 'site-manager' ? projects.filter(p => p.id === 'KDSP-B1') : projects
  const currentIdx = visibleProjects.findIndex(p => p.id === project.id)
  const prevProject = currentIdx > 0 ? visibleProjects[currentIdx - 1] : null
  const nextProject = currentIdx < visibleProjects.length - 1 ? visibleProjects[currentIdx + 1] : null

  const budgetVariance = project.actual - project.budget
  const isOverBudget = budgetVariance > 0
  const isDelayed = project.scheduleVarianceDays > 0
  const criticalPOs = pos.filter(p => p.stockoutRisk <= 5)

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Project navigator */}
      <div className="flex items-center justify-between gap-3">
        {/* Back to all */}
        <Link
          href="/project"
          className="flex items-center gap-1.5 text-xs text-necl-muted hover:text-necl-text transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          All Projects
        </Link>

        {/* Project pill switcher */}
        <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 hide-scrollbar">
          {visibleProjects.map(p => (
            <Link
              key={p.id}
              href={`/project/${p.id}`}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                p.id === project.id
                  ? 'border-necl-accent bg-necl-accent text-white'
                  : 'border-[var(--color-necl-border)] text-necl-muted hover:border-necl-accent/40 hover:text-necl-text'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[p.status]}`} />
              {p.id}
            </Link>
          ))}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {prevProject ? (
            <Link
              href={`/project/${prevProject.id}`}
              className="p-1.5 rounded-lg border border-[var(--color-necl-border)] text-necl-muted hover:border-necl-accent/40 hover:text-necl-text transition-colors"
              title={prevProject.name}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="p-1.5 opacity-30 cursor-default"><ChevronLeft className="w-3.5 h-3.5 text-necl-muted" /></span>
          )}
          {nextProject ? (
            <Link
              href={`/project/${nextProject.id}`}
              className="p-1.5 rounded-lg border border-[var(--color-necl-border)] text-necl-muted hover:border-necl-accent/40 hover:text-necl-text transition-colors"
              title={nextProject.name}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="p-1.5 opacity-30 cursor-default"><ChevronRight className="w-3.5 h-3.5 text-necl-muted" /></span>
          )}
        </div>
      </div>

      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-necl-border bg-necl-surface p-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-[11px] font-mono text-necl-accent bg-necl-accent/10 px-2 py-0.5 rounded">{project.id}</span>
              <span className="text-[11px] text-necl-muted bg-necl-border px-2 py-0.5 rounded">{project.type}</span>
              <StatusPill status={project.status} />
            </div>
            <h1 className="text-2xl font-bold text-necl-text mb-1">{project.name}</h1>
            <div className="flex items-center gap-2 text-sm text-necl-muted">
              <MapPin className="w-3.5 h-3.5" />
              {project.location}
              <span className="text-necl-border">·</span>
              <Users className="w-3.5 h-3.5" />
              PM: {project.pm}
            </div>
          </div>

          <button
            onClick={() => setJarvisPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-necl-accent/15 border border-necl-accent/40 text-necl-accent text-sm font-medium hover:bg-necl-accent hover:text-white transition-colors"
          >
            <Bot className="w-4 h-4" />
            Ask Jarvis about this project
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-necl-text">Overall Progress</span>
            <span className="text-xl font-bold text-necl-text">{project.progress}%</span>
          </div>
          <div className="w-full h-3 bg-necl-border rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${project.status === 'on-track' ? 'bg-necl-accent' : project.status === 'at-risk' ? 'bg-necl-warning' : 'bg-necl-critical'}`}
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-1">Budget</p>
            <p className="text-lg font-bold text-necl-text">{formatINR(project.budget)}</p>
            <p className={`text-xs font-semibold mt-0.5 ${isOverBudget ? 'text-necl-critical' : 'text-necl-success'}`}>
              Actual: {formatINR(project.actual)} ({isOverBudget ? '+' : ''}{project.costVariance}%)
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-1">Planned Completion</p>
            <p className="text-lg font-bold text-necl-text">{formatDate(project.plannedCompletion)}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold mt-0.5 ${isDelayed ? 'text-necl-critical' : 'text-necl-success'}`}>
              {isDelayed ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {isDelayed ? `+${project.scheduleVarianceDays}d late` : `${Math.abs(project.scheduleVarianceDays)}d early`}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-1">Projected Completion</p>
            <p className="text-lg font-bold text-necl-text">{formatDate(project.projectedCompletion)}</p>
            <p className="text-xs text-necl-muted mt-0.5">AI forecast</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-1">Team</p>
            <p className="text-lg font-bold text-necl-text">{project.crewCount} crew</p>
            <p className="text-xs text-necl-muted mt-0.5">{project.equipmentCount} machines on-site</p>
          </div>
        </div>
      </motion.div>

      {/* 3-column detail */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Equipment */}
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-border">
            <Truck className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Equipment ({machines.length})</h2>
          </div>
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {machines.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-necl-bg border border-necl-border">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${machineStatusDot[m.status]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-necl-text truncate">{m.brand} {m.model}</p>
                  <p className="text-[10px] text-necl-muted">{m.type} · {m.utilization}% util</p>
                </div>
                {m.predictiveMaintenance.riskLevel === 'critical' && (
                  <span className="text-[9px] font-bold text-necl-critical bg-necl-critical/15 px-1.5 py-0.5 rounded">PM!</span>
                )}
              </div>
            ))}
            {machines.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No machines assigned</p>
            )}
          </div>
        </div>

        {/* Crew */}
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-border">
            <Users className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Crew ({employees.length} tracked)</h2>
          </div>
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {employees.map(e => (
              <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-necl-bg border border-necl-border">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${e.attritionRisk === 'high' ? 'bg-necl-critical' : e.attritionRisk === 'medium' ? 'bg-necl-warning' : 'bg-necl-success'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-necl-text truncate">{e.name}</p>
                  <p className="text-[10px] text-necl-muted">{e.role} · {e.attendance}% att</p>
                </div>
                <span className={`text-[10px] font-bold ${e.productivityVsPlan >= 0 ? 'text-necl-success' : 'text-necl-warning'}`}>
                  {e.productivityVsPlan >= 0 ? '+' : ''}{e.productivityVsPlan}%
                </span>
              </div>
            ))}
            {employees.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No employee data for this project</p>
            )}
          </div>
        </div>

        {/* Materials */}
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-necl-border">
            <Package className="w-4 h-4 text-necl-accent" />
            <h2 className="text-sm font-bold text-necl-text">Materials ({pos.length} POs)</h2>
          </div>
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {pos.map(po => (
              <div key={po.id} className={`flex items-start gap-3 p-2.5 rounded-lg bg-necl-bg border ${po.stockoutRisk <= 5 ? 'border-necl-critical/40' : 'border-necl-border'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${po.stockoutRisk <= 5 ? 'bg-necl-critical' : po.stockoutRisk <= 10 ? 'bg-necl-warning' : 'bg-necl-success'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-necl-text truncate">{po.item}</p>
                  <p className="text-[10px] text-necl-muted">{po.id} · {po.vendor}</p>
                  {po.stockoutRisk <= 10 && (
                    <p className="text-[10px] text-necl-critical mt-0.5">⚠ {po.stockoutRisk}d cover remaining</p>
                  )}
                </div>
                <StatusPill status={po.status === 'delayed' ? 'delayed' : po.status === 'received' ? 'received' : po.status === 'approved' ? 'approved' : 'pending'} size="sm" />
              </div>
            ))}
            {pos.length === 0 && (
              <p className="text-sm text-necl-muted text-center py-4">No open POs</p>
            )}
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="rounded-xl border border-necl-border bg-necl-surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-necl-accent" />
          <h2 className="text-sm font-bold text-necl-text">Milestones</h2>
        </div>
        <div className="flex items-start gap-0 overflow-x-auto">
          {project.milestones.map((m, i) => (
            <div key={i} className="flex-1 min-w-32 flex flex-col items-center relative">
              {/* Connector line */}
              {i < project.milestones.length - 1 && (
                <div className={`absolute top-3 left-1/2 right-0 h-0.5 ${m.completed ? 'bg-necl-success' : 'bg-necl-border'}`} />
              )}
              {/* Dot */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${
                m.completed
                  ? 'bg-necl-success border-necl-success text-white'
                  : 'bg-necl-surface border-necl-border text-necl-muted'
              }`}>
                {m.completed ? '✓' : '○'}
              </div>
              {/* Label */}
              <p className="text-[10px] font-semibold text-necl-text text-center mt-2 leading-tight">{m.name}</p>
              <p className="text-[9px] text-necl-muted text-center mt-0.5">{formatDate(m.date)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-necl-border bg-necl-surface">
          <div className="px-5 py-4 border-b border-necl-border">
            <h2 className="text-sm font-bold text-necl-text">Project Alerts</h2>
          </div>
          <div className="p-3 space-y-2">
            {projectAlerts.length > 0
              ? projectAlerts.map(a => (
                  <AlertItem key={a.id} alert={a} onView={setSelectedAlert} compact />
                ))
              : <p className="text-sm text-necl-muted text-center py-4">No active alerts for this project</p>
            }
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-necl-text">Recommendations</h2>
          {recommendations.length > 0
            ? recommendations.slice(0, 2).map(r => (
                <PrescriptiveCard key={r.id} recommendation={r} />
              ))
            : <div className="rounded-xl border border-necl-border bg-necl-surface p-6 text-center">
                <p className="text-sm text-necl-muted">No active recommendations for this project</p>
              </div>
          }
        </div>
      </div>

      <DrawerDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}
