import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkSquare01Icon } from '@hugeicons/core-free-icons'

interface PackingSuggestionsProps {
  items: string[]
}

export const PackingSuggestions: React.FC<PackingSuggestionsProps> = ({ items }) => {
  const categories = [
    { title: 'Essential Documents', items: ['Government ID / Passport', 'Travel Insurance Copy', 'Hotel Confirmation'] },
    { title: 'Electronics & Gear', items: ['Smartphone & Charger', 'Power Bank (10,000mAh)', 'Camera & Memory Card'] },
    { title: 'Clothing & Footwear', items: items.slice(0, 3) },
    { title: 'Personal Care & Health', items: ['Sunscreen & Lip Balm', 'Basic First Aid Kit', 'Hand Sanitizer'] },
  ]

  return (
    <div className="p-6 rounded-sm border border-border bg-card shadow-md space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <HugeiconsIcon icon={CheckmarkSquare01Icon} className="size-4 text-emerald-400" />
        <h3 className="text-base font-bold font-heading text-foreground">AI Recommended Packing Checklist</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div key={idx} className="p-4 rounded-sm border border-border bg-muted/20 space-y-2">
            <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">{cat.title}</h4>
            <ul className="space-y-1 text-xs text-foreground font-mono">
              {cat.items.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PackingSuggestions
