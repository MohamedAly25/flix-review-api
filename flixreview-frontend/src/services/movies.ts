import apiClient from '@/lib/api/client'
import { Movie, MovieList, MovieCreate, MovieUpdate, MovieFilters } from '@/types/movie'

export const moviesService = {
  async getMovies(params?: MovieFilters): Promise<MovieList> {
    const response = await apiClient.get('/movies/', { params })
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async getMovie(id: number): Promise<Movie> {
    const response = await apiClient.get(`/movies/${id}/`)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async createMovie(data: MovieCreate): Promise<Movie> {
    const response = await apiClient.post('/movies/', data)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async updateMovie(id: number, data: MovieUpdate): Promise<Movie> {
    const response = await apiClient.patch(`/movies/${id}/`, data)
    // Backend wraps response in {success, message, data} format
    return response.data.data || response.data
  },

  async deleteMovie(id: number): Promise<void> {
    await apiClient.delete(`/movies/${id}/`)
  },
}
