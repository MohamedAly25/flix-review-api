import React from 'react'
import { cn } from '@/utils/cn'

export interface ReviewFiltersProps {
  sortBy: string
  onSortChange: (value: string) => void
  className?: string
}

export const ReviewFilters: React.FC<ReviewFiltersProps> = ({
  sortBy,
  onSortChange,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <label
        className="text-sm font-semibold whitespace-nowrap text-[var(--color-text-secondary)]"
        htmlFor="sort-select"
      >
        Sort by:
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className={cn(
          'px-4 py-3.5 rounded-lg border-2 transition-all duration-200',
          'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]',
          'hover:border-[var(--color-accent)]/50'
        )}
      >
        <option value="-created_at">Newest First</option>
        <option value="created_at">Oldest First</option>
        <option value="-rating">Highest Rated</option>
        <option value="rating">Lowest Rated</option>
      </select>
    </div>
  )
}
