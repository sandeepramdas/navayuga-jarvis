'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, Check, Layers, Filter } from 'lucide-react'
import { useApp, ALL_PROJECT_IDS, type ProjectFilters } from '@/lib/store'
import { projects } from '@/lib/mock-data/projects'
import { cn } from '@/lib/utils'

const TYPE_OPTIONS = ['All Types', 'Metro Rail', 'Highway', 'Irrigation', 'Urban Infra', 'Coastal Highway', 'Railway', 'Port']
const STATUS_OPTIONS = [
  { value: null,       label: 'All Status' },
  { value: 'on-track', label: 'On Track' },
  { value: 'at-risk',  label: 'At Risk' },
  { value: 'delayed',  label: 'Delayed' },
]
const SORT_OPTIONS = [
  { value: 'risk',     label: 'Sort: Risk ↓' },
  { value: 'progress', label: 'Sort: Progress' },
  { value: 'value',    label: 'Sort: Contract Value' },
  { value: 'schedule', label: 'Sort: Schedule' },
]

const STATUS_COLORS: Record<string, string> = {
  'on-track': 'bg-necl-success',
  'at-risk':  'bg-necl-warning',
  'delayed':  'bg-necl-critical',
}

const TYPE_ABBR: Record<string, string> = {
  'Metro Rail':      'M',
  'Highway':         'H',
  'Irrigation':      'I',
  'Urban Infra':     'U',
  'Coastal Highway': 'C',
  'Railway':         'R',
  'Port':            'P',
}

const TYPE_COLORS: Record<string, string> = {
  'Metro Rail':      'bg-necl-accent/20 text-necl-accent',
  'Highway':         'bg-yellow-500/20 text-yellow-400',
  'Irrigation':      'bg-cyan-500/20 text-cyan-400',
  'Urban Infra':     'bg-purple-500/20 text-purple-400',
  'Coastal Highway': 'bg-teal-500/20 text-teal-400',
  'Railway':         'bg-orange-500/20 text-orange-400',
  'Port':            'bg-blue-400/20 text-blue-300',
}

export function ProjectSelector() {
  const { selectedProjects, setSelectedProjects, projectFilters, setProjectFilters, role } = useApp()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const isSiteManager = role === 'site-manager'

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const allSelected = selectedProjects.length === ALL_PROJECT_IDS.length
  const noneSelected = selectedProjects.length === 0

  function toggle(id: string) {
    if (isSiteManager) return
    if (selectedProjects.includes(id)) {
      setSelectedProjects(selectedProjects.filter(p => p !== id))
    } else {
      setSelectedProjects([...selectedProjects, id])
    }
  }

  function selectAll() { setSelectedProjects(ALL_PROJECT_IDS) }
  function clearAll() { setSelectedProjects([]) }

  // Chips: show up to 3 selected project IDs, then "+N more"
  const visibleChips = allSelected ? [] : selectedProjects.slice(0, 3)
  const overflow = allSelected ? 0 : Math.max(0, selectedProjects.length - 3)

  const getProject = (id: string) => projects.find(p => p.id === id)

  return (
    <div className="flex items-center gap-2 h-full" ref={dropdownRef}>
      {/* Label */}
      <div className="flex items-center gap-1.5 text-necl-muted flex-shrink-0">
        <Layers className="w-3.5 h-3.5" />
        <span className="text-[11px] font-semibold uppercase tracking-wider hidden xl:block">Projects</span>
      </div>

      {/* Project chips / All badge */}
      <button
        onClick={() => !isSiteManager && setOpen(!open)}
        disabled={isSiteManager}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all',
          isSiteManager
            ? 'border-necl-border text-necl-muted cursor-default'
            : open
            ? 'border-necl-accent/60 bg-necl-accent/10 text-necl-accent'
            : 'border-[var(--color-necl-border)] text-necl-text hover:border-necl-accent/40',
        )}
      >
        {allSelected ? (
          <span className="font-medium">All {ALL_PROJECT_IDS.length} Projects</span>
        ) : isSiteManager ? (
          <span className="font-medium">KDSP-B1 only</span>
        ) : (
          <span className="font-medium">{selectedProjects.length} selected</span>
        )}
        {!isSiteManager && (
          <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
        )}
      </button>

      {/* Visible project chips */}
      <AnimatePresence>
        {!allSelected && !isSiteManager && visibleChips.map(id => {
          const p = getProject(id)
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] text-xs text-necl-text group hover:border-necl-critical/50 transition-colors hidden lg:flex"
            >
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_COLORS[p?.status ?? 'on-track'])} />
              <span className="font-medium">{id}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggle(id) }}
                className="text-necl-muted hover:text-necl-critical ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {overflow > 0 && (
        <button
          onClick={() => setOpen(!open)}
          className="px-2 py-1 rounded-lg border border-[var(--color-necl-border)] text-[11px] text-necl-muted hover:border-necl-accent/40 transition-colors hidden lg:block"
        >
          +{overflow}
        </button>
      )}

      {/* Divider */}
      <div className="h-5 w-px bg-[var(--color-necl-border)] hidden xl:block" />

      {/* Slicing filters */}
      <div className="hidden xl:flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-necl-muted flex-shrink-0" />

        {/* Type filter */}
        <select
          value={projectFilters.type ?? 'All Types'}
          onChange={e => setProjectFilters({ type: e.target.value === 'All Types' ? null : e.target.value })}
          className="text-[11px] bg-transparent border border-[var(--color-necl-border)] rounded-lg px-2 py-1 text-necl-muted hover:border-necl-accent/40 cursor-pointer outline-none transition-colors"
        >
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={projectFilters.status ?? ''}
          onChange={e => setProjectFilters({ status: e.target.value || null })}
          className="text-[11px] bg-transparent border border-[var(--color-necl-border)] rounded-lg px-2 py-1 text-necl-muted hover:border-necl-accent/40 cursor-pointer outline-none transition-colors"
        >
          {STATUS_OPTIONS.map(s => <option key={String(s.value)} value={s.value ?? ''}>{s.label}</option>)}
        </select>

        {/* Sort */}
        <select
          value={projectFilters.sortBy}
          onChange={e => setProjectFilters({ sortBy: e.target.value as ProjectFilters['sortBy'] })}
          className="text-[11px] bg-transparent border border-[var(--color-necl-border)] rounded-lg px-2 py-1 text-necl-muted hover:border-necl-accent/40 cursor-pointer outline-none transition-colors"
        >
          {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1 w-[380px] rounded-xl border border-[var(--color-necl-border)] bg-[var(--color-necl-surface)] shadow-2xl z-[100] overflow-hidden"
            style={{ top: '100%' }}
          >
            {/* Dropdown header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-necl-border)]">
              <span className="text-xs font-semibold text-necl-text">Select Projects</span>
              <div className="flex items-center gap-3">
                <button onClick={selectAll} className="text-[11px] text-necl-accent hover:underline font-medium">Select all</button>
                <span className="text-necl-border">·</span>
                <button onClick={clearAll} className="text-[11px] text-necl-muted hover:text-necl-text">Clear</button>
              </div>
            </div>

            {/* Project list */}
            <div className="max-h-72 overflow-y-auto py-1">
              {projects.map(p => {
                const isSelected = selectedProjects.includes(p.id)
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-necl-accent/5',
                      isSelected && 'bg-necl-accent/8',
                    )}
                  >
                    {/* Checkbox */}
                    <div className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                      isSelected ? 'bg-necl-accent border-necl-accent' : 'border-[var(--color-necl-border)]',
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>

                    {/* Type badge */}
                    <span className={cn('text-[9px] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0', TYPE_COLORS[p.type] ?? 'bg-necl-border text-necl-muted')}>
                      {TYPE_ABBR[p.type] ?? '?'}
                    </span>

                    {/* Project info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-necl-text">{p.id}</span>
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_COLORS[p.status])} />
                        <span className="text-[10px] text-necl-muted truncate">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-necl-muted">{p.location}</span>
                        <span className="text-[10px] text-necl-border">·</span>
                        <span className="text-[10px] text-necl-muted">{p.progress}% done</span>
                        {p.scheduleVarianceDays !== 0 && (
                          <>
                            <span className="text-[10px] text-necl-border">·</span>
                            <span className={cn('text-[10px] font-medium', p.scheduleVarianceDays > 0 ? 'text-necl-critical' : 'text-necl-success')}>
                              {p.scheduleVarianceDays > 0 ? `+${p.scheduleVarianceDays}d late` : `${Math.abs(p.scheduleVarianceDays)}d ahead`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Contract value */}
                    <span className="text-[10px] text-necl-muted flex-shrink-0">
                      ₹{(p.budget / 10000000).toFixed(1)}Cr
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[var(--color-necl-border)] flex items-center justify-between">
              <span className="text-[11px] text-necl-muted">{selectedProjects.length} of {ALL_PROJECT_IDS.length} selected</span>
              <button
                onClick={() => setOpen(false)}
                className="text-[11px] text-white bg-necl-accent hover:bg-blue-500 px-3 py-1 rounded-lg font-medium transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
