import React from 'react'
import { AuroraBackground } from './AuroraBackground'
import { GridPattern } from './GridPattern'
import { DotPattern } from './DotPattern'
import { NoiseTexture } from './NoiseTexture'
import { FloatingOrbs } from './FloatingOrbs'
import { GradientGlow } from './GradientGlow'
import { TravelLines } from './TravelLines'

export const LayeredBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Background Layering */}
      <AuroraBackground />
      <GradientGlow />
      <GridPattern />
      <DotPattern />
      <TravelLines />
      <FloatingOrbs />
      <NoiseTexture />

      {/* Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

export default LayeredBackground
