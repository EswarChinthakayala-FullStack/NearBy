import { useQuery } from '@tanstack/react-query'
import directionsService from '@/services/api/directions.service'

export const useDirections = (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ['directions', originLat, originLng, destLat, destLng],
    queryFn: () => directionsService.getDirections(originLat, originLng, destLat, destLng),
    enabled: enabled && originLat !== 0 && destLat !== 0,
    staleTime: 1000 * 60 * 10,
  })
}

export default useDirections
