import { axiosClient } from './axiosClient'
import type { Place } from '@/types/place'

export interface NearbyQueryParams {
  latitude: number
  longitude: number
  radius_km?: number
  limit?: number
}

export const nearbyApi = {
  getNearbyPlaces: async (params: NearbyQueryParams): Promise<Place[]> => {
    const response = await axiosClient.get('/places/nearby', { params })
    return response.data.data || response.data
  },
}

export default nearbyApi
