import React from 'react'
import { MovieCard } from './MovieCard'
import { MovieCardSkeleton } from './MovieCardSkeleton'
import { Spinner } from '@/components/ui/Spinner'
import { Movie } from '@/types/movie'
import { ApiError } from '@/types/api'

interface MoviesGridProps {
  movies: Movie[]
  isInitialLoading: boolean
  isRefetching: boolean
  error: ApiError | null
  refetch: () => void
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  showingStart: number
  showingEnd: number
  totalCount: number
  skeletonItems?: number
}

export function MoviesGrid({
  movies,
  isInitialLoading,
  isRefetching,
  error,
  refetch,
  totalPages,
  currentPage,
  onPageChange,
  showingStart,
  showingEnd,
  totalCount,
  skeletonItems = 8
}: MoviesGridProps) {
  if (error) {
    return (
      <div className="movies-error-state">
        <div>
          <svg
            className="movies-error-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="movies-error-title">Error loading movies</p>
          <p className="movies-error-description">Please try again or refresh the page.</p>
          <button
            onClick={() => refetch()}
            className="movies-retry-button"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0019 5l.5-.5" />
            </svg>
            Retry loading titles
          </button>
        </div>
      </div>
    )
  }

  if (isInitialLoading) {
    return (
      <div className="movies-grid-container">
        {Array.from({ length: skeletonItems }).map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="movies-empty-state">
        <div>
          <svg
            className="movies-empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
          <p className="movies-empty-title">No titles match your filters yet.</p>
          <p className="movies-empty-description">Try broadening your search or clearing filters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {isRefetching && (
        <div className="movies-updating-indicator">
          <Spinner size="sm" />
          Updating results…
        </div>
      )}

      <div className="movies-status-info">
        <span>
          Showing {showingStart}–{showingEnd} of {totalCount} movies
        </span>
        <span className="movies-status-badge">
          Page {currentPage} of {totalPages || 1}
        </span>
      </div>

      <div className="movies-grid-container">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="movies-pagination">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="movies-pagination-button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="movies-pagination-numbers">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`movies-page-number ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="movies-pagination-button"
          >
            Next
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}