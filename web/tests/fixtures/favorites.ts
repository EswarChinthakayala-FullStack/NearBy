import type { Favorite } from '@/types/favorite'
import { mockPlaceListItems } from './places'

export const mockFavorites: Favorite[] = [
  {
    id: 1,
    user_id: 1,
    place_id: 1,
    created_at: '2026-02-15T12:00:00Z',
    place: mockPlaceListItems[0],
  },
]
