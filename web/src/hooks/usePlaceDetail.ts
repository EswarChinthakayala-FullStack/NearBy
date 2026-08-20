import { useQuery } from '@tanstack/react-query'
import placesService from '@/services/api/places.service'
import type { Place } from '@/types/place'

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Hook to fetch detailed place information by UUID or slug
 */
export const usePlaceDetail = (uuidOrSlug: string) => {
  return useQuery<Place | null, Error>({
    queryKey: ['place', uuidOrSlug],
    queryFn: async () => {
      if (!uuidOrSlug) return null
      return IS_UUID_REGEX.test(uuidOrSlug)
        ? placesService.getPlaceByUuid(uuidOrSlug)
        : placesService.getPlaceBySlug(uuidOrSlug)
    },
    enabled: !!uuidOrSlug,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

export default usePlaceDetail
