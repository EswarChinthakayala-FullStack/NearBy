import React from 'react'

export interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
}

export const DotPattern: React.FC<DotPatternProps> = ({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  className = 'text-border/60',
  ...props
}) => {
  const id = React.useId()

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full fill-current ${className}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}

export default DotPattern
