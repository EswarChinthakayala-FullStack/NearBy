import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useClearAllNotifications,
} from '@/hooks/useNotifications'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Notification01Icon,
  CheckmarkCircle02Icon,
  StarIcon,
  FavouriteIcon,
  Compass01Icon,
  Cancel01Icon,
  Menu01Icon,
  GridIcon,
  Tick02Icon,
  SparklesIcon,
  Link01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { NotificationItem } from '@/services/api/notificationsApi'

type FilterTab = 'all' | 'unread' | 'travel' | 'review' | 'favorite' | 'suggestion' | 'system'
type ViewMode = 'grid' | 'list'

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate()
  const { data: notifications = [], isLoading, isError, refetch } = useNotifications()
  const markReadMutation = useMarkNotificationRead()
  const markAllMutation = useMarkAllNotificationsRead()
  const deleteMutation = useDeleteNotification()
  const clearAllMutation = useClearAllNotifications()

  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkRead = (uuid: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    markReadMutation.mutate(uuid, {
      onSuccess: () => toast.success('Notification marked as read'),
    })
  }

  const handleMarkAllRead = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: () => toast.success('All notifications marked as read!'),
      onError: () => toast.error('Failed to mark notifications as read.'),
    })
  }

  const handleClearAll = () => {
    clearAllMutation.mutate(undefined, {
      onSuccess: () => toast.success('Cleared all notifications from database.'),
      onError: () => toast.error('Failed to clear notifications.'),
    })
  }

  const handleDelete = (uuid: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    deleteMutation.mutate(uuid, {
      onSuccess: () => toast.success('Notification removed'),
    })
  }

  const getTargetUrl = (item: NotificationItem): string => {
    if (item.link_url && item.link_url.startsWith('/')) {
      if (item.link_url === '/profile/security') return '/user/security'
      if (item.link_url === '/reviews') return '/user/reviews'
      if (item.link_url === '/favorites') return '/user/favorites'
      if (item.link_url === '/discover/nearby') return '/user/nearby'
      return item.link_url
    }

    switch (item.type.toLowerCase()) {
      case 'review':
        return '/user/reviews'
      case 'favorite':
        return '/user/favorites'
      case 'suggestion':
        return '/user/nearby'
      case 'travel':
        return '/user/security'
      default:
        return '/user/dashboard'
    }
  }

  const handleNavigate = (item: NotificationItem, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!item.is_read) {
      markReadMutation.mutate(item.uuid)
    }
    const targetUrl = getTargetUrl(item)
    navigate(targetUrl)
  }

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'review':
        return StarIcon
      case 'favorite':
        return FavouriteIcon
      case 'suggestion':
        return Compass01Icon
      case 'travel':
        return SparklesIcon
      default:
        return Notification01Icon
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'review':
        return { label: 'Review Alert', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      case 'favorite':
        return { label: 'Bookmark Sync', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      case 'suggestion':
        return { label: 'Spatial AI', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      case 'travel':
        return { label: 'Security & Auth', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
      default:
        return { label: 'System Notice', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    }
  }

  const formatTime = (isoString: string) => {
    try {
      return formatDistanceToNow(parseISO(isoString), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.is_read
    if (activeTab !== 'all') return n.type.toLowerCase() === activeTab
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="Notifications & Live Alerts"
        description="Real-time travel updates, review moderation events, and AI recommendations stored in your database."
        breadcrumbs={[{ label: 'My Account' }, { label: 'Notifications' }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Layout Switcher */}
            <div className="flex items-center bg-card border border-border p-0.5 rounded-sm">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('grid')}
                className="h-7 px-2 text-xs gap-1 font-mono"
                title="Grid View (Columns)"
              >
                <HugeiconsIcon icon={GridIcon} className="size-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('list')}
                className="h-7 px-2 text-xs gap-1 font-mono"
                title="List View (Single Row)"
              >
                <HugeiconsIcon icon={Menu01Icon} className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllMutation.isPending}
                className="rounded-sm text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-emerald-400" />
                <span>Mark All Read ({unreadCount})</span>
              </Button>
            )}

            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={clearAllMutation.isPending}
                className="rounded-sm text-xs text-rose-400 hover:bg-rose-500/10 border-border gap-1.5"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                <span>Clear All</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { id: 'all', label: 'All Notifications', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'travel', label: 'Security' },
              { id: 'review', label: 'Reviews' },
              { id: 'favorite', label: 'Favorites' },
              { id: 'suggestion', label: 'Spatial AI' },
            ] as Array<{ id: FilterTab; label: string; count?: number }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
                  : 'bg-card/60 hover:bg-card border border-border/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    tab.id === 'unread' ? 'bg-emerald-500 text-white font-bold' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredNotifications.length}</span> items
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-sm bg-card/60" />
          ))}
        </div>
      )}

      {/* Error Fallback */}
      {isError && (
        <div className="p-6 rounded-sm border border-rose-500/30 bg-rose-500/5 text-center space-y-3">
          <HugeiconsIcon icon={InformationCircleIcon} className="size-8 text-rose-400 mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Failed to Load Notifications</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Unable to fetch real-time alerts from database. Check backend connection.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
            Retry Connection
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredNotifications.length === 0 && (
        <EmptyState
          iconName="notifications"
          title={activeTab === 'unread' ? 'No Unread Alerts' : 'No Notifications Found'}
          description={
            activeTab === 'unread'
              ? 'You have read all active notifications! Check back later for new alerts.'
              : 'Your notification inbox is currently clear.'
          }
        />
      )}

      {/* Notifications Display Grid / List */}
      {!isLoading && !isError && filteredNotifications.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
          }
        >
          {filteredNotifications.map((item) => {
            const badge = getTypeBadge(item.type)
            const Icon = getIcon(item.type)

            return (
              <Card
                key={item.uuid}
                onClick={(e) => handleNavigate(item, e)}
                className={`group relative border transition-all duration-200 cursor-pointer overflow-hidden shadow-xs hover:border-emerald-500/50 ${
                  item.is_read
                    ? 'bg-card/50 border-border/80 opacity-80 hover:opacity-100'
                    : 'bg-card border-emerald-500/30 shadow-emerald-500/5 ring-1 ring-emerald-500/20'
                }`}
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  {/* Card Header Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-sm ${
                            item.is_read
                              ? 'bg-muted/50 text-muted-foreground border border-border'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          <HugeiconsIcon icon={Icon} className="size-4" />
                        </div>

                        <Badge variant="outline" className={`text-[10px] font-mono px-2 py-0.5 ${badge.color}`}>
                          {badge.label}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                        {!item.is_read && (
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={(e) => handleMarkRead(item.uuid, e)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10"
                            title="Mark as read"
                          >
                            <HugeiconsIcon icon={Tick02Icon} className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => handleDelete(item.uuid, e)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete notification"
                        >
                          <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Title & Message */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-xs font-bold leading-snug line-clamp-2 ${
                            item.is_read ? 'text-foreground/90' : 'text-foreground font-heading'
                          }`}
                        >
                          {item.title}
                        </h4>
                        {!item.is_read && (
                          <Badge className="text-[9px] uppercase font-mono bg-emerald-500 text-white shrink-0 px-1.5 py-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-sans">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Timestamp & Navigation Link */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground/80">
                    <span>{formatTime(item.created_at)}</span>

                    <button
                      type="button"
                      onClick={(e) => handleNavigate(item, e)}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold group-hover:underline cursor-pointer"
                    >
                      <span>View Page</span>
                      <HugeiconsIcon icon={Link01Icon} className="size-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
