import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { StatsCardSkeleton } from './TableSkeleton'
import { useAdminDashboard } from '@/hooks/useAdminDashboard'

export interface AdminStatsCardsProps {
  className?: string
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ className = '' }) => {
  const { data: stats, isLoading, isError, refetch, isRefetching } = useAdminDashboard()

  if (isLoading) {
    return <StatsCardSkeleton count={8} />
  }

  if (isError || !stats) {
    return (
      <div className="p-6 rounded-sm border border-destructive/30 bg-destructive/5 text-center space-y-3">
        <Icon name="error" size="lg" className="text-destructive mx-auto" />
        <h5 className="text-sm font-bold text-foreground">Unable to load dashboard statistics</h5>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-sm text-xs font-semibold"
        >
          <Icon name="refresh" size="xs" className="mr-1.5" />
          Retry
        </Button>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Places',
      value: stats.total_places,
      subtitle: `${stats.published_places} published • ${stats.draft_places} drafts`,
      iconName: 'places' as const,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Published Places',
      value: stats.published_places,
      subtitle: 'Live on platform',
      iconName: 'check' as const,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Pending Reviews',
      value: stats.pending_reviews,
      subtitle: `${stats.approved_reviews} approved • ${stats.total_reviews} total`,
      iconName: 'ratings' as const,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Total Categories',
      value: stats.total_categories,
      subtitle: 'Active taxonomies',
      iconName: 'categories' as const,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Total Users',
      value: stats.total_users,
      subtitle: `${stats.active_users} active accounts`,
      iconName: 'profile' as const,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Saved Favorites',
      value: stats.total_favorites,
      subtitle: 'User bookmarks',
      iconName: 'favorite' as const,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Media Gallery',
      value: stats.total_images,
      subtitle: 'Uploaded images',
      iconName: 'gallery' as const,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'OSM Sync Status',
      value: stats.last_sync_status.toUpperCase(),
      subtitle: stats.last_sync_time ? `Last run: ${new Date(stats.last_sync_time).toLocaleDateString()}` : 'No sync recorded',
      iconName: 'refresh' as const,
      isString: true,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    },
  ]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          <span>System Metrics</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            Live Database
          </span>
        </h4>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rounded-sm h-8 px-2.5 text-xs font-semibold"
        >
          <Icon name="refresh" size="xs" spinning={isRefetching} className="mr-1.5" />
          Refresh Stats
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className="p-5 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm hover:border-border transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{card.title}</span>
              <div className={`p-2 rounded-sm border ${card.color}`}>
                <Icon name={card.iconName} size="xs" />
              </div>
            </div>

            <div className="text-2xl font-black font-mono tracking-tight text-foreground">
              {card.isString ? card.value : typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
            </div>

            <p className="text-[11px] text-muted-foreground font-medium truncate pt-0.5">
              {card.subtitle}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default AdminStatsCards
