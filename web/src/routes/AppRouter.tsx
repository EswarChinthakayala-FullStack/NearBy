import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { RouteErrorBoundary } from './RouteErrorBoundary'
import { PageTransition } from '@/components/common/PageTransition'
import { NetworkStatus } from '@/components/common/NetworkStatus'
import { PageLoader } from '@/components/common/PageLoader'

// Eager Loaded Page — Landing Page for Instant Performance
import LandingPage from '@/pages/LandingPage'

// Layouts
const MainLayout = lazy(() => import('@/components/layout/MainLayout'))
const UserLayout = lazy(() => import('@/components/layout/UserLayout'))
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))

// Lazy Loaded Discover Feature Pages
const BrowsePlacesPage = lazy(() => import('@/pages/discover/BrowsePlacesPage'))
const CategoriesPage = lazy(() => import('@/pages/discover/CategoriesPage'))
const CategoryDetailPage = lazy(() => import('@/pages/discover/CategoryDetailPage'))
const NearbyRadarPage = lazy(() => import('@/pages/discover/NearbyRadarPage'))
const AISearchPage = lazy(() => import('@/pages/discover/AISearchPage'))
const AIItineraryPage = lazy(() => import('@/pages/discover/AIItineraryPage'))

// Lazy Loaded Places Pages
const PlacesListPage = lazy(() => import('@/pages/places/PlacesListPage'))
const PlaceDetailPage = lazy(() => import('@/pages/places/PlaceDetailPage'))
const PlaceImageExplorerPage = lazy(() => import('@/pages/places/PlaceImageExplorerPage'))

// Lazy Loaded Pages — Auth
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))

// Lazy Loaded Pages — Authenticated User Portal
const UserDashboardPage = lazy(() => import('@/pages/user/DashboardPage'))
const UserProfilePage = lazy(() => import('@/pages/user/ProfilePage'))
const UserFavoritesPage = lazy(() => import('@/pages/user/FavoritesPage'))
const UserReviewsPage = lazy(() => import('@/pages/user/ReviewsPage'))
const UserTripsPage = lazy(() => import('@/pages/user/TripsPage'))
const UserNotificationsPage = lazy(() => import('@/pages/user/NotificationsPage'))
const UserSecurityPage = lazy(() => import('@/pages/user/SecurityPage'))
const UserSettingsPage = lazy(() => import('@/pages/user/SettingsPage'))
const UserHelpCenterPage = lazy(() => import('@/pages/user/HelpCenterPage'))

// Lazy Loaded Pages — Admin Portal
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminPlacesPage = lazy(() => import('@/pages/admin/PlacesPage'))
const AdminPlaceFormPage = lazy(() => import('@/pages/admin/AdminPlaceFormPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'))
const AdminReviewsPage = lazy(() => import('@/pages/admin/ReviewsPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/UsersPage'))
const AdminActivityLogsPage = lazy(() => import('@/pages/admin/ActivityLogsPage'))
const AdminSyncJobsPage = lazy(() => import('@/pages/admin/SyncJobsPage'))

// Lazy Loaded Pages — Enterprise Information Pages
const MapRadarPage = lazy(() => import('@/pages/information/MapRadarPage'))
const ApiDocumentationPage = lazy(() => import('@/pages/information/ApiDocumentationPage'))
const TravelGuidesPage = lazy(() => import('@/pages/information/TravelGuidesPage'))
const CommunityPage = lazy(() => import('@/pages/information/CommunityPage'))
const SystemStatusPage = lazy(() => import('@/pages/information/SystemStatusPage'))
const PrivacyPolicyPage = lazy(() => import('@/pages/information/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('@/pages/information/TermsOfServicePage'))
const LocationSecurityPage = lazy(() => import('@/pages/information/LocationSecurityPage'))
const CookiePreferencesPage = lazy(() => import('@/pages/information/CookiePreferencesPage'))

// Lazy Loaded Pages — Error Status
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export const AppRouter: React.FC = () => {
  return (
    <RouteErrorBoundary>
      <NetworkStatus />
      <Suspense fallback={<PageLoader />}>
        <PageTransition>
          <Routes>
            {/* 1. PUBLIC UNPROTECTED PAGES (Main Layout & Landing) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/docs/api" element={<ApiDocumentationPage />} />
              <Route path="/resources/travel-guides" element={<TravelGuidesPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/system-status" element={<SystemStatusPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/location-security" element={<LocationSecurityPage />} />
              <Route path="/cookies" element={<CookiePreferencesPage />} />
            </Route>

            {/* 2. PUBLIC AUTHENTICATION PAGES */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* 3. PROTECTED INSIDE APP PORTAL ROUTES (MANDATORY LOGIN) */}
            <Route
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              {/* Primary User Portal Routes */}
              <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
              <Route path="/user/dashboard" element={<UserDashboardPage />} />
              <Route path="/user/browse" element={<BrowsePlacesPage />} />
              <Route path="/user/places" element={<PlacesListPage />} />
              <Route path="/user/places/:id" element={<PlaceDetailPage />} />
              <Route path="/user/places/:id/photos" element={<PlaceImageExplorerPage />} />
              <Route path="/user/categories" element={<CategoriesPage />} />
              <Route path="/user/categories/:slug" element={<CategoryDetailPage />} />
              <Route path="/user/nearby" element={<NearbyRadarPage />} />
              <Route path="/user/ai-search" element={<AISearchPage />} />
              <Route path="/user/ai-itinerary" element={<AIItineraryPage />} />
              <Route path="/user/profile" element={<UserProfilePage />} />
              <Route path="/user/favorites" element={<UserFavoritesPage />} />
              <Route path="/user/reviews" element={<UserReviewsPage />} />
              <Route path="/user/trips" element={<UserTripsPage />} />
              <Route path="/user/notifications" element={<UserNotificationsPage />} />
              <Route path="/user/security" element={<UserSecurityPage />} />
              <Route path="/user/settings" element={<UserSettingsPage />} />
              <Route path="/user/help-center" element={<UserHelpCenterPage />} />

              {/* Inside App Root & Sub-path Shortcuts (Protected) */}
              <Route path="/browse" element={<BrowsePlacesPage />} />
              <Route path="/places" element={<PlacesListPage />} />
              <Route path="/places/:id" element={<PlaceDetailPage />} />
              <Route path="/places/:id/photos" element={<PlaceImageExplorerPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:slug" element={<CategoryDetailPage />} />
              <Route path="/nearby" element={<NearbyRadarPage />} />
              <Route path="/ai-search" element={<AISearchPage />} />
              <Route path="/ai-itinerary" element={<AIItineraryPage />} />
              <Route path="/map-radar" element={<MapRadarPage />} />

              <Route path="/app" element={<Navigate to="/user/dashboard" replace />} />
              <Route path="/app/browse" element={<BrowsePlacesPage />} />
              <Route path="/app/places" element={<PlacesListPage />} />
              <Route path="/app/places/:id" element={<PlaceDetailPage />} />
              <Route path="/app/places/:id/photos" element={<PlaceImageExplorerPage />} />
              <Route path="/app/categories" element={<CategoriesPage />} />
              <Route path="/app/categories/:slug" element={<CategoryDetailPage />} />
              <Route path="/app/nearby" element={<NearbyRadarPage />} />
              <Route path="/app/ai-search" element={<AISearchPage />} />
              <Route path="/app/ai-itinerary" element={<AIItineraryPage />} />
              <Route path="/app/map-radar" element={<MapRadarPage />} />
            </Route>

            {/* 4. ADMIN PROTECTED ROUTES (MANDATORY ADMIN ROLE) */}
            <Route
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/places" element={<AdminPlacesPage />} />
              <Route path="/admin/places/new" element={<AdminPlaceFormPage />} />
              <Route path="/admin/places/:uuid/edit" element={<AdminPlaceFormPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/logs" element={<AdminActivityLogsPage />} />
              <Route path="/admin/sync" element={<AdminSyncJobsPage />} />
            </Route>

            {/* 5. ERROR FALLBACK ROUTES */}
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageTransition>
      </Suspense>
    </RouteErrorBoundary>
  )
}

export default AppRouter
