import axiosClient from '@/services/api/axiosClient'
import type { PlaceRead as Place } from '@/types/place'
import type { CategoryRead as Category } from '@/types/category'

export type { Place, Category }

export interface PlatformStats {
  travelers_count: number
  cities_count: number
  places_count: number
  availability_rate: number
}

const PUBLIC_STATS_DEFAULT: PlatformStats = {
  travelers_count: 5200,
  cities_count: 50,
  places_count: 12500,
  availability_rate: 99.9,
}

export const api = {
  async getPlaces(params?: Record<string, any>): Promise<Place[]> {
    try {
      const response = await axiosClient.get('/places', { params })
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getFeaturedPlaces(): Promise<Place[]> {
    try {
      const response = await axiosClient.get('/places', {
        params: { limit: 6, is_featured: true },
      })
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await axiosClient.get('/categories')
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getPopularDestinations(): Promise<Place[]> {
    try {
      const response = await axiosClient.get('/places', {
        params: { limit: 6, sort: 'rating' },
      })
      const data = response.data?.data || response.data
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  async getPlatformStats(): Promise<PlatformStats> {
    // Public landing page statistics presentation (avoids 401 on admin-only route)
    return PUBLIC_STATS_DEFAULT
  },
}
