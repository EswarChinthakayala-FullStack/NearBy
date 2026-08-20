import { useQuery } from '@tanstack/react-query'
import adminService from '@/services/api/admin.service'

/**
 * Hook to fetch live administrative metrics for dashboard cards
 */
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => adminService.getDashboardStats(),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })
}

export default useAdminDashboard
