import { QueryClient } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable automatic retries during tests
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
