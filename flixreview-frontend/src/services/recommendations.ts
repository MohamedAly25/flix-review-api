import apiClient from '@/lib/api/client'
import { moviesService } from '@/services/movies'
import { Movie } from '@/types/movie'

interface ShowcaseResult {
  movies: Movie[]
  mode: 'personalized' | 'top-rated'
}

interface ApiMovieResults {
  results?: Movie[]
}

interface RecommendationItem {
  movie_id?: number
  id?: number
}

export interface PreferredGenreSummary {
  id: number
  name: string
  slug: string
}

interface TasteProfileData {
  avg_rating?: number
  total_reviews?: number
  favorite_genres?: string[]
  preferences?: Record<string, number>
}

export interface PersonalizedRecommendations {
  movies: Movie[]
  algorithm?: string
  cached: boolean
  preferencesApplied: boolean
  preferredGenres: PreferredGenreSummary[]
  preferredGenreIds: number[]
}

async function unwrapMovies(data: unknown): Promise<Movie[]> {
  if (Array.isArray(data)) {
    return data as Movie[]
  }
  if (data && typeof data === 'object' && Array.isArray((data as ApiMovieResults).results)) {
    return (data as ApiMovieResults).results as Movie[]
  }
  return []
}

async function getTopRated(limit = 5): Promise<Movie[]> {
  const response = await apiClient.get('/recommendations/top-rated/')
  const movies = await unwrapMovies(response.data?.data)
  return movies.slice(0, limit)
}

async function getPersonalized(limit = 5): Promise<PersonalizedRecommendations> {
  const response = await apiClient.get('/recommendations/for-you/', {
    params: { limit },
  })

  const payload = response.data?.data || response.data
  const recommendations = Array.isArray(payload?.recommendations)
    ? payload.recommendations
    : []
  const preferredGenres = Array.isArray(payload?.preferred_genres)
    ? payload.preferred_genres
    : []
  const preferredGenreIds = Array.isArray(payload?.preferred_genre_ids)
    ? payload.preferred_genre_ids
    : []

  const movieIds = recommendations
    .map((item: RecommendationItem) => item.movie_id)
    .filter((id: unknown): id is number => typeof id === 'number')

  if (movieIds.length === 0) {
    return {
      movies: [],
      algorithm: payload?.algorithm,
      cached: Boolean(payload?.cached),
      preferencesApplied: Boolean(payload?.preferences_applied),
      preferredGenres,
      preferredGenreIds,
    }
  }

  const movies = await Promise.all(
    movieIds.map(async (id: number) => {
      try {
        return await moviesService.getMovie(id)
      } catch (error) {
        console.warn(`Failed to load movie ${id} for recommendations`, error)
        return null
      }
    })
  )

  return {
    movies: movies.filter((movie): movie is Movie => movie !== null),
    algorithm: payload?.algorithm,
    cached: Boolean(payload?.cached),
    preferencesApplied: Boolean(payload?.preferences_applied),
    preferredGenres,
    preferredGenreIds,
  }
}

export const recommendationsService = {
  async getShowcaseMovies({
    limit = 5,
    personalized = false,
  }: {
    limit?: number
    personalized?: boolean
  }): Promise<ShowcaseResult> {
    if (personalized) {
      try {
        const { movies } = await getPersonalized(limit)
        if (movies.length > 0) {
          return { movies, mode: 'personalized' }
        }
      } catch (error) {
        console.warn('Falling back to top-rated movies', error)
      }
    }

    const movies = await getTopRated(limit)
    return { movies, mode: 'top-rated' }
  },

  // Top Rated Movies
  async getTopRated(limit = 10): Promise<Movie[]> {
    return getTopRated(limit)
  },

  // Trending Movies
  async getTrending(limit = 10): Promise<Movie[]> {
    const response = await apiClient.get('/recommendations/trending/', { params: { limit } })
    return await unwrapMovies(response.data?.data)
  },

  // Most Reviewed Movies
  async getMostReviewed(limit = 10): Promise<Movie[]> {
    const response = await apiClient.get('/recommendations/most-reviewed/', { params: { limit } })
    return await unwrapMovies(response.data?.data)
  },

  // Recent Movies
  async getRecent(limit = 10): Promise<Movie[]> {
    const response = await apiClient.get('/recommendations/recent/', { params: { limit } })
    return await unwrapMovies(response.data?.data)
  },

  // Personalized Recommendations
  async getPersonalizedRecommendations(limit = 10): Promise<PersonalizedRecommendations> {
    return getPersonalized(limit)
  },

  // Similar Movies
  async getSimilarMovies(movieId: number, limit = 5): Promise<Movie[]> {
    const response = await apiClient.get(`/recommendations/movies/${movieId}/similar/`, {
      params: { limit },
    })
    const data = response.data?.data
    const similarMovies = Array.isArray(data?.similar_movies) ? data.similar_movies : []
    
    const movieIds = similarMovies
      .map((item: RecommendationItem) => item.movie_id || item.id)
      .filter((id: unknown): id is number => typeof id === 'number')

    if (movieIds.length === 0) return []

    const movies = await Promise.all(
      movieIds.map(async (id: number) => {
        try {
          return await moviesService.getMovie(id)
        } catch (error) {
          console.warn(`Failed to load similar movie ${id}`, error)
          return null
        }
      })
    )

    return movies.filter((movie): movie is Movie => movie !== null)
  },

  // User Taste Profile
  async getTasteProfile(): Promise<TasteProfileData> {
    const response = await apiClient.get('/recommendations/profile/taste/')
    return response.data?.data || response.data
  },

  // Recommendations Dashboard
  async getDashboard(): Promise<{
    top_rated: Movie[]
    trending: Movie[]
    personalized: Movie[]
  }> {
    const response = await apiClient.get('/recommendations/dashboard/')
    const data = response.data?.data || response.data
    
    return {
      top_rated: await unwrapMovies(data.top_rated),
      trending: await unwrapMovies(data.trending),
      personalized: await unwrapMovies(data.personalized),
    }
  },

  // Clear Cache (Admin only)
  async clearCache(): Promise<{ message: string }> {
    const response = await apiClient.post('/recommendations/cache/clear/')
    return response.data?.data || response.data
  },
}
