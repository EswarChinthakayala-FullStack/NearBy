import React from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  pageSize?: number
  siblingCount?: number
  showTotal?: boolean
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  siblingCount = 1,
  showTotal = true,
  className = '',
}) => {
  if (totalPages <= 1) return null

  // Generate pagination range with ellipsis
  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3
    const totalBlocks = totalNumbers + 2

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2

    const firstPageIndex = 1
    const lastPageIndex = totalPages

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, '...', totalPages]
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      )
      return [firstPageIndex, '...', ...rightRange]
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      )
      return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex]
    }

    return []
  }

  const pages = getPageNumbers()

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-sm border border-border/70 bg-card/60 backdrop-blur-md shadow-sm text-xs',
        className
      )}
    >
      {/* Total Items Metadata */}
      {showTotal && totalItems !== undefined && (
        <span className="text-muted-foreground font-medium">
          Showing page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
          <span className="font-semibold text-foreground">{totalPages}</span> ({totalItems.toLocaleString()} total items)
        </span>
      )}

      {/* Page Buttons List */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="rounded-sm h-8 px-2.5 text-xs font-semibold"
          aria-label="Go to previous page"
        >
          <Icon name="arrow-left" size="xs" className="mr-1" />
          <span>Prev</span>
        </Button>

        {/* Numeric Page Buttons */}
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`dots-${idx}`} className="px-2 text-muted-foreground font-mono select-none">
                …
              </span>
            )
          }

          const pageNum = p as number
          const isActive = pageNum === currentPage

          return (
            <Button
              key={pageNum}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                'rounded-sm h-8 min-w-[32px] px-2 text-xs font-mono font-bold transition-all',
                isActive && 'bg-primary text-primary-foreground shadow-sm'
              )}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          )
        })}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="rounded-sm h-8 px-2.5 text-xs font-semibold"
          aria-label="Go to next page"
        >
          <span>Next</span>
          <Icon name="arrow-right" size="xs" className="ml-1" />
        </Button>
      </div>
    </nav>
  )
}

export default Pagination
