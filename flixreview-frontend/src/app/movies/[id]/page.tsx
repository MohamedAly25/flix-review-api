'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useMovie } from '@/hooks/useMovies'
import { useReviewsByMovieTitle, useCreateReview, useDeleteReview, useUpdateReview } from '@/hooks/useReviews'
import { recommendationsService } from '@/services/recommendations'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MovieDetailHero } from '@/components/movies/MovieDetailHero'
import { MovieReviews } from '@/components/movies/MovieReviews'
import { SimilarMovies } from '@/components/movies/SimilarMovies'
import { Spinner } from '@/components/ui/Spinner'
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

    return reviewsData.results.find((review) => 
      typeof review.user === 'string' ? review.user === user.username : review.user.username === user.username
    ) ?? null
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
    const reviewUsername = typeof review.user === 'string' ? review.user : review.user.username
    if (!isAuthenticated || reviewUsername !== user?.username) {
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
        <MovieDetailHero
          movie={movie}
          reviewButtonLabel={reviewButtonLabel}
          onReviewClick={handleReviewClick}
          onShare={handleShare}
          isAuthenticated={isAuthenticated}
          userHasReviewed={userHasReviewed}
          actionMessage={actionMessage}
        />

        {/* Reviews Section */}
        <MovieReviews
          movieId={movieId}
          reviewsData={reviewsData}
          reviewsLoading={reviewsLoading}
          isAuthenticated={isAuthenticated}
          showReviewForm={showReviewForm}
          editingReview={editingReview}
          userUsername={user?.username}
          onSubmitReview={handleSubmitReview}
          onCancelReview={() => {
            setShowReviewForm(false)
            setEditingReview(null)
          }}
          onEditReview={handleEditReview}
          onDeleteReview={handleDeleteReview}
        />

        {/* Similar Movies Section */}
        <SimilarMovies
          similarGenreModels={similarGenreModels}
          similarLoading={similarLoading}
          primaryGenre={primaryGenre}
        />
      </main>
      <Footer />
    </div>
  )
}
