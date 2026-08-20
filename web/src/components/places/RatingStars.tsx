import React from 'react'
import { RatingStars as CoreRatingStars, type StarSize } from '@/components/reviews/RatingStars'

export interface RatingStarsProps {
  rating?: number
  value?: number
  totalReviews?: number
  showScore?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  readOnly?: boolean
  onChange?: (val: number) => void
  className?: string
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  value,
  totalReviews,
  showScore = true,
  size = 'xs',
  readOnly = true,
  onChange,
  className = '',
}) => {
  const actualValue = rating !== undefined ? rating : value !== undefined ? value : 0
  const mappedSize: StarSize = size === 'xs' ? 'sm' : (size as StarSize)

  return (
    <CoreRatingStars
      value={actualValue}
      totalReviews={totalReviews}
      showScore={showScore}
      size={mappedSize}
      readOnly={readOnly}
      onChange={onChange}
      className={className}
    />
  )
}

export default RatingStars
