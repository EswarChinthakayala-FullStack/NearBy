import { useMutation, useQueryClient } from '@tanstack/react-query'
import adminModerationApi from '@/services/api/adminModerationApi'
import { toast } from 'sonner'

/**
 * Mutation hook to dispatch OpenStreetMap spatial import task
 */
export const useTriggerOsmSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (city: string) => adminModerationApi.triggerOsmSync(city),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`OSM sync job triggered (Task ID: ${data.task_id})`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger OSM sync task.')
    },
  })
}

/**
 * Mutation hook to dispatch Wikipedia content enrichment task
 */
export const useTriggerWikipediaSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => adminModerationApi.triggerWikipediaSync(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Wikipedia enrichment job triggered (Task ID: ${data.task_id})`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger Wikipedia sync.')
    },
  })
}

/**
 * Mutation hook to dispatch Wikipedia sync for a specific place
 */
export const useTriggerPlaceWikipediaSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => adminModerationApi.triggerPlaceWikipediaSync(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      toast.success('Wikipedia enrichment triggered for place.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger place Wikipedia sync.')
    },
  })
}

/**
 * Mutation hook to dispatch image acquisition task for a specific place
 */
export const useTriggerPlaceImagesSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => adminModerationApi.triggerImageSync(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminSyncLogs'] })
      toast.success('Image acquisition job triggered for place.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger place image sync.')
    },
  })
}
