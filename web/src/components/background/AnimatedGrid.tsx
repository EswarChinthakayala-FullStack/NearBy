import React from 'react'

export const AnimatedGrid: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="animated-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/40" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#animated-grid)" />
      </svg>
    </div>
  )
}
