'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, UserCheck, AlertTriangle } from 'lucide-react'
import { cn, timeAgo } from '@/lib/utils'
import { useApp } from '@/lib/store'
import { SeverityChip } from './SeverityChip'
import type { Alert } from '@/lib/mock-data/alerts'

interface DrawerDetailProps {
  alert: Alert | null
  onClose: () => void
}

export function DrawerDetail({ alert, onClose }: DrawerDetailProps) {
  const { alertStates, setAlertState, addToast } = useApp()

  const handleAcknowledge = () => {
    if (!alert) return
    setAlertState(alert.id, 'acknowledged')
    addToast({ type: 'success', message: `Alert acknowledged: ${alert.title}` })
  }

  const handleResolve = () => {
    if (!alert) return
    setAlertState(alert.id, 'resolved')
    addToast({ type: 'success', message: `Alert marked as resolved` })
    onClose()
  }

  return (
    <AnimatePresence>
      {alert && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-lg bg-necl-surface border-l border-necl-border shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-necl-surface border-b border-necl-border px-6 py-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <SeverityChip severity={alert.severity} />
                  <span className="text-[11px] text-necl-muted">{timeAgo(alert.timestamp)}</span>
                </div>
                <h2 className="text-base font-bold text-necl-text leading-snug">{alert.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-necl-border transition-colors text-necl-muted hover:text-necl-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Entity & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-1">Affected Entity</p>
                  <p className="text-sm font-semibold text-necl-text">{alert.affectedEntity}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-1">Department</p>
                  <p className="text-sm font-semibold text-necl-text capitalize">{alert.department}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-2">Description</p>
                <p className="text-sm text-necl-text leading-relaxed">{alert.description}</p>
              </div>

              {/* Evidence */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-2">Evidence</p>
                <div className="space-y-2">
                  {alert.evidenceBullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-necl-bg border border-necl-border">
                      <span className="text-necl-accent text-xs mt-0.5 flex-shrink-0">·</span>
                      <p className="text-xs text-necl-text leading-relaxed">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Predicted impact */}
              {alert.predictedImpact && (
                <div className="p-4 rounded-lg border border-necl-warning/30 bg-necl-warning/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-necl-warning" />
                    <p className="text-xs font-semibold text-necl-warning">Predicted Impact</p>
                  </div>
                  <p className="text-xs text-necl-text">{alert.predictedImpact}</p>
                </div>
              )}

              {/* Actions */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-3">Actions</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAcknowledge}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-necl-accent text-necl-accent hover:bg-necl-accent hover:text-white text-sm font-semibold transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Acknowledge
                  </button>
                  <button
                    onClick={handleResolve}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-necl-success hover:bg-green-500 text-white text-sm font-semibold transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Resolve
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
