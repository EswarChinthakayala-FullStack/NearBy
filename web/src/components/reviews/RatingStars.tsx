import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export type StarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface RatingStarsProps {
  /** Numeric rating score between 0 and 5 */
  value: number
  /** Callback fired when star is clicked in interactive mode */
  onChange?: (rating: number) => void
  /** Read-only display mode. Automatically true if no onChange callback passed */
  readOnly?: boolean
  /** Size preset for star icons */
  size?: StarSize
  /** Show numeric score badge beside stars (e.g., "4.5") */
  showScore?: boolean
  /** Show total review count in parentheses e.g. "(128)" */
  totalReviews?: number
  /** Additional wrapper CSS classes */
  className?: string
  /** Disabled interactive state */
  disabled?: boolean
  /** Label for screen readers */
  label?: string
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  showScore = false,
  totalReviews,
  className = '',
  disabled = false,
  label = 'Rating',
}) => {
  const isInteractive = !readOnly && !!onChange && !disabled
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = isInteractive && hoverValue !== null ? hoverValue : Math.max(0, Math.min(5, value || 0))

  const handleSelect = useCallback(
    (rating: number) => {
      if (isInteractive && onChange) {
        onChange(rating)
      }
    },
    [isInteractive, onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return

    const current = hoverValue ?? value ?? 0
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(5, current + 1)
      setHoverValue(next)
      handleSelect(next)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      const prev = Math.max(1, current - 1)
      setHoverValue(prev)
      handleSelect(prev)
    } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault()
      const selected = parseInt(e.key, 10)
      setHoverValue(selected)
      handleSelect(selected)
    }
  }

  return (
    <div
      className={cn('inline-flex items-center gap-1.5 select-none', className)}
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={isInteractive ? `${label}: Select 1 to 5 stars` : `${label}: ${displayValue.toFixed(1)} out of 5 stars`}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => isInteractive && setHoverValue(null)}
    >
      <div className="flex items-center gap-0.5" aria-hidden={isInteractive ? undefined : true}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= Math.round(displayValue)

          return (
            <motion.button
              key={starIndex}
              type="button"
              disabled={!isInteractive}
              onClick={() => handleSelect(starIndex)}
              onMouseEnter={() => isInteractive && setHoverValue(starIndex)}
              whileHover={isInteractive ? { scale: 1.15 } : undefined}
              whileTap={isInteractive ? { scale: 0.95 } : undefined}
              className={cn(
                'relative p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 transition-transform',
                isInteractive ? 'cursor-pointer' : 'cursor-default pointer-events-none',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              role={isInteractive ? 'radio' : undefined}
              aria-checked={isInteractive ? Math.round(value) === starIndex : undefined}
              aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
            >
              <Icon
                name="star"
                size={size}
                className={isFilled ? 'fill-amber-400 text-amber-400 drop-shadow-xs' : 'text-muted-foreground/30'}
              />
            </motion.button>
          )
        })}
      </div>

      {showScore && (
        <span className="text-xs font-semibold font-mono text-foreground ml-1">
          {displayValue.toFixed(1)}
        </span>
      )}

      {totalReviews !== undefined && (
        <span className="text-xs text-muted-foreground font-normal">
          ({totalReviews})
        </span>
      )}
    </div>
  )
}

export default RatingStars
