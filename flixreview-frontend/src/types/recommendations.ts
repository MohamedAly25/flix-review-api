import { Movie } from './movie'

/**
 * Recommendation item from ML engine
 */
export interface RecommendationItem {
  movie_id: number
  title: string
  avg_rating: number
  poster_url: string
  release_date: string
  rank: number
  similarity_score?: number
  predicted_rating?: number
  hybrid_score?: number
  genre_match_ratio?: number
  source?: 'hybrid' | 'collaborative' | 'content' | 'preferred_genres' | 'genre_fallback'
}

/**
 * Genre summary from user preferences
 */
export interface PreferredGenreSummary {
  id: number
  name: string
  slug: string
}

/**
 * Personalized recommendations response
 */
export interface PersonalizedRecommendationsResponse {
  recommendations: RecommendationItem[]
  cached: boolean
  algorithm: 'hybrid' | 'collaborative' | 'content'
  ml_enabled: boolean
  preferences_applied: boolean
  preferred_genre_ids: number[]
  preferred_genres: PreferredGenreSummary[]
}

/**
 * Personalized recommendations with full movie objects
 */
export interface PersonalizedRecommendations {
  movies: Movie[]
  algorithm?: string
  cached: boolean
  preferencesApplied: boolean
  preferredGenres: PreferredGenreSummary[]
  preferredGenreIds: number[]
  mlEnabled?: boolean
}

/**
 * Similar movies response
 */
export interface SimilarMoviesResponse {
  source_movie: {
    id: number
    title: string
  }
  similar_movies: RecommendationItem[]
  cached: boolean
  ml_enabled: boolean
}

/**
 * User taste profile
 */
export interface UserTasteProfile {
  total_reviews: number
  average_rating: number
  rating_distribution: Record<number, number>
  favorite_genres: Array<{
    genre: string
    avg_rating: number
    count: number
  }>
  favorite_decades: Array<{
    decade: string
    count: number
  }>
  most_lenient: boolean
}

/**
 * Recommendations dashboard response
 */
export interface RecommendationsDashboard {
  top_rated: Movie[]
  trending: Movie[]
  most_reviewed: Movie[]
  recent: Movie[]
  personalized?: Movie[]
}

/**
 * Showcase result with mode
 */
export interface ShowcaseResult {
  movies: Movie[]
  mode: 'personalized' | 'top-rated' | 'genre-based'
  genresUsed?: PreferredGenreSummary[]
}

/**
 * Genre-based recommendations options
 */
export interface GenreRecommendationOptions {
  genreIds: number[]
  limit?: number
  minRating?: number
}
