// TypeScript types matching Django models exactly
// Reference: flix-review-api/movies/models.py + serializers.py

import { PaginatedResponse } from './api'

// Genre type matching Genre model + GenreSerializer
export interface Genre {
  id: number
  name: string
  slug: string
  description: string
  movie_count?: number  // From SerializerMethodField
  created_at: string
  updated_at: string
}

// Movie type matching Movie model + MovieSerializer
export interface Movie {
  id: number
  title: string
  description: string
  genre: string              // Deprecated field (will be removed)
  genres: Genre[]            // Current - ManyToMany relationship
  release_date: string
  avg_rating: number         // Changed from average_rating to match backend
  review_count: number       // From annotation (changed from total_reviews)
  poster_url?: string | null
  
  // TMDB Integration fields
  tmdb_id?: number | null
  imdb_id?: string
  runtime?: number | null
  budget?: number
  revenue?: number
  backdrop_url?: string
  
  created_at: string
  updated_at: string
}

// Movie creation data (MovieSerializer write fields)
export interface MovieCreate {
  title: string
  description: string
  release_date: string
  genre_ids?: number[]      // Write-only field for ManyToMany genres
  poster_url?: string
  tmdb_id?: number
  imdb_id?: string
  runtime?: number
  budget?: number
  revenue?: number
  backdrop_url?: string
}

// Movie update data (MovieSerializer write fields)
export interface MovieUpdate {
  title?: string
  description?: string
  release_date?: string
  genre_ids?: number[]      // Write-only field for ManyToMany genres
  poster_url?: string
  tmdb_id?: number
  imdb_id?: string
  runtime?: number
  budget?: number
  revenue?: number
  backdrop_url?: string
}

// Paginated movie list response
export interface MovieList extends PaginatedResponse<Movie> {
  results: Movie[]
}

// Movie filters for API requests
export interface MovieFilters {
  search?: string
  genre?: string            // Filter by old genre field (deprecated)
  genres?: string           // Filter by genre IDs (comma-separated)
  genres__slug?: string     // Filter by genre slug (Django lookup)
  ordering?: string
  page?: number
  page_size?: number
  tmdb_id?: number
  imdb_id?: string
}
