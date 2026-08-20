import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  StarIcon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  GridIcon,
  Menu01Icon,
  Location01Icon,
  Search01Icon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/common/EmptyState'
import { useUserReviews } from '@/hooks/useUserPortal'
import { useDeleteReview } from '@/hooks/useReviews'
import { formatDate } from '@/lib/utils'
import type { Review } from '@/types/review'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'list'
type StatusFilter = 'all' | 'approved' | 'pending'

export const ReviewsPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 12

  const { data: reviewsResponse, isLoading, isError, refetch } = useUserReviews(page, pageSize)
  const deleteReviewMutation = useDeleteReview()

  const reviewsData = reviewsResponse?.data
  const reviews: Review[] = Array.isArray(reviewsData)
    ? reviewsData
    : (reviewsData as any)?.items || []
  const pagination = reviewsResponse?.pagination

  const handleDelete = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(uuid, {
        onSuccess: () => {
          toast.success('Review deleted successfully!')
          refetch()
        },
        onError: () => {
          toast.error('Failed to delete review. Please try again.')
        },
      })
    }
  }

  const filteredReviews = reviews.filter((review) => {
    if (statusFilter !== 'all' && review.status !== statusFilter) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const commentMatch = review.comment?.toLowerCase().includes(q)
      const placeMatch = review.place?.name?.toLowerCase().includes(q)
      return commentMatch || placeMatch
    }
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Standardized Page Header */}
      <PageHeader
        title="My Ratings & Reviews"
        description="View, filter, and manage your submitted tourist attraction reviews and moderation statuses."
        breadcrumbs={[{ label: 'My Account' }, { label: 'Reviews' }]}
        actions={
          <div className="flex items-center gap-2">
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
          </div>
        }
      />

      {/* Filter and Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'all', label: 'All Reviews' },
              { id: 'approved', label: 'Approved' },
              { id: 'pending', label: 'Pending Moderation' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as StatusFilter)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all ${
                statusFilter === tab.id
                  ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-xs'
                  : 'bg-card/60 hover:bg-card border border-border/70 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-card border-border"
            />
          </div>

          {pagination && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Total: <span className="font-bold text-foreground">{pagination.total_items}</span>
            </span>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3 max-w-4xl mx-auto'
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 rounded-sm" />
                  <Skeleton className="h-4 w-16 rounded-sm" />
                </div>
                <Skeleton className="h-4 w-3/4 rounded-sm" />
                <Skeleton className="h-14 w-full rounded-sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (isError || filteredReviews.length === 0) && (
        <EmptyState
          iconName="ratings"
          title={searchQuery ? 'No Matching Reviews' : 'No Reviews Submitted Yet'}
          description={
            searchQuery
              ? `No reviews match "${searchQuery}". Try clearing your search filter.`
              : "You haven't submitted any place reviews yet. Explore tourist spots and share your experiences!"
          }
          actionLabel="Browse Destinations"
          onAction={() => (window.location.href = '/places')}
        />
      )}

      {/* Reviews Display Grid / List */}
      {!isLoading && !isError && filteredReviews.length > 0 && (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3 max-w-4xl mx-auto'
          }
        >
          {filteredReviews.map((review) => {
            const isApproved = review.status === 'approved'
            const placeName = review.place?.name || 'Tourist Destination'

            return (
              <Card
                key={review.uuid}
                className="group border border-border/80 bg-card hover:border-emerald-500/40 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                  {/* Rating & Status Badge Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-sm border border-amber-500/20 font-mono font-bold text-xs">
                        <HugeiconsIcon icon={StarIcon} className="size-3.5 fill-amber-400" />
                        <span>{review.rating}.0</span>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        <HugeiconsIcon
                          icon={isApproved ? CheckmarkCircle02Icon : Clock01Icon}
                          className="size-3 mr-1"
                        />
                        <span>{review.status || 'approved'}</span>
                      </Badge>
                    </div>

                    {/* Destination Place Title */}
                    <div className="pt-1">
                      <Link
                        to={`/places/${review.place_uuid}`}
                        className="text-xs font-bold text-foreground hover:text-emerald-400 transition-colors flex items-center gap-1 line-clamp-1"
                      >
                        <HugeiconsIcon icon={Location01Icon} className="size-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{placeName}</span>
                      </Link>
                    </div>

                    {/* Review Comment Box */}
                    <p className="text-xs text-foreground/90 leading-relaxed bg-muted/25 p-2.5 rounded-sm border border-border/40 line-clamp-4 font-sans italic">
                      "{review.comment || 'No comment provided.'}"
                    </p>
                  </div>

                  {/* Card Footer: Metadata & Delete Button */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[10px] font-mono text-muted-foreground/80">
                    <span>{formatDate(review.created_at)}</span>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDelete(review.uuid)}
                      disabled={deleteReviewMutation.isPending}
                      className="h-6 px-2 text-[11px] text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 gap-1 rounded-sm"
                      title="Delete review"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-3" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground font-mono">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-sm text-xs"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page >= pagination.total_pages}
              className="rounded-sm text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewsPage
