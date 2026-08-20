import React from 'react'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import RatingStars from '@/components/reviews/RatingStars'
import ProfileAvatar from '@/components/user/ProfileAvatar'
import { useModerateReview } from '@/hooks/useReviewModeration'
import type { Review } from '@/types/review'

export interface AdminReviewModerationRowProps {
  review: Review
  className?: string
}

export const AdminReviewModerationRow: React.FC<AdminReviewModerationRowProps> = ({
  review,
  className = '',
}) => {
  const moderateMutation = useModerateReview()

  let timeAgo = 'Recently'
  if (review.created_at) {
    try {
      const parsed = parseISO(review.created_at)
      if (isValid(parsed)) {
        timeAgo = formatDistanceToNow(parsed, { addSuffix: true })
      }
    } catch {
      timeAgo = 'Recently'
    }
  }

  const handleApprove = () => {
    moderateMutation.mutate({ uuid: review.uuid, status: 'approved' })
  }

  const handleReject = () => {
    moderateMutation.mutate({ uuid: review.uuid, status: 'rejected' })
  }

  const isPending = moderateMutation.isPending

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`p-5 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm hover:border-border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <ProfileAvatar
          src={review.user?.avatar_url || review.user?.avatarUrl}
          name={review.user?.name || review.user?.full_name}
          size="md"
        />

        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-foreground">
              {review.user?.name || review.user?.full_name || 'Anonymous Traveler'}
            </span>
            <RatingStars value={review.rating} size="sm" readOnly />
            <span className="text-[11px] text-muted-foreground font-mono">{timeAgo}</span>

            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-mono px-2 py-0.5 ${
                review.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                  : review.status === 'rejected'
                  ? 'bg-rose-500/20 text-rose-500 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
              }`}
            >
              {review.status}
            </Badge>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed font-normal">
            {review.comment || 'No text comment provided.'}
          </p>

          {/* Review Image Attachments */}
          {review.images && review.images.length > 0 && (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {review.images.map((img) => (
                <div
                  key={img.uuid || img.image_url}
                  className="w-12 h-12 rounded-sm overflow-hidden border border-border/60 bg-muted shrink-0"
                >
                  <img src={img.image_url} alt="Review attachment" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Moderation Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={isPending}
          className="rounded-sm h-8 px-3 text-xs font-semibold text-rose-500 border-rose-500/30 hover:bg-rose-500/10"
        >
          <Icon name="close" size="xs" className="mr-1" />
          Reject
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={handleApprove}
          disabled={isPending}
          className="rounded-sm h-8 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        >
          {isPending ? (
            <Icon name="loading" size="xs" spinning />
          ) : (
            <span className="flex items-center gap-1">
              <Icon name="check" size="xs" />
              Approve
            </span>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

export default AdminReviewModerationRow
