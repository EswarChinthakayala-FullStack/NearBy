import React from 'react'

export const NoiseTexture: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-15 dark:opacity-10 z-0">
      <svg className="h-full w-full">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  )
}
