'use client'

import { useQuery } from '@tanstack/react-query'
import { recommendationsService } from '@/services/recommendations'
import { MovieCard } from '@/components/movies/MovieCard'
import { MovieCardSkeleton } from '@/components/movies/MovieCardSkeleton'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function RecommendationsPage() {
  const { isAuthenticated } = useAuth()

  const { data: topRated, isLoading: loadingTopRated } = useQuery({
    queryKey: ['recommendations', 'top-rated'],
    queryFn: () => recommendationsService.getTopRated(12),
  })

  const { data: trending, isLoading: loadingTrending } = useQuery({
    queryKey: ['recommendations', 'trending'],
    queryFn: () => recommendationsService.getTrending(12),
  })

  const { data: mostReviewed, isLoading: loadingMostReviewed } = useQuery({
    queryKey: ['recommendations', 'most-reviewed'],
    queryFn: () => recommendationsService.getMostReviewed(12),
  })

  const { data: recent, isLoading: loadingRecent } = useQuery({
    queryKey: ['recommendations', 'recent'],
    queryFn: () => recommendationsService.getRecent(12),
  })

  const { data: personalizedData, isLoading: loadingPersonalized } = useQuery({
    queryKey: ['recommendations', 'for-you'],
    queryFn: () => recommendationsService.getPersonalizedRecommendations(12),
    enabled: isAuthenticated,
  })

  const skeletonCards = Array.from({ length: 6 })

  const preferredGenres = personalizedData?.preferredGenres ?? []
  const preferencesApplied = Boolean(personalizedData?.preferencesApplied)
  const personalizedMetadata = personalizedData
    ? [
        personalizedData.cached ? 'Cached for faster load' : 'Live recommendation blend',
        personalizedData.algorithm ? `${personalizedData.algorithm} algorithm` : null,
        preferencesApplied ? 'Preferences applied' : null,
      ].filter(Boolean)
    : []

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-flix-accent/20 via-transparent to-transparent pt-12 pb-16 sm:pt-16 sm:pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl">
              <h1 className="flix-h1 mb-4">Discover Amazing Movies</h1>
              <p className="text-lg leading-relaxed text-white/80">
                Explore our curated collections of top-rated films, trending titles, and personalized recommendations just for you.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12 space-y-16">
          {/* For You Section - Only for authenticated users */}
          {isAuthenticated && (
            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="flix-h2 mb-2">For You</h2>
                  <p className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                    {personalizedMetadata.length > 0
                      ? personalizedMetadata.map((item) => (
                          <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
                            <span className="h-1.5 w-1.5 rounded-full bg-flix-accent" />
                            {item}
                          </span>
                        ))
                      : 'Personalized using your viewing history and recent reviews'}
                  </p>
                </div>
                <Link
                  href="/account/taste"
                  className="text-sm font-medium text-flix-accent transition-colors hover:text-flix-accent-hover"
                >
                  View Taste Profile →
                </Link>
              </div>

              {loadingPersonalized ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                  {skeletonCards.map((_, index) => (
                    <MovieCardSkeleton key={index} />
                  ))}
                </div>
              ) : personalizedData?.movies && personalizedData.movies.length > 0 ? (
                <>
                  {preferredGenres.length > 0 ? (
                    <div className="mb-6 rounded-3xl border border-flix-accent/30 bg-flix-accent/10 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-flix-accent/70">Manual taste boost</p>
                          <p className="mt-2 text-sm text-white/70">
                            We prioritized these genres in your current mix. Update them anytime from your account.
                          </p>
                        </div>
                        <Link
                          href="/account"
                          className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-flix-accent-hover"
                        >
                          Adjust genres
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {preferredGenres.map((genre) => (
                          <span
                            key={genre.id}
                            className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-white"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : !preferencesApplied ? (
                    <div className="mb-6 rounded-3xl border border-white/15 bg-white/5 p-6">
                      <p className="text-sm text-white/70">
                        Set up your preferred genres to instantly tilt recommendations toward what you love. You can pick up to three genres from the account page.
                      </p>
                      <Link
                        href="/account"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/20"
                      >
                        Choose preferred genres
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </Link>
                    </div>
                  ) : null}

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                    {personalizedData.movies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </>
              ) : (
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  <p className="text-lg font-medium text-white">Start Rating Movies</p>
                  <p className="mt-2 text-white/60">Rate some movies to get personalized recommendations!</p>
                  <Link
                    href="/movies"
                    className="mt-6 inline-block rounded-lg bg-flix-accent px-6 py-3 font-medium text-white transition-colors hover:bg-flix-accent-hover"
                  >
                    Browse Movies
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Top Rated Section */}
          <section>
            <div className="mb-6">
              <h2 className="flix-h2 mb-2">Top Rated</h2>
              <p className="text-sm text-white/60">Highest rated movies by our community</p>
            </div>

            {loadingTopRated ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : topRated && topRated.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {topRated.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="flix-card p-12 text-center">
                <p className="text-white/60">No top rated movies available yet</p>
              </div>
            )}
          </section>

          {/* Trending Section */}
          <section>
            <div className="mb-6">
              <h2 className="flix-h2 mb-2">Trending Now</h2>
              <p className="text-sm text-white/60">Most popular movies this week</p>
            </div>

            {loadingTrending ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : trending && trending.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {trending.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="flix-card p-12 text-center">
                <p className="text-white/60">No trending movies available yet</p>
              </div>
            )}
          </section>

          {/* Most Reviewed Section */}
          <section>
            <div className="mb-6">
              <h2 className="flix-h2 mb-2">Most Discussed</h2>
              <p className="text-sm text-white/60">Movies with the most reviews and conversations</p>
            </div>

            {loadingMostReviewed ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : mostReviewed && mostReviewed.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {mostReviewed.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="flix-card p-12 text-center">
                <p className="text-white/60">No reviewed movies available yet</p>
              </div>
            )}
          </section>

          {/* Recently Added Section */}
          <section>
            <div className="mb-6">
              <h2 className="flix-h2 mb-2">Recently Added</h2>
              <p className="text-sm text-white/60">Latest additions to our collection</p>
            </div>

            {loadingRecent ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : recent && recent.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                {recent.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="flix-card p-12 text-center">
                <p className="text-white/60">No recent movies available yet</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
