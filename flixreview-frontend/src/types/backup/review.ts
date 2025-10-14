export interface Review {
  id: number
  movie: number
  movie_title?: string
  user: number
  user_username?: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
  is_owner?: boolean
}

export interface ReviewCreate {
  movie: number
  rating: number
  comment: string
}

export interface ReviewUpdate {
  rating?: number
  comment?: string
}

export interface ReviewList {
  count: number
  next: string | null
  previous: string | null
  results: Review[]
}

export interface ReviewFilters {
  movie?: number
  user?: number
  rating?: number
  page?: number
  page_size?: number
}
