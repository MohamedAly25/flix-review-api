import React from 'react'
import { cn } from '@/utils/cn'

interface PageSectionProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  variant?: 'default' | 'glass' | 'muted'
  id?: string
}

/**
 * Wrapper for main content sections with consistent spacing and backgrounds
 */
export function PageSection({
  children,
  className,
  containerClassName,
  variant = 'default',
  id,
}: PageSectionProps) {
  const sectionClass = {
    default: 'flix-section',
    glass: 'flix-section-alt',
    muted: 'flix-section-muted',
  }[variant]

  return (
    <section id={id} className={cn(sectionClass, 'animate-slide-up', className)}>
      <div className={cn('flix-container space-y-6', containerClassName)}>{children}</div>
    </section>
  )
}
