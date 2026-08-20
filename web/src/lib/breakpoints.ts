import { BREAKPOINTS } from './constants'

export type BreakpointKey = keyof typeof BREAKPOINTS

export function isBreakpointActive(breakpoint: BreakpointKey): boolean {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  const minWidth = BREAKPOINTS[breakpoint]
  return width >= minWidth
}

export const MEDIA_QUERIES = {
  sm: `(min-width: ${BREAKPOINTS.SM}px)`,
  md: `(min-width: ${BREAKPOINTS.MD}px)`,
  lg: `(min-width: ${BREAKPOINTS.LG}px)`,
  xl: `(min-width: ${BREAKPOINTS.XL}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2XL']}px)`,
} as const

export default {
  BREAKPOINTS,
  isBreakpointActive,
  MEDIA_QUERIES,
}
