import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian currency (Crores / Lakhs)
 * e.g. 84500000 → ₹8.45Cr, 1840000 → ₹18.4L
 */
export function formatINR(value: number, compact = true): string {
  if (!compact) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
  }
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (absValue >= 10_000_000) {
    return `${sign}₹${(absValue / 10_000_000).toFixed(2)}Cr`
  }
  if (absValue >= 100_000) {
    return `${sign}₹${(absValue / 100_000).toFixed(2)}L`
  }
  if (absValue >= 1_000) {
    return `${sign}₹${(absValue / 1_000).toFixed(1)}K`
  }
  return `${sign}₹${absValue.toFixed(0)}`
}

/**
 * Format a date string or Date to dd MMM yyyy
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Format a date to relative time (e.g. "2h ago")
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date('2025-06-26T10:00:00')
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Status color mapping
 */
export function statusColor(status: string): string {
  const map: Record<string, string> = {
    'on-track': 'text-necl-success',
    'at-risk': 'text-necl-warning',
    'delayed': 'text-necl-critical',
    'active': 'text-necl-success',
    'idle': 'text-necl-muted',
    'maintenance': 'text-necl-warning',
    'received': 'text-necl-success',
    'approved': 'text-necl-accent',
    'pending': 'text-necl-warning',
    'delayed-po': 'text-necl-critical',
  }
  return map[status] ?? 'text-necl-muted'
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
