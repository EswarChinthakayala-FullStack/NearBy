import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeJsonParse<T>(data: string | null | undefined, fallback: T): T {
  if (!data) return fallback
  try {
    return JSON.parse(data) as T
  } catch {
    return fallback
  }
}

export function formatDate(date?: string | Date | number | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}
