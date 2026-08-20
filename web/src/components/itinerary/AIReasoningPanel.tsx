import React, { useState } from 'react'
import type { AIReasoning } from '@/services/api/aiApi'
import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon, ArrowDown01Icon } from '@hugeicons/core-free-icons'

interface AIReasoningPanelProps {
  reasoning: AIReasoning[]
}

export const AIReasoningPanel: React.FC<AIReasoningPanelProps> = ({ reasoning }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="p-6 rounded-sm border border-border bg-card shadow-md space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <HugeiconsIcon icon={SparklesIcon} className="size-4 text-emerald-400" />
        <h3 className="text-base font-bold font-heading text-foreground">Why Nearby AI Selected This Plan</h3>
      </div>

      <div className="space-y-2">
        {reasoning.map((item, idx) => {
          const isOpen = openIndex === idx

          return (
            <div key={idx} className="rounded-sm border border-border bg-muted/20 overflow-hidden">
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-foreground hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-mono">0{idx + 1}.</span>
                  <span>{item.title}</span>
                </div>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className={`size-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div className="p-3.5 pt-0 text-xs text-muted-foreground border-t border-border/50 leading-relaxed font-mono">
                  {item.description}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AIReasoningPanel
