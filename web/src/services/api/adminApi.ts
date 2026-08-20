import adminService from './admin.service'

/**
 * Enterprise Admin API Service
 * Thin Axios wrappers around FastAPI /admin endpoints
 */
export const adminApi = {
  getDashboardSummary: adminService.getDashboardStats,
  getActivityLogs: adminService.getActivityLogs,
  getSyncLogs: adminService.getSyncLogs,
  triggerOsmSync: adminService.triggerOsmSync,
  triggerWikipediaSync: adminService.triggerWikipediaSync,
  triggerPlaceWikipediaSync: adminService.triggerPlaceWikipediaSync,
  triggerImageSync: adminService.triggerPlaceImagesSync,
  getPendingReviews: adminService.getModerationQueue,
}

export default adminApi
