import apiClient from './client'
import type { User, UserUpdateParams, PasswordChangeParams } from '@/types/user'
import type { AuthResponse } from '@/types/auth'

export const usersService = {
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<AuthResponse<User>>('/users/me')
    return res.data.data!
  },

  updateMe: async (params: UserUpdateParams): Promise<User> => {
    const res = await apiClient.patch<AuthResponse<User>>('/users/me', params)
    return res.data.data!
  },

  changePassword: async (params: PasswordChangeParams): Promise<void> => {
    await apiClient.post('/users/me/change-password', params)
  },

  getUserStats: async (): Promise<{ saved_places: number; reviews_count: number; trips_count: number; profile_completion_pct: number }> => {
    const res = await apiClient.get<AuthResponse<{ saved_places: number; reviews_count: number; trips_count: number; profile_completion_pct: number }>>('/users/me/stats')
    return res.data.data!
  },
}

export default usersService
