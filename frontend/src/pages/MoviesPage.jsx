import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { movieService } from '../services/movieService'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { MovieCard } from '../components/movies/MovieCard'

const DEFAULT_FILTERS = {
  search: '',
  ordering: '-created_at',
  page: 1,
  page_size: 20,
}

export const MoviesPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const moviesQuery = useQuery({
    queryKey: ['movies', filters],
    queryFn: () => movieService.list(filters),
  })

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }))
  }

  const handlePageChange = (direction) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page + direction) }))
  }

  const movies = moviesQuery.data?.results || []
  const total = moviesQuery.data?.count || 0
  const totalPages = Math.ceil(total / filters.page_size) || 1

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-muted/60 p-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Browse movies</h1>
          <p className="mt-2 text-sm text-white/60">
            Filter by title, rating, or release date. Data is sourced directly from the FlixReview API.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by title..."
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary sm:w-60"
          />
          <select
            name="ordering"
            value={filters.ordering}
            onChange={handleFilterChange}
            className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
            <option value="-average_rating">Highest rated</option>
            <option value="average_rating">Lowest rated</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </header>

      {moviesQuery.isLoading ? (
        <LoadingSpinner label="Loading movies..." />
      ) : moviesQuery.isError ? (
        <ErrorState description={moviesQuery.error?.message} />
      ) : movies.length ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-white/10 bg-muted/40 p-8 text-center text-white/60">
          No movies found. Try adjusting your filters.
        </p>
      )}

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-muted/60 px-4 py-3 text-sm text-white/60">
        <p>
          Page {filters.page} of {totalPages} — {total} titles
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handlePageChange(-1)}
            disabled={filters.page === 1}
            className="rounded-full border border-white/10 px-4 py-2 text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={filters.page >= totalPages}
            className="rounded-full border border-white/10 px-4 py-2 text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
