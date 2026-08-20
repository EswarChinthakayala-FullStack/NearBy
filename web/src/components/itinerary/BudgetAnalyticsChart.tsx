import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MoneyBagIcon } from '@hugeicons/core-free-icons'

interface BudgetAnalyticsChartProps {
  estimatedCost: string
  budgetTier: string
}

export const BudgetAnalyticsChart: React.FC<BudgetAnalyticsChartProps> = ({ estimatedCost, budgetTier }) => {
  const breakdown = [
    { label: 'Accommodation', amount: '₹3,500', pct: '38%', color: 'bg-emerald-500' },
    { label: 'Food & Dining', amount: '₹2,200', pct: '23%', color: 'bg-teal-400' },
    { label: 'Transport & Fuel', amount: '₹1,400', pct: '15%', color: 'bg-blue-400' },
    { label: 'Entry Tickets', amount: '₹1,000', pct: '12%', color: 'bg-amber-400' },
    { label: 'Shopping & Souvenirs', amount: '₹700', pct: '8%', color: 'bg-purple-400' },
    { label: 'Emergency Fund', amount: '₹400', pct: '4%', color: 'bg-rose-400' },
  ]

  return (
    <div className="p-6 rounded-sm border border-border bg-card shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={MoneyBagIcon} className="size-4 text-emerald-400" />
          <h3 className="text-base font-bold font-heading text-foreground">Estimated Trip Budget Analytics</h3>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-sm border border-emerald-500/20">
          {budgetTier} Tier
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
        {/* Total Cost Display */}
        <div className="p-6 rounded-sm border border-border bg-muted/20 space-y-2 text-center">
          <span className="text-xs font-mono font-bold text-muted-foreground uppercase">Estimated Total Cost</span>
          <p className="text-3xl font-black font-mono text-emerald-400">{estimatedCost}</p>
          <p className="text-[11px] text-muted-foreground">Includes lodging, meals, local transit & admission fees.</p>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="space-y-3">
          {breakdown.map((item) => (
            <div key={item.label} className="space-y-1 text-xs">
              <div className="flex justify-between font-mono">
                <span className="text-foreground">{item.label}</span>
                <span className="font-bold text-emerald-400">{item.amount} ({item.pct})</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: item.pct }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BudgetAnalyticsChart
