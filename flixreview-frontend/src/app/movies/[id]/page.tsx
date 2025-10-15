'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useMovie } from '@/hooks/useMovies'
import { useReviewsByMovieTitle, useCreateReview, useDeleteReview, useUpdateReview } from '@/hooks/useReviews'
import { recommendationsService } from '@/services/recommendations'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { MovieCard } from '@/components/movies/MovieCard'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import { SimilarGenreMovieCardModel } from '@/models/MovieCardModel'
import { Review } from '@/types/review'

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const movieId = parseInt(id)
  const { data: movie, isLoading: movieLoading } = useMovie(movieId)
  const { data: reviewsData, isLoading: reviewsLoading } = useReviewsByMovieTitle(movie?.title)
  const { data: similarMovies, isLoading: similarLoading } = useQuery({
    queryKey: ['similar-movies', movieId],
    queryFn: () => recommendationsService.getSimilarMovies(movieId, 20),
    enabled: !!movieId,
  })
  const createReview = useCreateReview()
  const deleteReview = useDeleteReview()
  const updateReview = useUpdateReview()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const userReview = useMemo(() => {
    if (!reviewsData?.results || !user?.username) {
      return null
    }

    return reviewsData.results.find((review) => review.user === user.username) ?? null
  }, [reviewsData, user?.username])

  const userHasReviewed = !!userReview

  const primaryGenre = movie?.genre ?? movie?.genres?.[0]?.name ?? null

  const similarGenreModels = useMemo(() => {
    if (!similarMovies) {
      return []
    }

    return SimilarGenreMovieCardModel.fromMovies(similarMovies, primaryGenre).slice(0, 10)
  }, [primaryGenre, similarMovies])

  useEffect(() => {
    if (!actionMessage) return

    const timer = window.setTimeout(() => setActionMessage(null), 4000)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  if (movieLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Movie not found</p>
        </div>
        <Footer />
      </div>
    )
  }

  const handleSubmitReview = async ({ rating, content }: { rating: number; content: string }) => {
    if (editingReview) {
      await updateReview.mutateAsync({ id: editingReview.id, data: { rating, content } })
      setActionMessage('Review updated successfully.')
    } else {
      await createReview.mutateAsync({ movie_id: movieId, rating, content })
      setActionMessage('Review submitted successfully.')
    }

    setEditingReview(null)
    setShowReviewForm(false)
  }

  const handleEditReview = (review: Review) => {
    if (!isAuthenticated || review.user !== user?.username) {
      return
    }

    setEditingReview(review)
    setShowReviewForm(true)

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await deleteReview.mutateAsync(reviewId)
      setEditingReview(null)
      setActionMessage('Review deleted.')
    }
  }

  const handleReviewClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=/movies/${movieId}`)
      return
    }

    if (showReviewForm) {
      setShowReviewForm(false)
      setEditingReview(null)
      return
    }

    if (userHasReviewed && userReview) {
      setEditingReview(userReview)
    } else {
      setEditingReview(null)
    }

    setShowReviewForm(true)

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }

  const handleShare = async () => {
    if (!isAuthenticated) {
      router.push(`/register?next=/movies/${movieId}`)
      return
    }

    const shareUrl = typeof window !== 'undefined'
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/movies/${movieId}`

    const shareData: ShareData = {
      title: movie.title,
      text: movie.description ?? 'Check out this movie on FlixReview.',
      url: shareUrl,
    }

    try {
      if (typeof navigator !== 'undefined') {
        const nav = navigator as Navigator & {
          share?: (data: ShareData) => Promise<void>
          clipboard?: Clipboard
        }

        if (nav.share) {
          await nav.share(shareData)
          setActionMessage('Movie shared successfully!')
          return
        }

        if (nav.clipboard && typeof nav.clipboard.writeText === 'function') {
          await nav.clipboard.writeText(shareUrl)
          setActionMessage('Movie link copied to clipboard.')
          return
        }
      }

      setActionMessage('Link sharing is not supported on this device.')
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      setActionMessage('Sharing failed. Please try again later.')
    }
  }

  const reviewButtonLabel = !isAuthenticated
    ? 'Sign in to Review'
    : showReviewForm
      ? 'Cancel'
      : userHasReviewed
        ? 'Edit Your Review'
        : 'Write a Review'

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow pt-16">
        {/* Full-Width Backdrop Hero Section */}
        <div className="relative w-full min-h-[70vh] flex items-end overflow-hidden">
          {/* Backdrop Image */}
          {movie.backdrop_url ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={movie.backdrop_url}
                alt={`${movie.title} backdrop`}
                fill
                className="object-cover"
                priority
                quality={90}
              />
              {/* Gradient Overlays - Multiple layers for rich effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-flix-black via-flix-black/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-flix-black/90 via-transparent to-flix-black/50"></div>
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-gray-900 via-flix-black to-black"></div>
          )}

          {/* Floating Movie Info */}
          <div className="relative z-10 w-full flix-container pb-12 pt-24">
            <div className="flex flex-col lg:flex-row gap-8 items-end">
              {/* Poster */}
              {movie.poster_url && (
                <div className="flex-shrink-0">
                  <div className="relative w-64 h-96 rounded-lg overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <Image
                      src={movie.poster_url}
                      alt={`${movie.title} poster`}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Movie Info */}
              <div className="flex-grow pb-4">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {/* Rating Badge - IMDb Style */}
                  <div className="flex items-center gap-2 bg-imdb-yellow text-black px-4 py-2 rounded font-bold">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg">{movie.avg_rating.toFixed(1)}/10</span>
                  </div>

                  {/* Genre Badge */}
                  <span className="px-4 py-2 bg-flix-red/90 text-white rounded font-semibold backdrop-blur-sm">
                    {movie.genre}
                  </span>

                  {/* Release Year */}
                  <span className="px-4 py-2 bg-white/10 text-white rounded backdrop-blur-sm">
                    {formatDate(movie.release_date)}
                  </span>

                  {/* Runtime */}
                  {movie.runtime && (
                    <span className="px-4 py-2 bg-white/10 text-white rounded backdrop-blur-sm">
                      {movie.runtime} min
                    </span>
                  )}

                  {/* Review Count */}
                  <span className="px-4 py-2 bg-white/10 text-white rounded backdrop-blur-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {movie.review_count} reviews
                  </span>
                </div>

                {/* Description */}
                <p className="text-white/90 text-lg leading-relaxed max-w-3xl mb-6 drop-shadow-md">
                  {movie.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    onClick={handleReviewClick}
                    className="bg-flix-red hover:bg-flix-red/80 text-white px-8 py-4 text-lg font-semibold shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {reviewButtonLabel}
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleShare}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 text-lg font-semibold shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </Button>
                </div>

                {isAuthenticated && userHasReviewed && (
                  <p className="mt-3 text-sm text-white/70">
                    You can edit or delete your original review below. One review per member keeps things fair.
                  </p>
                )}

                {actionMessage && (
                  <div className="mt-4 px-4 py-3 bg-flix-red/90 text-white rounded backdrop-blur-sm inline-block">
                    {actionMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="flix-container py-12" id="reviews">
          <div className="max-w-6xl mx-auto">
            <h2 className="flix-heading-lg mb-8">Reviews</h2>

            {!isAuthenticated && (
              <div className="flix-card p-8 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flix-heading-md">Join the conversation</h3>
                  <p className="flix-text-muted mt-2 max-w-xl">
                    Sign in to publish your take and follow what others are saying about this title.
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/login?next=/movies/${movieId}`)}
                  className="px-6"
                >
                  Sign in to review
                </Button>
              </div>
            )}

            {showReviewForm && (
              <div className="flix-card p-8 mb-8">
                <h3 className="flix-heading-md mb-6">
                  {editingReview ? 'Edit Your Review' : 'Write Your Review'}
                </h3>
                <ReviewForm
                  onSubmit={handleSubmitReview}
                  onCancel={() => {
                    setShowReviewForm(false)
                    setEditingReview(null)
                  }}
                  initialRating={editingReview?.rating ?? 5}
                  initialContent={editingReview?.content ?? ''}
                  submitLabel={editingReview ? 'Update Review' : 'Submit Review'}
                />
              </div>
            )}

            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : reviewsData?.results.length === 0 ? (
              <div className="flix-card p-12 text-center">
                <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <p className="flix-text-secondary text-lg mb-2">No member reviews yet</p>
                <p className="flix-text-muted">Be the first to break the silence.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviewsData?.results.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    canEdit={review.user === user?.username}
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Similar Movies Section */}
        <section className="flix-container py-12 bg-gradient-to-b from-transparent to-flix-black/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
              <div>
                <h2 className="flix-heading-lg">More Like This</h2>
                <p className="flix-text-muted mt-2">
                  {primaryGenre ? `${primaryGenre} · handpicked for you` : 'Tailored recommendations'}
                </p>
              </div>
              {similarGenreModels.length > 0 && (
                <span className="flix-badge-secondary">
                  Top {similarGenreModels.length} matches
                </span>
              )}
            </div>

            <div className="mt-6">
              {similarLoading ? (
                <div className="flex justify-center py-16">
                  <Spinner size="lg" />
                </div>
              ) : similarGenreModels.length === 0 ? (
                <div className="flix-card p-12 text-center">
                  <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <p className="flix-text-secondary text-lg">
                    We could not find closely related titles in this genre yet
                  </p>
                  <p className="flix-text-muted mt-2">Check back soon for more picks</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
                  {similarGenreModels.map((model) => (
                    <MovieCard key={model.id} movie={model.toMovie()} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
