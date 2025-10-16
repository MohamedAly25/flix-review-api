'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { recommendationsService } from '@/services/recommendations'
import { useAuth } from '@/contexts/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

const SHOWCASE_LIMIT = 5

export function TrendingMovies() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['showcase-movies', isAuthenticated ? 'personalized' : 'top-rated'],
    queryFn: () =>
      recommendationsService.getShowcaseMovies({
        limit: SHOWCASE_LIMIT,
        personalized: isAuthenticated,
      }),
    enabled: !authLoading,
    staleTime: 1000 * 60 * 5,
  })

  const movies = data?.movies ?? []
  const heading = useMemo(() => {
    if (data?.mode === 'personalized') {
      return 'Recommended For You'
    }
    return 'Top Rated Movies'
  }, [data?.mode])

  const subheading = useMemo(() => {
    if (data?.mode === 'personalized') {
      return 'Tailored picks powered by the FlixReview recommendation engine.'
    }
    return 'The highest rated films across the FlixReview community.'
  }, [data?.mode])

  const handleRetry = () => {
    refetch()
  }

  return (
    <section className="flix-section flix-bg-primary">
      <div className="flix-container">
        <div className="flix-flex flix-flex-col flix-gap-sm flix-mb-lg">
          <h2 className="flix-subtitle">{heading}</h2>
          <p className="flix-body flix-text-muted">{subheading}</p>
        </div>

        {isLoading || authLoading ? (
          <div className="flix-loading-panel">
            <Spinner size="md" />
          </div>
        ) : isError ? (
          <div className="flix-bg-secondary flix-rounded-lg flix-p-md">
            <p className="flix-body flix-accent">
              We couldn’t load recommendations right now.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="flix-btn flix-btn-secondary flix-btn-sm flix-mt-sm"
            >
              Try Again
            </button>
          </div>
        ) : movies.length === 0 ? (
          <div className="flix-bg-secondary flix-rounded-lg flix-p-md">
            <p className="flix-body flix-text-muted">
              No recommendations available yet. Rate a few movies to kick-start personalization.
            </p>
          </div>
        ) : (
          <div className="flix-trending-container">
            {movies.map((movie, index) => {
              const posterSrc = movie.poster_url && movie.poster_url.trim() !== ''
                ? movie.poster_url
                : '/placeholder-movie.svg'

              return (
                <Link key={movie.id} href={`/movies/${movie.id}`} className="flix-trending-card">
                  <div className="flix-trending-number">{index + 1}</div>
                  <div className="flix-trending-poster">
                    <div className="flix-netflix-badge">F</div>
                    <div className="relative w-full h-full">
                      <Image
                        src={posterSrc}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        onError={(event) => {
                          event.currentTarget.src = '/placeholder-movie.svg'
                        }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
