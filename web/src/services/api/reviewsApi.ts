import reviewsService from './reviews.service'

/**
 * Enterprise Reviews API Service
 * Thin Axios wrappers around FastAPI /reviews endpoints
 */
export const reviewsApi = {
  list: reviewsService.getPlaceReviews,
  create: reviewsService.submitReview,
  update: reviewsService.updateReview,
  delete: reviewsService.deleteReview,
  moderate: reviewsService.moderateReview,
}

export default reviewsApi
