export interface Movie {
  id: number
  title: string
  description: string
  release_date: string
  genre: string
  director?: string
  duration?: number
  poster_url?: string
  backdrop_url?: string
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export interface MovieCreate {
  title: string
  description: string
  release_date: string
  genre: string
  director?: string
  duration?: number
  poster_url?: string
  backdrop_url?: string
}

export interface MovieUpdate {
  title?: string
  description?: string
  release_date?: string
  genre?: string
  director?: string
  duration?: number
  poster_url?: string
  backdrop_url?: string
}

export interface MovieList {
  count: number
  next: string | null
  previous: string | null
  results: Movie[]
}

export interface MovieFilters {
  search?: string
  genre?: string
  year?: number
  page?: number
  page_size?: number
  ordering?: string
}
