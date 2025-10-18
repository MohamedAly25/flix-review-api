import apiClient from '@/lib/api/client'
import {
  Review,
  ReviewList,
  ReviewCreate,
  ReviewUpdate,
  ReviewFilters,
  ReviewComment,
  ReviewCommentList,
  ReviewCommentCreate,
  ReviewCommentUpdate,
  ReviewLikeResponse,
} from '@/types/review'

export const reviewsService = {
  async getReviews(params?: ReviewFilters): Promise<ReviewList> {
    const response = await apiClient.get('/reviews/', { params })
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async getReview(id: number): Promise<Review> {
    const response = await apiClient.get(`/reviews/${id}/`)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async createReview(data: ReviewCreate): Promise<Review> {
    const response = await apiClient.post('/reviews/', data)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async updateReview(id: number, data: ReviewUpdate): Promise<Review> {
    const response = await apiClient.patch(`/reviews/${id}/`, data)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async deleteReview(id: number): Promise<void> {
    await apiClient.delete(`/reviews/${id}/`)
  },

  // Search Reviews
  async searchReviews(query: string): Promise<ReviewList> {
    const response = await apiClient.get('/reviews/search/', { params: { q: query } })
    return response.data.data || response.data
  },

  // Get Reviews by Movie Title
  async getReviewsByMovieTitle(title: string, params?: ReviewFilters): Promise<ReviewList> {
    const response = await apiClient.get(`/reviews/movie/${encodeURIComponent(title)}/`, {
      params,
    })
    return response.data.data || response.data
  },

  // ============ NEW: LIKE FEATURES ============

  /**
   * Like a review
   */
  async likeReview(reviewId: number): Promise<ReviewLikeResponse> {
    const response = await apiClient.post(`/reviews/${reviewId}/like/`)
    return response.data.data || response.data
  },

  /**
   * Unlike a review
   */
  async unlikeReview(reviewId: number): Promise<ReviewLikeResponse> {
    const response = await apiClient.delete(`/reviews/${reviewId}/like/`)
    return response.data.data || response.data
  },

  /**
   * Get most liked reviews (optionally filtered by movie)
   */
  async getMostLikedReviews(params?: {
    movie_id?: number
    page?: number
    page_size?: number
  }): Promise<ReviewList> {
    const response = await apiClient.get('/reviews/most-liked/', { params })
    return response.data.data || response.data
  },

  // ============ NEW: COMMENT FEATURES ============

  /**
   * Get all comments for a review
   */
  async getReviewComments(
    reviewId: number,
    params?: {
      ordering?: string
      page?: number
      page_size?: number
    }
  ): Promise<ReviewCommentList> {
    const response = await apiClient.get(`/reviews/${reviewId}/comments/`, { params })
    return response.data.data || response.data
  },

  /**
   * Add a comment to a review
   */
  async createComment(reviewId: number, data: ReviewCommentCreate): Promise<ReviewComment> {
    const response = await apiClient.post(`/reviews/${reviewId}/comments/`, data)
    return response.data.data || response.data
  },

  /**
   * Get a specific comment
   */
  async getComment(commentId: number): Promise<ReviewComment> {
    const response = await apiClient.get(`/reviews/comments/${commentId}/`)
    return response.data.data || response.data
  },

  /**
   * Update a comment (owner only)
   */
  async updateComment(commentId: number, data: ReviewCommentUpdate): Promise<ReviewComment> {
    const response = await apiClient.patch(`/reviews/comments/${commentId}/`, data)
    return response.data.data || response.data
  },

  /**
   * Delete a comment (owner only)
   */
  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(`/reviews/comments/${commentId}/`)
  },
}

