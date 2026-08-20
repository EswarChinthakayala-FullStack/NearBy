import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from './Icon'

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClass = {
    xs: 'h-3.5 w-3.5',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size]

  return (
    <svg
      className={`animate-spin text-primary ${sizeClass} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export interface SkeletonProps {
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse rounded-sm bg-muted/80 dark:bg-muted/50 ${className}`}
    />
  )
}

export const CardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 rounded-sm border border-border bg-card p-4 shadow-xs">
      <Skeleton className="h-44 w-full rounded-sm" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-8 w-24 rounded-sm" />
        <Skeleton className="h-8 w-8 rounded-sm" />
      </div>
    </div>
  )
}

export const TableLoader: React.FC<{ rows?: number }> = ({ rows = 4 }) => {
  return (
    <div className="w-full space-y-3 rounded-sm border border-border bg-card p-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-5 w-1/6" />
        <Skeleton className="h-5 w-1/5" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export interface PageLoaderProps {
  label?: string
}

export const PageLoader: React.FC<PageLoaderProps> = ({ label = 'Loading application...' }) => {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute h-16 w-16 rounded-sm bg-primary/20 blur-md"
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-card border border-border shadow-md">
          <Icon name="navigation" size="lg" className="text-primary animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}

export interface ProgressIndicatorProps {
  value: number
  max?: number
  label?: string
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  label,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-sm bg-muted">
        <motion.div
          className="h-full bg-primary rounded-sm"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
