import React from 'react'

export const GradientMesh: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-sm bg-gradient-to-br from-primary/20 via-emerald-500/10 to-transparent blur-3xl" />
      <div className="absolute top-[30%] -right-[20%] w-[60%] h-[60%] rounded-sm bg-gradient-to-tl from-purple-500/15 via-blue-500/10 to-transparent blur-3xl" />
    </div>
  )
}

export default GradientMesh
