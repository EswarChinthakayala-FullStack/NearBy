import React from 'react'
import { motion } from 'framer-motion'
import { Icon, type IconSize } from '@/components/common/Icon'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  size?: IconSize
  className?: string
  color?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'currentColor',
}) => {
  return (
    <Icon
      name="loading"
      size={size}
      color={color}
      spinning
      className={cn('text-primary', className)}
    />
  )
}

export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = 'mr-2' }) => {
  return <LoadingSpinner size="xs" className={className} />
}

export interface LoadingOverlayProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Processing request...',
  fullScreen = false,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'flex flex-col items-center justify-center p-8 bg-background/80 backdrop-blur-md z-50 rounded-sm space-y-3 text-center',
        fullScreen ? 'fixed inset-0 w-screen h-screen' : 'absolute inset-0 w-full h-full',
        className
      )}
    >
      <div className="p-3 rounded-sm bg-primary/10 border border-primary/20 text-primary shadow-lg">
        <LoadingSpinner size="xl" />
      </div>

      {message && (
        <p className="text-xs font-semibold text-foreground tracking-wide font-mono animate-pulse">
          {message}
        </p>
      )}
    </motion.div>
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={cn('p-5 rounded-sm border border-border/70 bg-card/60 space-y-3 animate-pulse shadow-sm', className)}>
      <Skeleton className="h-40 w-full rounded-sm" />
      <Skeleton className="h-5 w-3/4 rounded-sm" />
      <Skeleton className="h-3 w-1/2 rounded-sm" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-16 rounded-sm" />
        <Skeleton className="h-6 w-20 rounded-sm" />
      </div>
    </div>
  )
}

export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className = '',
}) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 5,
  className = '',
}) => {
  return (
    <div className={cn('w-full rounded-sm border border-border/70 bg-card/60 p-4 space-y-3 animate-pulse shadow-sm', className)}>
      <div className="flex items-center gap-4 border-b border-border/60 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-2">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} className="h-6 flex-1 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner
