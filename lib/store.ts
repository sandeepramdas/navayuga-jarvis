'use client'

import { createContext, useContext } from 'react'
import type { Role } from './rbac'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
}

export type Theme = 'dark' | 'light'

export interface AppState {
  role: Role
  setRole: (role: Role) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  jarvisPanelOpen: boolean
  setJarvisPanelOpen: (open: boolean) => void
  toasts: ToastItem[]
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  recommendationStates: Record<string, 'approved' | 'dismissed' | 'assigned'>
  setRecommendationState: (id: string, state: 'approved' | 'dismissed' | 'assigned') => void
  alertStates: Record<string, 'acknowledged' | 'resolved' | 'dismissed'>
  setAlertState: (id: string, state: 'acknowledged' | 'resolved' | 'dismissed') => void
}

export const AppContext = createContext<AppState | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
