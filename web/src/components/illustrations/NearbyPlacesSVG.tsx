import React from 'react'
import { motion } from 'framer-motion'

export const NearbyPlacesSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <svg className="w-full h-auto max-w-full" viewBox="0 0 400 270" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="25" width="370" height="225" rx="8" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />

        {/* Radar Rings */}
        <circle cx="200" cy="137" r="95" stroke="#10B981" strokeWidth="1" strokeOpacity="0.2" fill="none" />
        <circle cx="200" cy="137" r="60" stroke="#10B981" strokeWidth="1" strokeOpacity="0.4" fill="none" />
        <circle cx="200" cy="137" r="28" stroke="#10B981" strokeWidth="1" strokeOpacity="0.6" fill="none" />

        {/* Radar Sweep Animation (Centered at 200, 137) */}
        <g transform="translate(200, 137)">
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          >
            <path
              d="M 0 0 L -40.15 -86.10 A 95 95 0 0 1 40.15 -86.10 Z"
              fill="url(#radarSweep)"
            />
          </motion.g>
        </g>

        {/* User Location Center */}
        <circle cx="200" cy="137" r="7" fill="#10B981" />
        <circle cx="200" cy="137" r="13" stroke="#10B981" strokeWidth="2" strokeOpacity="0.8" fill="none" />

        {/* Discovered Pins with Pulse */}
        <motion.circle cx="150" cy="100" r="5" fill="#F59E0B" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="255" cy="155" r="5" fill="#10B981" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }} />
        <motion.circle cx="218" cy="72" r="5" fill="#10B981" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.8, repeat: Infinity, delay: 1 }} />
        <motion.circle cx="132" cy="175" r="5" fill="#F59E0B" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2.2, repeat: Infinity, delay: 1.5 }} />

        <defs>
          <linearGradient id="radarSweep" x1="0" y1="0" x2="0" y2="-95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
