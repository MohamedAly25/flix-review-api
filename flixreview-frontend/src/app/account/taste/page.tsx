'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { recommendationsService } from '@/services/recommendations'
import { userPreferencesService } from '@/services/userPreferences'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function TasteProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?next=/account/taste')
    }
  }, [isAuthenticated, authLoading, router])

  const { data: tasteProfile, isLoading, error } = useQuery({
    queryKey: ['taste-profile'],
    queryFn: () => recommendationsService.getTasteProfile(),
    enabled: isAuthenticated,
  })

  const { data: preferredGenresData, isLoading: preferredGenresLoading } = useQuery({
    queryKey: ['users', 'preferred-genres', 'taste-profile'],
    queryFn: () => userPreferencesService.getPreferredGenres(),
    enabled: isAuthenticated,
    retry: false,
  })

  if (authLoading || isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flix-bg-primary pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-4 flix-text-secondary">Loading your taste profile...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen flix-bg-primary pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="flix-card-error text-center">
              <p>Failed to load your taste profile. Please try again later.</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen flix-bg-primary pt-20">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-flix-red/20 via-flix-black/50 to-flix-black py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <h1 className="flix-heading-xl mb-4">Your Taste Profile</h1>
              <p className="flix-text-secondary text-xl">
                Discover your unique movie preferences and get personalized recommendations
                based on your ratings and viewing history
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          {tasteProfile ? (
            <div className="space-y-12">
              {isAuthenticated && (
                <div className="flix-card p-8">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.28em] text-flix-accent/70">Manual taste preferences</p>
                      <h2 className="flix-heading-md">Preferred Genres</h2>
                      <p className="flix-text-secondary text-sm max-w-2xl">
                        These picks are merged with your historical ratings to prioritize what appears first. Update them to instantly shift your recommendations.
                      </p>
                    </div>
                    <Link
                      href="/account"
                      className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-flix-accent-hover"
                    >
                      Manage picks
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {preferredGenresLoading ? (
                    <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-flix-accent" />
                      Loading preferred genres…
                    </div>
                  ) : preferredGenresData?.preferred_genres?.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {preferredGenresData.preferred_genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/12 bg-white/5 p-4">
                      <p className="flix-text-secondary text-sm">
                        You haven&apos;t set manual preferences yet. Pick up to three genres from your account page to steer the recommendation engine instantly.
                      </p>
                      <Link
                        href="/account"
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/20"
                      >
                        Choose genres
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Overview Stats - Enhanced Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flix-card p-8 text-center hover:scale-105 transition-transform">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-flix-red/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-flix-red" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="flix-text-muted text-sm uppercase tracking-wide mb-2">
                    Average Rating
                  </p>
                  <p className="text-5xl font-bold text-flix-red mb-2">
                    {tasteProfile.avg_rating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="flix-text-muted text-sm">out of 10</p>
                </div>

                <div className="flix-card p-8 text-center hover:scale-105 transition-transform">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-imdb-yellow/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-imdb-yellow" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="flix-text-muted text-sm uppercase tracking-wide mb-2">
                    Total Reviews
                  </p>
                  <p className="text-5xl font-bold text-imdb-yellow mb-2">
                    {tasteProfile.total_reviews || 0}
                  </p>
                  <p className="flix-text-muted text-sm">movies rated</p>
                </div>

                <div className="flix-card p-8 text-center hover:scale-105 transition-transform">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                  </div>
                  <p className="flix-text-muted text-sm uppercase tracking-wide mb-2">
                    Favorite Genres
                  </p>
                  <p className="text-5xl font-bold text-green-500 mb-2">
                    {tasteProfile.favorite_genres?.length || 0}
                  </p>
                  <p className="flix-text-muted text-sm">top genres</p>
                </div>
              </div>

              {/* Favorite Genres - Clickable Links */}
              {tasteProfile.favorite_genres && tasteProfile.favorite_genres.length > 0 && (
                <div className="flix-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="flix-heading-md">Your Favorite Genres</h2>
                    <span className="flix-badge-primary">
                      {tasteProfile.favorite_genres.length} genres
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {tasteProfile.favorite_genres.map((genre: string, index: number) => (
                      <Link
                        key={index}
                        href={`/genres/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                        className="group px-6 py-3 flix-bg-secondary rounded-full flix-text-primary font-medium hover:bg-flix-red hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                      >
                        <span className="flex items-center gap-2">
                          {genre}
                          <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <p className="flix-text-muted text-sm mt-4">
                    Click any genre to explore similar movies
                  </p>
                </div>
              )}

              {/* Genre Preferences - Enhanced Progress Bars */}
              {tasteProfile.preferences && Object.keys(tasteProfile.preferences).length > 0 && (
                <div className="flix-card p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="flix-heading-md">Genre Preference Scores</h2>
                    <span className="flix-text-muted text-sm">Based on your ratings</span>
                  </div>
                  <div className="space-y-6">
                    {Object.entries(tasteProfile.preferences)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .map(([genre, score]) => {
                        const percentage = ((score as number) * 100).toFixed(0)
                        const scoreNum = score as number
                        return (
                          <div key={genre} className="group">
                            <div className="flex justify-between mb-3">
                              <Link
                                href={`/genres/${genre.toLowerCase().replace(/\s+/g, '-')}`}
                                className="flix-text-primary font-medium hover:text-flix-red transition-colors"
                              >
                                {genre}
                              </Link>
                              <span className="flix-text-secondary font-semibold">
                                {percentage}%
                              </span>
                            </div>
                            <div className="relative w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  scoreNum >= 0.8 ? 'bg-green-500' :
                                  scoreNum >= 0.6 ? 'bg-flix-red' :
                                  scoreNum >= 0.4 ? 'bg-imdb-yellow' :
                                  'bg-gray-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* CTA Section */}
              <div className="flix-card bg-gradient-to-br from-flix-red/20 to-transparent border-2 border-flix-red/30 p-12 text-center">
                <h3 className="flix-heading-md mb-4">Want More Personalized Recommendations?</h3>
                <p className="flix-text-secondary text-lg mb-8 max-w-2xl mx-auto">
                  Rate more movies to improve your taste profile and get even better recommendations
                  tailored just for you!
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    href="/movies"
                    className="flix-button-primary px-8 py-4 text-lg"
                  >
                    Browse Movies
                  </Link>
                  <Link
                    href="/recommendations"
                    className="flix-button-secondary px-8 py-4 text-lg"
                  >
                    View Recommendations
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flix-card text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-flix-red/20 rounded-full mb-6">
                <svg className="w-10 h-10 text-flix-red" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="flix-heading-md mb-4">No Taste Profile Yet</h3>
              <p className="flix-text-secondary mb-2 text-lg">
                Start rating movies to build your personalized taste profile!
              </p>
              <p className="flix-text-muted mb-8">
                We&apos;ll analyze your preferences and recommend movies you&apos;ll love
              </p>
              <Link href="/movies" className="flix-button-primary px-8 py-4 text-lg">
                Discover Movies
              </Link>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}