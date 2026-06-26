'use client'

import { Sparkles } from 'lucide-react'
import { suggestedPrompts } from '@/lib/mock-data/jarvis-answers'

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void
  limit?: number
}

export function SuggestedPrompts({ onSelect, limit = 4 }: SuggestedPromptsProps) {
  const displayPrompts = suggestedPrompts.slice(0, limit)

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-necl-muted flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-necl-accent" />
        Suggested Questions
      </p>
      {displayPrompts.map((prompt, i) => (
        <button
          key={i}
          onClick={() => onSelect(prompt)}
          className="w-full text-left px-3 py-2.5 rounded-lg border border-necl-border bg-necl-bg hover:border-necl-accent/50 hover:bg-necl-accent/5 transition-all text-xs text-necl-text leading-relaxed group"
        >
          <span className="text-necl-accent mr-1.5 group-hover:text-necl-accent">→</span>
          {prompt}
        </button>
      ))}
    </div>
  )
}
