import React from 'react'

export interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  x?: number
  y?: number
  strokeDasharray?: string
  className?: string
}

export const GridPattern: React.FC<GridPatternProps> = ({
  width = 32,
  height = 32,
  x = -1,
  y = -1,
  strokeDasharray = '0',
  className = 'text-border/40',
  ...props
}) => {
  const id = React.useId()

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full stroke-current ${className}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}

export default GridPattern
