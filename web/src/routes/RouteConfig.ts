import type { UserRole } from '@/types/auth'

export interface RouteMeta {
  path: string
  title: string
  description?: string
  requiresAuth?: boolean
  requiresAdmin?: boolean
  role?: UserRole
  group: 'public' | 'auth' | 'protected' | 'admin' | 'information'
}

export const ROUTE_CONFIG: Record<string, RouteMeta> = {
  // Public Routes
  home: {
    path: '/',
    title: 'Nearby — AI Travel Guidance & Location Intelligence',
    description: 'Explore the world with intelligent AI guidance, real-time location radar, and offline maps.',
    group: 'public',
  },
  placesList: {
    path: '/places',
    title: 'Popular Tourist Attractions & Places — Nearby',
    description: 'Browse top-rated destination spots and verified traveler reviews.',
    group: 'public',
  },
  placeDetail: {
    path: '/places/:id',
    title: 'Place Details — Nearby',
    group: 'public',
  },

  // Auth Routes
  login: {
    path: '/login',
    title: 'Sign In — Nearby Platform',
    group: 'auth',
  },
  register: {
    path: '/register',
    title: 'Create Account — Nearby Platform',
    group: 'auth',
  },

  // Protected User Routes
  profile: {
    path: '/profile',
    title: 'User Profile — Nearby',
    requiresAuth: true,
    group: 'protected',
  },
  favorites: {
    path: '/favorites',
    title: 'Saved Places & Bookmarks — Nearby',
    requiresAuth: true,
    group: 'protected',
  },
  trips: {
    path: '/trips',
    title: 'My AI Itineraries — Nearby',
    requiresAuth: true,
    group: 'protected',
  },
  settings: {
    path: '/settings',
    title: 'Account Settings — Nearby',
    requiresAuth: true,
    group: 'protected',
  },

  // Admin Routes
  adminDashboard: {
    path: '/admin',
    title: 'Admin Control Center — Nearby',
    requiresAuth: true,
    requiresAdmin: true,
    role: 'admin',
    group: 'admin',
  },
  adminPlaces: {
    path: '/admin/places',
    title: 'Manage Places — Admin Panel',
    requiresAuth: true,
    requiresAdmin: true,
    role: 'admin',
    group: 'admin',
  },
  adminCategories: {
    path: '/admin/categories',
    title: 'Manage Tourism Categories — Admin Panel',
    requiresAuth: true,
    requiresAdmin: true,
    role: 'admin',
    group: 'admin',
  },
  adminReviews: {
    path: '/admin/reviews',
    title: 'Moderation Queue — Admin Panel',
    requiresAuth: true,
    requiresAdmin: true,
    role: 'admin',
    group: 'admin',
  },
  adminUsers: {
    path: '/admin/users',
    title: 'User Management — Admin Panel',
    requiresAuth: true,
    requiresAdmin: true,
    role: 'admin',
    group: 'admin',
  },

  // 13 Enterprise Trust & Information Pages
  aiSearch: {
    path: '/features/ai-search',
    title: 'AI Vector Search & NLP Engine — Nearby Architecture',
    group: 'information',
  },
  categoriesInfo: {
    path: '/categories',
    title: 'Tourism Category Matrix & Classification — Nearby',
    group: 'information',
  },
  placesInfo: {
    path: '/places-info',
    title: 'NQI Quality Ranking Algorithm & Reviews — Nearby',
    group: 'information',
  },
  mapRadar: {
    path: '/map-radar',
    title: 'Location Radar & Spatial Accuracy — Nearby',
    group: 'information',
  },
  aiItinerary: {
    path: '/ai-itinerary',
    title: 'Multi-Constraint TSP Route Solver — Nearby',
    group: 'information',
  },
  apiDocs: {
    path: '/docs/api',
    title: 'Developer REST API Documentation & SDK — Nearby',
    group: 'information',
  },
  travelGuides: {
    path: '/resources/travel-guides',
    title: 'Travel Checklists & Regional Etiquette — Nearby',
    group: 'information',
  },
  community: {
    path: '/community',
    title: 'Contributor Reputation & Guidelines — Nearby',
    group: 'information',
  },
  systemStatus: {
    path: '/system-status',
    title: 'Real-Time System Health & Status Probe — Nearby',
    group: 'information',
  },
  privacy: {
    path: '/privacy',
    title: 'GDPR & CCPA Privacy Policy — Nearby Trust Center',
    group: 'information',
  },
  terms: {
    path: '/terms',
    title: 'Terms of Service & Usage — Nearby Trust Center',
    group: 'information',
  },
  locationSecurity: {
    path: '/location-security',
    title: 'Zero-Trace Geohash Cloaking & Security — Nearby',
    group: 'information',
  },
  cookies: {
    path: '/cookies',
    title: 'Cookie Consent Preferences — Nearby Trust Center',
    group: 'information',
  },

  // Error Pages
  forbidden: {
    path: '/403',
    title: '403 Access Denied — Nearby',
    group: 'public',
  },
  notFound: {
    path: '*',
    title: '404 Page Not Found — Nearby',
    group: 'public',
  },
}
