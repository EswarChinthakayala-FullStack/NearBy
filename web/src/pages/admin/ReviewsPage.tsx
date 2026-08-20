import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/common/Icon'
import { AdminReviewModerationRow } from '@/components/admin/AdminReviewModerationRow'
import { TableSkeleton } from '@/components/admin/TableSkeleton'
import { EmptyAdminState } from '@/components/admin/EmptyAdminState'
import { usePendingReviews } from '@/hooks/useAdmin'
import type { Review } from '@/types/review'

export const ReviewsPage: React.FC = () => {
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const pageSize = 15

  const { data: reviewsResponse, isLoading, isError, refetch } = usePendingReviews(page, pageSize, activeTab)

  const reviews: Review[] = reviewsResponse?.data || []
  const pagination = reviewsResponse?.pagination

  return (
    <div className="space-y-6">
      {/* Header & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Icon name="ratings" size="sm" className="text-amber-400" />
            <span>Reviews Moderation & Management</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Approve, reject, or manage community reviews submitted by users.
          </p>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-sm border border-border/50 shrink-0">
          <Button
            variant={activeTab === 'pending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setActiveTab('pending'); setPage(1); }}
            className={`h-7 px-3 text-xs font-semibold rounded-xs gap-1.5 ${activeTab === 'pending' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
          >
            <span>Pending</span>
            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono bg-background/40">
              {activeTab === 'pending' ? (pagination?.total_items || reviews.length) : '•'}
            </Badge>
          </Button>

          <Button
            variant={activeTab === 'approved' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setActiveTab('approved'); setPage(1); }}
            className={`h-7 px-3 text-xs font-semibold rounded-xs gap-1.5 ${activeTab === 'approved' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}`}
          >
            <span>Approved</span>
          </Button>

          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => { setActiveTab('all'); setPage(1); }}
            className={`h-7 px-3 text-xs font-semibold rounded-xs gap-1.5 ${activeTab === 'all' ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : ''}`}
          >
            <span>All Submissions</span>
          </Button>
        </div>
      </div>

      {isLoading && <TableSkeleton rows={5} cols={4} />}

      {isError && !isLoading && (
        <div className="p-8 rounded-sm border border-destructive/30 bg-destructive/5 text-center space-y-3">
          <Icon name="error" size="lg" className="text-destructive mx-auto" />
          <h5 className="text-sm font-bold text-foreground">Unable to load moderation queue</h5>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-sm text-xs font-semibold">
            <Icon name="refresh" size="xs" className="mr-1.5" />
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !isError && reviews.length === 0 && (
        <EmptyAdminState
          iconName="ratings"
          title={activeTab === 'pending' ? 'Moderation Queue Clear' : `No ${activeTab} reviews found`}
          description={
            activeTab === 'pending'
              ? 'There are currently no user-submitted reviews awaiting administrative moderation.'
              : `No reviews matching filter status "${activeTab}".`
          }
        />
      )}

      {!isLoading && !isError && reviews.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {reviews.map((review) => (
              <AdminReviewModerationRow key={review.uuid} review={review} />
            ))}
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between p-4 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md text-xs">
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
      )}
    </div>
  )
}

export default ReviewsPage
