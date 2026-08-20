import { THEME_KEYS } from './constants'

export type ThemeMode = typeof THEME_KEYS[keyof typeof THEME_KEYS]

export const BRAND_COLORS = {
  emerald: '#10B981',
  emeraldDark: '#047857',
  amber: '#F59E0B',
  rose: '#DC2626',
  zincLight: '#FAFAFA',
  zincDark: '#09090B',
} as const

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export default {
  BRAND_COLORS,
  getSystemTheme,
}
