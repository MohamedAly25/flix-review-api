import React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void
  isLoading?: boolean
  containerClassName?: string
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ 
    onClear, 
    isLoading, 
    value, 
    containerClassName, 
    className,
    placeholder = 'Search...',
    ...props 
  }, ref) => {
    const hasValue = value && String(value).length > 0

    return (
      <div className={cn('relative w-full', containerClassName)}>
        <Search 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-tertiary)] pointer-events-none" 
        />
        
        <input
          ref={ref}
          type="text"
          value={value}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-12 py-3.5 rounded-lg border-2 transition-all duration-200',
            'bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text-primary)]',
            'placeholder:text-[var(--color-text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]',
            'hover:border-[var(--color-accent)]/50',
            className
          )}
          {...props}
        />

        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasValue && !isLoading && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--color-surface)] transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-[var(--color-text-tertiary)]" />
          </button>
        )}
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'
