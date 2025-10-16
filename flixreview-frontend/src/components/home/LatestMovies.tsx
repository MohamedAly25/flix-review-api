'use client'

import Link from 'next/link'
import { useMovies } from '@/hooks/useMovies'
import { MovieCard } from '@/components/movies/MovieCard'
import { Spinner } from '@/components/ui/Spinner'

const RECENT_MOVIES_LIMIT = 4

export function LatestMovies() {
  const { data, isLoading, isError, refetch } = useMovies({
    ordering: '-created_at',
    page_size: RECENT_MOVIES_LIMIT,
  })

  const movies = data?.results ?? []

  return (
    <section className="flix-section-muted">
      <div className="flix-container">
        <div className="flix-flex flix-justify-between flix-items-end flix-gap-md flix-mb-lg">
          <div>
            <h2 className="flix-subtitle flix-mb-sm">Recently Added Movies</h2>
          </div>
          <Link href="/movies" className="flix-btn flix-btn-secondary flix-btn-sm">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="flix-loading-panel">
            <Spinner size="md" />
          </div>
        ) : isError ? (
          <div className="flix-bg-primary flix-rounded-lg flix-p-md" role="status">
            <p className="flix-body flix-accent">
              Could not load the latest movies right now.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="flix-btn flix-btn-secondary flix-btn-sm flix-mt-sm"
            >
              Try Again
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="flix-bg-primary flix-rounded-lg flix-p-md" role="status">
            <p className="flix-body flix-text-muted">
              No movies have been added yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="flix-movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
