import React from 'react'

export interface BackgroundGridProps {
  className?: string
  patternSize?: number
  patternOpacity?: number
}

export const BackgroundGrid: React.FC<BackgroundGridProps> = ({
  className = '',
  patternSize = 32,
  patternOpacity = 0.08,
}) => {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* SVG Grid Pattern */}
      <svg className="h-full w-full stroke-foreground/20 [mask-image:radial-gradient(100%_100%_at_top_center,white,transparent)]">
        <defs>
          <pattern
            id="landing-background-grid-pattern"
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
            x="-1"
            y="-1"
          >
            <path
              d={`M.5 ${patternSize}V.5H${patternSize}`}
              fill="none"
              strokeWidth="1"
              strokeDasharray="0"
              style={{ opacity: patternOpacity }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" strokeWidth={0} fill="url(#landing-background-grid-pattern)" />
      </svg>
    </div>
  )
}

export default BackgroundGrid
