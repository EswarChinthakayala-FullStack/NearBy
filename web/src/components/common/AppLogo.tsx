import React from 'react'
import { motion } from 'framer-motion'

export interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number
  showText?: boolean
  animated?: boolean
  className?: string
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showText = true,
  animated = true,
  className = '',
}) => {
  // Determine pixel size for icon container
  const getIconSize = () => {
    if (typeof size === 'number') return size
    switch (size) {
      case 'sm':
        return 28
      case 'md':
        return 36
      case 'lg':
        return 48
      case 'xl':
        return 64
      default:
        return 36
    }
  }

  const iconPx = getIconSize()

  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Animated Maps SVG Logo Icon */}
      <div
        style={{ width: iconPx, height: iconPx }}
        className="relative flex items-center justify-center shrink-0 rounded-sm bg-zinc-900 border border-emerald-500/30 p-1 shadow-md shadow-emerald-500/10 group-hover:border-emerald-500/60 transition-all duration-300"
      >
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          whileHover={animated ? { scale: 1.08 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <defs>
            {/* Emerald to Cyan Pin Gradient */}
            <linearGradient id="pinGradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Accent Orbit Gradient */}
            <linearGradient id="orbitGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Radar Glow Filter */}
            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Animated Background Radar Wave Rings */}
          {animated ? (
            <motion.circle
              cx="50"
              cy="42"
              r="24"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ opacity: [0.6, 0.15, 0.6], scale: [0.9, 1.2, 0.9] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          ) : (
            <circle cx="50" cy="42" r="24" stroke="#10B981" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.4" />
          )}

          {/* Outer Curved Navigation Path line (Google Maps Style) */}
          <path
            d="M 20 75 Q 35 30 78 22"
            stroke="url(#orbitGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="3 3"
          />

          {/* Google Maps Style Animated Pin Marker Path */}
          <motion.path
            d="M 50 15 C 33.4 15 20 28.4 20 45 C 20 66.5 45 88 48.5 91 C 49.4 91.8 50.6 91.8 51.5 91 C 55 88 80 66.5 80 45 C 80 28.4 66.6 15 50 15 Z"
            fill="url(#pinGradient)"
            filter="url(#logoGlow)"
            initial={animated ? { y: -2 } : undefined}
            animate={animated ? { y: [0, -4, 0] } : undefined}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Inner Location Core Dot (Compass / Location Dot) */}
          <circle cx="50" cy="42" r="11" fill="#09090B" />
          
          <motion.circle
            cx="50"
            cy="42"
            r="6"
            fill="#F59E0B"
            animate={animated ? { scale: [1, 1.25, 1] } : undefined}
            transition={{ duration: 1.8, repeat: Infinity }}
          />

          {/* North Direction Sparkle Arrow Pin Tip */}
          <polygon points="50,33 53,40 50,38 47,40" fill="#FAFAFA" />
        </motion.svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center gap-1.5 font-heading">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground group-hover:text-emerald-400 transition-colors">
            Nearby
          </span>
          <span className="inline-flex items-center rounded-sm bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
            AI
          </span>
        </div>
      )}
    </div>
  )
}
