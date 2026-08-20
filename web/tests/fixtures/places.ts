import type { Place, PlaceListItem } from '@/types/place'
import { mockCategories } from './categories'

export const mockPlaceListItems: PlaceListItem[] = [
  {
    uuid: 'place-uuid-1',
    name: 'Taj Mahal Monument',
    slug: 'taj-mahal-monument',
    city: 'Agra',
    latitude: 27.1751,
    longitude: 78.0421,
    status: 'published',
    avg_rating: 4.9,
    total_reviews: 128,
    total_favorites: 45,
    category: mockCategories[0],
    cover_image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523',
  },
  {
    uuid: 'place-uuid-2',
    name: 'Baga Beach Boardwalk',
    slug: 'baga-beach-boardwalk',
    city: 'Goa',
    latitude: 15.5553,
    longitude: 73.7517,
    status: 'published',
    avg_rating: 4.6,
    total_reviews: 84,
    total_favorites: 30,
    category: mockCategories[1],
    cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
  },
  {
    uuid: 'place-uuid-3',
    name: 'Golden Temple Sanctuary',
    slug: 'golden-temple-sanctuary',
    city: 'Amritsar',
    latitude: 31.62,
    longitude: 74.8765,
    status: 'published',
    avg_rating: 5.0,
    total_reviews: 210,
    total_favorites: 92,
    category: mockCategories[2],
    cover_image_url: 'https://images.unsplash.com/photo-1514222709107-a180c68d72b4',
  },
]

export const mockPlaceDetail: Place = {
  ...mockPlaceListItems[0],
  description: 'An immense mausoleum of white marble, built in Agra between 1631 and 1648.',
  history: 'Commissioned by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
  address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001',
  state: 'Uttar Pradesh',
  country: 'India',
  entry_fee: '₹50 (Indian), ₹1100 (Foreigner)',
  best_time_to_visit: 'October to March',
  created_at: '2026-01-01T00:00:00Z',
  images: [
    {
      uuid: 'img-1',
      image_url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523',
      caption: 'Main Taj Mahal dome facade',
      is_cover: true,
    },
  ],
}
