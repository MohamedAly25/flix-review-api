'use client'

import { useState, useMemo } from 'react'
import { useMovies } from '@/hooks/useMovies'
import { useUserReviews } from '@/hooks/useReviews'
import { MovieFilters, type FilterState } from '@/components/movies/MovieFilters'
import { MovieHero } from '@/components/movies/MovieHero'
import { MoviesPageHeader } from '@/components/movies/MoviesPageHeader'
import { MoviesGrid } from '@/components/movies/MoviesGrid'
import { UserPreferencesBanner } from '@/components/movies/UserPreferencesBanner'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'

export default function MoviesPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: '',
    ordering: '-avg_rating',
  })
  const [page, setPage] = useState(1)
  const { user, isAuthenticated } = useAuth()
  const preferredGenres = useMemo(() => user?.preferred_genres ?? [], [user?.preferred_genres])

  const isDefaultFiltersActive =
    filters.search === '' &&
    filters.genre === '' &&
    filters.ordering === '-avg_rating' &&
    !filters.year &&
    !filters.rating

  const pageSize = page === 1 && isDefaultFiltersActive ? 13 : 12

  const { data, isLoading, isFetching, error, refetch } = useMovies({
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

  // Get user reviews for genre preference calculation
  const { data: userReviewsData } = useUserReviews(user?.username)

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const movies = useMemo(() => data?.results ?? [], [data?.results])
  const isInitialLoading = isLoading && !data
  const isRefetching = isFetching && !isInitialLoading
  const skeletonItems = Array.from({ length: page === 1 ? 8 : 4 })

  // Calculate user's genre preferences based on their reviews
  const reviewDerivedPreferences = useMemo(() => {
    if (!userReviewsData?.results || !isAuthenticated) {
      return {}
    }

    const genreCounts: Record<string, number> = {}
    const totalReviews = userReviewsData.results.length

    userReviewsData.results.forEach(review => {
      const movieGenres = review.movie.genres?.map(g => g.name) || [review.movie.genre]
      movieGenres.forEach(genre => {
        if (genre) {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1
        }
      })
    })

    // Convert to preference scores (0-1 scale)
    const preferences: Record<string, number> = {}
    Object.entries(genreCounts).forEach(([genre, count]) => {
      preferences[genre] = count / totalReviews
    })

    return preferences
  }, [userReviewsData, isAuthenticated])

  const manualPreferenceMap = useMemo(() => {
    if (!preferredGenres.length) {
      return {}
    }

    return preferredGenres.reduce<Record<string, number>>((acc, genre, index) => {
      const weight = Math.max(0.6, 1 - index * 0.2)
      acc[genre.name] = weight
      return acc
    }, {})
  }, [preferredGenres])

  const genrePreferences = useMemo(() => {
    if (Object.keys(manualPreferenceMap).length === 0) {
      return reviewDerivedPreferences
    }

    return {
      ...reviewDerivedPreferences,
      ...manualPreferenceMap,
    }
  }, [manualPreferenceMap, reviewDerivedPreferences])

  const hasManualPreferences = preferredGenres.length > 0

  const totalPages = data?.count ? Math.ceil(data.count / 12) : 0
  const currentPageCount = movies.length
  const showingStart = currentPageCount ? (page - 1) * 12 + 1 : 0
  const showingEnd = currentPageCount ? Math.min((page - 1) * 12 + currentPageCount, data?.count ?? 0) : 0
  const shouldShowHero = !isInitialLoading && !error && page === 1 && isDefaultFiltersActive && movies.length > 1

  // Select featured movie with genre preference weighting
  const featuredMovie = useMemo(() => {
    if (!shouldShowHero || movies.length === 0) return null

    if (!isAuthenticated || Object.keys(genrePreferences).length === 0) {
      // Simple random selection for non-authenticated users or users with no reviews
      return movies[Math.floor(Math.random() * movies.length)]
    }

    // Weighted random selection based on genre preferences
    const weightedMovies = movies.map(movie => {
      const movieGenres = movie.genres?.map(g => g.name) || [movie.genre]
      let weight = 0.1 // Base weight for all movies

      movieGenres.forEach(genre => {
        if (genre && genrePreferences[genre]) {
          weight += genrePreferences[genre] * 2 // Double weight for preferred genres
        }
      })

      return { movie, weight }
    })

    // Normalize weights to probabilities
    const totalWeight = weightedMovies.reduce((sum, item) => sum + item.weight, 0)
    const normalizedMovies = weightedMovies.map(item => ({
      ...item,
      probability: item.weight / totalWeight
    }))

    // Select movie based on weighted probability
    const random = Math.random()
    let cumulativeProbability = 0

    for (const item of normalizedMovies) {
      cumulativeProbability += item.probability
      if (random <= cumulativeProbability) {
        return item.movie
      }
    }

    // Fallback to first movie if something goes wrong
    return movies[0]
  }, [movies, shouldShowHero, genrePreferences, isAuthenticated])

  const gridMovies = shouldShowHero ? movies.filter(movie => movie.id !== featuredMovie?.id) : movies

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow">
        <section className="flix-section">
          <div className="flix-container">
            <MoviesPageHeader />

            {isInitialLoading ? (
              <div className="flix-mt-lg">
                <div className="h-[360px] w-full animate-pulse rounded-3xl border border-white/5 bg-white/[0.04]" />
              </div>
            ) : (
              featuredMovie && (
                <div className="flix-mt-lg">
                  <MovieHero
                    movie={featuredMovie}
                    badgeLabel={hasManualPreferences ? 'Tailored Pick' : 'Random Pick'}
                  />
                </div>
              )
            )}

            <div className="flix-mt-lg movies-page-layout">
              <MovieFilters
                onFilterChange={handleFilterChange}
                currentFilters={filters}
                className="movies-filters-sidebar"
              />

              <div className="movies-content-main">
                <UserPreferencesBanner preferredGenres={preferredGenres} />

                <MoviesGrid
                  movies={gridMovies}
                  isInitialLoading={isInitialLoading}
                  isRefetching={isRefetching}
                  error={error}
                  refetch={refetch}
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={setPage}
                  showingStart={showingStart}
                  showingEnd={showingEnd}
                  totalCount={data?.count ?? 0}
                  skeletonItems={skeletonItems.length}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
