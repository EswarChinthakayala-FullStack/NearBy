import React from 'react'
import { motion } from 'framer-motion'

export const TravelHeroSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full max-w-lg h-auto" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Pulsing Ring */}
        <g transform="translate(250, 250)">
          <motion.circle
            cx="0"
            cy="0"
            r="210"
            stroke="url(#heroRingGrad)"
            strokeWidth="1.5"
            strokeDasharray="10 10"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          />

          {/* Orbiting Destination Nodes */}
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="0" cy="-160" r="8" fill="#F59E0B" />
            <circle cx="-160" cy="0" r="6" fill="#0D9488" />
            <circle cx="160" cy="0" r="7" fill="#0D9488" />
            <circle cx="0" cy="160" r="9" fill="#14B8A6" />
          </motion.g>
        </g>

        {/* Inner Compass Orbit */}
        <circle cx="250" cy="250" r="160" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.3" />

        {/* Center Glowing Globe Radar */}
        <circle cx="250" cy="250" r="110" fill="url(#heroGlobeGrad)" />
        <circle cx="250" cy="250" r="110" stroke="#0D9488" strokeWidth="2" strokeOpacity="0.6" />

        {/* Latitude & Longitude Curved Lines */}
        <path d="M 140 250 Q 250 170 360 250" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
        <path d="M 140 250 Q 250 330 360 250" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
        <path d="M 250 140 Q 170 250 250 360" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
        <path d="M 250 140 Q 330 250 250 360" stroke="#0D9488" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />

        {/* Center AI Compass Needle */}
        <g transform="translate(250, 250)">
          <motion.g
            animate={{ rotate: [0, 25, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <polygon points="0,-85 15,0 0,-15 -15,0" fill="#F59E0B" />
            <polygon points="0,85 15,0 0,15 -15,0" fill="#0D9488" />
            <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
          </motion.g>
        </g>

        {/* Map Location Pin Floating Badge */}
        <motion.g
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="310" y="140" width="130" height="50" rx="4" fill="#0F172A" stroke="#0D9488" strokeWidth="1.5" />
          <circle cx="335" cy="165" r="10" fill="#0D9488" />
          <text x="355" y="162" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Panaji Beach</text>
          <text x="355" y="176" fill="#94A3B8" fontSize="9" fontFamily="sans-serif">4.9 (1.2k rating)</text>
        </motion.g>

        <defs>
          <linearGradient id="heroGlobeGrad" x1="140" y1="140" x2="360" y2="360">
            <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="heroRingGrad" x1="40" y1="40" x2="460" y2="460">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
