import React from 'react'
import { cn } from '@/utils/helpers'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flix-w-full">
        {label && (
          <label className="flix-body flix-font-medium flix-mb-xs" style={{ display: 'block' }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn('flix-input', error && 'flix-border-error', className)}
          style={error ? { borderColor: 'var(--flix-accent)' } : undefined}
          {...props}
        />
        {error && (
          <p className="flix-small flix-accent flix-mt-xs">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
