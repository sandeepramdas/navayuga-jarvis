'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  Layers,
  ShoppingCart,
  Truck,
  IndianRupee,
  Users,
  MapPin,
  Bot,
  Bell,
  TrendingUp,
  BarChart2,
  Shield,
  ChevronRight,
  GitBranch,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/lib/store'

const navItems = [
  { href: '/command-center', icon: Home,        label: 'Command Center', group: 'main' },
  { href: '/operations',     icon: Layers,       label: 'Operations',     group: 'main' },
  { href: '/orchestration',  icon: GitBranch,    label: 'Orchestration',  group: 'main' },
  { href: '/procurement',    icon: ShoppingCart, label: 'Procurement',    group: 'main' },
  { href: '/fleet',          icon: Truck,        label: 'Fleet',          group: 'main' },
  { href: '/finance',        icon: IndianRupee,  label: 'Finance',        group: 'main' },
  { href: '/hr',             icon: Users,        label: 'HR',             group: 'main' },
  { divider: true, group: 'secondary' },
  { href: '/project',        icon: MapPin,       label: 'Project Sites',  group: 'secondary' },
  { href: '/jarvis',         icon: Bot,          label: 'Jarvis AI',      group: 'secondary' },
  { href: '/alerts',         icon: Bell,         label: 'Alerts',         group: 'secondary' },
  { href: '/predictive',     icon: TrendingUp,   label: 'Predictive',     group: 'secondary' },
  { href: '/team',           icon: BarChart2,    label: 'Team KPI',       group: 'secondary' },
  { href: '/governance',     icon: Shield,       label: 'Governance',     group: 'secondary' },
]

export function Sidebar() {
  const { sidebarOpen } = useApp()
  const pathname = usePathname()

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 220 : 64 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-[var(--color-necl-surface)] border-r border-[var(--color-necl-border)] overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center border-b border-[var(--color-necl-border)] px-4 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-necl-accent flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-black">N</span>
        </div>
        <motion.div
          animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
          className="overflow-hidden ml-3"
        >
          <div className="whitespace-nowrap">
            <p className="text-sm font-bold text-necl-text tracking-wider">NAVAYUGA</p>
            <p className="text-[9px] text-necl-muted tracking-widest">NECL JARVIS</p>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item, idx) => {
          if ('divider' in item && item.divider) {
            return (
              <div key={`div-${idx}`} className="mx-3 my-2 border-t border-[var(--color-necl-border)]" />
            )
          }

          const navItem = item as { href: string; icon: React.ElementType; label: string }
          const Icon = navItem.icon
          const isActive = pathname === navItem.href || (navItem.href !== '/command-center' && pathname.startsWith(navItem.href))

          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={cn(
                'flex items-center gap-3 mx-2 px-2.5 py-2.5 rounded-lg transition-all group',
                isActive
                  ? 'bg-necl-accent text-white'
                  : 'text-necl-muted hover:bg-[var(--color-necl-bg)] hover:text-necl-text',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : '')} />
              <motion.span
                animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
                className="overflow-hidden whitespace-nowrap text-sm font-medium"
              >
                {navItem.label}
              </motion.span>
              {isActive && sidebarOpen && (
                <motion.div className="ml-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                </motion.div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--color-necl-border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-necl-success animate-pulse flex-shrink-0" />
          <motion.span
            animate={{ opacity: sidebarOpen ? 1 : 0, width: sidebarOpen ? 'auto' : 0 }}
            className="overflow-hidden whitespace-nowrap text-[10px] text-necl-muted"
          >
            All systems live
          </motion.span>
        </div>
      </div>
    </motion.aside>
  )
}
