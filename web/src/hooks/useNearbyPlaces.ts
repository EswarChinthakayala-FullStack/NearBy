import { useQuery } from '@tanstack/react-query'
import placesService from '@/services/api/places.service'
import type { PlaceListItem } from '@/types/place'

/**
 * Hook to fetch nearby tourist places from spatial backend engine
 */
export const useNearbyPlaces = (
  latitude: number,
  longitude: number,
  radiusKm = 10,
  limit = 20
) => {
  return useQuery<PlaceListItem[], Error>({
    queryKey: ['nearby', latitude, longitude, radiusKm, limit],
    queryFn: () =>
      placesService.getNearbyPlaces({
        latitude,
        longitude,
        radius_km: radiusKm,
        limit,
      }),
    enabled: latitude !== 0 && longitude !== 0,
    staleTime: 1000 * 60 * 3, // 3 minutes cache
  })
}

export default useNearbyPlaces
