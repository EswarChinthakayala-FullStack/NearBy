import axiosClient from './axiosClient'
import { API_PATHS } from '@/lib/constants'
import type { ResponseModel } from '@/types/common'
import type { LoginRequest, RegisterRequest, RefreshRequest, TokenPair } from '@/types/auth'
import type { UserRead } from '@/types/user'

/**
 * Enterprise Authentication API Service
 * Thin Axios wrappers around FastAPI /auth and /users endpoints
 */
export const authApi = {
  /**
   * User login with email & password -> TokenPair
   */
  async login(credentials: LoginRequest): Promise<ResponseModel<TokenPair>> {
    const response = await axiosClient.post<ResponseModel<TokenPair>>(
      API_PATHS.AUTH.LOGIN,
      credentials
    )
    return response.data
  },

  /**
   * User registration -> UserRead
   */
  async register(data: RegisterRequest): Promise<ResponseModel<UserRead>> {
    const response = await axiosClient.post<ResponseModel<UserRead>>(
      API_PATHS.AUTH.REGISTER,
      data
    )
    return response.data
  },

  /**
   * Refresh JWT access token -> TokenPair
   */
  async refresh(refreshToken: string): Promise<ResponseModel<TokenPair>> {
    const payload: RefreshRequest = { refresh_token: refreshToken }
    const response = await axiosClient.post<ResponseModel<TokenPair>>(
      API_PATHS.AUTH.REFRESH,
      payload
    )
    return response.data
  },

  /**
   * Logout user session -> status response
   */
  async logout(): Promise<ResponseModel<Record<string, unknown>>> {
    try {
      const response = await axiosClient.post<ResponseModel<Record<string, unknown>>>(
        API_PATHS.AUTH.LOGOUT
      )
      return response.data
    } catch {
      return { success: true, message: 'Signed out locally', data: {} }
    }
  },

  /**
   * Get current authenticated user profile -> UserRead
   */
  async getMe(): Promise<ResponseModel<UserRead>> {
    const response = await axiosClient.get<ResponseModel<UserRead>>(API_PATHS.USERS.ME)
    return response.data
  },
}

export default authApi
