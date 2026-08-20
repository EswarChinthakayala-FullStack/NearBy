import axios from 'axios'

export class ApiError extends Error {
  public statusCode: number
  public details?: unknown

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Normalizes HTTP or API response exceptions into a user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return String(error.response.data.message)
    }
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail
      if (typeof detail === 'string') return detail
      if (Array.isArray(detail) && detail.length > 0) {
        return detail[0].msg || JSON.stringify(detail[0])
      }
    }
    if (error.message === 'Network Error') {
      return 'Unable to connect to the server. Please check your network connection.'
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.'
    }
    return `Server returned status ${error.response?.status || 'Error'}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

export function handleApiError(error: unknown): ApiError {
  const message = getErrorMessage(error)
  const statusCode = axios.isAxiosError(error) ? error.response?.status || 500 : 500
  return new ApiError(message, statusCode, error)
}
