import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { toast } from 'sonner'

export const NetworkStatus: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine)
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      toast.success('Network connection restored. Syncing latest data...')
      queryClient.refetchQueries()
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast.warning('Network connection lost. You are operating offline.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queryClient])

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md ${className}`}
          role="status"
          aria-live="polite"
        >
          <Icon name="offline" size="xs" className="animate-pulse" />
          <span>You are currently offline. Operations will be automatically retried when connectivity returns.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NetworkStatus
