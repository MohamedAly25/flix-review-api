'use client'

import { MovieCard } from '@/components/movies/MovieCard'
import { MovieCardSkeleton } from '@/components/movies/MovieCardSkeleton'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { useAuth } from '@/contexts/AuthContext'
import {
  useTopRated,
  useTrending,
  useMostReviewed,
  useRecent,
  usePersonalizedRecommendations,
} from '@/hooks/useRecommendations'
import Link from 'next/link'

export default function RecommendationsPage() {
  const { isAuthenticated } = useAuth()

  const { data: topRated, isLoading: loadingTopRated } = useTopRated(12)
  const { data: trending, isLoading: loadingTrending } = useTrending(12)
  const { data: mostReviewed, isLoading: loadingMostReviewed } = useMostReviewed(12)
  const { data: recent, isLoading: loadingRecent } = useRecent(12)
  const { data: personalizedData, isLoading: loadingPersonalized } = usePersonalizedRecommendations(12)

  const skeletonCards = Array.from({ length: 6 })

  const preferredGenres = personalizedData?.preferredGenres ?? []
  const preferencesApplied = Boolean(personalizedData?.preferencesApplied)
  const mlEnabled = personalizedData?.mlEnabled ?? false
  
  const personalizedMetadata = personalizedData
    ? [
        personalizedData.cached ? 'Cached for faster load' : 'Live recommendation blend',
        personalizedData.algorithm ? `${personalizedData.algorithm} algorithm` : null,
        preferencesApplied ? 'Genre preferences applied' : null,
        mlEnabled ? 'ML-powered' : 'Rule-based',
      ].filter(Boolean)
    : []

  return (
    <div className="min-h-screen flex flex-col recommendations-page-shell">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        {/* Hero Section */}
        <section className="recommendations-hero">
          <div className="recommendations-hero-content">
            <h1 className="recommendations-hero-title">Discover Amazing Movies</h1>
            <p className="text-lg md:text-xl leading-relaxed text-white/80 max-w-3xl mx-auto">
              Explore our curated collections of top-rated films, trending titles, and personalized recommendations just for you.
            </p>
          </div>
        </section>

        <div className="recommendations-section-container">
          {/* For You Section - Only for authenticated users */}
          {isAuthenticated && (
            <section className="recommendations-section">
              <div className="recommendations-section-header">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <h2 className="recommendations-section-title">For You</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {personalizedMetadata.length > 0
                        ? personalizedMetadata.map((item) => (
                            <span key={item} className="recommendations-meta-badge">
                              {item}
                            </span>
                          ))
                        : 'Personalized using your viewing history and recent reviews'}
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-flix-accent transition-colors hover:text-flix-accent-hover"
                  >
                    View Profile
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {loadingPersonalized ? (
                <div className="recommendations-grid">
                  {skeletonCards.map((_, index) => (
                    <MovieCardSkeleton key={index} />
                  ))}
                </div>
              ) : personalizedData?.movies && personalizedData.movies.length > 0 ? (
                <>
                  {preferredGenres.length > 0 ? (
                    <div className="recommendations-personalized-banner">
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-flix-accent/70 font-semibold">Manual taste boost</p>
                          <p className="mt-2 text-sm text-white/70">
                            We prioritized these genres in your current mix. Update them anytime from your account.
                          </p>
                        </div>
                        <Link
                          href="/profile"
                          className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-flix-accent-hover"
                        >
                          Adjust genres
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
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
                        href="/profile"
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/20"
                      >
                        Choose preferred genres
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </Link>
                    </div>
                  ) : null}

                  <div className="recommendations-grid">
                    {personalizedData.movies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="recommendations-empty-state">
                  <svg
                    className="recommendations-empty-icon"
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
                  <div>
                    <p className="text-xl font-semibold text-white mb-2">Start Rating Movies</p>
                    <p className="text-white/60">Rate some movies to get personalized recommendations!</p>
                  </div>
                  <Link
                    href="/movies"
                    className="inline-flex items-center gap-2 rounded-full bg-flix-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-flix-accent-hover"
                  >
                    Browse Movies
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* Top Rated Section */}
          <section className="recommendations-section">
            <div className="recommendations-section-header">
              <h2 className="recommendations-section-title">Top Rated</h2>
              <p className="recommendations-section-subtitle">Highest rated movies by our community</p>
            </div>

            {loadingTopRated ? (
              <div className="recommendations-grid">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : topRated && topRated.length > 0 ? (
              <div className="recommendations-grid">
                {topRated.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="recommendations-empty-state">
                <p className="text-white/60">No top rated movies available yet</p>
              </div>
            )}
          </section>

          {/* Trending Section */}
          <section className="recommendations-section">
            <div className="recommendations-section-header">
              <h2 className="recommendations-section-title">Trending Now</h2>
              <p className="recommendations-section-subtitle">Most popular movies this week</p>
            </div>

            {loadingTrending ? (
              <div className="recommendations-grid">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : trending && trending.length > 0 ? (
              <div className="recommendations-grid">
                {trending.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="recommendations-empty-state">
                <p className="text-white/60">No trending movies available yet</p>
              </div>
            )}
          </section>

          {/* Most Reviewed Section */}
          <section className="recommendations-section">
            <div className="recommendations-section-header">
              <h2 className="recommendations-section-title">Most Discussed</h2>
              <p className="recommendations-section-subtitle">Movies with the most reviews and conversations</p>
            </div>

            {loadingMostReviewed ? (
              <div className="recommendations-grid">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : mostReviewed && mostReviewed.length > 0 ? (
              <div className="recommendations-grid">
                {mostReviewed.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="recommendations-empty-state">
                <p className="text-white/60">No reviewed movies available yet</p>
              </div>
            )}
          </section>

          {/* Recently Added Section */}
          <section className="recommendations-section">
            <div className="recommendations-section-header">
              <h2 className="recommendations-section-title">Recently Added</h2>
              <p className="recommendations-section-subtitle">Latest additions to our collection</p>
            </div>

            {loadingRecent ? (
              <div className="recommendations-grid">
                {skeletonCards.map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            ) : recent && recent.length > 0 ? (
              <div className="recommendations-grid">
                {recent.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="recommendations-empty-state">
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
