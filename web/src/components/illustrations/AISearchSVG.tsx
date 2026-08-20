import React from 'react'
import { motion } from 'framer-motion'

export const AISearchSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative w-full flex items-center justify-center ${className}`}>
      <svg className="w-full h-auto max-w-full" viewBox="0 0 400 270" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="25" width="370" height="225" rx="4" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />

        {/* Search Bar Prompt UI */}
        <rect x="35" y="55" width="330" height="44" rx="3" fill="#27272A" stroke="#3F3F46" strokeWidth="1" />
        <circle cx="58" cy="77" r="7" fill="#10B981" />
        <text x="75" y="81" fill="#FAFAFA" fontSize="10.5" fontFamily="sans-serif">"Plan a 1-day cultural walk in Old Goa..."</text>

        {/* AI Processing Sparkles */}
        <motion.g animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }}>
          <path d="M 335 70 L 337 77 L 344 79 L 337 81 L 335 88 L 333 81 L 326 79 L 333 77 Z" fill="#F59E0B" />
        </motion.g>

        {/* Recommended Places Result Cards */}
        <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <rect x="35" y="115" width="155" height="115" rx="3" fill="#27272A" stroke="#10B981" strokeWidth="1" />
          <rect x="47" y="127" width="131" height="48" rx="2" fill="#18181B" />
          <text x="47" y="191" fill="#FAFAFA" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Basilica of Bom Jesus</text>
          <text x="47" y="206" fill="#A1A1AA" fontSize="9.5" fontFamily="sans-serif">4.9 Rating • 09:00 AM</text>
        </motion.g>

        <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <rect x="210" y="115" width="155" height="115" rx="3" fill="#27272A" stroke="#3F3F46" strokeWidth="1" />
          <rect x="222" y="127" width="131" height="48" rx="2" fill="#18181B" />
          <text x="222" y="191" fill="#FAFAFA" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Se Cathedral Walk</text>
          <text x="222" y="206" fill="#A1A1AA" fontSize="9.5" fontFamily="sans-serif">4.8 Rating • 11:30 AM</text>
        </motion.g>
      </svg>
    </div>
  )
}
