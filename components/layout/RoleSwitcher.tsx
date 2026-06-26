'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useApp } from '@/lib/store'
import { ROLES, type Role } from '@/lib/rbac'
import { cn } from '@/lib/utils'

export function RoleSwitcher() {
  const { role, setRole, addToast } = useApp()
  const [open, setOpen] = useState(false)

  const currentRole = ROLES[role]

  const handleSelect = (r: Role) => {
    if (r !== role) {
      setRole(r)
      addToast({ type: 'info', message: `Scope changed → ${ROLES[r].label} view` })
    }
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm',
          'border-necl-border bg-necl-surface hover:border-necl-accent/50',
          open && 'border-necl-accent/60',
        )}
      >
        <div className="w-5 h-5 rounded-full bg-necl-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-bold text-necl-accent">{currentRole.name.split(' ').map(n => n[0]).join('')}</span>
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-[11px] font-semibold text-necl-text leading-none">{currentRole.label}</span>
          <span className="text-[9px] text-necl-muted leading-none mt-0.5">{currentRole.name}</span>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-necl-muted transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-necl-border bg-necl-surface shadow-2xl overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-necl-border">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-necl-muted">Switch Role / Scope</p>
              </div>
              {(Object.values(ROLES) as (typeof ROLES)[Role][]).map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r.id)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 hover:bg-necl-bg transition-colors text-left',
                    role === r.id && 'bg-necl-accent/5',
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-necl-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-necl-accent">{r.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-necl-text">{r.label}</span>
                      {role === r.id && <Check className="w-3.5 h-3.5 text-necl-accent" />}
                    </div>
                    <span className="text-[11px] text-necl-muted">{r.name}</span>
                    <p className="text-[10px] text-necl-muted mt-0.5 leading-snug truncate">{r.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
