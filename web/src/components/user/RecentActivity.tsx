import React from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Clock01Icon, StarIcon, FavouriteIcon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useUserReviews } from '@/hooks/useUserPortal'
import { useFavorites } from '@/hooks/useFavorites'
import { formatDate } from '@/lib/utils'

export const RecentActivity: React.FC = () => {
  const { data: reviewsData, isLoading: isReviewsLoading } = useUserReviews(1, 5)
  const { data: favoritesData, isLoading: isFavsLoading } = useFavorites(1, 5)

  const isLoading = isReviewsLoading || isFavsLoading

  const reviews = reviewsData?.data || []
  const favorites = favoritesData?.data || []

  // Combine activity streams into a unified chronological feed
  const activityItems = [
    ...reviews.map((r) => ({
      id: `rev-${r.uuid}`,
      type: 'review' as const,
      title: `Submitted review for spot`,
      rating: r.rating,
      date: r.created_at,
      link: `/places`,
    })),
    ...favorites.map((f) => ({
      id: `fav-${f.place?.uuid || f.created_at}`,
      type: 'favorite' as const,
      title: `Saved "${f.place?.name || 'Destination'}" to bookmarks`,
      rating: null,
      date: f.created_at,
      link: f.place?.uuid ? `/places/${f.place.uuid}` : `/user/favorites`,
    })),
  ].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0
    const timeB = b.date ? new Date(b.date).getTime() : 0
    return timeB - timeA
  }).slice(0, 6)

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 font-heading">
          <HugeiconsIcon icon={Clock01Icon} className="size-4 text-emerald-400" />
          <span>Recent Portal Activity</span>
        </CardTitle>
        <span className="text-xs font-mono text-muted-foreground">{activityItems.length} Events</span>
      </CardHeader>

      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-sm" />
            ))}
          </div>
        ) : activityItems.length === 0 ? (
          <EmptyState
            iconName="clock"
            title="No Recent Activity"
            description="Your recent reviews and bookmarked spots will appear here."
          />
        ) : (
          <div className="space-y-3">
            {activityItems.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="flex items-center justify-between p-3 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/60 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm ${
                      item.type === 'review'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    <HugeiconsIcon
                      icon={item.type === 'review' ? StarIcon : FavouriteIcon}
                      className="size-3.5"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">{formatDate(item.date)}</p>
                  </div>
                </div>

                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentActivity
