import React from 'react'
import { ReviewCard } from './ReviewCard'
import { LoadingGrid } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Review } from '@/types/review'

export interface ReviewListProps {
  reviews: Review[]
  isLoading?: boolean
  isError?: boolean
  searchQuery?: string
  onClearSearch?: () => void
  currentUsername?: string
  showComments?: boolean
  className?: string
}

export const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  isLoading,
  isError,
  searchQuery,
  onClearSearch,
  currentUsername,
  showComments = true,
  className,
}) => {
  // Error state
  if (isError) {
    return (
      <EmptyState
        icon={Star}
        title="Failed to load reviews"
        description="Please try again later."
        variant="error"
        className={className}
      />
    )
  }

  // Loading state
  if (isLoading) {
    return <LoadingGrid count={5} variant="review" className={className} />
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No reviews found"
        description={
          searchQuery
            ? 'Try adjusting your search terms.'
            : 'Be the first to write a review!'
        }
        action={
          searchQuery && onClearSearch ? (
            <button
              onClick={onClearSearch}
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-smooth hover:opacity-90 shadow-lg bg-[var(--color-accent)] text-[var(--color-text-inverse)]"
            >
              Clear Search
            </button>
          ) : undefined
        }
        className={className}
      />
    )
  }

  // Render reviews
  return (
    <div className={cn('space-y-6', className)}>
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          currentUsername={currentUsername}
          showComments={showComments}
        />
      ))}
    </div>
  )
}
