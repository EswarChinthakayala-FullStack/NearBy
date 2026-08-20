import React from 'react'

export interface DotPatternProps {
  size?: number
  gap?: number
  className?: string
}

export const DotPattern: React.FC<DotPatternProps> = ({
  size = 1.5,
  gap = 24,
  className = '',
}) => {
  return (
    <svg
      className={`absolute inset-0 h-full w-full pointer-events-none opacity-30 dark:opacity-20 text-emerald-600/40 dark:text-emerald-400/30 transition-opacity duration-500 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dot-pattern-svg"
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={gap / 2} cy={gap / 2} r={size} fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern-svg)" />
    </svg>
  )
}

export default DotPattern
