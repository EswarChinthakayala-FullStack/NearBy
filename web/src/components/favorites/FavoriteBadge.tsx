import React from 'react'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export interface FavoriteBadgeProps {
  count?: number
  isFavorited?: boolean
  className?: string
}

export const FavoriteBadge: React.FC<FavoriteBadgeProps> = ({
  count = 0,
  isFavorited = false,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold backdrop-blur-md transition-colors',
        isFavorited
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          : 'bg-secondary/70 text-secondary-foreground border border-border/50',
        className
      )}
    >
      <Icon
        name="favorite"
        size="xs"
        className={isFavorited ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'}
      />
      <span className="font-mono">{count}</span>
    </span>
  )
}

export default FavoriteBadge
