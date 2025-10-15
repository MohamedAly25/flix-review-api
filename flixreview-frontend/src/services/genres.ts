import apiClient from '@/lib/api/client'

export interface Genre {
  id: number
  name: string
  slug: string
  description?: string
  movie_count?: number
  created_at?: string
}

export interface GenreList {
  count: number
  next: string | null
  previous: string | null
  results: Genre[]
}

export const genresService = {
  async getGenres(): Promise<Genre[]> {
    const response = await apiClient.get('/movies/genres/')
    const data = response.data.data || response.data
    return data.results || data
  },

  async getGenre(slug: string): Promise<Genre> {
    const response = await apiClient.get(`/movies/genres/${slug}/`)
    return response.data.data || response.data
  },

  async createGenre(data: { name: string; description?: string }): Promise<Genre> {
    const response = await apiClient.post('/movies/genres/', data)
    return response.data.data || response.data
  },

  async updateGenre(slug: string, data: { name?: string; description?: string }): Promise<Genre> {
    const response = await apiClient.patch(`/movies/genres/${slug}/`, data)
    return response.data.data || response.data
  },

  async deleteGenre(slug: string): Promise<void> {
    await apiClient.delete(`/movies/genres/${slug}/`)
  },
}
