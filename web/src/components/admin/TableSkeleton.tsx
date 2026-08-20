import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full rounded-sm border border-border/70 bg-card/60 backdrop-blur-md p-4 space-y-4 shadow-sm animate-pulse">
      {/* Header Row */}
      <div className="flex items-center gap-4 border-b border-border/60 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 rounded" />
        ))}
      </div>

      {/* Rows */}
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

export const StatsCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md space-y-3 shadow-sm animate-pulse">
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-3 rounded" />
            <Skeleton className="w-8 h-8 rounded-sm" />
          </div>
          <Skeleton className="w-16 h-8 rounded-sm" />
          <Skeleton className="w-32 h-3 rounded" />
        </div>
      ))}
    </div>
  )
}

export default TableSkeleton
