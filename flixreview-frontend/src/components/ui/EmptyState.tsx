import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  variant?: 'default' | 'error' | 'info'
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}) => {
  const iconColors = {
    default: 'text-[var(--color-text-tertiary)]',
    error: 'text-[var(--color-error)]',
    info: 'text-[var(--color-accent)]',
  }

  const bgColors = {
    default: 'bg-[var(--color-surface-dark)]',
    error: 'bg-[var(--color-error-light)]',
    info: 'bg-[var(--color-accent-light)]',
  }

  return (
    <div
      className={cn(
        'glass-heavy rounded-2xl p-12 text-center shadow-xl animate-fade-in',
        'bg-[var(--color-surface)]',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center',
            bgColors[variant]
          )}
        >
          <Icon className={cn('w-10 h-10', iconColors[variant])} />
        </div>
      )}
      
      <h2 className="text-xl font-bold mb-2 text-[var(--color-text-primary)]">
        {title}
      </h2>
      
      {description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
