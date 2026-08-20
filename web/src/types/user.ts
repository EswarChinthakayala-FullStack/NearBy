export interface UserRead {
  uuid: string
  id?: string | number
  full_name: string
  name?: string
  email: string
  phone?: string | null
  phone_number?: string | null
  role: 'user' | 'admin' | string
  avatar_url?: string | null
  avatarUrl?: string | null
  is_active: boolean
  is_verified: boolean
  created_at?: string | null
  createdAt?: string | null
}

export type User = UserRead
export type UserResponse = UserRead

export interface UserUpdate {
  full_name?: string
  phone?: string
  avatar_url?: string
}

export type UserUpdateParams = UserUpdate

export interface PasswordChange {
  current_password: string
  new_password: string
}

export type PasswordChangeParams = PasswordChange
