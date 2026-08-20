import { useQuery } from '@tanstack/react-query'
import { nearbyApi, type NearbyQueryParams } from '@/services/api/nearbyApi'

export function useNearbyRadar(params: NearbyQueryParams | null) {
  return useQuery({
    queryKey: ['nearby-radar', params],
    queryFn: () => (params ? nearbyApi.getNearbyPlaces(params) : Promise.resolve([])),
    enabled: Boolean(params && params.latitude && params.longitude),
    staleTime: 2 * 60 * 1000,
  })
}

export default useNearbyRadar
