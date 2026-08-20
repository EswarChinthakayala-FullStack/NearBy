import React from 'react'

export const AuroraBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top Gradient Mesh */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-background to-background dark:from-emerald-950/30 transition-colors duration-500" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent blur-3xl opacity-80 dark:opacity-40" />
    </div>
  )
}

export default AuroraBackground
