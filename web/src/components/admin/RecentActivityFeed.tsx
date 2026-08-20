import React, { useState } from 'react'
import { formatDistanceToNow, parseISO, isValid, format } from 'date-fns'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/common/Icon'
import { TableSkeleton } from './TableSkeleton'
import EmptyAdminState from './EmptyAdminState'
import { useActivityLogs } from '@/hooks/useActivityLogs'
import type { ActivityLogItem } from '@/services/api/admin.service'

export interface RecentActivityFeedProps {
  className?: string
}

const getActionConfig = (action: string): { label: string; badgeClass: string; dotClass: string; icon: IconName } => {
  const norm = (action || '').toUpperCase()
  if (norm.includes('OSM') || norm.includes('IMPORT')) {
    return {
      label: 'OSM Region Import',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dotClass: 'border-emerald-500 bg-emerald-500/20',
      icon: 'download'
    }
  }
  if (norm.includes('WIKIPEDIA') || norm.includes('ENRICH')) {
    return {
      label: 'Wikipedia Enrichment',
      badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      dotClass: 'border-cyan-500 bg-cyan-500/20',
      icon: 'edit'
    }
  }
  if (norm.includes('IMAGE') || norm.includes('ACQUIRE')) {
    return {
      label: 'Image Acquisition',
      badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      dotClass: 'border-purple-500 bg-purple-500/20',
      icon: 'image'
    }
  }
  if (norm.includes('CREATE')) {
    return {
      label: 'Place Created',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      dotClass: 'border-blue-500 bg-blue-500/20',
      icon: 'location'
    }
  }
  if (norm.includes('CATEGORY')) {
    return {
      label: 'Category Updated',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dotClass: 'border-amber-500 bg-amber-500/20',
      icon: 'categories'
    }
  }
  if (norm.includes('REVIEW') || norm.includes('APPROVE')) {
    return {
      label: 'Review Moderation',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      dotClass: 'border-emerald-500 bg-emerald-500/20',
      icon: 'check'
    }
  }
  return {
    label: action.replace(/_/g, ' '),
    badgeClass: 'bg-primary/10 text-primary border-primary/30',
    dotClass: 'border-primary bg-primary/20',
    icon: 'clock'
  }
}

const formatEntityLabel = (entityType?: string, entityId?: number | string) => {
  if (!entityType) return `ID #${entityId || 'N/A'}`
  const isCity = ['chennai', 'delhi', 'mumbai', 'jaipur', 'bengaluru', 'kolkata'].includes(entityType.toLowerCase())
  if (isCity) {
    return `Region: ${entityType}`
  }
  return `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} #${entityId || '1'}`
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ className = '' }) => {
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data: response, isLoading, isError, refetch } = useActivityLogs(page, pageSize)

  const logs: ActivityLogItem[] = response?.data || []
  const pagination = response?.pagination

  if (isLoading) {
    return <TableSkeleton rows={5} cols={4} />
  }

  if (isError) {
    return (
      <div className="p-6 rounded-sm border border-destructive/30 bg-destructive/5 text-center space-y-3">
        <Icon name="error" size="lg" className="text-destructive mx-auto" />
        <h5 className="text-sm font-bold text-foreground">Unable to load activity logs</h5>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-sm text-xs font-semibold">
          <Icon name="refresh" size="xs" className="mr-1.5" />
          Retry
        </Button>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <EmptyAdminState
        iconName="clock"
        title="No Activity Recorded"
        description="Administrative activity audit trail logs will appear here as team members modify content."
      />
    )
  }

  return (
    <div className={`p-6 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-5 ${className}`}>
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h4 className="text-base font-bold text-foreground flex items-center gap-2">
          <Icon name="clock" size="sm" className="text-primary" />
          <span>Audit Trail & Activity Feed</span>
        </h4>

        <span className="text-xs text-muted-foreground font-mono">
          Total logs: <span className="font-semibold text-foreground">{pagination?.total_items || logs.length}</span>
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="relative pl-7 space-y-3.5 before:absolute before:left-[13px] before:top-3 before:bottom-3 before:w-[2px] before:bg-border/60">
        {logs.map((item, idx) => {
          let relativeTime = 'Recently'
          let exactTime = ''

          if (item.created_at) {
            try {
              // Strip trailing Z or handle ISO date strings cleanly
              const rawStr = item.created_at.endsWith('Z') ? item.created_at.slice(0, -1) : item.created_at
              const parsed = parseISO(rawStr)
              if (isValid(parsed)) {
                relativeTime = formatDistanceToNow(parsed, { addSuffix: true })
                exactTime = format(parsed, 'MMM d, yyyy • h:mm a')
              }
            } catch {
              relativeTime = 'Recently'
            }
          }

          const actionCfg = getActionConfig(item.action)

          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, delay: idx * 0.03 }}
              className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-sm border border-border/60 bg-background/50 hover:bg-background/80 hover:border-border transition-colors shadow-2xs"
            >
              {/* Timeline Indicator Dot Perfectly Centered on Line */}
              <div className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 ${actionCfg.dotClass} shadow-xs z-10`} />

              <div className="flex items-center gap-2.5 flex-wrap">
                <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 rounded-sm border flex items-center gap-1.5 ${actionCfg.badgeClass}`}>
                  <Icon name={actionCfg.icon} size="xs" />
                  <span>{actionCfg.label}</span>
                </Badge>

                <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5 rounded-sm bg-secondary/70 text-secondary-foreground">
                  {formatEntityLabel(item.entity_type, item.entity_id)}
                </Badge>

                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Icon name="user" size="xs" className="opacity-60" />
                  <span>System Admin</span>
                </span>
              </div>

              {/* Time Column */}
              <div className="flex items-center gap-2 text-xs shrink-0 self-end sm:self-auto">
                {exactTime && (
                  <span className="text-muted-foreground/60 font-mono hidden md:inline">
                    {exactTime}
                  </span>
                )}
                <span className="font-medium text-foreground/80 font-mono bg-muted/40 px-2 py-0.5 rounded-sm border border-border/40">
                  {relativeTime}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
          <span className="text-muted-foreground font-medium">
            Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.total_pages}</span>
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm h-8 text-xs font-semibold"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-sm h-8 text-xs font-semibold"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecentActivityFeed
