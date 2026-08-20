import { useQuery } from '@tanstack/react-query'
import adminService from '@/services/api/admin.service'

/**
 * Hook to fetch paginated sync logs with 30s live status polling
 */
export const useSyncLogs = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: ['adminSyncLogs', page, pageSize],
    queryFn: () => adminService.getSyncLogs(page, pageSize),
    staleTime: 1000 * 15,
    refetchInterval: 30000, // Live poll every 30 seconds
  })
}

export default useSyncLogs
