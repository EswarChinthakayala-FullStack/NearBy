import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { NavigationTracker } from '@/routes/NavigationTracker'
import { AppRouter } from '@/routes/AppRouter'
import { queryClient } from '@/lib/queryClient'
import { useAuthStore } from '@/store/authStore'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

export function App() {
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <NavigationTracker />
            <AppRouter />
            <Toaster position="bottom-right" richColors />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
