// TypeScript types matching Django models exactly
// Reference: flix-review-api/reviews/models.py + serializers.py

import { PaginatedResponse } from './api'
import { Movie } from './movie'

// Review type matching Review model + ReviewSerializer
export interface Review {
  id: number
  user: string              // StringRelatedField - returns username as string
  movie: Movie              // Full Movie object (MovieSerializer read-only)
  content: string           // Field name is 'content' not 'comment'
  rating: number            // Must be 1-5 (RATING_CHOICES)
  created_at: string
  updated_at: string
  is_edited: boolean
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
}
