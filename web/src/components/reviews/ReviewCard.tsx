import React, { useState } from 'react'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Icon } from '@/components/common/Icon'
import RatingStars from './RatingStars'
import DeleteReviewDialog from './DeleteReviewDialog'
import { useAuthStore } from '@/store/authStore'
import { useDeleteReview, useModerateReview } from '@/hooks/useReviews'
import type { Review } from '@/types/review'

export interface ReviewCardProps {
  review: Review
  onEdit?: (review: Review) => void
  className?: string
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onEdit, className = '' }) => {
  const { user: currentUser } = useAuthStore()
  const deleteReviewMutation = useDeleteReview()
  const moderateReviewMutation = useModerateReview()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  // Auth ownership check
  const isAuthor =
    !!currentUser &&
    !!review.user &&
    (currentUser.uuid === review.user.uuid ||
      currentUser.email === review.user.email ||
      String(currentUser.id) === String(review.user.id))

  const isAdmin = currentUser?.role === 'admin'

  // User display name & initials calculation from backend data
  const userName =
    review.user?.full_name || review.user?.name || review.user?.email?.split('@')[0] || 'Anonymous Explorer'

  const getInitials = (name: string): string => {
    if (!name) return 'U'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const userInitials = getInitials(userName)
  const avatarUrl = review.user?.avatar_url || review.user?.avatarUrl

  // Formatted date string
  let formattedDate = 'Recently'
  if (review.created_at) {
    try {
      const parsed = parseISO(review.created_at)
      if (isValid(parsed)) {
        formattedDate = formatDistanceToNow(parsed, { addSuffix: true })
      }
    } catch {
      formattedDate = 'Recently'
    }
  }

  const handleDelete = () => {
    deleteReviewMutation.mutate(review.uuid, {
      onSuccess: () => setDeleteDialogOpen(false),
    })
  }

  const handleModerate = (status: 'approved' | 'rejected') => {
    moderateReviewMutation.mutate({ uuid: review.uuid, status })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className={`p-5 md:p-6 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-4 hover:border-border transition-all ${className}`}
    >
      {/* Top Header Row: User info & rating */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border/60 shadow-sm shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h5 className="text-sm font-bold tracking-tight text-foreground">{userName}</h5>

              {/* Status Badge for Admin or Non-approved author */}
              {review.status !== 'approved' && (
                <Badge
                  variant={review.status === 'pending' ? 'outline' : 'destructive'}
                  className="text-[10px] uppercase font-mono px-2 py-0.5"
                >
                  {review.status}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <RatingStars value={review.rating} readOnly size="sm" showScore />
        </div>
      </div>

      {/* Comment Body */}
      {review.comment && (
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-normal">
          {review.comment}
        </p>
      )}

      {/* Review Images Grid if present */}
      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {review.images.map((img, idx) => (
            <button
              key={img.uuid || idx}
              type="button"
              onClick={() => setActiveImage(img.image_url)}
              className="relative w-16 h-16 rounded-sm overflow-hidden border border-border/60 group focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <img
                src={img.image_url}
                alt={`Review attachment ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </button>
          ))}
        </div>
      )}

      {/* Action Controls: Author Edit/Delete & Admin Moderation */}
      {(isAuthor || isAdmin) && (
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            {isAuthor && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(review)}
                className="h-8 px-2.5 rounded-sm text-muted-foreground hover:text-foreground text-xs"
              >
                <Icon name="edit" size="xs" className="mr-1.5" />
                Edit
              </Button>
            )}

            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-8 px-2.5 rounded-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 text-xs"
              >
                <Icon name="delete" size="xs" className="mr-1.5" />
                Delete
              </Button>
            )}
          </div>

          {/* Admin Moderation Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-mono">Moderate:</span>
              <Button
                variant="outline"
                size="sm"
                disabled={review.status === 'approved' || moderateReviewMutation.isPending}
                onClick={() => handleModerate('approved')}
                className="h-7 px-2 text-[11px] font-semibold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={review.status === 'rejected' || moderateReviewMutation.isPending}
                onClick={() => handleModerate('rejected')}
                className="h-7 px-2 text-[11px] font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteReviewDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteReviewMutation.isPending}
      />

      {/* Lightbox dialog for viewing full-size attached image */}
      <Dialog open={!!activeImage} onOpenChange={() => setActiveImage(null)}>
        <DialogContent className="max-w-3xl p-2 rounded-sm bg-black/90 border-neutral-800">
          <DialogTitle className="sr-only">Review Attachment</DialogTitle>
          {activeImage && (
            <img src={activeImage} alt="Full attachment preview" className="w-full h-auto max-h-[80vh] object-contain rounded-sm" />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default ReviewCard
