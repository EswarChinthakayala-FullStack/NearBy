import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import placesService from '@/services/api/places.service'
import type { PlaceFilterParams, PlaceCreateParams, PlaceUpdateParams } from '@/types/place'
import { toast } from 'sonner'

export const usePlaces = (params?: PlaceFilterParams) => {
  return useQuery({
    queryKey: ['places', params],
    queryFn: () => placesService.getPlaces(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const usePlaceDetail = (uuidOrSlug: string) => {
  return useQuery({
    queryKey: ['place', uuidOrSlug],
    queryFn: () => {
      if (!uuidOrSlug) return null
      return IS_UUID_REGEX.test(uuidOrSlug)
        ? placesService.getPlaceByUuid(uuidOrSlug)
        : placesService.getPlaceBySlug(uuidOrSlug)
    },
    enabled: !!uuidOrSlug,
  })
}

export const useNearbyPlaces = (latitude: number, longitude: number, radiusKm = 10, limit = 20) => {
  return useQuery({
    queryKey: ['nearbyPlaces', latitude, longitude, radiusKm, limit],
    queryFn: () => placesService.getNearbyPlaces({ latitude, longitude, radius_km: radiusKm, limit }),
    enabled: latitude !== 0 || longitude !== 0,
  })
}

export const useCreatePlace = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlaceCreateParams) => placesService.createPlace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      toast.success('Tourist place created successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create place.')
    },
  })
}

export const useUpdatePlace = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: PlaceUpdateParams }) =>
      placesService.updatePlace(uuid, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      queryClient.invalidateQueries({ queryKey: ['place', variables.uuid] })
      toast.success('Place updated successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update place.')
    },
  })
}

export const useDeletePlace = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (uuid: string) => placesService.deletePlace(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      toast.success('Place removed permanently.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete place.')
    },
  })
}
