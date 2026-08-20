import apiClient from './client'
import type { Review, ReviewCreateParams, ReviewUpdateParams, PaginatedReviewsResponse } from '@/types/review'
import type { AuthResponse } from '@/types/auth'

export const reviewsService = {
  getPlaceReviews: async (
    placeUuid: string,
    page = 1,
    pageSize = 20
  ): Promise<PaginatedReviewsResponse> => {
    const res = await apiClient.get<PaginatedReviewsResponse>(`/reviews/place/${placeUuid}`, {
      params: { page, page_size: pageSize },
    })
    return res.data
  },

  getUserReviews: async (page = 1, pageSize = 20): Promise<PaginatedReviewsResponse> => {
    const res = await apiClient.get<PaginatedReviewsResponse>('/reviews/me', {
      params: { page, page_size: pageSize },
    })
    return res.data
  },

  submitReview: async (placeUuid: string, data: ReviewCreateParams): Promise<Review> => {
    const res = await apiClient.post<AuthResponse<Review>>(`/reviews/place/${placeUuid}`, data)
    return res.data.data!
  },

  updateReview: async (uuid: string, data: ReviewUpdateParams): Promise<Review> => {
    const res = await apiClient.patch<AuthResponse<Review>>(`/reviews/${uuid}`, data)
    return res.data.data!
  },

  deleteReview: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/reviews/${uuid}`)
  },

  moderateReview: async (uuid: string, status: 'approved' | 'rejected'): Promise<Review> => {
    const res = await apiClient.post<AuthResponse<Review>>(`/reviews/${uuid}/moderate`, { status })
    return res.data.data!
  },
}

export default reviewsService
