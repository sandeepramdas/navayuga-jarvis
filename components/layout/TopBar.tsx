'use client'

import { usePathname } from 'next/navigation'
import { Menu, Search, Bell, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/store'
import { ROLES } from '@/lib/rbac'
import { RoleSwitcher } from './RoleSwitcher'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ProjectSelector } from '@/components/ui/ProjectSelector'
import { cn } from '@/lib/utils'
import { getAlertsSummary } from '@/lib/mock-data/alerts'

const breadcrumbMap: Record<string, string> = {
  '/command-center': 'Command Center',
  '/operations':     'Operations',
  '/procurement':    'Procurement',
  '/fleet':          'Fleet',
  '/finance':        'Finance',
  '/hr':             'HR',
  '/jarvis':         'Jarvis AI',
  '/alerts':         'Alerts',
  '/predictive':     'Predictive Hub',
  '/team':           'Team KPI',
  '/governance':     'Governance',
  '/orchestration':  'Orchestration',
  '/project':        'Project Sites',
}

const alertsSummary = getAlertsSummary()

export function TopBar() {
  const { sidebarOpen, setSidebarOpen, role, setJarvisPanelOpen, jarvisPanelOpen } = useApp()
  const pathname = usePathname()
  const currentRole = ROLES[role]

  const isProjectDetail = /\/project\/[^/]+$/.test(pathname)
  const isProjectIndex  = pathname === '/project'
  const currentPage = Object.entries(breadcrumbMap).find(([key]) => pathname === key || pathname.startsWith(key + '/'))?.[1] ?? 'Command Center'
  const pageLabel = isProjectDetail ? 'Project Site' : currentPage

  return (
    <header
      className="fixed top-0 right-0 z-40 flex flex-col border-b border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]/95 backdrop-blur-sm transition-all"
      style={{ left: sidebarOpen ? '220px' : '64px' }}
    >
      {/* Row 1: main nav bar */}
      <div className="h-14 flex items-center px-4 gap-4">
        {/* Hamburger */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-necl-muted hover:text-necl-text hover:bg-[var(--color-necl-border)] transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-necl-muted hidden sm:block">NECL Jarvis</span>
          <span className="text-necl-muted hidden sm:block">›</span>
          <span className="text-sm font-semibold text-necl-text">{pageLabel}</span>
        </div>

        {/* Role scope banner (site manager) */}
        <AnimatePresence>
          {role === 'site-manager' && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full border border-necl-warning/40 bg-necl-warning/10 text-necl-warning text-[11px] font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-necl-warning flex-shrink-0" />
              Scoped to: KDSP-B1
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="flex-1 max-w-sm hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-necl-border)] bg-[var(--color-necl-bg)] text-necl-muted hover:border-necl-accent/50 transition-colors cursor-pointer">
          <Search className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-xs">Search projects, alerts...</span>
          <span className="ml-auto text-[10px] text-necl-muted bg-[var(--color-necl-border)] px-1.5 py-0.5 rounded">⌘K</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />

          {/* Alerts bell */}
          <button className="relative p-1.5 rounded-lg text-necl-muted hover:text-necl-text hover:bg-[var(--color-necl-border)] transition-colors">
            <Bell className="w-4 h-4" />
            {alertsSummary.critical > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-necl-critical text-[9px] font-bold text-white flex items-center justify-center animate-pulse-glow">
                {alertsSummary.critical}
              </span>
            )}
          </button>

          {/* Jarvis button */}
          <button
            onClick={() => setJarvisPanelOpen(!jarvisPanelOpen)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              jarvisPanelOpen
                ? 'bg-necl-accent text-white'
                : 'border border-[var(--color-necl-border)] text-necl-muted hover:border-necl-accent/60 hover:text-necl-accent',
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Jarvis</span>
          </button>

          <RoleSwitcher />
        </div>
      </div>

      {/* Row 2: project filter bar */}
      <div className="h-10 flex items-center px-4 border-t border-[var(--color-necl-border)]/60 bg-[var(--color-necl-bg)]/40 relative">
        <ProjectSelector />
      </div>
    </header>
  )
}
