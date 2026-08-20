import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const ReviewSkeletonCard: React.FC = () => {
  return (
    <div className="p-5 rounded-sm border border-border/60 bg-card/50 backdrop-blur-sm space-y-4 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-sm" />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-4 rounded" />
            <Skeleton className="w-24 h-3 rounded" />
          </div>
        </div>
        <Skeleton className="w-20 h-4 rounded" />
      </div>

      <div className="space-y-2 pt-1">
        <Skeleton className="w-full h-4 rounded" />
        <Skeleton className="w-4/5 h-4 rounded" />
      </div>

      <div className="flex gap-2 pt-2">
        <Skeleton className="w-16 h-16 rounded-sm" />
        <Skeleton className="w-16 h-16 rounded-sm" />
      </div>
    </div>
  )
}

export const ReviewSummarySkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-sm border border-border/60 bg-card/60 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
      <div className="flex flex-col items-center justify-center space-y-2 border-b md:border-b-0 md:border-r border-border/60 pb-4 md:pb-0">
        <Skeleton className="w-16 h-12 rounded-sm" />
        <Skeleton className="w-28 h-5 rounded-sm" />
        <Skeleton className="w-24 h-4 rounded" />
      </div>

      <div className="md:col-span-2 space-y-2.5">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center gap-3">
            <Skeleton className="w-12 h-3 rounded" />
            <Skeleton className="flex-1 h-2.5 rounded-sm" />
            <Skeleton className="w-8 h-3 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export const ReviewSkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ReviewSkeletonCard key={i} />
      ))}
    </div>
  )
}

export default ReviewSkeletonList
