import React from 'react'
import { motion } from 'framer-motion'

export const AICompanionSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full max-w-md h-auto" viewBox="0 0 450 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="410" height="260" rx="4" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />

        {/* User Prompt Bubble */}
        <motion.g initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <rect x="40" y="60" width="280" height="44" rx="3" fill="#27272A" stroke="#3F3F46" strokeWidth="1" />
          <text x="56" y="86" fill="#FAFAFA" fontSize="11" fontFamily="sans-serif">"Plan a 1-day cultural walk in Old Goa..."</text>
        </motion.g>

        {/* AI Assistant Bubble */}
        <motion.g initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <rect x="130" y="120" width="280" height="130" rx="3" fill="#27272A" stroke="#10B981" strokeWidth="1" />
          <circle cx="155" cy="148" r="8" fill="#10B981" />
          <text x="173" y="152" fill="#10B981" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Nearby AI Travel Guide</text>
          <text x="155" y="176" fill="#A1A1AA" fontSize="10" fontFamily="sans-serif">1. 09:00 AM — Basilica of Bom Jesus</text>
          <text x="155" y="196" fill="#A1A1AA" fontSize="10" fontFamily="sans-serif">2. 11:30 AM — Se Cathedral & Museum</text>
          <text x="155" y="216" fill="#A1A1AA" fontSize="10" fontFamily="sans-serif">3. 01:30 PM — Traditional Goan Lunch</text>
        </motion.g>
      </svg>
    </div>
  )
}
