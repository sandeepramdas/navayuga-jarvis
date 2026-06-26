'use client'

import { Layers } from 'lucide-react'

export function NoProjectsSelected() {
  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[var(--color-necl-border)] bg-[var(--color-necl-surface)]">
      <div className="w-14 h-14 rounded-2xl bg-necl-accent/10 border border-necl-accent/20 flex items-center justify-center mb-5">
        <Layers className="w-7 h-7 text-necl-accent opacity-60" />
      </div>
      <h2 className="text-lg font-bold text-necl-text mb-2">No projects selected</h2>
      <p className="text-sm text-necl-muted max-w-xs text-center leading-relaxed">
        Use the project selector in the toolbar above to choose which projects to display.
      </p>
    </div>
  )
}
