'use client'

import { usePathname } from 'next/navigation'
import { Menu, Search, Bell, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/store'
import { ROLES } from '@/lib/rbac'
import { RoleSwitcher } from './RoleSwitcher'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'
import { getAlertsSummary } from '@/lib/mock-data/alerts'

const breadcrumbMap: Record<string, string> = {
  '/command-center': 'Command Center',
  '/operations': 'Operations',
  '/procurement': 'Procurement',
  '/fleet': 'Fleet',
  '/finance': 'Finance',
  '/hr': 'HR',
  '/jarvis': 'Jarvis AI',
  '/alerts': 'Alerts',
  '/predictive': 'Predictive Hub',
  '/team': 'Team KPI',
  '/governance': 'Governance',
}

const alertsSummary = getAlertsSummary()

export function TopBar() {
  const { sidebarOpen, setSidebarOpen, role, setJarvisPanelOpen, jarvisPanelOpen } = useApp()
  const pathname = usePathname()
  const currentRole = ROLES[role]

  const currentPage = Object.entries(breadcrumbMap).find(([key]) => pathname.endsWith(key))?.[1] ?? 'Command Center'
  const isProjectPage = pathname.includes('/project/')
  const pageLabel = isProjectPage ? 'Project Site' : currentPage

  return (
    <header className="fixed top-0 right-0 z-40 h-16 flex items-center border-b border-necl-border bg-necl-surface/95 backdrop-blur-sm px-4 gap-4 transition-all"
      style={{ left: sidebarOpen ? '220px' : '64px' }}
    >
      {/* Hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-lg text-necl-muted hover:text-necl-text hover:bg-necl-border transition-colors flex-shrink-0"
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
            Scoped to: Kaleshwaram Dam Support Pkg-B
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-necl-border bg-necl-bg text-necl-muted hover:border-necl-accent/50 transition-colors cursor-pointer">
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm">Search projects, alerts, documents...</span>
        <span className="ml-auto text-[10px] text-necl-muted bg-necl-border px-1.5 py-0.5 rounded">⌘K</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Alerts bell */}
        <button className="relative p-2 rounded-lg text-necl-muted hover:text-necl-text hover:bg-necl-border transition-colors">
          <Bell className="w-5 h-5" />
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
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            jarvisPanelOpen
              ? 'bg-necl-accent text-white'
              : 'border border-necl-border text-necl-muted hover:border-necl-accent/60 hover:text-necl-accent',
          )}
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:block">Jarvis</span>
        </button>

        {/* Role switcher */}
        <RoleSwitcher />
      </div>
    </header>
  )
}
