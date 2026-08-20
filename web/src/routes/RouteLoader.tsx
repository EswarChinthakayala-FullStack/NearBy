import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'

export const RouteLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center space-y-4 text-center p-6 rounded-sm border border-border bg-card/80 shadow-2xl backdrop-blur-xl"
      >
        {/* Animated Emerald Radar Ring & Icon */}
        <div className="relative flex h-16 w-16 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-sm border-2 border-emerald-500/20 border-t-emerald-500"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-400"
          >
            <Icon name="sparkles" size="md" />
          </motion.div>
        </div>

        {/* Loading Text & Status */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold font-heading text-foreground tracking-tight">
            Preparing Route Data...
          </h4>
          <p className="text-xs text-muted-foreground">
            Nearby Location Radar & AI Engine
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default RouteLoader
