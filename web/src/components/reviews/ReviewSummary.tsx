import React from 'react'
import RatingStars from './RatingStars'
import type { Review } from '@/types/review'
import { motion } from 'framer-motion'

export interface ReviewSummaryProps {
  avgRating: number
  totalReviews: number
  reviews?: Review[]
  className?: string
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  avgRating = 0,
  totalReviews = 0,
  reviews = [],
  className = '',
}) => {
  // Compute star distribution counts from current dataset or estimate
  const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  if (reviews.length > 0) {
    reviews.forEach((r) => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating)))
      starCounts[star] = (starCounts[star] || 0) + 1
    })
  }

  const sampleTotal = reviews.length > 0 ? reviews.length : totalReviews || 1

  return (
    <div className={`p-6 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center ${className}`}>
      {/* Left: Overall Score */}
      <div className="flex flex-col items-center justify-center text-center space-y-1.5 border-b md:border-b-0 md:border-r border-border/60 pb-6 md:pb-0 md:pr-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-4xl md:text-5xl font-black tracking-tight text-foreground font-mono"
        >
          {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
        </motion.div>

        <RatingStars value={avgRating} readOnly size="lg" />

        <p className="text-xs text-muted-foreground font-medium pt-1">
          Based on <span className="font-semibold text-foreground">{totalReviews}</span> verified {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Right: Star Rating Distribution Progress Bars */}
      <div className="md:col-span-2 space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = starCounts[star] || 0
          const percentage = sampleTotal > 0 ? Math.round((count / sampleTotal) * 100) : 0

          return (
            <div key={star} className="flex items-center gap-3 text-xs font-medium">
              <span className="w-12 text-muted-foreground flex items-center justify-end gap-1">
                {star} <span className="text-amber-400">★</span>
              </span>

              <div className="flex-1 h-2.5 bg-secondary/80 rounded-sm overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: (5 - star) * 0.08 }}
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-sm"
                />
              </div>

              <span className="w-10 text-muted-foreground text-right font-mono">
                {percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewSummary
