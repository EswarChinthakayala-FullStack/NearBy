import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

export interface OnlineStatusProps {
  className?: string
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored. Back online!')
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Network connection lost. Working in offline mode.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div
      className={`flex h-9 items-center gap-2 px-3 rounded-sm border border-border bg-card text-xs font-mono text-muted-foreground ${className}`}
      title={isOnline ? 'Online — Connected to Nearby APIs' : 'Offline — Operating on local cache'}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
        }`}
      />
      <span className="font-bold uppercase tracking-wider text-[11px]">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  )
}

export default OnlineStatus
