import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from './Icon'
import { modalVariants } from '@/lib/motion-variants'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected issue while retrieving data. Please check your connection or try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) => {
  return (
    <motion.div
      variants={modalVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center rounded-sm border border-destructive/20 bg-destructive/5 px-6 py-12 text-center backdrop-blur-xs ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-destructive/10 text-destructive border border-destructive/30 shadow-xs mb-4">
        <Icon name="error" size="xl" />
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground mb-6 leading-relaxed">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded-sm bg-destructive px-4 py-2.5 text-xs font-semibold text-destructive-foreground shadow-sm transition-all hover:bg-red-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-destructive"
        >
          <Icon name="refresh" size="xs" />
          <span>{retryLabel}</span>
        </button>
      )}
    </motion.div>
  )
}
