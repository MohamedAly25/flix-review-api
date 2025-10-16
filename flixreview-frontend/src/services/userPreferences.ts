import apiClient from '@/lib/api/client'
import type { Genre } from '@/types/movie'

export interface PreferredGenresResponse {
  preferred_genres: Array<Pick<Genre, 'id' | 'name' | 'slug'>>
  preferred_genre_ids: number[]
  last_genre_update: string | null
  cooldown_active: boolean
  next_update_available_at: string | null
  days_until_next_update: number
}

export const userPreferencesService = {
  async getPreferredGenres(): Promise<PreferredGenresResponse> {
    const response = await apiClient.get('/users/genres/')
    return response.data?.data || response.data
  },

  async updatePreferredGenres(genreIds: number[]): Promise<PreferredGenresResponse> {
    const response = await apiClient.post('/users/genres/', {
      preferred_genre_ids: genreIds,
    })
    return response.data?.data || response.data
  },
}
