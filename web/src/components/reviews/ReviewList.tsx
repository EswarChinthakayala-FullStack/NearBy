import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewCard from './ReviewCard'
import ReviewForm from './ReviewForm'
import ReviewSummary from './ReviewSummary'
import ReviewFilters, { type ReviewSortOption } from './ReviewFilters'
import ReviewEmptyState from './ReviewEmptyState'
import { ReviewSkeletonList, ReviewSummarySkeleton } from './ReviewSkeleton'
import OfflineBanner from '@/components/common/OfflineBanner'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import { usePlaceReviews } from '@/hooks/useReviews'
import { useAuthStore } from '@/store/authStore'
import type { Review } from '@/types/review'

export interface ReviewListProps {
  placeUuid: string
  avgRating?: number
  totalReviews?: number
  className?: string
}

export const ReviewList: React.FC<ReviewListProps> = ({
  placeUuid,
  avgRating = 0,
  totalReviews = 0,
  className = '',
}) => {
  const { user: currentUser } = useAuthStore()
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortOption, setSortOption] = useState<ReviewSortOption>('latest')

  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  const { data: response, isLoading, isError, refetch } = usePlaceReviews(placeUuid, page, pageSize)

  const rawReviews = useMemo(() => response?.data || [], [response?.data])
  const pagination = response?.pagination

  // Check if current user has already submitted a review
  const userExistingReview = useMemo(() => {
    if (!currentUser || !rawReviews.length) return null
    return (
      rawReviews.find(
        (r) =>
          r.user?.uuid === currentUser.uuid ||
          r.user?.email === currentUser.email ||
          String(r.user?.id) === String(currentUser.id)
      ) || null
    )
  }, [currentUser, rawReviews])

  // Client-side sorting for current dataset
  const sortedReviews = useMemo(() => {
    const list = [...rawReviews]
    if (sortOption === 'highest') {
      return list.sort((a, b) => b.rating - a.rating)
    } else if (sortOption === 'lowest') {
      return list.sort((a, b) => a.rating - b.rating)
    }
    // Default 'latest'
    return list.sort(
      (a, b) =>
        (b.created_at ? new Date(b.created_at).getTime() : 0) -
        (a.created_at ? new Date(a.created_at).getTime() : 0)
    )
  }, [rawReviews, sortOption])

  const handleEditClick = (review: Review) => {
    setEditingReview(review)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingReview(null)
    refetch()
  }

  const actualTotalReviews = pagination?.total_items ?? totalReviews

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Offline banner */}
      <OfflineBanner />

      {/* Rating Summary Header */}
      {isLoading ? (
        <ReviewSummarySkeleton />
      ) : (
        <ReviewSummary
          avgRating={avgRating}
          totalReviews={actualTotalReviews}
          reviews={rawReviews}
        />
      )}

      {/* Top Controls: Filter & Write Review Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-3">
        <ReviewFilters
          currentSort={sortOption}
          onSortChange={setSortOption}
          totalCount={actualTotalReviews}
        />

        {!showForm && (
          <Button
            onClick={() => {
              if (userExistingReview) {
                setEditingReview(userExistingReview)
              } else {
                setEditingReview(null)
              }
              setShowForm(true)
            }}
            size="sm"
            className="rounded-sm bg-primary text-primary-foreground font-semibold h-9 px-4 text-xs shadow-sm hover:shadow transition-all"
          >
            <Icon name="edit" size="xs" className="mr-1.5" />
            {userExistingReview ? 'Edit Your Review' : 'Write a Review'}
          </Button>
        )}
      </div>

      {/* Review Form Drawer/Collapsible */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReviewForm
              placeUuid={placeUuid}
              existingReview={editingReview}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowForm(false)
                setEditingReview(null)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {isLoading && <ReviewSkeletonList count={3} />}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="p-8 rounded-sm border border-destructive/30 bg-destructive/5 text-center space-y-3">
          <Icon name="error" size="lg" className="text-destructive mx-auto" />
          <h5 className="text-sm font-bold text-foreground">Unable to load reviews</h5>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            We encountered a network error while fetching reviews from the server.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-sm text-xs font-semibold"
          >
            <Icon name="refresh" size="xs" className="mr-1.5" />
            Try Again
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && sortedReviews.length === 0 && (
        <ReviewEmptyState
          onWriteReview={() => {
            setEditingReview(null)
            setShowForm(true)
          }}
        />
      )}

      {/* Reviews List Cards */}
      {!isLoading && !isError && sortedReviews.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.08 },
            },
          }}
          className="space-y-4"
        >
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.uuid}
              review={review}
              onEdit={handleEditClick}
            />
          ))}
        </motion.div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <span className="text-xs text-muted-foreground font-medium">
            Page <span className="font-semibold text-foreground">{pagination.page}</span> of{' '}
            <span className="font-semibold text-foreground">{pagination.total_pages}</span>
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-sm h-8 text-xs font-semibold"
            >
              <Icon name="arrow-left" size="xs" className="mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.total_pages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-sm h-8 text-xs font-semibold"
            >
              Next
              <Icon name="arrow-right" size="xs" className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReviewList
