'use client'

import { useState } from 'react'
import { useMovies } from '@/hooks/useMovies'
import { MovieCard } from '@/components/movies/MovieCard'
import { MovieFilters, type FilterState } from '@/components/movies/MovieFilters'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Spinner } from '@/components/ui/Spinner'

export default function MoviesPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: '',
    ordering: '-avg_rating',
  })
  const [page, setPage] = useState(1)
  
  const { data, isLoading, error } = useMovies({ 
    search: filters.search,
    genres__slug: filters.genre,
    ordering: filters.ordering,
    page,
    page_size: 12,
  })

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const totalPages = data?.count ? Math.ceil(data.count / 12) : 0
  const showingStart = data?.results.length ? (page - 1) * 12 + 1 : 0
  const showingEnd = data?.results.length ? Math.min(page * 12, data.count) : 0

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow">
        <section className="flix-section">
          <div className="flix-container space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="flix-h1">Discover Movies</h1>
              <p className="text-white/60">
                Browse our extensive collection of movies. Use filters to find exactly what you&apos;re looking for.
              </p>
            </div>

            {/* Filters */}
            <MovieFilters onFilterChange={handleFilterChange} currentFilters={filters} />

            {/* Results */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="flix-card p-12 text-center">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-white/20"
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
                <p className="flix-accent text-lg font-medium">Error loading movies</p>
                <p className="mt-2 text-white/60">Please try again later</p>
              </div>
            ) : !data?.results || data.results.length === 0 ? (
              <div className="flix-card p-12 text-center">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-white/20"
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
                                  <p className="flix-text-muted">
                    We couldn&apos;t find any movies matching your criteria.
                  </p>
                <p className="mt-2 text-white/60">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Results count */}
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>
                    Showing {showingStart}–{showingEnd} of {data.count} movies
                  </span>
                  <span>Page {page} of {totalPages}</span>
                </div>

                {/* Movie Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                  {data.results.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 pt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!data.previous}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/5"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (page <= 3) {
                          pageNum = i + 1
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = page - 2 + i
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`h-10 w-10 rounded-lg font-medium transition-all ${
                              page === pageNum
                                ? 'bg-flix-accent text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!data.next}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-medium text-white transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white/5"
                    >
                      Next
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
