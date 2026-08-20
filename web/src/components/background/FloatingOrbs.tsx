import React from 'react'
import { motion } from 'framer-motion'

export const FloatingOrbs: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Orb 1: Emerald Top Left */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-20 left-10 h-72 w-72 rounded-sm bg-emerald-500/20 blur-3xl"
      />

      {/* Orb 2: Amber Right */}
      <motion.div
        animate={{
          y: [0, 40, 0],
          x: [0, -30, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-1/3 right-12 h-96 w-96 rounded-sm bg-amber-500/15 blur-3xl"
      />

      {/* Orb 3: Teal Bottom */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, 25, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-40 left-1/3 h-80 w-80 rounded-sm bg-emerald-600/15 blur-3xl"
      />
    </div>
  )
}
