'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot } from 'lucide-react'
import { useApp } from '@/lib/store'
import { ChatInterface } from '@/components/jarvis/ChatInterface'
import { cn } from '@/lib/utils'

export function JarvisSidePanel() {
  const { jarvisPanelOpen, setJarvisPanelOpen } = useApp()

  return (
    <>
      {/* Tab button (collapsed state) */}
      <AnimatePresence>
        {!jarvisPanelOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setJarvisPanelOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] flex items-center justify-center w-10 h-20 bg-necl-accent rounded-l-xl shadow-2xl glow-blue group transition-all hover:w-12"
          >
            <div className="flex flex-col items-center gap-1">
              <Bot className="w-4 h-4 text-white" />
              <span className="text-[9px] font-bold text-white/80 writing-vertical rotate-90">JARVIS</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Side panel */}
      <AnimatePresence>
        {jarvisPanelOpen && (
          <>
            {/* Backdrop (mobile) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[59] bg-black/40 lg:hidden"
              onClick={() => setJarvisPanelOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[60] w-[380px] flex flex-col bg-necl-surface border-l border-necl-border shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 h-16 px-4 border-b border-necl-border flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-necl-accent flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-necl-text">Jarvis AI</p>
                  <p className="text-[10px] text-necl-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-necl-success inline-block animate-pulse" />
                    Live data connected
                  </p>
                </div>
                <button
                  onClick={() => setJarvisPanelOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-necl-border transition-colors text-necl-muted hover:text-necl-text"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat */}
              <div className="flex-1 overflow-hidden p-4">
                <ChatInterface compact />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
