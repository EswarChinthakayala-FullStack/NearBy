import type { PlaceRead } from './place'
import type { ResponseModel, PaginatedResponse } from './common'

export interface FavoriteRead {
  uuid: string
  user_uuid: string
  place_uuid: string
  created_at?: string | null
  place?: PlaceRead | null
}

export type Favorite = FavoriteRead
export interface FavoriteToggleData {
  is_favorite: boolean
  is_favorited: boolean
  total_favorites: number
  message?: string
}
export type FavoriteToggleResponse = ResponseModel<FavoriteToggleData> & FavoriteToggleData
export type PaginatedFavoritesResponse = PaginatedResponse<FavoriteRead>
