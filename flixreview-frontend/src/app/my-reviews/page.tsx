'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { useUserReviews } from '@/hooks/useReviews'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Spinner } from '@/components/ui/Spinner'

export default function MyReviewsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const username = user?.username

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?next=/my-reviews')
    }
  }, [authLoading, isAuthenticated, router])

  const { data: reviewsData, isLoading, error, refetch, isFetching } = useUserReviews(username)

  const reviews = useMemo(() => {
    if (!reviewsData?.results) return []
    return [...reviewsData.results].sort((a, b) => {
      const aTime = new Date(a.created_at).getTime()
      const bTime = new Date(b.created_at).getTime()
      return bTime - aTime
    })
  }, [reviewsData])

  const totalReviews = reviews.length
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return null
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }, [reviews])

  const lastUpdatedLabel = useMemo(() => {
    if (reviews.length === 0) return null
    try {
      return formatDistanceToNow(parseISO(reviews[0].created_at), { addSuffix: true })
    } catch (err) {
      console.warn('Failed to parse last review timestamp', err)
      return null
    }
  }, [reviews])

  const topGenres = useMemo(() => {
    if (reviews.length === 0) return [] as string[]
    const counts: Record<string, number> = {}
    reviews.forEach((review) => {
      const genreNames = review.movie.genres?.map((genre) => genre.name) || []
      genreNames.forEach((name) => {
        counts[name] = (counts[name] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre)
  }, [reviews])

  const preferredGenres = user?.preferred_genres ?? []

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col flix-bg-primary">
        <Header />
        <main className="flex-grow pt-24 sm:pt-28 flex items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.22em] text-white/70">
            <Spinner size="sm" />
            Loading your reviews…
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col flix-bg-primary">
        <Header />
        <main className="flex-grow pt-24 sm:pt-28 flex items-center justify-center px-6">
          <div className="flix-card w-full max-w-md space-y-4 bg-white/5 p-8 text-center">
            <h1 className="text-xl font-semibold text-white">Sign in to view your reviews</h1>
            <p className="text-sm text-white/70">
              Your personal review log lives here. Log in to explore your stats and recent activity.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login?next=/my-reviews"
                className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-flix-accent-hover"
              >
                Go to login
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-white/20"
              >
                Create account
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow pt-24 sm:pt-28">
        <section className="relative overflow-hidden bg-gradient-to-b from-flix-black via-flix-black to-transparent pt-10 pb-16 sm:pt-14 sm:pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl space-y-4">
              <h1 className="flix-h1">Your Reviews</h1>
              <p className="text-lg text-white/70">
                Track the movies you&apos;ve rated, see how they shape your taste profile, and refine your preferences for even sharper recommendations.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/40">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  {totalReviews} review{totalReviews === 1 ? '' : 's'} logged
                </span>
                {averageRating ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                    Average rating {averageRating}/5
                  </span>
                ) : null}
                {lastUpdatedLabel ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                    Updated {lastUpdatedLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12 space-y-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.9)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Total reviews</p>
              <p className="mt-3 text-4xl font-semibold">{totalReviews}</p>
              <p className="mt-2 text-sm text-white/60">Every review sharpens the recommendation engine.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.9)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Average rating</p>
              <p className="mt-3 text-4xl font-semibold">{averageRating ?? '—'}</p>
              <p className="mt-2 text-sm text-white/60">Higher scores tell us which genres you champion.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-[0_25px_70px_-35px_rgba(0,0,0,0.9)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">Top genres</p>
              {topGenres.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {topGenres.map((genre) => (
                    <span key={genre} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
                      {genre}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/60">Rate a few movies to reveal your leading genres.</p>
              )}
            </div>
            <div className="rounded-3xl border border-flix-accent/40 bg-flix-accent/10 p-6 text-white shadow-[0_25px_70px_-25px_rgba(229,9,20,0.55)]">
              <p className="text-xs uppercase tracking-[0.3em] text-flix-accent/70">Manual preferences</p>
              {preferredGenres.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {preferredGenres.map((genre) => (
                    <span key={genre.id} className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent/20 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white">
                      {genre.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/70">
                  Pick up to three favorite genres in your account to give every view a head start.
                </p>
              )}
              <Link
                href="/account"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-flix-accent-hover"
              >
                Manage preferences
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {error ? (
            <div className="flix-card p-12 text-center">
              <svg className="mx-auto mb-4 h-16 w-16 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold text-white">We couldn&apos;t load your reviews</p>
              <p className="mt-2 text-white/60">Please refresh the page or try again shortly.</p>
              <button
                onClick={() => refetch()}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {isFetching ? (
                  <>
                    <Spinner size="sm" />
                    Retrying…
                  </>
                ) : (
                  <>
                    Retry
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.75a7.5 7.5 0 111.357 4.271" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5v5.25H9.75" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-32 rounded-3xl border border-white/8 bg-white/5" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flix-card p-12 text-center">
              <h2 className="flix-heading-md mb-3">No reviews yet</h2>
              <p className="flix-text-secondary mb-6">
                Start by rating a movie. Your opinions instantly fuel personalized recommendations and your taste profile.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/movies"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Browse movies
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12l-7.5 7.5M3 12h18" />
                  </svg>
                </Link>
                <Link
                  href="/recommendations"
                  className="inline-flex items-center gap-2 rounded-full border border-flix-accent/40 bg-flix-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-flix-accent-hover"
                >
                  See recommendations
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
