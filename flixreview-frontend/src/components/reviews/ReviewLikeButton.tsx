'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { reviewsService } from '@/services/reviews'

interface ReviewLikeButtonProps {
  reviewId: number
  initialLikesCount: number
  initialUserHasLiked: boolean
  onLikeChange?: (liked: boolean, newCount: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ReviewLikeButton({
  reviewId,
  initialLikesCount,
  initialUserHasLiked,
  onLikeChange,
  className = '',
  size = 'md',
}: ReviewLikeButtonProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLiked, setIsLiked] = useState(initialUserHasLiked)
  const [isLoading, setIsLoading] = useState(false)

  const sizes = {
    sm: {
      icon: 'w-4 h-4',
      text: 'text-xs',
      padding: 'px-2 py-1',
    },
    md: {
      icon: 'w-5 h-5',
      text: 'text-sm',
      padding: 'px-3 py-1.5',
    },
    lg: {
      icon: 'w-6 h-6',
      text: 'text-base',
      padding: 'px-4 py-2',
    },
  }

  const sizeConfig = sizes[size]

  const handleToggleLike = async () => {
    if (isLoading) return

    // Optimistic update
    const previousLikesCount = likesCount
    const previousIsLiked = isLiked
    
    setIsLoading(true)
    setIsLiked(!isLiked)
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1)

    try {
      const response = isLiked
        ? await reviewsService.unlikeReview(reviewId)
        : await reviewsService.likeReview(reviewId)

      // Update with server response
      setLikesCount(response.likes_count)
      
      // Call callback if provided
      if (onLikeChange) {
        onLikeChange(!isLiked, response.likes_count)
      }

      // Log success
      console.log(response.detail || (isLiked ? 'Review unliked' : 'Review liked'))
    } catch (error: any) {
      // Revert optimistic update on error
      setIsLiked(previousIsLiked)
      setLikesCount(previousLikesCount)

      // Log error message
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Failed to update like status'
      console.error(errorMessage)
      
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2 rounded-full
        transition-all duration-200
        ${sizeConfig.padding}
        ${isLiked
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-400'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isLiked ? 'Unlike review' : 'Like review'}
      title={isLiked ? 'Unlike review' : 'Like review'}
    >
      <Heart
        className={`
          ${sizeConfig.icon}
          transition-all duration-200
          ${isLiked ? 'fill-current' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
      />
      <span className={`font-medium ${sizeConfig.text}`}>
        {likesCount}
      </span>
    </button>
  )
}
