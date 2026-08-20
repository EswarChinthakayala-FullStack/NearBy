import React, { type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { pageTransitionVariants } from '@/lib/motion-variants'

export interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransitionVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
