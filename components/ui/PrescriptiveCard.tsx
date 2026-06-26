'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, UserCheck, ChevronDown, ChevronUp, TrendingUp, IndianRupee } from 'lucide-react'
import { cn, formatINR } from '@/lib/utils'
import { useApp } from '@/lib/store'
import type { Recommendation } from '@/lib/mock-data/predictions'

interface PrescriptiveCardProps {
  recommendation: Recommendation
}

const deptColors: Record<string, string> = {
  Procurement: 'bg-necl-warning/15 text-necl-warning',
  Fleet: 'bg-blue-500/15 text-blue-400',
  Finance: 'bg-purple-500/15 text-purple-400',
  HR: 'bg-pink-500/15 text-pink-400',
  Operations: 'bg-necl-success/15 text-necl-success',
  Safety: 'bg-orange-500/15 text-orange-400',
}

export function PrescriptiveCard({ recommendation }: PrescriptiveCardProps) {
  const { recommendationStates, setRecommendationState, addToast, role } = useApp()
  const [expanded, setExpanded] = useState(false)

  const state = recommendationStates[recommendation.id]
  const canApprove = role === 'md' || role === 'fleet-head'

  const handleApprove = () => {
    setRecommendationState(recommendation.id, 'approved')
    addToast({
      type: 'success',
      message: `Recommendation approved & assigned to ${recommendation.assignTo}`,
    })
  }

  const handleDismiss = () => {
    setRecommendationState(recommendation.id, 'dismissed')
    addToast({
      type: 'info',
      message: 'Recommendation dismissed',
    })
  }

  const handleAssign = () => {
    setRecommendationState(recommendation.id, 'assigned')
    addToast({
      type: 'info',
      message: `Assigned to ${recommendation.assignTo} for review`,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-necl-border bg-necl-surface p-5 flex flex-col',
        state === 'approved' && 'border-necl-success/40',
        state === 'dismissed' && 'opacity-50',
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
              deptColors[recommendation.department] ?? 'bg-necl-muted/15 text-necl-muted',
            )}>
              {recommendation.department}
            </span>
            {state === 'approved' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-necl-success/15 text-necl-success flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                Approved
              </span>
            )}
            {state === 'assigned' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-necl-accent/15 text-necl-accent flex items-center gap-1">
                <UserCheck className="w-2.5 h-2.5" />
                Assigned
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-necl-text leading-snug">{recommendation.title}</p>
        </div>
        <span className="text-[10px] font-bold text-necl-muted bg-necl-border rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
          #{recommendation.priority}
        </span>
      </div>

      {/* Impact */}
      <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-necl-success/5 border border-necl-success/20">
        <TrendingUp className="w-3.5 h-3.5 text-necl-success flex-shrink-0" />
        <span className="text-xs font-semibold text-necl-success">{recommendation.expectedImpact}</span>
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-necl-muted">Model confidence</span>
          <span className="text-[10px] font-bold text-necl-text">{recommendation.confidence}%</span>
        </div>
        <div className="w-full h-1 bg-necl-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-necl-accent"
            initial={{ width: 0 }}
            animate={{ width: `${recommendation.confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Why? expander */}
      <button
        className="flex items-center justify-between w-full text-[11px] text-necl-muted hover:text-necl-text transition-colors mb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium">Why this recommendation?</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3"
          >
            <div className="space-y-1.5 pt-1">
              {recommendation.evidenceBullets.map((bullet, i) => (
                <p key={i} className="text-[11px] text-necl-muted leading-relaxed">
                  <span className="text-necl-accent mr-1.5">·</span>
                  {bullet}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign to */}
      <p className="text-[11px] text-necl-muted mb-3">
        Assign to: <span className="text-necl-text font-medium">{recommendation.assignTo}</span>
      </p>

      {/* Actions */}
      {!state && canApprove && (
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={handleApprove}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-necl-accent hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={handleAssign}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-necl-border hover:border-necl-accent text-necl-muted hover:text-necl-accent text-xs font-semibold transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Assign
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 rounded-lg border border-necl-border hover:border-necl-critical hover:text-necl-critical text-necl-muted text-xs font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {!state && !canApprove && (
        <div className="mt-auto">
          <button
            onClick={handleAssign}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-necl-border hover:border-necl-accent text-necl-muted hover:text-necl-accent text-xs font-semibold transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Request Approval
          </button>
        </div>
      )}
      {state === 'approved' && (
        <div className="flex items-center gap-2 mt-auto p-2.5 rounded-lg bg-necl-success/10 border border-necl-success/30">
          <Check className="w-4 h-4 text-necl-success" />
          <span className="text-xs font-medium text-necl-success">Approved & sent to {recommendation.assignTo}</span>
        </div>
      )}
    </motion.div>
  )
}
