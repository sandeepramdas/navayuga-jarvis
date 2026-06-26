'use client'

import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'
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
        'relative flex items-center justify-between w-[60px] h-8 rounded-full border px-2 transition-colors duration-300',
        isDark
          ? 'bg-[var(--color-necl-border)] border-[var(--color-necl-border)]'
          : 'bg-blue-100 border-blue-200',
      )}
    >
      {/* Static track icons */}
      <Moon className={cn('w-3.5 h-3.5 relative z-10 transition-colors duration-200', isDark ? 'text-necl-accent' : 'text-slate-400')} />
      <Sun className={cn('w-3.5 h-3.5 relative z-10 transition-colors duration-200', isDark ? 'text-slate-500' : 'text-amber-500')} />

      {/* Sliding thumb — no icon inside, just a circle */}
      <motion.span
        animate={{ x: isDark ? 0 : 28 }}
        initial={false}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className={cn(
          'absolute left-1 top-1 w-6 h-6 rounded-full shadow-sm',
          isDark ? 'bg-necl-accent' : 'bg-white',
        )}
      />
    </button>
  )
}
