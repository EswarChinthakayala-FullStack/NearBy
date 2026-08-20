import apiClient from './client'
import type { RouteResponse } from '@/types/map'
import type { AuthResponse } from '@/types/auth'

export const directionsService = {
  getDirections: async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteResponse> => {
    const res = await apiClient.get<AuthResponse<RouteResponse>>('/directions', {
      params: {
        origin_lat: originLat,
        origin_lng: originLng,
        dest_lat: destLat,
        dest_lng: destLng,
      },
    })
    return res.data.data!
  },
}

export default directionsService
