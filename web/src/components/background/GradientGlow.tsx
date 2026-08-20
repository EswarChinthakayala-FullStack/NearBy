import React from 'react'

export const GradientGlow: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Emerald Radial Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-sm bg-gradient-to-tr from-emerald-500/25 via-emerald-400/15 to-transparent blur-3xl opacity-80 dark:opacity-40 transition-opacity duration-500" />

      {/* Amber Accent Glow */}
      <div className="absolute top-[30%] right-[-10%] h-[500px] w-[700px] rounded-sm bg-amber-500/15 blur-3xl opacity-70 dark:opacity-30 transition-opacity duration-500" />

      {/* Bottom Subtle Glow */}
      <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[800px] rounded-sm bg-emerald-600/20 blur-3xl opacity-60 dark:opacity-30 transition-opacity duration-500" />
    </div>
  )
}

export default GradientGlow
