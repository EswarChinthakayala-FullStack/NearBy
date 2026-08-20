import apiClient from './client'
import type { LoginRequest, RegisterRequest, TokenPair, AuthResponse } from '@/types/auth'
import type { User } from '@/types/user'

export const authService = {
  login: async (credentials: LoginRequest): Promise<TokenPair> => {
    const res = await apiClient.post<AuthResponse<TokenPair>>('/auth/login', credentials)
    return res.data.data!
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const res = await apiClient.post<AuthResponse<User>>('/auth/register', data)
    return res.data.data!
  },

  refreshToken: async (refreshToken: string): Promise<TokenPair> => {
    const res = await apiClient.post<AuthResponse<TokenPair>>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return res.data.data!
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}

export default authService
