import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingOverlay } from '@/components/common/LoadingSpinner'

export interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore()
  const location = useLocation()

  if (isLoading || !isInitialized) {
    return <LoadingOverlay message="Verifying administrator permissions..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/403" replace />
  }

  return <>{children}</>
}

export default AdminRoute
