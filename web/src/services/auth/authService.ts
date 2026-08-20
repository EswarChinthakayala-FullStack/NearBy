import axiosClient from '../api/axiosClient'
import { API_PATHS } from '@/lib/constants'
import type { ResponseModel } from '@/types/common'
import type { LoginRequest, RegisterRequest, TokenPair } from '@/types/auth'
import type { UserRead, UserUpdate, PasswordChange } from '@/types/user'

export const authService = {
  async login(credentials: LoginRequest): Promise<ResponseModel<TokenPair>> {
    const response = await axiosClient.post<ResponseModel<TokenPair>>(
      API_PATHS.AUTH.LOGIN,
      credentials
    )
    return response.data
  },

  async register(data: RegisterRequest): Promise<ResponseModel<UserRead>> {
    const response = await axiosClient.post<ResponseModel<UserRead>>(
      API_PATHS.AUTH.REGISTER,
      data
    )
    return response.data
  },

  async getProfile(): Promise<ResponseModel<UserRead>> {
    const response = await axiosClient.get<ResponseModel<UserRead>>(API_PATHS.USERS.ME)
    return response.data
  },

  async updateProfile(data: UserUpdate): Promise<ResponseModel<UserRead>> {
    const response = await axiosClient.patch<ResponseModel<UserRead>>(API_PATHS.USERS.ME, data)
    return response.data
  },

  async changePassword(data: PasswordChange): Promise<ResponseModel<Record<string, unknown>>> {
    const response = await axiosClient.post<ResponseModel<Record<string, unknown>>>(
      API_PATHS.USERS.CHANGE_PASSWORD,
      data
    )
    return response.data
  },

  async logout(): Promise<ResponseModel<Record<string, unknown>>> {
    try {
      const response = await axiosClient.post<ResponseModel<Record<string, unknown>>>(
        API_PATHS.AUTH.LOGOUT
      )
      return response.data
    } catch {
      return { success: true, message: 'Logged out locally', data: {} }
    }
  },
}

export default authService
