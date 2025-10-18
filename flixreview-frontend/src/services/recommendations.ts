import apiClient from '@/lib/api/client'
import { moviesService } from '@/services/movies'
import { genresService } from '@/services/genres'
import { Movie } from '@/types/movie'
import type {
  ShowcaseResult,
  PersonalizedRecommendations,
  PersonalizedRecommendationsResponse,
  SimilarMoviesResponse,
  UserTasteProfile,
  RecommendationsDashboard,
  GenreRecommendationOptions,
  RecommendationItem,
  PreferredGenreSummary
} from '@/types/recommendations'

interface ApiMovieResults {
  results?: Movie[]
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

async function getPersonalized(
  limit = 5,
  algorithm: 'hybrid' | 'collaborative' | 'content' = 'hybrid'
): Promise<PersonalizedRecommendations> {
  const response = await apiClient.get('/recommendations/for-you/', {
    params: { limit, algorithm },
  })

  const payload: PersonalizedRecommendationsResponse = response.data?.data || response.data
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
      mlEnabled: payload?.ml_enabled,
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
    mlEnabled: payload?.ml_enabled,
  }
}

/**
 * Get genre-based recommendations using user's preferred genres
 * This is used as a fallback when personalized recommendations fail
 */
async function getGenreBasedRecommendations(
  options: GenreRecommendationOptions
): Promise<ShowcaseResult> {
  const { genreIds, limit = 10, minRating = 3.5 } = options

  if (genreIds.length === 0) {
    // No genres provided, fallback to top-rated
    const movies = await getTopRated(limit)
    return { movies, mode: 'top-rated' }
  }

  try {
    // Fetch movies by preferred genres
    const response = await apiClient.get('/movies/', {
      params: {
        genres: genreIds.join(','),
        page_size: limit * 2, // Get more to filter by rating
        ordering: '-avg_rating,-created_at',
      },
    })

    let movies = await unwrapMovies(response.data?.data)
    
    // Filter by minimum rating
    movies = movies.filter(movie => (movie.avg_rating || 0) >= minRating)
    
    // Get genre info
    const genres: PreferredGenreSummary[] = await Promise.all(
      genreIds.map(async (id) => {
        try {
          const genre = await genresService.getGenre(String(id))
          return {
            id: genre.id,
            name: genre.name,
            slug: genre.slug,
          }
        } catch {
          return null
        }
      })
    ).then(results => results.filter((g): g is PreferredGenreSummary => g !== null))

    return {
      movies: movies.slice(0, limit),
      mode: 'genre-based',
      genresUsed: genres,
    }
  } catch (error) {
    console.error('Genre-based recommendations failed:', error)
    // Final fallback to top-rated
    const movies = await getTopRated(limit)
    return { movies, mode: 'top-rated' }
  }
}

export const recommendationsService = {
  async getShowcaseMovies({
    limit = 5,
    personalized = false,
    forceGenreBased = false,
  }: {
    limit?: number
    personalized?: boolean
    forceGenreBased?: boolean
  }): Promise<ShowcaseResult> {
    if (personalized) {
      try {
        const result = await getPersonalized(limit)
        
        // If we have personalized movies, return them
        if (result.movies.length > 0) {
          return {
            movies: result.movies,
            mode: 'personalized',
            genresUsed: result.preferencesApplied ? result.preferredGenres : undefined,
          }
        }
        
        // If no personalized movies but user has preferred genres, use genre-based
        if (result.preferredGenreIds.length > 0) {
          console.log('Using genre-based recommendations as fallback')
          return await getGenreBasedRecommendations({
            genreIds: result.preferredGenreIds,
            limit,
          })
        }
      } catch (error) {
        console.warn('Personalized recommendations failed, checking genre preferences', error)
        
        // Try to get user preferences and fallback to genre-based
        try {
          const { userPreferencesService } = await import('./userPreferences')
          const preferences = await userPreferencesService.getPreferredGenres()
          
          if (preferences.preferred_genre_ids.length > 0) {
            console.log('Using genre-based recommendations from user preferences')
            return await getGenreBasedRecommendations({
              genreIds: preferences.preferred_genre_ids,
              limit,
            })
          }
        } catch (prefError) {
          console.warn('Could not fetch user preferences', prefError)
        }
      }
    }

    // If forceGenreBased is true, try genre-based first
    if (forceGenreBased) {
      try {
        const { userPreferencesService } = await import('./userPreferences')
        const preferences = await userPreferencesService.getPreferredGenres()
        
        if (preferences.preferred_genre_ids.length > 0) {
          return await getGenreBasedRecommendations({
            genreIds: preferences.preferred_genre_ids,
            limit,
          })
        }
      } catch (error) {
        console.warn('Genre-based fallback failed', error)
      }
    }

    // Final fallback to top-rated
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
  async getPersonalizedRecommendations(
    limit = 10,
    algorithm: 'hybrid' | 'collaborative' | 'content' = 'hybrid'
  ): Promise<PersonalizedRecommendations> {
    return getPersonalized(limit, algorithm)
  },

  // Genre-based Recommendations (Fallback)
  async getGenreBasedRecommendations(options: GenreRecommendationOptions): Promise<ShowcaseResult> {
    return getGenreBasedRecommendations(options)
  },

  // Similar Movies
  async getSimilarMovies(movieId: number, limit = 5): Promise<Movie[]> {
    const response = await apiClient.get(`/recommendations/movies/${movieId}/similar/`, {
      params: { limit },
    })
    const data = response.data?.data
    const similarMovies = Array.isArray(data?.similar_movies) ? data.similar_movies : []
    
    const movieIds = similarMovies
      .map((item: RecommendationItem) => item.movie_id)
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
  async getTasteProfile(): Promise<UserTasteProfile> {
    const response = await apiClient.get('/recommendations/profile/taste/')
    const data = response.data?.data || response.data
    
    return {
      total_reviews: data.total_reviews || 0,
      average_rating: data.average_rating || data.avg_rating || 0,
      rating_distribution: data.rating_distribution || {},
      favorite_genres: data.favorite_genres || [],
      favorite_decades: data.favorite_decades || [],
      most_lenient: data.most_lenient || false,
    }
  },

  // Recommendations Dashboard
  async getDashboard(): Promise<RecommendationsDashboard> {
    const response = await apiClient.get('/recommendations/dashboard/')
    const data = response.data?.data || response.data
    
    return {
      top_rated: await unwrapMovies(data.top_rated),
      trending: await unwrapMovies(data.trending),
      most_reviewed: await unwrapMovies(data.most_reviewed),
      recent: await unwrapMovies(data.recent),
      personalized: data.personalized ? await unwrapMovies(data.personalized) : undefined,
    }
  },

  // Clear Cache (Admin only)
  async clearCache(): Promise<{ message: string }> {
    const response = await apiClient.post('/recommendations/cache/clear/')
    return response.data?.data || response.data
  },
}
