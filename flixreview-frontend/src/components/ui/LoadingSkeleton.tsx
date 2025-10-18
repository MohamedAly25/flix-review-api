import React from 'react'
import { cn } from '@/utils/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'card' | 'text' | 'circle' | 'avatar'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'default',
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-[var(--color-border)]'
  
  const variantClasses = {
    default: 'rounded',
    card: 'glass-heavy rounded-2xl h-64 bg-[var(--color-surface)]',
    text: 'h-4 rounded',
    circle: 'rounded-full',
    avatar: 'w-24 h-24 rounded-full',
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    />
  )
}

export const UserCardSkeleton: React.FC = () => {
  return (
    <div className="glass-heavy rounded-2xl p-6 h-64 animate-pulse bg-[var(--color-surface)]">
      <div className="flex flex-col items-center">
        <Skeleton variant="avatar" className="mb-4" />
        <Skeleton variant="text" className="w-24 mb-2" />
        <Skeleton variant="text" className="w-32 h-3" />
      </div>
    </div>
  )
}

export const ReviewCardSkeleton: React.FC = () => {
  return (
    <div className="glass-heavy rounded-2xl p-6 h-48 animate-pulse bg-[var(--color-surface)]">
      <div className="flex gap-4">
        <Skeleton className="w-24 h-32 rounded-lg" />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" className="w-3/4 h-6" />
          <Skeleton variant="text" className="w-1/2 h-4" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-full" />
        </div>
      </div>
    </div>
  )
}

export const LoadingGrid: React.FC<{
  count?: number
  variant?: 'user' | 'review'
  className?: string
}> = ({ count = 8, variant = 'user', className }) => {
  const SkeletonComponent = variant === 'user' ? UserCardSkeleton : ReviewCardSkeleton
  const gridClass = variant === 'user' 
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    : 'space-y-6'

  return (
    <div className={cn(gridClass, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  )
}
