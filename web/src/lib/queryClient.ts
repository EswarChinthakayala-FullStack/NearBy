import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
      retry: (failureCount, error: unknown) => {
        // Do not retry on 401, 403, or 404 HTTP status errors
        const status = (error as { response?: { status?: number }; statusCode?: number })?.response?.status || (error as { statusCode?: number })?.statusCode
        if (status === 401 || status === 403 || status === 404) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
})

export default queryClient
