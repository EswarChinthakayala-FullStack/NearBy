import apiClient from './client'
import type { FavoriteToggleResponse, PaginatedFavoritesResponse } from '@/types/favorite'

export const favoritesService = {
  getFavorites: async (page = 1, pageSize = 20): Promise<PaginatedFavoritesResponse> => {
    const res = await apiClient.get<PaginatedFavoritesResponse>('/favorites', {
      params: { page, page_size: pageSize },
    })
    return res.data
  },

  toggleFavorite: async (placeUuid: string): Promise<FavoriteToggleResponse> => {
    const res = await apiClient.post<FavoriteToggleResponse>(
      `/favorites/${placeUuid}/toggle`
    )
    return res.data
  },

  removeFavorite: async (placeUuid: string): Promise<void> => {
    await apiClient.delete(`/favorites/${placeUuid}`)
  },
}

export default favoritesService
