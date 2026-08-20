import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import adminPlacesApi from '@/services/api/adminPlacesApi'
import type { PlaceFilterParams, PlaceCreateParams, PlaceUpdateParams } from '@/types/place'
import { toast } from 'sonner'

/**
 * Hook to fetch paginated list of places with optional search, filter & pagination parameters
 */
export const useAdminPlaces = (params?: PlaceFilterParams) => {
  return useQuery({
    queryKey: ['adminPlaces', params],
    queryFn: () => adminPlacesApi.list(params),
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * Hook to fetch single place details by UUID
 */
export const useAdminPlace = (uuid?: string) => {
  return useQuery({
    queryKey: ['adminPlace', uuid],
    queryFn: () => adminPlacesApi.getById(uuid!),
    enabled: !!uuid,
  })
}

/**
 * Mutation hook to create a new place
 */
export const useCreatePlace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlaceCreateParams) => adminPlacesApi.create(data),
    onSuccess: (place) => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Place "${place.name}" created successfully.`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create tourist place.')
    },
  })
}

/**
 * Mutation hook to update an existing place
 */
export const useUpdatePlace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: PlaceUpdateParams }) =>
      adminPlacesApi.update(uuid, data),
    onSuccess: (place) => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      queryClient.invalidateQueries({ queryKey: ['adminPlace', place.uuid] })
      queryClient.invalidateQueries({ queryKey: ['places'] })
      toast.success(`Place "${place.name}" updated successfully.`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update place details.')
    },
  })
}

/**
 * Mutation hook to delete a place
 */
export const useDeletePlace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => adminPlacesApi.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success('Place deleted successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete place.')
    },
  })
}

/**
 * Mutation hook to publish a place
 */
export const usePublishPlace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => adminPlacesApi.publish(uuid),
    onSuccess: (place) => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Place "${place.name}" published successfully.`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to publish place.')
    },
  })
}

/**
 * Mutation hook to archive a place
 */
export const useArchivePlace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => adminPlacesApi.archive(uuid),
    onSuccess: (place) => {
      queryClient.invalidateQueries({ queryKey: ['adminPlaces'] })
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] })
      toast.success(`Place "${place.name}" archived.`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to archive place.')
    },
  })
}

export default useAdminPlaces
