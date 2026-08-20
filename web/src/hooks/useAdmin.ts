import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminService from '@/services/api/admin.service'
import placesService from '@/services/api/places.service'
import { toast } from 'sonner'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 1000 * 60 * 2,
  })
}

export const usePendingReviews = (page = 1, pageSize = 20, status = 'pending') => {
  return useQuery({
    queryKey: ['adminPendingReviews', page, pageSize, status],
    queryFn: () => adminService.getModerationQueue(page, pageSize, status),
  })
}

export const useActivityLogs = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['adminActivityLogs', page, pageSize],
    queryFn: () => adminService.getActivityLogs(page, pageSize),
  })
}

export const useSyncLogs = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['adminSyncLogs', page, pageSize],
    queryFn: () => adminService.getSyncLogs(page, pageSize),
  })
}

export const useTriggerOsmSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (city: string) => adminService.triggerOsmSync(city),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`OSM sync job triggered (Task ID: ${data.task_id})`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger OSM sync')
    },
  })
}

export const useTriggerWikipediaSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => adminService.triggerWikipediaSync(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Wikipedia enrichment job triggered (Task ID: ${data.task_id})`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger Wikipedia sync')
    },
  })
}

export const useTriggerPlaceWikipediaSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => adminService.triggerPlaceWikipediaSync(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      toast.success(`Wikipedia enrichment triggered for place`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger place Wikipedia sync')
    },
  })
}

export const useTriggerPlaceImagesSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => adminService.triggerPlaceImagesSync(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      toast.success(`Image acquisition job triggered for place`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger place images sync')
    },
  })
}

export const useBulkPublishPlaces = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uuids: string[]) => {
      await Promise.all(uuids.map((uuid) => placesService.publishPlace(uuid)))
    },
    onSuccess: (_, uuids) => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Published ${uuids.length} place(s) successfully.`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bulk publish failed')
    },
  })
}

export const useBulkArchivePlaces = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uuids: string[]) => {
      await Promise.all(uuids.map((uuid) => placesService.archivePlace(uuid)))
    },
    onSuccess: (_, uuids) => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Archived ${uuids.length} place(s) successfully.`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bulk archive failed')
    },
  })
}

export const useBulkDeletePlaces = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (uuids: string[]) => {
      await Promise.all(uuids.map((uuid) => placesService.deletePlace(uuid)))
    },
    onSuccess: (_, uuids) => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Deleted ${uuids.length} place(s) successfully.`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Bulk delete failed')
    },
  })
}

export const useAdminUsers = (page = 1, pageSize = 20, search?: string, role?: string) => {
  return useQuery({
    queryKey: ['adminUsers', page, pageSize, search, role],
    queryFn: () => adminService.getAdminUsers(page, pageSize, search, role),
  })
}

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      adminService.toggleUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success(`User status updated`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update user status')
    },
  })
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] })
      toast.success(`User role updated`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update user role')
    },
  })
}

export default useDashboardStats
