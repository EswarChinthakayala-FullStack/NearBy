/**
 * Centralized Application Routes Constants
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PLACES: '/places',
  PLACE_DETAIL: (uuid = ':id') => `/places/${uuid}`,
  NEARBY: '/nearby',
  FAVORITES: '/favorites',
  PROFILE: '/profile',
  ADMIN: {
    DASHBOARD: '/admin',
    PLACES: '/admin/places',
    CATEGORIES: '/admin/categories',
    REVIEWS: '/admin/reviews',
    USERS: '/admin/users',
    LOGS: '/admin/logs',
    SYNC: '/admin/sync',
  },
  INFO: {
    AI_SEARCH: '/features/ai-search',
    CATEGORIES: '/categories',
    PLACES: '/places-info',
    MAP_RADAR: '/map-radar',
    AI_ITINERARY: '/ai-itinerary',
    API_DOCS: '/docs/api',
    TRAVEL_GUIDES: '/resources/travel-guides',
    COMMUNITY: '/community',
    SYSTEM_STATUS: '/system-status',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    SECURITY: '/location-security',
    COOKIES: '/cookies',
  },
  ERRORS: {
    FORBIDDEN: '/403',
    NOT_FOUND: '/404',
  },
} as const

/**
 * Centralized TanStack Query Key Factory
 */
export const QUERY_KEYS = {
  AUTH: {
    CURRENT_USER: ['auth', 'user'] as const,
    PROFILE: ['auth', 'profile'] as const,
  },
  USER: {
    ME: ['user', 'me'] as const,
  },
  PLACES: {
    LIST: (params?: Record<string, unknown>) => ['places', 'list', params] as const,
    BY_UUID: (uuid: string) => ['places', 'uuid', uuid] as const,
    BY_SLUG: (slug: string) => ['places', 'slug', slug] as const,
    NEARBY: (lat: number, lng: number, radius?: number) =>
      ['places', 'nearby', lat, lng, radius] as const,
  },
  CATEGORIES: {
    ALL: ['categories', 'all'] as const,
    BY_SLUG: (slug: string) => ['categories', slug] as const,
  },
  REVIEWS: {
    PLACE_REVIEWS: (placeUuid: string, page = 1) =>
      ['reviews', 'place', placeUuid, page] as const,
    USER_REVIEWS: ['reviews', 'user'] as const,
    MODERATION_QUEUE: (page = 1) => ['reviews', 'moderation', page] as const,
  },
  FAVORITES: {
    USER_FAVORITES: ['favorites', 'user'] as const,
    CHECK_STATUS: (placeUuid: string) => ['favorites', 'check', placeUuid] as const,
  },
  ADMIN: {
    DASHBOARD_STATS: ['admin', 'stats'] as const,
    ACTIVITY_LOGS: (page = 1) => ['admin', 'activity', page] as const,
    SYNC_LOGS: (page = 1) => ['admin', 'syncLogs', page] as const,
  },
  SEARCH: {
    GLOBAL: (query: string) => ['search', 'global', query] as const,
    AI_VECTOR: (prompt: string) => ['search', 'ai', prompt] as const,
  },
} as const

/**
 * Centralized Backend API Endpoint Paths
 */
export const API_PATHS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    ME: '/users/me',
    CHANGE_PASSWORD: '/users/me/change-password',
  },
  PLACES: {
    BASE: '/places',
    NEARBY: '/places/nearby',
    SEARCH: '/places/search',
    BY_UUID: (uuid: string) => `/places/${uuid}`,
    BY_SLUG: (slug: string) => `/places/slug/${slug}`,
    PUBLISH: (uuid: string) => `/places/${uuid}/publish`,
    ARCHIVE: (uuid: string) => `/places/${uuid}/archive`,
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_SLUG: (slug: string) => `/categories/slug/${slug}`,
  },
  REVIEWS: {
    BASE: '/reviews',
    PLACE: (placeUuid: string) => `/reviews/place/${placeUuid}`,
    BY_UUID: (uuid: string) => `/reviews/${uuid}`,
    MODERATE: (uuid: string) => `/reviews/${uuid}/moderate`,
  },
  FAVORITES: {
    BASE: '/favorites',
    TOGGLE: (placeUuid: string) => `/favorites/${placeUuid}/toggle`,
    DELETE: (placeUuid: string) => `/favorites/${placeUuid}`,
  },
  UPLOADS: {
    IMAGE: '/uploads/image',
  },
  ADMIN: {
    STATS: '/admin/stats',
    SYNC_OSM: '/admin/sync/osm',
    SYNC_WIKIPEDIA: '/admin/sync/wikipedia',
    SYNC_IMAGES: (uuid: string) => `/admin/sync/images/${uuid}`,
    SYNC_LOGS: '/admin/sync-logs',
    MODERATION: '/admin/moderation',
    ACTIVITY_LOGS: '/admin/activity-logs',
  },
} as const

/**
 * Browser LocalStorage & SessionStorage Keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'nearby_theme',
  USER_PREFERENCES: 'nearby_user_prefs',
  SEARCH_HISTORY: 'nearby_search_history',
} as const

/**
 * Pagination System Defaults
 */
export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 15,
  MAX_PAGE_SIZE: 100,
} as const

/**
 * Animation Duration Presets (ms)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  ENTER: 300,
  EXIT: 200,
} as const

/**
 * Responsive Breakpoints (px)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

/**
 * GIS Map & Location Defaults
 */
export const MAP_DEFAULTS = {
  DEFAULT_LAT: 28.6139,
  DEFAULT_LNG: 77.209,
  DEFAULT_ZOOM: 12,
  DEFAULT_RADIUS_KM: 10,
  SEARCH_MIN_RADIUS: 1,
  SEARCH_MAX_RADIUS: 50,
} as const

export const DEFAULT_SEARCH_RADIUS = MAP_DEFAULTS.DEFAULT_RADIUS_KM

/**
 * Application Theme Keys
 */
export const THEME_KEYS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

/**
 * Feature Flags Configuration
 */
export const FEATURE_FLAGS = {
  ENABLE_AI_ITINERARY: true,
  ENABLE_OSM_SYNC: true,
  ENABLE_WIKIPEDIA_ENRICHMENT: true,
  ENABLE_OFFLINE_RADAR: true,
  ENABLE_DARK_MODE: true,
} as const

export default {
  ROUTES,
  QUERY_KEYS,
  API_PATHS,
  STORAGE_KEYS,
  PAGINATION_DEFAULTS,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  MAP_DEFAULTS,
  THEME_KEYS,
  FEATURE_FLAGS,
}
