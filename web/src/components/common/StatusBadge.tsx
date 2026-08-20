import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusBadgeValue =
  | 'published'
  | 'draft'
  | 'archived'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'verified'
  | 'unverified'
  | string

export interface StatusBadgeProps {
  value: StatusBadgeValue
  className?: string
}

const BADGE_STYLES: Record<string, string> = {
  published: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  approved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  verified: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',

  draft: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',

  archived: 'bg-muted text-muted-foreground border-border',
  inactive: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  rejected: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  unverified: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ value, className = '' }) => {
  const normalized = String(value).toLowerCase()
  const badgeStyle = BADGE_STYLES[normalized] || 'bg-muted text-muted-foreground border-border'

  return (
    <Badge
      variant="outline"
      className={cn(
        'text-[10px] font-mono font-bold uppercase px-2 py-0.5 tracking-wider',
        badgeStyle,
        className
      )}
    >
      {value}
    </Badge>
  )
}

export default StatusBadge
