import React from 'react'
import { motion } from 'framer-motion'
import { AppLogo } from '@/components/common/AppLogo'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export interface PageLoaderProps {
  message?: string
  className?: string
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading destination workspace...',
  className = '',
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 text-foreground backdrop-blur-md ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center space-y-4 p-8 text-center rounded-sm border border-border/80 bg-card/90 shadow-2xl backdrop-blur-xl max-w-sm w-full mx-4"
      >
        <AppLogo size="lg" />
        <LoadingSpinner size="lg" />
        <p className="text-xs font-semibold font-mono text-muted-foreground tracking-wide animate-pulse">
          {message}
        </p>
      </motion.div>
    </div>
  )
}

export default PageLoader
