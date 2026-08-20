import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '@/services/api/authApi'
import { useAuthStore } from '@/store/authStore'
import { storage } from '@/lib/storage'
import type { LoginRequest, RegisterRequest } from '@/types/auth'
import type { UserUpdateParams, PasswordChangeParams } from '@/types/user'
import usersService from '@/services/api/users.service'
import { toast } from 'sonner'

export const useProfile = () => {
  const { setAuth } = useAuthStore()

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authApi.getMe()
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch user profile')
      }

      const user = response.data
      const token = storage.getAccessToken() || ''
      const refreshToken = storage.getRefreshToken() || ''

      setAuth(
        {
          access_token: token,
          refresh_token: refreshToken,
          token_type: 'bearer',
          expires_in: 3600,
        },
        user
      )

      return user
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  const { login } = useAuthStore()

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const loginRes = await authApi.login(credentials)
      if (!loginRes.success || !loginRes.data) {
        throw new Error(loginRes.message || 'Invalid email address or password')
      }

      const tokenPair = loginRes.data
      storage.setTokens(tokenPair)

      const profileRes = await authApi.getMe()
      if (!profileRes.success || !profileRes.data) {
        throw new Error('Failed to retrieve user profile after authentication')
      }

      const user = profileRes.data
      login(tokenPair, user)

      return { tokenPair, user }
    },
    onSuccess: ({ user }) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      toast.success(`Welcome back, ${user.full_name || user.name}!`)
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Authentication failed. Please check your credentials.')
    },
  })
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await authApi.register(data)
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Registration failed')
      }
      return response.data
    },
    onSuccess: () => {
      toast.success('Account created successfully! Please sign in with your credentials.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Registration failed. Please check input parameters.')
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout()
      queryClient.clear()
      toast.info('Signed out successfully.')
    },
    onError: () => {
      logout()
      queryClient.clear()
      toast.info('Signed out.')
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (params: UserUpdateParams) => usersService.updateMe(params),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      queryClient.setQueryData(['profile'], updatedUser)
      toast.success('Profile details updated successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update profile.')
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (params: PasswordChangeParams) => usersService.changePassword(params),
    onSuccess: () => {
      toast.success('Password updated successfully.')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Password update failed.')
    },
  })
}

export default useAuthStore
