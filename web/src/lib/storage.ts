import { STORAGE_KEYS } from './constants'
import { safeJsonParse } from './utils'
import type { UserRead } from '@/types/user'
import type { TokenPair } from '@/types/auth'

export const storage = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },

  getUser<T = UserRead>(): T | null {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    return safeJsonParse<T | null>(data, null)
  },

  setTokens(tokens: TokenPair): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token)
  },

  setUser(user: UserRead | null): void {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
    }
  },

  clearAuth(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES)
  },
}

export default storage
