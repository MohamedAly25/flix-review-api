import React from 'react'
import { cn } from '@/utils/helpers'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  labelClassName?: string
  errorClassName?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, labelClassName, errorClassName, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={cn('block text-sm font-medium text-gray-700 mb-1', labelClassName)}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className={cn('mt-1 text-sm text-red-600', errorClassName)}>{error}</p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
