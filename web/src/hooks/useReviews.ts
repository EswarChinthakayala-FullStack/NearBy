import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import reviewsService from '@/services/api/reviews.service'
import type { ReviewCreateParams, ReviewUpdateParams } from '@/types/review'
import { toast } from 'sonner'

export const usePlaceReviews = (placeUuid: string, page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['reviews', placeUuid, page, pageSize],
    queryFn: () => reviewsService.getPlaceReviews(placeUuid, page, pageSize),
    enabled: !!placeUuid,
  })
}

export const useSubmitReview = (placeUuid: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ReviewCreateParams) => reviewsService.submitReview(placeUuid, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', placeUuid] })
      queryClient.invalidateQueries({ queryKey: ['place', placeUuid] })
      toast.success('Review submitted successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit review')
    },
  })
}

export const useUpdateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: ReviewUpdateParams }) =>
      reviewsService.updateReview(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update review')
    },
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => reviewsService.deleteReview(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Review removed')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete review')
    },
  })
}

export const useModerateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: 'approved' | 'rejected' }) =>
      reviewsService.moderateReview(uuid, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingReviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      toast.success(`Review set to '${variables.status}'`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to moderate review')
    },
  })
}
