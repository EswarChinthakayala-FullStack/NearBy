import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon } from '@hugeicons/core-free-icons'

interface SmartTravelTipsProps {
  tips: string[]
}

export const SmartTravelTips: React.FC<SmartTravelTipsProps> = ({ tips }) => {
  return (
    <div className="p-6 rounded-sm border border-border bg-card shadow-md space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <HugeiconsIcon icon={SparklesIcon} className="size-4 text-emerald-400" />
        <h3 className="text-base font-bold font-heading text-foreground">Smart Travel Advice & Insights</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tips.map((tip, idx) => (
          <div key={idx} className="p-4 rounded-sm border border-border bg-muted/20 space-y-1.5 font-mono text-xs">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Tip 0{idx + 1}</span>
            <p className="text-foreground leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SmartTravelTips
