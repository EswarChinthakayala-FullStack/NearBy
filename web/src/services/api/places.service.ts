import apiClient from './client'
import type {
  Place,
  PlaceListItem,
  PlaceFilterParams,
  PlaceCreateParams,
  PlaceUpdateParams,
  PaginatedPlacesResponse,
} from '@/types/place'
import type { AuthResponse } from '@/types/auth'

export const placesService = {
  getPlaces: async (params?: PlaceFilterParams): Promise<PaginatedPlacesResponse> => {
    const res = await apiClient.get<PaginatedPlacesResponse>('/places', { params })
    return res.data
  },

  getPlaceByUuid: async (uuid: string): Promise<Place> => {
    const res = await apiClient.get<AuthResponse<Place>>(`/places/${uuid}`)
    return res.data.data!
  },

  getPlaceBySlug: async (slug: string): Promise<Place> => {
    const res = await apiClient.get<AuthResponse<Place>>(`/places/slug/${slug}`)
    return res.data.data!
  },

  getNearbyPlaces: async (params: {
    latitude: number
    longitude: number
    radius_km?: number
    limit?: number
  }): Promise<PlaceListItem[]> => {
    const res = await apiClient.get<AuthResponse<PlaceListItem[]>>('/places/nearby', { params })
    return res.data.data || []
  },

  createPlace: async (data: PlaceCreateParams): Promise<Place> => {
    const res = await apiClient.post<AuthResponse<Place>>('/places', data)
    return res.data.data!
  },

  updatePlace: async (uuid: string, data: PlaceUpdateParams): Promise<Place> => {
    const res = await apiClient.patch<AuthResponse<Place>>(`/places/${uuid}`, data)
    return res.data.data!
  },

  deletePlace: async (uuid: string): Promise<void> => {
    await apiClient.delete(`/places/${uuid}`)
  },

  publishPlace: async (uuid: string): Promise<Place> => {
    const res = await apiClient.post<AuthResponse<Place>>(`/places/${uuid}/publish`)
    return res.data.data!
  },

  archivePlace: async (uuid: string): Promise<Place> => {
    const res = await apiClient.post<AuthResponse<Place>>(`/places/${uuid}/archive`)
    return res.data.data!
  },
}

export default placesService
