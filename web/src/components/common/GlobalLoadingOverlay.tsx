import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppLogo } from '@/components/common/AppLogo'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export interface GlobalLoadingOverlayProps {
  isVisible?: boolean
  message?: string
}

export const GlobalLoadingOverlay: React.FC<GlobalLoadingOverlayProps> = ({
  isVisible = false,
  message = 'Initializing Nearby platform...',
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <div className="flex flex-col items-center space-y-4 p-6 text-center">
            <AppLogo size="lg" />
            <LoadingSpinner size="md" />
            <p className="text-xs font-semibold font-mono text-muted-foreground animate-pulse">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default GlobalLoadingOverlay
