import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/common/Icon'

export const OfflineBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2.5 rounded-sm flex items-center justify-between gap-3 text-sm font-medium ${className}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5">
            <Icon name="offline" size="sm" className="text-amber-600 dark:text-amber-400 shrink-0" />
            <span>You are currently offline. Review submissions and favorite changes will be disabled until connection is restored.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default OfflineBanner
