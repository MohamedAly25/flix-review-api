'use client'

import { use } from 'react'
import Image from 'next/image'
import { useMovie } from '@/hooks/useMovies'
import { useReviews, useCreateReview, useDeleteReview } from '@/hooks/useReviews'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatDate } from '@/utils/helpers'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const movieId = parseInt(id)
  const { data: movie, isLoading: movieLoading } = useMovie(movieId)
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews({ movie: movieId })
  const createReview = useCreateReview()
  const deleteReview = useDeleteReview()
  const { user, isAuthenticated } = useAuth()
  const [showReviewForm, setShowReviewForm] = useState(false)

  const userHasReviewed = reviewsData?.results.some((review) => review.user === user?.username)

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

  const handleSubmitReview = async (data: { movie_id: number; rating: number; content: string }) => {
    await createReview.mutateAsync(data)
    setShowReviewForm(false)
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      await deleteReview.mutateAsync(reviewId)
    }
  }

  return (
    <div className="min-h-screen flex flex-col flix-bg-primary">
      <Header />
      <main className="flex-grow flix-container py-8">
        <div className="flix-card overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Movie Poster */}
              {movie.poster_url && (
                <div className="flex-shrink-0">
                  <div className="relative w-full max-w-sm mx-auto lg:mx-0">
                    <Image
                      src={movie.poster_url}
                      alt={`${movie.title} poster`}
                      width={300}
                      height={450}
                      className="rounded-lg shadow-lg object-cover"
                      priority
                    />
                  </div>
                </div>
              )}

              {/* Movie Details */}
              <div className="flex-grow">
                <h1 className="flix-h1 mb-4">{movie.title}</h1>

                <div className="flex flex-wrap gap-4 flix-muted mb-6">
                  <span className="px-3 py-1 flix-bg-secondary rounded-full">{movie.genre}</span>
                  <span>{formatDate(movie.release_date)}</span>
                  {movie.runtime && <span>{movie.runtime} minutes</span>}
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-6 h-6 flix-star" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="flix-h2">{movie.avg_rating.toFixed(1)}</span>
                  <span className="flix-muted">({movie.review_count} reviews)</span>
                </div>

                <p className="flix-body mb-8 leading-relaxed">{movie.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flix-h2">Reviews</h2>
            {isAuthenticated && !userHasReviewed && !showReviewForm && (
              <button onClick={() => setShowReviewForm(true)} className="flix-btn-primary">
                Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="flix-card p-6 mb-6">
              <h3 className="flix-h2 mb-4">Write Your Review</h3>
              <ReviewForm
                movieId={movieId}
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : reviewsData?.results.length === 0 ? (
            <p className="flix-muted text-center py-8">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviewsData?.results.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canEdit={review.user === user?.username}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
