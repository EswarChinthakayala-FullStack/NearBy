import React, { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { MotionConfig } from 'framer-motion'
import { createTestQueryClient } from './testQueryClient'

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MotionConfig transition={{ duration: 0 }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <BrowserRouter>
              {children}
              <Toaster position="bottom-right" />
            </BrowserRouter>
          </ThemeProvider>
        </QueryClientProvider>
      </MotionConfig>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  }
}
