'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AppContext } from './store'
import type { ToastItem, Theme } from './store'
import type { Role } from './rbac'

let toastCounter = 0

const LIGHT_VARS: Record<string, string> = {
  '--color-necl-bg':      '#F1F5F9',
  '--color-necl-surface': '#FFFFFF',
  '--color-necl-border':  '#E2E8F0',
  '--color-necl-muted':   '#64748B',
  '--color-necl-text':    '#0F172A',
}

function applyThemeToDom(t: Theme) {
  const root = document.documentElement
  if (t === 'light') {
    root.classList.remove('dark')
    Object.entries(LIGHT_VARS).forEach(([k, v]) => root.style.setProperty(k, v))
  } else {
    root.classList.add('dark')
    Object.keys(LIGHT_VARS).forEach(k => root.style.removeProperty(k))
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('md')
  const [theme, setThemeState] = useState<Theme>('dark')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [jarvisPanelOpen, setJarvisPanelOpen] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [recommendationStates, setRecommendationStates] = useState<Record<string, 'approved' | 'dismissed' | 'assigned'>>({})
  const [alertStates, setAlertStates] = useState<Record<string, 'acknowledged' | 'resolved' | 'dismissed'>>({})

  // On mount: read saved theme and apply it to DOM
  useEffect(() => {
    const stored = (localStorage.getItem('necl-theme') as Theme) || 'dark'
    setThemeState(stored)
    applyThemeToDom(stored)
  }, [])

  const setRole = useCallback((r: Role) => setRoleState(r), [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    localStorage.setItem('necl-theme', t)
    applyThemeToDom(t)
  }, [])

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    toastCounter += 1
    const id = `toast-${toastCounter}`
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const setRecommendationState = useCallback((id: string, state: 'approved' | 'dismissed' | 'assigned') => {
    setRecommendationStates(prev => ({ ...prev, [id]: state }))
  }, [])

  const setAlertState = useCallback((id: string, state: 'acknowledged' | 'resolved' | 'dismissed') => {
    setAlertStates(prev => ({ ...prev, [id]: state }))
  }, [])

  return (
    <AppContext.Provider value={{
      role, setRole,
      theme, setTheme,
      sidebarOpen, setSidebarOpen,
      jarvisPanelOpen, setJarvisPanelOpen,
      toasts, addToast, removeToast,
      recommendationStates, setRecommendationState,
      alertStates, setAlertState,
    }}>
      {children}
    </AppContext.Provider>
  )
}
