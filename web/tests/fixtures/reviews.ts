import type { Review } from '@/types/review'
import { mockRegularUser } from './users'

export const mockReviews: Review[] = [
  {
    uuid: 'review-uuid-1',
    rating: 5,
    comment: 'Breathtaking architecture and pristine grounds! Must visit during sunrise.',
    status: 'approved',
    user: mockRegularUser,
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    uuid: 'review-uuid-2',
    rating: 4,
    comment: 'Great historical insights, but long queue at ticket counter.',
    status: 'pending',
    user: mockRegularUser,
    created_at: '2026-03-02T14:30:00Z',
  },
]
