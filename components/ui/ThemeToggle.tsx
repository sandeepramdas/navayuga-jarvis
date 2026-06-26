'use client'

import { Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme } = useApp()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex items-center gap-1.5 w-[72px] h-8 rounded-full border px-1 transition-colors duration-300',
        isDark
          ? 'bg-necl-border border-necl-border'
          : 'bg-blue-100 border-blue-200',
      )}
    >
      {/* Track icons */}
      <Moon className={cn('w-3.5 h-3.5 transition-colors duration-200', isDark ? 'text-necl-accent' : 'text-necl-muted')} />
      <Sun className={cn('w-3.5 h-3.5 transition-colors duration-200', isDark ? 'text-necl-muted' : 'text-amber-500')} />

      {/* Sliding thumb */}
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={cn(
          'absolute top-1 w-6 h-6 rounded-full shadow-sm flex items-center justify-center',
          isDark ? 'bg-necl-accent left-1' : 'bg-white left-[38px]',
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="w-3 h-3 text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -30, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="w-3 h-3 text-amber-500" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </button>
  )
}
