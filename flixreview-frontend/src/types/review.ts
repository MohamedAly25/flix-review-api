// TypeScript types matching Django models exactly
// Reference: flix-review-api/reviews/models.py + serializers.py

import { PaginatedResponse } from './api'
import { Movie } from './movie'

// Review type matching Review model + ReviewSerializer
export interface Review {
  id: number
  user: {
    username: string
    profile_picture?: {
      url: string
    } | null
  } | string  // Support both new object format and legacy string format
  movie: Movie              // Full Movie object (MovieSerializer read-only)
  content: string           // Field name is 'content' not 'comment'
  rating: number            // Must be 1-5 (RATING_CHOICES)
  created_at: string
  updated_at: string
  is_edited: boolean
  // NEW: Social features
  likes_count: number       // Total number of likes on this review
  comments_count: number    // Total number of comments on this review
  user_has_liked: boolean   // Whether the current user has liked this review
}

// Review creation data (ReviewSerializer write fields)
export interface ReviewCreate {
  movie_id: number          // Write-only field (source='movie')
  content: string           // Field name is 'content' not 'comment'
  rating: number            // Must be 1-5
}

// Review update data (ReviewSerializer write fields)
export interface ReviewUpdate {
  content?: string          // Field name is 'content' not 'comment'
  rating?: number           // Must be 1-5
  // Note: movie cannot be changed after creation (removed in update)
}

// Paginated review list response
export interface ReviewList extends PaginatedResponse<Review> {
  results: Review[]
}

// Review filters for API requests
export interface ReviewFilters {
  movie?: number
  movie_id?: number
  user?: number | string  // Can be user ID or username
  rating?: number
  ordering?: string
  page?: number
  page_size?: number
  search?: string  // Search by movie title or review content
}

// Review Comment (new feature)
export interface ReviewComment {
  id: number
  user: {
    username: string
    id: number
    profile_picture?: {
      url: string
    } | null
  }
  review: number
  content: string
  created_at: string
  updated_at: string
  is_edited: boolean
}

// Comment creation data
export interface ReviewCommentCreate {
  content: string
}

// Comment update data
export interface ReviewCommentUpdate {
  content: string
}

// Paginated comments list
export interface ReviewCommentList extends PaginatedResponse<ReviewComment> {
  results: ReviewComment[]
}

// Review Like response
export interface ReviewLikeResponse {
  detail: string
  likes_count: number
}

