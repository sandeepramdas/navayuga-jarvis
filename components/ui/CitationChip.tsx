'use client'

import { FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Citation } from '@/lib/mock-data/jarvis-answers'

interface CitationChipProps {
  citation: Citation
  index: number
  className?: string
}

export function CitationChip({ citation, index, className }: CitationChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-necl-accent/30 bg-necl-accent/10 text-necl-accent',
        className,
      )}
    >
      <FileText className="w-3 h-3 flex-shrink-0" />
      <span className="text-[11px] font-medium">[{index + 1}] {citation.label}</span>
      <span className="text-[10px] text-necl-muted truncate max-w-[140px]">· {citation.source}</span>
    </div>
  )
}
