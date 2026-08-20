import { create } from 'zustand'
import { storage } from '@/lib/storage'
import { authService } from '@/services/auth/authService'
import type { AuthState, TokenPair } from '@/types/auth'
import type { UserRead } from '@/types/user'

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  login: (tokenPair: TokenPair, user: UserRead) => {
    storage.setTokens(tokenPair)
    storage.setUser(user)
    set({
      user,
      accessToken: tokenPair.access_token,
      refreshToken: tokenPair.refresh_token,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    })
  },

  setAuth: (tokenPair: TokenPair, user: UserRead) => {
    get().login(tokenPair, user)
  },

  setUser: (user: UserRead | null) => {
    storage.setUser(user)
    set({
      user,
      isAuthenticated: !!user && !!get().accessToken,
    })
  },

  setTokens: (tokens: TokenPair) => {
    storage.setTokens(tokens)
    set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      isAuthenticated: !!get().user && !!tokens.access_token,
    })
  },

  clearSession: () => {
    storage.clearAuth()
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    })
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
    } finally {
      get().clearSession()
    }
  },

  restoreSession: async () => {
    set({ isLoading: true })
    const storedAccessToken = storage.getAccessToken()
    const storedRefreshToken = storage.getRefreshToken()
    const storedUser = storage.getUser<UserRead>()

    if (!storedAccessToken && !storedRefreshToken) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      })
      return
    }

    set({
      accessToken: storedAccessToken,
      refreshToken: storedRefreshToken,
      user: storedUser,
    })

    try {
      // Validate current session against live backend /users/me endpoint
      const response = await authService.getProfile()
      if (response.success && response.data) {
        storage.setUser(response.data)
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        })
      } else {
        get().clearSession()
      }
    } catch {
      // If token validation fails, clear session cleanly
      get().clearSession()
    }
  },

  updateProfileState: (updatedUser: Partial<UserRead>) => {
    const currentUser = get().user
    if (!currentUser) return
    const newProfile = { ...currentUser, ...updatedUser }
    storage.setUser(newProfile)
    set({ user: newProfile })
  },
}))

export default useAuthStore
