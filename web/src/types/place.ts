import type { CategoryRead } from './category'
import type { PaginatedResponse } from './common'

export interface PlaceImage {
  id?: string | number
  uuid?: string
  image_url: string
  thumbnail_url?: string | null
  caption?: string | null
  is_cover?: boolean
}

export interface PlaceRead {
  uuid: string
  id?: string | number
  name: string
  slug: string
  description?: string | null
  short_description?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postal_code?: string | null
  latitude: number
  longitude: number
  category_id?: string | number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category?: CategoryRead | any
  rating: number
  avg_rating: number
  review_count: number
  total_reviews: number
  total_favorites?: number
  is_favorite?: boolean
  is_favorited?: boolean
  cover_image_url?: string | null
  image_url?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images?: any[] | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  opening_hours?: Record<string, string> | string | any | null
  entry_fee?: string | number | null
  best_time_to_visit?: string | null
  history?: string | null
  status: 'published' | 'draft' | 'archived' | string
  is_featured?: boolean
  distance_km?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export type Place = PlaceRead
export type PlaceListItem = PlaceRead
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlaceCreateParams = Partial<PlaceRead> & { name: string } & any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PlaceUpdateParams = Partial<PlaceRead> & any
export type PaginatedPlacesResponse = PaginatedResponse<PlaceRead>

export interface PlaceFilters {
  query?: string
  search?: string
  category_slug?: string
  category_id?: string | number
  city?: string
  status?: string
  min_rating?: number
  is_featured?: boolean
  lat?: number
  lng?: number
  radius_km?: number
  page?: number
  page_size?: number
}

export type PlaceFilterParams = PlaceFilters
