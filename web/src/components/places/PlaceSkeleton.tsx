import React from 'react'

export const PlaceCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-sm border border-border bg-card overflow-hidden shadow-md space-y-3 animate-pulse">
      <div className="h-44 w-full bg-muted" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-muted" />
          <div className="h-4 w-12 rounded bg-muted" />
        </div>
        <div className="h-5 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-7 w-20 rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export const PlaceGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PlaceCardSkeleton key={i} />
      ))}
    </div>
  )
}

export default PlaceCardSkeleton
