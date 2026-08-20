/**
 * Pagination Metadata Envelope (matches FastAPI PaginationMeta)
 */
export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

/**
 * Standardized Single Resource Response Envelope (matches FastAPI ResponseModel[T])
 */
export interface ResponseModel<T = unknown> {
  success: boolean
  message: string
  data: T | null
}

/**
 * Standardized Paginated Response Envelope (matches FastAPI PaginatedResponse[T])
 */
export interface PaginatedResponse<T = unknown> {
  success: boolean
  message: string
  data: T[]
  pagination: PaginationMeta
}

/**
 * Standardized API Error Response
 */
export interface ErrorResponse {
  success: false
  message: string
  error_code?: string
  details?: Record<string, unknown> | unknown[]
}

/**
 * Generic Query Parameters for Filters & Pagination
 */
export interface QueryParams {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  [key: string]: unknown
}
