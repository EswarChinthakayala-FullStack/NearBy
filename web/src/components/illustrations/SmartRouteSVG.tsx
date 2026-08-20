import React from 'react'
import { motion } from 'framer-motion'

export const SmartRouteSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <svg className="w-full h-auto max-w-full" viewBox="0 0 400 270" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="25" width="370" height="225" rx="8" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />

        {/* Route Path Polyline */}
        <motion.path
          d="M 65 195 Q 145 65, 225 165 T 335 80"
          stroke="#10B981"
          strokeWidth="3"
          strokeDasharray="6 6"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3.5, repeat: Infinity }}
        />

        {/* Route Stop Nodes */}
        <g>
          <circle cx="65" cy="195" r="11" fill="#10B981" />
          <text x="65" y="199" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">1</text>
        </g>

        <g>
          <circle cx="150" cy="105" r="11" fill="#F59E0B" />
          <text x="150" y="109" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">2</text>
        </g>

        <g>
          <circle cx="225" cy="165" r="11" fill="#10B981" />
          <text x="225" y="169" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">3</text>
        </g>

        <g>
          <circle cx="335" cy="80" r="13" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          <text x="335" y="84" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">END</text>
        </g>

        {/* Live Traffic / ETA Tag */}
        <rect x="175" y="200" width="170" height="32" rx="6" fill="#27272A" stroke="#10B981" strokeWidth="1" />
        <text x="188" y="220" fill="#10B981" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">Optimized • 24 mins saved</text>
      </svg>
    </div>
  )
}
