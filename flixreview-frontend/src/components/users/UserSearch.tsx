import React from 'react'
import { SearchBar } from '@/components/ui/SearchBar'
import { cn } from '@/utils/cn'

export interface UserSearchProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading?: boolean
  className?: string
}

export const UserSearch: React.FC<UserSearchProps> = ({
  value,
  onChange,
  onClear,
  onSubmit,
  isLoading,
  className,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <div className={cn('glass-heavy rounded-2xl p-6 shadow-xl bg-[var(--color-surface)]', className)}>
      <form onSubmit={handleSubmit}>
        <SearchBar
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClear={onClear}
          placeholder="Search users by username..."
          isLoading={isLoading}
        />
      </form>

      {value && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-secondary)]">
            Searching for:{' '}
            <span className="font-semibold text-[var(--color-text-primary)]">{value}</span>
          </span>
          <button
            type="button"
            onClick={onClear}
            className="underline transition-smooth hover:opacity-80 text-[var(--color-accent)]"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
