'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronDown, ChevronUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CitationChip } from '@/components/ui/CitationChip'
import { MiniChart } from '@/components/ui/MiniChart'
import type { JarvisQA } from '@/lib/mock-data/jarvis-answers'

interface GroundedAnswerProps {
  qa: JarvisQA
}

function renderAnswer(text: string) {
  const lines = text.split('\n\n')
  return lines.map((para, i) => {
    const boldProcessed = para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-necl-text font-semibold">$1</strong>')
    return (
      <p
        key={i}
        className="text-sm text-necl-muted leading-relaxed mb-3 last:mb-0"
        dangerouslySetInnerHTML={{ __html: boldProcessed }}
      />
    )
  })
}

export function GroundedAnswer({ qa }: GroundedAnswerProps) {
  const [chartExpanded, setChartExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-necl-border bg-necl-surface overflow-hidden"
    >
      {/* Jarvis header bar */}
      <div className="flex items-center gap-3 px-5 py-3 bg-necl-accent/10 border-b border-necl-accent/20">
        <div className="w-7 h-7 rounded-full bg-necl-accent flex items-center justify-center flex-shrink-0">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-necl-accent">Jarvis AI</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-necl-success" />
              <span className="text-[10px] font-bold text-necl-success">{qa.confidence}% confidence</span>
            </div>
            <span className="text-[10px] text-necl-warning bg-necl-warning/10 px-2 py-0.5 rounded-full border border-necl-warning/30">
              {qa.warningLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Answer */}
      <div className="px-5 py-4">
        {renderAnswer(qa.answer)}
      </div>

      {/* Chart (collapsible) */}
      {qa.chartData && qa.chartType !== 'none' && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setChartExpanded(!chartExpanded)}
            className="flex items-center gap-2 text-[11px] text-necl-accent hover:text-blue-400 font-medium mb-2 transition-colors"
          >
            {chartExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {chartExpanded ? 'Hide' : 'Show'} supporting data
          </button>
          {chartExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <MiniChart
                data={qa.chartData}
                type={qa.chartType}
                title={qa.chartTitle ?? ''}
                height={160}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Recommended action */}
      {qa.recommendedAction && (
        <div className="mx-5 mb-4 p-3.5 rounded-lg border border-necl-success/30 bg-necl-success/5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-necl-success mb-1.5">Recommended Action</p>
          <p className="text-xs text-necl-text leading-relaxed">{qa.recommendedAction}</p>
        </div>
      )}

      {/* Citations */}
      <div className="px-5 pb-4 border-t border-necl-border pt-3">
        <p className="text-[10px] uppercase tracking-widest text-necl-muted mb-2">Sources</p>
        <div className="flex flex-wrap gap-2">
          {qa.citations.map((c, i) => (
            <CitationChip key={i} citation={c} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
