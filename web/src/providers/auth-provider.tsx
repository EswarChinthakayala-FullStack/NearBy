import React from 'react'
import { useAuthStore } from '@/store/authStore'
import type { AuthState } from '@/types/auth'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export { useAuthStore }
export type { AuthState }
export default useAuthStore
