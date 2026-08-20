import React from 'react'

export const PlaceCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-sm border border-border bg-card p-4 space-y-3 animate-pulse">
      <div className="h-44 w-full rounded-sm bg-muted/60" />
      <div className="flex justify-between items-center">
        <div className="h-3 w-20 rounded bg-muted/60" />
        <div className="h-3 w-12 rounded bg-muted/60" />
      </div>
      <div className="h-5 w-3/4 rounded bg-muted/60" />
      <div className="h-3 w-1/2 rounded bg-muted/60" />
    </div>
  )
}

export const CategoryCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-sm border border-border/70 bg-card/60 space-y-3 animate-pulse">
      <div className="h-12 w-12 rounded-sm bg-muted/60" />
      <div className="h-4 w-20 rounded bg-muted/60" />
      <div className="h-3 w-12 rounded bg-muted/60" />
    </div>
  )
}

export const TableRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-sm bg-muted/60" />
        <div className="space-y-1">
          <div className="h-4 w-36 rounded bg-muted/60" />
          <div className="h-3 w-24 rounded bg-muted/60" />
        </div>
      </div>
      <div className="h-6 w-20 rounded bg-muted/60" />
    </div>
  )
}
