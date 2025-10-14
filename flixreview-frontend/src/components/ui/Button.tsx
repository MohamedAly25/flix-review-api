import React from 'react'
import { cn } from '@/utils/helpers'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'flix-btn'
  
  const variants = {
    primary: 'flix-btn-primary',
    secondary: 'flix-btn-secondary',
    outline: 'flix-btn-secondary',
    danger: 'flix-btn-primary',
  }

  const sizes = {
    sm: 'flix-btn-sm',
    md: '',
    lg: 'flix-btn-lg',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="flix-spinner flix-spinner-sm"></div>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
