import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { storage } from '@/lib/storage'
import { useAuthStore } from '@/store/authStore'
import { handleApiError } from '@/lib/error-handler'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// In-flight refresh token lock & pending request queue
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else if (token) {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

/**
 * Request Interceptor: Automatically attach Bearer JWT access token
 */
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken() || useAuthStore.getState().accessToken
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(handleApiError(error))
)

/**
 * Response Interceptor: Handle HTTP status errors & Single-flight 401 JWT Refresh Token Rotation
 */
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config

    if (!error.response) {
      return Promise.reject(handleApiError(error))
    }

    // 401 Unauthorized handling for automatic token rotation
    if (error.response.status === 401 && !originalRequest._retry) {
      // Avoid refreshing on auth endpoints (login, register, refresh)
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(handleApiError(error))
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = storage.getRefreshToken() || useAuthStore.getState().refreshToken

      if (!refreshToken) {
        isRefreshing = false
        useAuthStore.getState().clearSession()
        return Promise.reject(handleApiError(error))
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const newTokens = response.data?.data
        if (newTokens?.access_token) {
          useAuthStore.getState().setTokens(newTokens)
          processQueue(null, newTokens.access_token)
          originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`
          return axiosClient(originalRequest)
        } else {
          throw new Error('Invalid token response payload')
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        useAuthStore.getState().clearSession()
        return Promise.reject(handleApiError(refreshErr))
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(handleApiError(error))
  }
)

export default axiosClient
