import React from 'react'

export const OfflineIllustration: React.FC<{ className?: string }> = ({ className = 'w-32 h-32' }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r="50" className="fill-amber-500/5 stroke-amber-500/30" strokeWidth="2" />
      <path d="M35 40C45 30 75 30 85 40" className="stroke-amber-500/40" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
      <path d="M42 52C50 44 70 44 78 52" className="stroke-amber-500/60" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
      <circle cx="60" cy="76" r="4" className="fill-amber-500" />
      <path d="M30 30L90 90" className="stroke-amber-500" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export default OfflineIllustration
