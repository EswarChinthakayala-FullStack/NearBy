import { type Variants, useReducedMotion } from 'framer-motion'

/**
 * Standard Easing functions for natural, fluid motion
 */
export const EASINGS = {
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  springSmooth: { type: 'spring', stiffness: 300, damping: 30 },
  springSnappy: { type: 'spring', stiffness: 400, damping: 25 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 20 },
} as const

/**
 * Custom Hook to get reduced motion aware variants or duration
 */
export function useMotionSettings() {
  const shouldReduceMotion = useReducedMotion()
  return {
    shouldReduceMotion,
    transition: shouldReduceMotion
      ? { duration: 0.05 }
      : { duration: 0.25, ease: EASINGS.easeOut },
  }
}

/** Fade Animations */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: EASINGS.easeOut } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

export const fadeOut: Variants = {
  initial: { opacity: 1 },
  animate: { opacity: 0, transition: { duration: 0.2 } },
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASINGS.easeOut } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.18 } },
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: EASINGS.easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

export const fadeLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: EASINGS.easeOut } },
  exit: { opacity: 0, x: 10, transition: { duration: 0.18 } },
}

export const fadeRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: EASINGS.easeOut } },
  exit: { opacity: 0, x: -10, transition: { duration: 0.18 } },
}

/** Scale Animations */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: EASINGS.springSnappy },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

export const scaleOut: Variants = {
  initial: { opacity: 1, scale: 1 },
  animate: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

/** Stagger Containers & Children */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
}

export const staggerChildren: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASINGS.easeOut } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
}

export const gridReveal = staggerContainer
export const listReveal = staggerContainer
export const staggerContainerVariants = staggerContainer
export const staggerItemVariants = staggerChildren

/** Hover & Micro-interactions */
export const cardHover: Variants = {
  initial: { y: 0, scale: 1 },
  hover: { y: -3, scale: 1.005, transition: EASINGS.springSmooth },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
}

export const cardHoverVariants = cardHover

export const buttonHover: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.12 } },
  tap: { scale: 0.97, transition: { duration: 0.08 } },
}

export const buttonPressVariants = buttonHover

export const pulseOnce: Variants = {
  initial: { scale: 1 },
  animate: { scale: [1, 1.15, 0.95, 1], transition: { duration: 0.4 } },
}

export const favoritePulseVariants: Variants = {
  initial: { scale: 1 },
  liked: {
    scale: [1, 1.35, 0.9, 1.15, 1],
    transition: {
      duration: 0.45,
      times: [0, 0.3, 0.5, 0.75, 1],
      ease: 'easeOut',
    },
  },
  unliked: {
    scale: [1, 0.85, 1],
    transition: { duration: 0.2 },
  },
}

/** Page & Modal / Dialog / Drawer / Tooltip Animations */
export const pageTransitionVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASINGS.easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: EASINGS.easeOut } },
}

export const pageTransition = pageTransitionVariants

export const modalAnimation: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0, transition: EASINGS.springSnappy },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.15 } },
}

export const dialogAnimation = modalAnimation
export const modalVariants = modalAnimation

export const drawerAnimation: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: EASINGS.springSmooth },
  exit: { y: '100%', transition: { duration: 0.2 } },
}

export const tooltipAnimation: Variants = {
  initial: { opacity: 0, scale: 0.92, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.15, ease: EASINGS.easeOut } },
  exit: { opacity: 0, scale: 0.92, y: 2, transition: { duration: 0.1 } },
}

export const sheetSlideVariants = {
  right: {
    initial: { x: '100%' },
    animate: { x: 0, transition: EASINGS.springSmooth },
    exit: { x: '100%', transition: { duration: 0.2 } },
  },
  bottom: drawerAnimation,
}

export const toastVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: EASINGS.springSmooth },
  exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } },
}

/** Card Shake Animation for Error Feedback */
export const cardShake: Variants = {
  initial: { x: 0 },
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.35, ease: 'easeInOut' },
  },
}

