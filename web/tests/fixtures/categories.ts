import type { Category } from '@/types/category'

export const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Historical Landmarks',
    slug: 'historical-landmarks',
    description: 'Ancient monuments, heritage sites, and historical forts',
    icon_name: 'landmark',
    place_count: 12,
  },
  {
    id: 2,
    name: 'Beaches & Coastal',
    slug: 'beaches-coastal',
    description: 'Scenic beaches, coastal promenades, and water activities',
    icon_name: 'beach',
    place_count: 8,
  },
  {
    id: 3,
    name: 'Religious & Spiritual',
    slug: 'religious-spiritual',
    description: 'Temples, churches, mosques, and spiritual retreats',
    icon_name: 'temple',
    place_count: 15,
  },
  {
    id: 4,
    name: 'Nature & Parks',
    slug: 'nature-parks',
    description: 'National parks, wildlife sanctuaries, and gardens',
    icon_name: 'park',
    place_count: 6,
  },
]
