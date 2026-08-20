import { useReducedMotion } from 'framer-motion'

/**
 * Enterprise accessibility hook for prefers-reduced-motion settings.
 * Returns safe transition configurations, duration overrides, and motion flags.
 */
export function useAppReducedMotion() {
  const shouldReduceMotion = useReducedMotion()

  return {
    shouldReduceMotion: !!shouldReduceMotion,
    duration: shouldReduceMotion ? 0.05 : 0.25,
    staggerDelay: shouldReduceMotion ? 0 : 0.06,
    transition: shouldReduceMotion
      ? { duration: 0.05 }
      : { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    hoverScale: shouldReduceMotion ? 1 : 1.02,
    tapScale: shouldReduceMotion ? 1 : 0.98,
  }
}

export default useAppReducedMotion
