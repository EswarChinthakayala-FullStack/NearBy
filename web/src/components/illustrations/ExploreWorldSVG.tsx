import React from 'react'
import { motion } from 'framer-motion'

export const ExploreWorldSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full max-w-sm h-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="360" height="240" rx="4" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />

        {/* Global Travel Spheres */}
        <g transform="translate(200, 150)">
          <motion.circle
            cx="0"
            cy="0"
            r="80"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />

          <circle cx="0" cy="0" r="50" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1" />
          <circle cx="0" cy="0" r="12" fill="#F59E0B" />
        </g>
      </svg>
    </div>
  )
}
