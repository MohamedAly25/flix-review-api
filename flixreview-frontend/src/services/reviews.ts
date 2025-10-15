import apiClient from '@/lib/api/client'
import { Review, ReviewList, ReviewCreate, ReviewUpdate, ReviewFilters } from '@/types/review'

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
}
