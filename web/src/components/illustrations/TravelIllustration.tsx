import React from 'react'

export interface TravelIllustrationProps {
  className?: string
}

export const TravelIllustration: React.FC<TravelIllustrationProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full aspect-square max-w-lg mx-auto flex items-center justify-center ${className}`}>
      {/* Glow Effects Behind Graphic */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-emerald-400/10 to-amber-500/15 rounded-sm blur-3xl" />

      {/* Main Glassmorphism Card Wrapper */}
      <div className="relative w-full h-full rounded-sm border border-border/80 bg-card/60 backdrop-blur-xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Top Header Controls */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-rose-500/80" />
            <div className="h-3 w-3 rounded-sm bg-amber-500/80" />
            <div className="h-3 w-3 rounded-sm bg-emerald-500/80" />
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Spatial Radar Active
          </span>
        </div>

        {/* Center Vector Map Graphic */}
        <div className="my-auto relative flex items-center justify-center py-6">
          {/* Pulsing Concentric Radar Rings */}
          <div className="absolute h-64 w-64 rounded-sm border border-emerald-500/20 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute h-48 w-48 rounded-sm border border-emerald-500/30" />
          <div className="absolute h-32 w-32 rounded-sm border border-amber-500/20" />

          {/* Compass & Map Pin Vector Graphic */}
          <svg className="w-40 h-40 relative z-10 text-emerald-400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
            <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />

            {/* Map Pin Marker */}
            <path
              d="M100 45C83.4315 45 70 58.4315 70 75C70 97.5 100 135 100 135C100 135 130 97.5 130 75C130 58.4315 116.569 45 100 45ZM100 88C92.8203 88 87 82.1797 87 75C87 67.8203 92.8203 62 100 62C107.18 62 113 67.8203 113 75C113 82.1797 107.18 88 100 88Z"
              fill="url(#pin-gradient)"
              stroke="#10B981"
              strokeWidth="2"
            />

            {/* Radar Beam Indicator Line */}
            <line x1="100" y1="100" x2="160" y2="60" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="160" cy="60" r="6" fill="#F59E0B" />

            <defs>
              <linearGradient id="pin-gradient" x1="100" y1="45" x2="100" y2="135" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="1" stopColor="#059669" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bottom Floating Glass Badge */}
        <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-sm bg-emerald-400 animate-pulse" />
            <span className="font-mono text-muted-foreground">Nearby Radar 10km</span>
          </div>
          <span className="font-bold text-foreground">Verified Spot</span>
        </div>
      </div>
    </div>
  )
}

export default TravelIllustration
