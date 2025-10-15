export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiError {
  detail?: string
  message?: string
  errors?: Record<string, string | string[]>
}

export interface PaginationParams {
  page?: number
  page_size?: number
}
