import React from 'react'

export interface GridPatternProps {
  width?: number
  height?: number
  className?: string
}

export const GridPattern: React.FC<GridPatternProps> = ({
  width = 40,
  height = 40,
  className = '',
}) => {
  return (
    <svg
      className={`absolute inset-0 h-full w-full pointer-events-none opacity-25 dark:opacity-15 text-emerald-600/30 dark:text-emerald-400/20 transition-opacity duration-500 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="grid-pattern-svg"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern-svg)" />
    </svg>
  )
}

export default GridPattern
