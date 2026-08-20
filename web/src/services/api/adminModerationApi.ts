import adminService from './admin.service'
import reviewsService from './reviews.service'

/**
 * Enterprise Admin Moderation & Sync API Service
 * Thin Axios wrappers around FastAPI /admin and /reviews endpoints
 */
export const adminModerationApi = {
  getPendingReviews: adminService.getModerationQueue,
  moderateReview: reviewsService.moderateReview,
  getSyncLogs: adminService.getSyncLogs,
  triggerOsmSync: adminService.triggerOsmSync,
  triggerWikipediaSync: adminService.triggerWikipediaSync,
  triggerPlaceWikipediaSync: adminService.triggerPlaceWikipediaSync,
  triggerImageSync: adminService.triggerPlaceImagesSync,
}

export default adminModerationApi
