import type { User } from '@/types/user'

export const mockUser: User = {
  id: 1,
  email: 'admin@nearby.com',
  full_name: 'System Admin',
  name: 'System Admin',
  role: 'admin',
  is_active: true,
  is_verified: true,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  phone: '+91 9876543210',
  created_at: '2026-01-01T00:00:00Z',
}

export const mockRegularUser: User = {
  id: 2,
  email: 'traveler@nearby.com',
  full_name: 'John Traveler',
  name: 'John Traveler',
  role: 'user',
  is_active: true,
  is_verified: true,
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  phone: '+91 9876543211',
  created_at: '2026-02-01T00:00:00Z',
}
