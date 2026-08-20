import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminModerationApi from '@/services/api/adminModerationApi'
import { toast } from 'sonner'

/**
 * Hook to fetch paginated pending reviews in moderation queue
 */
export const usePendingReviews = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['adminPendingReviews', page, pageSize],
    queryFn: () => adminModerationApi.getPendingReviews(page, pageSize),
    staleTime: 1000 * 60, // 1 minute
  })
}

/**
 * Mutation hook to approve or reject a user review
 */
export const useModerateReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: 'approved' | 'rejected' }) =>
      adminModerationApi.moderateReview(uuid, status),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingReviews'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      const targetId = (review as unknown as Record<string, unknown>).place_id || review.place_uuid
      if (targetId) {
        queryClient.invalidateQueries({
          queryKey: ['placeReviews', targetId],
        })
      }

      toast.success(
        review.status === 'approved'
          ? 'Review approved and published live.'
          : 'Review rejected and archived.'
      )
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to moderate review.')
    },
  })
}

export default usePendingReviews
