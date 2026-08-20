import { axiosClient } from './axiosClient'
import type { Place } from '@/types/place'

export interface PlaceQueryParams {
  query?: string
  category_id?: number
  category_slug?: string
  city?: string
  min_rating?: number
  sort_by?: string
  page?: number
  limit?: number
}

export interface PlacesResponseData {
  items?: Place[]
  data?: Place[]
  total?: number
}

export const placesApi = {
  getPlaces: async (params?: PlaceQueryParams): Promise<PlacesResponseData> => {
    const response = await axiosClient.get('/places', { params })
    return response.data
  },

  getPlaceBySlugOrUuid: async (idOrSlug: string): Promise<Place> => {
    const response = await axiosClient.get(`/places/${idOrSlug}`)
    return response.data.data || response.data
  },
}

export default placesApi
