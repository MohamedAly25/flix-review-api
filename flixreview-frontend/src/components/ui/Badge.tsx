import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-accent)] text-[var(--color-text-inverse)]',
        secondary: 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)]',
        success: 'bg-green-500/20 text-green-300 border border-green-400/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
        warning: 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50',
        error: 'bg-red-500/20 text-red-300 border border-red-400/50',
        outline: 'border-2 border-[var(--color-accent)] bg-transparent text-[var(--color-accent)]',
        glass: 'backdrop-blur-lg bg-white/5 border border-white/10 text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
      },
      animate: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      animate: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, animate, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, animate }), className)}
        {...props}
      >
        {icon && <span className="mr-1.5">{icon}</span>}
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
