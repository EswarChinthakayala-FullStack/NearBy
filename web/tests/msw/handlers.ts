import { http, HttpResponse } from 'msw'
import { mockCategories } from '../fixtures/categories'
import { mockPlaceListItems, mockPlaceDetail } from '../fixtures/places'
import { mockUser } from '../fixtures/users'
import { mockReviews } from '../fixtures/reviews'
import { mockFavorites } from '../fixtures/favorites'

export const handlers = [
  // Auth Handlers
  http.post('*/auth/login', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Login successful.',
      data: {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
        user: mockUser,
      },
    })
  }),

  http.get('*/users/me', () => {
    return HttpResponse.json({
      success: true,
      message: 'User profile retrieved successfully.',
      data: mockUser,
    })
  }),

  http.patch('*/users/me', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Profile updated successfully.',
      data: mockUser,
    })
  }),

  // Categories Handlers
  http.get('*/categories', () => {
    return HttpResponse.json({
      success: true,
      message: 'Categories retrieved successfully.',
      data: mockCategories,
    })
  }),

  // Places Handlers
  http.get('*/places', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('query')

    let items = mockPlaceListItems
    if (query) {
      items = items.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    }

    return HttpResponse.json({
      success: true,
      message: 'Places retrieved successfully.',
      data: items,
      pagination: {
        page: 1,
        page_size: 20,
        total_items: items.length,
        total_pages: 1,
      },
    })
  }),

  http.get('*/places/nearby', () => {
    return HttpResponse.json({
      success: true,
      message: 'Nearby places retrieved.',
      data: mockPlaceListItems,
    })
  }),

  http.get('*/places/:uuid', ({ params }) => {
    const { uuid } = params
    return HttpResponse.json({
      success: true,
      message: 'Place details retrieved successfully.',
      data: { ...mockPlaceDetail, uuid: String(uuid) },
    })
  }),

  // Reviews Handlers
  http.get('*/reviews/place/:uuid', () => {
    return HttpResponse.json({
      success: true,
      message: 'Reviews retrieved.',
      data: mockReviews,
      pagination: {
        page: 1,
        page_size: 20,
        total_items: mockReviews.length,
        total_pages: 1,
      },
    })
  }),

  http.post('*/reviews/place/:uuid', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Review submitted successfully.',
      data: mockReviews[0],
    })
  }),

  // Favorites Handlers
  http.get('*/favorites', () => {
    return HttpResponse.json({
      success: true,
      message: 'Favorites retrieved.',
      data: mockFavorites,
      pagination: {
        page: 1,
        page_size: 20,
        total_items: mockFavorites.length,
        total_pages: 1,
      },
    })
  }),

  http.post('*/favorites/:placeUuid/toggle', () => {
    return HttpResponse.json({
      success: true,
      message: 'Place added to favorites.',
      data: {
        is_favorited: true,
        message: 'Place added to favorites.',
        total_favorites: 46,
      },
    })
  }),

  // Admin Handlers
  http.get('*/admin/stats', () => {
    return HttpResponse.json({
      success: true,
      message: 'Stats retrieved.',
      data: {
        total_places: 25,
        published_places: 20,
        draft_places: 5,
        total_categories: 4,
        total_reviews: 30,
        pending_reviews: 2,
        approved_reviews: 28,
        total_users: 15,
        active_users: 15,
        total_favorites: 50,
        total_images: 40,
        last_sync_status: 'completed',
        last_sync_time: '2026-03-01T12:00:00Z',
      },
    })
  }),
]
