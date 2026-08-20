import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 max-w-3xl w-full mx-auto animate-pulse">
      {/* Header Card Skeleton */}
      <div className="p-6 rounded-sm border border-border/60 bg-card/50 flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-sm shrink-0" />
        <div className="space-y-2 flex-1 text-center sm:text-left">
          <Skeleton className="w-48 h-6 rounded-sm mx-auto sm:mx-0" />
          <Skeleton className="w-36 h-4 rounded-sm mx-auto sm:mx-0" />
          <div className="flex justify-center sm:justify-start gap-2 pt-2">
            <Skeleton className="w-20 h-5 rounded-sm" />
            <Skeleton className="w-24 h-5 rounded-sm" />
          </div>
        </div>
      </div>

      {/* Form Fields Card Skeleton */}
      <div className="p-6 rounded-sm border border-border/60 bg-card/50 space-y-4">
        <Skeleton className="w-40 h-5 rounded-sm mb-4" />
        <div className="space-y-2">
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-full h-10 rounded-sm" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-full h-10 rounded-sm" />
        </div>
        <div className="space-y-2">
          <Skeleton className="w-24 h-4 rounded" />
          <Skeleton className="w-full h-10 rounded-sm" />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Skeleton className="w-24 h-9 rounded-sm" />
          <Skeleton className="w-32 h-9 rounded-sm" />
        </div>
      </div>
    </div>
  )
}

export default ProfileSkeleton
