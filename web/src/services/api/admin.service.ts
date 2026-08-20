import apiClient from './client'
import type { AuthResponse } from '@/types/auth'
import type { PaginatedReviewsResponse } from '@/types/review'

export interface SyncTaskResponse {
  task_id: string
  place_uuid?: string
}

export interface SyncLogItem {
  id: number
  sync_type: string
  region?: string
  status: string
  total_fetched: number
  total_imported: number
  total_skipped: number
  started_at?: string
  finished_at?: string
}

export interface ActivityLogItem {
  id: number
  admin_id: number
  action: string
  entity_type: string
  entity_id: string
  created_at?: string
}

export interface DashboardStats {
  total_places: number
  published_places: number
  draft_places: number
  total_categories: number
  total_reviews: number
  pending_reviews: number
  approved_reviews: number
  total_users: number
  active_users: number
  total_favorites: number
  total_images: number
  last_sync_status: string
  last_sync_time?: string | null
}

export const adminService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<AuthResponse<DashboardStats>>('/admin/stats')
    return res.data.data!
  },

  triggerOsmSync: async (city = 'Delhi'): Promise<SyncTaskResponse> => {
    const res = await apiClient.post<AuthResponse<SyncTaskResponse>>('/admin/sync/osm', null, {
      params: { city },
    })
    return res.data.data!
  },

  triggerWikipediaSync: async (): Promise<SyncTaskResponse> => {
    const res = await apiClient.post<AuthResponse<SyncTaskResponse>>('/admin/sync/wikipedia')
    return res.data.data!
  },

  triggerPlaceWikipediaSync: async (uuid: string): Promise<SyncTaskResponse> => {
    const res = await apiClient.post<AuthResponse<SyncTaskResponse>>(`/admin/sync/wikipedia/${uuid}`)
    return res.data.data!
  },

  triggerPlaceImagesSync: async (uuid: string): Promise<SyncTaskResponse> => {
    const res = await apiClient.post<AuthResponse<SyncTaskResponse>>(`/admin/sync/images/${uuid}`)
    return res.data.data!
  },

  getSyncLogs: async (page = 1, pageSize = 20) => {
    const res = await apiClient.get('/admin/sync-logs', {
      params: { page, page_size: pageSize },
    })
    return res.data
  },

  getAdminUsers: async (page = 1, pageSize = 20, search?: string, role?: string) => {
    const res = await apiClient.get('/admin/users', {
      params: { page, page_size: pageSize, search, role },
    })
    return res.data
  },

  toggleUserStatus: async (userId: number, isActive: boolean) => {
    const res = await apiClient.patch(`/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    })
    return res.data
  },

  updateUserRole: async (userId: number, role: string) => {
    const res = await apiClient.patch(`/admin/users/${userId}/role`, null, {
      params: { role },
    })
    return res.data
  },

  getModerationQueue: async (page = 1, pageSize = 20, status?: string): Promise<PaginatedReviewsResponse> => {
    const res = await apiClient.get<PaginatedReviewsResponse>('/admin/moderation', {
      params: { page, page_size: pageSize, status },
    })
    return res.data
  },

  getActivityLogs: async (page = 1, pageSize = 20) => {
    const res = await apiClient.get('/admin/activity-logs', {
      params: { page, page_size: pageSize },
    })
    return res.data
  },
}

export default adminService
