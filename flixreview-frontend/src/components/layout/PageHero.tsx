import React from 'react'
import { cn } from '@/utils/cn'

interface PageHeroProps {
  icon?: React.ReactNode
  title: string
  description?: string
  highlight?: React.ReactNode
  stats?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  align?: 'center' | 'left'
}

/**
 * Consistent hero section for top-of-page messaging
 */
export function PageHero({
  icon,
  title,
  description,
  highlight,
  stats,
  actions,
  className,
  align = 'center',
}: PageHeroProps) {
  return (
    <section className={cn('py-12 sm:py-16 lg:py-20 animate-fade-in', className)}>
      <div className={cn('flix-container', align === 'center' ? 'text-center' : 'text-left')}
      >
        <div className={cn('flex items-center gap-3 mb-4', align === 'center' ? 'justify-center' : '')}>
          {icon && (
            <div className="p-3 rounded-2xl glass-heavy shadow-xl" style={{ backgroundColor: 'var(--color-surface)' }}>
              {icon}
            </div>
          )}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </h1>
        </div>

        {description && (
          <p
            className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {description}
          </p>
        )}

        {highlight && <div className="max-w-3xl mx-auto mb-6">{highlight}</div>}

        {stats && (
          <div
            className={cn(
              'flex flex-wrap items-center justify-center gap-3',
              align === 'left' && 'justify-start'
            )}
          >
            {stats}
          </div>
        )}

        {actions && (
          <div
            className={cn(
              'mt-6 flex flex-wrap items-center gap-3',
              align === 'center' ? 'justify-center' : 'justify-start'
            )}
          >
            {actions}
          </div>
        )}
      </div>
    </section>
  )
}
