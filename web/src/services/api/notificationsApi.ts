import { axiosClient } from './axiosClient'

export interface NotificationItem {
  uuid: string
  title: string
  message: string
  type: string
  is_read: boolean
  link_url?: string | null
  created_at: string
}

export const notificationsApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await axiosClient.get('/notifications')
    return response.data.data || []
  },

  markRead: async (uuid: string): Promise<NotificationItem> => {
    const response = await axiosClient.patch(`/notifications/${uuid}/read`)
    return response.data.data
  },

  markAllRead: async (): Promise<void> => {
    await axiosClient.put('/notifications/mark-all-read')
  },

  deleteNotification: async (uuid: string): Promise<void> => {
    await axiosClient.delete(`/notifications/${uuid}`)
  },

  clearAll: async (): Promise<void> => {
    await axiosClient.delete('/notifications/clear-all')
  },
}
