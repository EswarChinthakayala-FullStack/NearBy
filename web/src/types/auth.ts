import type { UserRead } from './user'
import type { ResponseModel } from './common'

export type UserRole = 'user' | 'admin' | string
export type AuthResponse<T = unknown> = ResponseModel<T>

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthState {
  user: UserRead | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (tokenPair: TokenPair, user: UserRead) => void
  logout: () => Promise<void>
  setAuth: (tokenPair: TokenPair, user: UserRead) => void
  setUser: (user: UserRead | null) => void
  setTokens: (tokens: TokenPair) => void
  clearSession: () => void
  restoreSession: () => Promise<void>
  updateProfileState: (updatedUser: Partial<UserRead>) => void
}
