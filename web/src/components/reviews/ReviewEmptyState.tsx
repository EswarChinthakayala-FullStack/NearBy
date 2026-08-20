import React from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'

export interface ReviewEmptyStateProps {
  onWriteReview?: () => void
  className?: string
}

export const ReviewEmptyState: React.FC<ReviewEmptyStateProps> = ({ onWriteReview, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-10 rounded-sm border border-dashed border-border/80 bg-card/40 backdrop-blur-sm text-center flex flex-col items-center justify-center space-y-4 my-4 ${className}`}
    >
      <div className="w-16 h-16 rounded-sm bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shadow-inner">
        <Icon name="star" size="xl" className="text-amber-400" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-lg font-bold tracking-tight text-foreground">No Reviews Yet</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Be the first explorer to share your authentic experience, tips, and star rating for this location!
        </p>
      </div>

      {onWriteReview && (
        <Button
          onClick={onWriteReview}
          size="sm"
          className="mt-2 rounded-sm bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Icon name="edit" size="xs" className="mr-1.5" />
          Be the First to Review
        </Button>
      )}
    </motion.div>
  )
}

export default ReviewEmptyState
