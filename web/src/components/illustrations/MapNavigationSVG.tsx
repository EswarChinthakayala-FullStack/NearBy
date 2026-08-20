import React from 'react'

export const MapNavigationSVG: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg className="w-full max-w-sm h-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="360" height="240" rx="4" fill="#18181B" stroke="#10B981" strokeWidth="1.5" />

        {/* Simplified Map Grid Lines */}
        <path d="M 40 100 L 360 100" stroke="#27272A" strokeWidth="10" />
        <path d="M 40 180 L 360 180" stroke="#27272A" strokeWidth="8" />
        <path d="M 120 30 L 120 270" stroke="#27272A" strokeWidth="12" />
        <path d="M 280 30 L 280 270" stroke="#27272A" strokeWidth="8" />

        {/* Navigation Route */}
        <path d="M 120 220 L 120 100 L 280 100 L 280 60" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Navigation Arrow Marker */}
        <polygon points="120,100 112,116 120,110 128,116" fill="#F59E0B" />
        <circle cx="280" cy="60" r="10" fill="#10B981" />
      </svg>
    </div>
  )
}
