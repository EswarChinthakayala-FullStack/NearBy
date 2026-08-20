import { useQuery } from '@tanstack/react-query'
import { placesApi, type PlaceQueryParams } from '@/services/api/placesApi'

export function useBrowsePlaces(params: PlaceQueryParams = {}) {
  return useQuery({
    queryKey: ['browse-places', params],
    queryFn: () => placesApi.getPlaces(params),
    staleTime: 5 * 60 * 1000,
  })
}

export default useBrowsePlaces
