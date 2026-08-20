import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi, type NotificationItem } from '@/services/api/notificationsApi'

export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    staleTime: 30 * 1000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => notificationsApi.markRead(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => notificationsApi.deleteNotification(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useClearAllNotifications() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
