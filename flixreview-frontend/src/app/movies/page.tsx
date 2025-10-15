'use client'

import { useState } from 'react'
import { useMovies } from '@/hooks/useMovies'
import { MovieCard } from '@/components/movies/MovieCard'
import { MovieFilters, type FilterState } from '@/components/movies/MovieFilters'
import { MovieHero } from '@/components/movies/MovieHero'
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

  const isDefaultFiltersActive =
    filters.search === '' &&
    filters.genre === '' &&
    filters.ordering === '-avg_rating' &&
    !filters.year &&
    !filters.rating

  const pageSize = page === 1 && isDefaultFiltersActive ? 13 : 12
  
  const { data, isLoading, error } = useMovies({
    search: filters.search || undefined,
    genres__slug: filters.genre || undefined,
    ordering: filters.ordering,
    page,
    page_size: pageSize,
    ...(filters.rating ? { min_rating: filters.rating } : {}),
    ...(filters.year
      ? { year_from: filters.year, year_to: filters.year }
      : {}),
  })

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const movies = data?.results ?? []
  const totalPages = data?.count ? Math.ceil(data.count / 12) : 0
  const currentPageCount = movies.length
  const showingStart = currentPageCount ? (page - 1) * 12 + 1 : 0
  const showingEnd = currentPageCount ? Math.min((page - 1) * 12 + currentPageCount, data?.count ?? 0) : 0
  const shouldShowHero = !isLoading && !error && page === 1 && isDefaultFiltersActive && movies.length > 1
  const featuredMovie = shouldShowHero ? movies[0] : null
  const gridMovies = shouldShowHero ? movies.slice(1) : movies
  const hasNoResults = !isLoading && !error && movies.length === 0

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow">
        <section className="flix-section">
          <div className="flix-container">
            <div className="flix-mt-lg">
              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Discover Movies</h1>
              <p className="max-w-3xl text-base text-white/70 md:text-lg flix-mt-sm">
                Browse cinematic highlights inspired by Netflix&apos;s immersive browsing and IMDb&apos;s rich metadata.
                Filter, sort, or search to find your next watch.
              </p>
            </div>

            {featuredMovie && (
              <div className="flix-mt-xl">
                <MovieHero movie={featuredMovie} />
              </div>
            )}

            <div className="flix-mt-xl grid gap-8 lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr]">
              <MovieFilters
                onFilterChange={handleFilterChange}
                currentFilters={filters}
                className="self-start md:sticky md:top-28 lg:top-32"
              />

              <div className="flix-mt-sm">
                {isLoading ? (
                  <div className="flex justify-center flix-p-xl">
                    <Spinner size="lg" />
                  </div>
                ) : error ? (
                  <div className="flix-card rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
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
                    <p className="text-lg font-semibold text-flix-accent">Error loading movies</p>
                    <p className="mt-2 text-white/60">Please try again later.</p>
                  </div>
                ) : hasNoResults ? (
                  <div className="flix-card rounded-3xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur">
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
                    <p className="text-lg font-semibold text-white">No titles match your filters yet.</p>
                    <p className="mt-2 text-white/60">Try broadening your search or clearing filters.</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center justify-between flix-gap-xs text-sm text-white/70 flix-mb-md">
                      <span>
                        Showing {showingStart}–{showingEnd} of {data?.count ?? 0} movies
                      </span>
                      <span className="rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-[0.18em] text-white/60">
                        Page {page} of {totalPages || 1}
                      </span>
                    </div>

                    <div className="grid flix-gap-md sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {gridMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex flex-wrap items-center justify-center flix-gap-xs flix-mt-xl">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={!data?.previous}
                          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Previous
                        </button>

                        <div className="flex flex-wrap items-center justify-center flix-gap-xs">
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
                                className={`h-10 w-10 rounded-full border border-transparent font-semibold transition-all ${
                                  page === pageNum
                                    ? 'bg-flix-accent text-white shadow-[0_12px_32px_rgba(229,9,20,0.45)]'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => setPage((p) => p + 1)}
                          disabled={!data?.next}
                          className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/10"
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
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
