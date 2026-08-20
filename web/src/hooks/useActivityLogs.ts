import { useQuery } from '@tanstack/react-query'
import adminService from '@/services/api/admin.service'

/**
 * Hook to fetch paginated admin activity audit trail logs
 */
export const useActivityLogs = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['adminActivityLogs', page, pageSize],
    queryFn: () => adminService.getActivityLogs(page, pageSize),
    staleTime: 1000 * 60 * 2,
  })
}

export default useActivityLogs
