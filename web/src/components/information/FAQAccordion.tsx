import React, { useState } from 'react'
import { Icon } from '@/components/common/Icon'

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQAccordionProps {
  items: FAQItem[]
  className?: string
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items, className = '' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={item.question}
            className="rounded-sm border border-border/80 bg-card/60 backdrop-blur-md overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              className="flex w-full items-center justify-between p-4 text-left font-heading text-sm font-bold text-foreground hover:bg-muted/40 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="flex items-center gap-2.5">
                <Icon name="info" size="xs" className="text-primary shrink-0" />
                <span>{item.question}</span>
              </span>
              <Icon
                name="arrow-right"
                size="xs"
                className={`text-muted-foreground transition-transform duration-200 shrink-0 ${
                  isOpen ? 'rotate-90 text-primary' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
