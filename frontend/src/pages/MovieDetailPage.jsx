import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { movieService } from '../services/movieService'
import { reviewService } from '../services/reviewService'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorState } from '../components/common/ErrorState'
import { ReviewList } from '../components/reviews/ReviewList'
import { ReviewForm } from '../components/reviews/ReviewForm'
import { useAuth } from '../hooks/useAuth'

export const MovieDetailPage = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const movieQuery = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.retrieve(id),
    enabled: Boolean(id),
  })

  const reviewsQuery = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewService.list({ movie: id, page_size: 20 }),
    enabled: Boolean(id),
  })

  if (movieQuery.isLoading) {
    return <LoadingSpinner label="Loading movie details..." />
  }

  if (movieQuery.isError) {
    return <ErrorState description={movieQuery.error?.message} />
  }

  const movie = movieQuery.data
  const reviews = reviewsQuery.data?.results || []
  const backdrop = movie?.backdrop_url || movie?.poster_url

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60">
        {backdrop ? (
          <img
            src={backdrop}
            alt={movie.title}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
            loading="lazy"
          />
        ) : null}
        <div className="relative grid gap-8 bg-gradient-to-r from-black/90 via-black/80 to-black/30 p-8 md:grid-cols-[2fr,1fr]">
          <div>
            <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
            <p className="mt-4 text-sm text-white/70">{movie.overview || movie.description || 'No synopsis provided.'}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-white/70 sm:grid-cols-4">
              <div>
                <dt className="uppercase tracking-wide text-white/50">Rating</dt>
                <dd className="mt-1 text-2xl font-semibold text-primary">
                  {movie.average_rating ? Number(movie.average_rating).toFixed(1) : '—'}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide text-white/50">Reviews</dt>
                <dd className="mt-1 text-lg font-semibold text-white">{movie.review_count || reviews.length}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide text-white/50">Release</dt>
                <dd className="mt-1 text-white">{movie.release_date || 'TBD'}</dd>
              </div>
              <div>
                <dt className="uppercase tracking-wide text-white/50">Duration</dt>
                <dd className="mt-1 text-white">{movie.runtime ? `${movie.runtime} min` : '—'}</dd>
              </div>
            </dl>
          </div>
          {movie.poster_url ? (
            <div className="flex items-start justify-end">
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="hidden h-72 w-48 rounded-2xl border border-white/10 object-cover shadow-card md:block"
              />
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-white">Community reviews</h2>
          {isAuthenticated ? <p className="text-sm text-white/60">Share your take on this film.</p> : null}
        </div>
        <ReviewList reviews={reviews} />
      </section>

      {isAuthenticated ? (
        <section>
          <h3 className="mb-4 text-xl font-semibold text-white">Write a review</h3>
          <ReviewForm movieId={id} />
        </section>
      ) : (
        <p className="rounded-xl border border-white/10 bg-muted/50 p-6 text-sm text-white/70">
          Log in to leave a review and rate this movie.
        </p>
      )}
    </div>
  )
}
