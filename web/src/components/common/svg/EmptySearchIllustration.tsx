import React from 'react'

export const EmptySearchIllustration: React.FC<{ className?: string }> = ({ className = 'w-32 h-32' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="50" className="fill-muted/40 stroke-border/60" strokeWidth="2" strokeDasharray="4 4" />
      <circle cx="52" cy="52" r="24" className="stroke-primary" strokeWidth="3" />
      <path d="M70 70L88 88" className="stroke-primary" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="52" cy="52" r="8" className="fill-primary/20" />
      <path d="M42 45C44 43 48 42 52 42" className="stroke-primary/50" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default EmptySearchIllustration
