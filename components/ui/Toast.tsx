'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { ToastItem } from '@/lib/store'

const toastConfig: Record<ToastItem['type'], { icon: React.ElementType; className: string }> = {
  success: { icon: CheckCircle, className: 'border-necl-success/40 bg-necl-success/10 text-necl-success' },
  warning: { icon: AlertTriangle, className: 'border-necl-warning/40 bg-necl-warning/10 text-necl-warning' },
  error: { icon: AlertCircle, className: 'border-necl-critical/40 bg-necl-critical/10 text-necl-critical' },
  info: { icon: Info, className: 'border-necl-accent/40 bg-necl-accent/10 text-necl-accent' },
}

function ToastItem({ toast }: { toast: ToastItem }) {
  const { removeToast } = useApp()
  const config = toastConfig[toast.type]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl min-w-[280px] max-w-sm',
        'bg-necl-surface',
        config.className,
      )}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="text-sm font-medium text-necl-text flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-necl-muted hover:text-necl-text transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const { toasts } = useApp()

  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
