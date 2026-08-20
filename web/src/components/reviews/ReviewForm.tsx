import React, { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Icon } from '@/components/common/Icon'
import RatingStars from './RatingStars'
import { useAuthStore } from '@/store/authStore'
import { useSubmitReview, useUpdateReview } from '@/hooks/useReviews'
import type { Review } from '@/types/review'
import { toast } from 'sonner'

const reviewSchema = z.object({
  rating: z
    .number({ required_error: 'Please select a star rating' })
    .min(1, 'Please select at least 1 star')
    .max(5, 'Maximum 5 stars allowed'),
  comment: z
    .string()
    .max(1000, 'Comment cannot exceed 1000 characters')
    .optional(),
})

export type ReviewFormData = z.infer<typeof reviewSchema>

export interface ReviewFormProps {
  placeUuid: string
  existingReview?: Review | null
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  placeUuid,
  existingReview,
  onSuccess,
  onCancel,
  className = '',
}) => {
  const { isAuthenticated } = useAuthStore()
  const submitMutation = useSubmitReview(placeUuid)
  const updateMutation = useUpdateReview()

  const isEditing = !!existingReview

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating || 0,
      comment: existingReview?.comment || '',
    },
  })

  useEffect(() => {
    if (existingReview) {
      reset({
        rating: existingReview.rating,
        comment: existingReview.comment || '',
      })
    }
  }, [existingReview, reset])

  const commentValue = useWatch({ control, name: 'comment' }) || ''

  const onSubmit = (data: ReviewFormData) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to submit a review.')
      return
    }

    if (!navigator.onLine) {
      toast.error('You are offline. Reconnect before submitting a review.')
      return
    }

    const trimmedComment = data.comment ? data.comment.trim() : ''

    if (isEditing && existingReview) {
      updateMutation.mutate(
        {
          uuid: existingReview.uuid,
          data: {
            rating: data.rating,
            comment: trimmedComment || undefined,
          },
        },
        {
          onSuccess: () => {
            if (onSuccess) onSuccess()
          },
        }
      )
    } else {
      submitMutation.mutate(
        {
          rating: data.rating,
          comment: trimmedComment,
        },
        {
          onSuccess: () => {
            reset({ rating: 0, comment: '' })
            if (onSuccess) onSuccess()
          },
          onError: (err: Error) => {
            if (err.message.includes('409') || err.message.includes('already')) {
              setError('root', {
                message:
                  'You have already submitted a review for this destination. You can update your review when editing becomes available.',
              })
            }
          },
        }
      )
    }
  }

  const isLoading = submitMutation.isPending || updateMutation.isPending || isSubmitting

  if (!isAuthenticated) {
    return (
      <div className={`p-6 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md text-center space-y-3 ${className}`}>
        <Icon name="user" size="lg" className="text-muted-foreground mx-auto" />
        <h4 className="text-sm font-bold text-foreground">Sign in to leave a review</h4>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          You must be logged into your account to rate this place and write a review.
        </p>
        <Button
          onClick={() => {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
          }}
          size="sm"
          className="rounded-sm text-xs font-semibold"
        >
          Sign In / Register
        </Button>
      </div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className={`p-6 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-5 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <h4 className="text-base font-bold text-foreground">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h4>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Icon name="close" size="xs" />
          </Button>
        )}
      </div>

      {/* Duplicate Review Protection Root Alert */}
      {errors.root && (
        <div className="p-3 rounded-sm border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold">
          {errors.root.message}
        </div>
      )}

      {/* Rating Stars Field */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Your Rating <span className="text-destructive">*</span>
        </Label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <RatingStars
                value={field.value}
                onChange={field.onChange}
                readOnly={false}
                size="lg"
                showScore
                disabled={isLoading}
              />
              {errors.rating && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.rating.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Review Comment Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="review-comment" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Your Comment (Optional)
          </Label>
          <span
            className={`text-[11px] font-mono ${
              commentValue.length > 900 ? 'text-destructive font-bold' : 'text-muted-foreground'
            }`}
          >
            {commentValue.length} / 1000
          </span>
        </div>

        <Controller
          name="comment"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="review-comment"
              placeholder="Tell others about your experience, highlights, accessibility, parking, or best times to visit..."
              rows={4}
              disabled={isLoading}
              className="rounded-sm border-border/70 bg-background/80 focus:bg-background text-sm resize-y"
            />
          )}
        />
        {errors.comment && (
          <p className="text-xs text-destructive font-medium">{errors.comment.message}</p>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-sm text-xs font-semibold h-9"
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-sm bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold h-9 px-5 shadow-sm hover:shadow transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-xs">
              <Icon name="loading" size="xs" spinning />
              {isEditing ? 'Updating...' : 'Submitting...'}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs">
              <Icon name="check" size="xs" />
              {isEditing ? 'Update Review' : 'Post Review'}
            </span>
          )}
        </Button>
      </div>
    </motion.form>
  )
}

export default ReviewForm
