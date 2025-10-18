import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const generatePageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    
    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      // Calculate range around current page
      const leftSibling = Math.max(currentPage - siblingCount, 2)
      const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1)

      const showLeftEllipsis = leftSibling > 2
      const showRightEllipsis = rightSibling < totalPages - 1

      if (!showLeftEllipsis && showRightEllipsis) {
        // Show pages from start
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
      } else if (showLeftEllipsis && !showRightEllipsis) {
        // Show pages towards end
        pages.push('ellipsis')
        for (let i = Math.max(totalPages - 4, 2); i < totalPages; i++) {
          pages.push(i)
        }
      } else if (showLeftEllipsis && showRightEllipsis) {
        // Show pages in middle
        pages.push('ellipsis')
        for (let i = leftSibling; i <= rightSibling; i++) {
          pages.push(i)
        }
        pages.push('ellipsis')
      } else {
        // Show all middle pages
        for (let i = 2; i < totalPages; i++) {
          pages.push(i)
        }
      }

      // Always show last page
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  const pages = generatePageNumbers()

  return (
    <div className={cn('flex items-center justify-center gap-2 flex-wrap', className)}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={cn(
          'px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium',
          'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-surface)] disabled:hover:border-[var(--color-border)]',
          'flex items-center gap-2'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-[var(--color-text-tertiary)]"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[2.5rem] h-10 rounded-lg border-2 transition-all duration-200 font-semibold',
                'hover:scale-105 active:scale-95',
                page === currentPage
                  ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-[var(--color-text-inverse)] shadow-lg'
                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-accent)]'
              )}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={cn(
          'px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium',
          'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-accent)]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--color-surface)] disabled:hover:border-[var(--color-border)]',
          'flex items-center gap-2'
        )}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export const PaginationInfo: React.FC<{
  currentPage: number
  totalPages: number
  totalItems: number
  className?: string
}> = ({ currentPage, totalPages, totalItems, className }) => {
  return (
    <div className={cn('text-center text-sm text-[var(--color-text-secondary)]', className)}>
      Showing page {currentPage} of {totalPages} ({totalItems.toLocaleString()} total)
    </div>
  )
}
