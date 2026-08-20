import type { UserRead } from './user'
import type { PlaceRead } from './place'
import type { PaginatedResponse } from './common'

export interface ReviewImage {
  uuid?: string
  image_url?: string
}

export interface ReviewRead {
  uuid: string
  place_uuid: string
  user_uuid: string
  rating: number
  comment?: string | null
  status: 'approved' | 'pending' | 'rejected' | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images?: any[] | null
  user?: UserRead | null
  place?: PlaceRead | null
  created_at?: string | null
}

export type Review = ReviewRead

export interface ReviewCreate {
  place_uuid?: string
  rating: number
  comment?: string
  images?: string[]
}

export type ReviewCreateParams = ReviewCreate
export type ReviewUpdateParams = Partial<ReviewCreate>
export type PaginatedReviewsResponse = PaginatedResponse<ReviewRead>

export interface ReviewModeration {
  status: 'approved' | 'rejected'
  moderation_notes?: string
}
