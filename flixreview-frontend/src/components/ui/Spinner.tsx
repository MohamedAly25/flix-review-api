import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const spinnerVariants = cva(
  'inline-block animate-spin rounded-full border-4',
  {
    variants: {
      variant: {
        default: 'border-[var(--color-border)] border-t-[var(--color-accent)]',
        accent: 'border-[var(--color-accent-light)] border-t-[var(--color-accent)]',
        inverse: 'border-white/20 border-t-white',
      },
      size: {
        xs: 'h-3 w-3 border-2',
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16 border-[6px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
  label?: string
}

export function Spinner({ variant, size, className, label }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(spinnerVariants({ variant, size }), className)}
        role="status"
        aria-label={label || 'Loading'}
      >
        <span className="sr-only">{label || 'Loading...'}</span>
      </div>
    </div>
  )
}

export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="lg" label={label} />
    </div>
  )
}

export function InlineSpinner({ className }: { className?: string }) {
  return <Spinner size="xs" className={cn('inline-block', className)} />
}
